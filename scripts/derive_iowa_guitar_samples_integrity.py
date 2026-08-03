#!/usr/bin/env python3
"""Derive audible, pitch-verified Iowa guitar anchors with deterministic balance."""

from __future__ import annotations

import argparse
import array
import importlib.util
import json
import math
import sys
from pathlib import Path

module_path = Path(__file__).with_name("derive_iowa_guitar_samples_robust.py")
spec = importlib.util.spec_from_file_location("derive_iowa_guitar_samples_robust", module_path)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Could not load the robust extractor at {module_path}")
robust = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = robust
spec.loader.exec_module(robust)
base = robust.base

HIGH_PASS_HZ = 35.0
TARGET_WINDOW_RMS = 1800.0
MIN_OUTPUT_WINDOW_RMS = 1450.0
MAX_OUTPUT_PEAK = 32767.0 * 0.82
MAX_AMPLIFICATION = 24.0
PITCH_NEAR_BEST_MARGIN = 0.10
MIN_POST_DERIVATION_PITCH_SCORE = 0.34

selection_evidence: dict[int, dict[str, object]] = {}
derivation_evidence: dict[int, dict[str, object]] = {}
current_target_midi: int | None = None


def high_pass(values, sample_rate: int) -> list[float]:
    if not values:
        return []
    time_step = 1.0 / sample_rate
    resistance_capacitance = 1.0 / (2.0 * math.pi * HIGH_PASS_HZ)
    alpha = resistance_capacitance / (resistance_capacitance + time_step)
    output: list[float] = []
    previous_input = float(values[0])
    previous_output = 0.0
    for raw in values:
        current_input = float(raw)
        current_output = alpha * (
            previous_output + current_input - previous_input
        )
        output.append(current_output)
        previous_input = current_input
        previous_output = current_output
    return output


def maximum_window_rms(values: list[float], sample_rate: int) -> float:
    if not values:
        return 0.0
    window = max(1, round(sample_rate * 0.10))
    step = max(1, round(sample_rate * 0.02))
    horizon = min(len(values), round(sample_rate * 0.70))
    if horizon <= window:
        energy = sum(value * value for value in values[:horizon])
        return math.sqrt(energy / max(1, horizon))
    best = 0.0
    for start in range(0, horizon - window + 1, step):
        frame = values[start : start + window]
        energy = sum(value * value for value in frame) / len(frame)
        best = max(best, math.sqrt(energy))
    return best


def candidate_strength(samples, sample_rate: int, candidate) -> float:
    start = candidate.onset_sample
    end = min(
        len(samples),
        start
        + min(
            candidate.available_samples,
            round(sample_rate * 0.75),
        ),
    )
    return maximum_window_rms(high_pass(samples[start:end], sample_rate), sample_rate)


def choose_integrity_candidate(samples, sample_rate: int, target_midi: int):
    global current_target_midi
    current_target_midi = target_midi
    attacks = base.detect_attacks(samples, sample_rate)
    candidates = []
    strengths: dict[int, float] = {}
    for index, onset in enumerate(attacks):
        next_onset = attacks[index + 1] if index + 1 < len(attacks) else len(samples)
        target_score, best_midi, best_score = base.pitch_scores(
            samples, sample_rate, onset, target_midi
        )
        candidate = base.Candidate(
            onset_sample=onset,
            target_score=target_score,
            best_midi=best_midi,
            best_score=best_score,
            available_samples=max(0, next_onset - onset),
        )
        candidates.append(candidate)
        strengths[onset] = candidate_strength(samples, sample_rate, candidate)

    configuration = robust.ORDERED_GROUPS[target_midi]
    note_count = configuration["source_note_count"]
    ordinal = configuration["target_note_ordinal"]
    group_start = round(len(candidates) * ordinal / note_count)
    group_end = round(len(candidates) * (ordinal + 1) / note_count)
    group = candidates[group_start:group_end]
    eligible = [
        candidate
        for candidate in group
        if candidate.available_samples >= round(sample_rate * base.MIN_DERIVED_SECONDS)
        and candidate.target_score >= 0.45
    ]
    if not eligible:
        raise RuntimeError(
            f"No pitch-eligible catalog take remained for target MIDI {target_midi}"
        )

    best_target_score = max(candidate.target_score for candidate in eligible)
    pitch_floor = max(0.45, best_target_score - PITCH_NEAR_BEST_MARGIN)
    near_best = [
        candidate for candidate in eligible if candidate.target_score >= pitch_floor
    ]
    chosen = max(
        near_best,
        key=lambda candidate: (
            strengths[candidate.onset_sample],
            candidate.target_score,
            candidate.best_score,
            min(
                candidate.available_samples,
                round(sample_rate * base.MAX_DERIVED_SECONDS),
            ),
            -candidate.onset_sample,
        ),
    )

    selection_evidence[target_midi] = {
        "selectionMethod": "catalog-group-near-best-pitch-then-audible-rms-v1",
        "bestTargetPitchScore": round(best_target_score, 6),
        "pitchEligibilityFloor": round(pitch_floor, 6),
        "chosenAudibleWindowRmsBeforeNormalization": round(
            strengths[chosen.onset_sample], 6
        ),
        "groupCandidates": [
            {
                "onsetSeconds": round(candidate.onset_sample / sample_rate, 6),
                "targetPitchScore": round(candidate.target_score, 6),
                "estimatedMidi": candidate.best_midi,
                "bestPitchScore": round(candidate.best_score, 6),
                "availableSeconds": round(
                    candidate.available_samples / sample_rate, 6
                ),
                "audibleWindowRms": round(
                    strengths[candidate.onset_sample], 6
                ),
                "nearBestPitch": candidate in near_best,
                "chosen": candidate == chosen,
            }
            for candidate in group
        ],
    }
    return chosen, candidates


def derive_integrity_samples(samples, sample_rate: int, candidate) -> array.array:
    if current_target_midi is None:
        raise RuntimeError("The target pitch was not established before derivation")

    pre_roll = round(sample_rate * 0.008)
    start = max(0, candidate.onset_sample - pre_roll)
    duration = min(
        round(sample_rate * base.MAX_DERIVED_SECONDS),
        max(
            round(sample_rate * base.MIN_DERIVED_SECONDS),
            candidate.available_samples - round(sample_rate * 0.055),
        ),
    )
    end = min(len(samples), start + duration)
    selected = samples[start:end]
    if len(selected) < round(sample_rate * base.MIN_DERIVED_SECONDS):
        raise RuntimeError("The selected Iowa take is too short after trimming")

    filtered = high_pass(selected, sample_rate)
    source_peak = max(abs(value) for value in filtered) or 1.0
    source_window_rms = maximum_window_rms(filtered, sample_rate)
    if source_window_rms <= 0:
        raise RuntimeError("The selected Iowa take has no measurable audible energy")

    scale = min(
        TARGET_WINDOW_RMS / source_window_rms,
        MAX_OUTPUT_PEAK / source_peak,
        MAX_AMPLIFICATION,
    )
    fade_in_samples = max(1, round(sample_rate * 0.004))
    fade_out_samples = min(len(filtered), round(sample_rate * 0.075))
    output = array.array("h")
    for index, value in enumerate(filtered):
        gain = scale
        if index < fade_in_samples:
            gain *= index / fade_in_samples
        if index >= len(filtered) - fade_out_samples:
            gain *= (len(filtered) - index - 1) / max(1, fade_out_samples)
        output.append(max(-32768, min(32767, round(value * gain))))

    output_peak = max(abs(value) for value in output)
    output_window_rms = maximum_window_rms(
        [float(value) for value in output], sample_rate
    )
    target_score, estimated_midi, best_score = base.pitch_scores(
        output, sample_rate, 0, current_target_midi
    )
    if output_window_rms < MIN_OUTPUT_WINDOW_RMS:
        raise RuntimeError(
            f"Derived MIDI {current_target_midi} remained too quiet: "
            f"window RMS {output_window_rms:.2f}"
        )
    if target_score < MIN_POST_DERIVATION_PITCH_SCORE:
        raise RuntimeError(
            f"Derived MIDI {current_target_midi} failed post-derivation pitch integrity: "
            f"target score {target_score:.3f}, estimated MIDI {estimated_midi}"
        )

    derivation_evidence[current_target_midi] = {
        "normalizationMethod": "35hz-high-pass-max-100ms-rms-v1",
        "highPassHz": HIGH_PASS_HZ,
        "targetWindowRms": TARGET_WINDOW_RMS,
        "maximumAmplification": MAX_AMPLIFICATION,
        "appliedScale": round(scale, 8),
        "sourcePeakAfterHighPass": round(source_peak, 6),
        "sourceWindowRmsAfterHighPass": round(source_window_rms, 6),
        "derivedPeak": output_peak,
        "derivedWindowRms": round(output_window_rms, 6),
        "postDerivationTargetPitchScore": round(target_score, 6),
        "postDerivationEstimatedMidi": estimated_midi,
        "postDerivationBestPitchScore": round(best_score, 6),
    }
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--evidence", required=True, type=Path)
    arguments = parser.parse_args()

    base.choose_candidate = choose_integrity_candidate
    base.derive_samples = derive_integrity_samples
    base.run(arguments.source_dir, arguments.output_dir, arguments.evidence)

    evidence = json.loads(arguments.evidence.read_text(encoding="utf-8"))
    evidence["integritySchemaVersion"] = 1
    evidence["normalizationMethod"] = "35hz-high-pass-max-100ms-rms-v1"
    for target in evidence["targets"]:
        midi = int(target["target_midi"])
        target.update(selection_evidence[midi])
        target.update(derivation_evidence[midi])
    arguments.evidence.write_text(
        json.dumps(evidence, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()

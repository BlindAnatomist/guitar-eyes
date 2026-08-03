#!/usr/bin/env python3
"""Select, validate, and normalize Iowa guitar takes as one balanced sample set."""

from __future__ import annotations

import array
import importlib.util
import math
import sys
from pathlib import Path

module_path = Path(__file__).with_name("derive_iowa_guitar_samples.py")
spec = importlib.util.spec_from_file_location("derive_iowa_guitar_samples", module_path)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Could not load the sibling extractor at {module_path}")
base = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = base
spec.loader.exec_module(base)

# The official filenames identify ascending chromatic ranges. Each session contains
# repeated takes of those notes in that order. These values are zero-based ordinals.
ORDERED_GROUPS = {
    64: {"source_note_count": 8, "target_note_ordinal": 0},  # E4 in E4-B4
    59: {"source_note_count": 1, "target_note_ordinal": 0},  # B3 alone
    56: {"source_note_count": 5, "target_note_ordinal": 1},  # G#3 in G3-B3
    52: {"source_note_count": 10, "target_note_ordinal": 2},  # E3 in D3-B3
    47: {"source_note_count": 3, "target_note_ordinal": 2},  # B2 in A2-B2
    40: {"source_note_count": 8, "target_note_ordinal": 0},  # E2 in E2-B2
}

SELECTION_METHOD = "catalog-ordered-signal-validated-v4"
TARGET_ACTIVE_RMS_DBFS = -30.0
ACTIVE_RMS_TOLERANCE_DB = 1.25
PEAK_LIMIT = 0.88
MAX_NORMALIZATION_GAIN = 12.0
MIN_ABSOLUTE_ACTIVE_RMS = 180.0
MIN_RELATIVE_GROUP_RMS = 0.35
MIN_TARGET_PITCH_SCORE = 0.45
MAX_ESTIMATED_MIDI_DISTANCE = 1
MIN_MOTION_FRACTION_OF_TARGET = 0.20
MIN_ZERO_CROSSING_FRACTION_OF_TARGET = 0.22
ANALYSIS_START_SECONDS = 0.018
ANALYSIS_MAX_SECONDS = 0.72
ANALYSIS_END_GUARD_SECONDS = 0.06
HIGHPASS_CUTOFF_HZ = 35.0

base.TARGETS = tuple(
    {
        **target,
        **ORDERED_GROUPS[int(target["target_midi"])],
        "selection_method": SELECTION_METHOD,
    }
    for target in base.TARGETS
)


def _dbfs(value):
    return 20.0 * math.log10(max(float(value), 1e-12))


def _target_frequency(target_midi):
    return 440.0 * 2 ** ((target_midi - 69) / 12)


def _analysis_values(samples, sample_rate, onset, available_samples):
    start = onset + round(sample_rate * ANALYSIS_START_SECONDS)
    available_end = onset + max(
        0,
        available_samples - round(sample_rate * ANALYSIS_END_GUARD_SECONDS),
    )
    end = min(
        len(samples),
        onset + round(sample_rate * ANALYSIS_MAX_SECONDS),
        available_end,
    )
    if end <= start:
        return []
    values = [float(value) for value in samples[start:end]]
    mean = sum(values) / len(values)
    return [value - mean for value in values]


def candidate_signal_metrics(samples, sample_rate, candidate, target_midi):
    target_frequency = _target_frequency(target_midi)
    values = _analysis_values(
        samples,
        sample_rate,
        candidate.onset_sample,
        candidate.available_samples,
    )
    if len(values) < round(sample_rate * 0.20):
        return {
            "active_rms": 0.0,
            "active_rms_dbfs": -240.0,
            "peak": 0.0,
            "motion_ratio": 0.0,
            "minimum_motion_ratio": 1.0,
            "zero_crossing_hz": 0.0,
            "minimum_zero_crossing_hz": (
                target_frequency * MIN_ZERO_CROSSING_FRACTION_OF_TARGET
            ),
        }

    rms = math.sqrt(sum(value * value for value in values) / len(values))
    peak = max(abs(value) for value in values)
    differences = [
        current - previous
        for previous, current in zip(values, values[1:])
    ]
    difference_rms = math.sqrt(
        sum(value * value for value in differences) / max(1, len(differences))
    )
    motion_ratio = difference_rms / max(rms, 1e-12)
    expected_motion = 2.0 * math.sin(
        math.pi * target_frequency / sample_rate
    )
    minimum_motion_ratio = (
        expected_motion * MIN_MOTION_FRACTION_OF_TARGET
    )

    crossings = sum(
        1
        for previous, current in zip(values, values[1:])
        if (previous < 0 <= current) or (previous >= 0 > current)
    )
    duration_seconds = len(values) / sample_rate
    zero_crossing_hz = crossings / max(2.0 * duration_seconds, 1e-12)
    minimum_zero_crossing_hz = (
        target_frequency * MIN_ZERO_CROSSING_FRACTION_OF_TARGET
    )

    return {
        "active_rms": rms,
        "active_rms_dbfs": _dbfs(rms / 32768.0),
        "peak": peak,
        "motion_ratio": motion_ratio,
        "minimum_motion_ratio": minimum_motion_ratio,
        "zero_crossing_hz": zero_crossing_hz,
        "minimum_zero_crossing_hz": minimum_zero_crossing_hz,
    }


def _musical_candidate(candidate, metrics, group_max_rms, target_midi):
    return (
        candidate.available_samples
        >= round(base.SAMPLE_RATE * base.MIN_DERIVED_SECONDS)
        and candidate.target_score >= MIN_TARGET_PITCH_SCORE
        and abs(candidate.best_midi - target_midi)
        <= MAX_ESTIMATED_MIDI_DISTANCE
        and metrics["active_rms"]
        >= max(
            MIN_ABSOLUTE_ACTIVE_RMS,
            group_max_rms * MIN_RELATIVE_GROUP_RMS,
        )
        and metrics["motion_ratio"] >= metrics["minimum_motion_ratio"]
        and metrics["zero_crossing_hz"]
        >= metrics["minimum_zero_crossing_hz"]
    )


def choose_catalog_ordered_candidate(samples, sample_rate, target_midi):
    attacks = base.detect_attacks(samples, sample_rate)
    candidates = []
    for index, onset in enumerate(attacks):
        next_onset = attacks[index + 1] if index + 1 < len(attacks) else len(samples)
        target_score, best_midi, best_score = base.pitch_scores(
            samples, sample_rate, onset, target_midi
        )
        candidates.append(
            base.Candidate(
                onset_sample=onset,
                target_score=target_score,
                best_midi=best_midi,
                best_score=best_score,
                available_samples=max(0, next_onset - onset),
            )
        )

    configuration = ORDERED_GROUPS[target_midi]
    note_count = configuration["source_note_count"]
    ordinal = configuration["target_note_ordinal"]
    group_start = round(len(candidates) * ordinal / note_count)
    group_end = round(len(candidates) * (ordinal + 1) / note_count)
    group = candidates[group_start:group_end]
    measured = [
        (
            candidate,
            candidate_signal_metrics(samples, sample_rate, candidate, target_midi),
        )
        for candidate in group
    ]
    group_max_rms = max(
        (metrics["active_rms"] for _, metrics in measured),
        default=0.0,
    )

    matches = [
        (candidate, metrics)
        for candidate, metrics in measured
        if _musical_candidate(candidate, metrics, group_max_rms, target_midi)
    ]
    if not matches:
        diagnostic = ", ".join(
            f"{candidate.onset_sample / sample_rate:.3f}s:"
            f"midi{candidate.best_midi}:target={candidate.target_score:.3f}:"
            f"best={candidate.best_score:.3f}:"
            f"rms={metrics['active_rms']:.1f}:"
            f"motion={metrics['motion_ratio']:.5f}/"
            f"{metrics['minimum_motion_ratio']:.5f}:"
            f"zcr={metrics['zero_crossing_hz']:.1f}/"
            f"{metrics['minimum_zero_crossing_hz']:.1f}:"
            f"available={candidate.available_samples / sample_rate:.3f}s"
            for candidate, metrics in measured
        )
        raise RuntimeError(
            f"No signal-valid take remained in catalog group {ordinal + 1} "
            f"of {note_count} for target MIDI {target_midi}. Candidates: {diagnostic}"
        )

    chosen, _ = max(
        matches,
        key=lambda item: (
            item[1]["active_rms"],
            item[0].target_score,
            item[0].best_score,
            min(
                item[0].available_samples,
                round(sample_rate * base.MAX_DERIVED_SECONDS),
            ),
            -item[0].onset_sample,
        ),
    )
    return chosen, candidates


def _highpass(values, sample_rate):
    if not values:
        return []
    time_step = 1.0 / sample_rate
    resistance_capacitance = 1.0 / (2.0 * math.pi * HIGHPASS_CUTOFF_HZ)
    alpha = resistance_capacitance / (resistance_capacitance + time_step)
    output = [0.0]
    previous_input = float(values[0])
    previous_output = 0.0
    for raw_value in values[1:]:
        current_input = float(raw_value)
        current_output = alpha * (
            previous_output + current_input - previous_input
        )
        output.append(current_output)
        previous_input = current_input
        previous_output = current_output
    return output


def _active_rms(values, sample_rate):
    start = min(len(values), round(sample_rate * ANALYSIS_START_SECONDS))
    end = min(len(values), round(sample_rate * ANALYSIS_MAX_SECONDS))
    active = values[start:end]
    if not active:
        return 0.0
    mean = sum(active) / len(active)
    centered = [value - mean for value in active]
    return math.sqrt(
        sum(value * value for value in centered) / len(centered)
    )


def derive_balanced_samples(samples, sample_rate, candidate):
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
    selected = array.array("h", samples[start:end])
    if len(selected) < round(sample_rate * base.MIN_DERIVED_SECONDS):
        raise RuntimeError("The selected Iowa take is too short after trimming")

    filtered = _highpass(selected, sample_rate)
    active_rms = _active_rms(filtered, sample_rate)
    if active_rms <= 0:
        raise RuntimeError("The selected Iowa take has no measurable active signal")

    target_rms = 32767.0 * 10 ** (TARGET_ACTIVE_RMS_DBFS / 20.0)
    peak = max(abs(value) for value in filtered) or 1.0
    required_gain = target_rms / active_rms
    peak_limited_gain = (32767.0 * PEAK_LIMIT) / peak
    scale = min(required_gain, peak_limited_gain, MAX_NORMALIZATION_GAIN)

    normalized_rms = active_rms * scale
    normalized_dbfs = _dbfs(normalized_rms / 32768.0)
    if abs(normalized_dbfs - TARGET_ACTIVE_RMS_DBFS) > ACTIVE_RMS_TOLERANCE_DB:
        raise RuntimeError(
            "The selected Iowa take cannot reach the shared active-loudness "
            f"target safely: target={TARGET_ACTIVE_RMS_DBFS:.2f} dBFS, "
            f"achievable={normalized_dbfs:.2f} dBFS, "
            f"required_gain={required_gain:.3f}, applied_gain={scale:.3f}"
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
        output.append(
            max(-32768, min(32767, round(value * gain)))
        )

    final_peak = max(abs(value) for value in output) / 32768.0
    if final_peak > PEAK_LIMIT + 0.002:
        raise RuntimeError(
            f"Normalized Iowa take exceeded the peak limit: {final_peak:.6f}"
        )
    return output


base.choose_candidate = choose_catalog_ordered_candidate
base.derive_samples = derive_balanced_samples


if __name__ == "__main__":
    base.main()

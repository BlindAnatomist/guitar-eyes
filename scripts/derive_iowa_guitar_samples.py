#!/usr/bin/env python3
"""Derive six short string-specific WAV anchors from official Iowa guitar sessions."""

from __future__ import annotations

import argparse
import array
import hashlib
import json
import math
import shutil
import struct
import subprocess
import tempfile
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

TARGETS = (
    {
        "string_index": 0,
        "string_number": 1,
        "target_midi": 64,
        "anchor_name": "E4",
        "source_filename": "Guitar.mf.sul_E.E4B4.mono.aif",
        "source_sha256": "3c04d367aa3cdf9fa4c9cd6ba3591704de6da5917a714057b307699d1ed6128b",
        "derived_filename": "string-1-e4.wav",
    },
    {
        "string_index": 1,
        "string_number": 2,
        "target_midi": 59,
        "anchor_name": "B3",
        "source_filename": "Guitar.mf.sulB.B3.mono.aif",
        "source_sha256": "5afbcddce7bb8a2135232872984a6d2403ff3da1c1daaf03dacb17f29b454489",
        "derived_filename": "string-2-b3.wav",
    },
    {
        "string_index": 2,
        "string_number": 3,
        "target_midi": 56,
        "anchor_name": "G-sharp 3",
        "source_filename": "Guitar.mf.sulG.G3B3.mono.aif",
        "source_sha256": "6e9bcd0b29470ba131aa43d08e51f94b9daaf00a16fff07f52be95196d48bece",
        "derived_filename": "string-3-g-sharp3.wav",
    },
    {
        "string_index": 3,
        "string_number": 4,
        "target_midi": 52,
        "anchor_name": "E3",
        "source_filename": "Guitar.mf.sulD.D3B3.mono.aif",
        "source_sha256": "464a66a5fbd4c8f835bcddfeb9c875ee2d75e81e156cfe80a362473681c9ffa7",
        "derived_filename": "string-4-e3.wav",
    },
    {
        "string_index": 4,
        "string_number": 5,
        "target_midi": 47,
        "anchor_name": "B2",
        "source_filename": "Guitar.mf.sulA.A2B2.mono.aif",
        "source_sha256": "a298fddd7cc2d5e83eb63852360040dc87b63caa1638cf82589f8614e158525c",
        "derived_filename": "string-5-b2.wav",
    },
    {
        "string_index": 5,
        "string_number": 6,
        "target_midi": 40,
        "anchor_name": "E2",
        "source_filename": "Guitar.mf.sulE.E2B2.mono.aif",
        "source_sha256": "faef0e44dff6fcf99b2bd1cb50ab1ed519980e6c70951069cdbce38597c58b23",
        "derived_filename": "string-6-e2.wav",
    },
)

SAMPLE_RATE = 44_100
FRAME_SIZE = 1024
HOP_SIZE = 256
MIN_ATTACK_GAP_SECONDS = 0.58
MAX_DERIVED_SECONDS = 4.0
MIN_DERIVED_SECONDS = 0.72
COLLECTION_URL = "https://theremin.music.uiowa.edu/MIS.html"
GUITAR_CATALOG_URL = "https://theremin.music.uiowa.edu/MISguitar.html"
USAGE_STATEMENT = (
    "University of Iowa Electronic Music Studios Musical Instrument Samples "
    "recordings may be downloaded and used for projects without restrictions."
)


@dataclass(frozen=True)
class Candidate:
    onset_sample: int
    target_score: float
    best_midi: int
    best_score: float
    available_samples: int


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round((len(ordered) - 1) * fraction)))
    return ordered[index]


def convert_to_wav(source: Path, destination: Path) -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is required to decode the official AIFF sessions")
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-nostdin",
            "-y",
            "-i",
            str(source),
            "-ac",
            "1",
            "-ar",
            str(SAMPLE_RATE),
            "-c:a",
            "pcm_s16le",
            str(destination),
        ],
        check=True,
    )


def read_wav(path: Path) -> tuple[int, array.array]:
    with wave.open(str(path), "rb") as handle:
        if handle.getnchannels() != 1 or handle.getsampwidth() != 2:
            raise RuntimeError(f"Expected mono 16-bit WAV: {path}")
        sample_rate = handle.getframerate()
        samples = array.array("h")
        samples.frombytes(handle.readframes(handle.getnframes()))
    if struct.pack("=h", 1) != struct.pack("<h", 1):
        samples.byteswap()
    return sample_rate, samples


def frame_rms(samples: array.array) -> list[float]:
    values: list[float] = []
    for start in range(0, max(1, len(samples) - FRAME_SIZE), HOP_SIZE):
        frame = samples[start : start + FRAME_SIZE]
        if not frame:
            break
        energy = sum(float(value) * float(value) for value in frame) / len(frame)
        values.append(math.sqrt(energy))
    return values


def detect_attacks(samples: array.array, sample_rate: int) -> list[int]:
    envelope = frame_rms(samples)
    if len(envelope) < 8:
        raise RuntimeError("The decoded session is too short for attack detection")

    floor = percentile(envelope, 0.18)
    strong = percentile(envelope, 0.98)
    threshold = max(90.0, floor * 3.2, strong * 0.055)
    minimum_gap_frames = max(1, round(MIN_ATTACK_GAP_SECONDS * sample_rate / HOP_SIZE))
    lookback = max(2, round(0.16 * sample_rate / HOP_SIZE))
    attacks: list[int] = []

    for index in range(lookback, len(envelope) - 2):
        current = envelope[index]
        previous = envelope[index - lookback : index]
        previous_peak = max(previous)
        previous_mean = sum(previous) / len(previous)
        rising = current >= threshold and (
            current >= previous_peak * 1.65 or current >= previous_mean * 2.25
        )
        local_peak = current >= envelope[index + 1] * 0.88
        if not rising or not local_peak:
            continue
        if attacks and index - attacks[-1] < minimum_gap_frames:
            if current > envelope[attacks[-1]] * 1.45:
                attacks[-1] = index
            continue
        attacks.append(index)

    if not attacks:
        raise RuntimeError(
            f"No pluck attacks were detected; floor={floor:.2f}, strong={strong:.2f}, threshold={threshold:.2f}"
        )
    return [index * HOP_SIZE for index in attacks]


def normalized_autocorrelation(values: list[float], lag: int) -> float:
    if lag <= 0 or len(values) <= lag + 8:
        return -1.0
    left = values[:-lag]
    right = values[lag:]
    numerator = sum(a * b for a, b in zip(left, right))
    left_energy = sum(a * a for a in left)
    right_energy = sum(b * b for b in right)
    denominator = math.sqrt(left_energy * right_energy)
    if denominator <= 0:
        return -1.0
    return numerator / denominator


def pitch_scores(
    samples: array.array, sample_rate: int, onset_sample: int, target_midi: int
) -> tuple[float, int, float]:
    start = onset_sample + round(sample_rate * 0.07)
    end = min(len(samples), onset_sample + round(sample_rate * 0.52))
    raw = samples[start:end]
    if len(raw) < round(sample_rate * 0.20):
        return -1.0, target_midi, -1.0

    downsample = 4
    reduced = [float(value) for value in raw[::downsample]]
    mean = sum(reduced) / len(reduced)
    reduced = [value - mean for value in reduced]
    reduced_rate = sample_rate / downsample

    scores: dict[int, float] = {}
    for midi in range(target_midi - 5, target_midi + 6):
        frequency = 440.0 * 2 ** ((midi - 69) / 12)
        ideal_lag = reduced_rate / frequency
        candidate_scores = []
        for lag in range(max(2, round(ideal_lag) - 2), round(ideal_lag) + 3):
            fundamental = normalized_autocorrelation(reduced, lag)
            double_period = normalized_autocorrelation(reduced, lag * 2)
            candidate_scores.append(fundamental * 0.72 + double_period * 0.28)
        scores[midi] = max(candidate_scores)

    best_midi = max(scores, key=scores.get)
    return scores[target_midi], best_midi, scores[best_midi]


def choose_candidate(
    samples: array.array, sample_rate: int, target_midi: int
) -> tuple[Candidate, list[Candidate]]:
    attacks = detect_attacks(samples, sample_rate)
    candidates: list[Candidate] = []
    for index, onset in enumerate(attacks):
        next_onset = attacks[index + 1] if index + 1 < len(attacks) else len(samples)
        available = max(0, next_onset - onset)
        target_score, best_midi, best_score = pitch_scores(
            samples, sample_rate, onset, target_midi
        )
        candidates.append(
            Candidate(
                onset_sample=onset,
                target_score=target_score,
                best_midi=best_midi,
                best_score=best_score,
                available_samples=available,
            )
        )

    matches = [
        candidate
        for candidate in candidates
        if candidate.best_midi == target_midi
        and candidate.target_score >= 0.20
        and candidate.available_samples >= round(sample_rate * MIN_DERIVED_SECONDS)
    ]
    if not matches:
        diagnostic = ", ".join(
            f"{candidate.onset_sample / sample_rate:.3f}s:midi{candidate.best_midi}:"
            f"target={candidate.target_score:.3f}:best={candidate.best_score:.3f}"
            for candidate in candidates[:40]
        )
        raise RuntimeError(
            f"No trustworthy take matched target MIDI {target_midi}. Candidates: {diagnostic}"
        )

    chosen = max(
        matches,
        key=lambda candidate: (
            min(candidate.available_samples, round(sample_rate * MAX_DERIVED_SECONDS)),
            candidate.target_score,
            -candidate.onset_sample,
        ),
    )
    return chosen, candidates


def derive_samples(
    samples: array.array, sample_rate: int, candidate: Candidate
) -> array.array:
    pre_roll = round(sample_rate * 0.008)
    start = max(0, candidate.onset_sample - pre_roll)
    duration = min(
        round(sample_rate * MAX_DERIVED_SECONDS),
        max(
            round(sample_rate * MIN_DERIVED_SECONDS),
            candidate.available_samples - round(sample_rate * 0.055),
        ),
    )
    end = min(len(samples), start + duration)
    selected = array.array("h", samples[start:end])
    if len(selected) < round(sample_rate * MIN_DERIVED_SECONDS):
        raise RuntimeError("The selected Iowa take is too short after trimming")

    peak = max(abs(value) for value in selected) or 1
    scale = min(1.0, (32767 * 0.88) / peak)
    fade_samples = min(len(selected), round(sample_rate * 0.075))
    for index, value in enumerate(selected):
        gain = scale
        if index < round(sample_rate * 0.004):
            gain *= index / max(1, round(sample_rate * 0.004))
        if index >= len(selected) - fade_samples:
            gain *= (len(selected) - index - 1) / max(1, fade_samples)
        selected[index] = max(-32768, min(32767, round(value * gain)))
    return selected


def write_wav(path: Path, sample_rate: int, samples: array.array) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    output = array.array("h", samples)
    if struct.pack("=h", 1) != struct.pack("<h", 1):
        output.byteswap()
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sample_rate)
        handle.writeframes(output.tobytes())


def run(source_dir: Path, output_dir: Path, evidence_path: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    evidence: dict[str, object] = {
        "schemaVersion": 1,
        "collectionUrl": COLLECTION_URL,
        "guitarCatalogUrl": GUITAR_CATALOG_URL,
        "usageStatement": USAGE_STATEMENT,
        "sampleRate": SAMPLE_RATE,
        "targets": [],
    }

    with tempfile.TemporaryDirectory(prefix="guitar-eyes-iowa-") as temporary:
        temporary_dir = Path(temporary)
        for target in TARGETS:
            source = source_dir / str(target["source_filename"])
            if not source.is_file():
                raise FileNotFoundError(f"Missing official Iowa source file: {source}")
            actual_source_hash = sha256(source)
            if actual_source_hash != target["source_sha256"]:
                raise RuntimeError(
                    f"Source hash mismatch for {source.name}: {actual_source_hash}"
                )

            decoded = temporary_dir / f"{source.stem}.wav"
            convert_to_wav(source, decoded)
            sample_rate, source_samples = read_wav(decoded)
            if sample_rate != SAMPLE_RATE:
                raise RuntimeError(f"Unexpected decoded sample rate {sample_rate}")
            chosen, candidates = choose_candidate(
                source_samples, sample_rate, int(target["target_midi"])
            )
            derived_samples = derive_samples(source_samples, sample_rate, chosen)
            output = output_dir / str(target["derived_filename"])
            write_wav(output, sample_rate, derived_samples)

            evidence["targets"].append(
                {
                    **target,
                    "sourceBytes": source.stat().st_size,
                    "sourceSha256": actual_source_hash,
                    "selectedOnsetSeconds": round(chosen.onset_sample / sample_rate, 6),
                    "selectedDurationSeconds": round(len(derived_samples) / sample_rate, 6),
                    "targetPitchScore": round(chosen.target_score, 6),
                    "estimatedMidi": chosen.best_midi,
                    "bestPitchScore": round(chosen.best_score, 6),
                    "detectedAttackCount": len(candidates),
                    "derivedBytes": output.stat().st_size,
                    "derivedSha256": sha256(output),
                }
            )

    evidence_path.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run(args.source_dir, args.output_dir, args.evidence)


if __name__ == "__main__":
    main()

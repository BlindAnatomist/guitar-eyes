#!/usr/bin/env python3
"""Audit all six derived Iowa guitar anchors as one balanced musical set."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import sys
from pathlib import Path

module_path = Path(__file__).with_name("derive_iowa_guitar_samples_robust.py")
spec = importlib.util.spec_from_file_location("derive_iowa_guitar_samples_robust", module_path)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Could not load the robust extractor at {module_path}")
pipeline = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = pipeline
spec.loader.exec_module(pipeline)
base = pipeline.base

MAX_SET_SPREAD_DB = 1.75
MIN_DERIVED_TARGET_SCORE = 0.35


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def dbfs(value: float) -> float:
    return 20.0 * math.log10(max(value, 1e-12))


def audit_sample(path: Path, target: dict[str, object]) -> dict[str, object]:
    sample_rate, samples = base.read_wav(path)
    if sample_rate != base.SAMPLE_RATE:
        raise RuntimeError(f"Unexpected sample rate for {path.name}: {sample_rate}")

    candidate = base.Candidate(
        onset_sample=0,
        target_score=1.0,
        best_midi=int(target["target_midi"]),
        best_score=1.0,
        available_samples=len(samples),
    )
    signal = pipeline.candidate_signal_metrics(
        samples,
        sample_rate,
        candidate,
        int(target["target_midi"]),
    )
    target_score, best_midi, best_score = base.pitch_scores(
        samples,
        sample_rate,
        0,
        int(target["target_midi"]),
    )
    peak = max(abs(value) for value in samples) / 32768.0
    active_dbfs = float(signal["active_rms_dbfs"])

    if abs(active_dbfs - pipeline.TARGET_ACTIVE_RMS_DBFS) > pipeline.ACTIVE_RMS_TOLERANCE_DB:
        raise RuntimeError(
            f"{path.name} active loudness {active_dbfs:.3f} dBFS is outside "
            f"{pipeline.TARGET_ACTIVE_RMS_DBFS:.3f} ± "
            f"{pipeline.ACTIVE_RMS_TOLERANCE_DB:.3f} dB"
        )
    if peak > pipeline.PEAK_LIMIT + 0.002:
        raise RuntimeError(
            f"{path.name} peak {peak:.6f} exceeds {pipeline.PEAK_LIMIT:.6f}"
        )
    if abs(best_midi - int(target["target_midi"])) > pipeline.MAX_ESTIMATED_MIDI_DISTANCE:
        raise RuntimeError(
            f"{path.name} estimated MIDI {best_midi} does not match "
            f"target {target['target_midi']}"
        )
    if target_score < MIN_DERIVED_TARGET_SCORE:
        raise RuntimeError(
            f"{path.name} target pitch score {target_score:.6f} is below "
            f"{MIN_DERIVED_TARGET_SCORE:.6f}"
        )
    if signal["motion_ratio"] < signal["minimum_motion_ratio"]:
        raise RuntimeError(f"{path.name} is dominated by sub-musical motion")
    if signal["zero_crossing_hz"] < signal["minimum_zero_crossing_hz"]:
        raise RuntimeError(f"{path.name} lacks sufficient target-band crossings")

    return {
        "stringIndex": int(target["string_index"]),
        "stringNumber": int(target["string_number"]),
        "anchorMidi": int(target["target_midi"]),
        "anchorName": str(target["anchor_name"]),
        "derivedFilename": path.name,
        "derivedBytes": path.stat().st_size,
        "derivedSha256": sha256(path),
        "activeRmsDbfs": round(active_dbfs, 6),
        "peakDbfs": round(dbfs(peak), 6),
        "targetPitchScore": round(target_score, 6),
        "estimatedMidi": best_midi,
        "bestPitchScore": round(best_score, 6),
        "motionRatio": round(float(signal["motion_ratio"]), 8),
        "minimumMotionRatio": round(float(signal["minimum_motion_ratio"]), 8),
        "zeroCrossingHz": round(float(signal["zero_crossing_hz"]), 6),
        "minimumZeroCrossingHz": round(
            float(signal["minimum_zero_crossing_hz"]),
            6,
        ),
    }


def run(sample_dir: Path, evidence_path: Path) -> dict[str, object]:
    results = []
    for target in base.TARGETS:
        path = sample_dir / str(target["derived_filename"])
        if not path.is_file():
            raise FileNotFoundError(f"Missing derived Iowa sample: {path}")
        results.append(audit_sample(path, target))

    active_levels = [float(result["activeRmsDbfs"]) for result in results]
    spread_db = max(active_levels) - min(active_levels)
    if spread_db > MAX_SET_SPREAD_DB:
        raise RuntimeError(
            f"Six-sample active-loudness spread {spread_db:.3f} dB exceeds "
            f"{MAX_SET_SPREAD_DB:.3f} dB"
        )

    evidence = {
        "schemaVersion": 1,
        "auditIdentity": "Guitar Eyes Iowa systemic sample audit 1K",
        "selectionMethod": pipeline.SELECTION_METHOD,
        "normalization": {
            "targetActiveRmsDbfs": pipeline.TARGET_ACTIVE_RMS_DBFS,
            "toleranceDb": pipeline.ACTIVE_RMS_TOLERANCE_DB,
            "maximumSetSpreadDb": MAX_SET_SPREAD_DB,
            "peakLimit": pipeline.PEAK_LIMIT,
            "maximumGain": pipeline.MAX_NORMALIZATION_GAIN,
            "highpassCutoffHz": pipeline.HIGHPASS_CUTOFF_HZ,
        },
        "setActiveLoudnessSpreadDb": round(spread_db, 6),
        "samples": results,
    }
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    evidence_path.write_text(
        json.dumps(evidence, indent=2) + "\n",
        encoding="utf-8",
    )
    return evidence


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample-dir", required=True, type=Path)
    parser.add_argument("--evidence", required=True, type=Path)
    args = parser.parse_args()
    evidence = run(args.sample_dir, args.evidence)
    print(json.dumps(evidence, indent=2))


if __name__ == "__main__":
    main()

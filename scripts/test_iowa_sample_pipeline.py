#!/usr/bin/env python3
"""Deterministic synthetic checks for the Iowa systemic sample pipeline."""

from __future__ import annotations

import array
import importlib.util
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


def sine(frequency: float, amplitude: float, seconds: float = 1.0) -> array.array:
    count = round(base.SAMPLE_RATE * seconds)
    return array.array(
        "h",
        (
            round(amplitude * math.sin(2.0 * math.pi * frequency * index / base.SAMPLE_RATE))
            for index in range(count)
        ),
    )


def candidate(samples: array.array, midi: int) -> object:
    return base.Candidate(
        onset_sample=0,
        target_score=0.9,
        best_midi=midi,
        best_score=0.9,
        available_samples=len(samples),
    )


weak_e2 = sine(82.406889, 320.0)
e2_candidate = candidate(weak_e2, 40)
e2_metrics = pipeline.candidate_signal_metrics(
    weak_e2,
    base.SAMPLE_RATE,
    e2_candidate,
    40,
)
assert pipeline._musical_candidate(
    e2_candidate,
    e2_metrics,
    e2_metrics["active_rms"],
    40,
)

normalized = pipeline.derive_balanced_samples(
    weak_e2,
    base.SAMPLE_RATE,
    e2_candidate,
)
normalized_candidate = candidate(normalized, 40)
normalized_metrics = pipeline.candidate_signal_metrics(
    normalized,
    base.SAMPLE_RATE,
    normalized_candidate,
    40,
)
assert (
    abs(
        normalized_metrics["active_rms_dbfs"]
        - pipeline.TARGET_ACTIVE_RMS_DBFS
    )
    <= pipeline.ACTIVE_RMS_TOLERANCE_DB
)
assert max(abs(value) for value in normalized) / 32768.0 <= pipeline.PEAK_LIMIT + 0.002

drift = sine(5.0, 1200.0)
drift_candidate = candidate(drift, 40)
drift_metrics = pipeline.candidate_signal_metrics(
    drift,
    base.SAMPLE_RATE,
    drift_candidate,
    40,
)
assert not pipeline._musical_candidate(
    drift_candidate,
    drift_metrics,
    drift_metrics["active_rms"],
    40,
)

print("synthetic_signal_rejection=passed")
print("weak_valid_note_normalization=passed")
print("peak_limit=passed")

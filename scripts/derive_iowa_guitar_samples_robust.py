#!/usr/bin/env python3
"""Select clean Iowa guitar takes from the catalog's ordered chromatic groups."""

from __future__ import annotations

import importlib.util
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

base.TARGETS = tuple(
    {
        **target,
        **ORDERED_GROUPS[int(target["target_midi"])],
        "selection_method": "catalog-ordered-chromatic-group-v3",
    }
    for target in base.TARGETS
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

    matches = [
        candidate
        for candidate in group
        if candidate.available_samples >= round(sample_rate * base.MIN_DERIVED_SECONDS)
        and candidate.target_score >= 0.45
    ]
    if not matches:
        diagnostic = ", ".join(
            f"{candidate.onset_sample / sample_rate:.3f}s:midi{candidate.best_midi}:"
            f"target={candidate.target_score:.3f}:best={candidate.best_score:.3f}:"
            f"available={candidate.available_samples / sample_rate:.3f}s"
            for candidate in group
        )
        raise RuntimeError(
            f"No usable take remained in catalog group {ordinal + 1} of {note_count} "
            f"for target MIDI {target_midi}. Candidates: {diagnostic}"
        )

    chosen = max(
        matches,
        key=lambda candidate: (
            candidate.target_score,
            candidate.best_score,
            min(
                candidate.available_samples,
                round(sample_rate * base.MAX_DERIVED_SECONDS),
            ),
            -candidate.onset_sample,
        ),
    )
    return chosen, candidates


base.choose_candidate = choose_catalog_ordered_candidate


if __name__ == "__main__":
    base.main()

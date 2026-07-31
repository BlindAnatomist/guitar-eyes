#!/usr/bin/env python3
"""Refine Iowa take selection while preserving the first-pass extractor."""

from __future__ import annotations

from scripts import derive_iowa_guitar_samples as base


def choose_harmonic_tolerant_candidate(samples, sample_rate, target_midi):
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

    matches = [
        candidate
        for candidate in candidates
        if abs(candidate.best_midi - target_midi) <= 1
        and candidate.target_score >= 0.72
        and candidate.available_samples
        >= round(sample_rate * base.MIN_DERIVED_SECONDS)
    ]
    if not matches:
        diagnostic = ", ".join(
            f"{candidate.onset_sample / sample_rate:.3f}s:midi{candidate.best_midi}:"
            f"target={candidate.target_score:.3f}:best={candidate.best_score:.3f}"
            for candidate in candidates[:60]
        )
        raise RuntimeError(
            f"No harmonic-tolerant take matched target MIDI {target_midi}. "
            f"Candidates: {diagnostic}"
        )

    chosen = max(
        matches,
        key=lambda candidate: (
            min(
                candidate.available_samples,
                round(sample_rate * base.MAX_DERIVED_SECONDS),
            ),
            candidate.target_score,
            -candidate.onset_sample,
        ),
    )
    return chosen, candidates


base.choose_candidate = choose_harmonic_tolerant_candidate


if __name__ == "__main__":
    base.main()

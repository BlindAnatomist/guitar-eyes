# Iowa Sample Systemic Repair 1K Loudness Target Diagnostic

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-systemic-repair-1k`

Exact source tested: `61de66b7b967d62caaf4b392f7963fc8510e8199`

Derivation run: `30833697005`

## Result before the stop

The run passed exact source identity, ancestry, the complete source boundary, no committed audio, Python compilation, the corrected B3 waveform regression, 5 Hz drift rejection, weak-note normalization, peak protection, FFmpeg installation, all six official downloads, and all official source hashes.

The selector then accepted the strongest valid B3 candidate from the dedicated B-string session. After removal of sub-35 Hz drift, that take required `25.609` times amplification to reach the provisional `-24 dBFS` active-RMS target. The maximum permitted gain was `12`, which could safely reach only `-30.585 dBFS`. The derivation therefore failed rather than over-amplifying the recording.

## Complete six-string calculation

Using the exact selected candidates and the same high-pass and active-window calculation, a shared `-30 dBFS` target produces:

1. high E: required gain `1.801`, achieved `-30.000 dBFS`;
2. B: required gain `12.835`, capped at `12`, achieved `-30.585 dBFS`;
3. G-sharp anchor: required gain `0.842`, achieved `-30.000 dBFS`;
4. E3 anchor: required gain `0.847`, achieved `-30.000 dBFS`;
5. B2 anchor: required gain `1.567`, achieved `-30.000 dBFS`;
6. low E: required gain `3.383`, achieved `-30.000 dBFS`.

The resulting measured active-loudness spread is approximately `0.585 dB`, well inside the `1.75 dB` six-sample limit. No sample approaches the `0.88` peak ceiling; the largest predicted normalized peak is approximately `0.211`.

## Decision

The shared target changes from provisional `-24 dBFS` to evidence-based `-30 dBFS`. The `12` times gain ceiling, `0.88` peak limit, selection gates, drift rejection, pitch bounds, and six-sample spread requirement remain unchanged.

This is not a concession to the failed low E. It is the loudest common target that the complete verified source set can reach without excessive amplification. Relative to 1J, the normalized high-E anchor is slightly louder, while the low-E anchor gains roughly 30 decibels of active musical signal after drift removal.

## Retry rule

Do not rerun source `61de66b7b967d62caaf4b392f7963fc8510e8199`. Run one new exact derivation checkpoint from the source containing the `-30 dBFS` target and this diagnostic record.

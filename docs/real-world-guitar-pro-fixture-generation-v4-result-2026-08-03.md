# Real-World Guitar Pro Fixture Generation v4 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

Exact feature source:

`21a9bd4644f805be9be7473b4b3fb4fad0e5849c`

Workflow run:

`30854840370`

Job:

`91823325495`

## Purpose

Apply the first source-proven GP5 writer correction to the pinned development-only fixture generator: replace ten page-setup `write_int_size_string` calls with `write_int_byte_size_string`, then regenerate and independently decode all five Guitar Pro families.

## Passed evidence

1. Exact feature source and accepted ancestry passed.
2. The pinned external generator commit was checked out.
3. Exactly ten page-setup writer calls were replaced.
4. The external patch passed `git diff --check`.
5. The patched generator built successfully.
6. GP3, GP4, GP5, GPX, and GP7 shared `.gp` binaries were regenerated successfully.
7. GP3 passed alphaTab with the expected two bars, six beats, six notes, one rest, one chord, standard tuning, and half/quarter durations.
8. GP4 passed with the same evidence.

## Exact remaining failure

GP5 advanced beyond the prior impossible-string-length error but still failed in `Gp3To5Importer.readPageSetup` with:

`EndOfReaderError: Unexpected end of data within reader`

The manifest and final artifact were correctly not produced.

## Final root cause

The page-setup string correction was necessary but not sufficient.

Direct binary inspection established the GP5 page-setup boundary and showed:

1. A4 page width, height, and four margins were encoded correctly as six 32-bit integers.
2. The generator wrote `score_size_proportion * 100` as a 32-bit integer.
3. alphaTab reads that GP5 score-size field as a 16-bit integer.
4. The upper two zero bytes therefore shifted the header/footer flags and all ten page templates by two bytes.

The pinned writer source confirms the mismatch:

- generator: `write_i32` for score size;
- alphaTab: `readInt16LE` for score size.

## Required final development-only patch

The next generator operation must apply exactly two page-setup corrections:

1. encode score size as i16 rather than i32;
2. encode all ten page templates with int-plus-byte length rather than int-only length.

No other external writer field, Guitar Eyes runtime file, musical source, semantic requirement, or alphaTab assertion may change.

## Repository authority

The temporary v4 workflow was removed after inspection. Fork `main` was restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, deployment, publication, playback work, or upstream modification occurred.
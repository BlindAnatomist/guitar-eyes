# Real-World Guitar Pro Four-Correction Fixture Gate Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

## Purpose

Run one generator-only zero-dollar gate after the v6 application source, complete test suite, production build, and bundle boundaries passed.

This gate tests exactly four development-time corrections against pinned external fixture-generator commit:

`slundi/guitarpro@2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`

It does not modify Guitar Eyes runtime source, add an application dependency, publish a build, deploy Pages, or repeat the already-passed application gate.

## Exact external corrections

1. In `guitarpro/src/model/legacy/page.rs`, replace exactly ten GP5 page-template calls from `write_int_size_string` to `write_int_byte_size_string`.
2. In `guitarpro/src/model/legacy/song.rs`, replace exactly one GP5 tempo-label call from `write_int_size_string` to `write_int_byte_size_string`.
3. In `guitarpro/src/io/gpif_export.rs`, reverse only the exported tuning-pitch iteration so GPX and GP7 expose top tablature line first.
4. In `guitarpro/src/model/legacy/rse.rs`, preserve every equalizer knob and then write exactly one gain or PRE signed byte through the existing `pack_volume_value` function.

The fourth correction repairs the one-byte GP5.1 RSE alignment mismatch proven by v6. It also makes the shared equalizer writer match its own reader contract for track equalizers.

## Patch safety

The gate must:

1. verify all four original source fragments before editing;
2. verify replacement counts of exactly ten, one, one, and one;
3. restrict the external diff to exactly four files;
4. run `git diff --check`;
5. preserve the full external patch in the artifact;
6. compile the external tool from exact pinned source; and
7. never push to or open a pull request against the external repository.

## Original source and generation path

1. Copy project-authored CC0 MusicXML specimen `fixtures/real-world/musicxml-chord-rest-two-measures.musicxml`.
2. Convert it once to the generator's optimized `.score` representation.
3. Convert that single optimized source to GP3, GP4, GP5, GP6 GPX, and GP7 `.gp`.

## Independent alphaTab acceptance

Pinned alphaTab 1.8.4 must independently decode every family and return exactly:

1. one non-percussion track;
2. one six-string staff;
3. tuning `[64, 59, 55, 50, 45, 40]` in top-line-first order;
4. two bars;
5. six timed beats;
6. duration denominators `[4, 4, 4, 4, 2, 2]` in source order;
7. exactly one timed rest at beat two; and
8. note coordinates by beat:
   - beat one: string 6 fret 0 and string 5 fret 1;
   - beat two: none;
   - beat three: string 4 fret 0;
   - beat four: string 3 fret 2;
   - beat five: string 2 fret 0;
   - beat six: string 1 fret 3.

No tuning sort, string remapping, nearest-note correction, or semantic tolerance is permitted in the audit.

## Artifact

Upload one one-day artifact only if all five families pass. It must include:

1. original MusicXML source;
2. optimized `.score` source;
3. all five Guitar Pro binaries;
4. complete four-file external patch;
5. exact alphaTab semantic audit JSON;
6. SHA-256 hashes; and
7. licensing and provenance.

## Execution boundary

1. Standard `ubuntu-24.04` runner.
2. Twenty-minute timeout.
3. Contents read and statuses write only.
4. One temporary workflow-file push to clean fork `main`.
5. Restore `main` exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` as soon as pending status reveals the run identifier.
6. No application tests, build, Pages, deployment, pull request, merge, paid runner, or paid service in this generator-only gate.

## Stop condition

Stop after the five-family semantic verdict and artifact result. If any family fails, record the exact mismatch and do not commit any binary. If all pass, recover the artifact and commit the verified fixture pack with provenance before one final full application gate.
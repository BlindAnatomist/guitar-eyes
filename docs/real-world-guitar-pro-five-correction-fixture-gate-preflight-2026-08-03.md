# Real-World Guitar Pro Five-Correction Fixture Gate Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

## Purpose

Run one generator-only zero-dollar gate for five exact development-time corrections to pinned external fixture-generator commit:

`slundi/guitarpro@2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`

The application source, complete inherited test suite, production build, and lazy-bundle boundary already passed in source gate v6. This gate does not repeat those costs.

## Exact external corrections

1. GP5 page-template strings: exactly ten `write_int_size_string(data,` calls become `write_int_byte_size_string(data,`.
2. GP5 tempo label: exactly one `write_int_size_string(&mut data, &self.tempo_name);` call becomes `write_int_byte_size_string(&mut data, &self.tempo_name);`.
3. GPIF tuning order: exactly one `track.strings.iter()` tuning export becomes `track.strings.iter().rev()`.
4. Legacy equalizer gain: exactly one `write_equalizer` function appends one signed gain or PRE byte after its knob bytes.
5. GP5 voice cardinality: exactly one `write_measure` branch always emits two voice-count integers; when the second voice is absent, it writes a four-byte zero count before preserving the existing line-break byte.

No note-string mapping, post-track preamble, line-break byte, beat body, application source, or runtime dependency may change.

## Patch safety

The gate must:

1. verify each original external fragment before replacement;
2. verify replacement counts of ten, one, one, one, and one;
3. restrict the external diff to exactly five files:
   - `guitarpro/src/io/gpif_export.rs`;
   - `guitarpro/src/model/legacy/measure.rs`;
   - `guitarpro/src/model/legacy/page.rs`;
   - `guitarpro/src/model/legacy/rse.rs`;
   - `guitarpro/src/model/legacy/song.rs`;
4. run `git diff --check`;
5. preserve the complete external patch in the evidence pack;
6. compile the external CLI from exact pinned source; and
7. never push to or open a pull request against the external repository.

## Generation and independent acceptance

Generate GP3, GP4, GP5, GP6 GPX, and GP7 `.gp` from one optimized form of the project-authored CC0 MusicXML source.

Pinned alphaTab 1.8.4 must independently return for every family:

1. one non-percussion track;
2. one six-string staff;
3. tuning `[64, 59, 55, 50, 45, 40]` without sorting;
4. two bars;
5. six timed beats;
6. durations `[4, 4, 4, 4, 2, 2]`;
7. exactly one rest at beat two; and
8. note coordinates:
   - beat one `[[6, 0], [5, 1]]`;
   - beat two `[]`;
   - beat three `[[4, 0]]`;
   - beat four `[[3, 2]]`;
   - beat five `[[2, 0]]`;
   - beat six `[[1, 3]]`.

No semantic tolerance, tuning sort, string remapping, or nearest-note repair is permitted.

## Artifact and stop condition

Upload one one-day artifact only if all five families pass. Include the source, optimized score, five binaries, external patch, exact audit JSON, hashes, and provenance.

Stop after the five-family verdict. If any family fails, do not upload or commit binaries. If all pass, recover and commit the verified pack before one final application gate against the actual repository fixtures.

## Repository and cost boundary

1. Standard `ubuntu-24.04` runner.
2. Twenty-minute timeout.
3. Contents read and statuses write only.
4. One temporary workflow push to clean fork `main`.
5. Restore fork `main` immediately after the pending status reveals the run ID.
6. No Pages, deployment, publication, pull request, merge, paid runner, paid service, or upstream modification.
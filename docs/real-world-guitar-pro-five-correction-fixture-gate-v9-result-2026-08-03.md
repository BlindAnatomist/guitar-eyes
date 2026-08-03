# Real-World Guitar Pro Five-Correction Fixture Gate v9 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

Exact feature source tested:

`66bc7b99692c675e5af941cd25c5646e69a0c4f2`

Workflow run:

`30857361696`

Job:

`91831374512`

## Result

The five-correction generator-only gate failed closed during the independent alphaTab semantic audit. No provenance pack or binary artifact was uploaded.

## Passed preparation

The gate:

1. checked out the exact feature source;
2. installed pinned alphaTab 1.8.4;
3. cloned exact external generator commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`;
4. applied exactly the five preflighted development-time corrections;
5. restricted the external diff to exactly five files;
6. passed `git diff --check`;
7. compiled the external generator successfully; and
8. generated nonempty GP3, GP4, GP5, GPX, and GP7 shared `.gp` files from one optimized project-authored source.

## Independent audit result

GP3 passed exact:

- one non-percussion six-string track;
- tuning `[64, 59, 55, 50, 45, 40]`;
- two bars;
- ordered durations `[4, 4, 4, 4, 2, 2]`;
- exactly one timed rest at beat index 1; and
- Guitar Eyes low-to-high string/fret coordinates `[[[6,0],[5,1]],[],[[4,0]],[[3,2]],[[2,0]],[[1,3]]]`.

GP4 passed the same exact assertions.

GP5 passed the same exact assertions, proving that the page strings, tempo label, equalizer gain byte, and mandatory empty second voice repaired the complete legacy GP5 path.

GPX decoded with correct track inventory, tuning, bar count, durations, rest placement, and frets, but its string identities were mirrored:

`[[[2,1],[1,0]],[],[[3,0]],[[4,2]],[[5,0]],[[6,3]]]`

GP7 shared `.gp` was not reached because the strict audit stopped at the first failing family.

## Exact cause

Guitar Eyes intentionally stores alphaTab note strings as `stringNumberLowToHigh`, where low E is 1 and high E is 6.

The authored MusicXML uses standard technical numbering, where high E is 1 and low E is 6. The legacy binary writers and alphaTab importers convert this to Guitar Eyes low-to-high numbering correctly.

The pinned GPIF exporter already reverses tuning pitches to high-to-low order, but its note writer still serializes:

`note.string.saturating_sub(1)`

The GPIF note-string property is zero-based from low to high. For the six-string source, the correct value is therefore:

`6 - note.string`

That maps authored high E string 1 to GPIF index 5 and alphaTab low-to-high string 6, while authored low E string 6 maps to GPIF index 0 and alphaTab low-to-high string 1.

## Required sixth external-only correction

In pinned external file:

`guitarpro/src/io/gpif_export.rs`

Pass the current track string count into note export and serialize each GPIF note string as:

`string_count - note.string`

The correction must:

1. validate that `note.string` is between 1 and `string_count`;
2. preserve fret values;
3. preserve reversed high-to-low tuning export;
4. preserve all GP3, GP4, and GP5 writing;
5. preserve rhythm, rests, bars, voices, and techniques; and
6. remain a temporary fixture-generation patch only.

## Next gate

One six-correction generator-only gate may run without repeating the already-passed application suite. It must generate all five families and independently require the exact same low-to-high Guitar Eyes semantics across GP3, GP4, GP5, GPX, and GP7 shared `.gp`.

Upload one one-day evidence pack only if every family passes.

## Repository authority

Fork `main` was restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, Pages publication, deployment, runtime external-writer dependency, or upstream modification occurred.

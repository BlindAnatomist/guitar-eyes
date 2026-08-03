# Real-World Guitar Pro Correction Source Gate v6 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Feature source tested:

`28faed68cdb9ed1a89ca977cec07e4ad3e7087a2`

Workflow run:

`30855770223`

Job:

`91826303461`

## Result

The application source and production artifact passed. The gate failed only during the independent GP5 fixture audit, after all five files had been generated.

No provenance file or artifact was uploaded because the five-family semantic acceptance condition was not met.

## Passed application evidence

Focused source gate:

- 13 suites passed;
- 100 tests passed;
- zero failed.

Complete inherited regression gate:

- 45 suites passed;
- 288 tests passed;
- zero failed.

Production build:

- compiled successfully;
- main bundle: `main.9e81dfce.js`;
- lazy importer worker: `guitar-eyes-guitar-pro-import.41d2fbeb.chunk.js`;
- alphaTab core remained in lazy chunks rather than the initial main bundle;
- no Bravura font, soundfont, SF2, SF3, alphaSynth, or audio-worklet artifact was emitted.

The compressed-MusicXML control-character repair and DEL-path regression passed both focused and complete gates.

## Passed external preparation

The gate:

1. cloned exact generator commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`;
2. applied only the three preflighted development-time corrections;
3. verified the three-file diff boundary;
4. compiled the corrected generator successfully; and
5. generated nonempty GP3, GP4, GP5, GPX, and GP7 files from one optimized original source.

## Exact semantic-audit result

- GP3 passed exact tuning, duration, rest, and note-coordinate parity.
- GP4 passed exact tuning, duration, rest, and note-coordinate parity.
- GP5 still failed in alphaTab `Gp3To5Importer.readPageSetup` with `EndOfReaderError`.
- GPX and GP7 were not reached because the strict audit stopped at GP5.

## Newly proven missing byte

The pinned writer's `write_rse_master_effect` writes:

1. four-byte master volume;
2. four-byte reserved or reverb value; and
3. only the ten equalizer knob bytes.

Total: 18 bytes.

alphaTab's GP5.1 reader skips 19 RSE master bytes before page setup:

1. four-byte master volume;
2. four-byte master effect value;
3. ten equalizer knobs; and
4. one equalizer gain or PRE byte.

The writer's shared `write_equalizer` function also omits the gain byte for track equalizers, while its own reader requests knob count plus gain.

## Required fourth external-only correction

In pinned external file:

`guitarpro/src/model/legacy/rse.rs`

`write_equalizer` must preserve its existing knob loop and then append exactly one signed byte encoded from `equalizer.gain` through the existing `pack_volume_value` function.

This correction must remain development-time fixture generation only. No external writer source or dependency may enter the Guitar Eyes runtime.

## Next gate

A generator-only correction gate may test the four exact external changes without repeating the already-passed application suite. It must:

1. apply the prior three corrections plus the equalizer-gain byte;
2. compile the pinned generator;
3. generate all five families;
4. independently enforce exact unsorted alphaTab semantics across every family;
5. upload the full evidence pack only if all five pass; and
6. preserve fork `main` and upstream authority.

A complete application gate will run again after the verified binary fixtures and provenance are committed to the feature branch.

## Repository authority

Fork `main` was restored immediately after the pending status exposed the run identifier. The upstream repository remained untouched. No pull request, merge, Pages publication, deployment, or runtime external-writer dependency was introduced.
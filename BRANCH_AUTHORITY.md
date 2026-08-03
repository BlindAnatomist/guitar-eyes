# Branch Authority — Real-World Guitar Pro Intake Foundation 1

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

State: `authorized implementation in progress`

## Exact ancestry

This branch was created directly from the accepted ASCII Extended-String Intake Checkpoint 2 closure head:

`d84a2433c54a9b96d3920af48b50776b54607280`

The accepted hosted format-only application source in its ancestry is:

`030e1f6af2de23e41ad993ab0292893b072664eb`

Documentation-only closure commits do not replace that application source.

The accepted application foundation before sampled-audio experimentation remains:

`51741c03a9eaa339940c84d53e0f0f00e6413a93`

No sampled-audio branch, Iowa sample implementation, WAV asset, playback control, audition control, sound-delay control, or temporary Iowa workflow may enter this branch.

## Authorized objective

Extend the existing bounded Guitar Pro importer so lawful original fixtures in these families can enter the same semantic reader route:

1. Guitar Pro 3 `.gp3`;
2. Guitar Pro 4 `.gp4`;
3. Guitar Pro 5 `.gp5`;
4. Guitar Pro 6 `.gpx`;
5. ordinary shared-archive `.gp` files with supported GP7 or GP8 version evidence.

The runtime decoder remains pinned `@coderline/alphatab` `1.8.4`, loaded lazily in the existing worker. alphaTab remains a low-level decoder only. Its model must be serialized into the existing bounded intermediate and discarded before Guitar Eyes normalization.

## Fixture provenance

The checkpoint may use `slundi/guitarpro` only as a development-time fixture generator, pinned to exact commit:

`2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`

That repository is MIT licensed and advertises writing GP3, GP4, GP5, GPX, and GP7 files.

The generator must not become a Guitar Eyes runtime dependency, browser bundle, worker dependency, second importer, or application architecture.

Every committed binary fixture must originate from project-authored or public-domain musical material, carry explicit provenance and license, and have deterministic semantic expectations.

## First bounded checkpoint

Foundation 1 may prove one small original cross-format score containing enough evidence to test:

1. six-string guitar tuning;
2. four-string bass tuning in a second track when the chosen generator supports it safely;
3. explicit track inventory and selection where multiple supported tracks exist;
4. measures and time signatures;
5. quarter, half, eighth, and whole durations;
6. open notes and fretted notes;
7. a chord onset;
8. a timed rest;
9. a small accepted technique subset only when preserved consistently across all generated formats;
10. exact normalization into the existing semantic document;
11. existing iPhone and desktop semantic readers;
12. format-only presentation with no playback surface.

A feature that cannot be generated and preserved consistently across the five families must be omitted from Foundation 1 rather than guessed.

## Required runtime changes

The checkpoint may:

1. make file detection distinguish GP3, GP4, GP5, GPX, and shared `.gp` families;
2. replace ZIP-only version inspection with format-specific version evidence;
3. route every authorized family through the existing lazy worker;
4. preserve container-independent declared source version in the intermediate;
5. retain existing byte, timeout, track, staff, bar, voice, beat, and note limits;
6. preserve explicit multi-track selection and track-count integrity where independent container evidence exists;
7. add format-specific corruption and unsupported-version errors;
8. generalize checkpoint-only names that would otherwise misrepresent accepted support;
9. update corpus, help, third-party, and status documentation honestly;
10. add automated fixture, decoder, normalizer, application, accessibility, and build-boundary tests.

## Prohibited scope

This branch must not add:

1. Guitar Pro 2 `.gtp` support;
2. blanket or universal Guitar Pro compatibility claims;
3. silent track selection;
4. best-effort guessing of string, fret, tuning, duration, voice, or track identity;
5. alphaTab rendering, notation fonts, score UI, cursors, alphaSynth, soundfonts, playback, or audio workers;
6. the MIT fixture generator as a runtime or npm dependency;
7. PowerTab, TuxGuitar, TablEdit, PDF, image, or OCR intake;
8. teacher mode;
9. a second musical or timing model;
10. a pull request, merge, upstream modification, or production release.

## Format-only surface

The accepted hosted interface must continue to omit:

1. Sound delay;
2. Audition current position;
3. Position audio;
4. playback instructions;
5. procedural or sampled sound output.

Previous position, Read current position, Next position, semantic descriptions, track selection, parsing notes, and durable Files-picker focus recovery remain authoritative.

## Safety and evidence rules

1. Inspect a failed decoder or workflow run before changing source or rerunning.
2. Do not use GitHub Actions as exploratory fixture-development loops.
3. Generate and inspect the fixture pack before the complete application gate.
4. Preserve every inherited test and add coverage.
5. Prove exact ancestry and bounded diff before any metered gate.
6. Verify the browser build contains no renderer, font, soundfont, audio, or fixture-generator artifact.
7. Require hosted real-iPhone VoiceOver acceptance before closing user-facing support.
8. Record the owner's observation exactly without strengthening it.
9. Restore fork `main` exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` after any temporary gate or publication workflow.

## Required continuity reading

Before implementation or verification, read:

1. `AGENTS.md`;
2. `docs/implementation-status.md`;
3. `docs/implementation-status-addendum-2026-08-03-extended-string-checkpoint-2.md`;
4. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
5. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
6. `docs/known-problems-register-addendum-execution-gates.md`;
7. `docs/solved-problems-and-reusable-procedures.md`;
8. `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`;
9. `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`;
10. `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`;
11. `fixtures/real-world/corpus-manifest.json`;
12. the Foundation 1 preflight; and
13. this file.

Where inherited files describe audible playback as current or legacy Guitar Pro as deferred, this authority supersedes those stale current-state statements only within this branch.
# Branch Authority — ASCII Extended-String Intake Checkpoint 2

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake-2`

State: `passed and closed`

Accepted hosted application source:

`030e1f6af2de23e41ad993ab0292893b072664eb`

Documentation-only closure commits do not replace that application source.

## Exact ancestry

This branch was created directly from the accepted Checkpoint 1 record head:

`592afad9bf55dd7eaf4e4713d2c5895aee4d7f9b`

The accepted format-only application source in its ancestry is:

`aca0cd79cc274ea598cc9e67c26e13e41e61011a`

The accepted application foundation before sampled-audio experimentation remains:

`51741c03a9eaa339940c84d53e0f0f00e6413a93`

No sampled-audio branch, Iowa sample implementation, WAV asset, sampled manifest, extraction script, gain experiment, or temporary Iowa workflow may enter this branch.

## Passed checkpoint

This branch added bounded semantic ASCII support for exactly:

1. standard eight-string guitar labeled high-to-low `E4 B3 G3 D3 A2 E2 B1 F#1`; and
2. standard six-string bass labeled high-to-low `C3 G2 D2 A1 E1 B0`.

Every string must carry its octave. The complete sequence must match the exact checkpoint profile and descend safely from highest pitch to lowest.

The Guitar/Bass selector remains a family selector. Eight-string guitar remains `Guitar family`. Six-string bass is detected automatically and changes the selector to `Bass family` when appropriate.

Automated verification, production build, hosted publication, live asset read-back, and real-iPhone VoiceOver acceptance passed. The owner's exact acceptance report is preserved in:

`docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md`

## Preserved format-only surface

This checkpoint preserves the accepted 4B format-only iPhone surface:

1. Previous position;
2. Read current position;
3. Next position;
4. current-position description and count;
5. block navigation when applicable;
6. parsing notes;
7. durable Files-picker focus recovery.

It does not render:

1. Sound delay;
2. Audition current position;
3. Position audio;
4. audition status;
5. playback instructions;
6. sampled or procedural sound output.

Existing playback code may remain as inert historical implementation but is not reachable from the accepted hosted checkpoint.

## Closed implementation boundary

The checkpoint changed only what was required to:

1. define the two exact profiles and string identities;
2. add project-authored CC0 fixtures;
3. add positive and adversarial tests;
4. update corpus and help documentation honestly;
5. preserve semantic and desktop projection through the existing importer;
6. publish a uniquely identified format-only acceptance candidate.

It did not add:

- arbitrary eight-string or six-string tunings;
- missing-octave inference;
- another instrument-family selector state;
- another parser or musical model;
- another timing model;
- a binary decoder;
- legacy Guitar Pro, PowerTab, TuxGuitar, or TablEdit support;
- teacher mode;
- playback or audition work;
- new dependencies;
- a pull request or merge.

## Safety rules preserved

1. Exact string count alone is not sufficient; tuning and octave evidence must match the profile.
2. Misordered, incomplete, duplicate, or alternate profiles fail safely with named errors.
3. Existing six-string guitar, seven-string guitar, four-string bass, and five-string bass behavior remains unchanged.
4. Every inherited test remains authoritative.
5. Fork `main` remains exactly `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Required continuity reading

Before later implementation or verification, read:

1. `AGENTS.md`;
2. `docs/implementation-status.md`;
3. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
4. `docs/tablature-intake-expansion-plan-2026-07-26.md`;
5. `docs/tablature-intake-expansion-checkpoint-1-audit.md`;
6. `fixtures/real-world/corpus-manifest.json`;
7. `docs/ascii-extended-string-intake-checkpoint-1-result-2026-08-03.md`;
8. `docs/ascii-extended-string-intake-checkpoint-2-result-2026-08-03.md`;
9. `docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md`; and
10. this file.

Where inherited records describe an older playback checkpoint or list supported extended-string families as deferred, this accepted checkpoint record supersedes those stale current-state statements.
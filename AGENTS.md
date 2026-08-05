# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

Last reconciled: August 5, 2026.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as the clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Do not open a pull request or merge any work branch without the owner's explicit authorization.
- Preserve failed and superseded branches as evidence; do not resume feature work from them.
- The accepted format-only operational baseline is `work/accepted-format-intake-convergence`.
- The clean accepted 4C base is `030e1f6af2de23e41ad993ab0292893b072664eb`.
- The clean convergence application source is `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`.
- Documentation-only closure commits do not replace an accepted application source.
- Future format investigation must begin on a new work branch created from the final documentation-closure head of `work/accepted-format-intake-convergence`, not from fork `main` and not from a historical development branch.

## Current product boundary

Guitar Eyes is currently a format-only semantic tablature reader.

The accepted baseline includes:

1. ASCII `.txt` and `.tab`:
   - six-string guitar within the accepted general profile;
   - seven-string guitar in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1`;
   - eight-string guitar in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1 F#1`;
   - four-string bass within the accepted general profile;
   - five-string bass in exact standard octave-qualified tuning `G2 D2 A1 E1 B0`;
   - six-string bass in exact standard octave-qualified tuning `C3 G2 D2 A1 E1 B0`.
2. Uncompressed `.musicxml` and `.xml` six-string guitar tablature within the accepted bounded profile.
3. Compressed MusicXML `.mxl` through the accepted compressed-import route.
4. Guitar Pro 3 `.gp3`.
5. Guitar Pro 4 `.gp4`.
6. Guitar Pro 5 `.gp5`.
7. Guitar Pro 6 `.gpx`.
8. Guitar Pro 7 shared `.gp` archives within the verified version-neutral intake boundary.

The Guitar Pro claim is bounded by the lawful project-authored five-file corpus, direct semantic parity tests, production verification, hosted read-back, and real-iPhone VoiceOver acceptance. It is not a claim of arbitrary compatibility with every Guitar Pro file.

Playback experiments, Iowa samples, procedural sound, playback controls, teacher mode, bookmarks, practice scoring, and AI instruction remain outside this accepted baseline.

## Required continuity reading

Before changing implementation, accessibility, repository administration, deployment, workflows, importers, dependencies, playback, teacher mode, or future AI work, read at minimum:

1. `BRANCH_AUTHORITY.md`;
2. `docs/implementation-status.md`;
3. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
4. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
5. `docs/known-problems-register-addendum-execution-gates.md`;
6. `docs/known-problems-register-addendum-semantic-convergence.md`;
7. `docs/solved-problems-and-reusable-procedures.md`;
8. `docs/shared-semantic-core-plan.md`;
9. `docs/shared-semantic-core-checkpoint-2.md`;
10. `docs/convergence-lineage-recovery-2026-07-26.md`;
11. `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`;
12. `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`;
13. `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`;
14. `docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md`;
15. `docs/real-world-guitar-pro-proof-5a-iphone-acceptance-2026-08-04.md`;
16. `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`;
17. `docs/accepted-format-intake-convergence-5b-real-iphone-acceptance-2026-08-04.md`;
18. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Read additional checkpoint records named by those files when the work touches their mechanism.

Do not rely on chat memory alone or rediscover a procedure already preserved in repository evidence.

## Accepted reader behavior is authoritative

Every future change must preserve:

- one shared semantic tablature document as the sole musical authority;
- automatic supported guitar and bass detection;
- multiple complete tablature blocks;
- accepted duration mapping and speech;
- aligned explicit measures;
- measure and position-within-measure speech;
- Previous position, Read current position, Next position in that relative order;
- quiet Previous and Next movement;
- quiet tablature-block movement;
- Read current position as the only action that announces full playing instructions;
- omission of ordinary unplayed strings from speech;
- speech for open strings, frets, explicit mute notation, attached techniques, rests, chords, and supported duration;
- durable iPhone Files-picker focus recovery for success and failure;
- no browser-level `accept` restriction that blocks selection before validation;
- Jason Washburn's recognizable desktop spatial concept and non-interception of VoiceOver Control+Option commands;
- explicit inventory and explicit selection for supported multi-track Guitar Pro files;
- no silent Guitar Pro track selection;
- selected-track details immediately before `Load selected track` in VoiceOver reading order;
- format/version identification that is evidence-based and never stronger than the verified source;
- no playback controls or playback language in the accepted format-only reader.

## Single semantic architecture

The semantic tablature document is the sole authority for source format, instrument, blocks, strings, positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop and iPhone may present that document differently, but neither may create a second musical interpretation.

Third-party decoders may decode source formats, but their models must remain behind importer boundaries. alphaTab rendering, alphaSynth playback, cursors, notation UI, notation fonts, soundfonts, renderer workers, audio worklets, and third-party playback models remain outside the accepted architecture.

## New-format rule

Recognition is not reading support.

A new format family requires its own bounded checkpoint with:

1. lawful, original, public-domain, or clearly licensed fixtures;
2. documented provenance and deterministic hashes;
3. source/version detection that does not guess;
4. normalization into the shared semantic document;
5. preservation of all accepted reader and focus contracts;
6. focused importer and semantic-parity tests;
7. the complete inherited suite;
8. a production build and asset-boundary inspection;
9. hosted proof only after source gates pass;
10. bounded real-iPhone VoiceOver acceptance before support is claimed;
11. a clean convergence or closure record before the next format family begins.

Do not mix multiple unproven format families into one implementation checkpoint.

## Deferred format families

Unless a later lawful checkpoint proves otherwise, the following remain unsupported:

- PowerTab `.ptb` and `.pt2`;
- TuxGuitar `.tg`;
- TablEdit `.tef`;
- arbitrary or unverified Guitar Pro files outside the accepted corpus and profiles;
- other proprietary or container formats not yet separately evaluated.

## Fixture and copyright policy

Use only original, public-domain, or clearly licensed evidence. Preserve fixture source, generation method, license, hashes, and deterministic verification. Do not copy an upstream fixture merely because surrounding source code is licensed.

## Zero-dollar automation

No paid GitHub usage, paid runner, paid service, or overage is authorized.

Use the least expensive capable environment. GitHub-hosted workflows are intentional checkpoints, not exploratory debugging loops. Before adding or expanding a workflow, follow `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Inspect a failed run before acting. Classify only the step that actually ran. Prefer named diagnostic assertions over opaque combined shell guards. Do not use Actions bot commits as ordinary implementation transport.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone VoiceOver acceptance when a user-facing mechanism changes. Record the owner's exact observation without strengthening it.

Use the committed-target focus, native-picker return, accessible build identity, speech-separation, ordinary reading-order, source-lineage, and version-neutral format solutions already recorded in repository memory.

Do not bring John into dependency setup, source implementation, automated testing, build verification, artifact inspection, or non-UI engine work. Bring him in only after a stable exact hosted candidate requires real-iPhone VoiceOver judgment.

Jason Washburn's desktop testing remains optional unless he agrees to participate. His absence is not an active blocker.

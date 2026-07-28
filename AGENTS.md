# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as a clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Do not open a pull request or merge any work branch without the owner's explicit authorization.
- Preserve `work/iphone-voiceover-tablature-audit` as evidence of the failed diverged convergence attempt. Do not continue feature work there.
- Preserve `work/convergence-from-accepted-semantic-core` as the accepted convergence record.
- The completed tablature-intake record is `work/tablature-intake-expansion` at `aa302dcee880df4a0947d3e374171554e4855022`.
- The current branch is `work/playback-timing-foundation`.
- Documentation-only closure commits do not replace an accepted application or engine source.

## Accepted source identities

- Shared semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
- Verified, hosted, and real-iPhone-accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`.
- Verified ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`.
- Verified uncompressed MusicXML source: `715547a123b2a6e862a8020858df96cb34c63526`.
- Verified, hosted, and real-iPhone-accepted Guitar Pro application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- Verified Playback Timing Foundation 1 engine source: `2b038b15afa09877f6d8dcf615bc060243578096`.

## Required continuity reading

Before changing implementation, accessibility, repository administration, deployment, workflows, importers, dependencies, playback, teacher mode, or future AI work, read:

1. `docs/implementation-status.md`;
2. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
3. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
4. `docs/known-problems-register-addendum-execution-gates.md`;
5. `docs/solved-problems-and-reusable-procedures.md`;
6. `docs/shared-semantic-core-plan.md`;
7. `docs/shared-semantic-core-implementation.md`;
8. `docs/real-world-tab-format-corpus-checkpoint-1.md`;
9. `docs/rhythm-duration-checkpoint-1.md`;
10. `docs/measure-recognition-checkpoint-1.md`;
11. `docs/convergence-lineage-recovery-2026-07-26.md`;
12. `docs/convergence-recovery-source-checkpoint-1.md`;
13. `docs/convergence-recovery-local-execution-gate-2026-07-26.md`;
14. `docs/convergence-recovery-publication-result-2026-07-26.md`;
15. `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`;
16. `docs/tablature-intake-expansion-plan-2026-07-26.md`;
17. `docs/tablature-intake-expansion-checkpoint-1-audit.md`;
18. `docs/ascii-intake-expansion-checkpoint-1-result-2026-07-26.md`;
19. `docs/musicxml-intake-checkpoint-2-result-2026-07-26.md`;
20. `docs/musicxml-intake-checkpoint-2-publication-2026-07-26.md`;
21. `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`;
22. `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`;
23. `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`;
24. `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`;
25. `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
26. `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`;
27. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a procedure already preserved in repository evidence.

## Accepted reader behavior is authoritative

Every future change must preserve:

- automatic supported guitar and bass detection;
- multiple complete tablature blocks;
- W, H, Q, E, and S duration mapping and speech;
- aligned explicit measures;
- measure and position-within-measure speech;
- Previous position, Read current position, Next position in that order;
- quiet Previous and Next movement;
- quiet tablature-block movement;
- Read current position as the only action that announces full playing instructions in a semantic reader;
- omission of ordinary unplayed strings from speech;
- speech for open strings, frets, explicit mute notation, attached techniques, rests, chords, and supported duration;
- durable iPhone Files-picker focus recovery for success and failure;
- no browser-level `accept` restriction that blocks selection before validation;
- Jason Washburn's recognizable desktop spatial concept and non-interception of VoiceOver Control+Option commands;
- explicit inventory and explicit selection for supported multi-track Guitar Pro archives;
- no silent track selection;
- selected-track details immediately before `Load selected track` in VoiceOver reading order.

## Single semantic and temporal architecture

The semantic tablature document is the sole musical authority for source format, instrument, blocks, strings, positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop, iPhone, timing, teacher mode, and future playback may present or consume that document differently, but none may create a second musical interpretation.

The accepted playback timeline is the sole deterministic temporal projection of the semantic document. Teacher mode and audible playback must consume that timeline rather than recalculate timing independently.

A third-party parser may decode a source format, but its model must not escape the importer boundary. alphaTab rendering, alphaSynth playback, cursors, notation UI, notation fonts, soundfonts, renderer workers, audio worklets, and third-party playback models are outside the architecture unless a later owner-authorized checkpoint explicitly changes that boundary.

## Accepted tablature intake

### ASCII

Exact source `08f8ab16135570d0e53b829daa5c153a15751a45` supports verified six-string guitar and four-string bass ASCII, multiple blocks, duration lines, explicit measures, custom tuning, attached techniques, and safe unsupported-string-count recognition.

### MusicXML

Uncompressed `score-partwise` MusicXML is accepted within the bounded six-string guitar profile recorded in `docs/implementation-status.md`, including exact duration, measures, chord onsets, timed rests, supported technical notation, picker selection, picker-return focus, and quiet navigation.

### Guitar Pro

Exact source `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d` is accepted only for the verified project-authored `.gp` shared archives containing GP8 semantic evidence.

The accepted Guitar Pro route uses alphaTab `1.8.4` only as a lazy low-level decoder, transfers a bounded serializable intermediate, supports verified four-string bass and six-string guitar tracks, requires explicit multi-track selection, cross-checks archive track count, reuses the accepted intermediate after selection, and emits no renderer, notation font, soundfont, player, or audio machinery.

Do not claim general GP7 support, GP3 through GP6 support, or arbitrary `.gp` compatibility.

## Passed checkpoint: Playback Timing Foundation 1

Exact accepted engine source: `2b038b15afa09877f6d8dcf615bc060243578096`.

Result record:

- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.

The accepted pure timing engine:

1. consumes only the semantic tablature document;
2. preserves source position order;
3. accepts integer tempo from 20 through 300 BPM;
4. uses an explicit checkpoint default of 120 BPM;
5. preserves or reconstructs exact reduced quarter-note fractions;
6. treats chords as one onset and rests as timed positions;
7. calculates position, measure, and document offsets;
8. exposes quarter-note fractions, quarter-note units, and milliseconds;
9. reports source-order playback without repeat expansion;
10. rejects missing or unsafe duration rather than guessing;
11. does not mutate the semantic document;
12. imports no React, browser, worker, renderer, player, or audio dependency.

Verification run `30383944688` passed exact source checkout, the complete inherited and new automated suite, optimized production build, and source/asset boundary inspection. Fork `main` was restored exactly afterward.

## Current decision boundary

No new implementation checkpoint is authorized after Timing Foundation 1 until the owner chooses and approves a separate plan.

The next plan may address one of two routes:

1. an audible playback-output foundation that consumes the accepted timeline; or
2. a non-audio teacher-mode foundation that consumes the accepted semantic document and timeline.

Do not begin either route, playback controls, automatic navigation, focus behavior, looping, bookmarks, practice scoring, repeat expansion, tempo extraction, tempo maps, count-in, swing, or additional format work without a new bounded checkpoint.

## Deferred format work

The following are not imported unless a later lawful, verified checkpoint says otherwise:

- five-string bass ASCII;
- seven-string guitar ASCII;
- compressed MusicXML `.mxl`;
- Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx`;
- arbitrary or unverified `.gp` files;
- PowerTab `.ptb` and `.pt2`;
- TuxGuitar `.tg`;
- TablEdit `.tef`.

Recognition must never be described as reading support.

## Fixture and copyright policy

Use only original, public-domain, or clearly licensed evidence. Preserve project-authored fixture source, generation method, license, and deterministic verification. Do not copy an upstream fixture merely because source code around it is licensed.

## Zero-dollar automation

No paid GitHub usage, paid runner, paid service, or overage is authorized.

Use the least expensive capable environment. GitHub-hosted workflows are intentional checkpoints, not an exploratory debugging loop. Before adding or expanding a workflow, follow `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Inspect a failed run before acting. Classify only the step that actually ran. Prefer named diagnostic assertions over opaque combined shell guards. Do not use Actions bot commits as ordinary implementation transport.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone VoiceOver acceptance when a user-facing mechanism changes. Record the owner's exact observation without strengthening it.

Use the committed-target focus, native-picker return, accessible build identity, speech-separation, and ordinary reading-order solutions already recorded in the known-problems ledgers.

Do not bring John into dependency setup, source implementation, automated testing, build verification, artifact inspection, or non-UI engine work. Bring him in only after a stable hosted user-facing candidate requires real-iPhone judgment.

Jason Washburn's desktop testing remains optional unless he agrees to participate. His absence is not an active blocker.
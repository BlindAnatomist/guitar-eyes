# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as a clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- The accepted iPhone, rhythm, measure, and shared-core foundation is `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
- The verified, hosted, and real-iPhone-accepted convergence source is `72159d25958fffd941c95351c6781cf579e1d622`.
- The verified ASCII intake expansion source is `08f8ab16135570d0e53b829daa5c153a15751a45`.
- The verified uncompressed MusicXML implementation source is `715547a123b2a6e862a8020858df96cb34c63526`.
- The verified, hosted, and real-iPhone-accepted Guitar Pro application source is `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- The completed tablature-intake branch record is `work/tablature-intake-expansion` at `aa302dcee880df4a0947d3e374171554e4855022`.
- The current implementation branch is `work/playback-timing-foundation`, created exactly from that completed intake record.
- Documentation-only commits after an accepted application source do not replace its implementation identity.
- Preserve `work/convergence-from-accepted-semantic-core` as the accepted convergence record.
- Preserve `work/iphone-voiceover-tablature-audit` as evidence of the failed diverged convergence attempt. Do not continue feature repair there.
- Do not open a pull request or merge any work branch without the owner's explicit authorization.

## Required continuity reading

Before changing implementation, accessibility behavior, repository administration, GitHub Pages, workflows, importers, dependencies, playback, teacher mode, or future AI work, read:

1. `docs/implementation-status.md`;
2. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
3. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
4. `docs/solved-problems-and-reusable-procedures.md`;
5. `docs/shared-semantic-core-plan.md`;
6. `docs/shared-semantic-core-implementation.md`;
7. `docs/real-world-tab-format-corpus-checkpoint-1.md`;
8. `docs/rhythm-duration-checkpoint-1.md`;
9. `docs/measure-recognition-checkpoint-1.md`;
10. `docs/convergence-lineage-recovery-2026-07-26.md`;
11. `docs/convergence-recovery-source-checkpoint-1.md`;
12. `docs/convergence-recovery-local-execution-gate-2026-07-26.md`;
13. `docs/convergence-recovery-publication-result-2026-07-26.md`;
14. `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`;
15. `docs/tablature-intake-expansion-plan-2026-07-26.md`;
16. `docs/tablature-intake-expansion-checkpoint-1-audit.md`;
17. `docs/ascii-intake-expansion-checkpoint-1-result-2026-07-26.md`;
18. `docs/musicxml-intake-checkpoint-2-result-2026-07-26.md`;
19. `docs/musicxml-intake-checkpoint-2-publication-2026-07-26.md`;
20. `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`;
21. `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`;
22. `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`;
23. `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`;
24. `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
25. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a repository, deployment, accessibility, workflow, format-import, licensing, dependency, timing, or evidence procedure that is already recorded.

## Accepted reader behavior is authoritative

Every future change must preserve:

- automatic supported guitar and bass detection;
- multiple complete tablature blocks;
- W, H, Q, E, and S duration mapping and speech;
- aligned explicit measure recognition;
- measure and position-within-measure speech;
- Previous position, Read current position, Next position in that order;
- quiet Previous and Next movement;
- quiet tablature-block movement;
- Read current position as the only action that announces full playing instructions in a semantic reader;
- omission of ordinary unplayed strings from speech;
- continued speech for open strings, frets, explicit mute notation, attached techniques, rests, chords, and supported duration;
- durable iPhone Files-picker focus recovery for success and failure;
- no browser-level `accept` restriction that prevents iPhone users from selecting a file before Guitar Eyes can validate it;
- Jason Washburn's recognizable desktop spatial concept and non-interception of VoiceOver Control+Option commands;
- explicit track inventory for a supported multi-track Guitar Pro archive;
- no silent track selection;
- a persistent selected-track summary immediately before `Load selected track` in VoiceOver reading order.

## Semantic architecture

The semantic tablature document is the sole authority for source format, instrument identity, blocks, strings, synchronized positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop, iPhone, timing, teacher mode, and future playback may present or consume that document differently, but none may create a second musical interpretation. Every supported importer must normalize into the same document rather than add format-specific musical logic to a reader, teacher, or player.

A punctuation mark or technique character must not become a musical position merely because it occupies a source column. Frets, open strings, explicit muted notes, and structured timed rests may create positions. Deterministic techniques may attach to notes. Unsupported material must remain preserved and warned without manufacturing steps.

A third-party parser may decode a source format, but its model must not escape the importer boundary. Guitar Eyes must convert decoded data into a small serializable intermediate and then into the accepted semantic document.

alphaTab rendering, alphaSynth playback, cursors, notation UI, notation fonts, soundfonts, renderer workers, audio worklets, and third-party playback models are not part of the Guitar Eyes architecture.

## Accepted tablature intake

### ASCII

Exact source `08f8ab16135570d0e53b829daa5c153a15751a45` supports verified six-string guitar and four-string bass ASCII, multiple blocks, duration lines, explicit measures, custom tuning preservation, attached techniques, and safe unsupported-string-count recognition.

### MusicXML

Uncompressed `score-partwise` MusicXML is accepted within the bounded six-string guitar profile recorded in `docs/implementation-status.md`. It includes exact duration, measures, simultaneous chord onsets, timed rests, supported technical notation, picker selection, picker-return focus, and quiet navigation.

### Guitar Pro

Exact application source `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d` is accepted only for the verified project-authored `.gp` shared archives containing GP8 semantic evidence.

The accepted Guitar Pro route:

1. pins `@coderline/alphatab` at `1.8.4` as a lazy low-level decoder;
2. decodes in a dedicated worker;
3. transfers only a bounded serializable intermediate;
4. supports verified six-string guitar and four-string bass tracks;
5. preserves exact durations, rests, chords, measures, tuning, and supported techniques;
6. exposes an accessible track inventory for genuine multi-track archives;
7. begins with no selected track;
8. disables `Load selected track` until an explicit choice exists;
9. cross-checks archive-declared track count against decoder output;
10. rejects a persistent mismatch rather than silently accepting incomplete data;
11. reuses the accepted intermediate after track selection without decoding a second time;
12. keeps selected-track details immediately before the load action in ordinary reading order;
13. contains no renderer, notation font, soundfont, player, or audio machinery.

Do not claim general GP7 support, GP3 through GP6 support, or arbitrary `.gp` compatibility from these fixtures.

## Current authorized checkpoint: Playback Timing Foundation 1

Implement one pure, deterministic, non-audio timing engine on `work/playback-timing-foundation`.

The authoritative plan is:

- `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`.

The checkpoint may:

1. consume only the accepted semantic tablature document;
2. preserve existing position order;
3. accept a bounded quarter-note tempo from 20 through 300 beats per minute;
4. use 120 beats per minute as the explicit checkpoint default when no tempo option is provided;
5. derive exact reduced duration fractions from existing semantic duration evidence;
6. treat chords as one onset and rests as timed positions;
7. calculate cumulative position, measure, and document offsets;
8. expose finite millisecond values derived from exact musical fractions;
9. report source-order playback without repeat expansion;
10. reject missing or unsafe duration rather than guessing;
11. add direct unit tests;
12. run the complete inherited test suite and production build once after source review.

The checkpoint must not add:

- sound;
- Web Audio;
- MIDI synthesis;
- samples;
- alphaSynth;
- playback controls;
- reader auto-advance;
- focus movement;
- a visual cursor;
- looping;
- bookmarks;
- teacher mode;
- practice scoring;
- repeat expansion;
- source tempo extraction;
- tempo maps;
- swing interpretation;
- new format support;
- a second musical model.

No hosted Pages preview or real-iPhone acceptance is required for this engine-only checkpoint because it changes no user interface, speech, focus, picker behavior, or hosted interaction. Any later UI or audio checkpoint requires its own plan and acceptance boundary.

## Deferred format work

The following remain recognized or planned but are not imported unless a later lawful, verified checkpoint says otherwise:

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

Do not copy arbitrary tablature fixtures into Guitar Eyes. Original, public-domain, or clearly licensed evidence is required before claiming support for a format or version.

At least one reviewed upstream GP5 fixture contains a commercial-song transcription and remains unsuitable regardless of the alphaTab source-code license.

Project-authored fixtures must preserve their source text, generation method, license statement, and deterministic verification evidence.

## Zero-dollar automation

No paid GitHub usage is authorized. Do not weaken the account's $0 Actions hard stop, use a paid runner, introduce a paid service, or ask the owner to authorize overages.

Run available checks in the least expensive capable environment. Batch coherent verified changes. GitHub-hosted workflows are intentional checkpoints, not an exploratory debugging loop.

Before adding or materially expanding a workflow, follow `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md` and record purpose, trigger, duration, runner, timeout, retention, permissions, duplication analysis, and repository-authority protection.

For a failed Actions run, inspect the failed job and logs before acting. Rerun only the failed or newly corrected gate when possible. Preserve successful evidence rather than repeating it.

Do not use GitHub Actions bot commits as ordinary implementation transport.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone Safari and VoiceOver acceptance when a user-facing accessibility mechanism changes.

Record the owner's exact observation without strengthening or rewriting it.

Use the committed-target focus, native-picker return, accessible build identity, speech-separation, and ordinary reading-order solutions already recorded in the known-problems ledgers.

Do not bring John into dependency setup, fixture generation, source implementation, automated testing, build verification, artifact inspection, or non-UI engine work. Bring him in only when a stable hosted candidate requires real-iPhone judgment.

Jason Washburn's desktop testing remains optional unless he agrees to participate. His absence is not an active blocker.
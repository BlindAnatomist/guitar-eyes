# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as a clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Do not open a pull request or merge any work branch without the owner's explicit authorization.
- Preserve `work/iphone-voiceover-tablature-audit` as evidence of the failed diverged convergence attempt. Do not continue feature work there.
- Preserve `work/convergence-from-accepted-semantic-core` as the recovered desktop/iPhone convergence record.
- Preserve completed historical format, timing, and audible-output branches as evidence.
- The current accepted integration branch is `work/mxl-audition-convergence`.
- The current accepted application source is `51741c03a9eaa339940c84d53e0f0f00e6413a93`.
- Documentation-only closure commits do not replace an accepted application or engine source.

## Accepted source identities

- Shared semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
- Hosted and real-iPhone-accepted desktop/iPhone convergence source: `72159d25958fffd941c95351c6781cf579e1d622`.
- Verified ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`.
- Verified uncompressed MusicXML source: `715547a123b2a6e862a8020858df96cb34c63526`.
- Hosted and real-iPhone-accepted Guitar Pro source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- Verified Playback Timing Foundation 1 engine source: `2b038b15afa09877f6d8dcf615bc060243578096`.
- Verified compressed-MusicXML audition convergence source: `7c4ac3d20fbb1d1abc547d30039599804bfdbd7e`.
- Hosted and real-iPhone-accepted first-audition focus repair source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`.

## Required continuity reading

Before changing implementation, accessibility, repository administration, deployment, workflows, importers, dependencies, playback, teacher mode, or future AI work, read:

1. `docs/implementation-status.md`;
2. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
3. `docs/mxl-audition-first-focus-repair-real-iphone-acceptance-2026-07-31.md`;
4. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
5. `docs/known-problems-register-addendum-execution-gates.md`;
6. `docs/solved-problems-and-reusable-procedures.md`;
7. `docs/shared-semantic-core-plan.md`;
8. `docs/shared-semantic-core-implementation.md`;
9. `docs/real-world-tab-format-corpus-checkpoint-1.md`;
10. `docs/rhythm-duration-checkpoint-1.md`;
11. `docs/measure-recognition-checkpoint-1.md`;
12. `docs/convergence-lineage-recovery-2026-07-26.md`;
13. `docs/convergence-recovery-source-checkpoint-1.md`;
14. `docs/convergence-recovery-local-execution-gate-2026-07-26.md`;
15. `docs/convergence-recovery-publication-result-2026-07-26.md`;
16. `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`;
17. `docs/tablature-intake-expansion-plan-2026-07-26.md`;
18. `docs/tablature-intake-expansion-checkpoint-1-audit.md`;
19. `docs/ascii-intake-expansion-checkpoint-1-result-2026-07-26.md`;
20. `docs/musicxml-intake-checkpoint-2-result-2026-07-26.md`;
21. `docs/musicxml-intake-checkpoint-2-publication-2026-07-26.md`;
22. `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`;
23. `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`;
24. `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`;
25. `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`;
26. `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
27. `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`;
28. `docs/audible-playback-output-foundation-checkpoint-1-plan-2026-07-28.md`;
29. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a procedure already preserved in repository evidence.

## Accepted reader behavior is authoritative

Every future change must preserve:

- automatic supported guitar and bass detection;
- multiple complete tablature blocks;
- W, H, Q, E, and S duration mapping and speech;
- aligned explicit measures;
- measure and position-within-measure speech;
- Previous position, Read current position, Next position in that exact relative order;
- Audition current position after Next, outside the navigation group;
- future measure or bar playback after Audition rather than between the navigation controls;
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
- selected-track details immediately before `Load selected track` in VoiceOver reading order;
- a two-second default sound delay;
- no reader-position movement during audition;
- stable VoiceOver focus during audition;
- a one-use, target-specific, self-clearing first-audition focus repair that does not trap later movement.

## Single semantic and temporal architecture

The semantic tablature document is the sole musical authority for source format, instrument, blocks, strings, positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop, iPhone, timing, future measure playback, teacher mode, and audible playback may present or consume that document differently, but none may create a second musical interpretation.

The accepted playback timeline is the sole deterministic temporal projection of the semantic document. Future measure playback, teacher mode, and full playback must consume that timeline rather than recalculate timing independently.

A third-party parser may decode a source format, but its model must not escape the importer boundary. alphaTab rendering, alphaSynth playback, cursors, notation UI, notation fonts, soundfonts, renderer workers, audio worklets, and third-party playback models remain outside the architecture.

## Accepted tablature intake

### ASCII

Exact source `08f8ab16135570d0e53b829daa5c153a15751a45` supports verified six-string guitar and four-string bass ASCII, multiple blocks, duration lines, explicit measures, custom tuning evidence, attached techniques, and safe unsupported-string-count recognition.

### MusicXML

Exact source `715547a123b2a6e862a8020858df96cb34c63526` supports bounded uncompressed `score-partwise` MusicXML with explicit six-string guitar tablature evidence, exact duration, measures, chord onsets, timed rests, supported technical notation, picker selection, picker-return focus, and quiet navigation.

### Compressed MusicXML

Exact accepted application source `51741c03a9eaa339940c84d53e0f0f00e6413a93` supports bounded `.mxl` extraction, safe container resolution, and reuse of the accepted uncompressed MusicXML importer and shared semantic document.

Do not create a second MusicXML parser or weaken archive safety limits.

### Guitar Pro

Exact source `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d` is accepted only for the verified project-authored `.gp` shared archives containing GP8 semantic evidence.

The accepted Guitar Pro route uses alphaTab `1.8.4` only as a lazy low-level decoder, transfers a bounded serializable intermediate, supports verified four-string bass and six-string guitar tracks, requires explicit multi-track selection, cross-checks archive track count, reuses the accepted intermediate after selection, and emits no renderer, notation font, soundfont, player, or audio machinery.

Do not claim general GP7 support, GP3 through GP6 support, or arbitrary `.gp` compatibility.

## Accepted audible current-position behavior

The accepted application may:

1. derive current-position pitch events from semantic string identity and accepted timing evidence;
2. use explicit tuning MIDI, explicit tuning plus octave, or exact accepted standard guitar and bass tuning profiles;
3. reject custom tuning without octave evidence rather than guess;
4. create a project-owned procedural plucked-string sound through native Web Audio;
5. create or resume the audio context only during explicit owner activation;
6. audition one current semantic position;
7. schedule chord strings at one onset;
8. preserve rests as silent outcomes with explicit status;
9. render explicit muted notes as short non-pitched events;
10. stop prior audition nodes before repeated audition or navigation;
11. preserve reader position and VoiceOver focus;
12. wait two seconds by default before sound begins;
13. restore first-use focus only from the known stale heading targets through the accepted one-use guard.

The accepted application must not add without a separate bounded assignment:

- full-document playback;
- Play, Pause, Stop, seeking, scrubber, or progress controls;
- automatic reader progression;
- looping;
- metronome or count-in;
- source tempo extraction;
- repeat expansion;
- technique-specific synthesis;
- sampled instruments;
- alphaSynth;
- soundfonts;
- AudioWorklets;
- renderer workers;
- third-party playback libraries;
- teacher mode;
- practice scoring;
- bookmarks;
- AI work;
- additional file formats;
- a second musical model.

A future `Play current measure` or `Play current bar` checkpoint may be considered, but it is not implemented or authorized by the 1G closure.

## First-audition focus authority

Exact accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`.

Detailed evidence:

- `docs/mxl-audition-first-focus-repair-real-iphone-acceptance-2026-07-31.md`;
- `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`, GE-013.

The mechanism is not a focus trap. It is armed only for first auditioner creation, restores only from the stale reader or test-build headings, clears after the first relevant transition or timeout, and leaves intentional movement untouched.

The owner accepted the hosted real-iPhone result with: `OK, all of that worked. It stayed focused.`

## Deferred format work

The following are not imported unless a later lawful, verified checkpoint says otherwise:

- five-string bass ASCII;
- seven-string guitar ASCII;
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

Audio must begin only from explicit owner activation. The audition action must retain a stable name, must not move reader position, and must not trap focus. Status speech must remain separate from the full-position announcement channel.

Use the committed-target focus, native-picker return, accessible build identity, speech-separation, first-initialization focus, and ordinary reading-order solutions already recorded in the known-problems ledger.

Do not bring John into dependency setup, source implementation, automated testing, build verification, artifact inspection, or non-UI engine work. Bring him in only after a stable exact hosted candidate requires real-iPhone audibility or VoiceOver judgment.

Jason Washburn's desktop testing remains optional unless he agrees to participate. His absence is not an active blocker.

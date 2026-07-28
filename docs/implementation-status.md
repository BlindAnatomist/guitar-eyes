# Guitar Eyes Implementation Status

Last updated: July 28, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current implementation branch: `work/audible-playback-output-foundation`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Verified, hosted, and real-iPhone-accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`

Verified ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Verified MusicXML source: `715547a123b2a6e862a8020858df96cb34c63526`

Verified, hosted, and real-iPhone-accepted Guitar Pro application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

Verified Playback Timing Foundation 1 engine source: `2b038b15afa09877f6d8dcf615bc060243578096`

Completed playback-timing record: `work/playback-timing-foundation` at `b0f6ad7c801b26b8f5e26407ac835a17668cbbdd`

Fork `main` remains exactly reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Governing architecture

Guitar Eyes is one musical system with one semantic tablature document and one deterministic temporal projection:

1. iPhone presents semantic musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same positions spatially as strings by synchronized positions.
3. Every supported importer normalizes into the same semantic document.
4. The playback-timing engine consumes the semantic document without reparsing a source format.
5. Audible output consumes the same semantic string identity and accepted timeline.
6. Teacher mode must consume those same authorities.
7. No reader, teacher, player, or format may create a second musical or timing interpretation.
8. Third-party decoder models remain behind importer adapters and do not become the application architecture.

## Accepted reader contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position in that relative order.
2. Quiet position and block movement.
3. Read current as the only action that announces full playing instructions.
4. Omission of ordinary unplayed strings.
5. Speech for open strings, frets, explicit muted notes, attached techniques, chords, rests, and supported duration.
6. W, H, Q, E, and S duration mapping for supported ASCII.
7. Measure and position-within-measure speech.
8. Multiple tablature blocks.
9. Automatic supported four-string bass and six-string guitar detection.
10. Native iPhone Files-picker focus recovery.
11. No browser-level upload filter that blocks selection before validation.
12. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.
13. Explicit inventory and selection for supported multi-track Guitar Pro archives.
14. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
15. Timing derived from the semantic document rather than raw display text.
16. Safe rejection instead of guessed duration or pitch.
17. Audible output only after explicit owner activation.
18. Audition must not move reader position or VoiceOver focus.

## Passed convergence recovery checkpoint 1

Exact source: `72159d25958fffd941c95351c6781cf579e1d622`

Evidence:

1. 17 of 17 automated suites.
2. 81 of 81 automated tests.
3. Production build and compiled-artifact checks.
4. Corrected Pages publication and hosted read-back.
5. Exact restoration of fork `main`.
6. Real-iPhone Safari and VoiceOver acceptance.

Jason Washburn's optional desktop acceptance remains deferred unless he agrees to participate. His absence is not an active blocker.

## Passed ASCII intake checkpoint 1

Exact source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Accepted capability includes six-string guitar and four-string bass, multiple blocks, optional octave labels, accidentals, custom tuning, frets, open and muted notes, deterministic attached techniques, W/H/Q/E/S rhythm lines, explicit aligned measures, false-position prevention, unsupported string-count recognition, and prose false-positive prevention.

Verification:

- 18 of 18 suites;
- 101 of 101 tests;
- production build;
- compiled-fragment checks.

## Passed MusicXML intake checkpoint 2

Exact verified implementation source: `715547a123b2a6e862a8020858df96cb34c63526`

Accepted scope is uncompressed `score-partwise` MusicXML with one unambiguous six-string guitar tablature part, explicit tuning, explicit string/fret coordinates, single-voice sequential timing, measures, exact duration, chord onsets, timed rests, and supported technical notation.

Evidence includes importer and picker-repair suites, production builds, hosted read-back, real-iPhone file selection, picker-return focus, note and duration mapping, chord and rest speech, quiet navigation, and exact restoration of fork `main`.

Detailed record:

- `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`.

## Passed Guitar Pro shared-archive checkpoint 3

Exact accepted application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

Accepted bounded capability:

1. Project-authored single-track `.gp` archive with GP8 semantic evidence loads as six-string guitar.
2. Project-authored two-track `.gp` archive exposes Proof Guitar and Proof Bass.
3. No track is silently selected.
4. `Load selected track` remains disabled until explicit selection.
5. Explicit bass selection normalizes into the shared semantic document.
6. The accepted intermediate is reused after selection without a second alphaTab decode.
7. Archive-declared track count is cross-checked against decoder output.
8. The separate Guitar/Bass selector does not filter Guitar Pro tracks.
9. Selected-track details immediately precede the load action in VoiceOver order.
10. The route remains lazy and contains no renderer, notation fonts, soundfonts, player, renderer workers, or audio worklets.

Evidence includes the direct binary gate, 3E archive-integrity and explicit-selection verification, successful real-iPhone Proof Bass loading, 3F reading-order verification, and the owner's exact 3F result: `That worked`.

Detailed records:

- `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`;
- `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`;
- `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`.

## Passed Playback Timing Foundation 1

Exact accepted engine source: `2b038b15afa09877f6d8dcf615bc060243578096`

State: `passed`

Accepted capability:

1. Pure `buildPlaybackTimeline` engine consumes only the semantic document.
2. Output is schema-versioned `playback-timeline` data.
3. Existing position and block order are preserved.
4. Tempo accepts integer 20–300 BPM.
5. 120 BPM is the explicit checkpoint default.
6. Tempo source is recorded as explicit or checkpoint default.
7. Guitar Pro exact fractions are preferred.
8. MusicXML duration fractions are reconstructed from divisions.
9. Accepted decimal quarter-note units are reduced exactly when no stronger evidence exists.
10. Exact reduced fractions drive cumulative musical time.
11. Chords remain one onset.
12. Rests consume their duration.
13. Position, measure, and total offsets are exposed as fractions, quarter-note units, and milliseconds.
14. Playback order is `source-order`.
15. Repeats and alternate endings are not expanded.
16. Missing or unsafe duration rejects with stable error codes.
17. The semantic document is not mutated.
18. The module imports no React, browser, worker, renderer, player, or audio dependency.

Verification:

1. Exact successful run: `30383944688`.
2. Complete inherited and new automated suite passed.
3. Optimized production build compiled successfully.
4. Exact five-file source boundary passed.
5. No forbidden soundfont, audio-worklet, synth-worker, renderer-worker, or Bravura asset was emitted.
6. Fork `main` was restored and independently verified identical to clean authority.

Detailed records:

- `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.

## Current authorized checkpoint: Audible Playback Output Foundation 1

Plan:

- `docs/audible-playback-output-foundation-checkpoint-1-plan-2026-07-28.md`.

State: `implementation-in-progress`

Current bounded source includes:

1. `buildPositionSoundEvents`, a pure adapter from one semantic position and accepted timeline to pitched, muted, or rest sound events;
2. exact standard six-string guitar and four-string bass pitch profiles;
3. explicit tuning MIDI and explicit tuning-plus-octave support;
4. rejection of custom tuning without octave evidence;
5. fret-to-MIDI transposition and frequency derivation;
6. chord strings scheduled at one semantic onset;
7. explicit muted strings represented without invented pitch;
8. one project-owned procedural plucked-string Web Audio engine;
9. lazy `AudioContext` creation or resume only inside explicit audition;
10. prior-node cleanup before repeated audition or reader navigation;
11. one stable `Audition current position` action between Read current and Next;
12. a persistent restrained audition status separate from full-position speech;
13. no reader-position or focus movement;
14. direct engine, adapter, reader, and accepted-corpus tests;
15. an in-reader proof identity: `Audible current-position procedural plucked-string proof 1A`.

Required source gate before John:

1. exact branch-head and bounded-diff verification;
2. complete inherited and new automated suite;
3. optimized production build;
4. source and build inspection proving no alphaSynth, soundfont, sample asset, audio worklet, renderer worker, or new third-party playback dependency;
5. exact temporary Pages publication and live asset read-back;
6. restoration of fork `main`;
7. bounded real-iPhone audition test using `musicxml-chord-rest-two-measures.musicxml`.

The iPhone acceptance must establish only:

1. explicit activation produces audible sound for a pitched note or chord;
2. a chord is perceived as simultaneous rather than sequential;
3. a semantic rest reports that no pitched sound was played;
4. repeated audition stops and replaces the prior sound without moving the reader;
5. VoiceOver focus remains on `Audition current position`;
6. Previous and Next remain quiet;
7. Read current remains the only full-position instruction action.

This checkpoint does not establish full-document playback, realistic guitar or bass timbre, technique-specific synthesis, looping, transport controls, automatic reader progression, tempo controls, repeat expansion, teacher mode, or practice scoring.

## Current format support

### Actually imported into the semantic document

1. ASCII `.txt` and `.tab` six-string guitar.
2. ASCII `.txt` and `.tab` four-string bass.
3. Uncompressed `.musicxml` and `.xml` six-string guitar tablature within the accepted profile.
4. Verified project-authored `.gp` shared archives with GP8 semantic evidence, including the accepted single-track guitar and two-track guitar/bass proofs.

### Recognized but not imported

1. Five-string bass ASCII.
2. Seven-string guitar ASCII.
3. Compressed MusicXML `.mxl`.
4. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx`.
5. Arbitrary or unverified `.gp` files.
6. PowerTab `.ptb` and `.pt2`.
7. TuxGuitar `.tg`.
8. TablEdit `.tef`.

Recognition must not be described as reading support.

## Boundaries that remain unchanged

1. Do not claim general GP7 support.
2. Do not claim GP3 through GP6 support without lawful verified fixtures and direct tests.
3. Do not claim arbitrary Guitar Pro compatibility from project-authored proofs.
4. Do not add alphaTab rendering or alphaSynth playback by implication.
5. Do not silently select a track.
6. Do not create a second musical or timing model.
7. Deferred formats require separate routes.
8. Do not begin full playback or teacher mode from this audition proof.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without John.

John is needed only after the exact hosted audible proof passes every non-device gate.

Jason Washburn is not involved unless he separately agrees to desktop testing.

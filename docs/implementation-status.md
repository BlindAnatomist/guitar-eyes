# Guitar Eyes Implementation Status

Last updated: July 28, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current record branch: `work/playback-timing-foundation`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Verified, hosted, and real-iPhone-accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`

Verified ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Verified MusicXML source: `715547a123b2a6e862a8020858df96cb34c63526`

Verified, hosted, and real-iPhone-accepted Guitar Pro application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

Verified Playback Timing Foundation 1 engine source: `2b038b15afa09877f6d8dcf615bc060243578096`

Completed tablature-intake record: `work/tablature-intake-expansion` at `aa302dcee880df4a0947d3e374171554e4855022`

Fork `main` remains exactly reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Governing architecture

Guitar Eyes is one musical system with one semantic tablature document and one deterministic temporal projection:

1. iPhone presents semantic musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same positions spatially as strings by synchronized positions.
3. Every supported importer normalizes into the same semantic document.
4. The playback-timing engine consumes the semantic document without reparsing a source format.
5. Teacher mode and future audible playback must consume the accepted semantic document and timing timeline.
6. No reader, teacher, player, or format may create a second musical or timing interpretation.
7. Third-party decoder models remain behind importer adapters and do not become the application architecture.

## Accepted reader contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position order.
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
16. Safe rejection instead of guessed duration.

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
16. Missing or unsafe duration rejects with stable `PlaybackTimingError` codes.
17. The semantic document is not mutated.
18. The module imports no React, browser, worker, renderer, player, or audio dependency.

Verification:

1. Exact successful run: `30383944688`.
2. Complete inherited and new automated suite passed.
3. Optimized production build compiled successfully.
4. Exact five-file source boundary passed.
5. No forbidden soundfont, audio-worklet, synth-worker, renderer-worker, or Bravura asset was emitted.
6. Evidence artifact ID `8698174076`, digest `sha256:671ce33fc6b6e868a96ee49c26ea0fa8b31820b89fd0c797de13059723d908f5`.
7. Fork `main` was restored and independently verified identical to clean authority.

The first run, `30383593006`, failed only in an opaque shell authority guard before installation or tests. The corrected diagnostic gate passed. That procedure is preserved in `docs/known-problems-register-addendum-execution-gates.md`.

Detailed records:

- `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.

No Pages deployment or real-iPhone acceptance was required because the engine changes no interface, focus, speech, picker, or hosted interaction.

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

## Current decision point

No additional implementation checkpoint is currently authorized.

The owner must choose and approve a bounded next plan for either:

1. audible playback output consuming the accepted timeline; or
2. non-audio teacher mode consuming the accepted semantic document and timeline.

Do not begin playback controls, sound, automatic navigation, focus behavior, looping, bookmarks, teacher mode, practice scoring, repeat expansion, tempo extraction, count-in, swing, or new format support before that plan exists.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, and repository-authority verification proceed without John.

John is needed only after a stable hosted user-facing candidate requires bounded real-iPhone Safari and VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.
# Guitar Eyes Implementation Status

Last updated: July 28, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current implementation branch: `work/playback-timing-foundation`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Verified, hosted, and real-iPhone-accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`

Verified ASCII intake expansion source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Verified MusicXML implementation source: `715547a123b2a6e862a8020858df96cb34c63526`

Verified, hosted, and real-iPhone-accepted Guitar Pro application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

Completed tablature-intake branch record: `work/tablature-intake-expansion` at `aa302dcee880df4a0947d3e374171554e4855022`

Playback-timing branch starting point: `aa302dcee880df4a0947d3e374171554e4855022`

Fork `main` remains exactly reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Governing architecture

Guitar Eyes is one musical system with one semantic tablature document and multiple consumers:

1. iPhone presents synchronized musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same document as strings by synchronized positions while preserving a spatial overview.
3. Every supported format normalizes into the same semantic document.
4. The playback-timing engine consumes that document without reparsing a source format.
5. Teacher mode and future audible playback must consume the same document and timing layer.
6. Format-specific parsers may interpret source syntax but may not create separate reader, timing, teacher, playback, or musical models.
7. Browser-level file filtering must not prevent iPhone users from selecting a file before Guitar Eyes can validate it.
8. A third-party decoder may exist only behind an adapter and may not become the application architecture.

## Accepted reader contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position order.
2. Quiet position and block movement.
3. Read current as the only action that announces the full playing instruction.
4. Omission of ordinary unplayed strings.
5. Speech for open strings, frets, explicit muted notes, attached techniques, chords, rests, and supported duration.
6. W, H, Q, E, and S duration mapping for supported ASCII.
7. Measure and position-within-measure speech.
8. Multiple tablature blocks.
9. Automatic supported four-string bass and six-string guitar detection.
10. Native iPhone Files-picker focus recovery.
11. No browser-level `accept` restriction on the upload control.
12. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.
13. Multi-track Guitar Pro archives must expose an inventory and require explicit selection.
14. A selected-track summary must immediately precede `Load selected track` in VoiceOver reading order.
15. Timing must derive from the semantic document rather than from raw display text.
16. Missing or ambiguous duration must reject rather than be guessed for playback.

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

## Passed ASCII intake expansion checkpoint 1

Exact source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Accepted capability:

1. Six-string guitar and four-string bass ASCII.
2. Multiple blocks and surrounding metadata.
3. Optional octave labels.
4. ASCII and Unicode accidentals.
5. Safely preserved custom tuning.
6. Multi-digit frets, open strings, explicit muted notes, and deterministic attached techniques.
7. W, H, Q, E, and S rhythm lines.
8. Aligned explicit measures.
9. Prevention of false positions from unsupported punctuation.
10. Positive recognition, but not import, of five-string bass and seven-string guitar.
11. Prevention of pipe-delimited prose false positives.

Verification:

- 18 of 18 suites;
- 101 of 101 tests;
- production build;
- compiled-fragment checks.

## Passed MusicXML intake checkpoint 2

Uncompressed six-string guitar MusicXML is source-verified, hosted, and real-iPhone accepted.

Accepted scope:

1. `score-partwise` XML.
2. One unambiguous six-string guitar tablature part.
3. Explicit six-string staff tuning.
4. Explicit string and fret technical data.
5. Single-voice sequential timing.
6. Measures and duration.
7. Open and fretted notes.
8. Simultaneous chord onsets.
9. Timed rests.
10. Supported technical notation.
11. One shared semantic document for desktop and iPhone.

Safe rejection covers malformed XML, custom entities, missing or ambiguous tablature parts, missing tuning, unsafe tuning order, backup or forward timing, multiple voices, grace notes, missing coordinates, out-of-range strings, and duplicate string assignments at one onset.

Verification evidence:

1. 19 of 19 suites and 115 of 115 tests for the importer implementation.
2. 20 of 20 suites and 117 of 117 tests after the iPhone picker repair.
3. Production build and compiled checks.
4. Hosted publication and bundle read-back.
5. Picker-repair hosted read-back through run `30230820831`.
6. Exact restoration of fork `main`.
7. Real-iPhone file selection after removal of the browser `accept` restriction.
8. Correct picker-return focus.
9. Correct four-position note and duration test.
10. Correct simultaneous high-E-open and B-string-fret-1 chord instruction.
11. Correct timed-rest instruction without a string.
12. Quiet Previous and Next behavior.

Detailed record:

- `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`

## Passed Guitar Pro shared-archive checkpoint 3

Exact accepted source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

Accepted bounded capability:

1. A project-authored single-track `.gp` shared archive with GP8 semantic evidence loads automatically as six-string guitar.
2. A project-authored two-track `.gp` shared archive exposes Proof Guitar and Proof Bass.
3. No track is selected silently.
4. `Load selected track` remains disabled until the owner explicitly selects a track.
5. Explicit bass selection normalizes into the same semantic document used by desktop and iPhone.
6. The accepted decoded intermediate is reused after selection; alphaTab is not run a second time.
7. Archive-declared track count is cross-checked against decoder output so an incomplete one-track result cannot be accepted from a two-track archive.
8. The separate Guitar or Bass control does not filter Guitar Pro tracks.
9. The selected-track details occur directly before `Load selected track` in VoiceOver reading order.
10. Guitar Pro decoding remains lazy and contains no rendering, playback, notation fonts, soundfonts, renderer workers, or audio worklets.

Evidence:

1. Checkpoint 3D direct binary proof passed 29 of 29 suites and 174 of 174 tests, production build, and lazy-resource inspection.
2. Checkpoint 3E archive-integrity and explicit-selection repair passed the complete inherited and new suite, production build, Pages deployment, and exact live asset read-back.
3. Real-iPhone 3E acceptance established multi-track recognition, explicit choices, and successful Proof Bass loading.
4. Checkpoint 3F selected-track reading-order repair passed the complete suite, production build, Pages deployment, and exact live asset read-back.
5. John confirmed the bounded 3F backward-swipe retest with: `That worked`.
6. Fork `main` was restored exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` after each temporary Pages publication.

Detailed records:

- `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`
- `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`
- `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`

## Current format support

### Actually imported into the semantic document

1. ASCII `.txt` and `.tab` six-string guitar.
2. ASCII `.txt` and `.tab` four-string bass.
3. Uncompressed `.musicxml` and `.xml` six-string guitar tablature within the accepted bounded profile.
4. Verified project-authored `.gp` shared archives with GP8 semantic evidence, including one six-string guitar track and the accepted two-track guitar-and-bass proof.

### Recognized but not imported

1. Five-string bass ASCII.
2. Seven-string guitar ASCII.
3. Compressed MusicXML `.mxl`.
4. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx`.
5. Unverified or arbitrary `.gp` archives outside the accepted project-authored GP8-style fixtures.
6. PowerTab `.ptb` and `.pt2`.
7. TuxGuitar `.tg`.
8. TablEdit `.tef`.

Recognition must not be described as reading support.

## Guitar Pro boundaries that remain unchanged

1. Do not claim general GP7 support.
2. Do not claim GP3 through GP6 support without lawful verified fixtures and direct tests.
3. Do not claim arbitrary Guitar Pro compatibility from the accepted project-authored fixtures.
4. Do not add an alphaTab renderer, alphaSynth player, notation font, soundfont, renderer worker, or audio worklet.
5. Do not silently select a track.
6. Do not create a second musical model.
7. PowerTab, TuxGuitar, TablEdit, Guitar Pro 2, and compressed MusicXML require separate future routes.

## Current authorized checkpoint: Playback Timing Foundation 1

Plan:

- `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`

State: `authorized-plan`

Purpose:

Create a pure deterministic timing engine from the accepted semantic document. The engine establishes temporal offsets for later playback and teacher mode but produces no sound and changes no interface.

Required behavior:

1. Preserve existing semantic position order.
2. Accept an integer tempo from 20 through 300 quarter-note beats per minute.
3. Use 120 BPM only as the explicit checkpoint default.
4. Record whether tempo was explicit or defaulted.
5. Derive exact reduced duration fractions from existing semantic evidence.
6. Prefer Guitar Pro `quarterNoteFraction`.
7. Reconstruct MusicXML duration from divisions.
8. Convert accepted finite decimal quarter-note units only when no stronger exact source exists.
9. Treat a chord as one onset.
10. Treat a rest as a timed position.
11. Calculate cumulative quarter-note and millisecond start, duration, and end offsets.
12. Produce measure timing summaries when measure identity exists.
13. Report total duration.
14. Preserve source-order playback.
15. Do not expand repeats or alternate endings.
16. Reject missing, zero, negative, non-finite, malformed, or unrepresentable duration.
17. Do not mutate the semantic document.
18. Add no browser, React, UI, worker, renderer, player, or audio dependency.

Verification boundary:

1. Direct engine regression suite.
2. Complete inherited automated suite.
3. Production build.
4. Diff inspection proving no UI, audio, player, renderer, worker, or unrelated format work.
5. One intentional GitHub-hosted checkpoint only after source review because the current Chat runtime cannot execute the repository dependency gate.
6. No Pages deployment and no real-iPhone test for this engine-only checkpoint.
7. Exact confirmation that fork `main` remains identical to clean authority.

## Explicitly deferred after Timing Foundation 1

1. Audible playback.
2. Web Audio or MIDI synthesis.
3. Sampled guitar or bass sounds.
4. Metronome sound.
5. Playback controls.
6. Automatic reader movement or focus changes.
7. Visual cursor behavior.
8. Looping.
9. Bookmarks.
10. Teacher mode.
11. Practice scoring.
12. Repeat expansion.
13. Tempo extraction and tempo maps.
14. Swing interpretation.
15. Count-in behavior.
16. `.mxl`, broader Guitar Pro, and other format expansion.

## Testing responsibility

Dependency work, source implementation, automated tests, builds, artifact inspection, documentation, and repository-authority verification proceed without John.

John is not needed for Playback Timing Foundation 1 because it changes no user-facing interface. He is needed only after a later stable hosted UI or audio candidate requires bounded real-iPhone Safari and VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.
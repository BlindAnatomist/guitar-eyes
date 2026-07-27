# Guitar Eyes Implementation Status

Last updated: July 27, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current implementation branch: `work/tablature-intake-expansion`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Verified, hosted, and real-iPhone-accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`

Verified ASCII intake expansion source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Verified MusicXML implementation source: `715547a123b2a6e862a8020858df96cb34c63526`

Fork `main` remains exactly reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Governing architecture

Guitar Eyes is one musical system with one semantic tablature document and two reader interfaces:

1. iPhone presents synchronized musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same document as strings by synchronized positions while preserving a spatial overview.
3. Every supported format must normalize into the same semantic document.
4. Format-specific parsers may interpret source syntax but may not create separate reader logic, playback logic, or musical models.
5. Browser-level file filtering must not prevent iPhone users from selecting a file before Guitar Eyes can validate it.
6. A third-party decoder may exist only behind an adapter and may not become the application architecture.

## Accepted reader contracts

Every intake checkpoint must preserve:

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

## Current format support

### Actually imported into the semantic document

1. ASCII `.txt` and `.tab` six-string guitar.
2. ASCII `.txt` and `.tab` four-string bass.
3. Uncompressed `.musicxml` and `.xml` six-string guitar tablature within the accepted bounded profile.

### Recognized but not imported

1. Five-string bass ASCII.
2. Seven-string guitar ASCII.
3. Compressed MusicXML `.mxl`.
4. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, and `.gp`.
5. PowerTab `.ptb` and `.pt2`.
6. TuxGuitar `.tg`.
7. TablEdit `.tef`.

Recognition must not be described as reading support.

## Completed Guitar Pro evaluation

The July 27 structured-format evaluation concluded:

1. alphaTab `1.8.4` can provide a browser-compatible low-level decoder for Guitar Pro 3 through 8.
2. Guitar Eyes can use `ScoreLoader.loadScoreFromBytes` without using alphaTab rendering, playback, notation fonts, soundfonts, cursors, or UI controls.
3. alphaTab's semantic model exposes the tuning, measures, beats, notes, string and fret coordinates, durations, chords, rests, and effects needed by the Guitar Eyes adapter.
4. The package is broad and synchronous, so it must be lazy-loaded in a dedicated worker and contained by hard input, time, and complexity limits.
5. alphaTab note string 1 is the lowest string; Guitar Eyes stores strings high to low, so normalization must reverse that orientation deliberately.
6. MPL-2.0 permits use as an unchanged dependency with notices and corresponding-source information.
7. An upstream alphaTab GP5 fixture was rejected because it contains a commercial-song transcription.
8. The first fixture must be generated from project-authored alphaTex and exported as an original GP7 `.gp` file.
9. PowerTab, TuxGuitar, TablEdit, Guitar Pro 2, compressed MusicXML, and unsupported string-count families require separate future routes.

Detailed record:

- `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`

## Current bounded checkpoint: Guitar Pro 7 proof 3A

Implement a source, dependency, fixture, and normalization proof for project-authored Guitar Pro 7 `.gp` files.

Checkpoint 3A must:

1. pin `@coderline/alphatab` exactly at `1.8.4`;
2. add MPL-2.0 notices without modifying or vendoring alphaTab source;
3. create original alphaTex and a deterministic GP7 fixture;
4. load alphaTab only after Guitar Pro detection;
5. parse in a dedicated worker with timeout, cancellation, termination, byte limits, and complexity limits;
6. transfer a small serializable intermediate representation rather than the alphaTab score model;
7. normalize one unambiguous four-string or six-string non-percussion staff into the existing semantic document;
8. preserve source-order measures, exact duration, notes, open strings, dead notes, chord onsets, timed rests, tuning, and supported techniques;
9. reject multiple supported tracks, conflicting voices, missing coordinates, unsupported string counts, ambiguous timing, grace timing outside the model, corrupt archives, and limit violations;
10. avoid silent first-track, first-voice, longest-note, or nearest-string selection;
11. verify all inherited tests plus new importer tests;
12. inspect production chunks and reject eager alphaTab loading, fonts, soundfonts, renderer workers, playback worklets, or audio assets;
13. stop before publication and real-iPhone testing.

During checkpoint 3A, project-tested import support is GP7 `.gp` only. GP3, GP4, GP5, GP6, GP8, and GP2 remain recognized but unsupported until each has an original, public-domain, or clearly licensed fixture and direct evidence.

This checkpoint does not authorize playback, teacher mode, looping, bookmarks, pattern analysis, AI implementation, commercial scraping, a pull request, merge, upstream change, or production publication.

## Testing responsibility

Dependency work, fixture generation, source implementation, automated tests, builds, and artifact inspection proceed without John.

John is needed only after a stable hosted GP7 candidate exists and a bounded real-iPhone Safari and VoiceOver test is necessary.

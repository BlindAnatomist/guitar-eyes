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

Uncompressed six-string guitar MusicXML is now source-verified, hosted, and real-iPhone accepted.

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

## Current bounded task: next structured-format evaluation

Proceed without John through a read-only evaluation and implementation plan for Guitar Pro and related binary formats.

The evaluation must determine:

1. which Guitar Pro versions a zero-dollar browser-compatible importer can parse;
2. whether alphaTab or another maintained dependency exposes tuning, measures, duration, notes, chords, rests, and techniques without requiring its renderer or playback engine;
3. whether the dependency can normalize into the existing semantic document rather than introducing a second model;
4. licensing, bundle-size, security, maintenance, deterministic-testing, and browser implications;
5. whether PowerTab, TuxGuitar, and TablEdit can share that import route or require separate conversion paths;
6. what original or clearly licensed fixtures are available;
7. the exact unsupported boundary.

Do not begin implementation if essential musical data would be guessed, if the dependency forces playback or rendering architecture into the reader, or if the licensing path is unsuitable.

This task does not authorize playback, teacher mode, looping, bookmarks, pattern analysis, AI implementation, commercial scraping, a pull request, merge, upstream change, or production publication.

## Testing responsibility

Research, dependency evaluation, fixture design, source implementation, automated tests, and build verification proceed without John.

John is needed only after a stable hosted candidate for the next format exists and a bounded real-iPhone Safari and VoiceOver test is necessary.
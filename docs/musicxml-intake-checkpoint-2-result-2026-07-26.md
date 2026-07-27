# MusicXML Tablature Intake Checkpoint 2 Result

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Accepted ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Exact verified MusicXML source: `715547a123b2a6e862a8020858df96cb34c63526`

Status: passed source, automated, build, and compiled-artifact gates; publication and real-iPhone acceptance remain open

## Objective

Add actual uncompressed MusicXML guitar tablature import without creating a second musical model or weakening the accepted ASCII, desktop, iPhone, rhythm, measure, speech, and focus contracts.

## Implemented MusicXML support

The bounded importer accepts uncompressed MusicXML `score-partwise` documents that contain:

1. exactly one unambiguous tablature part;
2. explicit six-string staff tuning;
3. explicit MusicXML string and fret technical data for pitched notes;
4. positive divisions and duration values;
5. a single sequential voice without backup or forward timing;
6. ordinary notes, open strings, fretted notes, chord onsets, timed rests, measures, and supported technical notation.

The importer rejects or defers:

1. malformed XML;
2. custom entity declarations;
3. MusicXML roots other than `score-partwise`;
4. scores with no part containing explicit tablature coordinates;
5. scores with more than one tablature part;
6. missing or invalid six-string tuning;
7. unsafe tuning order;
8. multi-voice backup or forward timing;
9. grace notes;
10. pitched notes without string and fret data;
11. string numbers outside one through six;
12. duplicate string assignments at one chord onset;
13. compressed `.mxl` files.

## Deliberate MusicXML mapping

MusicXML staff tuning and technical string numbers use different orientations:

1. `staff-tuning line="1"` represents the bottom, lowest-pitched tablature staff line;
2. MusicXML technical string `1` represents the highest-pitched string.

The importer reverses the six `staff-tuning` lines into the semantic high-to-low string order while mapping technical string numbers directly to the semantic string index. Fully qualified tuning pitches must descend safely from high string to low string.

## Shared reader document

MusicXML produces the same semantic document consumed by ASCII imports and by both readers. The imported document contains:

1. source format and part identity;
2. six semantic string identities and tuning;
3. synchronized positions;
4. chord notes combined into one onset;
5. timed rests as explicit positions;
6. duration names and quarter-note units;
7. measure and position-within-measure context;
8. supported technical notation;
9. warnings for unsupported structured technical elements;
10. normalized desktop source rows.

Desktop and iPhone do not contain separate MusicXML logic.

## Presentation behavior

The iPhone reader preserves:

1. Previous position, Read current position, Next position order;
2. quiet movement;
3. dedicated full instruction through Read current;
4. omitted ordinary unplayed strings;
5. open-string, fret, duration, measure, chord, technique, and rest speech;
6. native Files-picker return focus recovery.

The desktop reader preserves:

1. strings as rows and synchronized positions as columns;
2. quiet keyboard and button movement;
3. standard VoiceOver table navigation;
4. a rest label in the relevant position heading;
5. a disclosure named `Normalized MusicXML spatial layout` rather than falsely calling generated rows the original ASCII source.

## Corpus fixtures

The project-authored CC0 MusicXML corpus now contains:

1. `musicxml-minimal-guitar-tab.musicxml` — one measure, standard tuning, four positions, quarter/eighth/half durations, and explicit string/fret data;
2. `musicxml-chord-rest-two-measures.musicxml` — two complete 4/4 measures, a two-note chord onset, a timed rest, a supported hammer-on technical element, and two half-note positions in measure two.

The original minimal fixture's `staff-tuning` line order was corrected to the official bottom-to-top MusicXML convention before importer tests were written.

## Verification history

### Initial exact-source run

Run: `30229444529`

Exact source: `200cca20b0c655131cedb5eb5bb4b343c1d63cb0`

Result:

1. accepted ASCII ancestry: passed;
2. locked installation: passed;
3. 18 suites passed and one suite failed;
4. 114 tests passed and one UI test failed;
5. failure cause: the non-tab XML test constructed a `File` from a string instead of an iterable array of file parts;
6. importer, coordinator, corpus, desktop, format, and reader tests passed;
7. no blind rerun occurred.

### Corrected exact-source run

Run: `30229556929`

Job: `89865725597`

Exact source: `715547a123b2a6e862a8020858df96cb34c63526`

Results:

1. exact source checkout: passed;
2. accepted ASCII ancestry: passed;
3. locked installation: passed;
4. automated suites: 19 passed, 19 total;
5. automated tests: 115 passed, 115 total;
6. production build: passed;
7. compiled check: failed only because the verifier searched for the contiguous sentence `Imported MusicXML tablature`, while production JavaScript stores the interpolated status as separate fragments.

No application source changed after this run.

### Compiled diagnostic

Run: `30229646960`

Artifact: `musicxml-compiled-report`, artifact ID `8639653482`

The diagnostic reported:

- pass: MusicXML checkpoint identity;
- fail: contiguous interpolated import sentence;
- pass: normalized MusicXML spatial label;
- pass: no-tab-coordinates error;
- pass: compressed MusicXML unsupported message;
- pass: accepted position controls;
- pass: rest speech.

### Corrected compiled-fragment check

Run: `30229723259`

Exact source: `715547a123b2a6e862a8020858df96cb34c63526`

Results:

1. exact source checkout: passed;
2. accepted ASCII ancestry: passed;
3. locked installation: passed;
4. production build: passed;
5. actual compiled status fragments and all remaining MusicXML contracts: passed.

The temporary workflow was removed after verification.

## Checkpoint verdict

Uncompressed MusicXML tablature intake checkpoint 2 passes its source, automated, build, and compiled-artifact gates.

This does not yet establish hosted or real-device acceptance. The currently hosted page still represents the earlier accepted convergence checkpoint and does not include MusicXML intake.

## Next bounded task

Publish the exact verified source `715547a123b2a6e862a8020858df96cb34c63526` through the proven temporary-main Pages procedure, read back the live HTML and primary bundle, restore fork `main` exactly, and then ask John for one bounded real-iPhone Safari and VoiceOver test using the project-authored MusicXML fixtures.

Do not begin compressed MusicXML, Guitar Pro, PowerTab, TuxGuitar, TablEdit, playback, teacher mode, AI, a pull request, or a merge before the MusicXML hosted and real-device gates pass.

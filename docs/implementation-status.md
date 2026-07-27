# Guitar Eyes Implementation Status

Last updated: July 26, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current implementation branch: `work/tablature-intake-expansion`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Verified, hosted, and real-iPhone-accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`

Verified ASCII intake expansion source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Fork `main` remains reserved as an exact upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

Documentation-only commits after the exact implementation sources do not replace their identities.

## Governing architecture

Guitar Eyes is one musical system with one semantic tablature document and two reader interfaces:

1. iPhone presents synchronized musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same document as strings by synchronized positions while retaining the original spatial source layout.
3. Every supported format must normalize into the same semantic document.
4. Instrument identity, tuning, blocks, strings, notes, techniques, rhythm, measures, warnings, and preserved unsupported material belong to that document.
5. Format-specific parsers may interpret source syntax, but they may not create separate reader logic or separate musical models.

The legacy desktop grid remains a compatibility fallback for unsafe ASCII material. Recognized but unsupported formats and string-count families must be identified honestly rather than opened as though semantic reading succeeded.

## Accepted reader contracts

Every intake checkpoint must preserve:

1. Previous position, Read current position, Next position order.
2. Quiet position and block movement.
3. Read current as the only semantic-reader action that sends full playing instructions to the live region.
4. Omission of ordinary unplayed strings.
5. Speech for open strings, frets, explicit muted notes, attached techniques, and supported duration.
6. W, H, Q, E, and S duration mapping.
7. Aligned measure recognition and position-within-measure speech.
8. Multiple tablature blocks.
9. Automatic supported four-string bass and six-string guitar detection.
10. Native iPhone Files-picker focus recovery after supported and failed uploads.
11. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.

## Passed convergence recovery checkpoint 1

Exact source: `72159d25958fffd941c95351c6781cf579e1d622`

Evidence:

1. 17 of 17 automated suites.
2. 81 of 81 automated tests.
3. Production build.
4. Compiled-artifact checks.
5. Corrected Pages publication.
6. Hosted HTML and live-bundle read-back.
7. Exact restoration of fork `main`.
8. Real-iPhone Safari and VoiceOver acceptance.

Valid accepted convergence preview:

`https://blindanatomist.github.io/guitar-eyes/`

Jason Washburn's optional desktop acceptance remains deferred unless he agrees to participate. His absence is not an active blocker.

Detailed records:

- `docs/convergence-recovery-source-checkpoint-1.md`
- `docs/convergence-recovery-local-execution-gate-2026-07-26.md`
- `docs/convergence-recovery-publication-result-2026-07-26.md`
- `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`

## Passed ASCII intake expansion checkpoint 1

Exact source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Implemented capability:

1. Shared string-line analysis for detection, instrument analysis, and parsing.
2. Optional octave suffixes such as `E4` and `B3`.
3. Unicode sharp and flat normalization while preserving source labels.
4. High-to-low validation for fully octave-qualified strings.
5. Rejection of duplicate octave pitches and misordered standard tuning labels.
6. Supported custom four-string and six-string tuning with explicit warnings.
7. Positions created only by frets, open strings, and explicit muted notes.
8. Deterministic attachment of transition techniques to notes.
9. Unsupported punctuation preserved and warned without creating false positions.
10. Positive recognition of five-string bass and seven-string guitar as unsupported.
11. No reclassification of a truncated supported document as another instrument family.
12. Prevention of pipe-delimited prose false positives.
13. Honest supported, recognized-unsupported, unsafe-fallback, planned-format, and unknown upload outcomes.
14. Expanded CC0 real-world and adversarial fixture corpus.

Verification evidence:

1. Accepted convergence ancestry: passed.
2. Locked installation: passed.
3. Automated suites: 18 passed, 18 total.
4. Automated tests: 101 passed, 101 total.
5. Production build: passed.
6. Corrected compiled-fragment verification: passed.
7. Temporary checkpoint workflow: removed.

Important run history:

- `30227571812`: initial source exposed four intake defects; no blind rerun occurred.
- `30227720078`: diagnostic log captured the exact failures.
- `30227993598`: exact corrected source passed all 101 tests and production build; only an invalid fully interpolated literal check failed.
- `30228133370`: build-only correction verified the actual compiled fragments successfully.

This checkpoint was not published. It does not yet require owner-operated iPhone testing.

Detailed record:

- `docs/ascii-intake-expansion-checkpoint-1-result-2026-07-26.md`

## Current format support

### Actually imported into the semantic document

1. ASCII `.txt` and `.tab` six-string guitar.
2. ASCII `.txt` and `.tab` four-string bass.
3. Multiple complete blocks.
4. Metadata and prose around blocks.
5. Standard and safely preserved custom tuning.
6. ASCII and Unicode accidentals.
7. Optional octave-qualified string labels.
8. Multi-digit frets, open strings, explicit muted notes, and supported attached techniques.
9. W, H, Q, E, and S rhythm lines.
10. Aligned explicit measures.

### Recognized but not imported

1. Five-string bass ASCII.
2. Seven-string guitar ASCII.
3. MusicXML and `.xml`.
4. Compressed MusicXML `.mxl`.
5. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, and `.gp`.
6. PowerTab `.ptb` and `.pt2`.
7. TuxGuitar `.tg`.
8. TablEdit `.tef`.

Recognition must not be described as reading support.

## Current bounded checkpoint: uncompressed MusicXML import

The next implementation target is actual MusicXML guitar tablature import into the existing semantic document.

Checkpoint 2 must:

1. accept uncompressed XML only;
2. require explicit tablature string and fret technical data;
3. select a guitar tablature part safely when a score contains multiple parts;
4. import tuning, measures, durations, notes, rests, and chords;
5. map MusicXML string numbering into the semantic high-to-low order deliberately;
6. preserve unsupported structured notation with warnings rather than inventing meaning;
7. reject non-tablature or ambiguous MusicXML clearly;
8. provide one semantic document to both desktop and iPhone;
9. inherit all 101 tests and add structured-import tests;
10. stop before publication and real-iPhone testing until source, automated, build, and artifact gates pass.

This checkpoint does not authorize:

- compressed `.mxl`;
- Guitar Pro or other binary importers;
- playback;
- teacher mode;
- looping;
- bookmarks;
- pattern analysis;
- AI implementation;
- commercial scraping;
- a pull request, merge, upstream change, or production publication.

## Testing responsibility

Source inspection, fixtures, implementation, automated tests, and build verification proceed without John.

John is needed only after a stable hosted MusicXML candidate exists and a bounded real-iPhone Safari and VoiceOver test is necessary.

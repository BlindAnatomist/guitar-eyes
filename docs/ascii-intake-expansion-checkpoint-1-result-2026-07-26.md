# ASCII Tablature Intake Expansion Checkpoint 1 Result

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Accepted convergence source: `72159d25958fffd941c95351c6781cf579e1d622`

Exact verified ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Status: passed source, automated, build, and compiled-artifact gates; not published; no real-iPhone test required yet

## Objective

Expand real-world ASCII tablature intake without weakening the accepted desktop and iPhone readers, inventing musical positions from punctuation, or misrepresenting unsupported instruments as supported four- or six-string documents.

## Implemented intake changes

### Shared string-line analysis

`src/tabStringLine.js` now provides one shared definition of an ASCII tablature string line for format detection, instrument analysis, and semantic parsing.

It supports:

1. A through G tuning labels;
2. ASCII sharps and flats;
3. Unicode sharp and flat symbols;
4. optional octave suffixes such as `E4`, `B3`, and `F♯2`;
5. preservation of the exact original label and source line;
6. normalization of Unicode accidentals into the semantic pitch identity;
7. separation of string-line runs at headings, annotations, prose, and blank lines.

### Safer tuning and instrument evidence

The parser now:

1. verifies fully octave-qualified strings descend from highest pitch to lowest pitch;
2. rejects duplicate octave pitches and unsafe order;
3. rejects a misordered multiset of standard tuning labels;
4. preserves supported custom four- and six-string tuning with explicit warnings when pitch order cannot be fully proved;
5. distinguishes supported four-string bass and six-string guitar from positively identified five-string bass and seven-string guitar;
6. does not relabel a truncated five-line six-string file as a five-string instrument;
7. gives positively identified five- and seven-string files a recognized-but-unsupported result instead of guessing them into another profile.

### Musical-position integrity

Semantic positions now come only from:

1. fret numbers, including zero as an open string;
2. explicit muted-note notation.

The parser preserves but does not promote into standalone musical positions:

1. barlines;
2. parentheses;
3. angle brackets;
4. repeat punctuation;
5. unknown notation;
6. hammer-on and pull-off transition characters;
7. slide, tap, bend, release, and vibrato characters.

When a transition relationship is deterministic, the technique attaches to the note it modifies. Unsupported symbols remain in source and token records and produce warnings that explicitly state they did not create musical positions.

### Honest upload behavior

The application now separates:

1. supported semantic ASCII;
2. recognized but unsupported string-count families;
3. unsafe material eligible only for the legacy desktop compatibility path;
4. known structured formats that are recognized but not yet imported;
5. unknown material.

A positively identified five- or seven-string file no longer opens a misleading desktop compatibility grid. Both reading modes receive an explicit unsupported-string-count result.

### False-positive prevention

Pipe-delimited prose beginning with A through G letters is no longer classified as tablature merely because an ordinary word contains the letter `x`. Content-based ASCII detection requires a fret number or isolated mute notation.

## Corpus expansion

The committed real-world corpus now includes:

1. octave-qualified standard guitar;
2. Unicode-accidental custom guitar tuning;
3. unsafe duplicate octave pitch;
4. misordered standard tuning labels;
5. seven-string guitar;
6. five-string bass;
7. ghost-note, harmonic-bracket, repeat-punctuation, and technique-chain material;
8. pipe-delimited non-tablature prose.

The corpus manifest is schema version 2 and records provenance, licensing, features, and expected supported, unsupported, or rejected outcomes.

## Preserved accepted behavior

The complete inherited suite confirms preservation of:

1. desktop and iPhone semantic convergence;
2. Previous position, Read current position, Next position order;
3. quiet movement controls;
4. dedicated playing-instruction speech;
5. omission of ordinary unplayed strings;
6. speech for open strings and explicit mute notation;
7. W, H, Q, E, and S duration mapping;
8. aligned measure recognition;
9. multiple tablature blocks;
10. automatic four-string bass and six-string guitar detection;
11. native iPhone Files-picker focus recovery;
12. the legacy desktop fallback for genuinely unsafe material.

## Verification history

### Initial bounded run

Run: `30227571812`

Job: `89860287674`

Exact earlier source: `6e1fb1622bcef7a2e8150056d39c6fdd25f275be`

Result: failed during automated tests.

The failure was inspected before any rerun. Four failures identified:

1. truncated five-line material was overclassified as an unsupported string-count family;
2. pipe-delimited prose was misclassified because `x` inside a word counted as mute notation;
3. the measure layer rebuilt the old unsupported-notation warning;
4. the measure layer only knew the former barline token representation.

### Diagnostic log run

Run: `30227720078`

Artifact: `intake-test-log`, artifact ID `8639044000`

Purpose: capture the complete Jest failure output for the same earlier source. No source repair occurred inside the run.

### Corrected source run

Run: `30227993598`

Job: `89861445456`

Exact source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Results:

1. exact source checkout: passed;
2. accepted convergence ancestry: passed;
3. locked installation: passed;
4. automated suites: 18 passed, 18 total;
5. automated tests: 101 passed, 101 total;
6. production build: passed;
7. compiled check: failed only because the verifier searched for a fully interpolated `7-string` sentence that production JavaScript stores as dynamic fragments.

No application source changed after this run.

### Compiled-fragment correction

Run: `30228133370`

Job: `89861832672`

Exact source: `08f8ab16135570d0e53b829daa5c153a15751a45`

Results:

1. exact source checkout: passed;
2. accepted convergence ancestry: passed;
3. locked installation: passed;
4. production build: passed;
5. corrected compiled-fragment checks: passed.

Verified production fragments include:

1. intake checkpoint build identity;
2. accepted position controls;
3. seven-string profile identity;
4. recognized-ASCII message construction;
5. supported four-string and six-string boundary;
6. unsupported-symbol position-integrity warning;
7. MusicXML recognized-but-not-yet-imported message.

The temporary workflow was removed after verification.

## Checkpoint verdict

ASCII tablature intake expansion checkpoint 1 passes.

The application has broader and safer ASCII intake, but it is not yet a universal tablature reader. Five-string bass and seven-string guitar remain recognized but unsupported. MusicXML, compressed MusicXML, Guitar Pro, PowerTab, TuxGuitar, and TablEdit remain outside actual import support.

## Next bounded checkpoint

Implement actual uncompressed MusicXML guitar tablature import into the existing semantic document.

MusicXML checkpoint 2 must:

1. parse only XML that contains explicit tablature string and fret technical data;
2. preserve measures and duration from structured data;
3. preserve tuning and instrument identity;
4. map MusicXML string numbering deliberately into the semantic high-to-low string order;
5. support chords and rests without inventing notes;
6. reject notation that cannot be normalized safely;
7. feed both desktop and iPhone readers through the same document;
8. preserve every accepted reader contract;
9. avoid compressed `.mxl`, Guitar Pro, playback, teacher mode, and AI during this checkpoint;
10. stop before publication and real-iPhone testing until automated and build gates pass.

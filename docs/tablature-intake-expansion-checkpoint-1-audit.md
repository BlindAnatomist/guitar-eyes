# Tablature Intake Expansion Checkpoint 1 Audit

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Branch base: corrected convergence documentation head `719f30d0b4f3ba7bc177f334a947ebe713d77d52`

Accepted reader implementation preserved at: `72159d25958fffd941c95351c6781cf579e1d622`

Status: read-only source and corpus audit complete; implementation not yet started

## Governing correction

Teacher mode and playback are not the next phase. The next phase is broader tablature intake.

The deleted teacher-mode recommendation must not be reconstructed or treated as an unfinished assignment. Downstream musical capabilities remain prohibited while the active intake checkpoints are incomplete.

## Current actual support

The current importer semantically parses ASCII text representing:

1. six-string guitar;
2. four-string bass;
3. one or more complete blocks;
4. metadata and prose outside the string-line runs;
5. ASCII tuning labels A through G with optional `#` or `b`;
6. multi-digit frets and open strings;
7. supported inline techniques and explicit mute notation;
8. W, H, Q, E, and S rhythm symbols when they can be mapped without guessing;
9. explicit measures from aligned shared barlines.

The current format detector recognizes MusicXML, compressed MusicXML, Guitar Pro, PowerTab, TuxGuitar, and TablEdit, but none of those structured formats is imported.

## Current corpus

The committed real-world corpus contains six project-authored fixtures:

1. webpage-style mixed ASCII guitar with two blocks;
2. ASCII guitar with W/H/Q/E/S rhythm notation;
3. technique-heavy ASCII guitar;
4. metadata-rich two-block four-string bass;
5. two-measure ASCII rhythm tab;
6. minimal MusicXML 4.0 guitar tablature.

Five fixtures exercise ASCII parsing. The MusicXML specimen exercises detection only.

## Parser constraints found

### String-line recognition

The current string-line pattern accepts only:

`optional whitespace + A-G tuning letter + optional ASCII # or b + optional whitespace + |`

Consequences:

1. octave-qualified labels such as `E4|` are rejected;
2. Unicode accidentals such as `F♯|` or `B♭|` are rejected;
3. string-number-only lines are rejected even when the rest of the file identifies tuning;
4. prefixed labels or copied-page artifacts before the tuning label are rejected;
5. seven-string guitar, five-string bass, six-string bass, ukulele, and other string counts cannot enter the semantic path.

Not all of those should automatically become supported. Each needs an explicit rule so the parser normalizes only what it can prove.

### Instrument matching

The import coordinator accepts only contiguous string-line runs whose lengths are exact multiples of four or six. It tests only `guitar` and `bass` profiles.

Risks:

1. valid five- or seven-string material is rejected or sent to legacy fallback;
2. a run with duplicated or misordered tuning labels may satisfy the count test even though its musical identity is unsafe;
3. count alone determines structural plausibility before tuning sequence is validated;
4. a long run can be divided mechanically into blocks without proving where one musical block ends and another begins.

### Unsupported inline notation

Every unrecognized non-space, non-dash character becomes an `unsupported` token. Every token start column is then included in the semantic position list.

This can create false musical positions for notation such as:

1. parentheses around ghost notes;
2. angle brackets around harmonics;
3. repeat punctuation;
4. grace-note or trill markers;
5. annotation letters embedded inside a string line;
6. symbols that describe the neighboring fret rather than an independent event.

Preserving unsupported source material is correct. Promoting unsupported punctuation into a playable position is not.

Checkpoint 1 must separate:

- source preservation;
- warning generation;
- musical event creation.

An unsupported symbol may be preserved and reported without automatically becoming a semantic position.

### Techniques

The parser recognizes hammer-on, pull-off, ascending and descending slide, bend, bend release, vibrato, muted note, tap, and generic slide symbols.

The model currently treats technique symbols as token columns. The audit must determine whether a technique is:

1. a transition attached to the preceding and following notes;
2. a state attached to one note;
3. an independent audible event;
4. unsupported in the current semantic vocabulary.

The parser must not create extra instructional steps merely because a technique symbol occupies its own ASCII column.

### Non-tablature structure

Titles, headings, lyrics, tuning declarations, capo, tempo, count lines, and prose are currently ignored for parsing and summarized as ignored-line warnings.

This avoids false notes, but it does not yet satisfy the architecture’s goal of preserving useful document structure. A later bounded checkpoint should retain section labels and source text as semantic document structure without inserting them into the playing-position sequence.

### Rhythm limits

Current ASCII rhythm support covers unambiguous W, H, Q, E, and S symbols. It does not yet establish general support for:

1. dotted values;
2. ties across positions or measures;
3. tuplets;
4. explicit rests in the rhythm line;
5. multiple simultaneous rhythm voices;
6. swing or feel annotations;
7. source-specific duration legends beyond the accepted symbols.

These must remain warnings or unsupported structures until explicit rules exist.

## Checkpoint 1 fixture matrix

The minimum new project-authored fixture set should cover:

1. octave-qualified tuning labels;
2. Unicode sharp and flat tuning labels;
3. alternate tuning with all string labels present;
4. duplicate and misordered tuning labels that must fail safely;
5. seven-string guitar and five-string bass detection with an honest support decision;
6. uneven line lengths with trailing omissions;
7. internal double barlines and repeat punctuation;
8. parenthesized ghost-note notation;
9. angle-bracket harmonic notation;
10. compound technique sequences such as hammer-on and pull-off chains;
11. copied webpage material with repeated headings between complete blocks;
12. a chord diagram or unrelated pipe-delimited text that must not be mistaken for tablature;
13. unsupported inline notation that must be preserved without creating false playable positions;
14. a deliberately ambiguous rhythm line that must warn rather than guess.

Each fixture must state whether the expected result is:

- semantic import;
- semantic import with warnings;
- recognized but unsupported;
- safe rejection;
- legacy fallback.

## Minimum source changes for Checkpoint 1

1. Replace duplicated string-line regular expressions with one tested line-classification function.
2. Normalize only provable label variations, including octave suffixes and Unicode accidentals.
3. Validate tuning-label sequence and uniqueness instead of trusting string count alone.
4. Classify blocks using both count and tuning evidence.
5. Separate unsupported-source tokens from playable event columns.
6. Attach transition techniques to note relationships where deterministic; otherwise preserve them as warnings.
7. Preserve exact original source lines for desktop disclosure and diagnostics.
8. Add explicit format-support outcomes rather than silently dropping to a misleading interpretation.
9. Keep the accepted iPhone reader, speech contract, rhythm, measure, focus, and quiet navigation unchanged.

## MusicXML Checkpoint 2 mapping

Official MusicXML 4.0 tablature represents the concepts Guitar Eyes needs through:

1. TAB clef and staff details;
2. `staff-lines` and `staff-tuning` for string count and tuning;
3. technical `string` and `fret` values on notes;
4. measure order;
5. `divisions` and `duration` for timing;
6. `chord` for simultaneous notes;
7. rests, voices, backup, and forward elements for measure-time movement;
8. technical elements for hammer-ons, pull-offs, bends, taps, and related techniques.

Important numbering rule:

- MusicXML technical string number 1 is the highest-pitched full-length string.
- Staff-tuning line 1 is the bottom staff line, normally the lowest-pitched string in guitar tablature.

The importer must map those two coordinate systems deliberately rather than assume their numbers are interchangeable.

A supported MusicXML part must contain usable explicit string-and-fret tablature. Standard-notation-only MusicXML must not be converted into invented fingering.

Duration should be normalized to quarter-note units from `duration / divisions`, retaining the written note type when available for speech and diagnostics.

Notes carrying `chord` share the previous note onset. Multiple voices require a measure cursor that respects `backup` and `forward`; document order alone is not sufficient.

## Guitar Pro route

The current leading candidate is alphaTab because it provides browser-capable importers and a data model for Guitar Pro and MusicXML. Its use must remain an evaluation, not an assumption.

Before adding it, verify:

1. MPL-2.0 obligations;
2. supported Guitar Pro generations;
3. access to strings, frets, beats, durations, measures, tracks, and techniques through the data model;
4. bundle-size and Create React App compatibility;
5. whether import-only use can avoid rendering, audio workers, fonts, and sound assets;
6. deterministic conversion from alphaTab’s model into the Guitar Eyes semantic document;
7. zero-dollar browser operation with no network service.

Do not adopt alphaTab merely because it can display or play a score. Guitar Eyes needs semantic import, not a second inaccessible renderer.

## Immediate next work

1. Add the fixture matrix before changing parser behavior.
2. Write failing tests for the safe normalization and false-position cases.
3. Implement only the minimum shared line classifier and event-column corrections needed to satisfy those tests.
4. Keep MusicXML implementation separate from ASCII hardening so either checkpoint can fail without contaminating the other.
5. Do not publish or request owner testing until a coherent source checkpoint passes its full inherited suite.

No teacher mode, playback, looping, bookmarks, pattern analysis, or AI work is authorized.
# Tablature Intake Expansion Plan

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Current accepted implementation source: `72159d25958fffd941c95351c6781cf579e1d622`

Status: authoritative next-phase direction; implementation checkpoints remain bounded and separately verified

## Correction of course

The earlier recommendation to begin teacher mode before playback was premature and has been removed.

Convergence established one musical engine and two accessible reader interfaces. It did not establish broad file-format intake. Guitar Eyes should not build teacher mode, playback, looping, bookmarks, pattern analysis, or AI on top of a needlessly narrow import surface.

The next phase is tablature intake expansion.

## Current truth

Guitar Eyes currently parses ASCII text tablature and can interpret:

1. six-string guitar and four-string bass;
2. automatic instrument detection;
3. multiple complete tablature blocks;
4. metadata and ordinary text surrounding tablature;
5. multi-digit frets and open strings;
6. supported techniques and explicit mute notation;
7. W, H, Q, E, and S rhythm values;
8. aligned measure bars and positions within measures;
9. common tuning labels and some spacing variation.

Guitar Eyes currently recognizes but does not import:

1. MusicXML and `.xml`;
2. compressed MusicXML `.mxl`;
3. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, and `.gp`;
4. PowerTab `.ptb` and `.pt2`;
5. TuxGuitar `.tg`;
6. TablEdit `.tef`.

Recognition is not reading. A specific unsupported-format message is useful, but it does not satisfy the reader objective.

## Governing objective

A supported source must enter the existing semantic tablature document rather than create a second musical model.

Every importer must normalize its source into the same authority already used by desktop and iPhone:

- instrument identity;
- strings and tuning;
- synchronized positions;
- frets, open strings, mutes, and techniques;
- duration;
- measures and blocks;
- warnings and preserved unsupported material.

Both reader interfaces must then work without format-specific branches in their musical behavior.

## Required sequence

### Checkpoint 1: Real-world ASCII expansion

1. Expand the lawful fixture corpus with additional real-world ASCII variations.
2. Cover alternate tuning labels, irregular spacing, repeated section headings, multiple blocks, wrapped webpage text, rhythm-line placement, technique combinations, and uneven source lines.
3. Distinguish safe normalization from guessing.
4. Preserve unsupported symbols and issue specific warnings rather than silently deleting them.
5. Keep the accepted iPhone speech, focus, rhythm, measure, and quiet-navigation contracts unchanged.

This checkpoint should reduce false rejection and false interpretation within the format most users can paste or download freely.

### Checkpoint 2: Actual uncompressed MusicXML import

1. Import MusicXML 4.0 guitar and bass tablature from `.musicxml` and `.xml` files.
2. Read part and instrument identity, staff tuning, string numbers, fret numbers, measures, voices, chords or simultaneous notes, rests, and duration values when explicitly represented.
3. Normalize supported data into the existing semantic document.
4. Preserve unsupported MusicXML elements as warnings with enough source context to investigate them.
5. Reject ordinary notation-only MusicXML that does not contain usable string-and-fret tablature rather than inventing fingering.
6. Add project-authored and lawfully reusable fixtures plus deterministic importer tests.
7. Prove equivalent desktop and iPhone output from the imported semantic document.

MusicXML is first because it is an open structured format and already represents the same concepts Guitar Eyes understands.

### Checkpoint 3: Compressed MusicXML

Add `.mxl` container extraction only after uncompressed MusicXML is accepted. Container handling must not duplicate or fork the MusicXML parser.

### Checkpoint 4: Guitar Pro

Use a verified, browser-compatible structured importer rather than reverse-engineering proprietary generations independently. Evaluate the existing alphaTab route and its licensing, supported versions, browser cost, bundle size, and ability to expose strings, frets, rhythm, measures, and techniques without creating a second playback-centric model.

Guitar Pro support must be judged by semantic import quality, not merely whether a third-party score renderer can display the file.

### Checkpoint 5: PowerTab, TuxGuitar, and TablEdit

For each format, choose among:

1. a direct licensed parser;
2. a deterministic conversion path into MusicXML or another accepted structured representation;
3. continued honest recognition when no safe zero-cost browser route exists.

Do not claim support based only on extension recognition or desktop-only conversion software unavailable to the user.

## Testing and acceptance

Each importer checkpoint must include:

1. exact source provenance and licensing for fixtures;
2. parser and normalization tests;
3. cross-interface semantic-equivalence tests;
4. unsupported-content and failure-message tests;
5. production build and compiled-artifact checks;
6. hosted read-back when a preview is published;
7. one bounded real-iPhone Safari and VoiceOver acceptance test before the checkpoint passes.

Jason is not required for importer development. A later desktop review remains useful but optional unless he agrees to participate.

## Cost discipline

1. Complete source research, fixture design, parser design, and most implementation in Chat before requesting metered execution.
2. Lock execution to an exact branch and commit.
3. Use GitHub-hosted workflows only as intentional checkpoints, never as an exploratory debugging loop.
4. Preserve the account's zero-dollar boundary.
5. Do not use paid APIs, paid conversion services, commercial scraping, or undocumented runtime dependencies.

## Immediate bounded task

Begin Checkpoint 1 with a read-only gap audit of the existing ASCII corpus and parser, followed by a concrete fixture matrix and minimum parser changes.

In parallel, research the official MusicXML 4.0 tablature representation and define the semantic mapping required for Checkpoint 2.

Do not begin teacher mode, playback, looping, bookmarks, pattern analysis, or AI work during these intake checkpoints.

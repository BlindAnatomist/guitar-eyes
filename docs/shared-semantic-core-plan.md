# Guitar Eyes Shared Semantic Core Plan

Last updated: July 25, 2026

## Objective

Develop Guitar Eyes as one musical system with two optimized reader interfaces:

1. Jason's spatial desktop grid reader;
2. John's sequential iPhone VoiceOver reader.

The interfaces may remain different. They must not maintain separate understandings of the tablature.

## Repository boundary

1. Preserve `Phlypper/guitar-eyes` untouched.
2. Preserve fork `main` as the clean upstream-tracking branch.
3. Preserve the accepted iPhone proof on `work/iphone-voiceover-tablature-audit`.
4. Perform unification work only on `work/shared-semantic-core`.
5. Do not open a pull request or merge without a separately authorized checkpoint.

## Governing architecture

Tablature follows one pipeline:

`source -> import and normalization -> semantic tablature document -> reader adapter`

The semantic document is authoritative for strings, tuning, frets, simultaneous positions, techniques, rhythm, measures, sections, and warnings.

Reader adapters expose that document differently:

1. Desktop adapter: spatial rows, columns, keyboard navigation, and grouped reading.
2. iPhone adapter: synchronized positions, sequential controls, and restrained VoiceOver announcements.

Playback, teaching, looping, bookmarks, pattern recognition, and optional AI must consume the same semantic document rather than creating new parsers.

## Phased convergence

### Checkpoint 1: Shared source and compatibility adapter

1. Read an uploaded file once.
2. Parse supported six-string guitar tablature into the semantic document once.
3. Project that same document into Jason's existing desktop-grid input shape.
4. Continue using the semantic document directly in the iPhone reader.
5. Retain Jason's legacy parser as a compatibility fallback for bass, multiple blocks, and unsupported documents.
6. Preserve current desktop controls and current iPhone behavior.

This checkpoint proves convergence without narrowing Jason's existing reader.

### Checkpoint 2: Expand the semantic document

1. Add four-string bass.
2. Add multiple tablature blocks.
3. Preserve titles, lyrics, headings, comments, and non-tab text as document structure.
4. Normalize common tuning-label and spacing variations.
5. Build a representative fixture collection from multiple tab sources and formats.

Each newly supported format must become semantic-first, reducing use of the legacy fallback.

### Checkpoint 3: Make the desktop reader semantic-native

1. Replace character reconstruction inside `DataGrid` with cells supplied by the semantic desktop adapter.
2. Remove duplicated two-digit-fret handling.
3. Give grid cells meaningful string, column, measure, technique, and musical-position metadata.
4. Preserve Jason's established keyboard commands and spatial navigation.
5. Retain a temporary comparison path until semantic and legacy output agree across the fixture collection.

### Checkpoint 4: Shared musical capabilities

Build rhythm, measures, sections, playback, looping, teaching, bookmarks, and deterministic pattern recognition once against the semantic document. Expose each capability through both interfaces as appropriate.

## Verification strategy

1. Shared contract tests: one source must produce one semantic document and consistent desktop and iPhone projections.
2. Desktop regression tests: preserve grid structure, guitar and bass selection, grouped columns, keyboard behavior, and spoken-group behavior.
3. iPhone regression tests: preserve parsing, semantic descriptions, controls, live announcements, and native-file-picker focus recovery.
4. Fixture tests: clean six-string tab first, then bass, multiple blocks, irregular spacing, techniques, rhythm rows, headings, lyrics, and source-specific variants.
5. Human acceptance: John tests iPhone checkpoints. Jason or another desktop screen-reader user tests desktop behavior only when a meaningful desktop checkpoint is ready.

## Immediate implementation boundary

This branch begins Checkpoint 1 only. It must not redesign `DataGrid`, add playback or teaching mode, remove the legacy parser, merge to `main`, or modify upstream.

Checkpoint 1 passes when a supported six-string guitar file is read once, parsed once into the semantic document, and used by both readers while unsupported desktop documents still use the legacy fallback.
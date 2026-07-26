# Real-World Tablature Format Corpus Plan

Date: July 26, 2026

Branch: `work/real-world-tab-format-corpus`

Base checkpoint: completed shared semantic core acceptance on `work/shared-semantic-core`.

## Objective

Build a lawful, reproducible corpus of tablature formats that Guitar Eyes must normalize into one semantic musical model for both the desktop grid reader and the iPhone semantic reader.

This phase is not a redesign of either interface. It establishes the evidence and test material needed before expanding import support.

## Governing rule

Guitar Eyes should not depend on scraping a commercial tablature website whose HTML, access rules, or licensing may change.

The project may analyze material that a user lawfully uploads, pastes, or links for personal use. The repository itself will retain only:

1. project-authored specimens;
2. public-domain material with verified provenance;
3. openly licensed fixtures whose license permits repository use;
4. metadata and external references when copying the source file is not appropriate.

## Format families

### 1. ASCII text tablature

Common extensions: `.txt`, `.tab`, copied webpage text, forum posts, email, notes applications.

Expected variations:

- title, artist, source, tuning, capo, tempo, and author lines;
- section labels such as Intro, Verse, Chorus, Bridge, Solo, and Outro;
- lyrics or chord names interleaved with tablature;
- four-string bass and six-string guitar;
- multiple tablature blocks;
- string lines in upper-to-lower or lower-to-upper order;
- bar separators and repeat marks;
- unequal line lengths;
- one-digit and two-digit frets;
- techniques such as hammer-ons, pull-offs, slides, bends, releases, vibrato, taps, muted notes, harmonics, palm muting, and let-ring annotations;
- rhythm lines using symbols such as W, H, Q, E, and S;
- Unicode punctuation or copied webpage debris.

This is the current highest-priority family because it matches the existing upload path and the most likely user-provided material.

### 2. MusicXML and compressed MusicXML

Common extensions: `.musicxml`, `.xml`, `.mxl`.

MusicXML can explicitly encode measures, durations, time signatures, string numbers, fret numbers, tunings, voices, repeats, and guitar techniques. It is therefore a strong structured source for rhythm, measures, playback, and teaching features.

Primary reference:

- MusicXML 4.0 tablature tutorial: `https://www.w3.org/2021/06/musicxml40/tutorial/tablature/`

Potential public-domain source:

- PDMX public-domain MusicXML dataset: `https://zenodo.org/records/15571083`

Use only entries from a no-license-conflict subset and verify that the selected score actually contains guitar tablature string/fret data.

### 3. Guitar Pro

Extensions include `.gtp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, and `.gp`.

These formats can carry tracks, measures, rhythm, repeats, techniques, lyrics, tempo, and playback information. Older versions are binary; later versions use archive/XML structures.

Potential import library:

- alphaTab: `https://www.alphatab.net/docs/category/formats/`

alphaTab already imports Guitar Pro 3 through 8 and MusicXML into one score model. Guitar Eyes should evaluate using a mature importer rather than reverse-engineering every Guitar Pro version independently.

### 4. PowerTab and Power Tab Editor 2

Extensions: `.ptb`, `.pt2`.

Power Tab Editor is GPL-3.0 open source and supports `.pt2`, `.ptb`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, and `.gp`.

Reference:

- `https://github.com/powertab/powertabeditor`

Before copying any test fixture from that repository, verify the fixture's provenance and whether it is covered by the repository license or has separate restrictions.

### 5. TuxGuitar and TablEdit

Extensions: `.tg`, `.tef`.

TuxGuitar can open its native format, Guitar Pro formats, PowerTab, and TablEdit, and can export ASCII text and MusicXML-related interchange material.

Reference:

- `https://www.tuxguitar.app/files/1.6.3/desktop/help/file_formats.html`

TuxGuitar may provide a zero-cost conversion path for fixtures when direct browser import is not yet practical.

## Acquisition routes

### Route A: project-authored structural specimens

Create short original note sequences that reproduce common real-world wrappers and notation conventions without copying a copyrighted song. These fixtures may be committed and used in automated tests.

### Route B: standards-based structured specimens

Create minimal MusicXML examples from the public specification and original musical content. These fixtures test string, fret, tuning, duration, measure, and repeat extraction.

### Route C: public-domain datasets

Use PDMX's no-license-conflict subset to locate a small number of guitar tablature MusicXML files. Record the dataset version, row identifier, source license metadata, and checksum for every retained file.

Do not download the entire multi-gigabyte dataset for this project. Select individual verified fixtures through its metadata or a small extraction workflow.

### Route D: open-source importer test suites

Inspect alphaTab, Power Tab Editor, and TuxGuitar test-data directories for representative Guitar Pro, PowerTab, TuxGuitar, and MusicXML files. Retain only fixtures with clear licensing and provenance.

### Route E: user-provided files

Allow users to upload files they already possess. Treat these as private acceptance material unless the user explicitly confirms that a file may be added to the repository.

### Route F: commercial or community tab websites

Do not bulk scrape or permanently depend on undocumented internal APIs.

A later intake feature may accept:

- pasted tab text;
- a user-provided page link;
- a browser share-sheet transfer;
- a downloaded file supplied by the user.

The normalizer should extract the tablature from the supplied material without storing or redistributing a complete copyrighted song in the repository.

## Corpus tiers

### Tier 1: committed fixtures

Small, deterministic, original or verified-open files used in automated tests.

### Tier 2: external reference registry

URLs, format descriptions, licenses, expected features, and checksums for files that should not be copied into the repository.

### Tier 3: private acceptance files

User-owned or user-supplied tabs used for manual testing but not committed.

## Initial committed specimens

1. `ascii-webpage-mixed-content.txt`
   - title and metadata;
   - tuning and capo lines;
   - chord and lyric debris;
   - two guitar tablature blocks;
   - section labels.

2. `ascii-rhythm-line.txt`
   - a rhythm-value line using W, H, Q, E, and S;
   - one six-string block;
   - current parser should preserve the notes but does not yet attach durations.

3. `ascii-techniques-and-annotations.txt`
   - palm-mute and let-ring annotation lines;
   - hammer-on, pull-off, slide, bend, release, vibrato, tap, muted note, and harmonic-like notation;
   - drives technique normalization.

4. `ascii-bass-with-metadata.txt`
   - four-string bass;
   - title, tuning, tempo, and section text;
   - verifies instrument detection amid non-tab content.

5. `musicxml-minimal-guitar-tab.musicxml`
   - one original measure;
   - standard six-string tuning;
   - explicit duration, string, and fret data;
   - establishes the structured-import target.

## First implementation checkpoint

Before adding a full new importer, create a format preflight detector that can distinguish:

- supported ASCII text;
- MusicXML or compressed MusicXML;
- Guitar Pro;
- PowerTab;
- TuxGuitar;
- unknown material.

The upload workflow should then give an accurate message instead of treating every non-`.txt` file as generically invalid.

No structured file should be falsely reported as successfully parsed until a verified importer exists.

## Testing boundary

Automated tests will protect format recognition, semantic normalization, and desktop projection.

The owner will continue to perform only iPhone Safari and VoiceOver acceptance tests. No desktop or laptop testing will be assigned to the owner.

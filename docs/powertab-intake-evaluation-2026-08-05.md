# PowerTab Intake Evaluation

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-intake-evaluation`

Exact evaluation base: `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`

Accepted application source preserved: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Status: read-only format, decoder, licensing, fixture, and architecture evaluation complete. No PowerTab importer has been implemented, and no PowerTab reading support is claimed.

## Objective

Determine the lawful and technically sound route for adding PowerTab to Guitar Eyes without creating a second musical model, weakening the accepted reader contracts, copying provenance-uncertain fixtures, importing rendering or playback machinery, or conflating the modern `.pt2` format with the legacy `.ptb` family.

## Current Guitar Eyes state

`src/tabFormatDetector.js` already recognizes `.pt2` and `.ptb` as PowerTab files. It deliberately reports them as recognized but unsupported.

Recognition is not reading support. No PowerTab file currently reaches a decoder, intermediate representation, semantic normalization route, desktop reader, or iPhone reader.

## Authoritative upstream examined

The official open-source successor is `powertab/powertabeditor`, the Power Tab Editor project.

The project identifies both `.pt2` and `.ptb` as supported file types. Its main implementation is C++ and the repository is distributed under GPL-3.0. The legacy Power Tab document source retained inside the project includes older wxWindows-license headers.

This evaluation uses the upstream implementation as evidence about file structure and compatibility. It does not authorize copying or mechanically porting upstream code into Guitar Eyes. Any code reuse or compiled decoder proposal requires a separate explicit licensing and architecture decision.

## Finding 1: `.pt2` and `.ptb` are not one parser problem

The two extensions belong to the same product lineage but use materially different storage models and version systems.

They must be staged as separate checkpoints. A passing `.pt2` implementation must not be described as generic PowerTab or `.ptb` support.

## Modern Power Tab Editor `.pt2`

### Container and serialization

The official importer at:

`source/formats/powertab/powertabimporter.cpp`

opens `.pt2` as binary data, applies gzip decompression, and passes the decompressed stream to the score serializer.

The official exporter at:

`source/formats/powertab/powertabexporter.cpp`

serializes the score and gzip-compresses the result.

The score serialization implementation at:

- `source/score/serialization.cpp`
- `source/score/serialization.h`

uses `nlohmann::json`, reads a root-level integer `version`, and serializes the score beneath a named score object.

Therefore the modern `.pt2` route is:

`gzip container -> versioned JSON -> Power Tab score structure`

### Version evidence

`source/score/fileversion.h` defines `.pt2` file versions from 1 through 11 in the current source examined.

Important schema boundary:

- version 10 is `JSON_CLEANUP`, which changed the JSON representation to make it easier for other applications to parse;
- version 11 adds chord-diagram descriptions;
- the current exporter writes the latest version.

The upstream importer attempts best-effort loading of unknown newer versions. Guitar Eyes must not copy that permissive behavior. It must reject an unverified version rather than interpreting it as the latest known schema.

### Initial support recommendation

The first PowerTab implementation checkpoint should target only a project-authored `.pt2` file produced by the current verified Power Tab Editor release and carrying exact internal version 11.

Versions 1 through 10 remain recognized but unsupported until separately mapped and tested. Extension recognition alone must never widen the support claim.

### Browser feasibility

A browser implementation does not require the Power Tab Editor renderer, Qt interface, MIDI engine, sound system, notation fonts, or playback machinery.

The required browser boundary is limited to:

1. byte-level gzip validation and decompression;
2. strict JSON parsing;
3. exact internal-version validation;
4. extraction into a project-owned serializable intermediate;
5. normalization into the existing Guitar Eyes semantic document.

The evaluation did not establish a maintained browser-native PowerTab decoder suitable for direct adoption. Current alphaTab documentation lists Guitar Pro, MusicXML, CapXML, and alphaTex importers, but not PowerTab.

The preferred `.pt2` route is therefore a narrow project-owned importer, not expansion of alphaTab and not embedding Power Tab Editor.

## Legacy Power Tab `.ptb`

### Internal identity and versions

The legacy source at:

- `source/formats/powertab_old/powertabdocument/powertabfileheader.h`
- `source/formats/powertab_old/powertabdocument/powertabfileheader.cpp`

establishes a binary marker corresponding to `ptab` and defines historical versions:

1. 1.0;
2. 1.0.2;
3. 1.5;
4. 1.7.

The header also distinguishes song and lesson files and advertises guitar, bass, and percussion content flags.

### Conversion complexity

The legacy importer at:

`source/formats/powertab_old/powertaboldimporter.cpp`

loads a large binary document graph and converts separate guitar and bass scores into the modern score model before merging them. Its source references systems, staves, positions, notes, rhythm slashes, chord diagrams, alternate endings, directions, dynamics, floating text, tempo markers, and numerous compatibility conversions.

This is not equivalent to decompressing and reading JSON. A `.ptb` parser must validate each supported binary version and preserve enough structure to make track, instrument, timing, and notation decisions without guessing.

### Legacy support recommendation

`.ptb` must remain a separate later checkpoint after `.pt2` closes.

That checkpoint must decide among:

1. an independently implemented bounded parser;
2. a separately licensed or compatible decoder;
3. a tightly isolated compiled decoder with an explicit distribution and bundle review;
4. continued recognition with safe rejection if no lawful maintainable route is established.

No option is selected by this evaluation.

## Fixture and provenance plan

### `.pt2` source fixture

Create one short original six-position guitar score using no copyrighted composition. Generate it with an exact recorded Power Tab Editor release and preserve:

1. editor version and release commit;
2. operating environment used for generation;
3. exact original note sequence;
4. string count and tuning;
5. measures, durations, rests, chord, and techniques intentionally included;
6. decompressed JSON audit;
7. internal file version;
8. SHA-256 hash of the binary;
9. a statement that the musical content is project-authored;
10. deterministic expected semantic positions.

The initial fixture should parallel the accepted Guitar Pro semantic corpus where practical so parity can be tested across format families without claiming that the binary files are identical.

### `.ptb` fixtures

Do not copy an upstream `.ptb` fixture merely because it sits inside an open-source repository.

A later `.ptb` checkpoint requires project-authored or otherwise clearly licensed files for every historical version claimed. If the project cannot reproducibly create or lawfully establish a version-specific fixture, that version remains unsupported.

### Private real-world material

User-owned PowerTab files may later be used as private acceptance material. They must not be committed or redistributed unless the owner explicitly establishes permission and provenance.

## Required `.pt2` semantic profile

The first implementation checkpoint must prove only the structures encoded by its lawful fixture and explicit tests. At minimum it should establish:

1. exact `.pt2` identity after gzip and JSON validation;
2. exact internal version 11;
3. one supported six-string guitar track or player;
4. complete tuning evidence;
5. measures and time order;
6. synchronized positions;
7. fretted and open notes;
8. at least one chord;
9. at least one rest;
10. supported written durations;
11. safe preservation or rejection of unsupported structures;
12. the same semantic document for desktop and iPhone.

Multi-player or multi-track input must use explicit inventory and selection. No track, player, staff, or instrument may be silently chosen.

## First source checkpoint boundary

The first implementation checkpoint is `.pt2` version 11 only.

Authorized source categories for that future checkpoint are:

1. a lazy PowerTab `.pt2` importer boundary;
2. bounded gzip decoding;
3. strict JSON and internal-version validation;
4. a project-owned version-11 intermediate;
5. inventory and explicit selection where required;
6. normalization into the existing semantic document;
7. focused detection, corruption, version, inventory, normalization, parity, and application-path tests;
8. lawful fixture, provenance, hashes, and third-party notices;
9. documentation and known-problem updates arising from actual work.

The checkpoint must not add:

- `.ptb` parsing;
- TuxGuitar or TablEdit;
- a second reader or semantic model;
- Power Tab Editor rendering;
- notation fonts;
- MIDI or audio playback;
- soundfonts;
- workers unrelated to bounded decoding;
- teacher mode;
- bookmarks, scoring, pattern analysis, or AI work.

## Failure and rejection rules

Guitar Eyes must reject rather than guess when:

1. gzip structure is invalid;
2. decompressed data is not valid JSON;
3. internal version is absent, malformed, or not exactly accepted;
4. declared players, staves, instruments, strings, or tunings contradict the decoded structure;
5. no supported tablature track can be identified;
6. multiple supported choices exist and the user has not selected one;
7. duration, onset, string, fret, or tuning identity cannot be preserved;
8. required source structure exceeds the bounded version-11 profile.

Errors must use the accepted durable iPhone Files-picker focus recovery and must not weaken selection or reading order.

## Verification envelope for a future `.pt2` checkpoint

Before `.pt2` support is claimed:

1. prove branch ancestry from this evaluation line and exact accepted application authority;
2. verify fixture provenance and hashes;
3. run focused importer and semantic-parity suites;
4. run the complete inherited suite;
5. create the optimized production build;
6. inspect the bundle for decoder scope and absence of rendering, audio, soundfont, and unrelated Power Tab machinery;
7. publish only through a separately authorized bounded zero-dollar checkpoint;
8. read back the exact hosted assets;
9. perform bounded real-iPhone Safari and VoiceOver acceptance;
10. record the owner's exact observations without strengthening them;
11. close documentation before beginning `.ptb` or another format family.

## Evaluation verdict

PowerTab should proceed in two stages:

1. implement and accept modern `.pt2` version 11 through a narrow browser importer;
2. evaluate and implement legacy `.ptb` separately only after `.pt2` is closed.

The `.pt2` source checkpoint is technically plausible and architecturally compatible with Guitar Eyes.

The `.ptb` route is valuable but materially heavier and remains deferred pending a separate decoder, licensing, and versioned-fixture decision.

## Repository actions during this evaluation

- no application source changed;
- no dependency changed;
- no fixture was added;
- no workflow changed or ran;
- no preview was published;
- no pull request was opened;
- nothing was merged;
- fork `main` and upstream remained untouched.

# PowerTab `.pt2` Version-11 Source Checkpoint Result

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Work branch: `work/powertab-pt2-v11-source-checkpoint`

Exact starting head: `e53f82476eed45722bff959a5036da3481159ce9`

Accepted application authority preserved: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Pinned upstream evidence:

- Power Tab Editor release: `2.0.22`
- Power Tab Editor commit: `13cab27c7127d301f2747671071e53eb203dc940`
- Exact accepted internal document version for this checkpoint: `11`

Status: source checkpoint implemented as a provisional branch candidate. No public PowerTab support is claimed.

## Implemented boundary

This checkpoint adds only the modern Power Tab Editor `.pt2` route:

`gzip bytes -> strict UTF-8 JSON -> exact version 11 -> project-owned PowerTab intermediate -> explicit player inventory -> accepted semantic document -> existing desktop and iPhone readers`

The implementation does not add or embed:

- legacy `.ptb` parsing;
- Power Tab Editor source or compiled code;
- Qt;
- rendering;
- notation fonts;
- MIDI;
- playback;
- soundfonts;
- teacher mode;
- bookmarks;
- pattern analysis;
- scoring;
- AI instruction.

No new runtime dependency was added.

## Source profile

The decoder accepts only exact `.pt2` internal version 11 and rejects rather than guesses when the bounded profile is exceeded.

The fixture-proven profile contains:

- one standard six-string guitar player;
- explicit player-to-staff assignment;
- one system;
- two measures in 4/4;
- quarter, eighth, and half-note durations;
- open and fretted notes;
- one palm-muted position;
- one timed rest;
- one two-note chord;
- exactly six synchronized positions.

The source checkpoint also implements explicit inventory and selection plumbing for multiple decoded six-string players. That path is covered structurally by focused tests but is not yet backed by a canonical editor-exported multi-player fixture.

Four-string bass and other string counts remain outside this first fixture-proven PowerTab profile.

## Fixture evidence

Directory:

`fixtures/powertab-v11`

Project-authored original source:

`powertab-v11-original-six-position.source.json`

Deterministic source-derived container:

`powertab-v11-original-six-position.pt2`

Text-safe mirror:

`powertab-v11-original-six-position.pt2.base64`

Manifest:

`manifest.json`

Generator:

`scripts/generate-powertab-v11-proof.mjs`

Deterministic evidence:

- canonical JSON bytes: `3628`
- canonical JSON SHA-256: `256a825e6e91afe13065523abeeafbdae97724562057ac87b40f4b70ea6476a5`
- gzip container bytes: `971`
- gzip container SHA-256: `669f9b71e7f8ba3c9ce939b98076bbddc17fb977b63b7f647f4bd01cfa072e71`

The musical material is project-authored and recorded as CC0-1.0.

The fixture is deliberately marked `editorExported: false`. It was generated from the serializer structure established by the pinned upstream source. It is lawful parser evidence, but it is not a substitute for a file exported by the pinned Power Tab Editor application.

## Application and accessibility preservation

The accepted application route remains one semantic document with two presentations.

The checkpoint preserves:

- the existing desktop and iPhone readers;
- the existing durable iPhone Files-picker focus recovery;
- the existing success and error headings;
- the existing explicit selection order;
- no silent player selection;
- selected-player details immediately before the load action;
- quiet movement and dedicated Read current position behavior;
- no playback controls or playback language.

The existing Guitar Pro selector component was parameterized with format-specific labels rather than duplicated. The existing Guitar Pro builder remains unchanged. A narrow structured-format router lazily loads the PowerTab builder only for `.pt2` or exact `PT2_V11` intermediate evidence.

## Focused source checks completed

The following zero-dollar local checks completed:

1. Node syntax validation of 19 changed or added JavaScript modules.
2. Deterministic fixture regeneration and manifest verification.
3. Direct gzip decoding of the committed `.pt2` mirror.
4. Exact recovery of:
   - title;
   - one six-string player;
   - two measures;
   - four positions in measure one;
   - two positions in measure two;
   - absolute semantic starts `0, 960, 1440, 1920, 3840, 5760`.
5. Player inventory resolution as one supported six-string guitar.
6. Direct rejection probes for:
   - internal version 10;
   - unproved whole-note duration;
   - repeat barline structure;
   - non-default key signature;
   - root chord-diagram structure.
7. Metadata-adapter execution proving that internal Guitar Pro compatibility labels are converted without rewriting user-authored titles or player names.

Focused Jest coverage was added for detection, corruption, version rejection, fixture hashes, decoder structure, inventory, selection, semantic normalization, shared reader parity, application routing, and durable iPhone result focus.

## Gates not run in this checkpoint

The following gates remain deliberately incomplete:

- locked dependency installation;
- focused Jest execution in the complete repository;
- complete inherited test suite;
- optimized production build;
- bundle and asset-boundary inspection;
- hosted publication;
- hosted asset read-back;
- real-iPhone Safari and VoiceOver acceptance.

No GitHub Actions workflow was run.

## Support-claim boundary

This branch must not be described as accepted PowerTab support.

Before support can be claimed:

1. reproduce the same original score through the pinned Power Tab Editor 2.0.22 application;
2. record the exact generation environment;
3. preserve the editor-exported `.pt2` and its hashes;
4. compare its decompressed version-11 structure with the source-derived evidence;
5. prove semantic parity;
6. run the focused and complete inherited suites;
7. create and inspect the production bundle;
8. publish only through a separately authorized zero-dollar checkpoint;
9. complete bounded real-iPhone Safari and VoiceOver acceptance;
10. record the owner's exact observations without strengthening them.

Until those gates close, `.pt2` remains `source-checkpoint-provisional`.

## Repository boundary

This checkpoint does not:

- change fork `main`;
- change upstream;
- open a pull request;
- merge;
- deploy;
- run GitHub Actions;
- begin `.ptb`;
- begin another format family;
- resume playback or teacher-mode work.

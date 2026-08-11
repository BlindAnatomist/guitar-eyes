# TuxGuitar `.tg` Intake Investigation

Date: 2026-08-11

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tuxguitar-tg-intake-investigation`

Accepted base: `10a0d7f40eedf701d55e519b8a311c1816d4e077`

Status: active provisional format-intake checkpoint. `.tg` must not be described as accepted support until corrected hosted and real-iPhone gates pass.

## Governance

This branch descends from the final accepted PowerTab documentation-closure head. Fork `main` and `Phlypper/guitar-eyes` remain untouched. No pull request or merge is authorized.

The governing rules remain the canonical known-problems register, execution-gate addendum, semantic-convergence addendum, cross-repository execution reconciliation, zero-dollar policy, branch authority, and implementation status.

TuxGuitar must normalize into the existing shared semantic tablature document. It may not create a separate iPhone reader, desktop reader, speech system, playback system, or musical model.

## Producer authority

Pinned producer source for the active correction:

- repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- license: LGPL 2.1.

Modern native `.tg` uses ZIP with exactly:

1. `version.txt`;
2. `content.xml`.

The current native file-format version remains `2.0.0`. The XML `<TGVersion>` element records producer application-version metadata and is not the native-format version gate.

## Historical native-format map

Current TuxGuitar compatibility readers cover:

- 0.7;
- 0.8;
- 0.9;
- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5.

Current compatibility writers/exporters cover:

- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5.

No native 1.4 compatibility module is registered.

Versions 0.7 through 0.9 remain deferred archival work because current TuxGuitar reads but does not register writers for them.

## First compatibility corpus

The provisional first corpus is:

1. native 1.0;
2. native 1.1;
3. native 1.2;
4. native 1.3;
5. native 1.5;
6. modern native file format 2.0.0.

All six project fixtures are deterministic, project-authored, source-derived evidence. None is a TuxGuitar application export and none may be described as one.

The musical proof remains the existing CC0 six-position Guitar Eyes score: standard six-string guitar, four single-note events, one rest, one final two-note chord, two 4/4 measures, and one palm-mute marker.

## Modern producer-source correction

A later direct TuxGuitar 2.1.0 source audit found that the earlier green source gate and hosted proof contained a false modern compatibility loop:

1. they treated XML application-version metadata as though it were the native file-format version;
2. the modern fixture wrote semantic tick values into `preciseStart` instead of TuxGuitar precise units.

The active correction record is:

`docs/tuxguitar-tg-producer-source-correction-2026-08-11.md`.

Correct modern beat-start evidence for the six-position proof is:

- `2882880`;
- `5765760`;
- `7207200`;
- `8648640`;
- `14414400`;
- `20180160`.

The corrected modern source-derived fixture uses:

- `version.txt`: `TuxGuitar_file_format 2.0.0`;
- producer application metadata: 2.1.0;
- exact two-entry ZIP structure;
- strict bounded archive/XML validation;
- the producer-required precise-start sequence.

## Application architecture

The provisional route is integrated at the structured-format boundary:

- `.tg` is recognized by `src/tabFormatDetector.js`;
- uploads route through the existing structured-format path;
- `src/tuxGuitarDecoder.js` validates source/container evidence;
- `src/tuxGuitarTrackInventory.js` preserves explicit track-selection architecture;
- `src/tuxGuitarSourceNormalizer.js` converts the bounded intermediate into the shared semantic document;
- `src/tuxGuitarReaderDocuments.js` supplies the same document to the accepted desktop/iPhone readers;
- `src/structuredTabReaderDocuments.js` remains the common lazy structured-format insertion point.

The first proof profile remains intentionally narrow: one supported standard-tuned six-string guitar track, one active voice, 4/4 measures, basic fretted/open/rest/chord semantics, supported durations, and the demonstrated palm-mute marker. Unsupported structures must fail explicitly rather than be guessed.

## Earlier non-device gates

GitHub Actions source-gate run `31521371357` passed the earlier exact prepared source, focused tests, complete inherited suite, production build, and artifact inspection.

The earlier hosted proof then built, deployed, and read back candidate source `a50997d72010f10d2bfd415e0d44a6da2fea5c5b` successfully.

Those results are retained as historical evidence of internal reproducibility and deployment integrity. They are superseded as modern producer-compatibility evidence by the producer-source correction above. The old hosted candidate must not be sent to the owner for real-device acceptance.

## Current stop condition

Before `.tg` support can be claimed:

1. corrected deterministic fixture verification must pass;
2. corrected focused TuxGuitar tests must pass;
3. the complete inherited suite must pass;
4. production build and artifact inspection must pass;
5. one intentional corrected hosted candidate must pass live read-back;
6. bounded real-iPhone Safari and VoiceOver acceptance must pass.

No playback, teacher mode, merge, pull request, upstream modification, or archival 0.7-0.9 expansion is authorized by this checkpoint.

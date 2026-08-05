# PowerTab `.pt2` Version-11 Source Checkpoint Closure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Work branch: `work/powertab-pt2-v11-source-checkpoint`

Exact evaluation base: `e53f82476eed45722bff959a5036da3481159ce9`

Exact reconciled source-and-evidence head: `6c17997eba96e16aa248d8fd5a0e632ba5f370ce`

Exact reconciled tree: `f4506d83ea2d69e558ecb4086f41beded31ba7a0`

Branch relationship at closure: three commits ahead of the evaluation base, zero commits behind.

Accepted application authority preserved separately: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Status: source checkpoint closed as provisional evidence. Public PowerTab support is not accepted or claimed.

## Why this closure exists

The source work was interrupted during repository transport and later reconciled to the reviewed candidate tree. The earlier result record correctly preserves the bounded support claim and remaining gates, but it predates the final parser split and reports 19 changed or added JavaScript modules.

The correct local syntax-gate count is 23 changed or added JavaScript or MJS modules, including the deterministic fixture generator.

This closure supersedes that count and records the exact final source-and-evidence authority.

## Reconciled implementation boundary

The branch contains one bounded modern Power Tab Editor route:

`gzip bytes -> strict UTF-8 JSON -> exact internal version 11 -> project-owned PowerTab intermediate -> explicit player inventory and selection -> accepted semantic document -> existing desktop and iPhone readers`

The implementation is divided into narrow modules for:

1. resource limits and durable PowerTab errors;
2. exact version-11 schema validation;
3. position and note parsing;
4. system, barline, player-assignment, and measure parsing;
5. gzip, UTF-8, JSON, and version decoding;
6. player inventory and explicit selection;
7. verified semantic normalization;
8. desktop and iPhone reader-document preparation;
9. lazy structured-format routing shared with the existing Guitar Pro path.

The current `App.js` and `structuredTabReaderDocuments.js` match the reviewed local candidate hashes:

- `App.js`: `03bdaa19d6a6108ff5efa59558b18b46afb63bf5`
- `structuredTabReaderDocuments.js`: `b6b64c47540bb9b5f0076f32132615d71c8d7dd2`
- `powerTabV11Decoder.js`: `6c08d8e6fffcfcdf4f0a555c1ad235f84cbc15b9`

The system-parser source differs from the reviewed local workspace only by normalized trailing newlines; its executable content is unchanged.

## Verified source-derived fixture

Fixture:

`fixtures/powertab-v11/powertab-v11-original-six-position.pt2`

Git blob:

`4fc088d7b8fafdc11ff279de768038454edfd022`

Deterministic evidence:

- canonical JSON bytes: `3628`
- canonical JSON SHA-256: `256a825e6e91afe13065523abeeafbdae97724562057ac87b40f4b70ea6476a5`
- gzip container bytes: `971`
- gzip container SHA-256: `669f9b71e7f8ba3c9ce939b98076bbddc17fb977b63b7f647f4bd01cfa072e71`

The score is project-authored CC0-1.0 test material with one standard six-string guitar player, two 4/4 measures, six synchronized positions, open and fretted notes, one palm-muted position, one timed rest, and one two-note chord.

The fixture remains explicitly marked `editorExported: false`. It proves parser consistency against the pinned serializer structure; it does not prove compatibility with files exported by the Power Tab Editor application.

## Zero-dollar local gate repeated after interruption

The reconciled candidate passed the following local checks again:

1. syntax validation of all 23 changed or added JavaScript and MJS modules;
2. deterministic fixture regeneration and manifest verification;
3. exact binary and canonical-JSON hashes;
4. gzip decoding of the committed fixture;
5. exact recovery of two measures and six positions;
6. exact semantic starts `0, 960, 1440, 1920, 3840, 5760`;
7. player inventory resolution as one supported six-string guitar;
8. safe rejection of internal version 10;
9. safe rejection of an unproved whole-note duration;
10. safe rejection of repeat-barline structure;
11. safe rejection of non-default key-signature structure;
12. safe rejection of root chord-diagram structure;
13. normalization that changes internal Guitar Pro compatibility metadata to PowerTab metadata without rewriting user-authored titles or player names.

## Gates still deliberately incomplete

The following are not claimed:

1. locked dependency installation on the reconciled branch;
2. focused Jest execution in the complete repository;
3. the complete inherited suite;
4. optimized production build;
5. bundle and asset-boundary inspection;
6. a canonical `.pt2` exported by exact Power Tab Editor 2.0.22;
7. hosted publication and asset read-back;
8. real-iPhone Safari and VoiceOver acceptance;
9. desktop human acceptance.

No GitHub Actions workflow ran. No preview was published. No pull request was opened. Nothing was merged.

## Next lawful checkpoint

The next checkpoint must not widen parser scope.

It should:

1. reproduce the same original six-position score in exact Power Tab Editor 2.0.22;
2. export a genuine version-11 `.pt2` file;
3. record the generation environment, binary hash, and decompressed JSON audit;
4. compare the editor-produced structure with the source-derived fixture;
5. reconcile any differences without weakening rejection rules;
6. perform locked dependency installation;
7. run focused PowerTab tests and the complete inherited suite;
8. create and inspect the optimized production build;
9. stop before hosted publication unless a separate zero-dollar publication checkpoint is authorized.

John is not required until an exact hosted candidate passes every non-device gate and requires bounded iPhone Safari and VoiceOver judgment.

Legacy `.ptb`, older `.pt2` versions, TuxGuitar, TablEdit, playback, teacher mode, scoring, bookmarks, and AI work remain outside this closure.

# TuxGuitar file-size preflight checkpoint: 786 tests

Date: 2026-10-02. Technical continuation of the 556-, 621- and 708-test checkpoints on `work/reader-reliability-checkpoints-2026-10-02`. This save does not promote the accepted operational baseline.

## Exact runtime identity

- Tested runtime: `e9c1f565a751acacdbf943b2f727f68b0ec19884`.
- Completed source closure: `66021cb5b92af1b11e7ee27cf83751ae6624f1d1`.
- Public parent: `d557465880d8805969cdcd077cd9a91a4e1a7bf9`.
- Complete source/test tree: `69fec798e951c67e0b1d80d487f656847bf49be3`.
- Exact source and test blob identities: `source-identity-2026-10-02.json`.
- Sanitized gate evidence: `tuxguitar-file-preflight-786-evidence.json`.

The public checkpoint uses separately authored technical documentation. Its complete `src` tree is identical to the tested runtime; the four changed source/test files are copied without transformation. Fixtures, dependencies, scripts, public assets and workflows remain unchanged. Source snapshot hashes identify tested code and do not claim that those historical commits are available as public Git objects.

## Implementation boundary

The three current TuxGuitar file entrypoints now validate size metadata before calling `arrayBuffer`: `decodeTuxGuitarFile`, `decodeTuxGuitarProfileFile` and `decodeStandardBassTuxGuitarFile`.

The inclusive ceiling remains 16 MiB. Declared oversized files are rejected with zero file reads and no file-byte allocation or copy by the decoder. Missing-file validation remains first; existing error class/code and ordinary/bass messages are preserved.

Metadata is read once, without numeric coercion. Absent or explicitly undefined metadata remains supported for existing file-like callers. Present metadata must be a positive integer at or below the limit. The deliberate malformed-metadata policy rejects zero, negative, fractional, nonfinite, null, string, boolean, bigint, symbol and boxed/object values. These are defensive file-like-input cases, not claims about values normally produced by a browser File.

All routes still validate actual bytes after reading. The profile and bass routes now check actual length before their existing defensive copies. Accepted-file copies, guitar-to-bass retries, parsers, semantic normalization and supported musical profiles remain unchanged. This checkpoint changes no reader component, focus, speech, navigation, selection, dependency, fixture or workflow.

## Completed source and build gates

- Before implementation, three tiny sentinel regressions failed because the saved baseline attempted `arrayBuffer` for an advertised 16 MiB + 1 file. No file bytes were allocated for that reproduction.
- The permanent new boundary suite adds 78 tests for metadata policy, exact-limit eligibility, absent/undefined metadata, inherited/frozen objects, one-read getters, error propagation, actual-size checks, pre-copy ordering, missing files and later valid import.
- Six actual-overlimit assertions reuse one 16 MiB + 1 backing buffer. They are distinct from the no-allocation metadata sentinels.
- Focused final proof: 7 suites / 203 tests passed.
- Complete inherited proof: 79 active suites / 786 tests passed. The same producer-dependent suite and four tests remain intentionally skipped.
- Changed-file ESLint passed after correcting test-only global references to the inherited Jest environment.
- Production build passed with existing locked dependencies. Thirty emitted files and eight manifest JavaScript assets were inspected. All three changed runtime files exactly matched their source-map contents. The format-only flag remained enabled; forbidden audio, notation-font, binary-tab and executable assets were absent.
- Main asset: `main.a8d22eac.js`, SHA-256 `aef13306514a457e9c8503e694498c63152c4a8ad0fddd22b9d9c819e792522e`.

## Independent review

The final source/build review approved the frozen runtime without a remaining blocker. Independently executed proof included 56 supplemental native/runtime checks, assertions over 66 metadata/missing-file outcomes, and four App suites / 38 tests.

The accepted-fixture comparison matched 108 projections across 12 preserved fixtures, six native generations, guitar/bass profiles, three applicable routes and actual/missing/exact-limit metadata. It compared complete intermediate/result data, normalized documents, inventory, speech, source-read counts and canonical nested-position identity. Projection SHA-256: `28aa33ebf86c9d6f16480faff9aaecbbeb429edb045e8824f5971226b78986c9`.

Baseline execution/evidence came from an independent baseline reviewer; the final reviewer ran the candidate and exact equality assertions. The final reviewer inspected the already-completed full-suite/build logs and rehashed the existing production artifacts instead of redundantly rerunning those gates. An ad hoc matrix assertion's duplicate null-label handling was corrected without changing production source or recorded outcomes.

Repository transport separately verifies the complete public tree, new/changed blob bytes and branch identity. It does not repeat successful source/build gates or regenerate accepted producer evidence. Use the commands in the technical evidence JSON if later reproduction is needed; do not use `npm run test:tuxguitar` for transport verification because it regenerates fixtures.

## Limits and continuation

This is a file-entry preflight and pre-copy guard, not a complete process-memory budget. Absent or forged-small metadata still requires a read before actual-size rejection. Browser reads, accepted copies, profile retries, parsers and downstream decoders retain their own allocation behavior. Metadata-getter and read errors propagate; arbitrary file-like objects are not sandboxed.

Further bounded candidates are localized capability/loss evidence, remaining desktop cell technique detail, and one useful stable return-to-passage operation. Cross-import navigation still needs separate file/track/source-coordinate identity design. This checkpoint does not begin those changes or broaden format profiles, playback, teaching, scoring or redesign.

Read `AGENTS.md`, `BRANCH_AUTHORITY.md`, implementation status and the relevant known-problems records before further work. Preserve fork `main`, upstream, the accepted baseline and its public app. This save creates no deployment, pull request, merge or additional device-acceptance claim.

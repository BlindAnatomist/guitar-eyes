# Canonical reader identity checkpoint: 621 tests

Date: 2026-10-02. This independently reviewed technical continuation preserves the earlier 556-test checkpoint. It does not promote the accepted operational baseline.

## Exact code identity

- Previous completed source snapshot: `c0db3e3a283eccdda24a1d73b4dfc132f24e94a4`; see `reader-reliability-556-2026-10-02.md`.
- Canonical-identity tested runtime: `6f677308bd39d4f0494490cd438e95b7013f13c6`.
- Completed source snapshot: `96d4023cdb54cc1f72a735516aa6c3405dc588a0`.
- Exact `src` tree, including production and tests: `9b533fcfa8921a7886fb9c49a5a03f5849fe5161`.
- Public-transfer base: `983e18531af012e28317c561d401c042512bb2db`.
- Branch: `work/reader-reliability-checkpoints-2026-10-02`.

The public checkpoint intentionally has different whole-tree and commit identities because its documentation is separately authored technical material. Production and test file blobs and the entire `src` tree match the completed source snapshot exactly. All non-documentation files outside `src`, including fixtures, dependency files, scripts, public assets and workflows, remain byte-identical to the public-transfer base. Source snapshot hashes identify locally tested code; they are not a claim that those historical commits are public Git objects. `source-identity-2026-10-02.json` records the source/test blob mapping for both checkpoints.

## Admission contract

`document.positions` remains the ordered musical authority. Block and measure views must contain exactly the matching positions in order with the same evidence. Document and block measure collections must agree. Missing, duplicated, reordered, contradictory or extra nested musical evidence is rejected through the existing semantic-validation error.

Before finalization, only specified derived position index/number/total and measure documentNumber/documentTotal omissions remain compatible. Supplied derived fields must agree; musical fields may not be omitted as equivalent copies. Block/measure numbering, counts, membership and order are validated. Supplied position IDs must be nonempty and unique; measure IDs must be nonempty and unique. Explicit empty ASCII measures remain empty and ordered, not inferred rests. Untimed or unmeasured ASCII remains valid.

A pure finalizer returns fresh document/block/measure wrappers with shared canonical position objects and shared measure objects across views. It preserves canonical positions, strings, warnings, losses, source text, provenance and coordinates. It does not mutate input, infer notes, create IDs, freeze consumer objects or cache admission. Repeated finalization and restored JSON copies remain valid. Identity is document-local; stable bookmarks across reimports are not established.

Reader admission for ASCII, MusicXML/MXL, Guitar Pro, modern and legacy PowerTab, and TuxGuitar invokes the shared finalizer. Decoder staging copies can remain. No importer rewrite or neutral-builder extraction is included.

## Completed gates

Environment: Node `v24.19.0`, npm `11.9.0`, unchanged package files and locked dependencies.

- Baseline reproduction: 22 new identity/contradiction assertions failed, with an existing malformed-membership control already passing.
- Added 65 regressions and identity assertions in the 5 existing real Guitar Pro binary admission cases; no inherited tests were removed or weakened.
- `CI=true npm test -- --watchAll=false --runInBand`: 76 active suites / 621 tests passed. One inherited producer-dependent suite / 4 tests remains intentionally skipped.
- `npm run build`: successful; 30-file inventory, all 8 manifest JavaScript assets present, all 6 changed production sources matched embedded source-map bytes, format-only flag retained, no excluded tab/audio/font/executable asset emitted.
- Changed production/test ESLint and `git diff --check` passed.
- Independent focused gate: 8 suites / 172 tests passed, including 32 existing lifecycle regressions. Frozen-input and valid-invalid-valid admission probes passed without mutation or stale state.
- Independent baseline comparison: 55 fixture inputs, 47 successful documents. All 47 acquired canonical nested views while musical positions, block/measure metadata, speech, warnings/losses, desktop rows and rejection outcomes remained unchanged, excluding only intended nested references and derived-field completion.
- Actual corpus coverage includes GP3/4/5/6/7, PT2 versions 1-11, all 4 PTB families, TuxGuitar guitar/bass across the 6 accepted generations, MusicXML/MXL and accepted ASCII cases. Fixture bytes were not regenerated.

Independent review found and closed two intermediate validator omissions with regressions before the final gate: canonical block-location numbers and stale membership when measure collections disappear. Empty interior ASCII measures were also covered. No source blocker remains. Non-failing React, CRA/Babel and Browserslist diagnostics remain.

These are completed gates on the source identities above, not tests rerun for repository transport. Source-map verifier corrections did not require runtime changes or a rebuild.

## Preserved boundaries

No reader component, App lifecycle, shared speech, UI control, selection behavior, importer profile, fixture, dependency, workflow or public asset changes in this checkpoint. Previous / Read / Next, quiet movement, repeat Read, ordinary-silence omission, technique wording and desktop spatial rows remain protected by inherited gates. Automated proof does not establish additional device or assistive-technology acceptance. No new format, playback, deployment, pull request, merge or operational promotion is included.

## Next bounded resource work

The remaining produced-byte limit gap affects default browser decompression in:

- `powerTabPt2Decoder.js` and `powerTabV11Decoder.js`: gzip, existing 5 MiB input / 20 MiB expansion limits;
- `guitarProArchiveVersion.js`: raw inflation and entry reads, preserving existing 64-entry / 512 KiB directory / 2 MiB GPIF / 64-byte VERSION bounds;
- `tuxGuitarStandardBassZip.js`: raw inflation, existing 2-entry archive / 8 MiB per-entry limit.

A small preflight probe with an 8-byte cap and three 6-byte chunks showed the unbounded helpers consuming every chunk; MXL and ordinary TuxGuitar controls canceled on the second chunk without requesting the third. Use small deterministic probes, not hostile large allocations.

Introduce a bounded reader that checks actual chunk bytes before retention, cancels on first overrun, makes no later read, concatenates only bounded successful output and releases the reader lock. Preserve family-specific limit errors when cancellation or cleanup fails. Retain post-inflation actual/declared checks for custom inflaters; reject oversized stored entries before copying. Exercise direct PT-v11 entrypoints as well as routed PT2.

Required gates: below/exact-limit success, one-byte-over rejection, first-chunk and multi-chunk overrun, exactly one cancellation, no later read, cleanup on success/error, cancellation failure, corrupt/truncated input, unavailable decompression, forged ZIP sizes, GP entry-specific limits, and stored-entry pre-copy rejection. Then focused family/corpus/lifecycle gates, complete inherited suite, build and complete asset inspection. Preserve accepted fixture bytes and the intentional generated-test skips.

This work is not yet implemented by this 621-test checkpoint. It would not establish a hard process-memory ceiling: a delivered chunk can overshoot, successful concatenation duplicates retained bytes temporarily, XML/JSON allocations are separate, and later alphaTab decoding/retry can allocate independently. TuxGuitar profile retries and an oversized-file metadata preflight gap are separate future boundaries.

## Resume safely

Read `AGENTS.md`, `BRANCH_AUTHORITY.md`, implementation status and relevant known-problems records. Start an isolated continuation from this public checkpoint, verify the source subtree identity above, and inspect any newer completed checkpoint before changing code. Existing accepted runtime remains `67a062085c93d9fb546194d727c808960bbcaea9` on `work/accepted-bass-convergence`; fork `main` remains reserved at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Do not replay producer generation or successful gates solely for transport. `npm run test:tuxguitar` regenerates fixtures and is not a transport check. Use the unchanged package lock when an environment actually needs installation. After genuine implementation changes, run focused regressions before full tests/build and preserve the exact source identity and evidence.

After bounded decompression, remaining roadmap candidates are localized capability/loss completeness, desktop technique detail, and one useful stable return-to-passage operation. Cross-import navigation requires a separate file/track/source-coordinate identity design. New formats, playback, AI teaching, scoring and broad redesign are outside this checkpoint.

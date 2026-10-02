# Bounded streamed expansion checkpoint: 708 tests

Date: 2026-10-02. Technical continuation of the 556- and 621-test checkpoints on `work/reader-reliability-checkpoints-2026-10-02`. The accepted operational baseline is not promoted by this save.

## Exact runtime identity

- Tested runtime: `1204069da11d9075def26841d810e864393e24cc`.
- Completed source closure: `29d7c84d4added0637f0b7d2b35fc09cf8ca9a60`.
- Previous tested source: `96d4023cdb54cc1f72a735516aa6c3405dc588a0`.
- Public parent: `19c7819b2cbfaad943705920f83d19aa8e676629`.
- Full source/test tree and changed blob identities are recorded in `source-identity-2026-10-02.json`.

The public checkpoint uses separately authored technical documentation. Its complete `src` tree is identical to the tested runtime; all seven changed source/test files are copied without transformation. Fixtures, dependencies, scripts, public assets and workflows remain unchanged. Source snapshot hashes identify tested code and do not claim that those historical commits are available as public Git objects.

## Implementation boundary

`readBoundedByteStream.js` enforces the existing actual-produced-byte limits before retaining each chunk. It validates native unsigned-byte views with intrinsic type/length accessors, accepts cross-realm byte arrays, rejects unsupported chunk types, cancels exactly once after a read/type/limit failure, makes no later read and releases the lock. Cleanup failures cannot replace the primary failure. Successful output is concatenated only after the stream completes within the limit.

The shared helper is used by PowerTab PT2 gzip, the direct PowerTab v11 gzip entrypoint, Guitar Pro raw-deflate entry reads, and TuxGuitar standard-bass ZIP raw-deflate extraction. Existing family-specific error codes and numerical limits remain in force. Guitar Pro and TuxGuitar stored entries are checked before copying. Post-inflation actual/declared-size checks remain, including checks after custom Guitar Pro inflaters.

PowerTab retains its 5 MiB input / 20 MiB expansion limit. Guitar Pro retains its 64-entry / 512 KiB directory guards, 2 MiB GPIF ceiling and 64-byte VERSION limit. TuxGuitar bass retains its two-entry / 8 MiB per-entry ceiling. Over-limit default Guitar Pro output now fails early with the family expansion-limit code; this is not a claim that every malformed-input error precedence is unchanged.

No importer profile or musical interpretation is broadened. MXL and ordinary TuxGuitar remain unchanged comparison controls. No reader component, lifecycle, speech, navigation, selection, fixture, dependency, workflow or public asset is changed.

## Completed gates

- Four original overrun/cancellation regressions reproduced on the old source before repair.
- Added 87 regressions; focused gate: 19 suites / 220 tests passed.
- Complete gate: 78 active suites / 708 tests passed. Independent complete gate produced the same result. One inherited producer-dependent suite / four tests remains intentionally skipped.
- Independent small-cap probes confirmed cancellation on the first overrun, no later read, one cancellation and lock release on all four repaired routes.
- Helper probes covered type spoofing, shadowed byte lengths, limits, cleanup and cross-realm byte arrays. Native gzip/raw-deflate, unavailable/corrupt/truncated input, stored-copy rejection and entry-specific limits were checked.
- Native parity comparison: 31 records, including 26 complete canonical documents and speech projections, are byte-identical before and after the change. Existing fixture bytes were preserved.
- Production build passed. All eight manifest JavaScript assets were inspected; changed production source-map bytes matched the source. The format-only asset boundary remains intact.
- Changed-source/test ESLint and whitespace checks passed. Existing non-failing React, CRA/Babel and Browserslist warnings remain.
- Renewed independent source/build review approved the frozen runtime and found no remaining release blocker.

These gates were completed on the tested source. Repository transport verifies full tree, blob and branch identities separately; it does not replay successful tests or regenerate accepted producer evidence.

## Limits and continuation

This bounds retained decompressed bytes, not total process memory. A delivered decoder chunk may itself overshoot; final concatenation temporarily duplicates retained bytes. XML/JSON materialization, decoder internals, later alphaTab decoding and profile retries can allocate separately. Custom inflater functions are checked after return and are not themselves forced to stream.

Remaining candidates include oversized-file metadata preflight, TuxGuitar profile-retry bounds, localized capability/loss completeness, desktop technique detail and one stable return-to-passage operation. Cross-import navigation requires a separate file/track/source-coordinate identity design. No new format, playback, teaching, scoring or broad redesign is included.

Read `AGENTS.md`, `BRANCH_AUTHORITY.md`, implementation status and the applicable known-problems records before changing code. Preserve the accepted operational baseline and begin any further implementation as a separately scoped continuation. Do not use `npm run test:tuxguitar` for transport verification; it regenerates fixtures.

This save creates no deployment, pull request, merge or additional device-acceptance claim.

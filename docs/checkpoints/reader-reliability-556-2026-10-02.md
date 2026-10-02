# Reader reliability checkpoint: 556 tests

Date: 2026-10-02. This is a technical preservation checkpoint, not promotion of the accepted operational baseline.

## Exact code identity

- Public-transfer base: `983e18531af012e28317c561d401c042512bb2db`.
- Import-lifecycle tested runtime: `0f87550473124b683792d4db63bfe9d30dc2c482`.
- Shared-technique tested runtime: `c89436fdd27c07393600ddf7a2430d531b3f70b6`.
- Completed source snapshot: `c0db3e3a283eccdda24a1d73b4dfc132f24e94a4`.
- Exact `src` tree, including production and test files: `626706216fab425e6e39506c933ba09dab012686`.
- Branch: `work/reader-reliability-checkpoints-2026-10-02`.

The public commit has separately authored technical documentation, so its whole-tree and commit identities intentionally differ from the completed source snapshot. Production and test blobs are copied without transformation. The complete `src` tree is identical; fixtures, dependencies, scripts, public assets and workflows are unchanged from the public-transfer base. The source snapshot hashes identify locally tested code; they do not claim those commits are available as public Git objects.

## Implementation

`src/App.js` selects the current reading mode when asynchronous work completes. Monotonic request identity blocks obsolete success, rejection and inventory/selection completions from replacing newer work. Scheduled focus callbacks are canceled or guarded across supersession, mode changes and unmount. Existing committed-result focus targets and browser-return recovery remain authoritative. No Cancel control or artificial delay was introduced.

`src/positionDescription.js` gives compact wording to exact attached technique names already recognized by the existing importers. Unknown names retain the uninterpreted-notation qualifier. Mixed lists preserve order and separate recognized and unknown clauses. No alias, prefix, substring or case inference is used. Technique objects, raw source values, warnings, localized losses and importer behavior are unchanged. Category naming adds no unsupported musical parameters or interpretation.

Both reader views already use the shared description function. Standalone muted-note wording and the unused legacy description export remain outside this change.

## Completed automated gates

Environment: Node `v24.19.0`, npm `11.9.0`, unchanged locked dependencies. This records the tested environment, not a new supported-version declaration.

- Import-lifecycle focused gate: 9 suites / 57 tests passed, including 32 lifecycle regressions. Its complete gate passed 74 active suites / 498 tests.
- Technique focused gate: 12 suites / 159 tests passed. Independent wording/parity review passed 2 suites / 63 tests.
- Final complete gate: `CI=true npm test -- --watchAll=false --runInBand`, 75 active suites / 556 tests passed.
- One inherited producer-dependent legacy PowerTab suite / 4 tests remains intentionally skipped. Accepted producer evidence was not regenerated.
- `npm run build`: successful. The inspected build contains 30 files and all 8 manifest JavaScript assets, retains the format-only flag and emits no excluded binary tab, audio, notation-font or executable assets.
- Changed-source/test lint and `git diff --check` passed. The one-line MusicXML expectation edit retains the same 7 inherited `jest/no-conditional-expect` diagnostics.
- Independent review found no remaining source blocker. Existing non-failing React, CRA/Babel and Browserslist warnings remain.

These gates were completed on the exact source identities above. Moving unchanged blobs into this public documentation tree does not require replaying the test suite or rebuilding. Repository transport verification is a separate gate.

## Evidence limits

DOM tests protect quiet navigation, repeated explicit Read behavior, source-document immutability, warnings and hidden playback controls. They do not measure native picker event delivery, actual assistive-technology cursor placement or audible speech.

Technique coverage uses existing accepted PowerTab, TuxGuitar, ASCII and MusicXML evidence. Guitar Pro technique parity at the intermediate boundary does not establish arbitrary producer-file compatibility. Format/profile claims remain bounded by the existing evidence.

No new format, dependency, fixture, workflow, playback behavior, operational-baseline promotion, pull request, merge or deployment is part of this public save.

## Resume

Read `AGENTS.md`, `BRANCH_AUTHORITY.md`, implementation status and the applicable known-problems records before implementation. Continue only from an explicitly selected completed checkpoint on an isolated branch; preserve the accepted operational authority.

The next completed checkpoint records canonical nested-position identity. Remaining reliability work includes actual produced-byte bounds during PowerTab gzip, Guitar Pro raw inflation and TuxGuitar bass ZIP extraction. Reuse bounded stream behavior already present in MXL and ordinary TuxGuitar; prove exact-limit success, first-overrun cancellation, no later reads, cleanup and unchanged accepted-file projections with small deterministic probes. Do not regenerate fixtures or run `npm run test:tuxguitar` as a transport check.

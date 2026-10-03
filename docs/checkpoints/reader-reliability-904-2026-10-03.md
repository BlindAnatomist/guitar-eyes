# Desktop attached-technique cell parity: 904 tests

Date: 2026-10-03. Technical continuation on `work/reader-reliability-checkpoints-2026-10-02`. This save does not promote the accepted operational baseline.

## Source identity

- Tested runtime: `d321e99ce436bd5aea6940d0533b7a48b126c028`.
- Completed source snapshot: `aa07d4f3408e6bda8b0261148b9dac0e1c8a357c`.
- Implementation base: `38d015aa2b8d3ff6151f6bbd4e31579963b114c1`.
- Public parent: `f789982df590a0b40cc4f8a84f14c6c5d18c34c4`.
- Complete source/test tree: `dafdc805e9d70e74487e2aa3545caad302096a6d`.
- Exact blob mapping: `source-identity-2026-10-02.json`.
- Technical evidence: `desktop-technique-parity-904-evidence.json`.

The full source/test subtree matches the tested candidate. Four source/test files are copied without transformation. This technical note is independently authored. Fixtures, scripts, public assets, dependencies and workflows remain unchanged. Snapshot hashes identify tested code without asserting that their historical commits are public Git objects.

## Bounded behavior

Native desktop table cells now expose techniques already attached to open/fretted notes: for example `Fret 2, with hammer-on` and `Open, with palm mute`. Previously these cells omitted the attachment while explicit Read already included it.

The runtime change exports the existing unchanged `techniquePhrase` from the shared description module and reuses it in precisely those two cell cases. There is no duplicate recognition list, alias matching or new musical interpretation. The same 17 exact recognized categories, ordered recognized runs and scoped unknown-name disclosures retain their prior punctuation. Unknown-first, unknown-last and interleaved lists preserve source order. Category naming does not imply missing parameters, bend amount, harmonic kind or new support.

Continuation and standalone technique cells and speech are unchanged. Silent/missing/unsupported cells and rest columns retain their existing labels. The native table caption, row/column headers, current-column marking, controls, tab order and focus mechanism remain unchanged. No cell gains a live region, focusability, aria-label or describedby coupling.

Explicit Read and phone text are baseline-exact. Position/block movement remains quiet, including after Read. Repeated Read continues to replace only its existing announcement child; modifier-key commands remain unintercepted. Document replacement resets position and clears the prior announcement. Importers, canonical documents, warning/loss policy and admission/rejection behavior are untouched.

## Completed gates

- Fifty new assertions fail against unchanged runtime, reproducing the omission. Existing exact speech assertions pass at that baseline.
- Fifty-nine new permanent tests cover all established categories on open/fret notes, absent and unknown names, mixed lists, chord locality, multiple strings/blocks, native accessibility context, quiet movement, focus, repeated Read, replacement, rests, continuation/standalone exclusions and defensive missing/unsupported cells.
- Real-format cell checks extend existing ASCII/MusicXML, PowerTab PT2 v1–11 and six-generation TuxGuitar guitar/bass fixture coverage. MXL equivalence and GP project-authored intermediate-boundary evidence remain covered; no new GP producer-export claim is made.
- Final focused gate: 7 suites / 228 tests, including 32 import/mode lifecycle and 59 MusicXML locality regressions.
- Complete gate: 81 active suites / 904 tests pass. The same producer-dependent suite / four tests are intentionally skipped.
- Changed-file lint, whitespace checks and production build pass with installed locked dependencies. Inherited non-failing React, CRA/Babel and Browserslist messages remain.
- Independent baseline comparison passes 87 cases / 1,254 cells / 221 positions with exact explicit Read and phone text and immutable canonical documents. Independent focused and full 904-test reruns and changed-file lint pass.
- Build inspection verifies all 30 files and eight JavaScript assets; 80 embedded source entries representing 74 unique application sources match the checkout. Seven non-main JavaScript chunks and CSS remain identical. Format-only is enabled; excluded audio, fonts, binary tabs and executables are absent.
- Main JavaScript: `main.e6730016.js`, SHA-256 `b45078a733e16222c0a00e861c9a9e165ffb62a8d8a3d3481527be370e65fd92`.

An initial focused command used a nonexistent lifecycle filename and ran five suites / 137 tests. The final seven-suite command uses the exact existing lifecycle filename; no implementation or fixture change was required. No producer generation or hosted workflow was used.

## Limits and next boundary

This is technical presentation proof. Actual desktop screen-reader table navigation, speech verbosity and spatial usability remain unverified. DOM and text assertions cannot establish that human acceptance. Automated checks do not become new device acceptance by inheritance.

The next bounded candidate is one useful stable return-to-passage operation. Canonical identity is document-local, so durable cross-import bookmarks require separate design. No navigation feature, playback, teaching, scoring, new format or redesign is implemented here. Preserve fork main, accepted branches, upstream and the public application. This technical repository save opens no pull request, merge, deployment or workflow run.

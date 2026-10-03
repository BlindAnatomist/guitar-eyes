# Session-local passage mark: 968 tests

Date: 2026-10-03. Technical continuation on `work/reader-reliability-checkpoints-2026-10-02`; no accepted-baseline promotion.

## Source identity

- Tested runtime: `9385826cf3cc7ae4a126efcc9a13114754e9cff2`.
- Completed source snapshot: `b96786f312c8fcf6e639c3d397c502256ea137ef`.
- Implementation base: `cfbb9ee838e12a967daa5f42adaeb48577d2bd2d`.
- Public parent: `900539fbb545270f9c3106b5c40f990c292abb23`.
- Complete source/test tree: `502d60b80899b742ba52944daf3c1c0ecbd06ef7`.
- Exact blob mapping: `source-identity-2026-10-02.json`.
- Technical evidence: `session-passage-mark-968-evidence.json`.

Eight source/test files are copied exactly. These technical notes are independently authored. Fixtures, scripts, public assets, dependencies and workflows remain unchanged. Snapshot hashes identify tested code without asserting their historical commits are public Git objects.

## Bounded behavior

Both semantic readers offer one in-memory mark for the currently loaded file: Mark current position, Return to mark and Go to beginning. The existing Previous / Read current / Next group keeps its order. No range, durable bookmark, persistence, fingerprint, playback, new format or redesign is introduced.

A mark stores exact document identity, canonical position reference and integer index. All three must still agree before Return. Invalid indices, copied/replaced documents and replaced/shifted canonical references fail closed without clamping or searching. Display labels, optional IDs and filenames are not return identities. The raw legacy grid has no mark controls.

App shares one mark across reader modes while keeping existing local cursor resets. A mode change does not return to the mark or read automatically. A new import or explicit track-preparation request clears the mark, matching the existing reader-unload lifecycle. Rejected replacement cannot revive the old mark. Reimporting the same file through a delivered change event and selecting another track start without a mark. A picker cancellation with no selected file is ignored, preserving the existing document and mark.

Mark replaces the target. Return remains available for repeat use at the target. Go to beginning remains enabled at zero for stable focus. A passive marked-position status and short lifetime help are provided. The new actions quietly clear the existing announcement; no new live region, description coupling or focus movement is introduced. Only explicit Read emits full instructions, with the original repeated-Read announcement identity.

The desktop reader now resolves a changed document to zero before its reset effect, so Mark never sees the old cursor on a newly rendered document. Existing keyboard and block movement, modifier non-interception, native tables, cell technique text, exact shared speech, warning/loss semantics and importer/focus behavior remain protected.

## Completed technical gates

- All 26 new reader assertions fail against unchanged baseline because the capability is absent.
- 64 permanent tests: 16 identity cases, 26 reader cases, 22 App cases. First/last, chords/rests, multiple blocks, repeated actions/Read, focus, mode sharing, new/same-file imports, cancellation, empty/read-error rejection, raw fallback, track selection, obsolete async outcomes and no storage writes are covered.
- Final focused gate: 7 suites / 170 tests, including 32 inherited import/mode lifecycle regressions.
- Complete inherited gate: 84 active suites / 968 tests pass. The same producer-dependent suite / four tests remain skipped.
- Changed-file lint, whitespace checks and production build pass with unchanged installed locked dependencies.
- Independent source review, 968-test rerun and 822-check black-box DOM probe pass with no blockers. Extra coverage includes bass, fresh-session reset, canonical-reference replacement, first-render replacement, keyboard activation and modifier behavior.
- Build inspection: 30 files, 8 JavaScript assets, all 82 application-source entries (76 unique sources) match the checkout. Seven non-main JavaScript chunks and CSS are unchanged. Format-only is enabled; excluded audio, fonts, binary tabs and executable assets are absent.
- Main JavaScript: `main.7b53a7d5.js`; SHA-256 `07b3f1e8017fb4deec8562e2d40feb60f1333fa5c80ea0ccdbae9e8b028c9dc9`.

One initial rejection test incorrectly expected arbitrary text to produce a desktop error rather than the inherited raw fallback. The test was corrected to actual rejection and raw fallback is tested separately; application behavior was preserved. A build-verifier literal-true assumption was corrected to recognize the existing minified `!0`. No fixture regeneration or source rebuild was needed for either harness correction.

## Limits

This is source, DOM and build proof. Actual VoiceOver announcement timing, native same-file event behavior and task/spatial usefulness remain unverified. No new human acceptance is inferred. Session-local identity cannot survive reload/reopen/reimport. Fork main, accepted branches, upstream and the public application remain unchanged. No workflow, PR, merge or deployment is part of this technical repository save.

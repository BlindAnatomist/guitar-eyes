# Acceptance candidate 1: unique static identity

Date: 2026-10-03. Technical continuation only; no accepted-baseline promotion.

The page title, first static H1 before the React root and existing hidden App label now agree as `Guitar Eyes acceptance candidate 1`. This is a distinct acceptance-checkpoint identifier, not a feature version or acceptance result. It replaces a reused generic label so a tester can identify this exact candidate before functional testing.

## Exact source and bounded changes

- Tested source/test commit: `9f4b7f1dc950e9eef895093a2ea1e62b0113929e`.
- Completed source snapshot: `00e0270370658597cb8e0e8258d98c3bef203a81`.
- Implementation base: `b195eed624e00d16ccc987cdf088cac1eb6ab7c8`.
- Public parent: `6eefb661fceaee0b8be07feec2b3ecb5d0901748`.
- Source/test tree: `e9d1a78d7f888a407295a454b6a68907718f4b60`.
- Public-static tree: `02fe095b52b9b67381018a86a6b07e4e10b90b1b`.
- Exact blob mapping is appended to `source-identity-2026-10-02.json`; all earlier entries are preserved.

The four source/test files, public/index.html, src/buildIdentity.js, src/buildIdentity.test.js and src/App.test.js, are copied exactly from the reviewed source. This note and continuation pointers are independently authored public technical records. Source commit hashes identify the reviewed snapshot without asserting that historical private source commits are public Git objects.

Only the static title/H1, hidden identity literal and two existing tests change. One added test checks static discoverability without added live announcements or focus targeting. No parser, decoder, profile, semantic model, support copy, reader, passage mark, navigation, focus, audio, CSS, dependency, workflow or fixture changes. Conservative cache hints, the explicit format-only entry flag and existing hidden duplicate-label styling remain intact.

## Verified gates

- Six focused suites / 36 tests pass.
- Complete inherited gate: 89 active suites / 1045 tests pass; the same suite / four producer-dependent tests are intentionally skipped.
- Production build passes. Identity source/test lint clean; App.test retains the same five inherited errors, verified against the base. This is not a whole-repository clean-lint claim.
- Independent review finds no blocker, reruns three directly affected suites / 13 tests and independently reproduces all 30 assets byte-for-byte.
- Eight JavaScript assets inventoried. Seven non-main chunks and CSS are unchanged. Main JS differs only by the identity literal and its own filename hash; HTML/manifest change only identity and main hash.
- All 83 embedded application-source entries match the checkout; only the identity constant differs from the prior source map. Dependencies and 640 other inherited tracked paths are unchanged.
- A 33-assertion production-bundle JSDOM check retains valid MusicXML and real TG import, explicit attached-technique Read, quiet navigation/mark/return/beginning, selected-invalid replacement clearing, cancellation preservation and valid retry. This is automated DOM evidence only.

Initial local preparation errors were confined to a wrong log directory and one nonexistent focused-suite filename; corrected commands ran actual suites without changing product code. One review assertion was aligned to inherited minifier selector order. Full raw logs are retained separately from this public technical record; no personal acceptance records are published.

All frozen 1044, 986 and 968 checkpoint records remain unchanged. The first heading must match before functional acceptance. Native picker, browser cache, screen-reader output and usability require an actual device observation; no new device acceptance is claimed. No PR, merge, workflow action, public-app deployment, main/accepted-branch change or baseline promotion belongs to this technical save.

# Completed Chromium technical smoke

Status: passed. This is real Chromium technical proof, not Safari, VoiceOver, native picker or human teaching-value acceptance.

- Executing commit: `4a29cc49dc5fcab18c938a4e2bc236f281179ff6`.
- [Successful run 37154405896](https://github.com/BlindAnatomist/guitar-eyes/actions/runs/37154405896).
- One allocated standard Ubuntu job, with all steps successful.
- Playwright 1.63.0; Chromium 153.0.8010.12.
- 16 passed checks: eight each in desktop and mobile-size presentations.
- No browser console, network or runtime errors.
- All 30 served files exactly match the reviewed archive and complete SHA-256 manifest. Checkout src/public/package objects and original fixture identity match the reviewed runtime.
- Downloaded result archive: 226,641 bytes, SHA-256 `5ff2d6bed9468bf440177860740e1c54531b2897260978e233ef1a14cb5f93fe`.

The result and artifact-verification JSON are preserved beside this record. Two lesson screenshots were inspected: text and controls are readable, contained and unclipped at the tested widths. No private site URL, personal test observation, recovery link or user file was included in this test.

## Failure-preserving correction

[Initial run 37153632916](https://github.com/BlindAnatomist/guitar-eyes/actions/runs/37153632916) failed immediately with zero jobs and zero check runs. Its workflow placed two `runner.temp` expressions in job-level env, where GitHub does not permit the runner context. The corrected workflow removed exactly those two entries and initialized the same paths with quoted RUNNER_TEMP/GITHUB_ENV commands in the existing preflight step. An independent complete expression-location audit rejected the original and accepted all five remaining corrected sites; shell propagation also passed with spaced temporary paths.

The app, production archive, source guard, smoke code, permissions, limits and browser scope were unchanged. The successful correction was the same approved single browser-test job. No budget, overage, sharing, Pages, main or upstream setting changed.

The temporary workflow is removed in the result/cleanup commit. Historical workflow files and both run records remain evidence; this does not authorize another marked push or hosted retry.

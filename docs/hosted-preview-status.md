# Hosted Preview Status

Last updated: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Working branch: `work/iphone-voiceover-tablature-audit`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

Published convergence source: `d26e4172a0386ceb56ad5c0061e72d975b42fc43`

## Repository authority

- `Phlypper/guitar-eyes` remained untouched at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Fork `main` was restored to the same commit after publication.
- Final main comparison: identical, zero ahead, zero behind, zero changed files.
- No pull request or merge was opened.

## Current hosted state

GitHub Actions run `30217532641` passed on its first attempt:

- exact-source checkout: passed;
- locked dependency installation: passed;
- test suites: 4 passed, 4 total;
- tests: 20 passed, 20 total;
- production Pages build: passed;
- compiled convergence identity check: passed;
- Pages deployment: passed.

Hosted read-back established:

- preview HTML: HTTP 200;
- page title: `Guitar Eyes accessible tablature reader`;
- exact built main asset: `/guitar-eyes/static/js/main.10ddd4a1.js`;
- main asset: HTTP 200;
- every asset referenced by the HTML returned HTTP 200;
- live asset contains `Previous position`, `Read current position`, and `Next position`;
- live asset contains `Previous tablature block` and `Next tablature block`;
- live asset contains both the iPhone and desktop semantic-reader material.

The live bundle filename matches the successful publisher's build log, so the prior proof build was not mistaken for the convergence preview.

Full evidence: `docs/convergence-verification-preview-2026-07-26.md`.

## Acceptance state

The earlier bounded iPhone proof remains accepted, including native Files-picker focus recovery. The published convergence build now requires one real-iPhone Safari and VoiceOver regression pass covering the preserved upload recovery plus shared position, measure, multi-block, and block-jump behavior.

Do not treat the convergence checkpoint as fully accepted until John completes that bounded test in Chat.

Jason's desktop acceptance is deferred unless he agrees to participate.

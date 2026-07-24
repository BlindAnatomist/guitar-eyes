# Guitar Eyes iPhone Extension Status

Last updated: July 24, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Audit branch: `work/iphone-voiceover-tablature-audit`

Authoritative baseline commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Current checkpoint

Checkpoint 1: Fork verification and source audit established.

1. GitHub recognizes `BlindAnatomist/guitar-eyes` as a fork.
2. Fork `main` matches upstream `main` at the authoritative baseline commit.
3. Fork `main` has not been modified.
4. The dedicated audit branch was created from the exact baseline commit.
5. No pull request has been opened.
6. No upstream files or branches have been modified.
7. No production or nonproduction deployment has been created yet.
8. No application behavior has been changed yet.
9. A branch-only workflow was added to run baseline build and test jobs.
10. The source audit is recorded in `docs/iphone-voiceover-tablature-audit.md`.

## Commits on the audit branch

1. `4cde3742bcc352c38e0ef48edbb3d06e79f1aec1` — Add branch-only baseline audit checks.
2. `37ff09e609f09d2a6d8f04c6d4b691cec8d9e728` — Record the iPhone VoiceOver source audit.

## Confirmed source findings

1. The existing application intentionally targets Mac keyboard and VoiceOver navigation.
2. The current parser groups arbitrary nonempty lines and does not create synchronized musical positions.
3. Whitespace can be destroyed by line trimming.
4. Fret values above 22 can be corrupted.
5. Independent per-row digit collapsing can disturb spatial alignment.
6. The existing grid creates approximately one focusable cell per rendered character.
7. Technique notation is retained as raw characters but not interpreted.
8. Errors are console-only.
9. The multi-column checkbox label is not programmatically associated.
10. The current test is stale Create React App boilerplate.
11. The prior GitHub Pages workflow was deleted upstream, leaving no confirmed hosted preview.

## Open gates before implementation

1. Enable GitHub Actions for the new fork or establish another isolated automated build path.
2. Record baseline `npm ci`, test, and production-build results.
3. Decide whether an untouched baseline preview is needed before the proof implementation.
4. Finalize the audit after automated and real-device evidence is available.
5. Implement only the bounded six-string iPhone proof after the audit gate is complete.

## First proof boundary

The proof will:

1. accept one clean plain-text six-string tablature file;
2. create synchronized musical positions;
3. preserve the existing desktop mode;
4. add Previous position, Next position, and Read current position controls;
5. generate semantic vertical descriptions;
6. avoid raw-character VoiceOver swipe navigation in the iPhone mode;
7. expose restrained status and understandable errors;
8. add deterministic automated tests;
9. deploy only to an isolated nonproduction preview;
10. require real-iPhone Safari and VoiceOver acceptance before any upstream proposal.

## Manual acceptance record

No real-iPhone acceptance test has been requested or completed yet.

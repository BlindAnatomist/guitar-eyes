# Procedural Timbre Quality Foundation: Execution Gate Preflight

Date: July 31, 2026

Repository: `BlindAnatomist/guitar-eyes`

Source branch: `work/procedural-timbre-quality-foundation`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Purpose

Run one exact-source verification checkpoint for the bounded procedural timbre change after connector-side source review, JavaScript syntax checking, isolated deterministic sound-engine smoke execution, and branch-diff review.

The gate must verify the complete inherited and new test suite, optimized production build, compiled timbre contracts, forbidden-asset absence, repository cleanliness, and accepted-line ancestry.

## Workflow design

1. Trigger: one push to a dedicated temporary gate branch after the workflow is fully configured.
2. Source checkout: the exact source-branch commit recorded in the workflow environment, not the gate branch itself.
3. Runner: standard GitHub-hosted `ubuntu-24.04` only.
4. Timeout: 20 minutes.
5. Permissions: repository contents read and commit statuses write only.
6. Artifact: short diagnostic evidence only, retained for one day.
7. Concurrency: one named group with `cancel-in-progress: true`.
8. Expected duration: dependency installation plus the existing complete suite and build, within the 20-minute limit.
9. No Pages, deployment, environment mutation, bot source commit, pull request, merge, or `main` movement is part of this gate.

## Duplication assessment

Existing historical workflows are tied to earlier exact sources and compiled contracts. Reusing them without changing their source and assertions would test the wrong checkpoint. The temporary gate may reuse their proven structure but must not rerun publication or duplicate the test/build sequence elsewhere.

## Diagnostic requirements

1. Name exact-source, ancestry, and changed-file assertions separately.
2. Report expected and actual changed-file sets.
3. Do not classify a failed authority preflight as a test or build failure.
4. Inspect a failed step before any rerun.
5. Permit at most one corrected rerun only when the first run exposes a specific gate defect rather than a source failure.

## Protected authority

Fork `main` and `Phlypper/guitar-eyes` remain untouched throughout. The source branch contains no workflow trigger. The dedicated gate branch exists only to execute the exact verified source.

State: `preflight complete; one exact-source gate authorized after final connector read-back`.

# Zero-Dollar Automation Policy

Status: governing repository policy for the iPhone audit and all future fork work

Effective: 2026-07-24

Applies to every branch, workflow, Pages build, artifact, bot, agent, and future phase in `BlindAnatomist/guitar-eyes`.

## Repository authority

`main` must remain a clean upstream-tracking branch identical to `Phlypper/guitar-eyes` unless the owner separately changes that governance. This policy belongs on the dedicated work branch and must not be used as a reason to contaminate `main`.

The upstream repository must remain untouched.

## Nonnegotiable cost boundary

This is a zero-dollar project. No verification, Pages deployment, artifact, runner, storage, or automation decision may create paid GitHub usage or require the owner to enable paid overages.

The owner account has an Actions budget of $0 with `Stop usage` set to `Yes`. Standard GitHub-hosted Actions for this public repository do not consume the private-repository allowance, but workflows must still avoid waste and must never introduce a paid runner or paid service.

## Required workflow design

1. Run tests and builds locally or in the active agent runtime before pushing whenever possible.
2. Batch related, verified changes into one deliberate push whenever practical.
3. Do not run workflows on every push to the audit branch.
4. Use `workflow_dispatch` for intentional verification and publication checkpoints.
5. Use standard Linux GitHub-hosted runners only.
6. Every job must have a realistic `timeout-minutes` value.
7. Repeated workflows must use concurrency with `cancel-in-progress: true` when a newer run supersedes an older one.
8. Artifacts must use the shortest practical retention.
9. Do not duplicate test and build work across verification and Pages workflows unless both results are required for the checkpoint.
10. Do not use GitHub Actions bot commits as an ordinary implementation transport.
11. GitHub Pages publication must preserve the proven environment-protection procedure and restore `main` exactly after any separately authorized temporary publisher operation.
12. When a run fails, inspect the logs first. Rerun only the failed job when possible.

## Acceptance checkpoint rule

One intentional workflow run is permitted for a defined checkpoint after agent-side verification passes. Repeated commits made only to probe Actions are prohibited.

A checkpoint record must identify:

- the exact work-branch commit;
- the workflow purpose;
- why GitHub-hosted execution is necessary;
- the result;
- any artifact or Pages address;
- whether a rerun occurred and why;
- confirmation that fork `main` and the upstream repository remain untouched or were restored exactly.

## New workflow preflight

Before adding or materially expanding a workflow, record:

- its required purpose;
- trigger;
- expected duration;
- runner type;
- timeout;
- artifact retention;
- permissions;
- whether another workflow already performs the same install, test, build, or deployment;
- how `main` and upstream authority remain protected.

A workflow without this assessment must not be added.

## Quota or workflow interruption

If an Actions run is blocked or interrupted:

- do not raise the budget;
- do not attach a paid runner;
- preserve the exact work-branch commit and evidence;
- continue work that does not require GitHub-hosted execution;
- defer the checkpoint until the zero-cost route is available;
- record the failure and proven recovery in the repository registers.

A blocked workflow is not permission to bypass tests, VoiceOver acceptance, Pages environment protection, or upstream isolation.

## Owner interaction

Do not ask the owner to navigate billing, Actions, Pages, or environment settings when the same bounded action can be performed through GitHub CLI, REST API, or connected GitHub tools. Never ask the owner to authorize spending as a shortcut.

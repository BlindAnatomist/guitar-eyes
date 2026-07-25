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

## Metered execution and Work preflight

Work credits, Codex usage, and other metered execution allowances are separate from GitHub Actions minutes and separate from actual monetary spending. Conserve all three without conflating them.

Before recommending or starting a metered execution session, record or state:

1. the exact source-change boundary;
2. the minimum authoritative reconstruction needed for that boundary;
3. the verification that must occur in the authenticated working environment;
4. the tasks Chat and connected tools can complete without metered execution;
5. the tasks that genuinely require the metered environment;
6. any external action the available tools cannot perform;
7. the precise stop condition before owner-operated or real-device testing;
8. whether the complete assignment is focused or verification-heavy, independent of expected diff size.

Use the least expensive capable environment for each part. Do not use Work for manual iPhone testing, repository records, hosted-state read-backs, preview-address retrieval, or other tasks available through Chat and connected tools.

Never predict a Work-credit percentage or promise low credit consumption unless the platform provides reliable evidence for that prediction. A focused source repair may still require a complete regression gate; describe that execution envelope honestly rather than calling the overall assignment tiny.

Do not transfer a connector, authentication, Pages, or workflow-dispatch limitation to the owner until the available Chat, connector, CLI, and REST routes have been checked. Conservation must eliminate duplication and unnecessary metered work; it must not weaken required accessibility, build, repository-authority, or real-device evidence.

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

# Zero-Dollar Automation Correction

Date: 2026-07-24

Status: governing operational record

## Account safeguard

The owner account's GitHub Actions budget was independently confirmed at $0 with `Stop usage` set to `Yes`. No paid overage is authorized.

## Repository correction

The audit branch now contains:

- `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
- root `AGENTS.md` requiring that policy and the continuity registers to be read;
- an iPhone verification workflow that runs only through `workflow_dispatch`;
- a Pages proof workflow that runs only through `workflow_dispatch` and deploys only when executed from an authorized `main` context;
- explicit Linux runners, timeouts, concurrency cancellation, locked dependency installation, and removal of the separate status-recording runner job.

## Authority preserved

Fork `main` was not changed by this correction and remains the clean upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request was opened.

## Operational effect

Ordinary pushes to `work/iphone-voiceover-tablature-audit` no longer launch verification and Pages workflows. GitHub-hosted execution is reserved for an intentional acceptance or publication checkpoint after agent-side tests and build pass.

The already accepted bounded iPhone proof, hosted address, real-iPhone VoiceOver result, semantic model, and native Files-picker focus repair remain unchanged.

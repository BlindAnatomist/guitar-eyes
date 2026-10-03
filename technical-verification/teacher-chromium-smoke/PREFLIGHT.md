# One bounded teacher Chromium smoke

This is a prepared technical-verification checkpoint, not a browser-pass result or product acceptance.

## Frozen input

- Reviewed runtime: `c8376b990874eee60f31b5aaad47cd8b12ca3f19`.
- Reviewed closure: `f07c679005c4948640f8aa7371a82c5cc7b79981`.
- Production archive: 1,823,488 bytes, SHA-256 `8ae36e3a65b3324cd126983c82af50ae3bf19bf4d3b8cc1189a35ba5ab2b5d22`.
- All 30 exact production assets total 7,590,369 uncompressed bytes. Their complete paths, byte counts and SHA-256 values are in `reviewed-build-manifest.json`.
- Original CC0 teacher fixture: `fixtures/teacher/pattern-and-ending.musicxml`, 4,097 bytes, SHA-256 `5ba20a3b0d96ef3f84df2ce94837d9119f28ee1716ee5cbf1d908b35179c9162`.
- The archive contains only regular files named relative to the build root. The verifier checks every member before writing validated bytes into a new temporary directory. Missing, extra, duplicate, altered, linked and unsafe entries fail closed.
- Before installation, the checkout's `HEAD:src`, `HEAD:public`, `HEAD:package.json` and `HEAD:package-lock.json` Git objects must match their reviewed runtime identities, and those working paths must have no staged, unstaged or untracked changes. The source-object manifest records the exact hashes. The overall sanitized technical-branch commit is intentionally different from the private source closure.

## Workflow preflight

- Purpose: exercise the already reviewed production artifact in actual Chromium, beyond source/DOM proof and before a separate teaching-value judgment.
- Why hosted execution: the active preparation environment does not supply an approved direct Playwright browser-control route. CI provides the authorized bounded real-browser gate. No browser is launched during this local preparation.
- Branch: `work/teacher-chromium-smoke-2026-10-03` only.
- Trigger: one deliberate push whose head-commit message contains `[teacher chromium smoke]`; job requires attempt 1 and the exact fork/ref. No dispatch, PR, schedule, branch-creation assumption, or app workflow is added.
- The caller prepares the complete reviewed commit before advancing the branch, confirms the exact head and observes only this run. The marker is not reused. Subsequent records/cleanup omit it; remove this temporary workflow when its purpose ends. The guard is a bounded operational trigger, not a persistent counter that could prevent a separately authorized new marked commit.
- The narrowly approved exact-branch trigger is an explicit exception to the general manual-only workflow preference, needed because a new workflow is not on the preserved default branch.
- Runner: one standard `ubuntu-24.04` job, no matrix, no paid runner/service. Expected 3–6 minutes; hard job timeout 10 minutes, install steps 2/5 minutes, smoke step 3 minutes and script deadline 150 seconds.
- Permissions: `contents: read` only; checkout credentials are not persisted. No configured secret is passed to the browser or script. No repository writes, bot commits, deployment, Pages/Site/public-access setting, main/upstream change, or billing operation exists in the job.
- Cost: existing included allowance and the owner's automatic zero-dollar spending stop remain controlling. A quota/stop failure is a stop condition, not permission to alter the budget or rerun.
- Concurrency: one fixed checkpoint group with cancellation of superseded activity.
- Artifact: technical receipt, concise JSON checks/errors, two lesson screenshots and at most one failure screenshot; one-day retention. Only synthetic/project-authored example content is used. No trace, video, uploaded user file, source archive, dependency tree, or credentials enter the result artifact.
- No other inspected inherited workflow performs this browser gate. `iphone-audit.yml` and `iphone-proof-pages.yml` remain unchanged, manual-only. The full app installation, test suite and production build are not repeated.
- A failed run is inspected at its actual failed step. There is no automatic retry. Any proposed corrective hosted run requires separate authorization under the current one-run boundary and repository circuit breaker.

## Browser scope

The small Node script runs eight short checks in each of desktop 1280×900/desktop-reader and mobile-size 390×844/iPhone-reader presentations:

1. Exact production identity, original-example load, unrestricted input, initial reader focus and cleared mark.
2. Shared pattern/changed-ending explanations, grouped notes/rest, both endings, rehearsal guidance, passive lesson and independent session mark.
3. Final changed position, exact Read focus/text/live-region behavior, quiet inspection, exact evidence return focus and navigation order.
4. Recurrence, preserved mark, quiet ordinary navigation, close focus and one repeated open/inspect/return cycle.
5. Unchanged source upload remains lesson-eligible through actual FileReader/import behavior.
6. Whitespace-changed source remains readable but receives the honest limitation.
7. Ordinary project-authored ASCII remains readable with the honest limitation.
8. Empty local/session storage and mobile horizontal-width containment. Containment is also checked with the new lesson open and while inspecting its changed-ending evidence.

The script serves only the verified bytes over ephemeral loopback and blocks off-origin browser requests. It launches full Chromium in new headless mode, with no application mocks or altered production bytes. This is not Safari, native Files-picker, VoiceOver, screen-reader speech or teaching-value acceptance.

## Pinned official tooling

- `playwright@1.63.0`, installed with scripts disabled in a runner-temporary prefix, independent of app dependencies. Release existence verified at https://github.com/microsoft/playwright/releases/tag/v1.63.0.
- The Playwright library import and explicit browser installation follow https://playwright.dev/docs/library.
- Official full Chromium installation uses `playwright install --with-deps --no-shell chromium`; launch uses `{ channel: 'chromium', headless: true }`. The matching new-headless/full-browser and `--no-shell` options are documented at https://playwright.dev/docs/browsers#chromium-new-headless-mode.
- CI dependencies/install guidance: https://playwright.dev/docs/ci.
- GitHub-maintained actions are pinned to full commit SHAs: checkout v4.2.2 (`11bd71901bbe5b1630ceea73d27597364c9af683`), setup-node v4.4.0 (`49933ea5288caeca8642d1e84afbd3f7d6820020`), upload-artifact v4.6.2 (`ea165f8d65b6e75b540449e92b4886f43607fa02`). Official release pages establish these pins.

## Local preparation evidence

Passed: Node syntax; Python syntax; YAML parse and one-job/branch/permission/trigger assertions; Bash syntax for every shell step; exact 30-file archive extraction, fixture verification and protected checkout-source identity/cleanliness. Dependency-free negative probes reject an incorrect archive hash, missing member, extra member, duplicate member, symlink, traversal path, modified asset, modified fixture and pre-existing extraction destination before writing any artifact bytes. Separate local protected-source probes verify rejection of an altered source-object manifest, a wrong committed source object and a dirty reviewed working path.

Not run here: Playwright installation, Chromium launch, GitHub Actions, remote publication or deployment. Independent preflight and exact remote source/trigger review remain required before the single approved launch.

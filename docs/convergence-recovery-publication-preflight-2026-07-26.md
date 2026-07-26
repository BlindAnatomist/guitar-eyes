# Convergence Recovery Publication Preflight

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Recovery branch: `work/convergence-from-accepted-semantic-core`

Exact verified implementation source: `72159d25958fffd941c95351c6781cf579e1d622`

Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Status: publication mechanism reconstructed and checked; publication has not yet been performed

## Existing evidence

The exact source `72159d25958fffd941c95351c6781cf579e1d622` has already passed the read-only local execution gate:

- accepted foundation ancestry: passed;
- locked `npm ci`: passed under Node 20;
- test suites: 17 passed, 17 total;
- tests: 81 passed, 81 total;
- production build: passed;
- compiled recovery and accepted-contract checks: passed;
- final checkout: clean.

Evidence: `docs/convergence-recovery-local-execution-gate-2026-07-26.md`.

The recovery branch contains later documentation-only commits. Those later commits are not the publication source. Every publication command and workflow must explicitly check out `72159d25958fffd941c95351c6781cf579e1d622`.

## Current hosted warning

The stable address:

`https://blindanatomist.github.io/guitar-eyes/`

still serves the invalidated convergence build published from `d26e4172a0386ceb56ad5c0061e72d975b42fc43` until the corrected recovery candidate is deliberately deployed.

Do not ask John to continue acceptance testing against the currently hosted page.

## Proven Pages mechanism

The `github-pages` environment permits deployment through the authorized `main` context. A work-branch workflow previously built successfully but could not deploy because its branch was not allowed by the environment policy.

The confirmed temporary-main procedure is:

1. preserve fork `main` at `60c2e5de0887b1bcdd426d932632946edd07d3c3` before acting;
2. place one temporary workflow commit on fork `main`;
3. let that push-triggered workflow run in the authorized `main` context;
4. have the workflow explicitly check out the exact verified work-branch source commit with credentials disabled;
5. confirm `git rev-parse HEAD` equals the exact verified source;
6. install locked dependencies;
7. build with `PUBLIC_URL=/guitar-eyes`;
8. verify the compiled recovery identity and required interface material;
9. upload and deploy the Pages artifact;
10. read back the live HTML and every referenced asset;
11. prove the live bundle matches the newly built artifact rather than the invalidated preview;
12. restore fork `main` immediately and exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3`;
13. independently compare fork `main` with that commit and require identical, zero ahead, zero behind, and zero changed files.

The previously successful temporary trigger was commit `7f4782258360421dfa5114ad5f69bfd0ad1d6423`, workflow run `30217532641`. That workflow used a standard `ubuntu-24.04` runner, read-only repository contents permission, Pages and OIDC write permissions, a 15-minute build timeout, and a 5-minute deployment timeout. It created no bot commits.

## Narrowed publication workflow

The corrected recovery publisher should reuse the proven workflow structure with these changes:

1. exact checkout source becomes `72159d25958fffd941c95351c6781cf579e1d622`;
2. workflow name and summary identify `Convergence recovery checkpoint 1`;
3. no automated test command is repeated because the complete 17-suite, 81-test gate already passed against this exact source in the authenticated execution environment;
4. locked installation and production Pages build remain required because the Pages artifact must be created in the deployment workflow;
5. compiled checks require the recovery build identity, position controls, block controls, desktop and iPhone reader identities, original spatial source disclosure, and rhythm/measure construction material;
6. the Pages artifact is the only uploaded artifact;
7. the workflow never commits generated results or modifies the verified source branch.

Skipping a duplicate hosted test run does not weaken the checkpoint. The exact source has already passed the complete suite, and the publication workflow must fail if it cannot install, build, or prove the intended compiled identity.

## Required compiled checks

The generated build must prove:

- page title: `Test build Convergence recovery checkpoint 1`;
- first heading: `Test build: Convergence recovery checkpoint 1.`;
- Pages asset paths begin with `/guitar-eyes/static/`;
- `Previous position`;
- `Read current position`;
- `Next position`;
- `Previous tablature block`;
- `Next tablature block`;
- `Desktop tablature reader`;
- `iPhone tablature reader`;
- `Original spatial source layout`;
- compiled rhythm construction includes `Duration, ` and `quarter note`;
- compiled measure construction includes `Measure `;
- compiled string instruction material includes `High E string` and `open`.

The last three categories may be assembled at runtime and therefore need not exist as one contiguous minified phrase.

## Hosted read-back requirements

After a successful deployment, use a cache-busted request and record:

1. preview HTML HTTP status;
2. page title and first level-one heading;
3. referenced JavaScript and CSS asset names;
4. HTTP 200 for every referenced asset;
5. hosted HTML SHA-256;
6. hosted primary JavaScript SHA-256;
7. equality between the primary JavaScript filename reported by the build and the filename served by the live page;
8. live-bundle checks for the same exact and constructed material used during build verification.

A successful deployment job without this read-back is incomplete.

## Restoration requirements

Restoration is part of publication, not optional cleanup.

Immediately after hosted read-back:

1. force-restored fork `main` to `60c2e5de0887b1bcdd426d932632946edd07d3c3`;
2. compare `main` to that commit;
3. require status `identical`, ahead `0`, behind `0`, changed files `0`;
4. confirm `Phlypper/guitar-eyes` remained untouched;
5. confirm no pull request or merge was created.

If publication fails before deployment, restore and compare `main` before reporting the failure.

## Cost and scope

This repository is public, and the governing zero-dollar policy records that standard GitHub-hosted Actions for it do not consume the private-repository allowance. No paid runner, paid service, overage, or budget change is authorized.

The publication operation is administration and verification only. It does not authorize source repair, workflow proliferation, playback, teacher mode, pattern analysis, bookmarks, AI work, a pull request, or a merge.

## Stop condition

After publication, read-back, restoration, repository comparison, and documentation of the result, stop.

The next human gate is one bounded real-iPhone Safari and VoiceOver regression in Chat. Jason Washburn remains outside the active testing plan unless he agrees to participate.
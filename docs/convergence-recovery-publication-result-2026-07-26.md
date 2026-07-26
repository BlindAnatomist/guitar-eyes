# Convergence Recovery Publication Result

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Recovery branch: `work/convergence-from-accepted-semantic-core`

Published implementation source: `72159d25958fffd941c95351c6781cf579e1d622`

Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

Status: publication and hosted read-back passed; real-iPhone regression remains open

## Prerequisite evidence

The exact published source had already passed the read-only local execution gate:

- accepted-foundation ancestry: passed;
- locked installation under Node 20: passed;
- automated suites: 17 passed, 17 total;
- automated tests: 81 passed, 81 total;
- production build: passed;
- compiled-contract checks: passed;
- final checkout: clean.

The Pages workflow therefore did not repeat the complete automated test suite. It was restricted to exact-source checkout, locked installation, Pages-path build, compiled identity checks, artifact upload, and deployment.

## First publication attempt

Temporary trigger commit: `869612b1ed2f4be282d2dc3eba8964cfec475f61`

Workflow run: `30221814145`

Build job: `89845427921`

Result: failed before dependency installation or build.

The workflow successfully checked out the exact source `72159d25958fffd941c95351c6781cf579e1d622`, but `actions/checkout` used its default one-commit shallow history. The following step then attempted to prove that the older accepted foundation was an ancestor. Git could not prove ancestry because the older commit was absent from the shallow checkout.

This was a publisher-workflow precondition defect, not a source, dependency, test, build, or accessibility failure. The deployment job was skipped.

Fork `main` was immediately force-restored and independently compared with `60c2e5de0887b1bcdd426d932632946edd07d3c3`. The comparison was identical, zero ahead, zero behind, and zero changed files before the correction proceeded.

## Corrected publication

Corrected temporary trigger commit: `9435c247a4c7a09af412769b61973157d49a3ff9`

The correction changed only the temporary publisher checkout configuration by adding `fetch-depth: 0`. This made the accepted-foundation ancestry available to the exact same precondition check.

The corrected publisher:

1. explicitly checked out `72159d25958fffd941c95351c6781cf579e1d622`;
2. confirmed the exact source SHA;
3. confirmed accepted-foundation ancestry;
4. installed locked dependencies;
5. built with `PUBLIC_URL=/guitar-eyes`;
6. verified the recovery title, first heading, Pages asset path, position controls, block controls, both reader identities, original spatial-source disclosure, rhythm construction, measure construction, and open-string instruction material;
7. uploaded the Pages artifact;
8. deployed through the already-authorized `main` context.

No application source, test, fixture, dependency, or recovery-branch file was changed during publication.

## Hosted read-back

Because the connected GitHub surface does not list successful push-triggered workflow runs, one small read-back-only workflow was used after deployment. It did not install dependencies, test, build, upload, or deploy.

Read-back trigger commit: `6560da70517e582374cdfdf156dfbf8f9049d836`

Read-back workflow run: `30222035574`

Read-back job: `89846005803`

Result: success.

The read-back established:

1. the live preview returned HTTP 200;
2. the live HTML contained the exact title `Test build Convergence recovery checkpoint 1`;
3. the first heading was `Test build: Convergence recovery checkpoint 1.`;
4. the page referenced repository-scoped `/guitar-eyes/` assets;
5. every referenced repository asset returned HTTP 200;
6. exactly one primary `main.*.js` asset was present;
7. the live primary JavaScript contained all exact controls and reader identities required by the checkpoint;
8. the live JavaScript contained the component strings used to construct duration, measure, and open-string playing descriptions;
9. the verifier computed and printed the complete asset list, hosted HTML SHA-256, and hosted primary-JavaScript SHA-256 in the successful run log;
10. the verifier published commit status context `guitar-eyes/recovery-readback` with state `success` and a target link to the exact run.

The accepted live-bundle checks included:

- `Previous position`;
- `Read current position`;
- `Next position`;
- `Previous tablature block`;
- `Next tablature block`;
- `Desktop tablature reader`;
- `iPhone tablature reader`;
- `Original spatial source layout`;
- `Duration, ` and `quarter note` construction material;
- `Measure ` construction material;
- `High E string` and `open` construction material.

## Final restoration

Immediately after successful hosted read-back, fork `main` was force-restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison result:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

The temporary publisher and read-back commits are not retained on `main`.

`Phlypper/guitar-eyes` remained untouched. No pull request or merge was created.

## Verdict

The corrected convergence recovery candidate is now hosted and ready for one bounded real-iPhone Safari and VoiceOver regression.

Do not begin playback, teacher mode, pattern analysis, bookmarks, AI implementation, a pull request, or a merge.

Jason Washburn remains outside the active testing plan unless he agrees to participate. His desktop acceptance is not a prerequisite for the next iPhone gate.

# Convergence Verification and Preview Publication

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Authorized work branch: `work/iphone-voiceover-tablature-audit`

Verified and published source: `d26e4172a0386ceb56ad5c0061e72d975b42fc43`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

## Authority preflight

Before installation or publication:

- the work branch compared as identical to `d26e4172a0386ceb56ad5c0061e72d975b42fc43`;
- fork `main` compared as identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`;
- the `github-pages` environment still used a custom branch policy allowing only `main`;
- the previously proven temporary-main publisher procedure and its successful related commits were inspected;
- `Phlypper/guitar-eyes` was accessed read-only and remained at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

No pull request or merge was opened. Jason Washburn was not contacted or assigned testing.

## Local verification

The first local `npm ci --no-audit --no-fund` attempt failed before testing because the Work runtime tried to create its npm cache at the unwritable path `/root/.npm`. The incomplete generated `node_modules` directory was moved aside. No repository source or lockfile was changed.

One environment-only installation retry used a task-specific writable npm cache:

- result: success;
- packages installed: 1,678;
- source changes required: none.

The exact complete test command then passed:

- command: `CI=true npm test -- --watchAll=false`;
- test suites: 4 passed, 4 total;
- tests: 20 passed, 20 total;
- snapshots: 0;
- reported time: 2.314 seconds.

The exact production build command then passed:

- command: `npm run build`;
- result: compiled successfully;
- local main bundle: `build/static/js/main.96c6c347.js`.

The test run emitted existing nonblocking React `act` deprecation and forced worker-exit warnings. The build emitted existing Create React App, Babel preset, Browserslist, and Node deprecation warnings. No warning was treated as stronger evidence than the passing exit status.

## Intentional zero-dollar publication checkpoint

The proven protected-main procedure was reused with one temporary workflow commit on fork `main`:

- temporary trigger commit: `7f4782258360421dfa5114ad5f69bfd0ad1d6423`;
- workflow run: `30217532641`;
- workflow: `Temporary convergence verification and preview`;
- runner: standard GitHub-hosted `ubuntu-24.04`;
- verification timeout: 15 minutes;
- deployment timeout: 5 minutes;
- verified checkout: `d26e4172a0386ceb56ad5c0061e72d975b42fc43`;
- bot commits: none.

The combined publisher installed locked dependencies, ran the complete test suite once, built with `PUBLIC_URL=/guitar-eyes`, verified convergence identity in the compiled JavaScript, uploaded the one-day Pages artifact, and published it through the authorized `main` deployment context.

GitHub-hosted results:

- verification job `89834214485`: success;
- locked installation: success, 1,678 packages installed;
- test suites: 4 passed, 4 total;
- tests: 20 passed, 20 total;
- snapshots: 0;
- reported test time: 3.565 seconds;
- production build: compiled successfully;
- published main bundle: `build/static/js/main.10ddd4a1.js`;
- compiled convergence identity check: success;
- Pages artifact ID: `8636240470`;
- artifact SHA-256: `a1f349e6d3a998481cc7ff1f73fc27e547ff8db22e532305f913c873b974a969`;
- deployment job `89834278933`: success;
- deployment URL: `https://blindanatomist.github.io/guitar-eyes/`.

No GitHub job or workflow rerun occurred. The only retry in this checkpoint was the local environment-only npm installation retry described above.

## Hosted read-back

A cache-busted read-back after deployment established:

- preview HTML: HTTP 200;
- page title: `Guitar Eyes accessible tablature reader`;
- published main JavaScript: `/guitar-eyes/static/js/main.10ddd4a1.js`;
- published main JavaScript: HTTP 200;
- every asset referenced by the HTML returned HTTP 200: favicon, logo, manifest, main JavaScript, and main CSS;
- hosted HTML SHA-256: `e7f5e5082ac88bfc91a71d92b2665ddfbfac7e8b7ddb3d62fa1fb3dffad6a169`;
- hosted main JavaScript SHA-256: `ab2f7f8b2b1654ff360a8ec7820c083767ce9d72318ad52248e34fb2a692ecc9`.

The live JavaScript contains all of:

- `Previous position`;
- `Read current position`;
- `Next position`;
- `Previous tablature block`;
- `Next tablature block`;
- `Position navigation`;
- `iPhone semantic reader`;
- `Desktop semantic reader`.

The hosted bundle filename exactly matches the bundle reported by the successful publisher build. This prevents the previous proof build from being mistaken for the convergence preview.

## Main restoration

Immediately after hosted read-back, fork `main` was force-restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison result:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

The temporary workflow commit is not retained on `main`. `Phlypper/guitar-eyes` remained untouched.

## Remaining acceptance

Automated and hosted convergence verification is complete. Checkpoint 4 still requires John's bounded real-iPhone Safari and VoiceOver regression acceptance covering:

1. native Files-picker return and useful focus recovery;
2. successful load status and semantic-reader heading;
3. Previous position, Read current position, and Next position in the accepted order;
4. measure context while moving among synchronized positions;
5. multiple complete tablature blocks;
6. Previous tablature block and Next tablature block behavior, including disabled boundary states.

This test belongs in Chat, not Work.

Jason's Mac recognition and desktop usability acceptance is explicitly deferred unless he agrees to participate. It is not a blocker to John's iPhone gate.

Playback, teacher mode, pattern analysis, bookmarks, AI work, a pull request, a merge, and upstream modification remain outside scope.

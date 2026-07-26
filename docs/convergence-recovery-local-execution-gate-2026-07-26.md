# Convergence Recovery Local Execution Gate

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/convergence-from-accepted-semantic-core`

Verified source commit: `72159d25958fffd941c95351c6781cf579e1d622`

Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Status: passed

## Authority and ancestry

The execution environment checked out exactly `72159d25958fffd941c95351c6781cf579e1d622`.

`git merge-base --is-ancestor 85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e HEAD` passed. The verified source therefore remains a direct descendant of the accepted rhythm-and-measure foundation.

No source, test, fixture, dependency, workflow, branch, or repository-administration change was authorized or performed during this gate.

## Locked installation

Environment:

- Node: `20.20.2`
- package manager: npm through the committed lockfile

Command:

`npm ci --no-audit --no-fund`

Result: passed.

One permitted environment-only retry occurred. The first attempt resolved the lowercase cache setting to unwritable `/root/.npm`. The retry used `/tmp/guitar-eyes-npm-cache-retry` and installed 1,678 packages. No repository file changed.

## Complete automated suite

Command:

`CI=true npm test -- --watchAll=false --runInBand`

Result:

- test suites: 17 passed, 17 total;
- tests: 81 passed, 81 total;
- snapshots: none reported;
- no source or test repair was required.

This matches the exact preflight expectation: 13 inherited suites plus four recovery suites, with all 70 inherited tests and all 11 recovery tests passing.

## Production build

Command:

`npm run build`

Result: passed. Create React App reported that the application compiled successfully.

Generated assets:

- `main.aed9412c.js`
- `7.eaf0ef0f.chunk.js`
- `main.6939fd57.css`

## Compiled-artifact evidence

The generated HTML or JavaScript contained the following recovery and accepted-contract evidence:

1. `Test build: Convergence recovery checkpoint 1.` — exact literal;
2. `Previous position` — exact literal;
3. `Read current position` — exact literal;
4. `Next position` — exact literal;
5. `Previous tablature block` — exact literal;
6. `Next tablature block` — exact literal;
7. `Duration, quarter note` — present through compiled string construction;
8. `Measure 1 of 2` — present through compiled string construction;
9. `High E string, open` — present through compiled string construction;
10. `Desktop tablature reader` — exact literal;
11. `iPhone tablature reader` — exact literal;
12. `Original spatial source layout` — exact literal.

The constructed phrases are expected to be assembled at runtime rather than stored as one contiguous minified literal. Their component text and construction paths were present in the compiled application.

## Final cleanliness

Final `git status --short`: empty.

No cleanup was required. No commit was created by the execution environment.

## Non-failing warnings

The gate reported warnings that did not fail installation, tests, or build:

- unknown `http-proxy` environment configuration;
- deprecated transitive npm dependencies;
- ReactDOM test-utils `act` deprecation;
- Create React App's undeclared Babel plugin dependency warning;
- outdated `caniuse-lite` browser data.

These warnings do not invalidate this gate. They should not be converted into broad dependency modernization during the convergence checkpoint.

## Verdict

Convergence recovery source checkpoint 1 has passed its locked local execution gate.

The source at `72159d25958fffd941c95351c6781cf579e1d622` is now supported by:

1. correct accepted-source ancestry;
2. deterministic locked installation;
3. 17 of 17 passing suites;
4. 81 of 81 passing tests;
5. successful production build;
6. compiled-artifact evidence for the accepted speech, rhythm, measure, navigation, interface, and build-identity contracts;
7. a clean final checkout.

## Remaining gate

The recovery candidate is not yet hosted and has not yet undergone real-iPhone Safari and VoiceOver regression testing.

The next bounded task is publication of the exact verified source through the proven protected-main procedure, hosted artifact and live-bundle read-back, immediate restoration of fork `main`, and then one bounded iPhone regression in Chat.

Do not modify the verified implementation merely because documentation commits follow it. Any publication workflow must explicitly check out source commit `72159d25958fffd941c95351c6781cf579e1d622` rather than the later documentation-only branch head.

Jason Washburn's desktop acceptance remains deferred unless he agrees to participate. No pull request, merge, playback, teacher mode, pattern analysis, bookmarks, or AI work is authorized.
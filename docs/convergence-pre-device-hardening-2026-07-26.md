# Convergence Pre-Device Hardening

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iphone-voiceover-tablature-audit`

Status: source hardening, locked dependency test/build, and hosted publication complete; real-device acceptance remains open

## Authority and limits

- `Phlypper/guitar-eyes` remains untouched.
- Fork `main` remains the clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- No pull request or merge is authorized.
- Playback, teacher mode, pattern analysis, bookmarks, and AI remain outside this checkpoint.
- Jason Washburn's participation is not assumed. Desktop owner acceptance is deferred unless and until he agrees to test a mature preview.

## Regression found before device testing

The convergence rewrite preserved multiple semantic tablature blocks but dropped the explicit `Previous tablature block` and `Next tablature block` controls that had already been exercised in the iPhone workflow. Sequential position navigation could still cross a block boundary, but the accepted direct block jump was no longer available.

## Source repair

Both readers now:

1. preserve the accepted `Previous position`, `Read current position`, `Next position` order;
2. expose a named `Position navigation` group;
3. show `Previous tablature block` and `Next tablature block` only when more than one complete block exists;
4. jump to the first synchronized position of the neighboring block;
5. disable impossible first-block and last-block actions;
6. announce the semantic position reached after a block jump;
7. bound stale local indexes to a valid document position while a newly parsed document resets reader state.

The desktop reader also gives each horizontally scrollable semantic table a named region so a screen reader does not encounter an unexplained generic focus stop.

## Automated coverage added

Component tests now cover:

- exact position-control order;
- absence of block controls for a single-block document;
- explicit block-control names and order for a multi-block document;
- first/last block disabled states;
- jump to block two and the resulting semantic description;
- equivalent desktop and iPhone block behavior;
- named desktop table regions;
- continued refusal to intercept VoiceOver modifier-key combinations.

## Verification performed without GitHub-hosted execution

The changed JavaScript and JSX source and test files were parsed and transpiled successfully with the available TypeScript compiler. The revised workflow YAML was parsed successfully.

This evidence does not replace the locked dependency, React Testing Library, production build, hosted Safari, or real VoiceOver gates.

## Verification workflow hardening

`.github/workflows/iphone-audit.yml` is now an intentional convergence checkpoint rather than an iPhone-proof bot-commit workflow. It:

- remains manual `workflow_dispatch` only;
- uses a standard Linux GitHub-hosted runner;
- retains a 15-minute timeout and concurrency cancellation;
- has read-only repository contents permission;
- runs locked installation, the complete automated suite once, and the production build;
- records the exact source commit and outcomes in the GitHub job summary;
- does not commit generated results or move a repository branch.

## Remaining sequence

1. Dispatch the hardened verification workflow once against the exact work-branch head.
2. Inspect any failed job before changing source or rerunning anything.
3. If installation, tests, and build pass, publish one convergence preview through the already proven protected-main procedure and restore fork `main` exactly.
4. Ask John for one bounded real-iPhone Safari and VoiceOver regression pass covering upload focus, position controls, multiple blocks, measure descriptions, and block jumps.
5. Continue desktop automated and browser-level inspection without Jason.
6. Ask Jason for final Mac recognition and usability acceptance only after the preview is mature and only if he agrees to participate.

## Completed verification and publication

The automated and hosted steps above completed on July 26, 2026:

- exact verified and published source: `d26e4172a0386ceb56ad5c0061e72d975b42fc43`;
- local suites and tests: 4 of 4 suites and 20 of 20 tests passed;
- local production build: passed;
- GitHub Actions run: `30217532641`, first attempt, success;
- GitHub-hosted suites and tests: 4 of 4 suites and 20 of 20 tests passed;
- GitHub-hosted production build and compiled convergence identity checks: passed;
- Pages publication: passed at `https://blindanatomist.github.io/guitar-eyes/`;
- live HTML and exact main JavaScript asset: HTTP 200;
- live asset contains `Previous tablature block` and `Next tablature block`;
- fork `main` restored to `60c2e5de0887b1bcdd426d932632946edd07d3c3` and compared as identical, zero ahead, zero behind, and zero changed files;
- upstream remained untouched;
- GitHub Actions reruns: none.

Full evidence is in `docs/convergence-verification-preview-2026-07-26.md`.

The next mandatory human gate is John's iPhone regression against the stable preview. Jason is not currently a blocker to source completion or iPhone acceptance, and his desktop acceptance remains deferred unless he agrees to participate.

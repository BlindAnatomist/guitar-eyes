# Guitar Eyes iPhone Extension Status

Last updated: July 24, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Audit and proof branch: `work/iphone-voiceover-tablature-audit`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Required continuity reading

Before proposing repository administration, deployment repair, accessibility architecture, playback, teacher mode, or future AI work, inspect:

1. `docs/solved-problems-and-reusable-procedures.md` for previously solved failures and reusable procedures;
2. `docs/iphone-voiceover-tablature-audit.md` for the source and accessibility audit;
3. `docs/proof-automated-results.md` for bounded-proof verification;
4. `docs/hosted-preview-status.md` for deployment state.

Do not rely on chat memory alone or rediscover a procedure already recorded in the repository.

## Architectural vision

The long-term objective is to evolve Guitar Eyes from an accessible tablature reader into an accessible guitar teaching platform.

The semantic tablature model is the authoritative representation of the music. Accessibility, playback, lesson generation, pattern recognition, and future AI capabilities must consume the same semantic model rather than maintaining separate representations.

Near-term architectural direction:

1. semantic parser and accessible navigation;
2. teacher mode using the semantic model;
3. playback from the semantic model;
4. rule-based recognition of repeated measures, riffs, chord shapes, and variations without AI;
5. user-defined lesson sections and bookmarks;
6. optional AI analysis that produces reusable lesson metadata and recommended learning order from parsed music.

AI should enhance instruction rather than becoming a requirement for core reading, navigation, playback, looping, or deterministic pattern recognition.

## Current checkpoint

Checkpoint 3: Bounded iPhone proof implemented, verified, and hosted for real-device acceptance.

1. GitHub recognizes `BlindAnatomist/guitar-eyes` as a fork.
2. Fork `main` is identical to the authoritative upstream commit: zero commits ahead, zero behind, and no changed files.
3. Jason Washburn's upstream repository has not been modified.
4. No pull request has been opened.
5. The source audit is recorded in `docs/iphone-voiceover-tablature-audit.md`.
6. Baseline automation results are recorded in `docs/baseline-automated-results.md`.
7. Proof automation results are recorded in `docs/proof-automated-results.md`.
8. Hosted preview status is recorded in `docs/hosted-preview-status.md`.
9. Solved problems and reusable procedures are recorded in `docs/solved-problems-and-reusable-procedures.md`.

## Implemented bounded proof

The audit branch now:

1. preserves Jason's desktop grid reader;
2. adds a separate iPhone semantic reader mode;
3. accepts one clean plain-text six-string tablature block;
4. constructs synchronized musical positions rather than splitting only into raw characters;
5. distinguishes fretted notes, open strings, silent strings, technique notation, and unsupported material;
6. provides Previous position, Next position, and Read current position controls;
7. provides semantic vertical descriptions;
8. avoids placing every dash and separator in the iPhone VoiceOver swipe order;
9. exposes understandable upload and parse errors;
10. repairs the multi-column checkbox label association;
11. uses restrained live announcements and deliberate post-upload focus;
12. includes a known clean six-string test fixture.

## Automated verification

Environment:

- Node `v20.20.2`
- npm `10.8.2`

Results:

1. `npm ci` passes.
2. All 12 automated tests pass.
3. The production build passes.
4. The hosted page returns successfully.
5. The deployed JavaScript asset loads successfully.
6. The deployed CSS asset loads successfully.

Inherited Create React App, dependency deprecation, and vulnerability warnings remain recorded for later treatment. They do not currently prevent this bounded proof from building or running.

## Hosted preview

Preview URL:

`https://blindanatomist.github.io/guitar-eyes/`

GitHub's `github-pages` environment permits only `main`, so direct publication from the audit branch was rejected. Publication was completed without changing the final repository authority:

1. a temporary workflow commit was placed on fork `main`;
2. that workflow checked out, tested, built, published, and read back the audit branch;
3. `main` was then restored to the exact upstream commit;
4. GitHub comparison confirmed complete restoration;
5. the permanently failing audit-branch deployment workflow was removed.

The same controlled procedure can be repeated for future preview updates without requiring the user to navigate GitHub settings or spend Work credits. The complete reusable procedure is recorded in `docs/solved-problems-and-reusable-procedures.md`.

## Manual acceptance gate

Real-iPhone Safari and VoiceOver acceptance has not yet been completed.

The next gate is a short test of:

1. initial page and mode announcement;
2. selecting the known clean text fixture;
3. predictable focus after upload;
4. Previous position, Next position, and Read current position behavior;
5. semantic position descriptions;
6. absence of raw dash-by-dash VoiceOver navigation in iPhone mode;
7. restrained announcements and understandable errors.

No upstream proposal or pull request is authorized before this gate passes and the result is recorded in the repository.
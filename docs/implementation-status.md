# Guitar Eyes iPhone Extension Status

Last updated: July 24, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Audit and proof branch: `work/iphone-voiceover-tablature-audit`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Final authority verification: fork `main` is identical to the authoritative upstream commit, with zero commits ahead, zero behind, and no changed files.

## Required continuity reading

Before proposing repository administration, deployment repair, accessibility architecture, playback, teacher mode, or future AI work, inspect:

1. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` for the governing problem-and-solution register;
2. `docs/solved-problems-and-reusable-procedures.md` for previously solved deployment and repository procedures;
3. `docs/iphone-voiceover-tablature-audit.md` for the source and accessibility audit;
4. `docs/proof-automated-results.md` for bounded-proof verification;
5. `docs/real-iphone-acceptance.md` for exact real-device evidence;
6. `docs/hosted-preview-status.md` and `docs/temporary-publisher-result.md` for publication state.

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

Checkpoint 3: Bounded iPhone semantic-reader proof implemented, automated, hosted, and accepted on the real target iPhone.

1. GitHub recognizes `BlindAnatomist/guitar-eyes` as a fork.
2. Fork `main` is identical to the authoritative upstream commit.
3. Jason Washburn's upstream repository has not been modified.
4. No pull request has been opened.
5. The source audit is recorded in `docs/iphone-voiceover-tablature-audit.md`.
6. Proof automation results are recorded in `docs/proof-automated-results.md`.
7. Hosted publication succeeded at the bounded preview address.
8. Real-iPhone Safari and VoiceOver acceptance passed and is recorded in `docs/real-iphone-acceptance.md`.
9. Known failures, rejected approaches, and proven repairs are recorded in `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`.

Checkpoint 3 verdict: Pass.

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
11. places iPhone workflow controls before collapsed Mac instructions on coarse-pointer devices;
12. uses restrained live announcements and deliberate post-upload focus;
13. recovers focus after Safari returns from the native iOS Files picker;
14. includes a known clean six-string test fixture.

## Automated verification

Environment:

- Node `v20.20.2`
- npm `10.8.2`

Final repair-source results:

1. `npm ci` passed.
2. All 14 automated tests passed.
3. The production build passed.
4. GitHub Pages publication passed.
5. The hosted preview was available for real-device testing.
6. Fork `main` was restored and compared as identical to upstream after temporary publication.

Inherited Create React App, dependency deprecation, and vulnerability warnings remain recorded for later treatment. They do not currently prevent this bounded proof from building or running.

## Hosted preview

Preview URL:

`https://blindanatomist.github.io/guitar-eyes/`

GitHub's `github-pages` environment permits only `main`, so direct publication from the audit branch was rejected. Publication was completed with the proven controlled temporary-main procedure:

1. a temporary workflow commit was placed on fork `main`;
2. that workflow checked out, tested, built, and published the work branch;
3. the work branch received a permanent publication-result record;
4. `main` was restored to the exact upstream commit;
5. GitHub comparison confirmed complete restoration.

## Real-iPhone acceptance

Tester: John Darrin Washburn.

Device: iPhone Safari with VoiceOver.

Accepted results:

1. Jason's title and the iPhone extension explanation are encountered before the iPhone workflow.
2. The iPhone semantic reader is selected by default on the target touch device.
3. Upload and instrument controls precede the collapsed Mac keyboard instructions.
4. The clean six-string fixture parses as five synchronized positions.
5. The semantic reader output is understandable.
6. After Safari returns from the native Files picker, VoiceOver focus recovers into the application instead of remaining on Page Menu.
7. The successful result announces: `Loaded five synchronized positions in iPhone reader mode.`

The native-picker focus repair is now `local-proven`, and the reusable cross-repository pattern is recorded as `XR-IOS-PICKER-FOCUS-001`.

## Scope boundary and next authorization

This closes the bounded iPhone proof only.

It does not authorize:

1. modification of `Phlypper/guitar-eyes`;
2. a pull request;
3. merging the work branch into fork `main`;
4. redesign of Jason's desktop reader;
5. playback, teacher mode, pattern analysis, bookmarks, or AI implementation.

Any next phase should begin from this accepted semantic and accessibility foundation, reconstruct repository authority, and receive a separately bounded objective.
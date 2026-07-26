# Guitar Eyes Implementation Status

Last updated: July 26, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current recovery branch: `work/convergence-from-accepted-semantic-core`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Fork `main` is preserved as an exact upstream-tracking branch. Jason Washburn's repository remains untouched. No pull request has been opened and no development work has been merged into `main`.

## Invalidated convergence line

The July 26 published convergence candidate at `d26e4172a0386ceb56ad5c0061e72d975b42fc43` is invalidated.

A direct comparison established that it was built from a diverged source line that was 120 commits behind the accepted rhythm-and-measure foundation. Its passing tests verified a thinner replacement contract and did not prove preservation of accepted behavior.

The owner's real-iPhone test exposed the lost contracts:

1. navigation controls repeated full playing instructions;
2. ordinary unplayed strings were announced;
3. accepted duration speech was absent.

Do not continue feature repair or acceptance testing on `work/iphone-voiceover-tablature-audit`. Preserve that branch as evidence.

Detailed recovery record:

- `docs/convergence-lineage-recovery-2026-07-26.md`.

## Required continuity reading

Before changing implementation, deployment, accessibility, testing, or repository administration, inspect:

1. `AGENTS.md`;
2. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
3. `docs/solved-problems-and-reusable-procedures.md`;
4. `docs/shared-semantic-core-plan.md`;
5. `docs/shared-semantic-core-implementation.md`;
6. `docs/real-world-tab-format-corpus-checkpoint-1.md`;
7. `docs/rhythm-duration-checkpoint-1.md`;
8. `docs/measure-recognition-checkpoint-1.md`;
9. `docs/convergence-lineage-recovery-2026-07-26.md`;
10. `docs/convergence-recovery-source-checkpoint-1.md`;
11. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a procedure already recorded in the repository.

## Architectural authority

Guitar Eyes is one application with one musical engine and two interfaces:

1. the iPhone semantic reader presents synchronized, sequential positions for Safari and VoiceOver;
2. the desktop reader presents the same semantic document as strings by synchronized positions;
3. supported guitar and bass ASCII input is parsed once;
4. instrument identity, blocks, strings, positions, rhythm, and explicit measures belong to the shared semantic document;
5. legacy desktop parsing remains only as a compatibility fallback when semantic interpretation is unsafe.

Playback, teaching, looping, pattern recognition, and later AI must consume this same model rather than create separate musical representations.

## Accepted shared-core capabilities

Real-iPhone Safari and VoiceOver acceptance has already passed for:

1. clean six-string guitar;
2. clean four-string bass;
3. multiple guitar tablature blocks;
4. automatic guitar and bass detection in both directions;
5. automatic correction of the instrument selector;
6. durable picker-return focus after successful uploads;
7. durable picker-return focus after failed uploads;
8. normal guitar and bass string naming;
9. quiet Previous and Next position movement;
10. dedicated Read current position speech;
11. actionable speech that omits ordinary unplayed strings;
12. open strings, frets, explicit mute notation, techniques, and supported duration retained in speech;
13. block navigation for multi-block files;
14. W, H, Q, E, and S duration mapping and speech;
15. explicit measure recognition from aligned shared barlines;
16. measure and position-within-measure speech;
17. the accepted control order: Previous position, Read current position, Next position.

These remain regression requirements, not redesign choices.

## Convergence recovery source checkpoint 1

Source status: implemented and reviewed on `work/convergence-from-accepted-semantic-core`.

Detailed record:

- `docs/convergence-recovery-source-checkpoint-1.md`.

The recovery implementation:

1. leaves the accepted iPhone reader, position-description layer, semantic parser, rhythm mapper, measure model, format detector, import coordinator, and Files-picker focus algorithm unchanged;
2. routes supported semantic documents to `DesktopSemanticReader`;
3. uses document-global positions for every desktop block table;
4. preserves strings as rows and synchronized positions as columns;
5. carries duration and measure context into desktop presentation;
6. preserves Previous position, Read current position, Next position in the accepted order;
7. keeps movement quiet and reserves complete speech for Read current position;
8. provides quiet multi-block jumps;
9. uses plain-key desktop navigation without intercepting VoiceOver Control+Option commands;
10. retains original source rows in collapsed disclosures;
11. routes unsafe semantic input to an explicitly labeled compatibility grid;
12. keeps raw fallback cells outside the ordinary Tab sequence;
13. gives the candidate a deterministic title and first heading: `Convergence recovery checkpoint 1`.

New tests have been authored for desktop semantic rendering, cross-interface document preservation, inherited iPhone speech behavior after mode switching, global multi-block indexes, VoiceOver modifier preservation, and compatibility-grid focus behavior.

## Evidence boundary

The chat source-review checkpoint does not claim:

- locked dependency installation success;
- automated test success;
- production build success;
- browser execution success;
- hosted publication;
- real-iPhone recovery acceptance;
- Mac owner acceptance.

The available chat runtime cannot reach GitHub or npm directly. It cannot execute the repository, and no substitute result is recorded.

## Previously accepted verification state

The accepted measure checkpoint at `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e` passed:

1. the complete inherited automated test suite;
2. production build;
3. compiled-artifact checks;
4. GitHub Pages artifact upload and deployment;
5. direct inspection of the downloaded Pages artifact;
6. real-iPhone Safari and VoiceOver acceptance.

Verification workflow: `30192049347`.

The stable Pages address was later overwritten by the invalidated convergence build. Do not use the current hosted page for further acceptance until a corrected recovery candidate is deliberately published.

## Current checkpoint verdict

Shared semantic core, real-world ASCII corpus foundation, rhythm duration checkpoint 1, and measure recognition checkpoint 1: passed.

Convergence recovery source checkpoint 1: implemented and source-reviewed; execution gate pending.

## Next bounded gate

Before publication:

1. identify the exact final recovery-branch head;
2. run `npm ci --no-audit --no-fund` once in an authenticated execution environment;
3. run the complete inherited and new automated test suite once;
4. run the production build once;
5. inspect any exact failure before changing source or rerunning;
6. verify compiled artifacts contain the accepted duration, measure, quiet-navigation, no-silent-string, and recovery-build identity material;
7. publish one corrected preview only after all preceding gates pass;
8. restore fork `main` exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` after any temporary publication procedure;
9. ask John for one bounded iPhone regression only after the corrected preview is stable;
10. defer Jason's desktop acceptance unless he agrees to participate.

No additional Work session should begin until the source branch and execution prompt have been checked against this status record and exact ancestry.

## Scope boundaries

This recovery does not authorize:

1. modification of `Phlypper/guitar-eyes`;
2. a pull request or merge;
3. replacement of Jason's desktop interaction concept;
4. production publication;
5. playback, teacher mode, pattern analysis, bookmarks, or AI implementation;
6. paid services or bulk commercial-site scraping;
7. owner-operated desktop or laptop testing.

# Guitar Eyes Implementation Status

Last updated: July 26, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current recovery branch: `work/convergence-from-accepted-semantic-core`

Accepted semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Verified and hosted recovery source: `72159d25958fffd941c95351c6781cf579e1d622`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Fork `main` is identical to the authoritative upstream commit. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

Documentation-only commits after the verified source do not replace the implementation identity.

## Invalidated convergence line

The July 26 preview built from `d26e4172a0386ceb56ad5c0061e72d975b42fc43` remains invalidated.

That source was on a diverged line 120 commits behind the accepted rhythm-and-measure foundation. Its passing tests verified a thinner replacement contract and did not prove preservation of accepted behavior.

The owner's real-iPhone test exposed the lost contracts:

1. movement controls repeated complete playing instructions;
2. ordinary unplayed strings were announced;
3. accepted duration speech was absent.

Do not continue implementation or acceptance work on `work/iphone-voiceover-tablature-audit`. Preserve it as forensic evidence.

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
11. `docs/convergence-recovery-local-execution-gate-2026-07-26.md`;
12. `docs/convergence-recovery-publication-preflight-2026-07-26.md`;
13. `docs/convergence-recovery-publication-result-2026-07-26.md`;
14. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory, branch names, or recent modification dates when exact ancestry and accepted evidence exist.

## Architectural authority

Guitar Eyes is one application with one musical engine and two interfaces:

1. the iPhone semantic reader presents synchronized positions sequentially for Safari and VoiceOver;
2. the desktop reader presents the same semantic document as strings by synchronized positions;
3. supported guitar and bass ASCII input is parsed once;
4. instrument identity, blocks, strings, positions, rhythm, and measures belong to the shared semantic document;
5. the original desktop grid remains only as a compatibility fallback when semantic interpretation is unsafe.

Playback, teaching, looping, pattern recognition, and later AI must consume this same document rather than create separate musical interpretations.

## Preserved accepted behavior

The recovery source does not modify:

- `src/IPhoneTabReader.js`;
- `src/positionDescription.js`;
- `src/iphoneTabModel.js`;
- `src/asciiRhythm.js`;
- `src/measureModel.js`;
- `src/tabImportCoordinator.js`;
- `src/tabFormatDetector.js`;
- inherited parser, rhythm, measure, import, playing-description, and iPhone tests.

Accepted regression requirements remain:

1. Previous position, Read current position, Next position in that order;
2. quiet position and block movement;
3. Read current position as the only semantic-reader action that sends the complete playing instruction to the live region;
4. omission of ordinary unplayed strings from playing speech;
5. continued speech for open strings, frets, explicit mute notation, techniques, and supported durations;
6. W, H, Q, E, and S duration mapping and speech;
7. explicit aligned-barline measure recognition;
8. measure and position-within-measure speech;
9. automatic guitar and bass detection;
10. successful and failed iOS Files-picker focus recovery.

## Convergence recovery implementation

Supported semantic files now use `DesktopSemanticReader`, which consumes the accepted semantic document already used by iPhone.

The desktop interface provides:

1. strings as rows and synchronized positions as columns;
2. duration and measure context;
3. the accepted Previous, Read current, Next order;
4. quiet movement and dedicated Read current speech;
5. quiet multi-block navigation using document-global indexes;
6. plain-key movement using Left Arrow, Right Arrow, Home, and End;
7. no interception of VoiceOver Control+Option commands;
8. named semantic-table regions;
9. highlighted current-position columns;
10. original spatial source rows in collapsed disclosures;
11. focus on the desktop reader heading after a successful upload.

Unsafe semantic input routes to a clearly labeled compatibility grid. Its raw cells remain outside the ordinary Tab sequence, VoiceOver modifier commands remain untouched, and plain-arrow movement is available only after the grid itself is focused.

## Passed local execution gate

The exact source `72159d25958fffd941c95351c6781cf579e1d622` passed one read-only execution gate under Node `20.20.2`:

1. accepted-foundation ancestry: passed;
2. locked installation: passed after one permitted environment-only npm-cache retry;
3. automated suites: 17 passed, 17 total;
4. automated tests: 81 passed, 81 total;
5. production build: passed;
6. compiled-artifact contract checks: passed;
7. final checkout: clean.

Detailed record:

- `docs/convergence-recovery-local-execution-gate-2026-07-26.md`.

## Passed publication and hosted read-back

Valid preview:

`https://blindanatomist.github.io/guitar-eyes/`

The exact verified source was published through the proven temporary-main procedure.

The first temporary publisher run, `30221814145`, failed before installation because a one-commit shallow checkout could not prove accepted-foundation ancestry. The deployment was skipped, `main` was restored and independently confirmed clean, and no source repair was made.

The corrected publisher used full checkout history and deployed the exact verified source. A separate read-back-only workflow did not rebuild or redeploy; it inspected the live site.

Read-back evidence:

- trigger commit: `6560da70517e582374cdfdf156dfbf8f9049d836`;
- workflow run: `30222035574`;
- job: `89846005803`;
- result: success;
- live HTML: HTTP 200;
- exact recovery title and first heading: present;
- every referenced repository asset: HTTP 200;
- one primary `main.*.js` bundle: present;
- position controls, block controls, both reader identities, original spatial-source disclosure, rhythm construction, measure construction, and open-string construction: present in the live bundle.

After read-back, fork `main` was restored to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Independent comparison:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

Detailed record:

- `docs/convergence-recovery-publication-result-2026-07-26.md`.

## Current checkpoint verdict

Passed:

1. shared semantic core;
2. real-world ASCII corpus foundation;
3. rhythm duration checkpoint 1;
4. measure recognition checkpoint 1;
5. convergence recovery source checkpoint 1;
6. convergence recovery local execution gate;
7. corrected Pages publication;
8. hosted artifact and live-bundle read-back;
9. final fork-main restoration.

Still open:

1. one bounded real-iPhone Safari and VoiceOver regression;
2. desktop owner acceptance only if Jason agrees to participate.

## Next bounded task

John performs the real-device test on his iPhone in Chat.

The test should cover:

1. opening the valid recovery preview in Safari with VoiceOver;
2. selecting iPhone semantic reader;
3. uploading a controlled multi-block guitar file containing aligned measure bars and rhythm values;
4. confirming focus returns to the successful load result or iPhone reader rather than Safari Page Menu;
5. confirming Previous position, Read current position, Next position order;
6. confirming Previous and Next move without announcing full playing instructions;
7. confirming Read current announces measure, position, duration, and only the strings that are played or explicitly muted;
8. confirming ordinary unplayed strings are omitted;
9. confirming open strings are spoken;
10. confirming Previous and Next tablature block move quietly and enforce first/last boundaries.

Do not begin another implementation or publication cycle unless this real-device test identifies a defect.

## Scope boundaries

Do not begin:

- playback;
- teacher mode;
- pattern analysis;
- bookmarks;
- AI implementation;
- a pull request;
- a merge;
- upstream modification;
- paid services or GitHub overages.

Jason is not assumed to participate.

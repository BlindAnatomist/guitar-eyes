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

## Current recovery verdict

The July 26 published convergence candidate at `d26e4172a0386ceb56ad5c0061e72d975b42fc43` is invalidated.

A direct comparison established that it was built from a diverged source line that was 120 commits behind the accepted rhythm-and-measure foundation. Its passing tests verified a thinner replacement contract and did not prove preservation of accepted behavior.

The owner’s real-iPhone test exposed the lost contracts:

1. navigation controls repeated full playing instructions;
2. ordinary unplayed strings were announced;
3. accepted duration speech was absent.

Do not continue feature repair or acceptance testing on `work/iphone-voiceover-tablature-audit`. Preserve that branch as evidence. All further convergence work begins from the accepted foundation on `work/convergence-from-accepted-semantic-core`.

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
10. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a procedure already recorded in the repository.

## Architectural state

Guitar Eyes is one application moving toward one musical engine with two interfaces:

1. Jason's desktop grid reader preserves spatial keyboard navigation and visible tablature rows.
2. The iPhone semantic reader presents the same music as synchronized, sequential positions for Safari and VoiceOver.
3. Supported guitar and bass ASCII inputs are parsed into one shared semantic document.
4. Jason's desktop rows are projected from that document without creating a second parser interpretation.
5. Legacy desktop parsing remains only as a compatibility fallback when semantic parsing is unsafe.

The semantic document is the authority for instrument identity, blocks, strings, positions, duration, and explicit measures. Playback, teaching, looping, pattern recognition, and later AI must consume this same model rather than create separate musical representations.

Desktop convergence must improve the desktop presentation from this accepted source. It must not replace the accepted semantic parser, rhythm model, measure model, import coordinator, iPhone reader, focus behavior, or speech contract.

## Accepted shared-core capabilities

Real-iPhone Safari and VoiceOver acceptance has passed for:

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

These are regression requirements, not optional redesign choices.

Human acceptance testing is performed only on the owner's iPhone. Desktop preservation is protected through automated contracts. A later desktop experience check may be performed by Jason or another desktop screen-reader user when a meaningful release candidate exists.

## Real-world format corpus

The repository contains project-authored, reproducible specimens for:

1. copied webpage-style ASCII text with metadata and multiple blocks;
2. W/H/Q/E/S rhythm lines;
3. technique-heavy ASCII notation;
4. metadata-rich four-string bass;
5. explicit two-measure ASCII rhythm tab;
6. minimal MusicXML guitar tablature.

The upload preflight recognizes:

1. ASCII text;
2. MusicXML and compressed MusicXML;
3. Guitar Pro;
4. PowerTab;
5. TuxGuitar;
6. TablEdit;
7. unknown material.

Only ASCII text is parsed today. Known structured formats receive accurate recognized-but-not-yet-supported messages instead of being misread as text.

Commercial or community tablature sites are not bulk-scraped or used as undocumented runtime dependencies. Future intake may accept user-provided downloaded files, pasted text, or page links for private normalization.

## Rhythm and measure model

The accepted shared semantic model stores:

1. duration symbols and normalized quarter-note units;
2. column-aligned or exact sequential rhythm mapping;
3. unmapped rhythm warnings when assignment would require guessing;
4. explicit measure numbers and counts;
5. position numbers and counts within each measure;
6. closing barline columns;
7. complete measure-duration totals when every playable position has a mapped duration.

Shared barlines are removed from semantic navigation but remain visible in Jason's desktop rows. Misaligned barlines do not generate invented measures.

## Accepted verification state

The measure checkpoint at `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e` passed:

1. the complete inherited automated test suite;
2. production build;
3. compiled-artifact checks;
4. GitHub Pages artifact upload and deployment;
5. direct inspection of the downloaded Pages artifact;
6. real-iPhone Safari and VoiceOver acceptance.

Verification workflow: `30192049347`.

Accepted preview identity:

`https://blindanatomist.github.io/guitar-eyes/?build=measure-recognition-checkpoint-1`

After publication, fork `main` was restored and independently confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

The stable Pages address was later overwritten by the invalidated convergence build. Do not use the current hosted page for further acceptance until a corrected recovery candidate is published.

## Current checkpoint verdict

Shared semantic core, real-world ASCII corpus foundation, rhythm duration checkpoint 1, and measure recognition checkpoint 1: passed.

Desktop-phone convergence: reopened from the accepted semantic foundation.

## Next bounded task

Reconstruct desktop-phone convergence on `work/convergence-from-accepted-semantic-core`:

1. preserve all accepted semantic, rhythm, measure, import, focus, and iPhone speech behavior;
2. preserve Jason's recognizable desktop spatial presentation;
3. ensure desktop output consumes the same accepted semantic document;
4. remove active interception of VoiceOver Control+Option commands;
5. reduce raw-character accessibility noise without deleting source fidelity;
6. retain accepted iPhone controls exactly;
7. inherit the complete accepted test suite and add convergence tests rather than replacing it;
8. verify exact source ancestry before publication;
9. publish one corrected preview only after all inherited and new tests pass;
10. require one bounded real-iPhone regression.

Jason's participation is deferred unless he agrees to test a mature desktop candidate. It is not a blocker to source reconstruction, automated verification, or the iPhone gate.

## Scope boundaries

This recovery does not authorize:

1. modification of `Phlypper/guitar-eyes`;
2. a pull request or merge;
3. replacement of Jason's desktop interaction design;
4. production publication;
5. playback, teacher mode, pattern analysis, bookmarks, or AI implementation;
6. paid services or bulk commercial-site scraping;
7. owner-operated desktop or laptop testing.

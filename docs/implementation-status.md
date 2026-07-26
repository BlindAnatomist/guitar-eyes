# Guitar Eyes Implementation Status

Last updated: July 26, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Current development branch: `work/real-world-tab-format-corpus`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Fork `main` is preserved as an exact upstream-tracking branch. Jason Washburn's repository remains untouched. No pull request has been opened and no development work has been merged into `main`.

## Required continuity reading

Before changing implementation, deployment, accessibility, testing, or repository administration, inspect:

1. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
2. `docs/solved-problems-and-reusable-procedures.md`;
3. `docs/shared-semantic-core-plan.md`;
4. `docs/shared-semantic-core-implementation.md`;
5. `docs/real-world-tab-format-corpus-checkpoint-1.md`;
6. `docs/rhythm-duration-checkpoint-1.md`;
7. `docs/measure-recognition-checkpoint-1.md`.

Do not rely on chat memory alone or rediscover a procedure already recorded in the repository.

## Architectural state

Guitar Eyes is now one application moving toward one musical engine with two interfaces:

1. Jason's desktop grid reader preserves spatial keyboard navigation and visible tablature rows.
2. The iPhone semantic reader presents the same music as synchronized, sequential positions for Safari and VoiceOver.
3. Supported guitar and bass ASCII inputs are parsed into one shared semantic document.
4. Jason's desktop rows are projected from that document without redesigning his interface.
5. Legacy desktop parsing remains only as a compatibility fallback when semantic parsing is unsafe.

The semantic document is the authority for instrument identity, blocks, strings, positions, duration, and explicit measures. Playback, teaching, looping, pattern recognition, and later AI must consume this same model rather than create separate musical representations.

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
12. block navigation for multi-block files;
13. W, H, Q, E, and S duration mapping and speech;
14. explicit measure recognition from aligned shared barlines;
15. measure and position-within-measure speech;
16. the accepted control order: Previous position, Read current position, Next position.

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

The shared semantic model now stores:

1. duration symbols and normalized quarter-note units;
2. column-aligned or exact sequential rhythm mapping;
3. unmapped rhythm warnings when assignment would require guessing;
4. explicit measure numbers and counts;
5. position numbers and counts within each measure;
6. closing barline columns;
7. complete measure-duration totals when every playable position has a mapped duration.

Shared barlines are removed from semantic navigation but remain visible in Jason's desktop rows. Misaligned barlines do not generate invented measures.

## Verification state

The latest measure checkpoint passed:

1. the complete inherited automated test suite;
2. production build;
3. compiled-artifact checks;
4. GitHub Pages artifact upload and deployment;
5. direct inspection of the downloaded Pages artifact;
6. real-iPhone Safari and VoiceOver acceptance.

Latest verified source checkpoint: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Latest verification workflow: `30192049347`

Preview:

`https://blindanatomist.github.io/guitar-eyes/?build=measure-recognition-checkpoint-1`

After publication, fork `main` was restored and independently confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Current checkpoint verdict

Shared semantic core, real-world ASCII corpus foundation, rhythm duration checkpoint 1, and measure recognition checkpoint 1: passed.

## Best next development step

Expand structural understanding without changing the accepted reader controls:

1. recognize section headings and preserve names such as Intro, Verse, Chorus, and Bridge on blocks and measures;
2. recognize time-signature metadata when explicitly present;
3. validate complete measure duration against an explicit time signature without inventing missing rhythm;
4. add measure-level navigation only after the semantic structure is trustworthy and a clear iPhone interaction contract is designed.

Structured MusicXML import is the strongest later route for exact measure, duration, tuning, string, and fret data. Guitar Pro and related binary formats should be evaluated through a browser-compatible importer such as alphaTab rather than implemented independently from scratch.

## Scope boundaries

This status does not authorize:

1. modification of `Phlypper/guitar-eyes`;
2. a pull request or merge;
3. replacement of Jason's desktop interaction design;
4. production publication;
5. paid services or bulk commercial-site scraping;
6. owner-operated desktop or laptop testing.
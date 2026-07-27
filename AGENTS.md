# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as a clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- The accepted iPhone, rhythm, measure, and shared-core foundation is `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
- The verified, hosted, and real-iPhone-accepted convergence source is `72159d25958fffd941c95351c6781cf579e1d622`.
- The verified ASCII intake expansion source is `08f8ab16135570d0e53b829daa5c153a15751a45`.
- The verified uncompressed MusicXML implementation source is `715547a123b2a6e862a8020858df96cb34c63526`.
- The hosted MusicXML preview source is `8fd5a5133269d6a277c5d9f9dd916aa5f8dd96d0`; later picker-repair commits preserve that importer while removing browser-level file filtering.
- Documentation-only commits after those sources do not replace their implementation identities.
- Preserve `work/convergence-from-accepted-semantic-core` as the accepted convergence record.
- Perform tablature-format expansion only on `work/tablature-intake-expansion` unless the owner explicitly authorizes another branch.
- Preserve `work/iphone-voiceover-tablature-audit` as evidence of the failed diverged convergence attempt. Do not continue feature repair there.
- Do not open a pull request or merge any work branch without the owner's explicit authorization.

## Required continuity reading

Before changing implementation, accessibility behavior, repository administration, GitHub Pages, workflows, importers, playback, teacher mode, or future AI work, read:

1. `docs/implementation-status.md`;
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
12. `docs/convergence-recovery-publication-result-2026-07-26.md`;
13. `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`;
14. `docs/tablature-intake-expansion-plan-2026-07-26.md`;
15. `docs/tablature-intake-expansion-checkpoint-1-audit.md`;
16. `docs/ascii-intake-expansion-checkpoint-1-result-2026-07-26.md`;
17. `docs/musicxml-intake-checkpoint-2-result-2026-07-26.md`;
18. `docs/musicxml-intake-checkpoint-2-publication-2026-07-26.md`;
19. `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`;
20. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a repository, deployment, accessibility, workflow, or format-import procedure that is already recorded.

## Accepted reader behavior is authoritative

Every importer and parser change must preserve:

- automatic supported guitar and bass detection;
- multiple complete tablature blocks;
- W, H, Q, E, and S duration mapping and speech;
- aligned explicit measure recognition;
- measure and position-within-measure speech;
- Previous position, Read current position, Next position in that order;
- quiet Previous and Next movement;
- quiet tablature-block movement;
- Read current position as the only action that announces full playing instructions in a semantic reader;
- omission of ordinary unplayed strings from speech;
- continued speech for open strings, frets, explicit mute notation, attached techniques, rests, chords, and supported duration;
- durable iPhone Files-picker focus recovery for success and failure;
- no browser-level `accept` restriction that prevents iPhone users from selecting a file before Guitar Eyes can validate it;
- Jason Washburn's recognizable desktop spatial concept and non-interception of VoiceOver Control+Option commands.

## Semantic architecture

The semantic tablature document is the authority for source format, instrument identity, blocks, strings, synchronized positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop and iPhone may present that document differently, but neither may create a second musical interpretation. Every supported importer must normalize into the same document rather than add format-specific musical logic to either reader.

A punctuation mark or technique character must not become a musical position merely because it occupies a source column. Frets, open strings, explicit muted notes, and structured timed rests may create positions. Deterministic techniques may attach to notes. Unsupported material must remain preserved and warned without manufacturing steps.

## Passed ASCII intake checkpoint

Exact source `08f8ab16135570d0e53b829daa5c153a15751a45` passed 18 suites, 101 tests, production build, and corrected compiled-fragment checks.

It adds octave-qualified ASCII labels, Unicode accidental normalization, safer tuning-order validation, custom-tuning preservation, deterministic technique attachment, false-position prevention, positive five- and seven-string non-support recognition, pipe-prose false-positive prevention, and honest upload outcomes.

## Accepted MusicXML checkpoint

Uncompressed six-string guitar MusicXML is now source-verified, hosted, and real-iPhone accepted.

Evidence includes:

- 19 of 19 suites and 115 of 115 tests for the importer implementation;
- picker repair verification at 20 of 20 suites and 117 of 117 tests;
- production builds and compiled checks;
- hosted read-back of the MusicXML bundle;
- removal of the browser-level file-extension filter;
- successful real-iPhone selection of `.musicxml` files;
- correct picker-return focus;
- correct low-E, A-string, and D-string mapping;
- correct quarter, eighth, and half-note speech;
- simultaneous chord speech at one position;
- timed-rest speech without a string instruction;
- quiet Previous and Next behavior;
- exact restoration of fork `main`.

The accepted scope remains deliberately narrow: uncompressed `score-partwise` MusicXML, one unambiguous six-string guitar tablature part, explicit tuning, explicit string and fret data, and single-voice sequential timing.

## Current authorized task: next structured-format evaluation

Proceed without John through a read-only evaluation and bounded implementation plan for the next format family.

Priority order:

1. evaluate Guitar Pro import through a browser-compatible, zero-dollar structured importer such as alphaTab;
2. determine which Guitar Pro versions are actually supported and whether the importer can expose tuning, measures, durations, notes, chords, rests, and techniques without using its renderer or playback engine;
3. determine whether PowerTab, TuxGuitar, and TablEdit can be imported directly or safely converted through the same path;
4. identify licensing, bundle-size, maintenance, security, and deterministic-testing implications;
5. design normalization into the existing semantic document;
6. stop before implementation if any required musical data would be guessed or if the dependency would force a second reader model.

Do not bring John into research, dependency evaluation, fixture design, source implementation, automated testing, or build work. Bring him in only after a stable hosted candidate requires real-iPhone judgment.

Do not begin:

- playback;
- teacher mode;
- looping;
- bookmarks;
- pattern analysis;
- AI implementation;
- commercial scraping;
- a pull request, merge, or upstream change.

## Zero-dollar automation

No paid GitHub usage is authorized. Do not weaken the account's $0 Actions hard stop, use a paid runner, or ask the owner to authorize overages.

Run available tests and builds before publication. Batch coherent verified changes. GitHub-hosted workflows are intentional checkpoints, not an exploratory debugging loop.

For a failed Actions run, inspect the failed job and logs before acting. Rerun only the failed or newly corrected gate when possible. Preserve successful evidence rather than repeating it.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone Safari and VoiceOver acceptance. Record the owner's exact observation without strengthening or rewriting it.
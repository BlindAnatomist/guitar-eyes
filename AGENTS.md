# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as a clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- The accepted iPhone, rhythm, measure, and shared-core foundation is `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
- The verified, hosted, and real-iPhone-accepted convergence source is `72159d25958fffd941c95351c6781cf579e1d622`.
- The verified ASCII intake expansion source is `08f8ab16135570d0e53b829daa5c153a15751a45`.
- The verified uncompressed MusicXML intake source is `715547a123b2a6e862a8020858df96cb34c63526`.
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
18. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

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
- Jason Washburn's recognizable desktop spatial concept and non-interception of VoiceOver Control+Option commands.

## Semantic architecture

The semantic tablature document is the authority for source format, instrument identity, blocks, strings, synchronized positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop and iPhone may present that document differently, but neither may create a second musical interpretation. Every supported importer must normalize into the same document rather than add format-specific musical logic to either reader.

A punctuation mark or technique character must not become a musical position merely because it occupies a source column. Frets, open strings, explicit muted notes, and structured timed rests may create positions. Deterministic techniques may attach to notes. Unsupported material must remain preserved and warned without manufacturing steps.

## Passed ASCII intake checkpoint

Exact source `08f8ab16135570d0e53b829daa5c153a15751a45` passed 18 suites, 101 tests, production build, and corrected compiled-fragment checks.

It adds octave-qualified ASCII labels, Unicode accidental normalization, safer tuning-order validation, custom-tuning preservation, deterministic technique attachment, false-position prevention, positive five- and seven-string non-support recognition, pipe-prose false-positive prevention, and honest upload outcomes.

## Passed MusicXML source checkpoint

Exact source `715547a123b2a6e862a8020858df96cb34c63526` passed:

- accepted ASCII ancestry;
- locked installation;
- 19 of 19 automated suites;
- 115 of 115 automated tests;
- production build;
- corrected compiled-fragment checks.

It imports uncompressed six-string guitar MusicXML with one unambiguous tablature part, explicit tuning, string and fret coordinates, single-voice sequential timing, chords, timed rests, measures, durations, open strings, frets, and supported technical notation into the shared semantic document.

It safely rejects malformed XML, custom entities, missing or ambiguous tablature parts, missing tuning, unsafe tuning order, backup/forward timing, multiple voices, grace notes, missing tab coordinates, out-of-range strings, and duplicate string assignments at one onset.

This source has not yet been published or accepted on the real iPhone.

## Current authorized task: publication and iPhone acceptance

The next task is limited to:

1. publishing exact source `715547a123b2a6e862a8020858df96cb34c63526` through the proven temporary-main procedure;
2. reading back the live HTML and primary bundle for MusicXML identity and reader contracts;
3. restoring fork `main` exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3`;
4. asking John for one bounded real-iPhone Safari and VoiceOver test using the project-authored MusicXML fixtures.

Do not begin:

- compressed `.mxl` support;
- Guitar Pro, PowerTab, TuxGuitar, or TablEdit implementation;
- playback;
- teacher mode;
- looping;
- bookmarks;
- pattern analysis;
- AI implementation;
- commercial scraping;
- a pull request, merge, or upstream change.

Recognizing a file extension is not reading the format. Do not claim hosted MusicXML support until the exact source is published, read back, and accepted through the bounded real-iPhone test.

## Zero-dollar automation

No paid GitHub usage is authorized. Do not weaken the account's $0 Actions hard stop, use a paid runner, or ask the owner to authorize overages.

Run available tests and builds before publication. Batch coherent verified changes. GitHub-hosted workflows are intentional checkpoints, not an exploratory debugging loop.

For a failed Actions run, inspect the failed job and logs before acting. Rerun only the failed or newly corrected gate when possible. Preserve successful evidence rather than repeating it.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone Safari and VoiceOver acceptance. Record the owner's exact observation without strengthening or rewriting it.

Do not bring John into source, fixture, automated, or build work. Bring him in only after a stable hosted candidate requires real-iPhone judgment.

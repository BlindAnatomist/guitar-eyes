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

Before changing implementation, accessibility behavior, repository administration, GitHub Pages, workflows, importers, dependencies, playback, teacher mode, or future AI work, read:

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
20. `docs/guitar-pro-structured-import-evaluation-2026-07-27.md`;
21. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a repository, deployment, accessibility, workflow, format-import, licensing, or dependency procedure that is already recorded.

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

A third-party parser may decode a source format, but its model must not escape the importer boundary. Guitar Eyes must convert the decoded data into a small serializable intermediate representation and then into the accepted semantic document. The third-party renderer, player, cursor, notation UI, fonts, soundfonts, audio workers, and playback model are outside scope.

## Passed ASCII intake checkpoint

Exact source `08f8ab16135570d0e53b829daa5c153a15751a45` passed 18 suites, 101 tests, production build, and corrected compiled-fragment checks.

It adds octave-qualified ASCII labels, Unicode accidental normalization, safer tuning-order validation, custom-tuning preservation, deterministic technique attachment, false-position prevention, positive five- and seven-string non-support recognition, pipe-prose false-positive prevention, and honest upload outcomes.

## Accepted MusicXML checkpoint

Uncompressed six-string guitar MusicXML is source-verified, hosted, and real-iPhone accepted.

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

## Evaluated Guitar Pro route

The July 27 evaluation authorizes `@coderline/alphatab` version `1.8.4` only as a lazy low-level decoder behind a strict Guitar Eyes adapter.

alphaTab may be used to decode project-authorized Guitar Pro bytes into its score model. Guitar Eyes must immediately extract only the required serializable musical data and discard that model.

Do not initialize or ship alphaTab rendering, playback, alphaSynth, cursors, notation fonts, soundfonts, audio worklets, or UI controls.

The advertised upstream importer range is Guitar Pro 3 through 8. Project-tested support must remain narrower than advertised support. A Guitar Pro version may not be described as supported until Guitar Eyes has an original, public-domain, or clearly licensed fixture and exact automated evidence for it.

PowerTab, TuxGuitar, TablEdit, compressed MusicXML, Guitar Pro 2, and unsupported string-count families remain outside the current checkpoint.

## Current authorized checkpoint: Guitar Pro 7 proof 3A

Implement one bounded Guitar Pro 7 dependency-and-normalization proof.

The proof may:

1. pin `@coderline/alphatab` exactly at `1.8.4`;
2. add an MPL-2.0 third-party notice and corresponding-source reference;
3. create one tiny original alphaTex score and export it through alphaTab into a project-authored CC0 `.gp` fixture;
4. load alphaTab only after Guitar Eyes identifies a Guitar Pro file;
5. decode in a dedicated Web Worker with timeout, cancellation, and termination;
6. transfer only a small serializable intermediate representation back to the application;
7. normalize exactly one unambiguous non-percussion four-string or six-string staff into the existing semantic document;
8. preserve source-order measures, exact durations, fretted notes, open strings, dead notes, chord onsets, timed rests, and a small deterministic technique set;
9. preserve repeats and unsupported effects as metadata or warnings without expanding playback order;
10. add exact byte, track, staff, bar, voice, beat, note, and timeout limits as tested constants;
11. add tests for corrupt archives, oversized input, unsupported string counts, multiple supported tracks, conflicting voices, missing fret/string data, and resource-limit failures;
12. verify that the initial application bundle does not eagerly contain alphaTab;
13. inspect the lazy worker chunk and reject any emitted font, soundfont, playback, renderer-worker, or audio-worklet assets;
14. preserve all inherited ASCII, MusicXML, desktop, iPhone, speech, and focus contracts;
15. stop before publication and real-iPhone testing.

The proof must reject rather than guess when:

- more than one supported candidate track exists;
- more than one active voice cannot be merged with identical onset and duration;
- a note lacks usable string or fret identity;
- timing cannot be represented exactly in quarter-note units;
- grace timing would require a new semantic timing model;
- the file exceeds resource limits;
- the instrument, string count, or source version is outside the project-tested boundary.

Do not silently select track zero, the first voice, the longest note, or the nearest string.

During checkpoint 3A, `.gp` means project-tested Guitar Pro 7 only. Continue to recognize `.gp3`, `.gp4`, `.gp5`, `.gpx`, GP8 `.gp`, `.gtp`, `.ptb`, `.pt2`, `.tg`, and `.tef` without claiming import support.

## Fixture and copyright policy

Do not copy arbitrary alphaTab test files into Guitar Eyes. At least one reviewed upstream GP5 fixture contains a transcription of a commercial song and is unsuitable regardless of the alphaTab source-code license.

The checkpoint fixture must be generated from original Guitar Eyes alphaTex, with both the source text and generated `.gp` file recorded as project-authored CC0 material.

## Zero-dollar automation

No paid GitHub usage is authorized. Do not weaken the account's $0 Actions hard stop, use a paid runner, or ask the owner to authorize overages.

Run available tests and builds before publication. Batch coherent verified changes. GitHub-hosted workflows are intentional checkpoints, not an exploratory debugging loop.

For a failed Actions run, inspect the failed job and logs before acting. Rerun only the failed or newly corrected gate when possible. Preserve successful evidence rather than repeating it.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone Safari and VoiceOver acceptance. Record the owner's exact observation without strengthening or rewriting it.

Do not bring John into dependency setup, fixture generation, source implementation, automated testing, build verification, or artifact inspection. Bring him in only after a stable hosted Guitar Pro candidate requires real-iPhone judgment.

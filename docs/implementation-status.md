# Guitar Eyes Implementation Status

Last reconciled: August 4, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted format-only operational branch: `work/accepted-format-intake-convergence`

Clean accepted 4C base: `030e1f6af2de23e41ad993ab0292893b072664eb`

Clean convergence application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Documentation-only closure commits do not replace the accepted application source.

Fork `main` remains reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Current state

Accepted Format-Intake Convergence 5B is passed and closed.

The clean convergence combines the accepted format-only reader, extended-string ASCII intake, MusicXML and compressed MXL intake, and the accepted real-world Guitar Pro 3 through 7 intake.

Automated and hosted evidence:

1. exact whitelist assembly;
2. preserved hashes for the five Guitar Pro binaries and generator patch;
3. 10 focused suites and 53 focused tests;
4. all 47 suites and all 302 tests;
5. production build;
6. lazy alphaTab bundle boundary;
7. format-only reader surface;
8. absence of soundfont, synth, audio-worklet, and Iowa sample assets;
9. exact hosted publication and live HTML/JavaScript read-back;
10. fork `main` restored and preserved exactly.

Real-device evidence:

On August 4, 2026, John Washburn tested all five accepted Guitar Pro fixtures on the clean convergence proof with iPhone Safari and VoiceOver. He traversed all six positions in each file and reported that the files read correctly, the application recognized and named the corresponding Guitar Pro versions while loading, and everything appeared to work correctly.

The exact convergence acceptance record is:

- `docs/accepted-format-intake-convergence-5b-real-iphone-acceptance-2026-08-04.md`.

## Governing architecture

Guitar Eyes is one musical system with one shared semantic tablature document:

1. iPhone presents semantic musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same semantic positions spatially.
3. Every supported importer normalizes into the same semantic document.
4. No reader, future teacher, player, or format may create a second musical interpretation.
5. Third-party decoder models remain behind importer adapters and do not become the application architecture.

The historical playback-timing and audible-output experiments remain evidence, not the active product baseline. The accepted convergence intentionally excludes procedural audio, Iowa samples, playback controls, and playback language.

## Accepted reader contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position in that relative order.
2. Quiet position and block movement.
3. Read current as the only action that announces full playing instructions.
4. Omission of ordinary unplayed strings.
5. Speech for open strings, frets, explicit muted notes, attached techniques, chords, rests, and supported duration.
6. Accepted duration and measure semantics.
7. Multiple tablature blocks.
8. Automatic supported guitar and bass detection.
9. Native iPhone Files-picker focus recovery on success and failure.
10. No browser-level upload filter that blocks selection before validation.
11. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.
12. Explicit inventory and selection for supported multi-track Guitar Pro input.
13. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
14. Safe rejection instead of guessed version, duration, tuning, track, or pitch.
15. No playback controls or playback language in the accepted format-only baseline.

## Current format support

### ASCII `.txt` and `.tab`

Accepted profiles:

1. six-string guitar within the accepted general profile;
2. seven-string guitar only in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1`;
3. eight-string guitar only in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1 F#1`;
4. four-string bass within the accepted general profile;
5. five-string bass only in exact standard octave-qualified tuning `G2 D2 A1 E1 B0`;
6. six-string bass only in exact standard octave-qualified tuning `C3 G2 D2 A1 E1 B0`.

Accepted ASCII semantics include multiple blocks, supported duration lines, aligned measures, tuning evidence, frets, open and muted notes, attached techniques, rests, chords where represented by aligned onsets, and false-positive prevention.

### MusicXML

Accepted routes:

1. uncompressed `.musicxml`;
2. uncompressed `.xml`;
3. compressed `.mxl`.

The MusicXML support remains bounded to the accepted tablature profile and evidence. It is not a claim of arbitrary orchestral MusicXML compatibility.

### Guitar Pro

Accepted lawful corpus and version routes:

1. Guitar Pro 3 `.gp3`;
2. Guitar Pro 4 `.gp4`;
3. Guitar Pro 5 `.gp5`;
4. Guitar Pro 6 `.gpx`;
5. Guitar Pro 7 shared `.gp`.

The route uses alphaTab `1.8.4` only as a lazy low-level decoder. Source-version evidence is normalized into one version-neutral intermediate and then into the shared semantic document.

Accepted behavior includes:

1. explicit version identification;
2. six-position semantic parity across all five fixtures;
3. supported guitar and bass normalization;
4. explicit inventory and selection for multi-track files;
5. no silent track selection;
6. archive and decoder structural cross-checks where available;
7. reuse of the accepted decoded intermediate after selection;
8. no renderer, notation font, soundfont, player, renderer worker, audio worklet, or alphaSynth machinery.

This support is verified for the project-authored five-file corpus and accepted profiles. It does not establish arbitrary compatibility with every file produced by every Guitar Pro release.

## Historical accepted checkpoints

The current convergence inherits the accepted results recorded for:

1. shared semantic-core convergence;
2. ASCII intake;
3. MusicXML intake;
4. compressed MusicXML intake;
5. Guitar Pro explicit-track selection and reading order;
6. ASCII extended-string intake;
7. real-world Guitar Pro 3 through 7 intake;
8. clean format-intake convergence.

Historical playback-timing, procedural-audio, and sampled-audio branches are not inherited into the active format-only application source.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary extended-string tunings without complete accepted evidence;
2. missing-octave inference for strict extended-string profiles;
3. arbitrary or malformed Guitar Pro files outside the accepted profiles;
4. PowerTab `.ptb` and `.pt2`;
5. TuxGuitar `.tg`;
6. TablEdit `.tef`;
7. other unexamined proprietary tablature formats;
8. full-document playback;
9. teacher mode;
10. practice scoring;
11. bookmarks;
12. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

Before implementing another format family:

1. create a new work branch from the final documentation-closure head of `work/accepted-format-intake-convergence`;
2. select one format family only;
3. establish lawful fixtures and provenance before implementation;
4. audit available decoders and licensing;
5. define a bounded semantic profile;
6. preserve all inherited reader, focus, and selection contracts;
7. require focused tests, the complete inherited suite, production build, artifact inspection, hosted proof, and real-iPhone acceptance;
8. close and document the checkpoint before beginning another format family.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by beginning format investigation.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without John.

John is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

# Guitar Eyes Implementation Status

Last reconciled: August 10, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted format-only operational branch: `work/powertab-pt2-v11-clean-convergence`

Accepted exact hosted and real-device source: `c2ada9bbdf118abddc894094734314f9b6048ea6`

Previous accepted format-only baseline: `work/accepted-format-intake-convergence` at `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`.

Documentation-only closure commits describe the accepted source; they do not silently broaden its runtime behavior.

Fork `main` remains reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Current state

PowerTab `.pt2` exact internal version 11 is passed and closed as a bounded accepted format profile.

The current operational convergence contains the previously accepted format-only reader, extended-string ASCII intake, MusicXML and compressed MXL intake, real-world Guitar Pro 3 through 7 intake, and the accepted PowerTab `.pt2` version-11 route.

### PowerTab automated and hosted evidence

The accepted PowerTab source passed:

1. exact source lineage and changed-file authority;
2. canonical Power Tab Editor 2.0.22 fixture identity and provenance;
3. exact editor-export binary and decompressed-audit hashes;
4. repaired build-identity tests;
5. all 53 test suites and all 328 tests;
6. optimized production build;
7. 26-file bundle inspection with zero forbidden editor, executable, `.pt2`, soundfont, or audio assets;
8. GitHub Pages publication;
9. live HTML and JavaScript read-back;
10. successful final commit status;
11. restoration of fork `main` to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

The exact hosted result is recorded in:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`.

### PowerTab real-device evidence

On August 10, 2026, John Washburn tested the canonical editor-exported `.pt2` file on a real iPhone in Safari with VoiceOver.

He reported that the file loaded successfully, VoiceOver focus stayed where it was supposed to after file selection, and all six semantic positions were reachable and read.

At the fourth position in the first measure, VoiceOver identified the open D string and palm muting, then appended the generic phrase that the notation was "not yet interpreted." Repository inspection confirmed that the PowerTab `PalmMuting` property had been decoded correctly and that the extra wording comes from the shared position-description layer. It is therefore recorded as shared-reader wording debt rather than a PowerTab importer failure.

The owner reported that he tested the remaining bounded behaviors and did not report another failure.

The exact real-device record is:

- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

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
8. Automatic supported guitar and bass detection where the accepted profile provides sufficient evidence.
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

Accepted behavior includes explicit version identification, six-position semantic parity across all five fixtures, supported guitar and bass normalization, explicit inventory and selection for multi-track files, no silent track selection, reuse of the accepted decoded intermediate after selection, and exclusion of renderer and playback machinery.

This support is verified for the project-authored five-file corpus and accepted profiles. It does not establish arbitrary compatibility with every file produced by every Guitar Pro release.

### PowerTab `.pt2`

Accepted route:

1. exact internal version 11 `.pt2` within the bounded accepted profile.

Evidence includes a project-authored six-position guitar score saved through Power Tab Editor 2.0.22, exact binary and decompressed hashes, parser parity, complete-suite regression proof, optimized build and asset inspection, hosted publication with live read-back, and real-iPhone Safari and VoiceOver acceptance.

Accepted demonstrated semantics include standard six-string guitar tuning, quarter/eighth/half durations, open strings, fretted notes, palm mute identification, a timed rest, and a two-note chord.

This support is intentionally narrow. It does not establish legacy `.ptb`, older `.pt2` internal versions, arbitrary PowerTab compatibility, or untested bass, alternate-tuning, and notation profiles.

## Known shared-reader wording debt

Attached technique objects are currently spoken with the generic suffix `notation preserved but not yet interpreted`. The PowerTab iPhone acceptance demonstrated that this wording can be semantically stale: `PalmMuting` is already decoded to `palm mute` and attached to the correct note before the shared speech layer appends the generic suffix.

Do not patch this in a PowerTab-specific importer. Any future wording repair belongs in the shared semantic speech layer and must preserve technique attachment across every format.

## Historical accepted checkpoints

The current convergence inherits accepted results for:

1. shared semantic-core convergence;
2. ASCII intake;
3. MusicXML intake;
4. compressed MusicXML intake;
5. Guitar Pro explicit-track selection and reading order;
6. ASCII extended-string intake;
7. real-world Guitar Pro 3 through 7 intake;
8. clean format-intake convergence;
9. PowerTab `.pt2` internal-version-11 clean convergence and real-iPhone acceptance.

Historical playback-timing, procedural-audio, and sampled-audio branches are not inherited into the active format-only product boundary.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary extended-string tunings without complete accepted evidence;
2. missing-octave inference for strict extended-string profiles;
3. arbitrary or malformed Guitar Pro files outside the accepted profiles;
4. legacy PowerTab `.ptb`;
5. older PowerTab `.pt2` internal versions;
6. arbitrary PowerTab bass, alternate-tuning, or notation profiles outside accepted evidence;
7. TuxGuitar `.tg`;
8. TablEdit `.tef`;
9. other unexamined proprietary tablature formats;
10. full-document playback;
11. teacher mode;
12. practice scoring;
13. bookmarks;
14. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

The next format investigation should evaluate legacy PowerTab `.ptb` as a separate format family.

Before implementation:

1. create a new isolated work branch from the final documentation-closure head of `work/powertab-pt2-v11-clean-convergence`;
2. perform read-only source, decoder, licensing, and fixture-provenance research first;
3. determine whether `.ptb` has multiple materially different versions or signatures before choosing a support claim;
4. acquire or create lawful representative fixtures before implementation;
5. define one bounded semantic profile rather than claiming arbitrary compatibility;
6. normalize into the existing shared semantic document;
7. preserve all inherited reader, focus, selection, and safe-rejection contracts;
8. keep hosted Actions out of exploratory diagnosis and use them only for an intentional acceptance checkpoint after source gates pass;
9. close and document the `.ptb` checkpoint before considering older `.pt2` versions or broader PowerTab profiles.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by beginning `.ptb` investigation.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without John.

John is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

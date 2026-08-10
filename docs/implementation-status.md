# Guitar Eyes Implementation Status

Last reconciled: August 10, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Current accepted format-only operational branch: `work/powertab-legacy-ptb-intake-evaluation`

Accepted exact hosted and real-device source for the latest PowerTab checkpoint: `937cf3892d279e54f98802f1eb649333f4b1935c`

Previous accepted PowerTab `.pt2` source: `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.

Previous accepted format-only baseline: `work/accepted-format-intake-convergence` at `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`.

Documentation-only closure commits may advance the work branch after the exact runtime source. They do not silently broaden runtime behavior.

Fork `main` remains reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Current state

Guitar Eyes now has two separately accepted bounded PowerTab routes:

1. `.pt2` exact internal version 11;
2. legacy `.ptb` file version `4`, PowerTab 1.7, within the first bounded legacy profile.

The current operational convergence also retains the previously accepted ASCII, MusicXML/MXL, and Guitar Pro 3 through 7 routes.

The active architecture remains format-only. Historical playback-timing, procedural-audio, sampled-audio, and teacher-mode experiments are evidence, not the current product baseline.

## Governing architecture

Guitar Eyes is one musical system with one shared semantic tablature document:

1. iPhone presents semantic musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same semantic positions spatially.
3. Every supported importer normalizes into the same semantic document.
4. No reader, future teacher, player, or format may create a second musical interpretation.
5. Third-party decoder models remain behind importer adapters and do not become the application architecture.

## Accepted reader contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position in that relative order.
2. Quiet position and block movement.
3. Read current as the only action that announces full playing instructions.
4. Omission of ordinary unplayed strings.
5. Speech for open strings, frets, explicit muted notes, attached techniques, chords, rests, and supported duration.
6. Accepted duration and measure semantics.
7. Multiple tablature blocks where the accepted profile permits them.
8. Automatic supported guitar and bass detection where sufficient evidence exists.
9. Native iPhone Files-picker focus recovery on success and failure.
10. No browser-level upload filter that blocks selection before validation.
11. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.
12. Explicit inventory and selection for supported multi-track Guitar Pro input.
13. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
14. Safe rejection instead of guessed version, duration, tuning, track, pitch, or unsupported structure.
15. No playback controls or playback language in the accepted format-only baseline.

## Current format support

### ASCII `.txt` and `.tab`

Accepted profiles include:

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

MusicXML support remains bounded to the accepted tablature profile and evidence. It is not a claim of arbitrary orchestral MusicXML compatibility.

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

Evidence includes a project-authored six-position guitar score saved through Power Tab Editor 2.0.22, exact binary and decompressed hashes, parser parity, all 53 inherited test suites and 328 tests, optimized build and asset inspection, hosted publication with live read-back, and real-iPhone Safari/VoiceOver acceptance.

Accepted demonstrated semantics include standard six-string guitar tuning, quarter/eighth/half durations, open strings, fretted notes, palm mute identification, a timed rest, and a two-note chord.

This support does not establish older `.pt2` internal versions, arbitrary PowerTab compatibility, or untested bass, alternate-tuning, and notation profiles.

Closure records:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

### Legacy PowerTab `.ptb`

Accepted route:

1. file version `4`, PowerTab 1.7, signature `ptab-4`, within the first bounded legacy browser profile.

Canonical fixture:

- `fixtures/powertab-ptb-v17/powertab-v17-original-six-position.ptb`;
- 723 bytes;
- SHA-256 `9cd2e677b8898900822afad4160acc004b5bbea70a57f0b62f412e5a52ce2216`.

The source evidence was validated against both the pinned Power Tab Editor 2.0.22 legacy deserialization order and the exact TuxGuitar `ptab-4` parser source.

The Guitar Eyes browser implementation then passed:

1. complete automated repository verification: 57 test suites, 343 tests;
2. optimized production build;
3. bounded production-artifact inspection;
4. GitHub Pages publication;
5. live network read-back;
6. real-iPhone Safari/VoiceOver acceptance.

The owner confirmed successful loading, PowerTab 1.7 identification, focus recovery, all six positions, the measure transition, half-note rest, final two-note chord, and Previous/Next navigation.

Accepted legacy profile is intentionally limited to:

- song files;
- guitar-only content;
- one standard-tuned six-string guitar player;
- one staff;
- one active voice;
- simple complete 4/4 measures;
- quarter, eighth, and half-note durations demonstrated by the canonical fixture;
- open and fretted notes;
- rests;
- simple simultaneous-note chords;
- the exact bounded MFC structures implemented by the accepted decoder.

Historical `.ptb` file-version values `1`, `2`, and `3`, bass scores, alternate tunings, multiple players, multiple active voices, techniques, capo, repeats, key changes, non-4/4 meters, and other unproven structures remain unsupported and must fail explicitly.

Acceptance record:

- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

## Known shared-reader wording debt

Attached technique objects are currently spoken with the generic suffix `notation preserved but not yet interpreted`. The PowerTab `.pt2` iPhone acceptance demonstrated that this wording can be semantically stale: `PalmMuting` is already decoded to `palm mute` and attached to the correct note before the shared speech layer appends the generic suffix.

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
9. PowerTab `.pt2` internal-version-11 clean convergence and real-iPhone acceptance;
10. PowerTab legacy `.ptb` file-version-4 / PowerTab-1.7 bounded browser and real-iPhone acceptance.

Historical playback-timing, procedural-audio, and sampled-audio branches are not inherited into the active format-only product boundary.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary extended-string tunings without complete accepted evidence;
2. missing-octave inference for strict extended-string profiles;
3. arbitrary or malformed Guitar Pro files outside the accepted profiles;
4. historical PowerTab `.ptb` file-version values `1`, `2`, and `3`;
5. arbitrary PowerTab 1.7 `.ptb` structures outside the accepted first legacy profile;
6. older PowerTab `.pt2` internal versions;
7. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, or notation profiles outside accepted evidence;
8. TuxGuitar `.tg`;
9. TablEdit `.tef`;
10. other unexamined proprietary tablature formats;
11. full-document playback;
12. teacher mode;
13. practice scoring;
14. bookmarks;
15. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

The next PowerTab investigation should evaluate historical legacy `.ptb` versions as a separate family rather than broadening PowerTab 1.7 by inference.

The preserved reader evidence distinguishes legacy file-version values `1`, `2`, `3`, and `4`; only value `4` is now accepted.

Before implementing another historical `.ptb` version:

1. begin from the final documentation-closure head of `work/powertab-legacy-ptb-intake-evaluation` on a new isolated branch;
2. perform read-only decoder, serialization, licensing, and fixture-provenance research first;
3. determine the exact historical version mapping and materially different structures before choosing a support claim;
4. acquire or create lawful representative fixtures before implementation;
5. define one bounded semantic profile per proven historical family;
6. normalize into the existing shared semantic document;
7. preserve all inherited reader, focus, selection, and safe-rejection contracts;
8. keep hosted Actions out of exploratory diagnosis and use them only for an intentional acceptance checkpoint after source gates pass;
9. close and document each historical `.ptb` checkpoint before moving to the next version or older `.pt2` internal versions.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by beginning another PowerTab investigation.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without John.

John is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

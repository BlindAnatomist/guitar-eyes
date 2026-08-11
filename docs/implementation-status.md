# Guitar Eyes Implementation Status

Last reconciled: August 11, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Current accepted format-only operational branch: `work/powertab-pt2-v1-v10-investigation`

Accepted exact hosted and real-device source for the latest PowerTab checkpoint: `930d00831cb71b4fad6f4771f3009be8cb28670e`

Previous accepted historical PowerTab 1.0 / 1.0.2 / 1.5 `.ptb` source: `2682928366f587d5afac213e8e195ba0dfb602d8`.

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c`.

Previous accepted PowerTab `.pt2` internal-version-11 source: `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.

Fork `main` remains reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Current product state

Guitar Eyes remains a format-only semantic tablature reader with one shared musical interpretation.

Accepted format routes now include:

1. ASCII `.txt` and `.tab` within the accepted guitar, bass, and exact extended-string profiles;
2. MusicXML `.musicxml` and `.xml` within the accepted tablature profile;
3. compressed MusicXML `.mxl`;
4. Guitar Pro 3 `.gp3`;
5. Guitar Pro 4 `.gp4`;
6. Guitar Pro 5 `.gp5`;
7. Guitar Pro 6 `.gpx`;
8. Guitar Pro 7 shared `.gp` archives within the accepted version-neutral boundary;
9. PowerTab `.pt2` internal versions 1 through 11 within accepted bounded, version-evidenced profiles;
10. legacy PowerTab `.ptb` file version 1 / PowerTab 1.0 within its accepted bounded profile;
11. legacy PowerTab `.ptb` file version 2 / PowerTab 1.0.2 within its accepted bounded profile;
12. legacy PowerTab `.ptb` file version 3 / PowerTab 1.5 within its accepted bounded profile;
13. legacy PowerTab `.ptb` file version 4 / PowerTab 1.7 within its accepted bounded profile.

Historical playback-timing, procedural-audio, sampled-audio, teacher-mode, practice-scoring, bookmark, and AI experiments remain outside the accepted product baseline.

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

## PowerTab `.pt2`

Accepted route: internal versions 1 through 11, each bounded by exact version evidence rather than inferred arbitrary compatibility.

### Internal versions 1 through 10

The historical `.pt2` lineage was investigated against pinned Power Tab Editor 2.0.22 source at commit `13cab27c7127d301f2747671071e53eb203dc940`.

The implementation uses one historical compatibility/canonicalization layer rather than ten unrelated decoders. The important representation boundary is internal version 10:

- versions 1 through 9 use historical integer enums and bitset property strings;
- version 10 uses named enums and named flag arrays;
- exact field-presence gates preserve the producer's schema milestones;
- unsupported structures continue to fail explicitly rather than silently widen the accepted profile.

Project-authored deterministic six-position fixtures for versions 1 through 10 are stored under `fixtures/powertab-pt2-historical/`. Their exact byte counts and hashes are governed by `manifest.json`.

Producer-maintained upstream binaries for versions 2, 3, 4, and 6 remain independent external compatibility anchors and are not relabeled as project fixtures.

The accepted historical implementation passed:

1. deterministic fixture generation and regeneration;
2. manifest and embedded-version verification;
3. focused PowerTab tests;
4. the complete inherited automated regression suite;
5. optimized production build;
6. artifact-boundary inspection;
7. GitHub Pages publication;
8. complete live JavaScript asset read-back including lazy-loaded chunks;
9. real-iPhone Safari/VoiceOver acceptance.

The owner tested all ten historical fixtures and reported: “OK, I tested all 10 of those and they all loaded properly and were recognized and voiceover. Focus worked fine. It was good.”

Acceptance records:

- `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`.

### Internal version 11

Internal version 11 remains accepted through the separately proven canonical Power Tab Editor 2.0.22 export, exact fixture hashes, parser parity, complete inherited suite, optimized build, artifact inspection, hosted Pages publication, live read-back, and real-iPhone Safari/VoiceOver acceptance.

Version-11 records:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

### `.pt2` scope boundary

Accepted internal-version coverage does not establish arbitrary compatibility with every `.pt2` file. Unless separately proven, unsupported profiles include:

- bass scores outside accepted evidence;
- alternate tunings outside accepted evidence;
- multiple players;
- multiple active voices;
- broader techniques and notation structures;
- capo;
- repeats;
- key changes;
- meter changes;
- broader chord-diagram semantics and other unproven structures.

Unsupported structures must fail explicitly rather than be guessed.

## Legacy PowerTab `.ptb`

Accepted historical mapping:

- file version `1` = PowerTab 1.0;
- file version `2` = PowerTab 1.0.2;
- file version `3` = PowerTab 1.5;
- file version `4` = PowerTab 1.7.

### PowerTab 1.0, 1.0.2, and 1.5

Canonical fixtures are stored under `fixtures/powertab-ptb-historical/`.

The implementation passed the complete inherited suite, production build, bounded artifact inspection, Pages publication, live read-back across every deployed JavaScript chunk, and real-iPhone Safari/VoiceOver acceptance.

Acceptance record:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`.

### PowerTab 1.7

PowerTab 1.7 file version 4 remains accepted within the previously proven bounded profile. Its evidence includes deterministic project-authored fixture generation, source-faithful Power Tab Editor validation, exact TuxGuitar `ptab-4` parser execution, automated regression, production build, hosted publication, live read-back, and real-iPhone Safari/VoiceOver acceptance.

Acceptance record:

- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

### Legacy `.ptb` scope boundary

Legacy `.ptb` support is not a claim of arbitrary compatibility. Unless separately proven, the following remain unsupported across historical versions:

- bass scores;
- alternate tunings outside accepted evidence;
- multiple players;
- multiple active voices;
- techniques beyond demonstrated accepted profiles;
- capo;
- repeats;
- key changes;
- non-4/4 meters;
- other historical MFC structures outside the bounded decoders.

Unsupported structures must fail explicitly rather than be guessed.

## Known shared-reader wording debt

Attached technique objects can still be spoken with the generic suffix `notation preserved but not yet interpreted`. The accepted PowerTab `.pt2` version-11 iPhone test demonstrated that this can be semantically stale when a technique such as palm mute is already identified.

Do not patch this in a PowerTab-specific importer. Any future wording repair belongs in the shared semantic speech layer and must preserve technique attachment across every format.

## Hosted publication lesson

A successful Pages deployment can still be followed by a false live-read-back failure if verification inspects only JavaScript files directly referenced by `index.html`. Historical PowerTab signatures lived in a lazy-loaded chunk.

Future hosted read-back must inspect every deployed JavaScript asset named by the artifact manifest or equivalent complete asset inventory, not only initial script tags.

Each acceptance build must also carry a unique static title and first heading so stable Pages URLs cannot make a real-device tester unknowingly validate an older checkpoint.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary or malformed Guitar Pro files outside accepted profiles;
2. arbitrary PowerTab `.pt2` or `.ptb` files outside accepted version-specific profiles;
3. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, chord-diagram, or notation profiles outside accepted evidence;
4. TuxGuitar `.tg`;
5. TablEdit `.tef`;
6. other unexamined proprietary tablature formats;
7. full-document playback;
8. teacher mode;
9. practice scoring;
10. bookmarks;
11. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

PowerTab `.pt2` internal versions 1 through 11 and all four known legacy `.ptb` file-version families now have bounded accepted browser and real-iPhone coverage.

The next format family has not yet been selected. A new-format phase must:

1. begin from the final documentation-closure head of `work/powertab-pt2-v1-v10-investigation` on a new isolated branch;
2. perform read-only format/version, decoder, licensing, and fixture-provenance research first;
3. acquire or create lawful representative fixtures before implementation;
4. normalize into the existing shared semantic document;
5. preserve all inherited reader, focus, selection, and safe-rejection contracts;
6. keep hosted Actions out of exploratory diagnosis and use them only for intentional acceptance checkpoints after source gates pass;
7. require bounded real-iPhone VoiceOver acceptance before support is claimed.

TuxGuitar `.tg` and TablEdit `.tef` remain deferred candidates until a separate prioritization decision selects the next family.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by beginning another format investigation.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without John.

John is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

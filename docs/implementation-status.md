# Guitar Eyes Implementation Status

Last reconciled: August 11, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Current accepted format-only operational branch: `work/tuxguitar-tg-intake-investigation`

Accepted corrected TuxGuitar semantic source: `b3a8d229aee832a7f6ea994dfc7465ff07d608c3`

Accepted corrected TuxGuitar hosted candidate source: `dee0ba8d63d22c47b6570778acf8dad7ed003942`

Previous accepted historical PowerTab `.pt2` internal versions 1 through 10 source: `930d00831cb71b4fad6f4771f3009be8cb28670e`

Previous accepted PowerTab `.pt2` internal-version-11 source: `c2ada9bbdf118abddc894094734314f9b6048ea6`

Previous accepted historical PowerTab 1.0 / 1.0.2 / 1.5 `.ptb` source: `2682928366f587d5afac213e8e195ba0dfb602d8`

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c`

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
10. legacy PowerTab `.ptb` file version 1 / PowerTab 1.0;
11. legacy PowerTab `.ptb` file version 2 / PowerTab 1.0.2;
12. legacy PowerTab `.ptb` file version 3 / PowerTab 1.5;
13. legacy PowerTab `.ptb` file version 4 / PowerTab 1.7;
14. TuxGuitar `.tg` native 1.0;
15. TuxGuitar `.tg` native 1.1;
16. TuxGuitar `.tg` native 1.2;
17. TuxGuitar `.tg` native 1.3;
18. TuxGuitar `.tg` native 1.5;
19. modern TuxGuitar native file format 2.0.0 validated against TuxGuitar 2.1.0 producer authority.

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
12. Explicit inventory and selection for supported multi-track structured input where the profile proves it.
13. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
14. Safe rejection instead of guessed version, duration, tuning, track, pitch, or unsupported structure.
15. No playback controls or playback language in the accepted format-only baseline.

## TuxGuitar `.tg`

Accepted bounded native routes:

- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5;
- modern native file format 2.0.0.

Producer authority for the current checkpoint:

- upstream repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- modern native file-format version: `2.0.0`.

The modern 2.0 route uses the exact two-entry ZIP container boundary `version.txt` plus `content.xml`, separates native file-format evidence from application-version metadata, and validates TuxGuitar precise-time coordinates before normalization.

The legacy routes use source-derived historical serializers and explicit internal version signatures. No native 1.4 route is inferred.

The accepted TuxGuitar checkpoint passed:

1. deterministic project-authored fixture verification and fixed-point regeneration;
2. source/version and container validation;
3. 47 focused TuxGuitar/shared-routing tests;
4. all 402 inherited repository tests;
5. optimized production build;
6. artifact-boundary inspection;
7. corrected GitHub Pages publication;
8. complete deployed JavaScript asset read-back;
9. bounded real-iPhone Safari/VoiceOver acceptance.

The owner first tested the six-generation corpus and reported that all six files loaded, were identified correctly, and VoiceOver focus and reading worked correctly. A later producer-source audit materially corrected modern 2.0, so the corrected 2.0 route was separately retested; the owner reported: “OK, all of that worked. It was all good.”

Acceptance records:

- `docs/tuxguitar-tg-intake-investigation-2026-08-11.md`;
- `docs/tuxguitar-tg-producer-source-correction-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-source-gate-result-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-hosted-proof-2026-08-11.md`;
- `docs/tuxguitar-tg-real-iphone-acceptance-2026-08-11.md`.

### TuxGuitar scope boundary

Accepted TuxGuitar coverage does not establish arbitrary compatibility with every `.tg` file. Unless separately proven, unsupported profiles include:

- native `.tg` 0.7, 0.8, and 0.9;
- arbitrary bass scores;
- alternate tunings outside accepted evidence;
- arbitrary multi-track and multi-voice structures;
- broader effects, lyrics, automation, notation, repeats, tempo structures, and other unproven TuxGuitar features.

Unsupported structures must fail explicitly rather than be guessed.

## PowerTab `.pt2`

Accepted route: internal versions 1 through 11, each bounded by exact version evidence rather than inferred arbitrary compatibility.

Internal versions 1 through 10 use one historical compatibility/canonicalization layer proven against pinned Power Tab Editor 2.0.22 source at commit `13cab27c7127d301f2747671071e53eb203dc940`.

Internal version 11 remains accepted through its separately proven canonical Power Tab Editor 2.0.22 export and real-iPhone checkpoint.

PowerTab acceptance records remain:

- `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`;
- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

## Legacy PowerTab `.ptb`

Accepted historical mapping:

- file version `1` = PowerTab 1.0;
- file version `2` = PowerTab 1.0.2;
- file version `3` = PowerTab 1.5;
- file version `4` = PowerTab 1.7.

Historical acceptance records:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`;
- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

## Known shared-reader wording debt

Attached technique objects can still be spoken with the generic suffix `notation preserved but not yet interpreted`. This is shared wording debt, not a format-specific defect. Any future wording repair belongs in the shared semantic speech layer and must preserve technique attachment across every accepted format.

## Hosted publication lesson

A successful Pages deployment can still be followed by a false live-read-back failure if verification inspects only JavaScript files directly referenced by `index.html`.

Future hosted read-back must inspect every deployed JavaScript asset named by the artifact manifest or equivalent complete asset inventory, not only initial script tags.

Each acceptance build must also carry a unique static title and first heading so stable Pages URLs cannot make a real-device tester unknowingly validate an older checkpoint.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary or malformed Guitar Pro files outside accepted profiles;
2. arbitrary PowerTab `.pt2` or `.ptb` files outside accepted version-specific profiles;
3. arbitrary TuxGuitar `.tg` files outside the accepted version-specific and semantic profiles;
4. TuxGuitar native 0.7, 0.8, and 0.9;
5. TablEdit `.tef`;
6. other unexamined proprietary tablature formats;
7. full-document playback;
8. teacher mode;
9. practice scoring;
10. bookmarks;
11. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

TuxGuitar `.tg` 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0 now have bounded accepted browser and real-iPhone coverage.

The next new-format investigation must:

1. begin from the final documentation-closure head of `work/tuxguitar-tg-intake-investigation` on a new isolated branch;
2. perform read-only format/version, decoder, licensing, and fixture-provenance research first;
3. acquire or create lawful representative fixtures before implementation;
4. normalize into the existing shared semantic document;
5. preserve all inherited reader, focus, selection, and safe-rejection contracts;
6. keep hosted Actions out of exploratory diagnosis and use them only for intentional acceptance checkpoints after source gates pass;
7. require bounded real-iPhone VoiceOver acceptance before support is claimed.

TablEdit `.tef` is now the next major dedicated-tab candidate. It remains unsupported until separately selected and investigated.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by beginning another format investigation.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without owner intervention.

The owner is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

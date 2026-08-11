# TuxGuitar Format-Intake Authority

Date: 2026-08-11

Current accepted operational branch: `work/tuxguitar-tg-intake-investigation`

Accepted corrected TuxGuitar semantic source: `b3a8d229aee832a7f6ea994dfc7465ff07d608c3`.

Accepted corrected hosted candidate source: `dee0ba8d63d22c47b6570778acf8dad7ed003942`.

Accepted corrected source-gate run: `31537402146`.

Accepted corrected hosted publication run: `31537714794`.

Previous accepted historical PowerTab `.pt2` internal versions 1 through 10 source: `930d00831cb71b4fad6f4771f3009be8cb28670e` on `work/powertab-pt2-v1-v10-investigation`.

Previous accepted historical PowerTab 1.0 / 1.0.2 / 1.5 `.ptb` source: `2682928366f587d5afac213e8e195ba0dfb602d8` on `work/powertab-legacy-ptb-v1-v3-intake`.

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c` on `work/powertab-legacy-ptb-intake-evaluation`.

Previous accepted PowerTab `.pt2` internal-version-11 source: `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.

Previous accepted format-only convergence baseline: `work/accepted-format-intake-convergence` at `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`.

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Fork `main` remains an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized by this record.

## Accepted format convergence

The current accepted operational branch contains the previously accepted format-only reader plus bounded TuxGuitar native routes.

Accepted families and routes are:

1. ASCII `.txt` and `.tab` within the accepted guitar, bass, and exact extended-string profiles;
2. uncompressed MusicXML `.musicxml` and `.xml` within the accepted tablature profile;
3. compressed MusicXML `.mxl`;
4. Guitar Pro 3 `.gp3`;
5. Guitar Pro 4 `.gp4`;
6. Guitar Pro 5 `.gp5`;
7. Guitar Pro 6 `.gpx`;
8. Guitar Pro 7 shared `.gp`;
9. PowerTab `.pt2` internal versions 1 through 11 within their accepted bounded profiles;
10. legacy PowerTab `.ptb` file version 1 / PowerTab 1.0;
11. legacy PowerTab `.ptb` file version 2 / PowerTab 1.0.2;
12. legacy PowerTab `.ptb` file version 3 / PowerTab 1.5;
13. legacy PowerTab `.ptb` file version 4 / PowerTab 1.7;
14. TuxGuitar `.tg` native 1.0;
15. TuxGuitar `.tg` native 1.1;
16. TuxGuitar `.tg` native 1.2;
17. TuxGuitar `.tg` native 1.3;
18. TuxGuitar `.tg` native 1.5;
19. modern TuxGuitar native file format 2.0.0 as validated against current TuxGuitar 2.1.0 producer authority.

## Accepted TuxGuitar `.tg` profile

Producer authority:

- upstream repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- modern native file-format version: `2.0.0`.

The accepted first checkpoint covers native `.tg` 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0 within one bounded shared-semantic reader profile.

The evidence includes:

- exact producer-source investigation and version mapping;
- deterministic project-authored source-derived fixtures with hashes;
- corrected modern 2.0 application-version and precise-time interpretation;
- source/version detection that does not infer unsupported versions;
- normalization into the existing shared semantic tablature document;
- focused TuxGuitar and shared-routing tests;
- all 402 inherited repository tests;
- optimized production build and artifact-boundary inspection;
- corrected GitHub Pages publication and complete JavaScript asset read-back;
- bounded real-iPhone Safari and VoiceOver acceptance.

The owner first tested the six-generation corpus and reported that all six files loaded, were identified correctly, and VoiceOver focus and reading worked correctly. After the producer-source correction materially changed the modern 2.0 route, the owner retested corrected 2.0 and reported: “OK, all of that worked. It was all good.”

Acceptance records:

- `docs/tuxguitar-tg-intake-investigation-2026-08-11.md`;
- `docs/tuxguitar-tg-producer-source-correction-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-source-gate-result-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-hosted-proof-2026-08-11.md`;
- `docs/tuxguitar-tg-real-iphone-acceptance-2026-08-11.md`.

There is no inferred native 1.4 route. Native 0.7, 0.8, and 0.9 remain deferred archival work.

## Accepted PowerTab `.pt2` profiles

Internal versions 1 through 10 remain accepted through one bounded historical compatibility layer proven against pinned Power Tab Editor 2.0.22 source lineage. Internal version 11 remains accepted through its separately proven canonical Power Tab Editor 2.0.22 export and real-iPhone checkpoint.

Together the PowerTab records establish bounded accepted `.pt2` coverage for internal versions 1 through 11. They do not establish arbitrary compatibility with every `.pt2` file.

PowerTab acceptance records remain:

- `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`;
- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

## Accepted legacy PowerTab `.ptb` profiles

Legacy `.ptb` file-version mapping remains accepted as:

- `1` = PowerTab 1.0;
- `2` = PowerTab 1.0.2;
- `3` = PowerTab 1.5;
- `4` = PowerTab 1.7.

Historical acceptance records:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`;
- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

## Scope boundary

This authority does not claim support for:

1. arbitrary `.tg` files outside the accepted TuxGuitar version-specific and semantic profile;
2. TuxGuitar native 0.7, 0.8, or 0.9;
3. arbitrary TuxGuitar bass, alternate-tuning, multi-track, multi-voice, effect, lyric, automation, notation, repeat, or other unproven profiles;
4. arbitrary `.ptb` or `.pt2` files outside the accepted PowerTab version-specific profiles;
5. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, chord-diagram, or other unproven profiles;
6. TablEdit `.tef`;
7. playback, teacher mode, scoring, bookmarks, or AI instruction.

Recognition must never be described as reading support. Unsupported structures must fail explicitly rather than be guessed.

The shared-reader phrase `notation preserved but not yet interpreted` remains known wording debt for attached techniques and must not be patched format-specifically.

## Future branch rule

The next new-format investigation must begin from the final documentation-closure head of `work/tuxguitar-tg-intake-investigation` on a new isolated work branch.

TuxGuitar `.tg` 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0 now have bounded accepted browser and real-iPhone coverage. Any broader TuxGuitar profile or the deferred 0.7–0.9 generations require a separate evidence checkpoint rather than inference.

The next major dedicated-tab candidate is TablEdit `.tef`; it remains unsupported until separately selected and investigated.

Fork `main` remains untouched at `60c2e5de0887b1bcdd426d932632946edd07d3c3`. No merge, pull request, upstream modification, playback reopening, or teacher-mode work is authorized by this authority record.

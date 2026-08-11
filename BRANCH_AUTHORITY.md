# PowerTab Format-Intake Authority

Date: 2026-08-11

Current accepted operational branch: `work/powertab-pt2-v1-v10-investigation`

Accepted exact hosted and real-device source for historical PowerTab `.pt2` internal versions 1 through 10: `930d00831cb71b4fad6f4771f3009be8cb28670e`.

Previous accepted historical PowerTab 1.0 / 1.0.2 / 1.5 `.ptb` source: `2682928366f587d5afac213e8e195ba0dfb602d8` on `work/powertab-legacy-ptb-v1-v3-intake`.

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c` on `work/powertab-legacy-ptb-intake-evaluation`.

Previous accepted PowerTab `.pt2` internal-version-11 hosted and real-device source: `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.

Previous accepted format-only convergence baseline: `work/accepted-format-intake-convergence` at `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`.

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Fork `main` remains an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized by this record.

## Accepted format convergence

The current accepted operational branch contains the previously accepted format-only reader plus bounded PowerTab routes for `.pt2` internal versions 1 through 11 and all four known legacy `.ptb` file-version families.

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
10. legacy PowerTab `.ptb` file version `1`, PowerTab 1.0, within the accepted historical profile;
11. legacy PowerTab `.ptb` file version `2`, PowerTab 1.0.2, within the accepted historical profile;
12. legacy PowerTab `.ptb` file version `3`, PowerTab 1.5, within the accepted historical profile;
13. legacy PowerTab `.ptb` file version `4`, PowerTab 1.7, within the accepted bounded profile.

## Accepted PowerTab `.pt2` profiles

Internal versions 1 through 10 are accepted through one bounded historical compatibility layer proven against the pinned Power Tab Editor 2.0.22 source lineage.

The historical evidence includes:

- exact source milestones for internal versions 1 through 10;
- producer-maintained upstream compatibility anchors for internal versions 2, 3, 4, and 6;
- deterministic project-authored source-derived six-position fixtures for all ten historical versions;
- exact manifest byte counts and SHA-256 hashes;
- explicit pre-v10 integer-enum and bitset-flag canonicalization;
- version-10 named-enum and named-flag handling;
- focused compatibility tests;
- the complete inherited automated suite;
- optimized production build and artifact inspection;
- hosted Pages publication and complete JavaScript asset read-back;
- bounded real-iPhone Safari and VoiceOver acceptance of all ten fixtures.

The owner tested all ten historical `.pt2` fixtures and reported that all ten loaded properly, were recognized, VoiceOver behavior was good, and focus worked correctly.

Acceptance records:

- `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`.

Internal version 11 remains accepted through its separately proven canonical Power Tab Editor 2.0.22 export and real-iPhone checkpoint.

Version-11 records:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

Together these records establish bounded accepted `.pt2` coverage for internal versions 1 through 11. They do not establish arbitrary compatibility with every `.pt2` file.

## Accepted legacy PowerTab `.ptb` profiles

Legacy `.ptb` file-version mapping is accepted as:

- `1` = PowerTab 1.0;
- `2` = PowerTab 1.0.2;
- `3` = PowerTab 1.5;
- `4` = PowerTab 1.7.

All four claims remain bounded to the exact project-proven browser profiles rather than arbitrary `.ptb` compatibility.

Historical acceptance records:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`;
- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

## Scope boundary

This authority does not claim support for:

1. arbitrary `.ptb` or `.pt2` files outside the accepted version-specific profiles;
2. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, chord-diagram, or other unproven profiles;
3. TuxGuitar `.tg`;
4. TablEdit `.tef`;
5. playback, teacher mode, scoring, bookmarks, or AI instruction.

Recognition must never be described as reading support. Unsupported PowerTab structures must fail explicitly rather than be guessed.

The shared-reader phrase `notation preserved but not yet interpreted` remains known wording debt for attached techniques and must not be patched format-specifically.

## Future branch rule

The next format investigation must begin from the final documentation-closure head of `work/powertab-pt2-v1-v10-investigation` on a new isolated work branch.

PowerTab `.pt2` internal versions 1 through 11 and all four legacy `.ptb` file-version families now have bounded accepted coverage. Any broader PowerTab profile requires a separate evidence checkpoint rather than inference from these accepted versions.

The next new-format family has not yet been selected. TuxGuitar `.tg` and TablEdit `.tef` remain deferred candidates until a separate prioritization decision and read-only preflight establish the next target.

Fork `main` remains untouched at `60c2e5de0887b1bcdd426d932632946edd07d3c3`. No merge, pull request, upstream modification, playback reopening, or teacher-mode work is authorized by this authority record.

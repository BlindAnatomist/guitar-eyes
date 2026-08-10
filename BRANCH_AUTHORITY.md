# PowerTab Format-Intake Authority

Date: 2026-08-10

Current accepted operational branch: `work/powertab-legacy-ptb-v1-v3-intake`

Accepted exact hosted and real-device source for the historical PowerTab 1.0 / 1.0.2 / 1.5 checkpoint: `2682928366f587d5afac213e8e195ba0dfb602d8`.

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c` on `work/powertab-legacy-ptb-intake-evaluation`.

Previous accepted PowerTab `.pt2` hosted and real-device source: `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.

Previous accepted format-only convergence baseline: `work/accepted-format-intake-convergence` at `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`.

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Fork `main` remains an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized by this record.

## Accepted format convergence

The current accepted operational branch contains the previously accepted format-only reader plus bounded PowerTab routes for modern `.pt2` and all four known legacy `.ptb` file-version families.

Accepted families and routes are:

1. ASCII `.txt` and `.tab` within the accepted guitar, bass, and exact extended-string profiles;
2. uncompressed MusicXML `.musicxml` and `.xml` within the accepted tablature profile;
3. compressed MusicXML `.mxl`;
4. Guitar Pro 3 `.gp3`;
5. Guitar Pro 4 `.gp4`;
6. Guitar Pro 5 `.gp5`;
7. Guitar Pro 6 `.gpx`;
8. Guitar Pro 7 shared `.gp`;
9. PowerTab `.pt2` exact internal version 11 within its accepted bounded profile;
10. legacy PowerTab `.ptb` file version `1`, PowerTab 1.0, within the accepted historical profile;
11. legacy PowerTab `.ptb` file version `2`, PowerTab 1.0.2, within the accepted historical profile;
12. legacy PowerTab `.ptb` file version `3`, PowerTab 1.5, within the accepted historical profile;
13. legacy PowerTab `.ptb` file version `4`, PowerTab 1.7, within the accepted first legacy profile.

## Accepted PowerTab `.pt2` profile

PowerTab `.pt2` support remains exactly the previously accepted internal-version-11 profile. Its evidence includes the canonical Power Tab Editor 2.0.22 export, exact fixture hashes, parser parity, complete inherited automated suite, optimized production build, bundle inspection, hosted Pages publication, live HTML and JavaScript read-back, and bounded real-iPhone Safari and VoiceOver acceptance.

Closure records:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

## Accepted legacy PowerTab `.ptb` profiles

Legacy `.ptb` file-version mapping is now accepted as:

- `1` = PowerTab 1.0;
- `2` = PowerTab 1.0.2;
- `3` = PowerTab 1.5;
- `4` = PowerTab 1.7.

All four claims remain bounded to the exact project-proven browser profiles rather than arbitrary `.ptb` compatibility.

For versions 1 through 3, the accepted demonstrated profile is:

- song files;
- guitar-only content;
- one standard-tuned six-string guitar player;
- one staff;
- one active voice;
- simple complete 4/4 measures;
- quarter, eighth, and half-note durations demonstrated by the canonical fixtures;
- open and fretted notes;
- rests;
- simple simultaneous-note chords;
- exact bounded historical header, system, barline, and shared MFC structures implemented by the historical decoder.

The accepted historical source passed the complete inherited automated suite, production build, artifact inspection, Pages publication, live read-back across every deployed JavaScript chunk, and real-iPhone Safari/VoiceOver acceptance.

Historical acceptance record:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`.

For PowerTab 1.7 file version 4, the prior accepted bounded profile and evidence remain unchanged.

PowerTab 1.7 acceptance record:

- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

## Scope boundary

This authority does not claim support for:

1. arbitrary `.ptb` files outside the accepted version-specific profiles;
2. older `.pt2` internal versions other than accepted internal version 11;
3. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, or other unproven profiles;
4. TuxGuitar `.tg`;
5. TablEdit `.tef`;
6. playback, teacher mode, scoring, bookmarks, or AI instruction.

Recognition must never be described as reading support. Unsupported PowerTab structures must fail explicitly rather than be guessed.

The shared-reader phrase `notation preserved but not yet interpreted` remains known wording debt for attached techniques and must not be patched format-specifically.

## Future branch rule

The next PowerTab investigation must begin from the final documentation-closure head of `work/powertab-legacy-ptb-v1-v3-intake` on a new isolated work branch.

All four legacy `.ptb` file-version families now have bounded accepted coverage. The next logical PowerTab target is older `.pt2` internal versions, investigated independently rather than inferred from accepted internal version 11. PowerTab bass, alternate tunings, and broader notation profiles remain separately deferred.

Fork `main` remains untouched at `60c2e5de0887b1bcdd426d932632946edd07d3c3`. No merge, pull request, upstream modification, playback reopening, or teacher-mode work is authorized by this authority record.

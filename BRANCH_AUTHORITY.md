# PowerTab Format-Intake Authority

Date: 2026-08-10

Current accepted operational branch: `work/powertab-legacy-ptb-intake-evaluation`

Accepted exact hosted and real-device source for the PowerTab 1.7 `.ptb` checkpoint: `937cf3892d279e54f98802f1eb649333f4b1935c`.

Previous accepted PowerTab `.pt2` operational branch: `work/powertab-pt2-v11-clean-convergence`

Previous accepted PowerTab `.pt2` hosted and real-device source: `c2ada9bbdf118abddc894094734314f9b6048ea6`.

Previous accepted format-only convergence baseline: `work/accepted-format-intake-convergence` at `e64990ab3e446e5aa1d4eeefbf556a9dc71bd63d`.

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Fork `main` remains an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized by this record.

## Accepted format convergence

The current accepted operational branch contains the previously accepted format-only reader plus two separately bounded PowerTab profiles.

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
10. legacy PowerTab `.ptb` file version `4`, PowerTab 1.7, within the accepted first legacy profile.

## Accepted PowerTab `.pt2` profile

PowerTab `.pt2` support remains exactly the previously accepted internal-version-11 profile. Its evidence includes the canonical Power Tab Editor 2.0.22 export, exact fixture hashes, parser parity, complete inherited automated suite, optimized production build, bundle inspection, hosted Pages publication, live HTML and JavaScript read-back, and bounded real-iPhone Safari and VoiceOver acceptance.

Closure records:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

## Accepted legacy PowerTab `.ptb` profile

Legacy `.ptb` is accepted only for file version `4`, corresponding to the proven PowerTab 1.7 `ptab-4` family, and only within the bounded first browser profile:

- song files;
- guitar-only content;
- one standard-tuned six-string guitar player;
- one staff;
- one active voice;
- simple complete 4/4 measures;
- quarter, eighth, and half-note durations as demonstrated by the canonical fixture;
- open and fretted notes;
- rests;
- simple simultaneous-note chords;
- exact bounded MFC structures implemented by the accepted decoder.

The accepted exact source passed 57 automated test suites and 343 tests, production build, artifact inspection, hosted Pages publication, live read-back, and real-iPhone Safari/VoiceOver acceptance.

Real-device closure record:

- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

Canonical fixture:

- `fixtures/powertab-ptb-v17/powertab-v17-original-six-position.ptb`;
- 723 bytes;
- SHA-256 `9cd2e677b8898900822afad4160acc004b5bbea70a57f0b62f412e5a52ce2216`;
- header `707461620400`.

## Scope boundary

This authority does not claim support for:

1. historical legacy `.ptb` file-version values `1`, `2`, or `3`;
2. arbitrary `.ptb` files outside the accepted PowerTab 1.7 profile;
3. older `.pt2` internal versions;
4. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, or other unproven profiles;
5. TuxGuitar `.tg`;
6. TablEdit `.tef`;
7. playback, teacher mode, scoring, bookmarks, or AI instruction.

Recognition must never be described as reading support. Unsupported PowerTab structures must fail explicitly rather than be guessed.

The shared-reader phrase `notation preserved but not yet interpreted` remains known wording debt for attached techniques. The accepted `.pt2` iPhone test showed that the PowerTab `PalmMuting` property was decoded and associated with the correct note; the extra generic phrase is not a PowerTab parsing failure and must not be patched format-specifically.

## Future branch rule

The next PowerTab investigation must begin from the final documentation-closure head of `work/powertab-legacy-ptb-intake-evaluation` on a new isolated work branch.

The next logical PowerTab target is a separate historical `.ptb` version family, with file-version values `1`, `2`, and `3` investigated independently rather than inferred from accepted version `4`. Older `.pt2` internal versions remain a separate later target.

Fork `main` remains untouched at `60c2e5de0887b1bcdd426d932632946edd07d3c3`. No merge, pull request, upstream modification, playback reopening, or teacher-mode work is authorized by this authority record.

# Accepted Format-Intake Authority

Date: 2026-08-14

Current accepted format-only operational branch: `work/accepted-bass-convergence`

Accepted runtime convergence source: `67a062085c93d9fb546194d727c808960bbcaea9`.

Current convergence record: `docs/accepted-bass-convergence-result-2026-08-14.md`.

Accepted TuxGuitar standard-bass closure: `1a874f34898d74f032cc2bc5a431ecb991be370d` on `work/tuxguitar-standard-bass-profile`.

Accepted PowerTab standard-bass closure: `8b7b7d6beb16e2675f03197fb4e701d3d1984a79` on `work/powertab-bass-clean`.

Previous accepted corrected TuxGuitar semantic source: `b3a8d229aee832a7f6ea994dfc7465ff07d608c3`.

Previous accepted corrected TuxGuitar hosted candidate source: `dee0ba8d63d22c47b6570778acf8dad7ed003942`.

Previous accepted historical PowerTab `.pt2` internal versions 1 through 10 source: `930d00831cb71b4fad6f4771f3009be8cb28670e` on `work/powertab-pt2-v1-v10-investigation`.

Previous accepted historical PowerTab 1.0 / 1.0.2 / 1.5 `.ptb` source: `2682928366f587d5afac213e8e195ba0dfb602d8` on `work/powertab-legacy-ptb-v1-v3-intake`.

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c` on `work/powertab-legacy-ptb-intake-evaluation`.

Previous accepted PowerTab `.pt2` internal-version-11 source: `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Fork `main` remains an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized by this record.

Documentation-only closure commits do not silently broaden accepted runtime behavior. The accepted runtime authority for this convergence remains `67a062085c93d9fb546194d727c808960bbcaea9` unless a later separately gated runtime checkpoint supersedes it.

## Accepted format convergence

The current accepted operational branch contains one shared semantic format-only reader with these bounded accepted routes:

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
19. modern TuxGuitar native file format 2.0.0 as validated against TuxGuitar 2.1.0 producer authority.

Recognition is not reading support. Every item above is bounded by its committed evidence and acceptance record rather than by filename alone.

## Accepted TuxGuitar `.tg` profiles

Producer authority for the modern route remains:

- upstream repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- modern native file-format version: `2.0.0`.

Accepted native generations are 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0.

For those six accepted generations, two separately proven instrument profiles are now part of the operational authority:

1. the previously accepted bounded six-string guitar profile;
2. exact standard four-string bass in high-to-low tuning G2, D2, A1, E1.

Standard-bass acceptance records:

- `docs/tuxguitar-standard-bass-profile-investigation-2026-08-12.md`;
- `docs/tuxguitar-standard-bass-source-gate-result-2026-08-12.md`;
- `docs/tuxguitar-standard-bass-hosted-proof-2026-08-12.md`;
- `docs/tuxguitar-standard-bass-real-iphone-acceptance-2026-08-13.md`.

Original TuxGuitar acceptance records remain:

- `docs/tuxguitar-tg-intake-investigation-2026-08-11.md`;
- `docs/tuxguitar-tg-producer-source-correction-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-source-gate-result-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-hosted-proof-2026-08-11.md`;
- `docs/tuxguitar-tg-real-iphone-acceptance-2026-08-11.md`.

There is no inferred native 1.4 route. Native 0.7, 0.8, and 0.9 remain deferred archival work.

## Accepted PowerTab `.pt2` profiles

Internal versions 1 through 10 remain accepted through the bounded historical compatibility layer proven against pinned Power Tab Editor 2.0.22 source lineage. Internal version 11 remains accepted through its separately proven canonical Power Tab Editor 2.0.22 export and real-iPhone checkpoint.

The convergence does not broaden bass support across all eleven internal versions.

Exact standard four-string bass in high-to-low MIDI tuning `43, 38, 33, 28` / G2, D2, A1, E1 is accepted for `.pt2` internal version 11 only.

Internal versions 1 through 10 retain their previously accepted six-string-guitar boundary and must explicitly reject the unproved bass profile.

PowerTab `.pt2` acceptance records include:

- `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`;
- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`;
- `docs/powertab-standard-bass-real-iphone-acceptance-2026-08-14.md`.

## Accepted legacy PowerTab `.ptb` profiles

Legacy `.ptb` file-version mapping remains accepted as:

- `1` = PowerTab 1.0;
- `2` = PowerTab 1.0.2;
- `3` = PowerTab 1.5;
- `4` = PowerTab 1.7.

All four accepted legacy families now also have bounded acceptance for exact standard four-string bass in high-to-low tuning G2, D2, A1, E1.

Historical guitar acceptance records:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`;
- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

Bass acceptance record:

- `docs/powertab-standard-bass-real-iphone-acceptance-2026-08-14.md`.

## Convergence proof

The separately accepted TuxGuitar-bass and PowerTab-bass lines were converged in two-parent runtime commit:

`67a062085c93d9fb546194d727c808960bbcaea9`

The only substantive runtime overlap was `src/powerTabTrackInventory.js`. Its hand-resolved union preserves PowerTab `.pt2` versions 1 through 10 without silently granting them bass support.

Integration workflow run `31848478423`, job `94919569731`, passed:

- 3 focused convergence suites / 22 tests;
- the complete inherited suite: 70 suites / 424 tests passed;
- optimized production build.

The parent real-iPhone acceptances were preserved and were not replayed because convergence introduced no new reader surface, focus mechanism, speech mechanism, or new format.

Full convergence record:

- `docs/accepted-bass-convergence-result-2026-08-14.md`.

## Scope boundary

This authority does not claim support for:

1. arbitrary `.tg` files outside the accepted TuxGuitar version-specific and semantic profiles;
2. TuxGuitar native 0.7, 0.8, or 0.9;
3. alternate or extended-range TuxGuitar bass profiles, or arbitrary TuxGuitar multi-track, multi-voice, effect, lyric, automation, notation, repeat, or tempo structures;
4. arbitrary `.ptb` or `.pt2` files outside the accepted PowerTab version-specific profiles;
5. PowerTab standard-bass support for `.pt2` internal versions 1 through 10;
6. alternate or extended-range PowerTab bass profiles, mixed guitar-and-bass scores, arbitrary multi-player or multi-voice structures, or broader technique, repeat, key-signature, meter, capo, chord-diagram, or notation profiles;
7. TablEdit `.tef`;
8. playback, teacher mode, scoring, bookmarks, or AI instruction.

Unsupported structures must fail explicitly rather than be guessed.

The shared-reader phrase `notation preserved but not yet interpreted` remains known wording debt for attached techniques and must not be patched format-specifically.

## Future branch rule

Any future feature or format investigation must begin from the final documentation-closure head of `work/accepted-bass-convergence` on a new isolated work branch, unless a later authority record explicitly supersedes it.

Do not resume from either parent bass branch, a forensic branch, fork `main`, or a playback experiment.

TablEdit `.tef` remains the next major dedicated-tab candidate, but it is unsupported and has not been investigated or begun by this convergence checkpoint.

Fork `main` remains untouched at `60c2e5de0887b1bcdd426d932632946edd07d3c3`. No merge, pull request, upstream modification, playback reopening, teacher-mode work, or new-format implementation is authorized by this authority record.

# Accepted Bass Convergence Result

Date: August 14, 2026

Repository: `BlindAnatomist/guitar-eyes`

Status: accepted convergence checkpoint.

## Purpose

This checkpoint converges the separately accepted TuxGuitar standard four-string bass line and PowerTab standard four-string bass line into one format-only operational authority without reimplementing, regenerating, or replaying their already accepted evidence.

No new tablature format is introduced by this checkpoint.

## Accepted parent authorities

TuxGuitar standard-bass real-device closure:

`1a874f34898d74f032cc2bc5a431ecb991be370d`

Branch:

`work/tuxguitar-standard-bass-profile`

PowerTab standard-bass real-device closure:

`8b7b7d6beb16e2675f03197fb4e701d3d1984a79`

Branch:

`work/powertab-bass-clean`

Both accepted lineages share the earlier PowerTab documentation closure `02f130f3c871de39d4c48c45d8c09f35980fba45` as an ancestor.

## Convergence authority

The two accepted heads were converged in the two-parent commit:

`67a062085c93d9fb546194d727c808960bbcaea9`

Operational branch:

`work/accepted-bass-convergence`

The convergence preserved the complete accepted TuxGuitar lineage, including PowerTab `.pt2` internal versions 1 through 10, and added the exact accepted PowerTab-bass files from the clean PowerTab bass line.

Neither accepted parent branch was rewritten.

## Overlap resolution

The only substantive runtime overlap between the two accepted lines was:

`src/powerTabTrackInventory.js`

The TuxGuitar lineage version of that file carried accepted PowerTab `.pt2` internal-version 1-through-10 support and exact internal-version evidence validation.

The PowerTab-bass lineage version carried exact standard four-string bass admission for the accepted PowerTab bass families.

Those behaviors are complementary, but a mechanical union would have silently broadened four-string bass support to PowerTab `.pt2` internal versions 1 through 10 without evidence.

The converged inventory therefore preserves this exact boundary:

- six-string guitar remains accepted across PowerTab `.pt2` internal versions 1 through 11 and the accepted legacy `.ptb` families;
- exact standard four-string bass in high-to-low MIDI tuning `43, 38, 33, 28` / G2, D2, A1, E1 is accepted only for:
  - PowerTab `.pt2` internal version 11;
  - PowerTab `.ptb` file version 1 / PowerTab 1.0;
  - PowerTab `.ptb` file version 2 / PowerTab 1.0.2;
  - PowerTab `.ptb` file version 3 / PowerTab 1.5;
  - PowerTab `.ptb` file version 4 / PowerTab 1.7;
- PowerTab `.pt2` internal versions 1 through 10 do not inherit bass support by convergence and continue to reject that unproved profile explicitly.

The bass route also retains exact tuning and note-coordinate validation rather than inferring bass from string count alone.

A dedicated regression, `src/powerTabBassConvergence.test.js`, proves both sides of this boundary: historical `.pt2` version 1 bass remains unsupported, while `.pt2` version 11 standard bass remains supported.

## Preserved acceptance evidence

TuxGuitar standard four-string bass remains accepted for native `.tg`:

- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5;
- modern native format 2.0.0.

Its real-device closure remains:

`docs/tuxguitar-standard-bass-real-iphone-acceptance-2026-08-13.md`

PowerTab standard four-string bass remains accepted for:

- `.ptb` file versions 1, 2, 3, and 4;
- `.pt2` internal version 11.

Its real-device closure remains:

`docs/powertab-standard-bass-real-iphone-acceptance-2026-08-14.md`

The convergence did not regenerate either accepted fixture corpus and did not repeat either real-iPhone acceptance exercise.

## Integration gate

One integration-only hosted gate was run against exact convergence candidate:

`67a062085c93d9fb546194d727c808960bbcaea9`

Workflow run:

`31848478423`

Job:

`94919569731`

The gate passed:

1. exact candidate checkout and identity confirmation;
2. locked dependency installation;
3. three convergence-focused suites with 22 tests passed:
   - `src/powerTabBassConvergence.test.js`;
   - `src/powerTabSourceNormalizer.bass.test.js`;
   - `src/tuxGuitarBassCompatibility.test.js`;
4. complete inherited suite: 70 suites passed, 424 tests passed, with the repository's intentionally skipped tests remaining skipped;
5. optimized production build.

The gate did not regenerate accepted fixtures, republish a hosted candidate, or repeat real-device testing.

## Why real-device acceptance was not repeated

Both user-facing bass routes had already passed their own exact hosted and real-iPhone Safari/VoiceOver checkpoints before convergence.

The convergence introduced no new reader surface, focus mechanism, speech mechanism, file-picker behavior, or new format. The only hand-resolved runtime overlap was the PowerTab inventory boundary described above, and that boundary was covered by focused semantic regression plus the complete inherited suite and production build.

The earlier real-device observations therefore remain preserved acceptance evidence rather than being treated as consumable tests that must be replayed after documentation-level convergence.

## Current bounded scope

This convergence does not broaden either accepted family beyond its existing evidence.

In particular, it does not establish:

- standard-bass support for PowerTab `.pt2` internal versions 1 through 10;
- alternate PowerTab bass tunings;
- PowerTab five-string or six-string bass;
- mixed guitar-and-bass PowerTab scores;
- arbitrary PowerTab multi-player or multi-voice structures;
- TuxGuitar native 0.7, 0.8, or 0.9;
- alternate or extended-range TuxGuitar bass profiles;
- arbitrary TuxGuitar multi-track, multi-voice, effects, notation, lyrics, automation, repeats, or tempo structures;
- arbitrary compatibility with every file from either family.

Unsupported structures must continue to fail explicitly rather than be guessed.

## Repository boundary

Fork `main` remains reserved as the clean upstream-tracking branch at:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

`Phlypper/guitar-eyes` remains untouched.

No pull request or merge to `main` or upstream is authorized by this checkpoint.

The temporary integration-gate branch is execution evidence only and is not product authority.

## Closure

`work/accepted-bass-convergence` is the new accepted format-only operational line for the already accepted PowerTab, TuxGuitar, Guitar Pro, MusicXML, compressed MusicXML, and ASCII intake work, including the two bounded standard-bass expansions described above.

The accepted runtime convergence source is `67a062085c93d9fb546194d727c808960bbcaea9`.

This checkpoint closes convergence and documentation work only. TablEdit `.tef` remains unsupported and was not investigated, implemented, branched, or otherwise begun by this checkpoint.

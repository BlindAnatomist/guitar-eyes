# PowerTab 1.7 `.ptb` Real-iPhone Acceptance

Date: August 10, 2026

Status: passed and accepted within the bounded profile described below.

## Exact accepted source

Branch: `work/powertab-legacy-ptb-intake-evaluation`

Exact hosted and real-device source: `937cf3892d279e54f98802f1eb649333f4b1935c`

Clean fork `main` authority after publication cleanup: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Canonical fixture: `fixtures/powertab-ptb-v17/powertab-v17-original-six-position.ptb`

Fixture identity:

- bytes: `723`
- SHA-256: `9cd2e677b8898900822afad4160acc004b5bbea70a57f0b62f412e5a52ce2216`
- header: `707461620400` (`ptab`, little-endian file version `4`)
- PowerTab version claim: `1.7`

## Non-device gates already passed

The bounded source gate passed before owner testing:

1. project-authored deterministic fixture regeneration and exact hash;
2. source-level execution through the exact TuxGuitar `ptab-4` parser bytes;
3. compiled Power Tab Editor 2.0.22 source-faithful legacy deserialization harness;
4. semantic parity for title, tuning, two measures, six positions, one rest, six total notes, and final two-note chord;
5. bounded legacy decoder and shared-semantic normalization;
6. complete automated repository test command: 57 suites passed, 343 tests passed;
7. optimized production build;
8. bounded Pages artifact inspection;
9. hosted Pages deployment;
10. live network read-back of the deployed candidate;
11. restoration of fork `main` to its clean upstream-tracking authority.

Automated verification run: `31418445202`.

Hosted candidate publication run: `31419032597`.

## Real-device acceptance

John Washburn tested the hosted candidate in Safari on a real iPhone with VoiceOver using the canonical `.ptb` fixture.

He reported that all requested checks worked correctly:

1. the `.ptb` file loaded successfully;
2. the application identified the source as imported PowerTab 1.7 tablature;
3. no unnecessary player-selection step appeared for the single supported player;
4. VoiceOver focus returned to the iPhone tablature reader heading after file selection;
5. all six positions were reachable and read in the intended order;
6. the measure-one to measure-two transition was coherent;
7. the half-note rest was announced as a rest rather than as a note;
8. the final position was read as the intended two-note chord: high E open plus B string fret 1;
9. Previous and Next position navigation behaved normally.

No real-device regression was reported in the bounded acceptance surface.

## Accepted support claim

Guitar Eyes now accepts legacy PowerTab `.ptb` files only within the first proven PowerTab 1.7 `ptab-4` profile:

- song files;
- guitar-only content;
- one six-string guitar player;
- standard six-string tuning;
- one staff;
- one active voice;
- simple complete 4/4 measures;
- quarter, eighth, and half-note durations demonstrated by the fixture;
- open and fretted notes;
- rests;
- simple simultaneous-note chords;
- exact bounded MFC structures implemented by the accepted decoder.

This acceptance is not a claim of arbitrary `.ptb` compatibility.

Historical `.ptb` file-version values `1`, `2`, and `3`, bass scores, alternate tunings, multiple players, multiple active voices, techniques, capo, repeats, key changes, non-4/4 meters, and other unproven structures remain outside this accepted profile and must fail explicitly rather than be guessed.

## Next format boundary

The next PowerTab investigation may evaluate historical legacy `.ptb` versions separately. It must not broaden the PowerTab 1.7 claim by inference. Older `.pt2` internal versions remain a separate later family unless independently proven.

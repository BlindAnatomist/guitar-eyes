# Iowa Sample Systemic Repair 1K Fixture-Test Diagnostic

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-systemic-repair-1k`

Derivation run: `30834146324`

## Audio result

The run successfully:

1. downloaded and verified all six official University of Iowa source sessions;
2. selected six signal-valid takes;
3. removed sub-35 Hz drift;
4. normalized all six anchors toward `-30 dBFS` active RMS;
5. produced a six-sample spread of `0.584369 dB`;
6. enforced the `12` times maximum gain and `0.88` peak ceiling;
7. generated and hash-verified the schema-version-2 1K lock;
8. passed the complete sample audit and fixture-file identity check.

## Exact non-audio failure

The final focused Jest test failed because its helper treated every string whose type was not `inactive` as playable. The MusicXML parser's established representation uses `silent` for strings not sounding in a position. A one-note position therefore correctly contained five `silent` strings and one `open` string, but the test incorrectly counted all six.

## Correction

The fixture and parser were unchanged. The test helper now counts entries whose type is not `silent`, verifies one playable string in each of the six open-string positions, six playable strings in the E-major chord, and zero playable strings plus `isRest: true` in the rest position.

This failure does not invalidate the six derived WAV files or candidate manifest from run `30834146324`; both had already passed their independent hash, pitch, loudness, peak, and cross-sample balance gates.

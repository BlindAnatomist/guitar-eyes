# Historical PowerTab `.ptb` Real-iPhone Acceptance

Date: August 10, 2026

Status: passed and accepted within the bounded profiles described below.

## Exact accepted source

Branch: `work/powertab-legacy-ptb-v1-v3-intake`

Exact hosted and real-device source: `2682928366f587d5afac213e8e195ba0dfb602d8`

Clean fork `main` authority after publication cleanup: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Corrective hosted publication run: `31424795831`.

The corrective run passed the repaired build-identity tests, the complete inherited suite, production build, artifact inspection, Pages deployment, and live read-back across every deployed JavaScript chunk, including lazy-loaded chunks.

## Canonical fixtures

### PowerTab 1.0

- path: `fixtures/powertab-ptb-historical/powertab-v10-original-six-position.ptb`
- file version: `1`
- header: `707461620100`
- bytes: `715`
- SHA-256: `e85487ca2e71d944e67c536b0e90f6e5f424567ad3bc24601e457e7d66ae091b`

### PowerTab 1.0.2

- path: `fixtures/powertab-ptb-historical/powertab-v102-original-six-position.ptb`
- file version: `2`
- header: `707461620200`
- bytes: `715`
- SHA-256: `ae91e9693692c764835db64b524f87f27492db4e68d8adc2d534ea6b70e413be`

### PowerTab 1.5

- path: `fixtures/powertab-ptb-historical/powertab-v15-original-six-position.ptb`
- file version: `3`
- header: `707461620300`
- bytes: `644`
- SHA-256: `bdcdd04f0e4b1f558c0d6c8fa0f30feea78113e656530a4195c6cc683e083f53`

All three fixtures encode the same original two-measure, six-position standard six-string guitar proof.

## Evidence boundary

The historical fixture package was derived from the pinned Power Tab Editor 2.0.22 compatibility reader at commit `13cab27c7127d301f2747671071e53eb203dc940` and passed deterministic regeneration plus source-faithful execution of the historical deserialization layouts.

No maintained independent parser clearly supporting file-version values 1 through 3 was located. This acceptance therefore does not claim independent-parser parity for PowerTab 1.0, 1.0.2, or 1.5.

The bounded implementation preserves the already accepted PowerTab 1.7 decoder separately and routes historical versions explicitly by the `ptab` file-version value.

## Real-device acceptance

John Washburn tested all three hosted historical `.ptb` fixtures in Safari on a real iPhone with VoiceOver.

He reported:

> “They all worked fine and voiceover. Focus was good.”

Within the bounded requested acceptance surface, that confirms:

1. all three fixtures loaded successfully;
2. the historical PowerTab routes were usable with VoiceOver;
3. VoiceOver focus recovery behaved correctly after each file selection;
4. no real-device regression was reported in the six-position semantic reading workflow.

Do not strengthen this record beyond the owner’s actual report.

## Accepted support claim

Guitar Eyes now accepts legacy PowerTab `.ptb` file versions `1`, `2`, `3`, and `4` only within the bounded project-proven six-string guitar profiles.

Historical version mapping is:

- file version `1`: PowerTab 1.0;
- file version `2`: PowerTab 1.0.2;
- file version `3`: PowerTab 1.5;
- file version `4`: PowerTab 1.7.

For file versions 1 through 3, the accepted demonstrated profile is limited to the deterministic project-authored proof:

- song files;
- guitar-only content;
- one standard-tuned six-string guitar player;
- one staff;
- one active voice;
- simple complete 4/4 measures;
- quarter, eighth, and half-note durations demonstrated by the fixture;
- open and fretted notes;
- rests;
- simple simultaneous-note chords;
- exact bounded historical header, system, barline, and shared MFC structures implemented by the accepted decoder.

This is not a claim of arbitrary `.ptb` compatibility. Bass scores, alternate tunings, multiple players, multiple active voices, techniques, capo, repeats, key changes, non-4/4 meters, and other unproven historical structures remain outside the accepted profiles and must fail explicitly rather than be guessed.

## Next PowerTab boundary

All four legacy `.ptb` file-version families now have bounded accepted browser and real-iPhone coverage.

The next PowerTab investigation should therefore move to older `.pt2` internal versions as a separate family. It must not infer support from accepted internal version 11. PowerTab bass, alternate-tuning, and broader notation-profile expansion remain separately deferred work.

# Iowa Sample Systemic Repair 1K Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Work branch: `work/iowa-sample-systemic-repair-1k`

Inherited hosted application source: `33ae73dbe6f26655ab31ebb567acf54887661ce1`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner evidence

Using the correct four-position Iowa fixture on a real iPhone, the owner established:

1. first-audition VoiceOver focus remained on `Audition current position`;
2. high open E was audible;
3. the six-string E-major chord played but was somewhat soft;
4. the semantic rest behaved correctly;
5. low open E remained inaudible.

The owner then required a systemic investigation rather than one sample repair at a time.

## Proven defect class

Inspection of the six hosted 1J WAV files showed that low E was not an isolated outlier. Low E, B3, and E3 were 17 to 22 decibels below the stronger anchors. B3 and E3 were dominated by near-DC or sub-musical energy. The v3 derivation script selected candidates primarily by autocorrelation score and used a peak ceiling that could attenuate loud samples but could never amplify weak ones.

The defect therefore has two parts:

1. candidate selection can accept a weak or non-musical segment;
2. derivation does not normalize valid samples toward a shared active-note loudness.

## Source-change boundary

The 1K candidate:

1. preserves the catalog-ordered physical-string source boundary;
2. adds signal validation using active RMS, target-pitch evidence, motion ratio, and zero-crossing evidence;
3. rejects candidates that are weak relative to the strongest take in their note group;
4. removes sub-35 Hz drift before output;
5. normalizes every valid take to `-24 dBFS` active RMS within `±1.25 dB`;
6. enforces a peak ceiling of `0.88` and maximum normalization gain of `12`;
7. audits all six derived anchors as one set and permits no more than `1.75 dB` active-loudness spread;
8. builds a deterministic schema-versioned sample lock from derivation and audit evidence;
9. adds one project-authored eight-position fixture: six open strings from low E through high E, one six-string E-major chord, and one semantic rest;
10. preserves the accepted reader, focus, delay, navigation, semantic, and Web Audio behavior.

No binary audio is committed to Git.

## Checkpoint design

One standard `ubuntu-24.04` GitHub-hosted derivation checkpoint will:

1. check out the exact source commit immediately preceding the workflow-creation commit;
2. verify ancestry from `33ae73dbe6f26655ab31ebb567acf54887661ce1`;
3. compile all Python scripts and run deterministic synthetic rejection and normalization checks;
4. download the six exact official University of Iowa source sessions;
5. verify official source hashes through the derivation script;
6. derive all six anchors together;
7. audit pitch, active loudness, peak, motion, and cross-sample balance;
8. generate a candidate schema-version-2 lock;
9. run the focused MusicXML fixture test;
10. upload the six WAVs and all derivation evidence for one day.

The workflow is a derivation checkpoint, not publication. It uses a standard Linux runner, a 30-minute timeout, one-day evidence retention, no paid service, no paid runner, and no repository write permission.

## Stop conditions

If any sample fails signal validation, pitch validation, safe normalization, or the six-sample balance standard, the workflow must fail with named evidence. Do not weaken the rule or publish a partial set.

If the derivation checkpoint passes, use its locked hashes and metrics to update the source manifest and JavaScript manifest, then run one exact full regression and production-build gate. Publish only after that exact gate succeeds.

Fork `main` and `Phlypper/guitar-eyes` must remain untouched until a separately bounded temporary Pages publisher is required, and fork `main` must be restored exactly afterward.

# Iowa Sample Loudness Proof 1J Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-loudness-proof-1j`

Exact verified and hosted application source: `33ae73dbe6f26655ab31ebb567acf54887661ce1`

Preserved 1I branch head before 1J: `4aee0deba0823b846cb2a067733ac487f8e5b6c5`

Inherited accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Hosted identity: `Guitar Eyes Iowa sample loudness proof 1J`

Hosted address: `https://blindanatomist.github.io/guitar-eyes/`

## Owner finding that opened 1J

The owner found that the University of Iowa recordings sounded better than the rejected procedural timbre, but playback was too soft to judge reliably. The low open E string was especially difficult to hear on the real iPhone. This finding did not reject the sample set; it required a bounded loudness and physical-string balance correction before musical judgment could continue.

## Implemented boundary

The 1J source changes only six application files relative to preserved 1I:

1. `src/iowaSampleAuditioner.js`;
2. `src/iowaSampleLoudness.test.js`;
3. `src/IPhoneTabReader.js`;
4. `public/index.html`;
5. `src/buildIdentity.test.js`;
6. `src/checkpointBuildIdentity.test.js`.

The sampled audio engine now:

1. raises the master input from `0.82` to `1.05`;
2. raises the neutral single-string base gain from `0.48` to `0.60`;
3. applies physical-string multipliers from high E through low E of `1.00`, `1.00`, `1.04`, `1.10`, `1.22`, and `1.40`;
4. gives the low E single-note voice a bounded gain of `0.84`;
5. preserves square-root per-voice chord attenuation;
6. preserves the existing high-pass filter, low-pass filter, and dynamics compressor.

The candidate preserves pitch, sample selection, physical-string routing, simultaneous chord onset, the accepted two-second default delay, first-audition focus protection, quiet navigation, rest handling, reader control order, and supported input formats.

It does not begin measure playback, full playback, transport, looping, tempo controls, teacher mode, scoring, bookmarks, AI work, or new formats.

## Exact verification

Verification run: `30825941641`

The gate checked out exact source `33ae73dbe6f26655ab31ebb567acf54887661ce1` and passed:

1. exact source identity and accepted ancestry;
2. the exact six-file application boundary;
3. the 1J loudness and low-string compensation source contract;
4. 45 of 45 test suites;
5. 272 of 272 tests;
6. the optimized production build;
7. compiled 1J identity;
8. compiled sampled-audio, reader, delay, focus, navigation, and rest contracts;
9. the source-only build asset boundary;
10. repository cleanliness.

Verification artifact: `iowa-sample-loudness-proof-1j`, artifact ID `8860837788`, retained for one day.

## Publication and live verification

Publication run: `30826448635`

Because the `github-pages` environment permits deployment only from fork `main`, one temporary publisher commit `807ba400f36f72de7f5ed9519b9a4c1dbcb2b632` was created on `main`. The workflow checked out exact application source `33ae73dbe6f26655ab31ebb567acf54887661ce1`, not the temporary publisher commit.

The publisher:

1. required the successful exact-source verification status;
2. verified source identity and accepted ancestry;
3. downloaded the exact six official University of Iowa guitar sessions;
4. matched all official source hashes;
5. reproduced all six browser WAVs with the locked derivation script;
6. matched every derived byte count and SHA-256;
7. built for `/guitar-eyes/`;
8. verified the compiled 1J identity and accepted reader contracts;
9. deployed successfully through GitHub Pages;
10. read back live HTML with HTTP 200;
11. read back live JavaScript asset `/guitar-eyes/static/js/main.3a0143c7.js`;
12. matched the live HTML SHA-256 `1748b668ac7a84fca387e6858d810678771c3c1a0e9b538c51baa9817cdf3fe4`;
13. matched the live JavaScript SHA-256 `3282cc34ef70c9f325dff3e7c696fb7cfc977f8a7c59d7d10f5f9824f27173c0`;
14. matched the hosted sample manifest;
15. downloaded and independently matched all six hosted WAV byte counts and SHA-256 values;
16. passed hosted identity, loudness, sample-engine, reader, and sample-lock checks.

Publication artifact: `iowa-sample-loudness-proof-1j-publication`, artifact ID `8861088187`, retained for one day.

## Repository restoration

Immediately after successful publication and live read-back, fork `main` was force-restored to exact clean authority `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Independent comparison reported:

1. status `identical`;
2. zero commits ahead;
3. zero commits behind;
4. zero changed files.

`Phlypper/guitar-eyes` remained untouched.

## Required owner listening checkpoint

Open the hosted address with a cache-busting query and confirm that VoiceOver encounters the static identity `Test build: Guitar Eyes Iowa sample loudness proof 1J.`

Use the existing four-position proof file and judge:

1. low open E on string 6: clearly audible at ordinary iPhone playback volume, without boom or distortion;
2. high open E on string 1: audible and not painfully dominant;
3. six-string E-major chord: louder and coherent, with low strings present but no clipping, crunch, pumping, or harshness;
4. semantic rest: still silent except for the accepted rest announcement;
5. all chord strings: still simultaneous;
6. the two-second delay, focus, navigation, and control order: unchanged.

The technically verified hosted candidate is not musically accepted until the owner completes this real-iPhone listening checkpoint.

## State

State: `verified hosted louder candidate; owner listening required`.

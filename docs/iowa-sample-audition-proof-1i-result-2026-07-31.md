# Iowa String-Aware Sample Audition Proof 1I Result

Date: July 31, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-audition-proof-1i`

Exact verified application source: `38d70ff39815417f97276596005c410d840ac26a`

Inherited accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Rejected procedural timbre candidate: `b3d9f39de3900c0065875451bc2a90531226c707`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Hosted identity: `Guitar Eyes Iowa string-aware sample proof 1I`

## Owner finding that opened the checkpoint

The owner found that Procedural Timbre Proof 1H remained toy-like. The low and high E strings were distinguishable, the chord onset was simultaneous, and the rest worked, but the six-string chord sounded horrible and the instrument remained musically unconvincing.

That finding rejected further marginal procedural filtering as the next path and authorized a bounded real-sample experiment.

## Official sample authority

The proof uses only recordings from the University of Iowa Electronic Music Studios Musical Instrument Samples collection.

Official collection:

`https://theremin.music.uiowa.edu/MIS.html`

Official guitar catalog:

`https://theremin.music.uiowa.edu/MISguitar.html`

The official collection states that its recordings may be downloaded and used for projects without restrictions. The guitar catalog identifies a Raimundo 118 classical guitar recorded in an anechoic chamber and provides per-string chromatic sessions at multiple dynamics.

The 1I proof uses six exact 16-bit mono mezzo-forte sessions, one for each physical guitar string. Source filenames and SHA-256 hashes are locked in `public/samples/iowa-guitar/manifest.json` and `src/iowaGuitarSampleManifest.js`.

## Acquisition and deterministic derivation

Acquisition audit run: `30673795668`

Final derivation run: `30674590285`

Selection method: `catalog-ordered-chromatic-group-v3`

The derivation process:

1. downloads the exact six official Iowa AIFF sessions;
2. verifies each official source SHA-256;
3. detects pluck attacks;
4. uses the official filename's ascending chromatic range to identify the required note group;
5. selects the cleanest usable take inside that group;
6. extracts, bounds, fades, and normalizes a mono 44.1 kHz WAV;
7. records the selected onset, duration, source hash, byte count, and derived hash;
8. fails rather than guessing when a trustworthy selection cannot be established.

Locked browser samples:

1. string 1 E4: `string-1-e4.wav`, 123192 bytes, `171eb3d47ff0cf66a713ede7ad88adbb2865408d1fbf4d2290bb8b4d7f31807c`;
2. string 2 B3: `string-2-b3.wav`, 81720 bytes, `c4ebccb75a70f5bae1d7d1f2ff0dd2fa2e138e43a957816e8e9f1f26d4d3dab5`;
3. string 3 G-sharp 3: `string-3-g-sharp3.wav`, 69944 bytes, `5edab1d772b1c62729beb2e7bb185d05e4410a3038411bc27acf635f70ef3abf`;
4. string 4 E3: `string-4-e3.wav`, 114488 bytes, `c083b9438e60c9fb31f99b894985ff50da47e9fef6d5b261d69a10310accdffc`;
5. string 5 B2: `string-5-b2.wav`, 143160 bytes, `8e1b25ac7bc3902383396119a94ee3ee442ecd54b5052294f8d03d4336f54ec4`;
6. string 6 E2: `string-6-e2.wav`, 165176 bytes, `3f549ab4210bd5901ccbd43bff34d981cd679450e6dc7d3d734577a0ee27a683`.

No binary audio file is committed to Git. The repository stores only the official-source authority, deterministic extraction code, and derived-asset lock. The bounded Pages publisher reproduces the six WAVs and includes them only in the deployment artifact.

## Implemented playback boundary

The existing `createPositionAuditioner` interface remains intact through a sample-aware facade.

For eligible six-string guitar events:

1. the exact physical string selects its own Iowa anchor;
2. pitch shifting is bounded to plus or minus three semitones;
3. samples never cross physical strings;
4. all chord sources share one native Web Audio onset;
5. decoded local samples are cached;
6. an eligible sample-loading failure is reported and is not silently disguised as procedural sound.

For unsupported guitar positions or bass events, the existing procedural engine remains an explicit fallback.

The checkpoint preserves:

- semantic pitch, string, fret, tuning, duration, measure, and source-format authority;
- Previous position, Read current position, Next position, then Audition current position;
- the accepted two-second default delay;
- the first-audition focus repair;
- quiet navigation and stop behavior;
- rest handling;
- ASCII, MusicXML, compressed MusicXML, and bounded Guitar Pro intake.

It does not begin measure playback, full playback, transport, looping, tempo controls, teacher mode, scoring, bookmarks, AI work, or new formats.

## Exact source verification

Initial exact gate run: `30674782155`

The first run found one inherited test still mocking the former procedural module directly. Production sample code and all new sample tests passed; the stale test mock was updated to target the preserved sample-aware auditioner interface.

Final exact source gate run: `30674928726`

Results:

1. exact source identity and accepted ancestry passed;
2. exact 17-file source boundary passed;
3. no tracked audio assets passed;
4. official and derived sample locks passed;
5. Python extraction syntax passed;
6. 44 of 44 test suites passed;
7. 268 of 268 tests passed;
8. optimized production build passed;
9. compiled 1I identity passed;
10. compiled string-aware sample routing passed;
11. compiled reader, audition, focus, delay, and rest contracts passed;
12. source-only build asset boundary passed;
13. repository cleanliness passed.

## Publication and live verification

Publication run: `30675069758`

Hosted address:

`https://blindanatomist.github.io/guitar-eyes/`

The bounded publisher:

1. checked out exact verified source `38d70ff39815417f97276596005c410d840ac26a`;
2. reacquired the six official Iowa sessions;
3. reproduced all six WAVs deterministically;
4. matched every derived byte count and SHA-256 against the source lock;
5. built for `/guitar-eyes/`;
6. verified the static and runtime 1I identities;
7. verified the sample engine and accepted reader contracts;
8. verified the manifest and six WAVs in the Pages artifact;
9. deployed successfully;
10. read back live HTML and primary JavaScript;
11. read back the live sample manifest;
12. downloaded all six hosted WAVs and independently matched every byte count and SHA-256.

Fork `main` was restored immediately afterward and independently verified identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`, with zero commits ahead, zero behind, and zero changed files.

`Phlypper/guitar-eyes` remained untouched.

## Required owner listening checkpoint

The candidate is technically verified but not musically accepted.

The owner should test the purpose-built four-position file on a real iPhone:

1. low open E on string 6;
2. high open E on string 1;
3. six-string E-major chord using exact anchors on all six physical strings;
4. semantic rest.

The owner should judge:

1. whether the single notes now sound materially like recorded guitar rather than a toy synthesizer;
2. whether low and high strings retain distinct physical character;
3. whether the six-string chord is coherent and musically credible;
4. whether all chord strings remain simultaneous;
5. whether the two-second delay, first and later focus, quiet navigation, and rest behavior remain correct.

A technically correct sample engine does not establish musical acceptance. The owner may still reject the sample set, extraction, balance, or chord result.

## State

State: `verified hosted candidate; owner listening required`.

Do not begin measure or bar playback until the owner accepts, revises, or explicitly defers this timbre checkpoint.

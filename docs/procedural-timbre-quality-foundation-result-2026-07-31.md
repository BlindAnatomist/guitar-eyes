# Procedural Timbre Quality Foundation Result

Date: July 31, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/procedural-timbre-quality-foundation`

Exact verified application source: `b3d9f39de3900c0065875451bc2a90531226c707`

Inherited accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Hosted identity: `Guitar Eyes procedural timbre quality proof 1H`

## Owner finding that opened the checkpoint

The accepted current-position audition appeared to produce correct pitch, but the tone sounded poor and toy-like. That finding made timbre quality a prerequisite for judging later measure playback, chords, and timing.

## Implemented boundary

The checkpoint changes only the project-owned procedural audio rendering and its verification surface.

Implemented changes:

1. a smoothed, bounded string excitation instead of exposing raw broadband noise as the dominant pluck;
2. a brief controlled pick transient;
3. pluck-position comb shaping;
4. lower-string profiles that are darker and decay longer than higher strings;
5. higher-string profiles that retain pitch clarity with bounded brightness;
6. one pitch-sensitive low-pass tone filter per pitched voice when native biquad filters are available;
7. a restrained native body-response chain using high-pass, broad resonant, and low-pass filters;
8. a no-biquad browser fallback;
9. conservative chord gain scaling while retaining one shared onset;
10. controlled explicit-muted-string noise;
11. deterministic tests for timbre profiles, buffer shaping, filter topology, simultaneous chord onset, gain staging, fallback behavior, and disposal.

The checkpoint does not change:

- semantic pitch, tuning, fret, duration, measure, or source-format authority;
- Previous, Read current, Next, then Audition control order;
- the accepted two-second delay;
- first-audition focus recovery;
- quiet navigation or current-position state;
- importers or supported formats;
- measure playback, full playback, looping, transport controls, teacher mode, scoring, or AI work.

No sample, soundfont, MIDI playback, alphaSynth, third-party playback library, AudioWorklet, network audio asset, or new dependency was introduced by this checkpoint.

## Verification history

### Initial exact-source run

Run: `30672390655`

The source, complete test suite, and production build passed. The final artifact assertion failed because it searched the entire inherited application for the string `AudioWorklet` and found a pre-existing alphaTab-related marker in an unchanged inherited bundle.

That failure was classified as an overbroad gate assertion, not a timbre-source defect. The timbre source was left unchanged.

### Corrected boundary run

Run: `30672496206`

The corrected gate established that dependency manifests and inherited worker sources were unchanged and that the timbre source contained no forbidden playback dependency or asset marker. The complete suite, build, and compiled boundary passed.

### Final 1H source run

Run: `30672650660`

Results:

1. exact source identity passed;
2. accepted application and integrated-line ancestry passed;
3. exact eight-file checkpoint boundary passed;
4. dependency manifests and inherited worker sources remained unchanged;
5. 41 of 41 test suites passed;
6. 253 of 253 tests passed;
7. optimized production build passed;
8. compiled 1H identity passed;
9. compiled timbre contracts passed;
10. accepted reader and audition contracts passed;
11. no new sample or soundfont asset was emitted;
12. repository cleanliness passed.

Built artifact hashes:

- `build/index.html`: `b65eece92bf80faeb1d42f37232010e96ae5fe4df931b426f72d5c608ab53fde`
- primary JavaScript: `c52188a25d61b27bcfbd2649beeb4fd2ec42f1736d2ac6edd47cc5168b470919`

## Publication

Publication run: `30672750585`

Hosted address:

`https://blindanatomist.github.io/guitar-eyes/`

The publisher:

1. checked out exact source `b3d9f39de3900c0065875451bc2a90531226c707`;
2. built for `/guitar-eyes/`;
3. verified the 1H static title and first heading;
4. verified the 1H runtime identity and audition contracts;
5. verified that the Pages artifact contained no new sample or soundfont files;
6. deployed successfully;
7. read back the live HTML and primary JavaScript successfully;
8. confirmed the live timbre, reader, and new-audio-asset boundaries.

Fork `main` was restored immediately afterward and independently verified identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`, with zero commits ahead, zero behind, and zero changed files.

`Phlypper/guitar-eyes` remained untouched.

## Required owner listening checkpoint

The candidate is technically verified but not yet musically accepted.

The owner should judge on a real iPhone:

1. whether single notes sound materially less toy-like than the prior proof;
2. whether low and high strings sound distinguishable without losing pitch clarity;
3. whether a chord remains simultaneous and sounds less harsh or overloaded;
4. whether the two-second delay remains correct;
5. whether first and later audition focus remain stable;
6. whether navigation still stops prior sound quietly.

The owner may still judge the tone unacceptable. A passing source gate cannot establish musical credibility.

## State

State: `verified hosted candidate; owner listening required`.

Do not begin measure or bar playback until this timbre checkpoint is accepted, revised, or explicitly deferred by the owner.

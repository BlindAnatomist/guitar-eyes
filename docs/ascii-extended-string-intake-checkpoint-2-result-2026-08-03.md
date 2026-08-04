# ASCII Extended-String Intake Checkpoint 2 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake-2`

Parent record head: `592afad9bf55dd7eaf4e4713d2c5895aee4d7f9b`

Accepted format-only source in ancestry: `aca0cd79cc274ea598cc9e67c26e13e41e61011a`

Verified engine source: `4b3e89ba068db36a364cb824ccd1cc513f3734cf`

Accepted hosted application source: `030e1f6af2de23e41ad993ab0292893b072664eb`

State: `passed`

## Implemented bounded support

The existing shared ASCII importer now supports two additional exact standard profiles:

1. eight-string guitar, high-to-low `E4 B3 G3 D3 A2 E2 B1 F#1`;
2. six-string bass, high-to-low `C3 G2 D2 A1 E1 B0`.

Every string must carry the expected octave. Alternate tunings, incomplete octave evidence, altered octave profiles, and string count without matching pitch evidence remain unsupported.

Eight-string guitar remains within `Guitar family`. Six-string bass is detected as `Bass family` and may update the family selector automatically when Guitar family was selected.

## Preserved format-only boundary

The checkpoint preserves the accepted 4B iPhone surface:

1. Previous position;
2. Read current position;
3. Next position;
4. position description and count;
5. block navigation when applicable;
6. parsing notes;
7. Files-picker focus recovery.

No playback module, sampled asset, WAV file, sound-delay control, audition control, position-audio group, playback instruction, dependency, or workflow entered the feature source.

## Additional safety repair

A six-line bass-shaped file could otherwise be considered by the permissive custom six-string guitar profile. The coordinator now resolves a recognized strict profile's missing or incorrect octave evidence before permissive custom-guitar fallback.

This does not create a new parser or inference path. It prevents exact strict-profile label sequences from being silently reinterpreted as another instrument family when their required octave evidence is absent or wrong.

## First exact gate and classified failure

Initial exact source: `733d5d33af7733874ea9005d1d81f665574af687`

Initial run: `30848820279`

Authority, accepted ancestry, the exact ten-file boundary, fixture provenance, and dependency installation passed. The suite then reported 2 failures out of 260 tests; build correctly did not run.

Both failures were errors in the new adversarial specimens, not importer failures:

1. an altered eight-string specimen changed `F#1` to `F1`, so it no longer presented the exact strict-profile label sequence and safely failed earlier as an incomplete profile;
2. a six-string bass specimen changed `C3` to `C2`, which broke high-to-low pitch order and safely failed earlier with `UNSAFE_TUNING_ORDER`.

All inherited suites passed, both malformed files were rejected, and no retry was performed against the failed source.

## Test-specimen correction

The eight-string adversarial case now uses `F#0`: exact pitch labels and safe descending order remain, but the octave profile is wrong.

The six-string bass adversarial case now uses `C4`: exact pitch labels and safe descending order remain, but the octave profile is wrong.

Both therefore isolate the intended `UNVERIFIED_TUNING_PROFILE` contract.

Corrected exact source: `4b3e89ba068db36a364cb824ccd1cc513f3734cf`

## Successful complete source verification

Corrected full run: `30849057454`

Results before artifact inspection:

1. exact source and both accepted ancestors passed;
2. exact ten-file boundary passed;
3. CC0 fixture provenance passed;
4. dependency installation passed;
5. 42 of 42 test suites passed;
6. 260 of 260 tests passed;
7. production build passed.

The final artifact step then stopped because it searched raw JSX source for a sentence that was wrapped across a line break. This was an inspection-script whitespace defect, not an application, test, or build failure.

## Successful narrow verification resume

Resume run: `30849204905`

The same immutable source was checked again. The workflow did not repeat the complete suite. It performed:

1. exact authority and ten-file boundary recheck;
2. focused checkpoint and format-only regression tests;
3. one production rebuild;
4. whitespace-normalized help-contract inspection;
5. extended-profile inspection;
6. format-only build inspection;
7. sampled-audio asset exclusion.

All resume steps passed.

## Successful format-only publication

Publication source: `030e1f6af2de23e41ad993ab0292893b072664eb`

Publication run: `30849520264`

Hosted identity:

`Guitar Eyes format-only extended-string ASCII intake proof 4C`

The publication boundary contained only:

1. this result record;
2. `public/index.html`;
3. `src/buildIdentity.test.js`;
4. `src/checkpointBuildIdentity.test.js`.

Publication results:

1. exact four-file publication boundary passed;
2. focused build-identity, checkpoint, and format-only tests passed;
3. production Pages build passed;
4. exact static identity and format-only flag passed;
5. compiled eight-string guitar and six-string bass profiles passed;
6. Low F sharp and High C spoken identities passed;
7. sampled Iowa assets remained absent;
8. GitHub Pages deployment passed;
9. hosted HTML identity read-back passed;
10. hosted JavaScript profile read-back passed.

## Successful real-iPhone acceptance

The owner tested the hosted 4C proof on a real iPhone with Safari, VoiceOver, and the iPhone Files picker.

The exact report was:

> That worked everything was fine. Focus was good. The tuning was accurate so like I said it all worked.

Within the bounded test, this accepts:

1. Files-picker focus recovery;
2. complete eight-string guitar reading;
3. complete six-string bass reading;
4. correct Guitar/Bass family behavior;
5. accurate exact-standard tuning representation;
6. quarter-note duration and semantic position behavior;
7. continued absence of playback and audition controls.

Detailed record:

- `docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md`.

## Final verdict

ASCII Extended-String Intake Checkpoint 2 is passed and closed.

The accepted application source is:

`030e1f6af2de23e41ad993ab0292893b072664eb`

Documentation-only closure commits do not replace that application source.

The checkpoint does not establish arbitrary eight-string guitar tuning, arbitrary six-string bass tuning, missing-octave inference, another instrument family, another file format, playback, realistic timbre, or teacher mode.

## Repository restoration

The temporary verification and publication workflows existed only on fork `main` and checked out immutable feature sources. After each successful operation, fork `main` was restored and independently verified identical to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

The final comparison showed zero commits ahead, zero behind, and zero changed files.

No pull request, merge, upstream modification, playback reopening, or teacher-mode work occurred.
# ASCII Extended-String Intake Checkpoint 1 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake`

Clean parent: `e665644a3b404691e34e288b210c47624f4c1b6e`

Accepted application source in ancestry: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Verified engine source: `3a6f44eeae7a8c9f19abff19c1cfd714f07a2164`

Superseded hosted source: `88aa0c2cf60d2eedf2bb419292e5679e9862e3fe`

Accepted format-only source: `aca0cd79cc274ea598cc9e67c26e13e41e61011a`

## Implemented bounded support

The shared ASCII importer now supports:

1. exact standard seven-string guitar labeled high-to-low `E4 B3 G3 D3 A2 E2 B1`;
2. exact standard five-string bass labeled high-to-low `G2 D2 A1 E1 B0`.

Every string must carry the expected octave. Custom extended-string tunings, incomplete octave evidence, and other string counts remain unsupported.

The Guitar and Bass selector remains a family preference. Seven-string guitar remains within `Guitar family`; five-string bass is automatically detected and changes the selector from `Guitar family` to `Bass family` when necessary. No third selector state, second parser, second semantic model, or second timing model was added.

## Preserved semantic behavior

The new profiles reuse the accepted semantic document, desktop projection, iPhone reader, rhythm mapping, measure model, position description, file-picker focus recovery, and semantic navigation.

The importer preserves:

1. exact string count;
2. exact instrument label;
3. high-to-low string order;
4. tuning and octave evidence;
5. explicit High E, Low E, and Low B identities where applicable;
6. frets, open strings, mutes, techniques, rhythm, measures, warnings, and original spatial rows.

The two project-authored fixtures contain one explicit quarter-note open-string chord position so semantic intake, duration, string identity, and family detection can be verified without guessed timing.

Playback and audition remain outside this checkpoint. Existing playback modules were not redesigned or deleted, but the accepted format-only page does not render the sound-delay selector, audition button, position-audio group, sound explanation, audition status, or historical audition proof label.

## First exact gate and classified failure

Initial exact source: `8c8897b93fb178aebd4caa4f4c8c6a79842539a1`

Initial run: `30844309087`

The initial run passed source authority and dependency installation, then failed 4 of 251 tests across 3 suites. Build and compiled inspection correctly did not run.

The failures were classified before correction:

1. one coordinator defect allowed an incomplete five-line six-string guitar fragment to be diagnosed as five-string bass missing octave evidence merely because the line count was divisible by five;
2. the application-shell test still required seven-string rejection;
3. the real-world corpus tests still required seven-string and five-string rejection.

No retry was performed against the failed source.

## Correction

The coordinator now emits an extended-profile-specific error only when complete segments also match that profile's exact standard tuning-label sequence. This preserves the inherited `INCOMPLETE_TABLATURE_BLOCK` diagnosis for ordinary incomplete guitar material.

The obsolete rejection tests were converted into positive bounded-support tests. The selector now says `Guitar family` and `Bass family`, and help text states the exact extended-string octave requirement without overclaiming support.

## Successful engine gate

Corrected exact source: `3a6f44eeae7a8c9f19abff19c1cfd714f07a2164`

Corrected run: `30844796686`

Status context: `guitar-eyes/ascii-extended-string-intake`

Results:

1. accepted-source ancestry passed;
2. clean-continuation ancestry passed;
3. exact twelve-file boundary passed;
4. sampled-audio, Iowa, WAV, workflow, dependency, reader-component, focus-component, timing-engine, and playback-engine exclusions passed;
5. dependency installation passed;
6. 40 of 40 test suites passed;
7. 251 of 251 tests passed;
8. production build passed;
9. compiled seven-string and five-string profiles passed;
10. compiled missing-octave and unverified-profile errors passed;
11. compiled Low B identity passed;
12. compiled Guitar-family and Bass-family selector wording passed;
13. compiled help contract passed;
14. compiled semantic reader controls passed;
15. sampled Iowa assets were absent from the build.

Evidence artifact: `8868244463`, retained for one day by policy.

The build retained one inherited ESLint warning in `src/compressedMusicXmlImporter.js` concerning control characters in a regular expression. This checkpoint did not modify that file, and the warning did not prevent the production build.

## Superseded 4A publication

Publication source `88aa0c2cf60d2eedf2bb419292e5679e9862e3fe` produced the hosted identity:

`Guitar Eyes extended-string ASCII intake proof 4A`

The application passed automated verification and publication, but the hosted reader still exposed inherited playback controls. The user correctly rejected that as a violation of the format-only boundary. The 4A page is superseded and is not an accepted real-device checkpoint.

## Format-only correction

The accepted page activates an explicit format-only surface. It preserves:

1. Previous position;
2. Read current position;
3. Next position;
4. current-position description;
5. position count;
6. block navigation when applicable;
7. parsing notes;
8. VoiceOver picker-return focus.

It omits from the rendered and accessibility trees:

1. Sound delay;
2. Audition current position;
3. Position audio;
4. guitar-sound explanatory copy;
5. audition status;
6. historical audition proof labels.

A dedicated regression test fails if any omitted playback surface returns while format-only mode is active.

Accepted format-only source: `aca0cd79cc274ea598cc9e67c26e13e41e61011a`

Hosted identity:

`Guitar Eyes format-only extended-string ASCII intake proof 4B`

## Successful 4B gate and publication

Initial 4B run `30846704243` passed the complete suite and production build, then stopped before deployment because the publication workflow expected the unminified source string `window.GUITAR_EYES_FORMAT_ONLY = true;` in built HTML. The minifier removed spaces. This was an inspection-script defect, not an application defect.

The inspection was corrected to require the durable `GUITAR_EYES_FORMAT_ONLY` token while source tests continued to prove assignment to `true`.

Successful publication run: `30846839893`

Status context: `guitar-eyes/ascii-format-only-4b`

Results:

1. exact source and six-file correction boundary passed;
2. no Iowa, WAV, sampled-audio asset, or workflow entered the feature source;
3. 41 of 41 test suites passed;
4. 252 of 252 tests passed;
5. the dedicated format-only surface test passed;
6. production Pages build passed;
7. minifier-safe artifact inspection passed;
8. sampled Iowa assets were absent;
9. GitHub Pages deployment passed;
10. hosted identity read-back passed.

## Real-iPhone VoiceOver acceptance

Real-device test date: August 3, 2026.

Device and access mode: iPhone with VoiceOver.

User-reported results:

1. file-picker return focus was correct;
2. the audition button, sound-delay selector, and all other playback-mode surfaces were absent;
3. the seven-string guitar fixture read all seven strings;
4. the five-string bass fixture read all five strings;
5. seven-string guitar correctly remained within `Guitar family`, so the family selector did not need to change;
6. five-string bass was detected automatically and changed the selector to `Bass family` without manual intervention.

Real-device acceptance verdict: passed.

## Repository restoration

Every temporary verification or publication workflow existed only on fork `main` as a trigger and checked out an immutable feature source.

After successful publication, fork `main` was restored and independently verified identical to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

The comparison showed zero commits ahead, zero behind, and zero changed files.

No pull request, merge, upstream modification, sampled-audio reopening, or teacher-mode implementation occurred.

## Checkpoint status

ASCII Extended-String Intake Checkpoint 1 is automated-test accepted, production-build accepted, hosted-read-back accepted, and real-iPhone VoiceOver accepted.

The accepted scope is exact octave-qualified standard seven-string guitar and five-string bass ASCII through the shared semantic readers, with a format-only iPhone surface. Playback remains sealed and deferred.

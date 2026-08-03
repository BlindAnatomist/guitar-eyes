# ASCII Extended-String Intake Checkpoint 1 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake`

Clean parent: `e665644a3b404691e34e288b210c47624f4c1b6e`

Accepted application source in ancestry: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Verified engine source: `3a6f44eeae7a8c9f19abff19c1cfd714f07a2164`

## Implemented bounded support

The shared ASCII importer now supports:

1. exact standard seven-string guitar labeled high-to-low `E4 B3 G3 D3 A2 E2 B1`;
2. exact standard five-string bass labeled high-to-low `G2 D2 A1 E1 B0`.

Every string must carry the expected octave. Custom extended-string tunings, incomplete octave evidence, and other string counts remain unsupported.

The Guitar and Bass selector remains a family preference. No third selector state, second parser, second semantic model, second timing model, or sampled-audio dependency was added.

## Preserved semantic behavior

The new profiles reuse the accepted semantic document, desktop projection, iPhone reader, rhythm mapping, measure model, position description, playback timeline, procedural current-position audition, file-picker focus recovery, two-second sound delay, and first-audition focus repair.

The importer preserves:

1. exact string count;
2. exact instrument label;
3. high-to-low string order;
4. tuning and octave evidence;
5. explicit High E, Low E, and Low B identities where applicable;
6. frets, open strings, mutes, techniques, rhythm, measures, warnings, and original spatial rows.

The two project-authored fixtures now contain one explicit quarter-note open-string chord position so semantic intake, timing, and procedural pitch derivation can be verified without guessed duration.

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

## Successful corrected gate

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
14. compiled accepted reader controls passed;
15. sampled Iowa assets were absent from the build.

Evidence artifact: `8868244463`, retained for one day by policy.

The build retained one inherited ESLint warning in `src/compressedMusicXmlImporter.js` concerning control characters in a regular expression. This checkpoint did not modify that file, and the warning did not prevent the production build.

## Repository restoration

The temporary verification workflow existed only on fork `main` as a trigger. After the corrected run completed, fork `main` was restored and independently verified identical to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, upstream modification, sampled-audio reopening, teacher-mode implementation, or deployment occurred during the verification checkpoint.

## Remaining acceptance boundary

Automated and production-build verification is complete. A uniquely identified hosted candidate and bounded real-iPhone test remain required before this format support can be treated as real-device accepted.

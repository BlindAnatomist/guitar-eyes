# ASCII Extended-String Intake Checkpoint 2 — Real-iPhone Acceptance

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake-2`

Accepted hosted application source: `030e1f6af2de23e41ad993ab0292893b072664eb`

Hosted proof identity: `Guitar Eyes format-only extended-string ASCII intake proof 4C`

Publication run: `30849520264`

## Device and surface

The owner tested the hosted proof on a real iPhone using Safari, VoiceOver, and the iPhone Files picker.

The bounded acceptance used the project-authored CC0 fixtures for:

1. exact standard eight-string guitar, high-to-low `E4 B3 G3 D3 A2 E2 B1 F#1`;
2. exact standard six-string bass, high-to-low `C3 G2 D2 A1 E1 B0`.

The hosted surface remained the accepted format-only reader. Playback, audition, sampled audio, sound-delay controls, and position-audio controls were outside this test.

## Owner result

The owner's exact report was:

> That worked everything was fine. Focus was good. The tuning was accurate so like I said it all worked.

## Accepted findings

This report establishes, within the bounded test:

1. Files-picker return focus was good;
2. the eight-string guitar fixture loaded successfully;
3. the six-string bass fixture loaded successfully;
4. the exact checkpoint tunings were represented accurately;
5. the Guitar/Bass family behavior worked as presented;
6. the semantic reader output was accepted as complete and correct for both fixtures;
7. the format-only surface did not expose the retired playback or audition controls.

The report does not establish arbitrary eight-string guitar tuning, arbitrary six-string bass tuning, missing-octave inference, additional instrument families, full playback, realistic timbre, teacher mode, or support for another file format.

## Verdict

ASCII Extended-String Intake Checkpoint 2 passed automated verification, production build, hosted publication, live asset read-back, and real-iPhone VoiceOver acceptance.

The accepted application source remains:

`030e1f6af2de23e41ad993ab0292893b072664eb`

Documentation-only closure commits do not replace that application source.

No pull request, merge, upstream modification, playback reopening, teacher-mode work, or additional format work was authorized or performed.
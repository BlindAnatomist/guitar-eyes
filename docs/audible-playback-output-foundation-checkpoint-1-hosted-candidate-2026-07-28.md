# Audible Playback Output Foundation Checkpoint 1 Hosted Candidate

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/audible-playback-output-foundation`

Exact application source: `4b6b2bedafa42044639606d373c72f46711d6cf8`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## State

State: `hosted-candidate-pending-real-iphone`

The bounded audible current-position proof has passed exact-source automated verification, production build, and GitHub Pages deployment. Real-iPhone Safari and VoiceOver acceptance remains required before the checkpoint can close.

## Accepted candidate scope

The candidate:

1. derives one position's pitch events from the accepted semantic tablature document and Playback Timing Foundation 1 timeline;
2. supports exact accepted standard six-string guitar and four-string bass tuning profiles;
3. uses explicit tuning MIDI or tuning-plus-octave evidence when present;
4. rejects custom tuning without octave evidence rather than guessing;
5. treats a chord as one onset with one event per played string;
6. preserves a semantic rest as a silent timed outcome;
7. represents an explicit muted note as a short non-pitched event;
8. creates project-owned procedural plucked-string buffers at runtime through native Web Audio;
9. creates or resumes the audio context only after explicit activation;
10. adds one stable `Audition current position` action after `Read current position` and before `Next position`;
11. stops the prior audition before repeated activation or reader movement;
12. does not move the current semantic position or VoiceOver focus;
13. keeps audition status separate from the full-position announcement channel;
14. imports no sample, soundfont, alphaSynth player, AudioWorklet, renderer worker, or third-party playback library.

## Exact verification

Successful workflow run: `30388269269`

Workflow context: `guitar-eyes/audible-playback-output-foundation-1`

Every gate passed:

1. exact source checkout;
2. exact-source confirmation;
3. exact dependency installation;
4. complete inherited and new automated suite;
5. production Pages build;
6. Pages artifact configuration and upload;
7. exact candidate deployment;
8. one-day log retention;
9. source-success status recording.

The preserved log reports:

- 35 of 35 test suites passed;
- 226 of 226 tests passed;
- zero snapshot failures;
- production build compiled successfully;
- main JavaScript bundle: `main.23ac467f.js`;
- inherited lazy Guitar Pro chunks remained separated;
- deployment proceeded only after the honest test and build exits passed.

## Corrected execution failures

Earlier workflow labels were not accepted as evidence because `npm test` and `npm run build` had been piped through `tee` without `set -o pipefail`. This could report a successful shell step even when Jest or Create React App failed.

The preserved honest logs then identified and bounded the actual source defects:

1. one reader regression asserted the audition status before the asynchronous React update committed;
2. two stale build-identity tests still expected earlier Guitar Pro proof labels;
3. `globalThis` violated the repository's ESLint browser environment.

The accepted source repairs:

1. wait for the committed audition status;
2. replace the public and test build identity with `Audible current-position procedural plucked-string proof 1A`;
3. use the browser `window` object for native AudioContext constructor lookup.

A separate artifact-name scan also incorrectly rejected the inherited lazy alphaTab Guitar Pro decoder worker. That worker was already accepted and unchanged. New-feature resource boundaries must therefore be established from the exact source diff and protected-file comparison, not by banning inherited resources by broad filename patterns.

## Repository authority

After successful deployment, fork `main` was restored exactly to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison established:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

`Phlypper/guitar-eyes` remained untouched.

No pull request, merge, Netlify deployment, production infrastructure, or paid service was used.

## Hosted candidate

Preview address:

`https://blindanatomist.github.io/guitar-eyes/?audible-proof=4b6b2bedafa42044639606d373c72f46711d6cf8`

Expected first heading:

`Test build: Audible current-position procedural plucked-string proof 1A.`

Accepted test fixture:

`fixtures/real-world/musicxml-chord-rest-two-measures.musicxml`

The fixture is project-authored, CC0-1.0, and previously accepted for MusicXML chord-and-rest intake.

## Bounded real-iPhone acceptance

John must establish only the following tested sequence:

1. the exact audible 1A build identity is present;
2. the MusicXML fixture loads and focus returns correctly;
3. position 1 auditions two pitched strings at one perceived onset;
4. VoiceOver remains on `Audition current position` and the reader remains at position 1;
5. repeated activation replaces the prior audition without moving focus or position;
6. `Next position` moves quietly to the timed rest;
7. auditioning the rest produces no pitched sound and reports `Current position is a rest. No pitched sound was played.`;
8. `Read current position` remains the only action that speaks the complete musical instruction.

Record the owner's exact result without strengthening it.

## Deferred

This candidate does not establish full-document playback, Play/Pause/Stop transport, automatic progression, looping, count-in, metronome, source tempo extraction, repeat expansion, realistic guitar or bass timbre, technique-specific synthesis, teacher mode, bookmarks, practice scoring, or additional format support.

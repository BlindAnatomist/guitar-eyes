# Audible Playback Output Foundation 1B Result and 1C Repair

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/audible-playback-output-foundation`

Verified 1B source: `0017317c20fcef793c5f7a2284f40346b5f0b77b`

Verified 1C application source: `d75ae5707c380700d240d79c1b02e70142a34e3b`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner result for hosted proof 1B

Tester: John Darrin Washburn

Device and access path: real iPhone Safari with VoiceOver

Owner report:

> Voiceover is still talking over the sound of the guitar Plex because it's not only speaking when I put my finger on that button, but it also repeats it after I press the button so I find audition and it says I found it you know when I get to it when I swipe to it and land on that button, it announces the name of that button, but then when I press it, it says the name of that button again and while it's doing that, it's covering up the sound of the guitar

## Result boundary

The 1B checkpoint did not pass the sound-separation requirement.

The remaining defect was not application live-region speech. VoiceOver announced the button name when focus landed on `Audition current position`, then repeated the button name after activation. The fixed 650-millisecond audio onset delay was too short to outlast that activation echo at John's configured VoiceOver speech rate.

The browser application has no reliable event that reports when VoiceOver has finished speaking. Another universal guessed delay would therefore remain fragile across users and speech-rate settings.

## Bounded 1C repair

Exact verified application source: `d75ae5707c380700d240d79c1b02e70142a34e3b`

The repair:

1. adds a persistent `Sound delay after activation` selector immediately before the position controls;
2. offers one-, two-, three-, and four-second intervals;
3. defaults to two seconds;
4. explains that the interval should be long enough for VoiceOver to finish repeating the button name before guitar sound begins;
5. creates the native Web Audio context during the explicit user activation, preserving iPhone audio authorization;
6. schedules every pitched or muted source at the selected later onset;
7. preserves one identical onset for every voice in a chord;
8. disposes any existing auditioner when the selected delay changes so the next activation uses the new interval;
9. leaves successful audition status as ordinary non-live text;
10. preserves immediate dedicated announcement of rests and errors because no guitar sound competes with those messages;
11. preserves quiet Previous and Next movement and dedicated full speech through `Read current position`;
12. advances the unique build identity to `Audible current-position VoiceOver-clearance proof 1C`.

## Verification

Successful workflow run: `30392435526`

Workflow context: `guitar-eyes/audible-playback-output-foundation-1c`

The honest exact-source gate passed:

1. exact source checkout and confirmation;
2. exact dependency installation;
3. 37 of 37 automated suites;
4. 231 of 231 automated tests;
5. zero snapshot failures;
6. optimized production build;
7. GitHub Pages artifact upload and deployment;
8. source-success status recording.

The deployed Pages artifact contains:

- static heading `Test build: Audible current-position VoiceOver-clearance proof 1C.`;
- main bundle `main.dca9b356.js`;
- the `Sound delay after activation` control and its four options;
- the accepted lazy Guitar Pro decoder chunks;
- no added sound samples, soundfonts, AudioWorklet, alphaSynth player, renderer, or third-party playback dependency.

## Repository authority

After deployment, fork `main` was restored exactly to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison established identical state, zero commits ahead, zero behind, and zero changed files.

No pull request, merge, upstream change, Netlify deployment, production infrastructure, or paid service was used.

## Hosted 1C candidate

Preview address:

`https://blindanatomist.github.io/guitar-eyes/?audible-proof-1c=d75ae5707c380700d240d79c1b02e70142a34e3b`

Expected first heading:

`Test build: Audible current-position VoiceOver-clearance proof 1C.`

Use the accepted fixture:

`fixtures/real-world/musicxml-chord-rest-two-measures.musicxml`

## Remaining bounded real-iPhone gate

John must establish only:

1. the fixture begins at overall position 1;
2. the selector defaults to two seconds and exposes one-, two-, three-, and four-second choices;
3. auditioning position 1 still produces two simultaneous plucked strings;
4. at one of the available delay settings, VoiceOver finishes its activation echo before the guitar sound begins;
5. changing the delay does not move reader position or VoiceOver focus away from the workflow;
6. Next moves quietly to the rest;
7. auditioning the rest produces no pitched sound and speaks `Current position is a rest. No pitched sound was played.`;
8. `Read current position` remains the only action that speaks the complete musical instruction.

Record the owner's exact result without strengthening it. Do not close Audible Playback Output Foundation 1 until this exact gate passes.

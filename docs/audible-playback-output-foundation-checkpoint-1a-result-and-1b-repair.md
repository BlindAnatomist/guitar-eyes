# Audible Playback Output Foundation 1A Result and 1B Repair

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/audible-playback-output-foundation`

Accepted 1A application source: `4b6b2bedafa42044639606d373c72f46711d6cf8`

Verified 1B application source: `0017317c20fcef793c5f7a2284f40346b5f0b77b`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner result for hosted proof 1A

Tester: John Darrin Washburn

Device and access path: real iPhone Safari with VoiceOver

Owner report:

> OK, it loaded the file and for some reason it didn't start at the first position. It started on the second position the rest before I had hit any button, but it worked. I was able to move back to the first position and all the way through I was able to audition and hear the guitar being plucked in the first position where it was playing two strings at the same time, it sounded like they were being played simultaneously rather than one after the other on the second position where there was the rest nothing was played didn't let me know that there was a rest there and then in the next position, it played just one string when I auditioned it next and previous moved through the different positions and it was only the read current position that actually told you what to play. I think that voiceover stepped on the guitar Plex. I could hear them, but voiceover was still finishing what it was saying when that happened now depending on how fast somebody has their voice over going that may not be an issue but at least at the speed that I have my voiceover set at voiceover wasn't done talking when those guitar lux were done.

## Result boundary

The 1A proof established only these owner-observed successes:

1. the MusicXML file loaded;
2. John could return to position 1 and navigate through all positions;
3. the first position produced two audible plucked strings perceived as simultaneous rather than sequential;
4. the rest produced no pitched sound;
5. the following position produced one audible string;
6. Previous and Next moved through the positions;
7. Read current position remained the action that spoke what to play.

The checkpoint did not pass because:

1. the newly loaded document presented position 2 before John activated any reader control;
2. auditioning the rest did not provide the expected spoken rest result;
3. VoiceOver speech overlapped the short plucked-string sound at John's configured speech rate.

## Confirmed causes

1. `IPhoneTabReader` remained mounted while the application temporarily supplied `null` during a new upload. Its prior `currentIndex` state could therefore be used during the first render of the newly loaded document before the ordinary document-change effect reset the index.
2. Successful audition text used `role="status"`, causing VoiceOver speech to compete with the sound that was itself intended to confirm success.
3. Plucked voices began only 10 milliseconds after activation, leaving no deliberate separation from VoiceOver's button speech.
4. Rest and error outcomes shared the same status mechanism rather than using the dedicated announcement channel that reliably repeats semantic speech.

## Bounded 1B repair

Exact verified source: `0017317c20fcef793c5f7a2284f40346b5f0b77b`

The repair:

1. resolves a changed document to position index zero during render, before the document-reset effect runs;
2. clamps retained indexes safely if a document has fewer positions;
3. removes the live-region role from successful audible status text;
4. keeps successful audible status available as ordinary persistent text without speaking it automatically;
5. sends rests and audition errors through the existing dedicated polite announcement channel because no guitar sound competes with those messages;
6. clears stale audition and announcement state during quiet navigation;
7. delays every pitched or muted onset by 650 milliseconds after activation;
8. preserves one identical onset for every voice in a chord;
9. advances the unique hosted identity to `Audible current-position procedural plucked-string proof 1B`.

## Verification

Successful run: `30390882279`

Workflow context: `guitar-eyes/audible-playback-output-foundation-1b`

The honest gate passed:

1. exact-source checkout and confirmation;
2. exact dependency installation;
3. 35 of 35 automated suites;
4. 227 of 227 automated tests;
5. zero snapshot failures;
6. production build;
7. GitHub Pages artifact upload and deployment;
8. source-success status recording.

The production build retained the accepted lazy Guitar Pro importer chunks and introduced no audio samples, soundfonts, AudioWorklet, alphaSynth player, renderer, or third-party playback dependency.

## Repository authority

After publication, fork `main` was restored exactly to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, upstream change, Netlify deployment, production infrastructure, or paid service was used.

## Hosted 1B candidate

Preview address:

`https://blindanatomist.github.io/guitar-eyes/?audible-proof-1b=0017317c20fcef793c5f7a2284f40346b5f0b77b`

Expected first heading:

`Test build: Audible current-position procedural plucked-string proof 1B.`

Use the same accepted fixture:

`fixtures/real-world/musicxml-chord-rest-two-measures.musicxml`

## Remaining bounded real-iPhone gate

John must establish only:

1. after loading the fixture, the reader begins at overall position 1 rather than the rest at position 2;
2. auditioning position 1 still produces two simultaneous plucked strings;
3. VoiceOver does not automatically speak a successful-audition status over the pluck;
4. the 650-millisecond post-activation pause gives VoiceOver enough separation at John's configured speech rate;
5. Next moves quietly to the rest;
6. auditioning the rest produces no pitched sound and speaks `Current position is a rest. No pitched sound was played.`;
7. Read current position remains the only action that speaks the complete musical instruction.

Do not close Audible Playback Output Foundation 1 until this exact real-iPhone gate passes.

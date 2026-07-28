# Audible Playback Output Foundation 1C Result and 1D Repair

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/audible-playback-output-foundation`

Verified 1C application source: `d75ae5707c380700d240d79c1b02e70142a34e3b`

Verified 1D application source: `50aceaba4b03ff65bf40d6d63eff75a5e110340f`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner result for hosted proof 1C

Tester: John Darrin Washburn

Device and access path: real iPhone Safari with VoiceOver

Owner report:

> Two seconds was enough one second wasn't enough time but two seconds worked. If that button is going to stay where you can adjust how many seconds, then you need to know that as I was swiping through, and I came across that that button the button said the same thing as the explanation that followed it, which made it confusing because it only told me which was the button and which was the description of the button at the end so as I'm swiping through the first thing I came to was the button, but and then, if I kept swiping to the right, it's the description of what the button did but again the button itself also had that information so that was confusing

## Result boundary

The 1C proof established:

1. one second was not enough VoiceOver-clearance time for John's speech rate;
2. two seconds was enough;
3. the adjustable delay mechanism worked;
4. the delay selector's accessible name and following explanatory paragraph were confusing because the selector inherited the paragraph through `aria-describedby` and the paragraph then appeared again as the next swipe item.

The checkpoint did not close because the delay-control reading order and accessible naming still required real-device repair.

## Confirmed cause

The native select was labelled `Sound delay after activation` and also referenced the following help paragraph through `aria-describedby`. VoiceOver therefore appended the full help sentence while encountering the control and then presented the same help paragraph again as the next separate reading item.

## Bounded 1D repair

Exact verified application source: `50aceaba4b03ff65bf40d6d63eff75a5e110340f`

The repair:

1. shortens the selector label to `Sound delay`;
2. removes `aria-describedby` from the selector;
3. preserves the selected value and native pop-up-button semantics;
4. leaves the explanatory sentence as one separate paragraph immediately after the selector;
5. preserves the accepted two-second default and all one-, two-, three-, and four-second choices;
6. preserves the accepted audio scheduling, rest announcement, quiet movement, and Read-current contracts;
7. advances the unique hosted identity to `Audible current-position delay-control clarity proof 1D`.

## Verification

Successful workflow run: `30393602496`

Workflow context: `guitar-eyes/audible-playback-output-foundation-1d`

The exact-source gate passed:

1. exact source checkout and confirmation;
2. exact dependency installation;
3. complete automated suite;
4. optimized production build;
5. GitHub Pages artifact upload and deployment;
6. source-success status recording.

## Repository authority

After publication, fork `main` was restored exactly to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, upstream change, Netlify deployment, production infrastructure, or paid service was used.

## Hosted 1D candidate

Preview address:

`https://blindanatomist.github.io/guitar-eyes/?audible-proof-1d=50aceaba4b03ff65bf40d6d63eff75a5e110340f`

Expected first heading:

`Test build: Audible current-position delay-control clarity proof 1D.`

Use the accepted fixture:

`fixtures/real-world/musicxml-chord-rest-two-measures.musicxml`

## Remaining bounded real-iPhone gate

John must establish only:

1. the selector is announced concisely as `Sound delay`, its selected value, and its native control type;
2. the selector does not include the explanatory sentence in its own announcement;
3. one right swipe after the selector reaches the explanatory paragraph exactly once;
4. two seconds remains selected by default and still separates VoiceOver from the guitar sound;
5. the previously accepted position-one reset, simultaneous chord, rest announcement, quiet navigation, and Read-current behavior remain intact.

Do not close Audible Playback Output Foundation 1 until this exact gate passes.

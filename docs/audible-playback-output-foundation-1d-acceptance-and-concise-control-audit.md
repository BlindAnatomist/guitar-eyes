# Audible Playback Output Foundation 1D Acceptance and Concise-Control Audit

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/audible-playback-output-foundation`

Accepted 1D application source: `50aceaba4b03ff65bf40d6d63eff75a5e110340f`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner acceptance

Tester: John Darrin Washburn

Device and access path: real iPhone Safari with VoiceOver

Owner result:

> All of that worked,.

This closes the bounded 1D gate only for the tested behavior:

1. the static 1D identity was present;
2. the Sound delay selector exposed a concise control name and selected value;
3. its explanatory paragraph followed as one separate swipe item rather than being inherited into the selector;
4. two seconds remained sufficient to separate VoiceOver's activation echo from the plucked sound;
5. the accepted audible current-position behavior remained intact.

The earlier owner result established that one second was not sufficient at John's configured VoiceOver speech rate and two seconds was sufficient. Do not generalize that timing to every user; retain the adjustable one-, two-, three-, and four-second control with two seconds as the accepted default.

## Broader owner observation

The owner then reported:

> I have seen that in other parts of this app and in my Music vault app where the button also has the same description written into it as the description that follows when you keep swiping through just like we fixed with the number of seconds, it should wait to play guitar, but I've seen that in other places where it inherits that description in the button name or selector and then makes it confusing as you're swiping through because it keeps reading that description and the button name is either left out or at the very end of it.

## Confirmed mechanism

When a visible adjacent help paragraph is referenced through `aria-describedby`, VoiceOver can append the paragraph to the control's accessible description. The same paragraph then remains a separate item in ordinary swipe order. This can:

1. make the control identity arrive only after a long explanation;
2. repeat the same explanation on the following swipe;
3. blur the distinction between the actionable control and passive guidance;
4. make reverse navigation and orientation less predictable.

This is not a blanket prohibition on `aria-describedby`. Short, essential error or disambiguation text may still need a programmatic relationship. Long adjacent prose that is already independently available in swipe order should not automatically be inherited into a control when the control's label and current value are sufficient.

## Guitar Eyes audit

The interactive-component audit found two remaining instances of the same mechanism:

1. `Upload tablature file` inherited the adjacent file-format guidance paragraph;
2. the Guitar Pro track fieldset inherited the adjacent multi-track instruction paragraph.

No matching duplication was found in the accepted instrument selector, semantic readers, legacy desktop reader, column control, quiet position navigation, Read current position, or the accepted Sound delay selector.

## Bounded 1E candidate

The candidate:

1. removes the upload picker's `aria-describedby` relationship while retaining its concise label and one adjacent help paragraph;
2. removes the Guitar Pro fieldset's `aria-describedby` relationship while retaining its concise legend and one adjacent instruction paragraph;
3. preserves explicit no-default Guitar Pro track selection;
4. preserves the selected-track summary immediately before Load selected track;
5. preserves the iOS Files picker without an `accept` filter;
6. preserves all accepted intake, navigation, playback-timing, audition, rest, focus, and speech contracts;
7. advances the hosted identity to `Guitar Eyes concise-control speech proof 1E`.

## Music Vault read-only audit

No Music Vault source was changed from this Guitar Eyes assignment.

The current Phase 7 branch contains the same candidate mechanism in the private MP3 upload workflow:

1. the MP3 file input inherits the selected-file paragraph;
2. Start or resume selected MP3 upload inherits both selected-file and upload-state paragraphs;
3. Pause upload inherits the upload-state paragraph;
4. those paragraphs remain adjacent in ordinary document order.

Those relationships may contain useful state, so the Music Vault repair must be a separate bounded audit. It must preserve necessary disabled-state, selected-file, upload-progress, pause/resume, focus-return, and error contracts while restoring concise control identity and avoiding repeated adjacent prose.

## Required 1E gate

Before acceptance:

1. run the complete inherited and new suite with honest exit handling;
2. run the optimized production build;
3. publish one exact-source temporary Pages candidate;
4. restore fork main exactly;
5. require bounded real-iPhone VoiceOver acceptance for the upload picker and Guitar Pro track group;
6. record the owner's exact result without strengthening it.

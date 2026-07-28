# Known Problems Register Addendum: Duplicate Control Descriptions

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

## GE-VOICE-013 — Controls inherit adjacent explanatory prose and repeat it in swipe order

State: `candidate`

## Symptoms

With iPhone VoiceOver:

1. a control begins by speaking a long explanation rather than its concise identity;
2. the control name or type arrives only at the end;
3. the same explanation is encountered again on the next right swipe;
4. control and description become difficult to distinguish;
5. backward navigation does not reconstruct the immediately preceding workflow intuitively.

## Cause

A visible adjacent help paragraph is also referenced by the control through `aria-describedby` or an equivalent accessible-description mechanism. VoiceOver incorporates that prose into the control announcement while the paragraph remains independently present in document order.

## Failed-do-not-repeat approaches

1. Do not bind every visible help paragraph to its preceding control merely because the relationship is semantically related.
2. Do not solve a concise-label problem by appending more explanatory text to the accessible name.
3. Do not remove useful help from document order solely to avoid repetition.
4. Do not judge the result only from the computed accessibility tree; require real-iPhone swipe-order acceptance.
5. Do not apply a blanket removal rule to required field errors or short essential disambiguation without checking their separate contract.

## Candidate solution

1. Give each actionable control a concise, self-sufficient label.
2. Let native control state supply selected value, checked state, disabled state, and control type.
3. Keep longer explanatory prose as one adjacent, independently swipable item.
4. Do not attach that prose with `aria-describedby` when the control is already understandable without it.
5. Preserve programmatic descriptions only for short essential information that would otherwise be unavailable when the control is encountered.
6. Test document order and absence of unintended `aria-describedby` relationships.
7. Require hosted real-iPhone forward and backward swipe acceptance.

## Guitar Eyes 1E scope

The bounded candidate applies the solution to:

1. Upload tablature file;
2. Available Guitar Pro tablature tracks.

It deliberately does not alter required-field errors, live error reports, selected-track details, current-position descriptions, or playback status contracts.

## Cross-repository observation

A read-only inspection of `BlindAnatomist/val-music-vault` Phase 7 found the same candidate mechanism around private MP3 file selection, upload state, Start or resume upload, and Pause upload. That repository requires its own bounded repair because the descriptions also carry selected-file, disabled-state, recovery, and transfer information.

## Acceptance boundary

This entry becomes `local-proven` for Guitar Eyes only after:

1. complete automated verification and production build pass;
2. the exact source is hosted;
3. the upload picker speaks its concise identity without inheriting the adjacent help;
4. the Guitar Pro group speaks its concise legend without inheriting the adjacent multi-track instructions;
5. each adjacent explanation remains available once in ordinary swipe order;
6. accepted file selection and explicit track selection continue to work.

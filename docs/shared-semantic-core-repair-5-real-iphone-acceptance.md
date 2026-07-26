# Shared Semantic Core Repair 5 Real-iPhone Acceptance

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-5`

## Actionable position speech

Status: passed on the real target device.

The owner loaded the four-string bass fixture in iPhone Safari with VoiceOver and reviewed the position descriptions after Repair 5 removed ordinary inactive-string announcements.

Observed result:

1. Positions continued to report fretted and open strings correctly.
2. Ordinary blank strings were no longer announced as silent.
3. The descriptions were easier to understand and more useful as playing instructions.
4. The owner explicitly confirmed that the revised wording worked and was much better.

This accepts the speech rule that Guitar Eyes should announce what the player must do at the current position. Blank strings remain represented in the semantic model but are omitted from ordinary iPhone speech. Explicit mute notation such as `x` remains actionable notation and should still be announced.

## Accepted bass-reader behavior

The following have now passed on the real iPhone:

1. repair-build identity;
2. automatic four-string bass detection;
3. automatic instrument-selector correction;
4. durable focus recovery after the native file picker;
5. control order: Read current position, Previous position, Next position;
6. quiet Previous and Next navigation;
7. on-demand current-position speech;
8. omission of ordinary inactive strings from spoken instructions.

## Remaining shared-core iPhone gate

1. Upload `shared-core-two-block-guitar.txt` while the selector is still on Bass.
2. Confirm automatic guitar detection and selector correction.
3. Confirm focus returns to `iPhone tablature reader`.
4. Confirm the reader reports Block 1 of 2.
5. Confirm Next tablature block moves to Block 2 of 2.
6. Confirm Previous tablature block returns to Block 1 of 2.
7. Confirm Read current position and ordinary position navigation remain correct within both blocks.

No desktop or laptop acceptance testing is assigned to the owner.

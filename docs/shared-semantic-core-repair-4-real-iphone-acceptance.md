# Shared Semantic Core Repair 4 Real-iPhone Acceptance

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-4`

## Accepted foundation

The owner confirmed on iPhone Safari with VoiceOver that Shared Semantic Core Repair 3 correctly separated navigation from musical description:

1. Previous and Next moved between positions without automatically reciting strings and frets.
2. The Current position section exposed the updated description in swipe order.
3. Read current position spoke the description on demand.

The owner then selected this control order:

1. Read current position.
2. Previous position.
3. Next position.

Rationale: understanding the current musical position is the primary action; backward and forward movement remain a secondary navigation pair.

## Repair 4 implementation

1. `src/IPhoneTabReader.js` renders the controls in the accepted order.
2. Navigation remains quiet.
3. Read current position remains the sole deliberate speech action.
4. `src/IPhoneTabReader.test.js` asserts the exact document order and the existing quiet-navigation contract.
5. The complete automated suite and production build passed.
6. GitHub Pages deployment passed.
7. The exact Pages artifact was inspected and identified as Shared semantic core repair 4.
8. Fork `main` was restored and independently confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Remaining real-iPhone gate

With the bass fixture loaded, confirm VoiceOver encounters the controls in this order:

1. Read current position.
2. Previous position.
3. Next position.

Also confirm that Read current position still speaks the musical description and Previous and Next remain quiet.

No desktop or laptop acceptance testing is assigned to the owner.

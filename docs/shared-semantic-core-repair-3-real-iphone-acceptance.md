# Shared Semantic Core Repair 3 Real-iPhone Acceptance

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-3`

## Prior gates carried forward

The following passed on the real target device in repair 2:

1. The static deployed-build identity heading was the first heading VoiceOver encountered.
2. The four-string bass fixture loaded while the selector remained on Guitar.
3. The application detected four-string bass automatically.
4. The selector changed automatically from Guitar to Bass.
5. VoiceOver focus returned to the iPhone tablature reader rather than Safari browser chrome.

## Gate 3: position-control speech contract

Status on repair 2: failed on the real target device.

The owner confirmed that Previous position, Next position, and Read current position operated, but the navigation controls were difficult to understand. Previous and Next each caused VoiceOver to include the full musical description of the destination position. This made it unclear whether the spoken frets and strings described the position being left, the position being entered, or the button itself.

The owner defined the correct interaction:

1. Previous position and Next position should perform and identify navigation only.
2. The current musical position should have one dedicated description in the swipe order.
3. Read current position should be the explicit control that speaks that description on demand.

## Confirmed cause

`src/IPhoneTabReader.js` contained two independent sources of duplicated speech:

1. both navigation-control containers used `aria-describedby="current-position-description"`, causing the current musical description to become part of each button's accessible output;
2. `moveTo` also wrote the destination's full musical description into a polite live region after every movement.

VoiceOver was therefore following the implemented accessibility contract; the contract itself was wrong.

## Repair 3

Source checkpoint:

`9a38ec760b83a2c654b10dec0988f3a56ad41d97`

Implemented changes:

1. Removed the current-position `aria-describedby` relationship from position-navigation controls.
2. Removed the same relationship from tablature-block navigation controls.
3. Previous position, Next position, Previous tablature block, and Next tablature block now change state without writing the musical description into the live region.
4. Read current position remains the only control that deliberately sends the current musical description to the live region.
5. The Current position heading and description now follow the navigation controls in document order, so a forward swipe can reach the updated musical content naturally.
6. Regression tests verify that navigation buttons have no inherited description, movement leaves the live region empty, block navigation is also quiet, and Read current position still speaks the description.

## Automated and hosted verification

Workflow run:

`30188779321`

Result:

1. dependency installation passed;
2. complete automated test suite passed;
3. production build passed;
4. repair-3 artifact identity inspection passed;
5. Pages artifact upload passed;
6. Pages deployment passed;
7. verification reporting passed.

The exact deployed source map was inspected and confirmed to contain the repaired `IPhoneTabReader` implementation.

Fork `main` was restored to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`. The final comparison reported `identical`, zero commits ahead, zero behind, and no changed files.

## Required real-iPhone retest

With the bass fixture loaded in repair 3:

1. Confirm Previous position and Next position are announced as navigation controls without strings and frets being appended to their button output.
2. Activate Next position and confirm movement itself does not automatically speak the full musical description.
3. Swipe forward to Current position and confirm the updated strings and frets are understandable there.
4. Activate Read current position and confirm it speaks the current description on demand.
5. Activate Previous position and repeat the same checks.

After this gate passes, proceed to the two-block guitar fixture.

No desktop or laptop acceptance testing is assigned to the owner.

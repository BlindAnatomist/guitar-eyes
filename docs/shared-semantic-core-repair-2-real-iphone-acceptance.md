# Shared Semantic Core Repair 2 Real-iPhone Acceptance

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-2-final`

## Gate 1: deployed-build identity

Status: passed on the real target device.

The owner opened the versioned preview in iPhone Safari with VoiceOver. VoiceOver announced the first heading exactly as intended:

`Test build: Shared semantic core repair 2.`

This confirms that:

1. Safari loaded the final repair 2 deployment rather than an older cached build;
2. the static build-identity heading is first in the document reading order;
3. the prior instruction relying on an ordinary React paragraph has been superseded;
4. the bass upload acceptance test proceeded against the correct hosted build.

## Gate 2: bass upload, automatic detection, and focus recovery

Status: passed on the real target device.

The owner left the instrument selector on Guitar and uploaded `shared-core-four-string-bass.txt`.

Observed result:

1. VoiceOver announced that the file was uploading and then that upload had finished.
2. The application announced that it detected four-string bass.
3. The semantic bass document loaded and reported its synchronized positions.
4. VoiceOver focus landed on the intended iPhone result rather than Safari browser chrome.
5. The instrument selector changed automatically from Guitar to Bass.
6. The owner reported that everything in this upload and focus gate worked correctly.

This confirms that the repaired import coordinator, automatic instrument detection, selector synchronization, semantic bass parsing, and durable picker-return focus system all passed on the real target device.

## Remaining iPhone gates

1. With the bass fixture still loaded, confirm Previous position, Next position, and Read current position work and announce understandable bass-string information.
2. Upload `shared-core-two-block-guitar.txt`.
3. Confirm automatic guitar detection if the selector is still on Bass.
4. Confirm focus returns to `iPhone tablature reader`.
5. Confirm the reader announces Block 1 of 2.
6. Confirm Next tablature block moves to Block 2 of 2.
7. Confirm Previous tablature block returns to Block 1 of 2.
8. Confirm ordinary position controls continue to work within and across blocks.

No desktop or laptop acceptance testing is assigned to the owner.

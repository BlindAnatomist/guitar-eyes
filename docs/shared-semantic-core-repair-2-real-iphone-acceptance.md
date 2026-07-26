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
4. the bass upload acceptance test may now proceed against the correct hosted build.

## Remaining iPhone gates

1. Leave the instrument selector on Guitar.
2. Upload `shared-core-four-string-bass.txt`.
3. Confirm the app detects four-string bass automatically.
4. Confirm focus returns to `iPhone tablature reader`, not browser chrome.
5. Confirm the status reports four synchronized positions.
6. Confirm Previous position, Next position, and Read current position work.
7. After bass passes, test the two-block guitar fixture and block-navigation controls.

No desktop or laptop acceptance testing is assigned to the owner.

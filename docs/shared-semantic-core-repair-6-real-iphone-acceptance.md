# Shared Semantic Core Repair 6 Real-iPhone Acceptance

Date: July 26, 2026

Branch: `work/shared-semantic-core`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-6`

## Invalidated guitar reading

The owner loaded `shared-core-two-block-guitar.txt` after the accepted bass test, while the instrument selector was still set to Bass.

The file loaded and block navigation worked, but the spoken position description identified strings numerically and announced their tuning, for example the equivalent of `String 1, tuned E`, rather than using ordinary guitar identities such as High E, B, G, D, A, and Low E.

## Root cause

The import coordinator tried the selected instrument first. The bass parser accepted the first four lines of each six-string guitar block as custom-tuned bass strings because it validated only whether string lines could be grouped, not whether each contiguous tablature run matched the candidate instrument's complete string count.

## Repair

1. The import coordinator now counts contiguous tablature string-line runs before semantic parsing.
2. A run qualifies as guitar only when its length is divisible by six.
3. A run qualifies as bass only when its length is divisible by four.
4. The selected instrument is used only when the document is structurally plausible for that instrument.
5. Two six-line guitar blocks therefore bypass the Bass candidate and resolve to Guitar.
6. The selector updates automatically from Bass to Guitar.
7. Standard guitar positions use High E, B, G, D, A, and Low E string identities.

## Regression coverage

The exact two-block guitar source is tested while Bass is selected. The contract requires:

1. semantic Guitar resolution;
2. two preserved guitar blocks;
3. automatic instrument detection;
4. ordinary guitar string speech including `High E string, open`;
5. no `String 1, tuned` wording.

## Automated verification

Corrected source checkpoint: `10bf5bb9e0ea6328b39c546abca14abe1473ddac`

Workflow run: `30190076318`

Result:

1. complete automated test suite passed;
2. production build passed;
3. repair-6 artifact identity passed;
4. Pages artifact upload passed;
5. Pages deployment passed;
6. the exact deployed artifact was inspected;
7. fork `main` was restored and confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Real-iPhone result

Status: passed.

With the selector still on Bass, the owner uploaded `shared-core-two-block-guitar.txt` in iPhone Safari with VoiceOver and confirmed:

1. the selector changed automatically to Guitar;
2. focus returned correctly to the iPhone tablature reader;
3. the reader preserved and reported two tablature blocks;
4. Read current position used ordinary guitar string names rather than numbered custom-tuning descriptions;
5. Previous and Next tablature block worked correctly.

This completes the shared semantic core acceptance gate for clean four-string bass and clean multi-block six-string guitar on the real target device.

No desktop or laptop acceptance testing was assigned to the owner.
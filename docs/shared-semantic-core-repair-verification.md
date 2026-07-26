# Shared Semantic Core Repair Verification

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Repair source checkpoint: `d2b9a6ca7f38c8c7285e6c57b2327c7eb2dfba94`

## Invalidated handoff

The first Shared Semantic Core Checkpoint 2 iPhone handoff is invalid.

The owner reported two immediate real-device failures while loading the bass fixture:

1. Safari and VoiceOver returned to the browser banner instead of a useful application target.
2. The tablature file did not load.

The handoff should not have been presented as ready merely because the automated suite and deployment passed.

## Root causes

1. The durable native-picker focus request was retained only for successful semantic parsing. Failed parsing used a zero-delay error-heading focus attempt that Safari could overwrite with browser chrome. This repeated the mechanism already recorded in GE-002.
2. The import coordinator treated the selected instrument as an infallible prerequisite. A valid four-string bass document could fail when the interface still selected Guitar.
3. The stable Pages address had no audible build identity, making stale Safari content difficult to distinguish from the newly deployed checkpoint.

## Repair

1. `src/App.js` now retains one pending target-specific picker focus request for both outcomes:
   - `iPhone tablature reader` after success;
   - `Tablature could not be loaded` after failure.
2. Both targets use the proven `flushSync`, committed target, browser-return events, two-animation-frame delay, `preventScroll`, and clear-only-after-confirmed-focus procedure.
3. `src/tabImportCoordinator.js` now tries the selected instrument and then the alternate supported instrument.
4. A detected four-string bass or six-string guitar document updates the selector and announces the detected instrument.
5. Instrument selection now precedes file upload in the iPhone reading order.
6. The page announces `Test build: Shared semantic core repair 1.`
7. The page title and metadata identify the repair build, and the acceptance URL includes a version query.

## Added regression coverage

1. Successful picker return focuses the iPhone reader heading.
2. Failed picker return focuses the persistent error heading.
3. A bass file loads while the interface still selects Guitar.
4. The selector changes to Bass after detection.
5. The load status announces `Detected four-string bass`.
6. Guitar is likewise detected if the interface still selects Bass.

## Automated and hosted verification

Workflow run: `30187866179`

Result:

1. dependency installation passed;
2. complete automated test suite passed;
3. production build passed;
4. Pages artifact upload passed;
5. Pages deployment passed;
6. verification reporting passed.

Recorded result: `docs/shared-semantic-core-repair-automated-result.md`.

Versioned preview:

`https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-1`

## Repository authority

The temporary publication workflow used fork `main` only as the already-authorized Pages deployment context. Fork `main` was restored to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3` and independently compared as identical after deployment.

## Real-iPhone acceptance required

This repair remains a candidate until the owner confirms all of the following on iPhone Safari with VoiceOver:

1. the page announces `Test build: Shared semantic core repair 1`;
2. loading `shared-core-four-string-bass.txt` succeeds without requiring Bass to be selected first;
3. focus returns to `iPhone tablature reader` rather than the browser banner;
4. the status announces detection of four-string bass and four synchronized positions;
5. position controls work;
6. a deliberately invalid file, if tested later, returns focus to the persistent error heading rather than browser chrome.

No desktop or laptop acceptance testing is assigned to the owner.

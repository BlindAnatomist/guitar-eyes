# Real-iPhone Safari and VoiceOver Acceptance

Date: July 24, 2026

Tester: John Darrin Washburn

Device path: iPhone Safari with VoiceOver

Preview: `https://blindanatomist.github.io/guitar-eyes/`

## Checkpoint 1: Initial page order and mode state

Checkpoint 1 verdict: Pass.

The repaired iPhone order was confirmed as Jason's title, extension explanation, selected iPhone semantic reader, upload control, instrument selector, and the later collapsed Mac keyboard instructions.

## Checkpoint 2: Clean six-string upload and focus recovery

Fixture: `fixtures/iphone-proof-clean-six-string.txt`

Initial reported behavior:

1. File selection succeeded.
2. Five synchronized positions loaded.
3. The `iPhone tablature reader` heading and understandable semantic output rendered.
4. Safari and VoiceOver returned focus to the browser Page Menu instead of the reader heading.

Initial verdict: Parsing and semantic reading passed; focus recovery failed.

## First remediation and real-device result

The first remediation deliberately reused the Val Music Vault committed-target pattern:

1. Commit the parsed document, completion status, and focus request together with `flushSync`.
2. Use `useLayoutEffect` keyed to the focus request.
3. Focus the persistent reader heading with `preventScroll`.
4. Keep the heading programmatically focusable.
5. Cover the DOM focus contract automatically.

After the refreshed page and file were reloaded on the real iPhone, VoiceOver again returned to Page Menu. Therefore the ordinary committed-target pattern is necessary but insufficient for the native iOS Files-picker return boundary.

This failed retest must not be rewritten as an intermittent result. The owner reproduced the same browser-chrome landing twice.

## Second remediation

The stronger repair retains the pending focus request beyond the React commit and fulfills it only after Safari signals that the page has returned from the external picker:

1. Keep a durable pending-focus ref.
2. Listen for `window` focus, `pageshow`, and document `visibilitychange`.
3. When the document is visible, wait for two animation frames so Safari can complete its return to the web content.
4. Focus the persistent `iPhone tablature reader` heading with `preventScroll`.
5. Clear the request only when the heading is actually `document.activeElement`.
6. Keep automated browser-return regression coverage.

Second remediation commits:

- `7031e3581840c36ce3cd83e1907b1e77e41b31cd` — retain and recover pending reader focus after Safari returns from file selection.
- `539e7c97a75f02da250f53eeb4c9062ad6680479` — test focus recovery after the simulated browser-return event.

## Automated and hosted gates

Exact repair source recorded by the temporary publisher: `fc91883edf079a0f0f92eda6a679d31dacedc939`.

1. `npm ci` passed.
2. All 14 automated tests passed.
3. The production build passed.
4. GitHub Pages publication passed.
5. Fork `main` was restored to the exact upstream commit and compared as identical.

## Final real-iPhone retest

The owner refreshed the hosted page and selected the same fixture once.

Confirmed behavior:

1. Safari returned from the native Files picker.
2. VoiceOver did not remain on the browser Page Menu.
3. Focus landed on the successful result and announced: `Loaded five synchronized positions in iPhone reader mode.`
4. The announcement correctly conveyed both successful loading and the number of parsed synchronized positions.

Checkpoint 2 verdict: Pass.

## Bounded proof verdict

The real-iPhone Safari and VoiceOver acceptance gate for the bounded proof passes.

Accepted behaviors:

1. iPhone-first reading order.
2. Six-string fixture parsing.
3. Understandable semantic output.
4. Persistent result creation.
5. Recovery across the native iOS Files-picker boundary.
6. Useful post-upload focus and completion announcement.

This acceptance applies only to the bounded proof and does not authorize a pull request, upstream change, production redesign, or expansion beyond the documented branch scope.

## Checkpoint 4: convergence regression pending

Exact published convergence source:

`d26e4172a0386ceb56ad5c0061e72d975b42fc43`

The local and GitHub-hosted automated gates passed with 4 of 4 suites and 20 of 20 tests. The production Pages build, compiled block-navigation checks, deployment, hosted HTML read-back, hosted JavaScript read-back, and exact fork-main restoration also passed.

The remaining bounded real-iPhone regression must confirm:

1. Safari and VoiceOver still recover usefully from the native Files picker;
2. successful load status and the semantic reader remain understandable;
3. Previous position, Read current position, and Next position remain in the accepted order;
4. measure context is understandable while moving among synchronized positions;
5. multiple complete tablature blocks remain distinct;
6. Previous tablature block and Next tablature block move between blocks and expose correct boundary states.

This test will be conducted later in Chat, not Work. No result is claimed yet.

Jason's Mac recognition and desktop usability acceptance is deferred unless he agrees to participate. It is not a prerequisite for this iPhone gate.

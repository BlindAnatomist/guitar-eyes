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

Reported behavior:

1. File selection succeeded.
2. Five synchronized positions loaded.
3. The `iPhone tablature reader` heading and understandable semantic output rendered.
4. Safari and VoiceOver returned focus to the browser Page Menu instead of the reader heading.

Checkpoint 2 verdict: Parsing and semantic reading pass; focus recovery fails.

## First remediation and real-device result

The first remediation deliberately reused the Val Music Vault committed-target pattern:

1. Commit the parsed document, completion status, and focus request together with `flushSync`.
2. Use `useLayoutEffect` keyed to the focus request.
3. Focus the persistent reader heading with `preventScroll`.
4. Keep the heading programmatically focusable.
5. Cover the DOM focus contract automatically.

After the refreshed page and file were reloaded on the real iPhone, VoiceOver again returned to Page Menu. Therefore the ordinary committed-target pattern is necessary but insufficient for the native iOS Files-picker return boundary.

This failed retest must not be rewritten as an intermittent result. The owner reproduced the same browser-chrome landing twice.

## Second remediation boundary

The stronger repair retains the pending focus request beyond the React commit and fulfills it only after Safari signals that the page has returned from the external picker:

1. Keep a durable pending-focus ref.
2. Listen for `window` focus, `pageshow`, and document `visibilitychange`.
3. When the document is visible, wait for two animation frames so Safari can complete its return to the web content.
4. Focus the persistent `iPhone tablature reader` heading with `preventScroll`.
5. Clear the request only when the heading is actually `document.activeElement`.
6. Keep automated browser-return regression coverage.
7. Require another bounded real-iPhone VoiceOver retest before acceptance.

Second remediation commits:

- `7031e3581840c36ce3cd83e1907b1e77e41b31cd` — retain and recover pending reader focus after Safari returns from file selection.
- `539e7c97a75f02da250f53eeb4c9062ad6680479` — test focus recovery after the simulated browser-return event.

Retest status: Pending automated verification and refreshed hosted preview. Do not ask the owner to repeat the upload until the exact repair head passes the automated and hosted gates.

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
4. Safari and VoiceOver returned focus to the browser page menu instead of the reader heading.

Checkpoint 2 verdict: Partial pass with a focus-recovery defect.

Proven-pattern review:

The tester correctly identified that comparable VoiceOver focus transitions had already been solved in `BlindAnatomist/val-music-vault`. The Guitar Eyes repair must reuse those repository lessons rather than inventing an isolated strategy.

The inspected Music Vault implementation uses committed state, a dedicated focus request or pending-focus marker, `flushSync` where a synchronous transition is required, and `useLayoutEffect` to focus a persistent target with `preventScroll` after React commits it. Its acceptance records also explicitly treat DOM focus tests as necessary but insufficient and require bounded real-iPhone confirmation.

Final remediation:

1. Remove the speculative repeated-timer repair.
2. Commit the parsed document, completion status, and focus request together with `flushSync`.
3. Use `useLayoutEffect` keyed to the focus request to focus the persistent reader heading with `preventScroll`.
4. Keep the heading programmatically focusable.
5. Add an integration test that selects an in-memory six-string text file, verifies five synchronized positions, waits for the heading, and confirms it is the active element.
6. Require real-iPhone VoiceOver retest.

Final remediation commits:

- `f34fb1efb9c5b2c766ae5fa43f186fcd5e7cded0` — removed speculative timer retries.
- `10c3b231b444342a7f7ce82d163e76f9896b560c` — applied the committed-state Music Vault pattern.
- `e0182902fe05544c6d01038cad5ce7f8b9fbb3c2` — removed obsolete timer-specific coverage.
- `0bbc3b71278fd34a779b988ccb66ff12f0e16a09` — added upload-to-heading integration coverage.

Retest status: Pending automated verification and refreshed hosted preview.

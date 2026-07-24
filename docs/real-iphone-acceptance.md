# Real-iPhone Safari and VoiceOver Acceptance

Date: July 24, 2026

Tester: John Darrin Washburn

Device path: iPhone Safari with VoiceOver

Preview: `https://blindanatomist.github.io/guitar-eyes/`

## Checkpoint 1: Initial page order and mode state

Initial reported behavior:

1. The page opened and announced Jason Washburn's existing Mac-oriented Guitar Eyes title.
2. The Mac keyboard-command instructions were exposed near the beginning of the page.
3. The reading-mode controls were available farther down the page.
4. `iPhone semantic reader` was selected.
5. The upload control was present immediately below the reading-mode controls and was understandable as the upload control.

Initial verdict: Partial pass with an iPhone-first ordering defect.

What initially passed:

1. The hosted proof loaded in iPhone Safari.
2. Jason's desktop title and material remained present.
3. Touch-device mode detection selected the iPhone semantic reader.
4. The upload path was discoverable and labeled.

Defect found:

The iPhone user had to navigate through the Mac-oriented title and expanded keyboard instructions before reaching the iPhone mode and upload controls. Preserving the desktop instructions is required, but placing them ahead of the iPhone workflow is not appropriate for the iPhone-first extension.

Remediation:

1. Move reading mode, upload, and instrument controls ahead of the Mac keyboard instructions.
2. Keep Mac instructions expanded by default for desktop users.
3. Collapse Mac instructions by default on coarse-pointer touch devices.
4. Rename the instructions control explicitly as `Open Mac keyboard instructions` or `Close Mac keyboard instructions`.
5. Add an automated touch-device test for selected mode, collapsed instructions, and control order.

Remediation commits:

- `34ebaafc261b401f05d9a7d57965d88216b373d2`
- `8f4e1aa22177d8297184346bebd395cee98a8d0f`
- `6ced8df807c7c1d119bd6dc7576a718b8adae931`

Automated remediation verification:

1. Installation passed.
2. All 13 automated tests passed, including the touch-device order and collapsed-instructions test.
3. Production build passed.
4. Refreshed GitHub Pages deployment passed.
5. Hosted page, JavaScript, and CSS read-back passed.
6. Fork `main` was restored and verified identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

Real-iPhone retest result:

The tester confirmed that the refreshed page presented exactly this order:

1. Jason's Guitar Eyes title.
2. The extension explanation.
3. Reading mode, with `iPhone semantic reader` selected.
4. The upload control.
5. The instrument selector.
6. The collapsed `Open Mac keyboard instructions` control later in the page.

Checkpoint 1 verdict: Pass.

## Checkpoint 2: Clean six-string upload and focus recovery

Fixture: `fixtures/iphone-proof-clean-six-string.txt`

Reported behavior:

1. The file was selected successfully from the iPhone Files interface.
2. Safari and VoiceOver returned focus to the browser page menu instead of the application result.
3. After swiping back through the page, the tester found the guitar-or-bass instrument selector.
4. The restrained status announced that five synchronized positions had loaded in iPhone reader mode.
5. The `iPhone tablature reader` heading was present.
6. The semantic tablature output was understandable and appeared to describe the synchronized positions correctly.

What passed:

1. Plain-text file selection worked.
2. Six-string parsing worked.
3. Five synchronized positions were produced.
4. The iPhone reader rendered.
5. The semantic descriptions were understandable in VoiceOver.

Defect found:

Focus did not recover to the `iPhone tablature reader` heading after the native iPhone file picker closed. The existing single zero-delay focus attempt was not sufficient to overcome Safari's return to browser chrome.

Checkpoint 2 verdict: Partial pass with a focus-recovery defect.

Proven-pattern review:

The first attempted repair used repeated arbitrary timers. Before accepting or publishing that approach, the tester correctly identified that comparable VoiceOver focus transitions had already been solved and tested in `BlindAnatomist/val-music-vault`.

The Music Vault implementation was inspected. Its stronger accepted engineering pattern uses committed state, a dedicated focus request, `flushSync` where a synchronous transition is required, and `useLayoutEffect` to focus the persistent target with `preventScroll` after React commits it. Browser DOM focus tests remain necessary but real-iPhone VoiceOver acceptance remains authoritative.

Final remediation boundary:

1. Remove the speculative repeated-timer focus logic.
2. Commit the parsed iPhone document, completion status, and a dedicated focus request together with `flushSync`.
3. Use `useLayoutEffect` keyed to that focus request to focus the persistent `iPhone tablature reader` heading with `preventScroll`.
4. Keep the heading programmatically focusable and present after the upload control's native file-picker transition.
5. Require a bounded real-iPhone retest; automated DOM focus alone is insufficient.

Final remediation commits:

- `f34fb1efb9c5b2c766ae5fa43f186fcd5e7cded0` — removed speculative timer retries.
- `10c3b231b444342a7f7ce82d163e76f9896b560c` — applied the committed-state Music Vault focus pattern.
- `e0182902fe05544c6d01038cad5ce7f8b9fbb3c2` — removed the obsolete timer-specific test.

Retest status: Pending automated verification and refreshed hosted preview.

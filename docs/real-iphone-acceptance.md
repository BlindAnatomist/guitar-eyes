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

Status: Pending.

The next test will use the repository fixture `fixtures/iphone-proof-clean-six-string.txt`. Acceptance will verify file selection, restrained status feedback, focus movement to the iPhone tablature reader heading, and the initial semantic position description.

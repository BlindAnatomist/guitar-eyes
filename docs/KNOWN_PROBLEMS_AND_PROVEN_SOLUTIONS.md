# Known Problems and Proven Solutions

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

## Purpose

This is the first document to inspect before diagnosing or repairing a problem in this repository. It exists to prevent repeated mistakes, preserve failed approaches as warnings, record solutions supported by evidence, and identify lessons that should transfer to other repositories.

Do not treat chat memory as authoritative when this file or linked repository evidence is available.

## Required use

Before changing implementation, deployment, accessibility, testing, or repository administration:

1. Read this file.
2. Search for a matching symptom, mechanism, or failed approach.
3. Inspect the linked evidence.
4. Start from an existing proven solution when the same mechanism applies.
5. Record new failures and confirmed solutions here before closing the work.
6. Mark broadly reusable lessons as cross-repository candidates.

A browser DOM test is evidence, not proof of real VoiceOver behavior. Real-device accessibility findings must be preserved exactly and must not be rewritten as stronger claims than the test supports.

## Entry states

- `local-proven`: proven in this repository.
- `cross-repository-proven`: proven elsewhere and deliberately adapted here.
- `candidate`: plausible but not yet accepted on the real target device or hosted environment.
- `failed-do-not-repeat`: attempted and shown to be inadequate or harmful.
- `superseded`: retained for history but replaced by a better solution.

---

## GE-001 — iPhone users encounter desktop instructions before the iPhone workflow

State: `local-proven`

### Symptoms

On an iPhone with VoiceOver, the original Mac title and expanded Mac keyboard instructions appeared before reading mode, upload, and instrument controls. The iPhone extension loaded correctly, but the user had to traverse irrelevant desktop material first.

### Cause

Desktop instructions were expanded and ordered ahead of the touch workflow regardless of the active input environment.

### Failed or rejected approaches

- Accepting the page merely because the iPhone reader eventually appeared.
- Treating successful device detection and parsing as sufficient accessibility acceptance.

### Proven solution

- Place reading mode, instrument, and upload controls before desktop instructions.
- Keep desktop instructions expanded by default on desktop.
- Collapse desktop instructions by default on coarse-pointer devices.
- Expose explicit `Open Mac keyboard instructions` and `Close Mac keyboard instructions` controls.

### Evidence

- Real-iPhone VoiceOver acceptance: the owner confirmed the corrected order exactly.
- See `docs/real-iphone-acceptance.md` and `docs/hosted-preview-status.md`.

### Derived standard

Responsive accessibility includes reading order and disclosure state, not only responsive visual layout.

---

## GE-002 — VoiceOver focus is lost after the native iOS file picker closes

State: `local-proven`

Cross-repository foundation: `BlindAnatomist/val-music-vault`

### Symptoms

After selecting a valid six-string text file in the iPhone Files picker:

- parsing succeeded;
- five synchronized positions loaded;
- the iPhone tablature reader was understandable;
- Safari and VoiceOver initially returned to the browser Page Menu rather than the reader result;
- the user had to swipe back into the application to find the result.

The owner reproduced the same Page Menu landing after refreshing the hosted page and reloading the fixture.

### Refined cause

There are two separate transition boundaries:

1. React must commit the newly created persistent reader target.
2. Safari must finish returning from the external native Files picker and return control to the web document.

The committed-target pattern solves the first boundary. Real-iPhone testing proved that focusing during the React commit can still occur before Safari completes the second boundary. Safari then overwrites page focus with browser chrome.

### Failed-do-not-repeat approaches

1. Do not rely on the browser to restore useful focus automatically.
2. Do not use a chain of arbitrary delayed timers that repeatedly calls `focus()` in the hope that one attempt lands after rendering.
3. Do not declare the repair complete merely because `document.activeElement` is correct in an automated DOM test.
4. Do not assume the ordinary `flushSync` plus `useLayoutEffect` committed-target pattern alone covers an external native picker boundary. It passed automation but failed twice on the real iPhone.
5. Do not preserve the durable picker-return request only for successful parsing. A failed parse crosses the same external picker boundary and requires the same durable recovery mechanism.

### Proven solution

Use the Val Music Vault committed-target pattern as the foundation, then preserve the request across the external picker boundary:

1. Synchronize the decisive state transition with `flushSync` when necessary.
2. Store a dedicated pending-focus target, not merely a success flag.
3. Use `useLayoutEffect` after React commits the persistent target.
4. Keep the pending request durable beyond that initial commit.
5. Listen for `window` focus, `pageshow`, and document `visibilitychange`.
6. When the page is visible again, wait for two animation frames so Safari can finish restoring web content.
7. Focus the persistent result heading with `focus({ preventScroll: true })`.
8. Use the `iPhone tablature reader` heading after success and the `Tablature could not be loaded` heading after failure.
9. Clear the request only after the selected heading is confirmed as `document.activeElement`.
10. Retain the direct committed-state attempt for browsers that do not leave the web document.
11. Cover both successful and failed picker-return contracts automatically.
12. Require hosted real-iPhone VoiceOver acceptance.

### Acceptance result

The original success path passed on the refreshed hosted build when VoiceOver landed on:

`Loaded five synchronized positions in iPhone reader mode.`

On July 25, 2026, the first bass handoff exposed that the failure path had not inherited the same durable focus target. That handoff is invalidated. The generalized success-or-error repair is automated and deployed but remains `candidate` until the owner retests it on the real iPhone.

### Evidence

- Real-device failure history and original success pass: `docs/real-iphone-acceptance.md`.
- Generalized repair implementation: `src/App.js`.
- Success and failure browser-return regression coverage: `src/App.test.js`.
- Repair source checkpoint: `d2b9a6ca7f38c8c7285e6c57b2327c7eb2dfba94`.
- Repair workflow result: `docs/shared-semantic-core-repair-automated-result.md`.
- Val Music Vault foundation: `src/admin/AdminWorkspace.tsx` and its Phase 7 acceptance records.

### Derived shared standard

A native iOS picker is an external browser-boundary transition whether the operation succeeds or fails. Preserve a target-specific committed-focus request until Safari signals that the web document is visible and focused again, allow Safari to finish restoring web content, then focus the persistent success or error destination and clear the request only after confirming success.

---

## GE-003 — Temporary GitHub Pages publication can contaminate the upstream-tracking main branch

State: `local-proven`

### Symptoms

The working branch could build successfully, but GitHub Pages environment protection rejected deployment from that branch. A temporary publication mechanism used `main`, creating a risk that the fork's clean upstream-tracking branch would retain publisher-only commits.

### Constraints

- Preserve `Phlypper/guitar-eyes` untouched.
- Preserve fork `main` as a clean upstream-tracking branch.
- Work only on the authorized work branch.
- Do not open a pull request unless explicitly authorized.

### Proven solution

- Use a tightly bounded temporary publisher only when required for hosted iPhone acceptance.
- Record build, deployment, and hosted verification evidence.
- After publication, force-restore fork `main` to the exact upstream commit.
- Verify with a commit comparison showing `identical`, zero ahead, zero behind, and no changed files.

### Evidence

- Upstream/fork authority commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- See `docs/hosted-preview-status.md`.

### Derived shared standard

A temporary deployment workaround is incomplete until repository authority is restored and independently compared, not merely assumed clean.

---

## GE-004 — A fixture can fail when the instrument selector and file disagree

State: `candidate`

### Symptoms

A four-string bass fixture was handed off for iPhone testing, but the semantic import depended on the selector already being set to Bass. A selector mismatch caused semantic rejection and exposed the incomplete failure-focus path.

### Cause

Instrument identity was treated as an infallible prerequisite supplied by the interface rather than information that could be inferred from a structurally valid four- or six-string document.

### Repair

1. Attempt semantic parsing with the selected instrument.
2. If it fails, attempt the alternate supported instrument.
3. When the alternate parse succeeds, use that semantic document for both readers.
4. Update the selector to the detected instrument.
5. Announce the detected instrument in the load status.
6. Retain the legacy parser only when both semantic interpretations fail.

### Evidence

- Implementation: `src/tabImportCoordinator.js` and `src/App.js`.
- Contract coverage: `src/tabImportCoordinator.test.js` and `src/App.sharedCore.test.js`.
- Repair source checkpoint: `d2b9a6ca7f38c8c7285e6c57b2327c7eb2dfba94`.
- Automated verification and deployment: `docs/shared-semantic-core-repair-automated-result.md`.

### Acceptance boundary

Automated and hosted verification passed. Real-iPhone acceptance remains required before changing this entry to `local-proven`.

---

## GE-005 — A successful deployment can still hand the tester a stale cached preview

State: `candidate`

### Risk

The GitHub Pages address remains stable between checkpoints. Safari may reuse a previously cached page, causing the tester to exercise older JavaScript while the repository and deployment records show that a newer build succeeded.

### Repair

1. Give each acceptance build an audible in-page test-build label.
2. Update the page title and description for the checkpoint.
3. Add conservative no-cache metadata hints.
4. Provide a versioned query string in the handoff address.
5. Require the tester to hear the expected build label before uploading a fixture.

### Evidence

- `src/App.js` announces `Test build: Shared semantic core repair 1.`
- `public/index.html` identifies the repair build and includes no-cache metadata hints.
- Versioned preview: `https://blindanatomist.github.io/guitar-eyes/?build=shared-core-repair-1`.

### Acceptance boundary

This remains `candidate` until the owner confirms that the versioned address announces the expected build label on the real iPhone.

---

## Cross-repository standards

### XR-VOICEOVER-FOCUS-001

State: `cross-repository-proven`

State-driven committed-target VoiceOver focus pattern:

- pending focus state or ref;
- persistent destination;
- success-or-error target identity;
- `useLayoutEffect` after commit;
- `preventScroll`;
- automatic DOM regression coverage;
- bounded real-iPhone VoiceOver acceptance.

Source of strongest internal-transition evidence: Val Music Vault Phase 7.

### XR-IOS-PICKER-FOCUS-001

State: `cross-repository-proven`

External native-picker return pattern:

- retain the pending focus request beyond the React commit;
- retain the correct success or failure destination;
- respond to page visibility and browser-return events;
- wait for Safari to finish restoring web content;
- focus the persistent destination with `preventScroll`;
- clear pending state only after confirming that destination is active;
- preserve automatic browser-return regression coverage;
- require hosted real-iPhone acceptance.

Source of strongest external-boundary evidence: Guitar Eyes GE-002.

### XR-EXECUTION-SCOPE-001

State: `cross-repository-proven`

A focused source repair can still become a large metered execution assignment when reconstruction, the full regression gate, packaging, hosted verification, documentation, fixture preparation, workflow administration, and handoff work are bundled together.

Before using Work, Codex, GitHub Actions, or another metered execution environment:

- define the exact source-change boundary;
- separate tasks by the least expensive capable environment;
- keep owner-operated testing outside metered work;
- do not predict credit consumption from expected diff size;
- preserve required evidence rather than weakening the gate.

## Maintenance rule

When a problem takes more than one serious attempt to solve, recurs across threads, requires a non-obvious workaround, or is likely to be mistaken for a platform limitation, update this document before closing the checkpoint.

A future worker must not rely on chat memory alone. Repository documentation is authoritative.

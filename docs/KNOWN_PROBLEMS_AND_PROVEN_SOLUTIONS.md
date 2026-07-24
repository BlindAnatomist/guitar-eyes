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

- Place reading mode, upload, and instrument controls before desktop instructions.
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

State: `candidate`

Cross-repository source: `BlindAnatomist/val-music-vault`

### Symptoms

After selecting a valid six-string text file in the iPhone Files picker:

- parsing succeeds;
- five synchronized positions load;
- the iPhone tablature reader is understandable;
- Safari and VoiceOver return to the browser Page Menu rather than the reader heading;
- the user must swipe back into the application to find the result.

The owner reproduced the same Page Menu landing after refreshing the hosted page and reloading the fixture.

### Refined cause class

There are two separate transition boundaries:

1. React must commit the newly created persistent reader target.
2. Safari must finish returning from the external native Files picker and return control to the web document.

The committed-target pattern solves the first boundary. The real-iPhone retest proved that focusing during the React commit can still occur before Safari completes the second boundary. Safari then overwrites the page focus with browser chrome.

### Failed-do-not-repeat approaches

1. Do not rely on the browser to restore useful focus automatically.
2. Do not use a chain of arbitrary delayed timers that repeatedly calls `focus()` in the hope that one attempt lands after rendering.
3. Do not declare the repair complete merely because `document.activeElement` is correct in an automated DOM test.
4. Do not assume the ordinary `flushSync` plus `useLayoutEffect` committed-target pattern alone covers an external native picker boundary. It passed automation but failed twice on the real iPhone.

### Cross-repository proven foundation

Val Music Vault established the necessary internal React transition pattern:

1. Synchronize the decisive state transition with `flushSync` when necessary.
2. Store a dedicated pending-focus marker or focus-request state.
3. Use `useLayoutEffect` after React commits the persistent target.
4. Focus the target with `focus({ preventScroll: true })`.
5. Ensure the destination remains in the DOM after the initiating control or prior content disappears.
6. Test the DOM focus contract automatically.
7. Treat automated focus tests as necessary but insufficient.
8. Require bounded real-iPhone VoiceOver acceptance.

### Current Guitar Eyes candidate extension

For native iOS picker return, retain the pending request beyond the React commit:

1. Keep a durable pending-focus ref until the target is confirmed as `document.activeElement`.
2. Listen for `window` focus, `pageshow`, and document `visibilitychange`.
3. When the page is visible again, wait for two animation frames so Safari can finish restoring web content.
4. Focus the persistent `iPhone tablature reader` heading with `preventScroll`.
5. Clear the request only after the heading is confirmed active.
6. Retain the direct committed-state attempt for browsers that do not leave the web document.
7. Test the browser-return event contract automatically.
8. Do not mark this extension proven until the owner confirms it on the hosted real-iPhone build.

### Current acceptance boundary

- Target: the persistent `iPhone tablature reader` heading.
- Expected behavior: after successful file parsing and Safari's return from Files, VoiceOver lands on that heading rather than Page Menu.
- The parser and semantic reader already pass.
- Focus acceptance remains pending.

### Evidence

- Guitar Eyes real-device reports and repair history: `docs/real-iphone-acceptance.md`.
- Current candidate implementation: `src/App.js`.
- Browser-return regression coverage: `src/App.test.js`.
- Val Music Vault implementation: `src/admin/AdminWorkspace.tsx`.
- Val Music Vault acceptance records: `docs/phase-7-real-iphone-checkpoint-20-refresh-recovery-finalization.md` and `docs/phase-7-real-iphone-checkpoint-21-resume-feedback.md`.

### Derived shared candidate

A native iOS picker is an external browser-boundary transition, not merely a React rendering transition. Preserve the committed-target focus request until Safari signals that the web document is visible and focused again. Real-device acceptance remains mandatory.

---

## GE-003 — Temporary GitHub Pages publication can contaminate the upstream-tracking main branch

State: `local-proven`

### Symptoms

The working branch could build successfully, but GitHub Pages environment protection rejected deployment from that branch. A temporary publication mechanism used `main`, creating a risk that the fork's clean upstream-tracking branch would retain publisher-only commits.

### Constraints

- Preserve `Phlypper/guitar-eyes` untouched.
- Preserve fork `main` as a clean upstream-tracking branch.
- Work only on `work/iphone-voiceover-tablature-audit`.
- Do not open a pull request.

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

## Cross-repository candidates

### XR-VOICEOVER-FOCUS-001

State: `cross-repository-proven`

State-driven committed-target VoiceOver focus pattern:

- pending focus state/ref;
- `useLayoutEffect` after commit;
- persistent destination;
- `preventScroll`;
- automatic DOM regression coverage;
- bounded real-iPhone VoiceOver acceptance.

Source of strongest evidence: Val Music Vault Phase 7.

### XR-IOS-PICKER-FOCUS-001

State: `candidate`

External native-picker return pattern:

- retain the pending focus request beyond the React commit;
- respond to page visibility and browser-return events;
- defer the focus operation until Safari has restored web content;
- clear pending state only after confirming the persistent target is active;
- require hosted real-iPhone acceptance.

Source of current evidence: Guitar Eyes GE-002. Do not propagate this as proven until the owner passes the retest.

### XR-REAL-DEVICE-001

State: `cross-repository-proven`

Automated DOM focus and accessibility tests are necessary but insufficient. Claims about VoiceOver focus, announcement clarity, control discoverability, and state transitions require real-device acceptance on the owner's iPhone.

### XR-REPOSITORY-AUTHORITY-001

State: `cross-repository-proven`

Before implementation, reconstruct authority from repository branches, commits, current-state documents, hosted state, and acceptance records. Do not rely on a prompt or chat memory alone.

---

## Entry template

Copy this section for each new entry.

```markdown
## REPO-### — Short problem title

State: `candidate | local-proven | cross-repository-proven | failed-do-not-repeat | superseded`

### Symptoms

### Cause

### Constraints

### Failed-do-not-repeat approaches

### Proven solution

### Evidence

### Applies to

### Cross-repository transfer status

### Derived standard
```

## Maintenance rule

Do not delete failed approaches merely because the current implementation works. A failed approach is durable protection against repeating the same waste. Mark obsolete entries `superseded` and link to the replacement.

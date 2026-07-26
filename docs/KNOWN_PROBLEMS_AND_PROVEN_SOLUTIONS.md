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

### Proven solution

Use the Val Music Vault committed-target pattern as the foundation, then preserve the request across the external picker boundary:

1. Synchronize the decisive state transition with `flushSync` when necessary.
2. Store a dedicated pending-focus marker.
3. Use `useLayoutEffect` after React commits the persistent target.
4. Keep the pending request durable beyond that initial commit.
5. Listen for `window` focus, `pageshow`, and document `visibilitychange`.
6. When the page is visible again, wait for two animation frames so Safari can finish restoring web content.
7. Focus the persistent `iPhone tablature reader` heading with `focus({ preventScroll: true })`.
8. Clear the request only after the heading is confirmed as `document.activeElement`.
9. Retain the direct committed-state attempt for browsers that do not leave the web document.
10. Cover both the ordinary DOM focus contract and the browser-return event contract automatically.
11. Require hosted real-iPhone VoiceOver acceptance.

### Acceptance result

On the refreshed hosted build, the owner selected the same fixture once. VoiceOver recovered from the native Files picker and landed on the successful result announcement:

`Loaded five synchronized positions in iPhone reader mode.`

The parser, semantic reader, browser-return focus recovery, and useful completion announcement all passed on the real target device.

### Evidence

- Real-device failure history and final pass: `docs/real-iphone-acceptance.md`.
- Proven implementation: `src/App.js`.
- Browser-return regression coverage: `src/App.test.js`.
- Repair commits: `7031e3581840c36ce3cd83e1907b1e77e41b31cd` and `539e7c97a75f02da250f53eeb4c9062ad6680479`.
- Exact published repair source: `fc91883edf079a0f0f92eda6a679d31dacedc939`.
- Automated gate: dependency installation, all 14 tests, and production build passed.
- Hosted gate: GitHub Pages publication passed, followed by clean restoration of fork `main`.
- Val Music Vault foundation: `src/admin/AdminWorkspace.tsx` and its Phase 7 acceptance records.

### Derived shared standard

A native iOS picker is an external browser-boundary transition, not merely a React rendering transition. Preserve the committed-target focus request until Safari signals that the web document is visible and focused again, allow Safari to finish restoring web content, then focus the persistent result and clear the request only after confirming success.

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

## GE-004 — Navigation controls repeat full playing instructions

State: `candidate`

### Symptoms

On the real iPhone convergence preview, the accepted control order remained intact and movement worked, but VoiceOver repeated the full string and fret instructions when the owner encountered or activated:

- Previous position;
- Next position;
- Previous tablature block;
- Next tablature block.

Only `Read current position` should announce what strings, frets, open strings, silence, or notation the musician should play. Movement controls should move and, at most, announce concise location.

### Cause

Two separate mechanisms exposed the fingering description through navigation:

1. the shared movement handler sent `describePosition`, including full playing instructions, to the live region after every position or block move;
2. the position and block navigation groups referenced the full current-position description through `aria-describedby`, so VoiceOver could repeat the instructions when navigating onto the controls even before activation.

The desktop keyboard navigator also included the full current-position description in its `aria-describedby` relationship.

### Failed-do-not-repeat approaches

1. Do not treat all semantic information as equally appropriate for every control event.
2. Do not reuse the full instructional description as a movement announcement.
3. Do not attach a dynamic fingering paragraph to a navigation group merely because it provides context.
4. Do not accept correct control order and correct movement as sufficient when the speech contract is wrong.
5. Do not rely only on tests that verify visible text changes; live-region content and accessible descriptions must be tested separately.

### Candidate solution

1. Maintain a dedicated location-only formatter containing block, measure, position-within-measure, and overall position.
2. Use that formatter for Previous, Next, keyboard movement, Home, End, and block jumps.
3. Reserve the full `describePosition` playing instructions for `Read current position` and the visible current-position paragraph.
4. Remove the full fingering paragraph from `aria-describedby` on position and block navigation groups.
5. Describe the desktop keyboard navigator only with its static keyboard help.
6. Add tests requiring movement live regions to contain no `string`, `fret`, or `open` instruction while requiring `Read current position` to provide the full description.
7. Require hosted real-iPhone VoiceOver acceptance before changing this entry to `local-proven`.

### Evidence

- Exact real-device report and repair state: `docs/real-iphone-acceptance.md`.
- Shared location formatter: `src/navigationAnnouncements.js`.
- iPhone implementation and regression tests: `src/IPhoneTabReader.js` and `src/IPhoneTabReader.test.js`.
- Desktop implementation and regression tests: `src/DesktopTabReader.js` and `src/DesktopTabReader.test.js`.
- Formatter tests: `src/navigationAnnouncements.test.js`.

### Applies to

Any interface where one control changes selection or location and a separate control deliberately reads detailed content.

### Cross-repository transfer status

Candidate for a general accessibility distinction between navigation feedback and content instruction.

### Derived standard

Movement answers “where am I now?” Reading answers “what is here?” Do not collapse those two speech acts into one announcement.

---

## Cross-repository standards

### XR-VOICEOVER-FOCUS-001

State: `cross-repository-proven`

State-driven committed-target VoiceOver focus pattern:

- pending focus state or ref;
- `useLayoutEffect` after commit;
- persistent destination;
- `preventScroll`;
- automatic DOM regression coverage;
- bounded real-iPhone VoiceOver acceptance.

Source of strongest internal-transition evidence: Val Music Vault Phase 7.

### XR-IOS-PICKER-FOCUS-001

State: `cross-repository-proven`

External native-picker return pattern:

- retain the pending focus request beyond the React commit;
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
- separate mandatory authenticated-environment verification from work Chat and connectors can complete;
- identify unavailable external actions before the session begins;
- keep manual iPhone testing outside Work;
- state the exact stop condition;
- classify the complete execution envelope honestly as focused or verification-heavy, independent of diff size;
- never predict a credit percentage or promise low metered usage without reliable platform evidence.

Use the least expensive capable environment for each part without weakening security, accessibility, build, repository-authority, or real-device evidence. Do not transfer connector or workflow limitations to the owner until Chat, connector, CLI, and REST routes have been checked.

Source and failure evidence: Val Music Vault `VMV-007` in `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`.

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

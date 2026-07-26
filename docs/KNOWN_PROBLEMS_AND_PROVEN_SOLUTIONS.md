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
- Expose explicit Open and Close Mac keyboard instruction controls.

### Evidence

- Real-iPhone VoiceOver acceptance.
- `docs/real-iphone-acceptance.md`.

### Derived standard

Responsive accessibility includes reading order and disclosure state, not only responsive visual layout.

---

## GE-002 — VoiceOver focus is lost after the native iOS file picker closes

State: `local-proven`

Cross-repository foundation: `BlindAnatomist/val-music-vault`

### Symptoms

After selecting a file in the iPhone Files picker, Safari and VoiceOver may return to browser chrome or the Page Menu rather than the application result. The problem occurs after both successful and failed imports.

### Cause

There are two separate transition boundaries:

1. React must commit the persistent result or error target.
2. Safari must finish returning from the external native Files picker and return control to the web document.

Focusing only during React commit can happen before Safari completes the second boundary. Safari then overwrites page focus with browser chrome.

### Failed-do-not-repeat approaches

1. Do not rely on the browser to restore useful focus automatically.
2. Do not use arbitrary delayed timer chains that repeatedly call `focus()`.
3. Do not declare the repair complete because `document.activeElement` is correct in a DOM test.
4. Do not assume `flushSync` plus `useLayoutEffect` alone covers an external picker boundary.
5. Do not implement durable focus only for successful parsing. Failure crosses the same boundary.

### Proven solution

1. Synchronize the decisive state transition with `flushSync` when necessary.
2. Store a dedicated pending-focus target, not merely a success flag.
3. Use a persistent success heading and persistent error heading.
4. Attempt focus after React commits.
5. Keep the request durable beyond that first attempt.
6. Listen for `window` focus, `pageshow`, and document `visibilitychange`.
7. When the page becomes visible, wait for two animation frames so Safari can finish restoring web content.
8. Focus with `preventScroll: true`.
9. Clear the request only after the intended heading is confirmed as active.
10. Test success and failure paths automatically.
11. Require hosted real-iPhone acceptance.

### Acceptance result

Real-iPhone acceptance passed for valid guitar, valid bass, multiple guitar blocks, and the repaired failure boundary. Focus returned to `iPhone tablature reader` after successful imports rather than remaining on Safari chrome.

### Evidence

- `src/App.js`.
- `src/App.test.js`.
- `docs/shared-semantic-core-repair-automated-result.md`.
- Shared-core and later real-iPhone checkpoint records.

### Derived shared standard

A native iOS picker is an external browser-boundary transition whether the operation succeeds or fails. Preserve a target-specific focus request until Safari has returned control to the visible web document, then focus the persistent destination and clear the request only after confirmation.

---

## GE-003 — Temporary GitHub Pages publication can contaminate the upstream-tracking main branch

State: `local-proven`

### Symptoms

GitHub Pages environment protection rejected deployment from the work branch. A temporary publication mechanism had to use fork `main`, creating a risk that publisher-only commits would remain there.

### Constraints

- Preserve `Phlypper/guitar-eyes` untouched.
- Preserve fork `main` as a clean upstream-tracking branch.
- Work only on authorized branches.
- Do not open a pull request unless explicitly authorized.

### Proven solution

1. Use a tightly bounded temporary publisher only when hosted iPhone acceptance is required.
2. Make testing and build prerequisites for deployment.
3. Record the exact source checkpoint, run ID, and verdict on the work branch.
4. Inspect the deployed artifact rather than trusting source alone.
5. Force-restore fork `main` to the exact upstream commit.
6. Compare `main` against upstream and require identical, zero ahead, zero behind, and no changed files.

### Evidence

- Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Rhythm and measure checkpoint workflow records.

### Derived shared standard

A temporary deployment workaround is incomplete until repository authority is restored and independently compared, not merely assumed clean.

---

## GE-004 — The instrument selector and uploaded document can disagree

State: `local-proven`

### Symptoms

A valid four-string bass file could fail while the selector still said Guitar. Later, a two-block six-string guitar file was misread as custom-tuned bass because the detector tried the selected instrument first and accepted incomplete structural evidence.

### Cause

Instrument identity was treated as an infallible interface prerequisite. Early alternate parsing also checked whether lines could be grouped in fours or sixes without first validating the complete contiguous string-run structure.

### Failed-do-not-repeat approaches

1. Do not require the user to select the correct instrument before choosing a file.
2. Do not accept a four-line subset of a six-line block as a complete bass document.
3. Do not infer instrument identity from a parser's willingness to consume partial structure.

### Proven solution

1. Inspect complete contiguous tablature string runs.
2. A six-line run qualifies as guitar, not bass.
3. A four-line run qualifies as bass, not guitar.
4. Use the selected instrument only to break a genuine structural tie.
5. Parse the structurally valid candidate into the shared semantic document.
6. Update the selector automatically.
7. Announce the detected instrument.
8. Preserve the legacy desktop parser only when semantic interpretation is unsafe.

### Acceptance result

Real-iPhone acceptance passed in both directions:

- Bass uploaded while Guitar was selected automatically resolved to Bass.
- Two six-string guitar blocks uploaded while Bass was selected automatically resolved to Guitar.
- Guitar speech used High E, B, G, D, A, and Low E rather than numbered custom-tuning descriptions.

### Evidence

- `src/tabImportCoordinator.js`.
- `src/tabImportCoordinator.test.js`.
- `src/App.sharedCore.test.js`.

---

## GE-005 — A successful deployment can still hand the tester stale code

State: `local-proven`

### Symptoms

The GitHub Pages address remains stable between checkpoints. Safari can reuse an earlier build while repository and workflow records show that a newer deployment succeeded.

A further handoff error occurred when a build label existed only as an ordinary paragraph. VoiceOver correctly read the first page heading instead of automatically announcing the buried paragraph, making the acceptance instruction false.

### Failed-do-not-repeat approaches

1. Do not assume a query string alone proves that Safari loaded the intended build.
2. Do not tell the tester that VoiceOver will announce ordinary paragraph text automatically on page load.
3. Do not verify only that an identity string exists somewhere in source or compiled JavaScript.
4. Do not leave two conflicting build labels in the accessibility tree.

### Proven solution

1. Give every acceptance build a unique page title.
2. Place the build identity in static HTML before the React root.
3. Make it the first level-one heading in document order.
4. Remove obsolete build labels from the accessibility tree.
5. Add no-cache metadata hints.
6. Provide a versioned query string.
7. Verify the exact built `index.html`, not only source.
8. Download and inspect the deployed Pages artifact.
9. Require the tester to confirm the first heading before uploading a fixture.

### Acceptance result

Real-iPhone VoiceOver acceptance passed beginning with Shared semantic core repair 2 and continued through rhythm and measure checkpoints.

### Derived standard

An acceptance-build identity must be part of deterministic document order, not a hoped-for live announcement.

---

## GE-006 — Previous and Next controls speak the full musical description

State: `local-proven`

### Symptoms

VoiceOver announced string and fret instructions while encountering or activating Previous and Next. The user could not tell whether the description referred to the position being left, the position being entered, or the button itself.

### Cause

The navigation group was connected to the current-position description through `aria-describedby`, and movement also wrote the same description into a live region.

### Failed-do-not-repeat approaches

- Do not attach the full musical description to movement controls.
- Do not make a movement action double as an automatic read action.
- Do not interpret repeated speech as harmless verbosity; it destroys temporal clarity.

### Proven solution

1. Previous and Next only change position.
2. Movement writes nothing to the live region.
3. No navigation button inherits the current-position description.
4. Current position appears once in ordinary swipe order.
5. Read current position is the only explicit action that speaks the complete instruction.

### Acceptance result

Real-iPhone acceptance passed. Previous and Next move quietly; Read current position speaks on demand.

### Derived standard

Navigation answers “where to move.” Content speech answers “what is here.” Do not fuse the two contracts.

---

## GE-007 — Ordinary blank strings are announced as silent

State: `local-proven`

### Symptoms

Some positions suddenly included statements that one or more strings were silent, while positions using all strings did not. The inconsistency sounded as though silence had special musical meaning.

### Cause

The semantic model correctly stored inactive strings, but the speech layer verbalized every absence as an instruction.

### Proven solution

1. Preserve inactive-string state in the semantic model.
2. Omit ordinary inactive strings from spoken playing instructions.
3. Continue announcing open strings, fret numbers, and explicit mute notation such as `x`.

### Acceptance result

Real-iPhone bass acceptance passed. The reader now names only what the player must do.

### Derived standard

Semantic completeness and spoken usefulness are different layers. Preserve absence in data; speak it only when it is an actionable instruction.

---

## GE-008 — Position-control order makes repeated practice awkward

State: `local-proven`

### History

The controls were first ordered Read current, Previous, Next. The owner later determined that Previous, Read current, Next is more natural because the primary content action sits between backward and forward movement.

### Proven solution

Use this exact position-control order:

1. Previous position.
2. Read current position.
3. Next position.

Keep upload focus on the reader heading, not on the initially disabled Previous button.

### Acceptance result

Real-iPhone acceptance passed during Measure Recognition Checkpoint 1. The owner explicitly approved the centered arrangement.

### Derived standard

Control order should support the repeated motor sequence of practice, while initial focus should land on stable context rather than the first control.

---

## GE-009 — Technique symbols and barlines become fake musical positions

State: `local-proven`

### Symptoms

Raw notation symbols can appear at their own source columns. If every token column becomes a semantic position, a barline or technique connector can be presented as though it were a note onset.

### Cause

Source-column preservation was being confused with playable-event identity.

### Proven solution

1. Preserve raw notation tokens and source columns.
2. Give durations only to playable onset positions.
3. Exclude technique-only positions from independent rhythm assignment.
4. Recognize barlines structurally when their columns align across every string.
5. Remove shared barline columns from semantic position navigation.
6. Preserve visible barlines in Jason's desktop rows.

### Evidence

- `src/asciiRhythm.js`.
- `src/measureModel.js`.
- Rhythm and measure checkpoint tests.

### Derived standard

The source is a notation surface; the semantic reader is an event model. Not every printed symbol is a separate event.

---

## GE-010 — Misaligned barlines tempt the parser to invent measures

State: `local-proven`

### Symptoms

The first project-authored two-measure fixture accidentally used different column lengths on the played and blank strings. A permissive parser could have forced a plausible two-measure interpretation.

### Proven solution

1. Recognize an explicit barline only when the same vertical-bar column exists across every string in the block.
2. Preserve misaligned bars without assigning measure metadata.
3. Add a parsing warning.
4. Correct malformed fixtures rather than weakening the rule.
5. Calculate measure duration totals only when all playable positions have mapped durations.

### Acceptance result

The corrected two-measure fixture passed automated and real-iPhone acceptance. Measure number, position within measure, duration, and fret instructions were coherent.

### Derived standard

Refuse plausible musical guesses when source structure is contradictory. Strict uncertainty is better than false precision.

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

### XR-ACCESSIBLE-BUILD-IDENTITY-001

State: `cross-repository-proven`

For hosted accessibility acceptance on a stable URL:

- unique static page title;
- unique first heading before the application root;
- one identity in the accessibility tree;
- built-artifact ordering assertion;
- downloaded deployed-artifact inspection;
- real-device confirmation before functional testing.

Source: Guitar Eyes GE-005.

### XR-SPEECH-CONTRACT-SEPARATION-001

State: `cross-repository-proven`

Keep navigation, status, and content-description speech separate:

- navigation controls announce their labels and move only;
- status regions report state transitions;
- a dedicated content action speaks the complete current item;
- passive data that is not actionable remains available in the model but need not be verbalized.

Source: Guitar Eyes GE-006 and GE-007.

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
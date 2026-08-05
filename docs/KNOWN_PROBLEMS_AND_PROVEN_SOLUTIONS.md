# Known Problems and Proven Solutions

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Last reconciled: August 5, 2026

## Purpose

This is the first document to inspect before diagnosing or repairing implementation, deployment, accessibility, testing, or repository-administration problems. It preserves accepted behavior, failed approaches, and evidence so a later thread or worker does not rebuild from an older branch or a thinner contract.

Do not treat chat memory, a passing build, or a recently modified branch as authoritative when repository ancestry and accepted evidence are available.

The mandatory cross-repository execution reconciliation is:

`docs/cross-repository-execution-governance-reconciliation-2026-08-05.md`

The detailed hosted-run, fail-forward, transport, formatter, and bounded-owner-action rules are in:

`docs/known-problems-register-addendum-execution-gates.md`

## Required use

Before changing implementation, deployment, accessibility, testing, workflows, transport, or repository administration:

1. Read this file.
2. Read `docs/implementation-status.md` and `AGENTS.md`.
3. Read `docs/known-problems-register-addendum-execution-gates.md` and the cross-repository execution reconciliation before any GitHub Actions, Work, Codex, connector-heavy, file-transfer, formatting, packaging, generation, or publication task.
4. Inspect the accepted source checkpoint and compare branch ancestry.
5. Search this file and every relevant addendum for a matching symptom, mechanism, or failed approach.
6. Start from an existing proven solution when the same mechanism applies.
7. Preserve inherited tests and add coverage rather than replacing the accepted contract.
8. Record new failures and confirmed solutions here or in the governing addendum before closing the work.

A browser DOM test is evidence, not proof of real VoiceOver behavior. Real-device findings must be preserved exactly and must not be rewritten as stronger claims than the test supports.

Accurate documentation of each individual failure is not enough. When repeated failures reveal a process pattern, the governing rules must change what the next worker is allowed to do.

## Entry states

- `local-proven`: accepted in this repository through the required evidence.
- `cross-repository-proven`: proven elsewhere and deliberately adapted here.
- `candidate`: implemented or plausible but not yet accepted through every required gate.
- `failed-do-not-repeat`: attempted and shown to be inadequate or harmful.
- `superseded`: retained for history but replaced by a better solution.

---

## GE-001 — iPhone users encounter desktop instructions before the iPhone workflow

State: `local-proven`

### Symptoms

On an iPhone with VoiceOver, expanded Mac instructions appeared before reading mode, instrument, and upload controls.

### Proven solution

1. Place reading mode, instrument, and upload controls before desktop instructions.
2. Keep desktop instructions expanded by default on desktop.
3. Collapse desktop instructions by default on coarse-pointer devices.
4. Expose explicit Open and Close Mac keyboard instruction controls.

### Derived standard

Responsive accessibility includes reading order and disclosure state, not only visual layout.

---

## GE-002 — VoiceOver focus is lost after the native iOS file picker closes

State: `local-proven`

Cross-repository foundation: `BlindAnatomist/val-music-vault`

### Symptoms

After successful or failed file selection, Safari and VoiceOver may return to browser chrome or Page Menu rather than the application result.

### Cause

React must first commit a persistent success or error target, and Safari must separately finish returning from the native picker. Focusing only during React commit can occur before Safari completes the second boundary.

### Failed-do-not-repeat approaches

1. Do not rely on automatic browser focus restoration.
2. Do not use arbitrary timer chains that repeatedly call `focus()`.
3. Do not declare success because `document.activeElement` is correct only in a DOM test.
4. Do not implement durable recovery only for successful imports.

### Proven solution

1. Synchronize the decisive state transition with `flushSync` when necessary.
2. Store a target-specific pending-focus request.
3. Use persistent success and error headings.
4. Attempt focus after React commit.
5. Retain the request across the external picker boundary.
6. Listen for `window` focus, `pageshow`, and `visibilitychange`.
7. Wait two animation frames after the page becomes visible.
8. Focus with `preventScroll: true`.
9. Clear the request only after the intended target is active.
10. Test success and failure paths automatically.
11. Require hosted real-iPhone acceptance.

### Acceptance result

Real-iPhone acceptance passed for valid guitar, valid bass, multiple guitar blocks, and failed imports.

---

## GE-003 — Temporary GitHub Pages publication can contaminate fork main

State: `local-proven`

### Symptoms

The `github-pages` environment permits only `main`, while fork `main` must remain identical to upstream.

### Proven solution

1. Use a bounded temporary publisher only for an intentional hosted checkpoint.
2. Have the temporary workflow explicitly check out the exact verified work-branch commit.
3. Make tests and production build prerequisites for deployment.
4. Inspect the deployed artifact and hosted assets.
5. Restore fork `main` immediately to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
6. Require an independent comparison showing identical, zero ahead, zero behind, and zero changed files.

### Derived standard

A deployment workaround is incomplete until repository authority is restored and independently verified.

---

## GE-004 — The instrument selector and uploaded document can disagree

State: `local-proven`

### Symptoms

A valid four-string bass file could fail while Guitar was selected. A two-block six-string guitar file could be misread as bass when incomplete structural evidence was accepted.

### Proven solution

1. Inspect complete contiguous tablature-string runs.
2. A six-line run qualifies as guitar, not bass.
3. A four-line run qualifies as bass, not guitar.
4. Use the selected instrument only to break a genuine structural tie.
5. Parse the structurally valid candidate into the shared semantic document.
6. Update the selector and load status when the instrument is detected.
7. Use the legacy desktop parser only when semantic interpretation is unsafe.

### Acceptance result

Real-iPhone acceptance passed in both detection directions with ordinary guitar and bass string names.

---

## GE-005 — A successful deployment can still hand the tester stale code

State: `local-proven`

### Symptoms

The Pages address remains stable and Safari may reuse an earlier build. A build label placed only in an ordinary paragraph is not an automatic VoiceOver announcement.

### Proven solution

1. Give each acceptance build a unique page title.
2. Put the build identity in static HTML before the React root.
3. Make it the first level-one heading in document order.
4. Keep only one build identity in the accessibility tree.
5. Add conservative no-cache metadata hints.
6. Provide a versioned query string.
7. Verify built `index.html` and the downloaded deployed artifact.
8. Require the tester to confirm the first heading before functional testing.

---

## GE-006 — Movement controls speak the full musical instruction

State: `local-proven`

### Symptoms

VoiceOver announced strings and frets while encountering or activating Previous, Next, or block-navigation controls.

### Cause

Navigation inherited the current-position description through `aria-describedby`, or movement wrote the full description into a live region.

### Failed-do-not-repeat approaches

1. Do not attach the full musical description to movement controls.
2. Do not make movement double as an automatic read action.
3. Do not dismiss repeated speech as harmless verbosity; it destroys temporal clarity.

### Proven solution

1. Previous and Next change position only.
2. Tablature-block movement changes block only.
3. Movement writes nothing to the live region.
4. Navigation buttons do not inherit the current-position description.
5. Read current position is the only explicit action that speaks the complete instruction.

### Acceptance result

Real-iPhone acceptance passed before convergence work. This contract applies to both interfaces.

### Derived standard

Navigation answers where to move. Content speech answers what is here. Do not fuse the contracts.

---

## GE-007 — Ordinary blank strings are announced as silent

State: `local-proven`

### Symptoms

Spoken instructions enumerated strings that the player does not play, making ordinary absence sound musically significant.

### Proven solution

1. Preserve inactive-string state in the semantic model.
2. Omit ordinary inactive strings from spoken playing instructions.
3. Continue announcing open strings, fret numbers, techniques, and explicit mute notation such as `x`.
4. A spatial table may expose inactive cells for structural exploration, but the dedicated playing instruction must remain actionable and compact.

### Acceptance result

Real-iPhone acceptance passed. The reader names what the player must do rather than every stored state.

---

## GE-008 — Position-control order makes repeated practice awkward

State: `local-proven`

### Proven solution

Use this exact order in both interfaces:

1. Previous position.
2. Read current position.
3. Next position.

Initial upload focus belongs on the stable reader heading, not the initially disabled Previous button.

### Acceptance result

The owner explicitly accepted this order during Measure Recognition Checkpoint 1.

---

## GE-009 — Technique symbols and barlines become fake musical positions

State: `local-proven`

### Cause

Source-column preservation was confused with playable-event identity.

### Proven solution

1. Preserve raw notation tokens and source columns.
2. Assign durations only to playable onset positions.
3. Exclude technique-only positions from independent rhythm assignment.
4. Recognize a barline only when it aligns across every string.
5. Remove shared barlines from semantic position navigation.
6. Preserve visible barlines in original desktop source rows.

### Derived standard

The source is a notation surface; the semantic reader is an event model. Not every printed symbol is a separate event.

---

## GE-010 — Misaligned barlines tempt the parser to invent measures

State: `local-proven`

### Proven solution

1. Recognize an explicit barline only when the same column contains a barline on every string.
2. Preserve misaligned bars without assigning measure metadata.
3. Add a parsing warning.
4. Correct malformed fixtures rather than weakening the rule.
5. Calculate measure-duration totals only when every playable position has a mapped duration.

### Acceptance result

The corrected two-measure fixture passed automated, hosted, and real-iPhone acceptance with coherent measure, position, duration, and fret speech.

---

## GE-011 — Convergence was built from the wrong branch lineage

State: `failed-do-not-repeat`

### Symptoms

A convergence preview passed a rewritten test suite and production build but reintroduced already solved failures:

1. movement controls spoke full playing instructions;
2. ordinary unplayed strings were announced;
3. accepted duration speech disappeared;
4. accepted rhythm, measure, import, and speech work was absent.

### Cause

The work began from `work/iphone-voiceover-tablature-audit` rather than the accepted rhythm-and-measure source. Direct comparison later showed the published convergence source was on a diverged line and 120 commits behind the accepted foundation.

### Failed-do-not-repeat approaches

1. Do not identify authority from branch names, recent modification time, chat memory, or a previous checkpoint prompt.
2. Do not replace inherited tests with a thinner suite and treat green results as preservation evidence.
3. Do not repair a wrong-lineage branch symptom by symptom.
4. Do not spend metered verification or publication resources before proving ancestry.

### Proven recovery procedure

1. Compare the proposed source directly against the accepted checkpoint before implementation.
2. Preserve the failed branch as forensic evidence.
3. Create the recovery branch directly from `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
4. Treat accepted speech, rhythm, measure, import, focus, and control contracts as immutable regressions.
5. Preserve the inherited suite and add convergence coverage.
6. Verify ancestry again before any hosted execution.
7. Publish only after the built artifact proves the accepted foundation remains present.

### Evidence

- `docs/convergence-lineage-recovery-2026-07-26.md`.
- Failed published source: `d26e4172a0386ceb56ad5c0061e72d975b42fc43`.
- Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.

### Derived standard

Passing tests establish only the contract they contain. Source ancestry and preservation of inherited tests are separate mandatory evidence.

---

## GE-012 — Desktop convergence can overwrite the accepted iPhone engine

State: `candidate`

### Risk

Replacing the application parser or semantic model in order to improve desktop presentation can erase accepted iPhone behavior and create two disagreeing interpretations of the music.

### Candidate solution on the recovery branch

1. Keep `iphoneTabModel.js`, `asciiRhythm.js`, `measureModel.js`, `tabImportCoordinator.js`, `positionDescription.js`, and `IPhoneTabReader.js` unchanged from the accepted foundation.
2. Feed the same accepted semantic document to both interfaces.
3. Present desktop strings as rows and synchronized positions as columns in a standard table.
4. Preserve the original spatial source rows in a collapsed disclosure.
5. Keep quiet movement and dedicated Read current speech in both interfaces.
6. Keep the original grid only as a clearly labeled compatibility fallback when semantic interpretation is unsafe.
7. Do not intercept VoiceOver Control+Option commands in either desktop path.
8. Keep raw fallback cells out of the ordinary Tab sequence.
9. Add convergence tests without replacing inherited tests.

### Acceptance boundary

Static JSX parsing has passed for the changed source and tests. Locked dependency installation, the complete inherited and new test suite, production build, hosted artifact inspection, and bounded real-iPhone regression remain required before this becomes `local-proven`.

---

## Cross-repository standards

### XR-VOICEOVER-FOCUS-001

State: `cross-repository-proven`

State-driven committed-target focus requires a persistent destination, target-specific pending state, post-commit focus, `preventScroll`, automated coverage, and bounded real-device acceptance.

### XR-IOS-PICKER-FOCUS-001

State: `cross-repository-proven`

An external native picker requires durable focus state across browser return events and target confirmation before clearing the request.

### XR-ACCESSIBLE-BUILD-IDENTITY-001

State: `cross-repository-proven`

Hosted accessibility acceptance on a stable URL requires a unique static title, a unique first heading before the application root, built-artifact verification, deployed-artifact inspection, and real-device confirmation.

### XR-SPEECH-CONTRACT-SEPARATION-001

State: `cross-repository-proven`

Keep navigation, status, and content speech separate:

- navigation controls label and move;
- status regions report transitions;
- a dedicated content action speaks the full current item;
- passive non-actionable data remains in the model without mandatory speech.

### XR-SOURCE-LINEAGE-001

State: `cross-repository-candidate`

Before metered verification or publication, prove that the work branch descends from the accepted checkpoint, has zero commits behind it, and retains the inherited acceptance tests. A green replacement suite is not lineage evidence.

### XR-EXECUTION-SCOPE-001

State: `cross-repository-proven`

Before using Work, Codex, GitHub Actions, or another metered environment:

1. define the exact source-change boundary;
2. separate tasks by the least expensive capable environment;
3. keep owner-operated testing outside metered work;
4. inspect failures before reruns;
5. never infer credit use from diff size;
6. preserve required evidence rather than weakening the gate.

### XR-HOSTED-CIRCUIT-BREAKER-001

State: `cross-repository-proven`

After one failed hosted run, diagnose and batch corrections outside Actions. Permit at most one corrective run. If that run exposes another defect, the circuit is open and no further workflow activity is permitted without a capable unmetered environment or one explicitly authorized, materially different exception.

Detailed rule: GE-018 in `docs/known-problems-register-addendum-execution-gates.md`.

### XR-PERSISTENT-ACCEPTANCE-001

State: `cross-repository-proven`

Acceptance must fail forward. Preserve valid lasting source, fixtures, manifests, canonical exports, and evidence before later broad tests when possible; remove temporary machinery without deleting lasting work; and repair later failures directly instead of regenerating accepted output.

Detailed rule: GE-019 in `docs/known-problems-register-addendum-execution-gates.md`.

### XR-INTACT-FILE-TRANSPORT-001

State: `cross-repository-proven`

After two failures with one connector or transport method, stop that method. Move intact files as intact objects, use the simplest safe transport, and reserve capable environments for transformation and proof.

Detailed rule: GE-020 in `docs/known-problems-register-addendum-execution-gates.md`.

### XR-FORMATTER-FIXED-POINT-001

State: `cross-repository-proven`

When a pinned formatter exists, format to a fixed point, inspect the stable diff, then run acceptance. Formatting is preparation and must not be discovered through repeated hosted runs.

Detailed rule: GE-021 in `docs/known-problems-register-addendum-execution-gates.md`.

### XR-BOUNDED-OWNER-ACTION-001

State: `cross-repository-proven`

One exact, authorized, VoiceOver-manageable owner dashboard or file action may be safer than prolonged connector improvisation when assistant tools cannot perform the same exact operation. The assistant retains responsibility for exact instructions and independent verification.

Detailed rule: GE-022 in `docs/known-problems-register-addendum-execution-gates.md`.

## Maintenance rule

When a problem recurs, takes more than one serious attempt, requires a non-obvious workaround, or can be mistaken for a platform limitation, update this file or the governing addendum before closing the checkpoint.

Do not delete failed approaches merely because the current implementation works. A failed approach is durable protection against repeating the same waste.

A future worker must not rely on chat memory alone.

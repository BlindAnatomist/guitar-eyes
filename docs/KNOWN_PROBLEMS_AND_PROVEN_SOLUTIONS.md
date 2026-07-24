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

## GE-002 — VoiceOver focus is lost after a selected tablature file creates the semantic reader

State: `candidate`

Cross-repository source: `BlindAnatomist/val-music-vault`

### Symptoms

After selecting a valid six-string text file in the iPhone file picker:

- parsing succeeded;
- five synchronized positions loaded;
- the iPhone tablature reader was understandable;
- Safari/VoiceOver focus returned to a page-menu location rather than the new reader heading;
- the user had to swipe back into the application to find the result.

### Cause class

A file-picker return is followed by React state changes that create a new persistent result target. Focusing before that committed target exists, or relying on the browser to restore useful focus, is unreliable on real iPhone VoiceOver.

### Failed-do-not-repeat approach

Do not use a chain of arbitrary delayed timers that repeatedly calls `focus()` in the hope that one attempt lands after rendering. This was proposed here and withdrawn before acceptance because it ignored a stronger pattern already proven in Val Music Vault.

### Cross-repository proven pattern to adapt

Val Music Vault established the stronger transition pattern:

1. Synchronize the decisive state transition with `flushSync` when necessary.
2. Store a dedicated pending-focus marker or focus-request state.
3. Use `useLayoutEffect` after React commits the persistent target.
4. Focus the target with `focus({ preventScroll: true })`.
5. Ensure the destination remains in the DOM after the initiating control or prior content disappears.
6. Test the DOM focus contract automatically.
7. Treat automated focus tests as necessary but insufficient.
8. Require a bounded real-iPhone VoiceOver retest before marking the repair proven.

### Current Guitar Eyes repair boundary

- Target: the persistent `iPhone tablature reader` heading.
- Expected behavior: after successful file parsing and reader creation, VoiceOver focus lands on that heading rather than Safari page controls or the removed/replaced upload context.
- Acceptance remains pending until the corrected hosted build passes automation and the owner confirms it on the real iPhone.

### Evidence

- Guitar Eyes owner report recorded in `docs/real-iphone-acceptance.md`.
- Val Music Vault implementation: state-driven focus requests, `useLayoutEffect`, persistent targets, and `preventScroll` in `src/admin/AdminWorkspace.tsx`.
- Val Music Vault acceptance records: `docs/phase-7-real-iphone-checkpoint-20-refresh-recovery-finalization.md` and `docs/phase-7-real-iphone-checkpoint-21-resume-feedback.md`.

### Derived shared standard

When React replaces or creates the meaningful VoiceOver destination, focus restoration must be state-driven and tied to the committed persistent target. Never begin with timer spraying when an accepted state-driven pattern already exists.

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

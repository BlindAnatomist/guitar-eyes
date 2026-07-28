# Known Problems and Proven Solutions: Execution Gate Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Date: July 28, 2026

This addendum must be read with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` before designing or repairing a GitHub-hosted verification gate.

---

## GE-015 — A compact shell authority guard can fail without identifying the false assertion

State: `local-proven`

### Symptoms

Playback Timing Foundation Checkpoint 1 checked out the correct source but failed at `Confirm authority and bounded diff`. Node setup, dependency installation, tests, build, artifact inspection, and evidence upload were all skipped.

The guard combined ancestry, worktree, changed-file, required-string, and forbidden-token assertions in one compact shell block. The available step summary identified only the step, not the precise false condition.

### Evidence boundary

The failed run did not establish a source defect, test failure, build failure, or dependency problem. It established only that one assertion in the shell preflight exited nonzero.

Repository API comparisons separately confirmed the exact source, ancestry, and authorized five-file boundary before a correction was made.

### Failed-do-not-repeat approaches

1. Do not diagnose a source or test defect when installation and tests never ran.
2. Do not rerun the same opaque shell guard hoping that it will pass.
3. Do not add commits to the application branch merely to probe the verification environment.
4. Do not rerun successful or unattempted expensive gates until the failing preflight condition is understood and corrected.
5. Do not compress multiple independent authority assertions into a command whose failure provides no expected-versus-actual evidence.

### Proven solution

1. Inspect the workflow job and step conclusion first.
2. Establish which later gates did not run.
3. Reconfirm source head, ancestry, and changed-file boundaries through the connected repository API when those facts are independently available.
4. Replace opaque shell boolean chains with named Python assertions.
5. Include expected and actual values in assertion failures, especially for changed-file sets.
6. Keep source verification separate from dependency installation, test, build, and artifact gates.
7. Correct only the failed preflight mechanism.
8. Run the still-unperformed expensive gates once.
9. Preserve the first failed run in the checkpoint record rather than rewriting it as a source failure.

### Acceptance result

The first run, `30383593006`, stopped before installation and tests.

The corrected run, `30383944688`, passed:

1. exact source checkout;
2. named authority and five-file boundary assertions;
3. exact dependency installation;
4. complete inherited and new test suite;
5. optimized production build;
6. source and production-asset boundary inspection;
7. one-day evidence upload;
8. source success status recording.

### Derived standard

A verification gate should fail diagnostically, not merely defensively. Authority checks are most useful when a failure reports which invariant broke and what values were observed.

A failed preflight is not evidence that downstream tests or builds failed. Classify only the gate that actually ran.

### Applies to

Any GitHub Actions, Work, Codex, local, or deployment preflight that combines source identity, ancestry, diff boundaries, generated assets, or forbidden-dependency assertions.

---

## Evidence

- Accepted timing source: `2b038b15afa09877f6d8dcf615bc060243578096`.
- Failed preflight run: `30383593006`.
- Corrected successful run: `30383944688`.
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.

## Maintenance rule

Future workers must search this addendum before modifying a verification workflow. Do not use a compact gate merely because it is shorter; use a gate whose failure preserves actionable evidence.
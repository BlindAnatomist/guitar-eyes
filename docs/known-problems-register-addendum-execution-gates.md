# Known Problems and Proven Solutions: Execution Gate Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Last reconciled: August 4, 2026

This addendum must be read with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` before designing or repairing a GitHub-hosted verification or publication gate.

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

The corrected run, `30383944688`, passed exact source checkout, named authority and boundary assertions, dependency installation, the complete suite, optimized production build, source and asset inspection, evidence upload, and success recording.

### Derived standard

A verification gate should fail diagnostically, not merely defensively. A failed preflight is not evidence that downstream tests or builds failed. Classify only the gate that actually ran.

---

## GE-017 — Publication authority can be tested against an invented repository shape

State: `local-proven`

### Symptoms

The first clean convergence 5B publication attempt passed its earlier source work but did not deploy because the publication authority check required the inherited `.github/workflows` directory not to exist.

That condition was not part of the accepted 4C authority. The convergence had not introduced a workflow change; the gate had invented a stronger repository-shape requirement than the baseline actually guaranteed.

### Evidence boundary

The failure did not establish an application defect, test failure, build failure, artifact defect, Pages configuration defect, or unauthorized workflow change. It established that one authority assertion compared against the wrong invariant.

### Failed-do-not-repeat approaches

1. Do not infer that a path must be absent merely because an earlier clean-main commit deleted a similarly named workflow.
2. Do not compare a candidate against a remembered repository shape when an exact accepted base exists.
3. Do not broaden an authority gate from “the checkpoint introduced no workflow changes” to “no workflow path may exist.”
4. Do not rebuild or modify application source to satisfy a false publication assertion.
5. Do not rerun the same gate without identifying whether the expected invariant itself is valid.

### Proven solution

1. Define authority relative to the exact accepted base commit.
2. Compare workflow files between the accepted base and candidate.
3. Require zero workflow-file differences introduced by the candidate.
4. Permit inherited files that are identical to the accepted base.
5. Keep this assertion separate and diagnostic, reporting the exact unexpected workflow paths if any.
6. Correct only the false publication assertion.
7. Run the previously blocked publication path once.
8. Preserve both the failed attempt and corrected result in the checkpoint record.

### Acceptance result

The corrected 5B publication gate proved that no workflow file differed from the accepted 4C base, then passed focused tests, production Pages build, artifact inspection, upload, deployment, and live HTML and JavaScript read-back.

### Derived standard

Repository authority is relational, not aesthetic. Verify that a candidate introduces no unauthorized difference from its exact accepted base; do not substitute an imagined “clean” directory shape.

---

## Applies to

Any GitHub Actions, Work, Codex, local, or deployment preflight that combines source identity, ancestry, changed-file boundaries, inherited repository paths, generated assets, or forbidden-dependency assertions.

## Evidence

- Accepted timing source: `2b038b15afa09877f6d8dcf615bc060243578096`.
- Failed timing preflight run: `30383593006`.
- Corrected timing run: `30383944688`.
- Clean convergence application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`.
- Successful clean convergence run: `30927079592`.
- Successful hosted publication run: `30927636526`.
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.
- `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`.

## Maintenance rule

Future workers must search this addendum before modifying a verification workflow. Do not use a compact or intuitively “clean” gate merely because it is shorter. Use exact accepted-base comparisons and failures that preserve actionable expected-versus-actual evidence.

# Known Problems and Proven Solutions: Execution Gate Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Last reconciled: August 5, 2026

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

## GE-018 — A stream interruption can create overlapping writers that duplicate commits and workflow runs

State: `repository-proven`

### Symptoms

During the PowerTab version-11 producer checkpoint, repeated response-stream interruptions left more than one continuation path acting on the same work branch. Each path believed it was resuming from the last stable point, but the branch had already advanced.

The overlap caused:

- repeated reads and attempted corrections of gates another continuation had already corrected;
- six hosted runs when each checkpoint should have had one deliberate writer;
- duplicate and contradictory run-five records;
- piecemeal evidence commits;
- a transient commit that replaced the canonical fixture manifest with the literal word `TEMP` before a later continuation repaired it;
- an editor JSON audit that silently normalized an upstream misspelled key and therefore ceased to be byte-exact;
- branch-head acknowledgments that were already stale when the next operation began.

### Evidence boundary

The repository ultimately contained six completed workflow runs and no seventh run. The exact run-five editor artifact remained recoverable and hash-verifiable.

Run six was triggered by an overlapping continuation before reconciliation completed. It failed its authority preflight before dependency installation, tests, build, or asset inspection. The failure was not an application defect: the committed JSON audit had changed the editor's literal key `bootleg_relaese_info` to `bootleg_release_info`, so byte equality with the decompressed artifact correctly failed.

The incident did not establish a GitHub, Power Tab Editor, fixture-binary, or application-source defect. It established that a chat-stream interruption must be treated as a concurrency event rather than as permission to continue writing from remembered state.

### Failed-do-not-repeat approaches

1. Do not resume a write path from chat memory after a stream interruption.
2. Do not treat a successful commit API response as proof that its commit is still the branch head.
3. Do not allow two resumed continuations to create sequential contents-API commits on the same branch.
4. Do not create a second failure or result record before listing the current tree and existing records.
5. Do not modify a workflow trigger while implementation, authority, documentation, and cleanup changes are still being assembled.
6. Do not use hosted Actions to discover the next debugging hypothesis when the failed gate can be reproduced against a preserved artifact locally.
7. Do not “repair forward” when the branch ref has moved; discard the stale candidate and inspect the actual head.
8. Do not normalize or prettify an audit file that is required to be a byte-exact representation of producer output.

### Proven solution

1. Immediately enter read-only recovery after any stream interruption.
2. Read the authoritative branch ref, exact head commit, changed-file set, active workflow runs, and existing checkpoint records.
3. Repeat the branch-ref and run-state reads after inspection. Do not write until the head is stable and no unknown run is active.
4. Treat the branch ref—not a previous tool response, chat message, or intended commit—as the sole authority.
5. Reproduce the exact failed mechanism against preserved artifacts before planning another hosted run.
6. Assemble all related file changes into one Git tree and one commit with the observed head as its only parent.
7. Move the branch with a non-forced ref update. This is a compare-and-swap boundary: if another writer advanced the branch, the update must fail and the candidate must be abandoned.
8. Include a workflow trigger only in that same atomic commit, and only after every non-hosted gate has passed and a new hosted checkpoint is actually authorized.
9. After a successful ref update, reread the branch head and list runs for that exact head before doing anything else.
10. Maintain one canonical record per workflow run. Correct or remove contradictory duplicates; do not preserve them as parallel interpretations.
11. Remove temporary workflows, triggers, and helper scripts only after their evidence has been committed and their final run classified.
12. Preserve exact producer bytes exactly. Store explanatory or normalized representations under separate names and never substitute them for a byte-audit file.

### Acceptance result

For PowerTab run five:

- producer execution, graphical Save, structural comparison, and locked dependency installation passed;
- the focused semantic test stopped only because the React Scripts Jest runtime lacked a usable global `TextDecoder`;
- the exact 973-byte editor export remained preserved with SHA-256 `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`;
- local reproduction using Node's `util.TextDecoder` passed fatal UTF-8 decoding, JSON parsing, internal version 11, all six positions, the rest, the two-note chord, title, player, and tuning assertions.

For PowerTab run six:

- branch, ancestry, changed-file boundary, binary size and hash, base64 mirror, gzip decompression, decompressed size and hash all passed before the false audit-file assertion;
- dependency installation, focused tests, the inherited suite, build, and asset inspection did not run;
- the exact JSON audit was restored directly from the preserved gzip payload;
- the temporary run-six workflow and trigger were removed;
- no seventh run was created during reconciliation.

### Derived standard

A stream interruption is a concurrency event, not a continuation prompt. Recovery begins read-only and becomes writable only through one stable-head, non-forced, atomic branch update.

---

## Applies to

Any GitHub Actions, Work, Codex, local, or deployment preflight that combines source identity, ancestry, changed-file boundaries, inherited repository paths, generated assets, forbidden-dependency assertions, exact evidence bytes, or resumed execution after a communication interruption.

## Evidence

- Accepted timing source: `2b038b15afa09877f6d8dcf615bc060243578096`.
- Failed timing preflight run: `30383593006`.
- Corrected timing run: `30383944688`.
- Clean convergence application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`.
- Successful clean convergence run: `30927079592`.
- Successful hosted publication run: `30927636526`.
- PowerTab run-five triggering commit: `407070c33b66a045d69205bdcad6f40baf8738ab`.
- PowerTab run-five workflow: `31037072445`.
- PowerTab run-five artifact: `powertab-v11-direct-gui-evidence-31037072445`.
- PowerTab run-six triggering commit: `61c53912aa434adb3f3867e8f15c58ce2977335d`.
- PowerTab run-six workflow: `31038804754`.
- PowerTab run-six artifact: `powertab-v11-editor-parity-31038804754`.
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.
- `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`.
- `docs/powertab-pt2-v11-hosted-producer-run-5-semantic-harness-failure-2026-08-05.md`.
- `docs/powertab-pt2-v11-editor-parity-run-6-authority-failure-2026-08-05.md`.

## Maintenance rule

Future workers must search this addendum before modifying a verification workflow or resuming after an interrupted execution. Do not use a compact or intuitively “clean” gate merely because it is shorter. Use exact accepted-base comparisons, failures that preserve actionable expected-versus-actual evidence, exact producer bytes, and a stable-head atomic update that rejects concurrent writers.

# Known Problems and Proven Solutions: Execution Gate Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Last reconciled: August 5, 2026

This addendum must be read with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` before designing or repairing a GitHub-hosted verification or publication gate.

The cross-repository execution rules deliberately imported from Val Music Vault are recorded in:

`docs/cross-repository-execution-governance-reconciliation-2026-08-05.md`

Those rules are mandatory. They are not optional background reading.

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

## GE-018 — Hosted acceptance became serial environment discovery

State: `cross-repository-proven`

Cross-repository foundation: Val Music Vault VMV-011

### Symptoms

The PowerTab version-11 producer checkpoint used separate GitHub Actions runs to discover, in sequence:

1. missing Wine launcher discovery;
2. incompatible installer extraction;
3. an unbounded version-probe timeout;
4. MIDI dialogs and unsupported X-window activation;
5. a temporary Jest runtime missing `TextDecoder` after the exact editor save had already succeeded.

Each record accurately classified its immediate failure, but the repository kept authorizing another hosted run. Diagnostic accuracy did not prevent an iterative Actions debugging loop.

### Cause

The local execution rules said to inspect each failure and correct only that mechanism, but they did not impose a hard rerun budget. One successful correction was repeatedly interpreted as permission to discover the next defect in another hosted run.

### Failed-do-not-repeat approaches

1. Do not use GitHub Actions as the place where runtime, GUI, fixture, test-harness, formatter, packaging, or workflow design is discovered one failure at a time.
2. Do not authorize a third run merely because the first two failures were different.
3. Do not treat accurate failure documentation as a substitute for stopping the failing execution pattern.
4. Do not infer broad authorization to finish a feature as authorization for unlimited hosted corrections.
5. Do not repeat already successful producer, installation, test, build, or artifact work merely to reach a later defect.

### Mandatory circuit breaker

1. After the first failed hosted run, stop workflow activity.
2. Inspect the complete available evidence and audit the whole affected boundary.
3. Search every governing known-problems record, including cross-repository imports.
4. Batch all known corrections outside Actions.
5. Permit at most one corrective hosted run.
6. If that corrective run exposes another application, fixture, runtime, GUI, test, formatter, build, packaging, workflow, or documentation defect, declare the circuit open.
7. Once open, no workflow addition, edit, trigger, rerun, or replacement is permitted on that branch until:
   - the work can be completed in a capable unmetered environment; or
   - the owner explicitly authorizes one identified exception after being told the circuit is open, what exact defect remains, what evidence is already preserved, and why the replacement method is materially different.
8. Remove temporary workflows when the circuit opens or their bounded purpose ends.

### PowerTab application

The circuit should have opened after run `31034486380`, the second producer run. Runs 3 through 5 were serial environment discovery and are retained as failed-do-not-repeat evidence.

The later build-clean parity run `31040496589` passed at commit `978b5e364e159fb3113b0986ce24b3f87891db22`. No additional run is justified merely to repeat its 53-suite, 328-test, optimized-build, or asset-inspection evidence.

### Derived standard

A hosted checkpoint is permitted to confirm a prepared implementation. It is not permitted to become an iterative laboratory whose next question is purchased by another run.

---

## GE-019 — Acceptance cleanup must preserve lasting source and evidence

State: `cross-repository-proven`

Cross-repository foundation: Val Music Vault VMV-017

### Symptoms

A hosted run may successfully create a valid fixture, generated source, canonical export, manifest, or audit record, then encounter a later test or documentation defect. If the valid output exists only in the ephemeral runner or is deleted during failure cleanup, the next run must recreate the same work before reaching the later defect.

During PowerTab run 5, the exact Power Tab Editor graphical save succeeded and produced a canonical version-11 file before the temporary semantic harness failed.

### Failed-do-not-repeat approaches

1. Do not keep the only valid copy of generated product or evidence in an ephemeral runner.
2. Do not delete valid materialized work because a later test, formatter, build, documentation, or workflow step fails.
3. Do not regenerate the exact editor export to repair a Jest runtime or source assertion.
4. Do not couple application or evidence materialization to exact Markdown sentence replacement.
5. Do not remove lasting files when removing temporary workflows, scripts, or triggers.

### Mandatory fail-forward architecture

1. Verify exact source authority, inputs, immutable hashes, and changed-file boundaries before dependency installation.
2. Perform dependency-free transformation and structural checks first.
3. When technically possible, commit valid lasting source, fixtures, generated evidence, manifests, and audits before later broad tests.
4. Remove temporary automation without removing lasting work.
5. Run the narrow focused proof before the complete repository gate.
6. If a later gate fails, preserve the lasting commit and repair forward directly on the branch.
7. Never regenerate accepted evidence from the same base merely to test it again.
8. Reconcile implementation status and checkpoint prose only after product or evidence proof.

### PowerTab preserved authority

The canonical editor output must be treated as lasting authority:

- compressed SHA-256: `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`;
- decompressed SHA-256: `c5082b9f7dec3401b74373b037ae7fb438f77e2db86f85c10322f6313d52f5bd`.

Future repairs must use the preserved file. They must not rerun the producer merely because a downstream source, test, formatter, build, documentation, or publication gate changes.

### Derived standard

Acceptance must fail forward. Preserve what has been won, remove only temporary machinery, and make the next defect directly repairable.

---

## GE-020 — A failing connector or transport method must be replaced

State: `cross-repository-proven`

Cross-repository foundation: Val Music Vault VMV-009 and VMV-016

### Symptoms

A connector truncates a large file, clips pagination, rejects a payload, or requires overlapping line ranges. Work then stalls while the same transfer is retried or the complete file is reconstructed manually from fragments.

### Failed-do-not-repeat approaches

1. Do not use more than two attempts with one confirmed failing transport mechanism.
2. Do not reconstruct a complete file line by line when an intact download-and-attach or upload route exists.
3. Do not run GitHub Actions merely to move an already complete file.
4. Do not ask the owner to browse, choose branches, infer destinations, or edit the file manually.
5. Do not confuse successful transport with formatting, testing, build, or application proof.

### Proven solution

After the second transport failure:

1. stop that method;
2. state what is complete, the one remaining gate, why the method failed, the replacement method, and the stop condition;
3. prefer an existing verified artifact, direct modular source, an authenticated checkout, or an intact owner-operated file handoff;
4. verify filename, byte count, repository blob, cryptographic hash, source commit, beginning and ending structure, destination branch, and exact changed-file boundary after transfer;
5. use a capable environment for transformation and proof, but the simplest safe route for transport.

### Derived standard

Fidelity may require changing the transport. Repeating an incomplete transfer is not preservation.

---

## GE-021 — Format to a fixed point before hosted acceptance

State: `cross-repository-proven`

Cross-repository foundation: Val Music Vault VMV-014

### Symptoms

A hosted gate reaches a formatter check and fails before lint, types, tests, accessibility, or the production build. One formatter write pass may also leave a tree that changes again on a second pass.

### Mandatory solution when a pinned formatter exists

1. Install from the exact lockfile when dependencies are not already available.
2. Run the repository-pinned formatter.
3. Hash or inspect the working-tree diff.
4. Repeat until two successive diff hashes match, with a hard limit of four passes.
5. Inspect the stable diff for semantic change.
6. Run the formatter check.
7. Only then run the broader acceptance gate.
8. If the diff does not stabilize, stop and isolate the exact file or construct outside Actions.

The required phrase is:

`format to a fixed point, inspect, then check`

If the repository has no formatter command, do not invent one merely to imitate another repository.

### Derived standard

Formatting is preparation, not acceptance. Hosted resources must not be spent discovering that preparation never occurred.

---

## GE-022 — One bounded owner action can be safer than prolonged automation improvisation

State: `cross-repository-proven`

Cross-repository foundation: Val Music Vault VMV-015 and VMV-016

### Conditions

An owner-operated dashboard or file action is permitted only when:

1. the consequential action already has explicit owner authorization;
2. the exact target object, branch, path, file, deploy, or setting is known;
3. its identity, source, state, and safety boundaries have been verified;
4. assistant tools cannot perform the same exact operation, or their exposed write action would create a materially different result;
5. the remaining action is narrow, deterministic, and VoiceOver-manageable;
6. no secret, private media, paid resource, destructive ambiguity, or architectural decision is transferred to the owner.

### Required handoff

The assistant must provide:

1. the exact address;
2. the exact accessible control name;
3. the expected confirmation;
4. nearby alternatives not to activate;
5. the precise stop condition.

Afterward, the assistant must independently verify the resulting repository or hosted state.

### Derived standard

Do not protect the owner from one precise action by replacing it with hours of autonomy theater.

---

## Applies to

Any GitHub Actions, Work, Codex, local, deployment, connector, file-transfer, formatting, packaging, generation, or publication preflight that combines source identity, ancestry, changed-file boundaries, inherited repository paths, generated assets, producer execution, or metered verification.

## Evidence

- Accepted timing source: `2b038b15afa09877f6d8dcf615bc060243578096`.
- Failed timing preflight run: `30383593006`.
- Corrected timing run: `30383944688`.
- Clean convergence application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`.
- Successful clean convergence run: `30927079592`.
- Successful hosted publication run: `30927636526`.
- PowerTab producer runs: `31034047669`, `31034486380`, `31034810435`, `31036481027`, and `31037072445`.
- Successful PowerTab build-clean parity run: `31040496589`.
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.
- `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`.
- `docs/cross-repository-execution-governance-reconciliation-2026-08-05.md`.

## Maintenance rule

Future workers must search this addendum before modifying a verification workflow or repeating a transport method. Do not use a compact, familiar, or intuitively clean gate merely because it is shorter. Use exact accepted-base comparisons, diagnostic failures, a hard hosted-run circuit breaker, and an architecture that preserves valid progress.

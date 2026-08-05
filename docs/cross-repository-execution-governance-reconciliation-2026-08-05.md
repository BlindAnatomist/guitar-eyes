# Cross-Repository Execution Governance Reconciliation

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Source repository: `BlindAnatomist/val-music-vault`

Status: governance reconciliation complete; PowerTab feature execution remains stopped

## Purpose

Guitar Eyes repeatedly used GitHub Actions to discover one hosted-environment defect at a time during the PowerTab version-11 evidence work. The repository preserved each individual failure accurately, but its governing instructions did not contain the stronger execution rules already proved in Val Music Vault.

This reconciliation deliberately imports those rules before any PowerTab implementation, verification, publication, or real-device work resumes.

## Val Music Vault records reviewed

The complete active Val Music Vault known-problems set was reviewed, including the canonical register and the detailed VMV-009, VMV-013, VMV-014, VMV-015, VMV-016, and VMV-017 records.

### Deliberately transferred rules

1. VMV-009: confirmed connector truncation or transport failure is a method constraint. Use no more than two attempts with one failing transport before changing methods.
2. VMV-011: one failed hosted run permits diagnosis and at most one corrective acceptance run. A second defect opens the circuit; no further run is permitted without a materially different plan and explicit owner authorization.
3. VMV-014: when a pinned formatter exists, format to a fixed point, inspect the diff, then run acceptance. Do not spend hosted runs discovering ordinary formatting debt.
4. VMV-015: a narrow, exact, VoiceOver-manageable owner dashboard action is valid when assistant tools cannot perform the same exact operation and continued connector improvisation would be slower or riskier.
5. VMV-016: move intact files as intact objects. Do not reconstruct complete files from overlapping connector fragments when a deterministic download, attachment, or upload route exists.
6. VMV-017: acceptance must fail forward. Preserve valid lasting source or evidence before later tests, remove only temporary machinery, and repair later failures directly instead of regenerating the same work.

### Rules already represented in Guitar Eyes

The following Val Music Vault mechanisms already have Guitar Eyes equivalents and were not duplicated:

- committed-target React focus;
- durable iOS Files-picker return focus;
- separation of navigation, state, and content speech;
- real-iPhone VoiceOver evidence as distinct from DOM focus tests;
- accurate failure-boundary classification;
- execution-scope separation and least-expensive-capable-tool use.

### Records not transferred as current Guitar Eyes rules

Val Music Vault upload-storage transaction rules and Netlify-specific deployment-latency rules do not govern the current Guitar Eyes PowerTab branch. They remain useful external references but were not copied as local requirements without a matching mechanism.

## PowerTab failure sequence and circuit-breaker point

The hosted producer sequence recorded five runs:

1. run `31034047669`: Wine launcher discovery failure;
2. run `31034486380`: installer-extractor incompatibility;
3. run `31034810435`: unbounded version-probe timeout;
4. run `31036481027`: MIDI-dialog and X-window activation blocker;
5. run `31037072445`: exact editor save succeeded; the temporary semantic harness then failed in its runtime.

Under the imported VMV-011 rule, the circuit should have opened after run 2 exposed a second hosted-environment defect. Runs 3 through 5 should not have been serial exploratory corrections.

Run 5 nevertheless produced valid canonical editor evidence. Its preserved version-11 output is:

- compressed SHA-256: `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`;
- decompressed SHA-256: `c5082b9f7dec3401b74373b037ae7fb438f77e2db86f85c10322f6313d52f5bd`.

That evidence must never be regenerated merely to repair a later source, fixture, test, formatter, build, documentation, or workflow defect.

The later build-clean parity run `31040496589` succeeded at commit `978b5e364e159fb3113b0986ce24b3f87891db22` with:

- 53 test suites;
- 328 tests;
- optimized production build;
- bundle and tracked-checkout inspection.

No additional hosted run is required to rediscover those results.

## Temporary automation cleanup

The following temporary files were removed in the only safe order:

1. untriggered closure workflow `.github/workflows/powertab-pt2-v11-parity-closure.yml`;
2. completed parity workflow `.github/workflows/powertab-pt2-v11-parity-gate-v5.yml`;
3. trigger file `.github/powertab-editor-parity-trigger`.

The workflow was removed before the trigger file so deleting the trigger could not dispatch another path-triggered run.

No workflow was deliberately dispatched during this governance reconciliation.

## Mandatory execution contract

### Hosted-run circuit breaker

1. Inspect the exact failed step and preserve all successful evidence.
2. Diagnose the complete affected boundary outside Actions.
3. Batch every known correction.
4. Permit at most one corrective hosted run.
5. If that run reveals another application, fixture, test, packaging, formatter, runtime, GUI, workflow, or documentation defect, declare the circuit open.
6. Do not add, edit, trigger, rerun, or replace another workflow on that branch unless the owner explicitly authorizes one identified exception after being told the circuit is open.

### Persistent materialization

When hosted execution creates valid lasting source, fixtures, generated evidence, manifests, or audit files:

1. perform dependency-free authority and structure checks first;
2. materialize and commit the valid lasting work before later broad tests when technically possible;
3. remove temporary workflows, scripts, and trigger files without deleting the lasting work;
4. run focused proof before complete proof;
5. preserve the lasting commit after later failure;
6. repair forward directly on the branch;
7. reconcile documentation only after the product or evidence gate is proved.

### Transport method switching

After two failures with one connector or transport mechanism:

1. stop that method;
2. state what is complete, the one remaining gate, why the method failed, the replacement method, and the stop condition;
3. prefer an existing verified artifact, direct modular source, an authenticated checkout, or an exact owner-operated intact-file handoff;
4. do not reconstruct a complete file line by line unless no safer route exists and the owner explicitly authorizes that exception.

### Formatter preparation

When the repository declares a pinned formatter:

1. install from the exact lockfile when necessary;
2. run the formatter until two successive working-tree diff hashes match, with a hard limit of four passes;
3. inspect the stable diff for semantic change;
4. run the formatter check;
5. only then run the broader acceptance gate.

If the repository has no formatter command, do not invent one merely to imitate another repository.

### Bounded owner action

An owner-operated dashboard or file action is permitted only when:

- authorization already exists;
- the exact target, branch, path, object, or deploy is known;
- assistant tools cannot perform the same exact action or would create a different result;
- the action is narrow and VoiceOver-manageable;
- no secret, private media, paid resource, destructive ambiguity, or architectural judgment is transferred to the owner.

The assistant must provide the exact address, exact control, prohibited alternatives, expected result, and stop condition, then independently verify the resulting state.

## Current stop state

PowerTab `.pt2` remains outside the accepted public format baseline until its remaining acceptance and real-iPhone gates are deliberately completed.

This reconciliation does not authorize:

- another GitHub Actions run;
- a replacement temporary workflow;
- publication or deployment;
- a pull request or merge;
- legacy `.ptb` work;
- another format family;
- playback or teacher mode;
- real-iPhone testing.

The next PowerTab assignment must begin by reading this record, `AGENTS.md`, the canonical known-problems register, the execution-gate addendum, the PowerTab source-evidence addendum, and the zero-dollar policy. It must preserve the canonical editor file and the successful parity evidence rather than recreating either one.

## Derived standard

A repository does not learn merely by recording each failure accurately. It learns when those failures change what the next worker is allowed to do.

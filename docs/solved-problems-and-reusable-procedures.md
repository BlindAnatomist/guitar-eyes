# Solved Problems and Reusable Procedures

Last reconciled: August 4, 2026

## Purpose

This document records recurring development, deployment, accessibility, format-intake, and repository-administration problems already solved in Guitar Eyes.

Future work must inspect this file before proposing a workaround, declaring a limitation, asking the owner to repeat a manual procedure, or spending time rediscovering a known solution.

## Repository authority must remain intact

### Confirmed solution

1. Preserve `Phlypper/guitar-eyes` completely untouched.
2. Preserve `BlindAnatomist/guitar-eyes` `main` at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
3. Perform active work only on a dedicated work branch.
4. Treat `work/accepted-format-intake-convergence` as the accepted format-only baseline.
5. Begin future format work from its final documentation-closure head.
6. Do not open a pull request or merge without explicit owner authorization.
7. Verify final branch authority through exact commit and ancestry comparisons.

### Reuse rule

Do not solve development or preview problems by leaving implementation commits on fork `main`, and do not branch new work from a historical or superseded feature branch.

## GitHub Pages branch protection blocked deployment

### Observed problem

The Pages environment permitted only `main`, while fork `main` had to remain identical to upstream.

### Confirmed solution

1. Use a bounded temporary publisher only for an intentional hosted checkpoint.
2. Have the publisher explicitly check out the exact verified work-branch commit.
3. Make tests and production build prerequisites.
4. Inspect the built and deployed artifacts.
5. Restore fork `main` immediately to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
6. Compare fork `main` with upstream to confirm zero drift.
7. Remove temporary workflow machinery from the accepted convergence.

### Reuse rule

A deployment workaround is incomplete until repository authority is restored and independently verified.

## GitHub connector whole-file writes are not a blocker

### Confirmed solutions

1. Create new documents directly with the repository file action.
2. For an existing text file, fetch current content and blob SHA, preserve unrelated text, and replace the complete file deliberately.
3. For coordinated changes, use repository blob/tree/commit/ref operations when available.
4. Otherwise make sequential bounded file commits on the same authorized branch and verify the final head and contents.
5. Fetch the resulting files and confirm unrelated content was preserved.

### Reuse rule

Never present whole-file replacement as a reason to omit a needed document, reduce scope, or transfer repository editing to the owner.

## Raw ASCII tablature is not an acceptable iPhone VoiceOver model

### Confirmed solution

1. Preserve the desktop spatial presentation.
2. Present a separate iPhone semantic reader.
3. Parse complete tablature runs into synchronized musical positions.
4. Distinguish fretted notes, open strings, inactive strings, explicit mutes, techniques, rests, chords, duration, and unsupported material.
5. Expose Previous position, Read current position, Next position.
6. Keep raw spacing characters out of ordinary iPhone VoiceOver order.
7. Use durable committed-target focus after file-picker return.

### Reuse rule

Future formats, playback, teacher mode, pattern analysis, and AI instruction must consume the semantic tablature document rather than reparsing display text.

## Product extension must share one semantic music model

### Required architecture

The semantic tablature document is the single musical authority used by every reader and any future teacher, playback, analysis, bookmark, or AI layer.

Third-party decoder models remain behind importer adapters. Different file generations may have distinct validation routes, but they must normalize before application semantics.

### Reuse rule

No new format may create its own reader-specific musical interpretation.

## Version-neutral Guitar Pro intake

### Observed problem

GP3, GP4, GP5, GPX, and GP7 use different source generations and containers. Treating each as a separate application model would multiply semantic and accessibility failure points.

### Confirmed procedure

1. Establish a lawful project-authored cross-version corpus.
2. Preserve provenance, hashes, audit records, and generator evidence.
3. Validate source-version evidence without relying only on extensions.
4. Decode lazily through alphaTab `1.8.4`.
5. Transfer a bounded serializable version-neutral intermediate.
6. Normalize into the shared semantic document.
7. Preserve explicit multi-track inventory and selection.
8. Compare equivalent semantic positions across every generation.
9. Run focused tests, the complete inherited suite, build, bundle inspection, hosted read-back, and real-iPhone acceptance.
10. Claim only the bounded compatibility actually proved.

### Reuse rule

Generation-specific evidence stays at the importer boundary. Reader behavior stays generation-neutral.

## Verification gates must compare exact authority

### Observed problems

1. Compact shell guards failed without identifying which assertion was false.
2. A convergence publication gate incorrectly required an inherited workflow directory to be absent rather than proving the candidate introduced no workflow-file differences.

### Confirmed procedure

1. Compare the candidate with the exact accepted base.
2. Use named assertions with expected and actual values.
3. Separate ancestry, changed-file, workflow, test, build, and artifact gates.
4. Classify only the step that ran.
5. Correct only the false assertion.
6. Run still-unperformed expensive gates once.
7. Preserve failed attempts as evidence.

### Reuse rule

Repository authority is relational. Do not replace exact-base comparison with a remembered or aesthetically “clean” repository shape.

## Metered execution scope must not be inferred from diff size

### Confirmed procedure

Before metered execution:

1. define the exact source-change boundary;
2. identify minimum authoritative reconstruction;
3. separate authenticated-environment work from connector and Chat work;
4. identify unavailable external actions before execution;
5. keep owner-operated iPhone testing outside metered work;
6. state the precise stopping point;
7. classify the complete assignment independently of diff size;
8. never predict a credit percentage without platform evidence.

### Reuse rule

Use the least expensive capable environment without weakening source, build, accessibility, repository-authority, deployment, or real-device evidence.

## Documentation closure before the next feature family

### Observed problem

After successful convergence, central authority files can continue naming an abandoned checkpoint or listing newly accepted formats as unsupported. A later worker may then branch from the wrong source or repeat completed work.

### Confirmed procedure

1. Complete device acceptance.
2. Record the owner's exact report without strengthening it.
3. Reconcile `BRANCH_AUTHORITY.md`, `AGENTS.md`, and `docs/implementation-status.md`.
4. Update the relevant known-problems addenda.
5. Preserve historical documents as history rather than rewriting their original checkpoint facts.
6. State the accepted application source separately from documentation-only closure commits.
7. Begin the next feature family only from the final documentation-closure head.

### Reuse rule

A technically successful checkpoint is not operationally closed while central repository memory contradicts it.

## Maintenance rule

When a problem takes more than one serious attempt, recurs across threads, requires a non-obvious workaround, or can be mistaken for a platform limitation, update repository memory before closing the checkpoint.

A future worker must not rely on chat memory alone.

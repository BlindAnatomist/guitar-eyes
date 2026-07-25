# Solved Problems and Reusable Procedures

Last updated: July 25, 2026

## Purpose

This document records recurring development, deployment, accessibility, and repository-administration problems that have already been solved in Guitar Eyes.

Future work must inspect this file before proposing a workaround, declaring a limitation, asking the user to repeat a manual procedure, or spending time rediscovering a known solution.

Each entry should preserve:

1. the observed problem;
2. the confirmed cause;
3. approaches that failed or created unnecessary work;
4. the solution that worked;
5. the conditions under which that solution is safe to reuse;
6. any remaining limitation.

## Repository authority must remain intact

### Problem

The working fork must support active development and hosted previews without modifying Jason Washburn's upstream repository or allowing fork `main` to drift away from upstream.

### Confirmed solution

1. Preserve `Phlypper/guitar-eyes` completely untouched.
2. Preserve `BlindAnatomist/guitar-eyes` `main` as the clean upstream-tracking branch.
3. Perform implementation work only on a dedicated work branch, currently `work/iphone-voiceover-tablature-audit`.
4. Do not open a pull request unless the user explicitly authorizes one.
5. Verify final branch authority by comparing fork `main` with the authoritative upstream commit.

### Reuse rule

Do not solve development or preview problems by leaving implementation commits on fork `main`.

## GitHub Pages branch protection blocked deployment

### Observed problem

The Pages build succeeded, but publication failed with:

`Branch "work/iphone-voiceover-tablature-audit" is not allowed to deploy to github-pages due to environment protection rules.`

The `github-pages` environment allowed only `main`.

### Failed or wasteful approaches

1. Treating the failure as a source, test, or build problem.
2. Asking the user to navigate GitHub environment settings manually with VoiceOver.
3. Attempting an unauthenticated environment-policy mutation.
4. Assuming the preview branch itself had to be permanently authorized.

### Confirmed solution

A controlled temporary-main publication procedure worked:

1. Place a temporary workflow commit on fork `main`.
2. Have that workflow explicitly check out the work branch.
3. Test and build the work branch.
4. Publish the resulting artifact through the already-authorized `main` deployment context.
5. Read back the hosted site and assets.
6. Restore fork `main` to the exact upstream commit.
7. Compare fork `main` with upstream to confirm zero drift.
8. Remove any permanently failing work-branch deployment workflow.

### Result

The bounded proof was published at:

`https://blindanatomist.github.io/guitar-eyes/`

Fork `main` was restored to the exact upstream commit, and upstream remained untouched.

### Reuse rule

This procedure may be repeated for future previews when GitHub Pages continues to authorize only `main`, provided restoration and comparison are completed in the same bounded operation.

## GitHub connector whole-file writes are not a blocker

### Observed problem

The GitHub connector's normal contents actions replace a complete UTF-8 file rather than applying a small inline patch.

### Incorrect conclusion

It is incorrect to say that this prevents creating a comprehensive document or making a precise repository update.

### Confirmed solutions

Choose the safest available method for the task:

1. For a new document, use the repository `create_file` action directly.
2. For a small existing text file, fetch the current content and blob SHA, preserve all existing text, make the intended edit locally in the response workflow, and submit the complete revised file through `update_file`.
3. For a coordinated multi-file change, use Git blob, tree, commit, and ref actions when available so the changes land in one commit.
4. When a local checkout and authenticated GitHub CLI are available, use ordinary `git` editing and commit workflows rather than treating connector granularity as a product limitation.
5. After any whole-file replacement, fetch or otherwise verify the resulting file and confirm that unrelated content was preserved.

### Reuse rule

Never present whole-file replacement as a reason to omit a needed document, reduce the requested scope, or ask the user to perform the work manually.

## Raw ASCII tablature is not an acceptable iPhone VoiceOver model

### Observed problem

Character-by-character exposure makes VoiceOver traverse dashes, separators, and disconnected fret digits rather than musical ideas.

### Confirmed solution

1. Preserve the desktop spatial grid reader.
2. Add a separate iPhone semantic reader.
3. Parse a valid six-string tablature block into synchronized musical positions.
4. Distinguish fretted notes, open strings, silent strings, technique notation, and unsupported material.
5. Expose Previous position, Next position, and Read current position controls.
6. Keep raw spacing characters out of the ordinary iPhone VoiceOver swipe order.
7. Use deliberate focus placement and restrained live announcements after upload and navigation actions.

### Reuse rule

Future playback, teacher mode, pattern analysis, and optional AI instruction must consume the semantic tablature model rather than reparsing the raw display independently.

## Product extension must share one semantic music model

### Risk being prevented

Playback, accessibility, teacher mode, riff detection, lesson planning, and AI could otherwise become separate systems that disagree about the music and require later architectural backtracking.

### Required architecture

The semantic tablature model is the single authoritative representation used by:

1. the desktop spatial grid;
2. the iPhone semantic reader;
3. spoken teacher instructions;
4. note, chord, position, measure, and passage playback;
5. repeated-measure, chord-shape, riff, and variation detection;
6. user-defined bookmarks and named sections;
7. optional AI-generated lesson organization.

### Cost-control principle

Core reading, navigation, playback, section selection, looping, exact repetition detection, chord-shape recognition, and basic riff or variation suggestions should be deterministic and usable without AI.

AI should be optional and used for higher-level pedagogical judgments, such as naming uncertain sections, recommending learning order, explaining relationships among patterns, or producing a reusable lesson plan from already-parsed semantic data.

## Metered execution scope must not be inferred from diff size

Cross-repository source: Val Music Vault `VMV-007`.

### Observed problem

A focused source repair can be described as small while the assigned Work session silently includes broad reconstruction, a complete regression gate, packaging, hosted verification, documentation, fixture preparation, workflow administration, and handoff work. The diff may be small while the execution envelope consumes substantial time and Work credits.

### Failed or wasteful approaches

1. Promising low Work-credit use because the expected code change is small.
2. Bundling tasks that Chat and connected tools can perform into the metered implementation session.
3. Using Work for manual iPhone testing, repository records, hosted read-backs, or link delivery.
4. Discovering connector or workflow limitations only after the metered assignment has begun.
5. Weakening required evidence merely to make the task appear cheaper.

### Confirmed procedure

Before starting a metered execution session:

1. Define the exact source-change boundary.
2. Identify the minimum repository reconstruction required for that boundary.
3. Separate verification that requires the authenticated working environment from tasks Chat and connectors can perform.
4. Identify unavailable external actions before the session begins.
5. Keep owner-operated and real-iPhone testing outside Work.
6. State the precise stopping point.
7. Classify the complete assignment as focused or verification-heavy independently of diff size.
8. Never predict a credit percentage or promise low usage without reliable platform evidence.

### Reuse rule

Use the least expensive capable environment for each part without weakening build, accessibility, repository-authority, deployment, or real-device evidence. Exhaust Chat, connector, CLI, and REST routes before transferring a tool limitation to the owner.

## Maintenance rule for this ledger

When a problem takes more than one serious attempt to solve, recurs across threads, requires a non-obvious workaround, or is likely to be mistaken for a platform limitation, update this document before closing the checkpoint.

A future worker must not rely on chat memory alone. Repository documentation is authoritative.

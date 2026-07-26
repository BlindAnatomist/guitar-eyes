# Next-Phase Recommendation: Teacher Mode Before Playback

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Current accepted implementation source: `72159d25958fffd941c95351c6781cf579e1d622`

Status: planning recommendation only; no next-phase implementation is authorized by this document

## Current position

Convergence recovery checkpoint 1 has passed source ancestry, 17 automated suites, 81 automated tests, production build, hosted read-back, exact fork-main restoration, and real-iPhone Safari and VoiceOver acceptance.

Guitar Eyes now has one semantic document shared by desktop and iPhone. That document already carries instrument identity, blocks, strings, synchronized positions, supported techniques, rhythm durations, explicit measures, and warnings.

The next phase should build one capability against that accepted document without creating a second parser or weakening either reader.

## Recommendation

Begin with a bounded deterministic teacher mode before beginning audio playback.

Teacher mode is the lower-risk and higher-leverage next phase because the current engine already knows enough to generate structured spoken practice instructions. Playback introduces additional unresolved systems: tempo, scheduling, sound generation, note pitch, polyphony, duration accuracy, technique rendering, transport state, interruption behavior, and audio-focus interaction on iPhone.

Teacher mode can validate the pedagogical structure of positions, measures, blocks, and practice ranges before playback depends on that same structure.

## Bounded teacher-mode objective

Checkpoint 1 should not attempt to teach an entire song or infer advanced musical intent. It should provide deterministic practice guidance for the currently loaded semantic document.

A useful first checkpoint would:

1. expose a separate Teacher mode without altering Desktop or iPhone reader behavior;
2. let the user choose the current position, current measure, or current tablature block as the practice range;
3. summarize the selected range before beginning;
4. present one instructional step at a time;
5. distinguish fretted notes, open strings, explicit muted notes, simultaneous strings, techniques, and supported rhythm duration;
6. omit ordinary unplayed strings;
7. provide Previous step, Read current step, and Next step controls;
8. keep movement quiet and reserve full instruction for Read current step;
9. include Restart range and Exit teacher mode;
10. preserve the user's position when switching between reader and teacher mode;
11. require no AI, account, network service, subscription, or paid API.

## What teacher mode should not do yet

Checkpoint 1 should not:

1. evaluate whether the user played correctly;
2. listen through the microphone;
3. generate audio playback;
4. infer chords, riffs, sections, difficulty, or ideal fingering beyond explicit tablature;
5. create lesson plans with AI;
6. store bookmarks or progress permanently;
7. change parsing, rhythm, measure, desktop, or iPhone-reader contracts;
8. merge to fork `main` or modify `Phlypper/guitar-eyes`.

## Why playback should follow

A later playback phase can reuse teacher-mode range selection, step order, restart behavior, and measure boundaries. This avoids building transport and timing controls against an unsettled lesson structure.

Playback should begin only after the teacher checkpoint proves:

1. deterministic range boundaries;
2. stable position order across blocks and measures;
3. understandable step descriptions;
4. predictable state when restarting, moving, or exiting;
5. preserved iPhone focus behavior.

## Work that can proceed without John

Chat and repository tooling can complete the following before owner testing:

1. inspect the accepted semantic document and reader state flow;
2. define the teacher-mode state machine;
3. design deterministic range-selection rules;
4. define accessible control names and focus targets;
5. specify how reader position and teacher position remain synchronized;
6. author fixtures and regression tests;
7. implement the bounded source checkpoint on a separately authorized branch;
8. perform static review and prepare a locked execution gate.

## Point where John becomes necessary

John is needed only after a hosted teacher-mode candidate passes automated and build gates.

The first real-iPhone test should answer:

1. Is entering and leaving Teacher mode understandable?
2. Is range selection efficient with VoiceOver?
3. Does one-step-at-a-time instruction contain enough information without becoming verbose?
4. Do movement controls remain quiet?
5. Does focus land predictably after choosing a range, restarting, and exiting?
6. Does the relationship between reader position and teacher position make sense?

Those are experiential judgments that automated tests cannot settle.

## Jason's role

Jason is not required for the first teacher-mode checkpoint. Teacher mode should consume the shared semantic document and can initially use the same sequential instructional surface on desktop and iPhone.

A later desktop review may determine whether Jason wants keyboard shortcuts or a more spatial teacher presentation. His participation remains optional unless he agrees.

## Cost discipline

Planning, source inspection, documentation, fixture design, and most implementation should be completed in Chat before using Work or GitHub-hosted execution.

Any metered execution assignment must be locked to an exact branch and commit, stop on the first discrepancy, and separate local tests from publication. Owner-operated iPhone testing remains in Chat.

## Decision required before source implementation

The owner must explicitly authorize teacher-mode implementation as the next phase. Until then, convergence recovery checkpoint 1 remains the accepted application state and no source change should begin.

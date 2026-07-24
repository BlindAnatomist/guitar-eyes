# Phase 3: Guided Practice

Date started: July 24, 2026

Branch: `work/phase-3-guided-practice`

Base: accepted Phase 2 reader on `work/phase-2-parser-measure-navigation`

## Objective

Add a bounded, non-AI teacher-mode checkpoint that consumes the accepted semantic tablature model and preserves the accepted simple reader.

## Scope

The checkpoint provides:

1. an optional Guided practice activity alongside Read tablature;
2. one complete musical event at a time;
3. an explicit Begin guided practice action;
4. progress stated as completed instructions out of total instructions;
5. a Played it action that advances only after the player confirms the current event;
6. Back one instruction, Repeat instruction, and Restart from the beginning controls;
7. an explicit Practice complete state after the final event is confirmed;
8. deliberate VoiceOver focus on the new instruction or completion heading;
9. the same deterministic location and playing descriptions used by the accepted reader.

## Boundaries

This checkpoint does not add:

- audio playback;
- timing or metronome behavior;
- correctness detection;
- microphone input;
- chord or riff analysis;
- lesson generation;
- AI;
- changes to Jason Washburn's upstream repository;
- a pull request or merge to fork `main`.

## Acceptance sequence

Automated verification must pass before publication. After a nonproduction preview is published, real-iPhone Safari and VoiceOver testing must determine whether:

1. switching from Read tablature to Guided practice is understandable;
2. Begin guided practice establishes a clear starting point;
3. Played it moves focus to the next instruction without repeating stale content;
4. Back one instruction returns predictably;
5. the progress statement is useful rather than distracting;
6. the final completion state is clear.

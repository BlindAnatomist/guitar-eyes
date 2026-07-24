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

## Preserved Phase 2 behavior

The accepted reading activity remains the default. Phase 3 preserves:

- the heading `iPhone tablature reader`, including the proven native Files-picker focus destination;
- the `What to play now` instruction heading;
- `Back`, `Next`, and `Repeat instruction`;
- location wording in the form `Measure X of Y. Step A of B.`;
- the accepted separation between the musical instruction and navigation controls.

The Phase 3 automated gate initially exposed stale test expectations for a shortened heading, altered punctuation, and a renamed control group. The implementation was not changed to match those regressions. The tests were repaired to protect the already accepted Phase 2 wording and focus contract.

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

## Automated verification

The final Phase 3 source passed the repository gate:

1. `npm ci` passed.
2. All automated tests passed.
3. The production build passed.
4. Existing native Files-picker focus recovery coverage passed.
5. Guided-practice tests cover entry, advancement after confirmation, focus on the next instruction, progress, and explicit completion.

See `docs/proof-automated-results.md`.

## Hosted preview

The exact passing branch was published successfully using the proven controlled temporary-`main` procedure.

- Verification and build: success.
- Deployment: success.
- Preview: `https://blindanatomist.github.io/guitar-eyes/`

See `docs/phase-3-preview-status.md`.

## Remaining real-iPhone acceptance gate

A focused real-iPhone Safari and VoiceOver pass must determine whether:

1. switching from Read tablature to Guided practice is understandable;
2. Begin guided practice establishes a clear starting point;
3. Played it moves focus to the next instruction without repeating stale content;
4. Back one instruction returns predictably;
5. the progress statement is useful rather than distracting;
6. the final completion state is clear.

Refresh the hosted page once before testing so Safari does not retain the previous Phase 2 build.

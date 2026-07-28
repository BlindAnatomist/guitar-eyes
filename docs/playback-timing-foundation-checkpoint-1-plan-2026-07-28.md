# Playback Timing Foundation Checkpoint 1 Plan

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/playback-timing-foundation`

Branch starting point: `aa302dcee880df4a0947d3e374171554e4855022`

Accepted tablature-intake application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Purpose

Create one deterministic, non-audio timing layer from the accepted semantic tablature document. This checkpoint establishes the temporal authority that later playback and teacher mode will consume. It does not produce sound, move the reader automatically, add looping, or introduce a second musical model.

## Execution preflight

### Exact source-change boundary

The checkpoint may add:

1. one playback-timing engine module;
2. direct unit tests for the engine;
3. bounded documentation and governance updates;
4. no user-interface controls unless separately authorized after this engine passes.

The checkpoint must not modify importers merely to make an incomplete document appear timed. Missing or ambiguous duration remains a safe rejection.

### Minimum authoritative reconstruction

Before implementation, inspect:

1. `AGENTS.md`;
2. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
3. `docs/implementation-status.md`;
4. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
5. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
6. `docs/solved-problems-and-reusable-procedures.md`;
7. `src/iphoneTabModel.js`;
8. `src/asciiRhythm.js`;
9. `src/measureModel.js`;
10. `src/musicXmlImporter.js`;
11. `src/guitarProAlphaTabAdapter.js`;
12. `src/guitarProNormalizer.js`.

### Tool allocation

Chat and connected GitHub tools may perform repository reconstruction, source review, bounded source writes, branch administration, documentation, diff review, and final status recording.

GitHub-hosted execution is justified only for one intentional checkpoint after the source diff is complete because this environment cannot install the repository dependencies or execute the full inherited Jest and production-build gates locally.

No hosted Pages preview and no real-iPhone test are required for this engine-only checkpoint because it changes no interface, focus behavior, speech, picker behavior, or deployed user interaction.

### Stop condition

Stop after:

1. the engine and direct tests exist on the branch;
2. the full inherited and new automated suite passes;
3. the production build passes;
4. the diff contains no audio, renderer, player, UI, worker, soundfont, or unrelated format work;
5. fork `main` remains exactly identical to clean authority;
6. the result is recorded in repository documentation.

## Existing semantic evidence

The accepted document already provides the required musical primitives:

1. ASCII rhythm may attach W, H, Q, E, and S durations in quarter-note units.
2. MusicXML positions carry duration divisions and divisions per quarter, including timed rests and chord onsets.
3. Guitar Pro positions carry exact reduced quarter-note fractions, timed rests, chord onsets, measures, time signatures, and source-order repeat warnings.
4. Measures and positions are already ordered consistently for desktop and iPhone.
5. Repeat metadata is preserved without expanding playback order.

The timing layer must consume those fields rather than reparsing ASCII, MusicXML, Guitar Pro, or raw display rows.

## Timing contract

Add a pure function with an API equivalent to:

`buildPlaybackTimeline(semanticDocument, options)`

The returned timeline must:

1. identify itself as a versioned `playback-timeline` value;
2. preserve the semantic document's existing position order;
3. use one tempo in quarter notes per minute;
4. default to 120 beats per minute only when no explicit checkpoint tempo is supplied;
5. record whether tempo came from the explicit option or the checkpoint default;
6. reject non-finite, non-integer, or out-of-range tempo rather than silently correcting it;
7. accept a bounded range of 20 through 300 beats per minute;
8. derive an exact reduced quarter-note fraction for every position;
9. prefer an existing `quarterNoteFraction` when present;
10. reconstruct MusicXML fractions from `durationDivisions` and `divisionsPerQuarter`;
11. convert accepted finite decimal quarter-note units into a reduced fraction only when no stronger exact source exists;
12. reject a position with missing, zero, negative, non-finite, or unrepresentable duration;
13. treat a chord as one onset because its notes already share one semantic position;
14. treat a rest as a timed position;
15. produce cumulative start, duration, and end offsets in quarter-note units and milliseconds;
16. preserve block, measure, position, rest, and chord identity without copying or mutating the musical document;
17. expose measure timing summaries when measure identity is present;
18. report total duration;
19. declare playback order as `source-order`;
20. never expand repeats, alternate endings, or loops in this checkpoint.

## Exact arithmetic

Cumulative musical time must use reduced integer fractions internally. Floating-point values may be exposed for convenience only after exact fraction arithmetic has determined the result.

Milliseconds are derived from:

`quarter-note units × 60000 ÷ beats per minute`

The engine must not round intermediate musical fractions. Millisecond outputs may remain finite JavaScript numbers.

## Required errors

The module must use a dedicated `PlaybackTimingError` with stable codes including:

1. `INVALID_PLAYBACK_DOCUMENT`;
2. `EMPTY_PLAYBACK_DOCUMENT`;
3. `INVALID_PLAYBACK_TEMPO`;
4. `PLAYBACK_TIMING_INCOMPLETE`;
5. `INVALID_PLAYBACK_DURATION`;
6. `UNREPRESENTABLE_PLAYBACK_DURATION`.

Errors must identify the first unsafe position without guessing a replacement duration.

## Direct regression coverage

Tests must prove:

1. default 120 BPM timing;
2. explicit tempo timing;
3. tempo boundary rejection;
4. exact cumulative arithmetic across whole, half, quarter, eighth, and sixteenth durations;
5. MusicXML duration reconstruction from divisions;
6. Guitar Pro exact tuplet fractions;
7. a chord remains one timed onset;
8. a rest consumes its full duration;
9. multi-block source order is preserved;
10. measure summaries begin and end at the correct offsets;
11. repeat metadata does not duplicate positions;
12. missing duration rejects rather than guessing;
13. zero, negative, non-finite, or malformed fractions reject;
14. the semantic document is not mutated;
15. no browser, audio, renderer, worker, or React dependency is introduced into the timing module.

## Deferred work

This checkpoint does not include:

1. audible playback;
2. Web Audio;
3. MIDI synthesis;
4. sampled guitar or bass sounds;
5. alphaSynth;
6. metronome sound;
7. playback controls;
8. automatic reader-focus movement;
9. visual cursor movement;
10. looping;
11. bookmarks;
12. teacher mode;
13. practice scoring;
14. repeat expansion;
15. tempo extraction from source files;
16. tempo maps or tempo changes;
17. swing interpretation;
18. count-in behavior;
19. general Guitar Pro compatibility expansion;
20. compressed MusicXML or other deferred formats.

## Acceptance state

State: `authorized-plan`

Implementation may begin only on `work/playback-timing-foundation` from the recorded starting point. No pull request, merge, upstream modification, production deployment, or owner-operated testing is authorized by this plan.
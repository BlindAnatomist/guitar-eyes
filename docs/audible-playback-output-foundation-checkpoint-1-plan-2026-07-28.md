# Audible Playback Output Foundation Checkpoint 1 Plan

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Proposed branch: `work/audible-playback-output-foundation`

Branch starting point: `b0f6ad7c801b26b8f5e26407ac835a17668cbbdd`

Accepted playback-timing implementation source: `2b038b15afa09877f6d8dcf615bc060243578096`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Purpose

Establish one bounded, project-owned audible sound route from the accepted semantic tablature document and playback timeline. The checkpoint evaluates whether a single current semantic position can be rendered audibly on the owner's real iPhone without importing alphaSynth, samples, soundfonts, MIDI files, renderer workers, audio worklets, or another musical model.

This is not full playback. It does not add Play, Pause, Stop, seeking, automatic progression, looping, count-in, metronome, visual cursor movement, or VoiceOver focus movement.

## Required continuity reading

Before implementation, inspect:

1. `AGENTS.md`;
2. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
3. `docs/implementation-status.md`;
4. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
5. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
6. `docs/known-problems-register-addendum-execution-gates.md`;
7. `docs/solved-problems-and-reusable-procedures.md`;
8. `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
9. `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`;
10. `src/playbackTiming.js`;
11. `src/IPhoneTabReader.js`;
12. `src/DesktopSemanticReader.js`;
13. accepted importers and semantic string identities.

## Execution preflight

### Exact source-change boundary

The checkpoint may add:

1. one pure semantic-position-to-pitch-event adapter;
2. one project-owned procedural plucked-string sound engine using native Web Audio nodes;
3. direct tests for pitch derivation, sound-event construction, lifecycle, and bounded browser dependency use;
4. one narrowly labeled `Audition current position` action in the iPhone semantic reader and equivalent semantic desktop reader only if automated source and build gates pass;
5. bounded build identity, status, documentation, and hosted proof configuration.

The checkpoint must not change any importer merely to make an untimed or unpitched position audible.

### Tool allocation

Chat and connected GitHub tools perform repository reconstruction, design, source review, bounded source writes, branch administration, documentation, diff review, workflow inspection, hosted read-back, and final status recording.

One intentional GitHub-hosted test and production-build checkpoint is permitted after source review because the current Chat environment cannot execute the repository dependency gate.

A hosted Pages candidate is required only after the source and build gate passes because actual iPhone Safari audio policy and audibility require explicit user-action testing on the real device.

John is not involved until that exact hosted candidate is ready. Jason Washburn is not involved.

### Stop condition

Stop after:

1. one semantic current-position audition action exists;
2. one explicit activation creates or resumes the audio context and schedules only that position;
3. the action never changes reader position or focus;
4. the complete inherited and new automated suite passes;
5. the production build passes;
6. built assets contain no sample files, soundfonts, audio worklets, renderer workers, alphaSynth, or new playback library;
7. an exact hosted candidate is read back;
8. John receives one bounded iPhone test for audibility, chord/rest behavior, repeated activation, and unchanged VoiceOver position;
9. fork `main` is restored exactly.

## Evaluated sound routes

### Rejected: alphaSynth or alphaTab playback

Rejected because it would import a third-party playback model, soundfonts, workers, and renderer-adjacent architecture already excluded by repository governance.

### Rejected: Web MIDI or MIDI-file playback

Rejected because it would depend on external devices or browser capability outside the required iPhone-first route and would not itself define an audible guitar sound.

### Deferred: sampled guitar and bass assets

Deferred because samples introduce licensing, download size, storage, instrument-articulation, and asset-management questions before the semantic-to-audio contract is proven.

### Accepted evaluation route: procedural plucked-string synthesis

Use a project-owned Karplus-Strong-style plucked-string buffer generated at runtime and played through native `AudioBufferSourceNode` and `GainNode` values.

Reasons:

1. no third-party playback model;
2. no copied or licensed audio sample;
3. no soundfont;
4. no network audio asset;
5. no AudioWorklet;
6. bounded CPU and memory for one position;
7. naturally decaying sound suitable for identifying pitch and chord structure;
8. compatible with an explicit user-activated Web Audio path.

The sound is a functional synthesized plucked-string proof, not a claim of realistic guitar or bass reproduction.

## Pitch-event contract

Add a pure API equivalent to:

`buildPositionSoundEvents(semanticDocument, positionIndex, options)`

It must:

1. consume the existing semantic document and one position;
2. derive each audible string's open MIDI pitch from, in order:
   - explicit `tuningMidi`;
   - explicit tuning name plus octave;
   - the exact accepted standard six-string guitar or four-string bass tuning profile;
3. reject custom tuning without octave evidence rather than guessing;
4. add the fret number to the open-string MIDI pitch;
5. treat open strings as fret zero;
6. preserve one chord onset with one event per played string;
7. return no pitched event for an ordinary silent string;
8. return a timed rest result for a semantic rest;
9. represent an explicit muted note as a short non-pitched muted-string event rather than inventing a pitch;
10. preserve supported duration from the accepted timeline;
11. reject an invalid position, missing timing, impossible MIDI pitch, duplicate string event, or malformed string identity;
12. not mutate the document or timeline.

## Procedural sound contract

Add an engine API equivalent to:

`createPositionAuditioner(options)`

The returned object must provide bounded methods equivalent to:

1. `audition(events)`;
2. `stop()`;
3. `dispose()`;
4. `state()`.

The engine must:

1. create or resume `AudioContext` only inside the owner's explicit activation path;
2. schedule all pitched chord events at one onset;
3. create a project-generated plucked buffer for each pitch;
4. apply a short attack and natural decay envelope;
5. use conservative gain and a master limiter or compressor to reduce chord clipping;
6. schedule a short noise burst for explicit muted notes;
7. produce silence for rests while still returning a successful rest outcome;
8. stop and disconnect prior audition nodes before a new audition;
9. close and release the context on disposal where supported;
10. expose errors without changing reader focus or automatically speaking changing progress;
11. use no global timer loop, interval scheduler, AudioWorklet, Worker, sample asset, or third-party player.

## Initial user-interface contract

After a semantic document loads, place one button in the existing position-control group after `Read current position` and before `Next position`:

`Audition current position`

The action must:

1. audition only the current semantic position;
2. be disabled while no semantic position exists;
3. not advance or rewind the reader;
4. not move VoiceOver focus;
5. not alter the existing quiet Previous and Next contract;
6. use one persistent, restrained status sentence outside the full-position speech mechanism;
7. report a rest as `Current position is a rest. No pitched sound was played.`;
8. report an unsafe pitch or timing error without pretending playback succeeded;
9. keep the button's accessible name stable;
10. stop any prior audition before starting the next one.

No Play, Pause, Stop, loop, tempo, or transport controls are authorized in this checkpoint.

## Required automated coverage

Tests must prove:

1. standard six-string guitar MIDI pitch derivation;
2. standard four-string bass MIDI pitch derivation;
3. explicit custom tuning with octave;
4. rejection of custom tuning without octave;
5. fret transposition;
6. chord events share one onset;
7. rest behavior;
8. explicit muted-note behavior;
9. duration comes from the accepted timing engine;
10. malformed and out-of-range pitch rejection;
11. no document mutation;
12. audio context creation or resume occurs only during audition;
13. prior nodes stop before repeated audition;
14. dispose releases created nodes and context;
15. the action does not change current reader position;
16. Previous and Next remain quiet;
17. Read current remains the only full playing-instruction announcement;
18. no alphaSynth, soundfont, sample, audio-worklet, renderer-worker, or new third-party playback dependency enters source or build.

## Hosted real-iPhone checkpoint

Only after automated and production-build gates pass:

1. publish one temporary exact-source Pages candidate using the established controlled temporary-main procedure;
2. read back HTML, manifest, JavaScript assets, build identity, and absence of forbidden audio assets;
3. restore main exactly;
4. provide John the exact copyable preview address and one project-authored timed fixture already accepted by intake;
5. ask John to activate `Audition current position` directly and report whether sound is heard;
6. test one open or fretted note, one chord, one rest, and repeated activation;
7. verify VoiceOver remains on the audition button and the reader position does not change.

## Explicitly deferred

1. full-document playback;
2. Play, Pause, Stop, restart, seeking, scrubber, or progress controls;
3. automatic reader progression;
4. focus or VoiceOver movement during sound;
5. looping;
6. metronome and count-in;
7. tempo controls or source tempo extraction;
8. repeat expansion;
9. technique-specific synthesis;
10. realistic sampled instruments;
11. stereo placement;
12. effects processing;
13. teacher mode;
14. practice scoring;
15. bookmarks;
16. new file formats.

## Acceptance state

State: `authorized-plan`

Implementation may proceed only on `work/audible-playback-output-foundation` created from `b0f6ad7c801b26b8f5e26407ac835a17668cbbdd`. No pull request, merge, upstream modification, production deployment, or owner-operated testing is authorized until the exact hosted candidate passes automated, build, and read-back gates.
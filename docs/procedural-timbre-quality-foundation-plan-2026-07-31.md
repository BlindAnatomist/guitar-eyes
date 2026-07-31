# Procedural Timbre Quality Foundation Plan

Date: July 31, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/procedural-timbre-quality-foundation`

Branch starting point: `f4e9892cda5423ddb4699e93b94074d08e7be751`

Accepted application source inherited by the branch: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner finding

The accepted audition route appears to produce the correct pitch, but the timbre sounds poor and toy-like. Functional pitch proof is therefore insufficient preparation for judging measure playback, chord balance, or musical timing.

## Purpose

Improve the existing project-owned procedural plucked-string timbre before beginning measure or bar playback.

This checkpoint may improve only the audible rendering of already accepted pitched and muted current-position events. It must not alter semantic pitch, fret mapping, tuning authority, duration authority, reader position, VoiceOver focus, control order, the two-second sound delay, or supported file formats.

## Required continuity

The checkpoint inherits and must preserve:

1. `AGENTS.md` repository and accessibility authority;
2. `docs/implementation-status.md` accepted source chain;
3. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` entries GE-001 through GE-013;
4. `docs/known-problems-register-addendum-execution-gates.md` diagnostic-gate requirements;
5. `docs/solved-problems-and-reusable-procedures.md` semantic-model and repository rules;
6. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
7. `docs/audible-playback-output-foundation-checkpoint-1-plan-2026-07-28.md`;
8. `docs/mxl-audition-first-focus-repair-real-iphone-acceptance-2026-07-31.md`.

## Exact source-change boundary

The checkpoint may:

1. improve the runtime-generated Karplus-Strong-style excitation so the attack is less like raw broadband noise;
2. vary brightness, damping, decay, and pluck position by string and pitch without changing pitch identity;
3. add restrained project-owned body-resonance filtering through native Web Audio nodes;
4. improve chord gain staging and compression without serializing chord notes or changing their shared onset;
5. improve explicit muted-string noise so it is short and controlled;
6. add deterministic tests for the timbre profile, generated buffers, filter graph, chord gain, lifecycle, and fallbacks;
7. add a unique hosted checkpoint identity only after the source gate passes.

The checkpoint must not add:

- samples, soundfonts, MIDI playback, alphaSynth, third-party playback libraries, AudioWorklets, workers, or network audio assets;
- technique-specific synthesis;
- stereo placement or effects controls;
- measure playback, full playback, automatic progression, looping, tempo controls, transport controls, teacher mode, scoring, bookmarks, AI work, or new formats;
- any importer, semantic-document, playback-timeline, reader-navigation, focus, or speech-contract change.

## Timbre requirements

1. Pitched output must retain the exact event frequency.
2. The excitation must combine a brief controlled pick transient with a filtered string excitation rather than expose raw white noise as the dominant attack.
3. Lower strings must be darker and decay longer than higher strings.
4. Higher strings must retain enough brightness for pitch clarity without brittle high-frequency noise.
5. String index and pitch may shape timbre but may not alter note onset or duration authority.
6. A restrained body response may use native high-pass, broad resonant, and low-pass filters with a no-filter fallback when a browser lacks `createBiquadFilter`.
7. Chord voices must retain one shared onset and use conservative gain scaling plus the accepted compressor path.
8. Repeated audition, stop, dispose, first-use focus, and two-second delay contracts remain unchanged.

## Verification

Before owner testing:

1. prove the branch descends from the accepted integrated line and that `main` remains exact;
2. preserve all inherited tests and add timbre-specific coverage;
3. run the complete locked test suite once after source review;
4. run the optimized production build;
5. inspect source and built assets for forbidden samples, soundfonts, alphaSynth, AudioWorklets, workers, or new playback dependencies;
6. publish one exact hosted proof only after the gate passes;
7. read back the live HTML and JavaScript identity;
8. restore fork `main` exactly;
9. ask the owner to judge only whether single notes and chords sound materially less toy-like while pitch, delay, focus, and control behavior remain intact.

## Stop condition

Stop after a verified hosted timbre candidate is available for bounded real-iPhone listening. Do not begin measure or bar playback within this checkpoint.

State: `authorized and implementation-ready`.

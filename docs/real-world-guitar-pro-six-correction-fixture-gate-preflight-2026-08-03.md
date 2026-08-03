# Real-World Guitar Pro Six-Correction Fixture Gate Preflight

Date: 2026-08-03

## Authority

- Branch: `work/real-world-guitar-pro-intake`
- Prior evidence head: `66bc7b99692c675e5af941cd25c5646e69a0c4f2`
- Accepted application lineage remains the format-only 4C source.
- This is a generator-only evidence operation. It does not alter runtime decoding, semantic normalization, reader behavior, playback, deployment, or `main` authority.

## Proven state

- The Guitar Eyes application source passed focused tests, the complete 288-test regression suite, production build, and lazy alphaTab bundle inspection.
- The five-correction generator gate proved exact alphaTab parity for GP3, GP4, and GP5.
- GPX reached exact decoding with correct tuning, bar count, durations, and rest placement, but note strings were mirrored.
- Observed GPX coordinates were `[[[2,1],[1,0]],[],[[3,0]],[[4,2]],[[5,0]],[[6,3]]]` instead of `[[[6,0],[5,1]],[],[[4,0]],[[3,2]],[[2,0]],[[1,3]]]`.

## Required sixth external-only correction

The pinned external GPIF writer currently serializes `Note.string` with `note.string - 1`. Its internal legacy model numbers physical strings one-based from high to low, while the GPIF note property is zero-based from low to high. For this project-authored six-string fixture, export the GPIF note-string property as `6 - note.string`.

This correction must be applied only in the temporary checkout of pinned generator commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`. No patched external source ships with Guitar Eyes.

## Gate

Generate GP3, GP4, GP5, GPX, and GP7+ `.gp` from the same CC0 MusicXML specimen, then independently decode every output with pinned alphaTab 1.8.4.

Every family must match exactly:

- one non-percussion six-string track;
- tuning MIDI `[64,59,55,50,45,40]` in high-to-low order;
- two bars;
- durations `[4,4,4,4,2,2]`;
- one timed rest at beat index 1;
- ordered note coordinates `[[[6,0],[5,1]],[],[[4,0]],[[3,2]],[[2,0]],[[1,3]]]`.

Fail closed on any mismatch. Upload one one-day evidence artifact only after all five families pass.
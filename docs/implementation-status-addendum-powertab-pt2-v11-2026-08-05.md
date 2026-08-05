# Implementation Status Addendum: PowerTab `.pt2` Version 11

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Status: provisional source checkpoint; not accepted format support

## Authority

Accepted production-independent format baseline remains:

- branch: `work/accepted-format-intake-convergence`
- accepted application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Current provisional PowerTab work is isolated on:

- branch: `work/powertab-pt2-v11-source-checkpoint`
- reconciled source-and-evidence head: `6c17997eba96e16aa248d8fd5a0e632ba5f370ce`
- reconciled tree: `f4506d83ea2d69e558ecb4086f41beded31ba7a0`

The PowerTab branch does not replace the accepted baseline and must not be merged or described as accepted support without the remaining evidence gates.

## What exists now

The branch contains a bounded browser-side importer for modern `.pt2` documents whose decompressed root reports exact internal version 11.

Its fixture-proven semantic profile is intentionally narrow:

1. one standard six-string guitar player;
2. explicit stable player assignment;
3. one system;
4. two measures in 4/4;
5. quarter, eighth, and half-note durations;
6. open and fretted notes;
7. a palm-muted position;
8. a timed rest;
9. a two-note chord;
10. six synchronized positions.

Multiple supported six-string players enter the existing explicit-selection mechanism and are not silently chosen.

Both desktop and iPhone continue to consume one shared semantic document.

## What remains unsupported

The following remain unsupported despite extension recognition or provisional source code:

1. public or arbitrary `.pt2` compatibility;
2. `.pt2` internal versions 1 through 10;
3. newer unverified `.pt2` versions;
4. four-string bass and other string counts in PowerTab;
5. structures outside the exact fixture-proven profile;
6. legacy PowerTab `.ptb`;
7. TuxGuitar `.tg`;
8. TablEdit `.tef`.

Recognition is not acceptance. A source-derived fixture is not an editor-exported compatibility proof.

## Evidence completed

Completed without GitHub Actions:

1. lawful project-authored CC0 fixture and provenance record;
2. deterministic generator;
3. exact JSON and binary hashes;
4. strict gzip, UTF-8, JSON, and version checks;
5. bounded schema, inventory, selection, and normalization modules;
6. local syntax and direct runtime probes;
7. focused test source for detection, decoding, rejection, inventory, selection, normalization, reader parity, application routing, and iPhone result focus;
8. reusable known-problem record for source-derived versus editor-exported evidence.

## Remaining evidence

Before accepted support can be considered:

1. create the same original score in exact Power Tab Editor 2.0.22;
2. export a canonical version-11 `.pt2`;
3. record environment, hashes, and decompressed structure;
4. reconcile source differences;
5. perform locked installation;
6. run focused and complete inherited tests;
7. create the optimized build;
8. inspect the bundle and assets;
9. publish only with separate authorization;
10. complete bounded real-iPhone Safari and VoiceOver acceptance;
11. obtain desktop human acceptance when a willing desktop tester is available.

## Scope exclusions

No `.ptb`, playback, teacher mode, scoring, bookmarks, pattern analysis, AI instruction, renderer, notation font, MIDI engine, soundfont, or Power Tab Editor runtime component is authorized by this addendum.

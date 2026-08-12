# TuxGuitar Standard Four-String Bass Profile Investigation

Date: 2026-08-12

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tuxguitar-standard-bass-profile`

Base authority: `4ce6a7502ab1c478b90e11879491021a0dcfb774`, the final documentation-closure head of the accepted TuxGuitar guitar checkpoint.

Status: source checkpoint prepared; hosted and real-iPhone acceptance not yet claimed.

## Purpose

Close one deliberately deferred profile gap without reopening the accepted TuxGuitar guitar implementation: standard four-string bass in exact G2 D2 A1 E1 tuning across the already accepted native TuxGuitar generations 1.0, 1.1, 1.2, 1.3, 1.5, and modern file format 2.0.0.

This checkpoint does not claim arbitrary TuxGuitar bass, five- or six-string bass, alternate tuning, multiple tracks, multiple voices, broader effects, repeats, lyrics, automation, or any new TuxGuitar generation.

## Pre-flight authority

Before implementation, the checkpoint re-read the repository authority and known-problems material required by `AGENTS.md`, including branch authority, implementation status, the canonical known-problems register, execution-gate and semantic-convergence addenda, cross-repository reconciliation, reusable procedures, TuxGuitar acceptance records, and the zero-dollar automation policy.

The inherited contracts remain unchanged: one shared semantic tablature document; no reader-specific musical interpretation; quiet movement; dedicated Read current speech; durable iPhone picker focus; explicit track selection when required; safe rejection instead of guessing; no playback surface; no merge or upstream change.

## Producer evidence

Pinned TuxGuitar producer authority remains:

- repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`.

Read-only producer-source inspection established:

1. the compatibility writer's `TGStringLimitUtil` permits writable instrument tracks with four through seven strings;
2. TuxGuitar's tuning resources define standard four-string bass as MIDI high-to-low `43,38,33,28`;
3. the song model distinguishes treble clef `1` from bass clef `2`;
4. the accepted Guitar Eyes downstream track inventory and semantic normalizer already support four-string bass and exact standard bass tuning.

Therefore the missing capability is a bounded TuxGuitar intake/evidence gap, not a missing bass concept in the shared semantic model.

## Source architecture

The accepted `src/tuxGuitarDecoder.js` remains unchanged.

The checkpoint adds a bounded `tuxGuitarStandardBassAdapter` plus a thin profile router. The router always tries the accepted guitar decoder first. It retries the bass adapter only after an accepted guitar rejection specifically concerning string count, tuning, or clef. The adapter validates exact standard-bass structural evidence, canonicalizes only bass-specific tuning/clef representation into the already accepted six-string guitar parser route, then restores four-string bass identity in the decoded intermediate before normalization. If the bass adapter also rejects the file, the router rethrows the original guitar rejection so existing unsupported-file behavior is not silently broadened or rewritten.

Both routes return the same TuxGuitar intermediate schema, then pass through the already accepted TuxGuitar track inventory, source normalizer, shared semantic tablature document, iPhone reader, and desktop reader.

## Fixture provenance

The new corpus is project-authored CC0-1.0 material under `fixtures/tuxguitar-tg-bass/` and does not copy an upstream song or fixture.

It contains six deterministic binaries, one for each already accepted native generation. Every binary has a base64 transport twin and manifest SHA-256. The modern archive also has an audited `content.xml` twin.

The profile contains:

- one standard four-string bass track;
- G2 D2 A1 E1 tuning;
- bass clef;
- two 4/4 measures;
- six semantic positions;
- quarter, eighth, eighth, half, half, half durations;
- one rest;
- one palm-muted open D;
- one final two-note chord.

These are source-derived fixtures and are explicitly recorded with `producerExported: false`.

## Agent-side preparation completed before hosted execution

1. all new `.js` and `.mjs` files pass `node --check`;
2. the bass generator reaches a fixed point: two successive generations produce identical hashes;
3. the independent bass fixture verifier passes;
4. all five legacy bass generations decode successfully through the new bass decoder and produce exact standard tuning, six beats, the intended rest, and two-note final chord;
5. modern 2.0 passes independent exact-container, version text, producer metadata, bass-clef, tuning, timing, note-count, palm-mute, byte-count, base64, and SHA-256 verification;
6. the accepted TuxGuitar guitar fixture files are not modified.

The modern browser DOM parsing path and the complete shared semantic normalization remain for the repository test gate because the preparation environment does not provide the repository's jsdom/react-scripts dependency environment.

## Hosted source-gate preflight

One temporary, manually dispatched Linux workflow is permitted only after the application-source commit is materialized. It must check out that exact application-source SHA rather than its own workflow commit.

Required work:

1. `npm ci --no-audit --no-fund` from the unchanged lockfile;
2. regenerate the bass corpus twice and prove a fixed point;
3. run the independent bass verifier;
4. run focused `tuxGuitarBassCompatibility.test.js` and existing `tuxGuitarCompatibility.test.js` together;
5. run the complete inherited test suite once;
6. run the optimized production build once;
7. prove package manifests and accepted guitar fixtures are unchanged from the base;
8. inspect the built source/assets for the intended TuxGuitar profile modules and absence of newly introduced playback/soundfont/audio assets;
9. preserve logs as short-retention evidence without an Actions bot source commit.

Runner: standard `ubuntu-24.04` GitHub-hosted runner. Timeout: 15 minutes. Trigger: `workflow_dispatch` only. Permissions: read-only contents. Artifact retention: 1 day. No paid runner or service.

The hosted-run circuit breaker applies. A failed first run permits diagnosis and at most one corrective run after batching all known corrections outside Actions. A second defect opens the circuit.

## Acceptance boundary

No support claim is made by this source preparation alone. After source gates pass, a separately bounded hosted candidate and real-iPhone Safari/VoiceOver check are still required before central repository authority may describe TuxGuitar standard four-string bass as accepted.

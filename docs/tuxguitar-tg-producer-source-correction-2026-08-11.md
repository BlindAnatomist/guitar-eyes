# TuxGuitar `.tg` Producer-Source Correction

Date: 2026-08-11

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tuxguitar-tg-intake-investigation`

Status: active correction record. This record supersedes the modern `.tg` producer-compatibility interpretation of both the earlier source gate and the earlier hosted proof without rewriting either historical record.

## Why this correction exists

The earlier TuxGuitar source gate at run `31521371357` passed its exact prepared source, deterministic fixture verification, focused tests, complete inherited test suite, production build, and artifact inspection.

The later hosted candidate at source `a50997d72010f10d2bfd415e0d44a6da2fea5c5b` also passed its corrective publication run, production build, deployment, and complete hosted JavaScript read-back.

Those gates nevertheless contained an internally self-consistent modern `.tg` evidence loop. The project-authored modern fixture and the provisional decoder agreed with one another, but a later direct audit of the pinned TuxGuitar producer source showed that both encoded two modern-format assumptions incorrectly.

A green source gate and a green hosted deployment therefore did not establish producer compatibility for modern `.tg`.

## Producer authority

Current producer authority for this correction:

- repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- native modern file-format version: `2.0.0`.

The producer release/application version is not the same thing as the native file-format version. Current TuxGuitar 2.1.0 continues to write native `.tg` file format 2.0.0.

## Defect 1: application version was confused with file-format version

The provisional modern decoder required XML metadata equivalent to TuxGuitar application version 2.0.x because it treated `<TGVersion>` as though it were the native `.tg` version gate.

The producer source uses `version.txt` for the native file-format version. The XML `<TGVersion major/minor/revision>` element records producer application-version metadata.

Therefore a genuine TuxGuitar 2.1.0-produced file can correctly contain:

- `version.txt`: `TuxGuitar_file_format 2.0.0`;
- XML application metadata: `2.1.0`.

The corrected decoder separates those two authorities.

## Defect 2: modern `preciseStart` used semantic ticks instead of producer precise units

The provisional project-authored modern fixture wrote beat starts as 960, 1920, and related semantic-tick values.

The TuxGuitar 2.1.0 source instead requires its precise time domain. The producer model establishes:

- precise starting point: `2882880`;
- quarter-note precise length: `2882880`;
- eighth-note precise length: `1441440`;
- half-note precise length: `5765760`.

For the existing Guitar Eyes six-position proof, the exact source-derived modern beat-start evidence is therefore:

1. `2882880`;
2. `5765760`;
3. `7207200`;
4. `8648640`;
5. `14414400`;
6. `20180160`.

The corrected decoder validates those starts against the bounded sequential semantic profile rather than accepting its own generated units by construction.

## Modern container correction

The corrected modern route adopts the producer's exact two-entry container contract:

1. `version.txt`;
2. `content.xml`.

Extra, missing, duplicate-name, ZIP64, encrypted, contradictory local/central, unsupported-compression, or over-limit archive structures are rejected rather than guessed.

XML remains data-only and rejects document types or custom entity declarations.

## Corrected source-derived fixture evidence

The modern project-authored source-derived fixture is regenerated from the same CC0 six-position musical proof with:

- current producer authority 2.1.0 / `2c46e2a1...`;
- exact native version text 2.0.0;
- application-version metadata 2.1.0;
- exact producer precise-start sequence;
- exactly two ZIP entries;
- six strings in standard tuning;
- two 4/4 measures;
- six semantic positions;
- one rest;
- one palm-mute marker;
- final two-note chord.

Corrected modern binary evidence:

- bytes: `2529`;
- SHA-256: `f9c3536a8db9f4ebf9216d4223ad3a7994f225b7e37faaf4bf3285fb8f7b200a`.

Corrected `content.xml` evidence:

- bytes: `2284`;
- SHA-256: `aa3bb84a2894aef519fc37355c9ffb60a9ae048306b6cc2f91338227c62133e2`.

These remain source-derived fixtures. They are not relabeled as TuxGuitar application exports.

## Legacy boundary

This correction does not by itself invalidate the separate source-derived legacy 1.0, 1.1, 1.2, 1.3, and 1.5 serializers. Their binary structures remain subject to their own exact source audit and acceptance gates.

Their producer authority metadata is updated to the current inspected TuxGuitar 2.1.0 compatibility source. This does not strengthen them into producer-export claims.

Versions 0.7, 0.8, and 0.9 remain deferred archival work. No native 1.4 route is inferred.

## Status of the earlier gates

Source-gate run `31521371357` remains valid historical evidence that the earlier source was internally reproducible, passed its tests, preserved the inherited suite, built successfully, and respected its artifact boundary.

The hosted proof recorded in `docs/tuxguitar-tg-hosted-proof-2026-08-11.md` remains valid historical evidence that candidate source `a50997d72010f10d2bfd415e0d44a6da2fea5c5b` built, deployed, and was read back correctly.

Both are superseded as evidence of modern TuxGuitar producer compatibility because their modern fixture and decoder shared the same incorrect timing/application-version assumptions.

No real-iPhone acceptance should be requested against that hosted candidate. No rerun of the old source is justified.

## Required next proof

Before any `.tg` support claim:

1. corrected deterministic fixture verification must pass;
2. corrected focused TuxGuitar tests must pass;
3. the complete inherited test suite must pass;
4. the optimized production build and artifact inspection must pass;
5. only then may one intentional corrected hosted acceptance candidate be published;
6. bounded real-iPhone Safari and VoiceOver acceptance remains required.

Recognition, source-derived fixture parity, a previous green source gate, or a previous green deployment is not sufficient to claim reading support.

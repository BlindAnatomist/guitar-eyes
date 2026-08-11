# TuxGuitar `.tg` Corrected Source Gate Result

Date: August 11, 2026

Branch: `work/tuxguitar-tg-intake-investigation`

Corrected implementation source: `b3a8d229aee832a7f6ea994dfc7465ff07d608c3`

Producer authority: TuxGuitar 2.1.0, tag commit `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`

Native modern file-format version: `2.0.0`

Successful corrected gate run: `31537402146`

Successful job: `93931698699`

Result: passed.

This record supersedes the earlier internally self-consistent source gate as evidence for modern TuxGuitar producer compatibility. It does not erase the earlier historical records.

## Correction boundary

The corrected source separates TuxGuitar application-version metadata from native file-format version evidence and uses the producer precise-time domain for modern `preciseStart` values. The modern `.tg` fixture and decoder were rebuilt against the pinned TuxGuitar 2.1.0 producer source.

Legacy source-derived fixtures 1.0, 1.1, 1.2, 1.3, and 1.5 remain unchanged in their musical proof bytes except for authority metadata outside those binary fixtures. The material producer correction is the modern 2.0 route.

## Fixture proof

The gate verified six deterministic source-derived `.tg` proofs against the pinned producer authority and regenerated them to a zero-diff fixed point.

The corrected modern 2.0 fixture uses:

- exact `version.txt` native-format marker `TuxGuitar_file_format 2.0.0`;
- TuxGuitar application metadata 2.1.0;
- exact two-entry container contract: `version.txt` and `content.xml`;
- producer precise-start timing domain;
- standard six-string tuning;
- two 4/4 measures;
- six semantic positions;
- one rest;
- one palm-mute marker;
- final two-note chord.

## Focused proof

Five focused TuxGuitar/shared-routing suites passed:

- 5 suites passed;
- 47 tests passed;
- 0 failed.

## Complete inherited proof

The full inherited repository suite passed:

- 64 suites passed;
- 402 tests passed;
- 0 failed.

Existing React/Create React App maintenance warnings remained non-failing and were not introduced by this correction.

## Production build and artifact boundary

The optimized production build compiled successfully.

The corrected artifact boundary verified:

- committed TuxGuitar proof fixture names/content did not leak into the production artifact;
- `TUXGUITAR_LEGACY_BINARY` remained present in compiled JavaScript;
- `TUXGUITAR_ZIP_XML` remained present in compiled JavaScript;
- `TuxGuitar_file_format 2.0.0` remained present in compiled JavaScript;
- the pinned producer commit `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129` remained present in compiled JavaScript;
- the source checkout remained clean and read-only after the gate.

## First corrected-gate attempt

Run `31523152654` passed fixture verification, deterministic regeneration, all 47 focused tests, all 402 inherited tests, and the production build. It failed only because the artifact-inspection script required the literal decimal string `2882880` to survive minification.

The corrected decoder derives that precise value from its source constants rather than embedding that decimal string as a required artifact token. The brittle string assertion was removed without changing the corrected implementation source. Run `31537402146` then passed the complete gate against the same exact implementation source `b3a8d229...`.

## Decision

The corrected source gate passes.

The branch may proceed to one uniquely identified corrected hosted candidate. Real-iPhone Safari/VoiceOver acceptance remains required for the corrected modern 2.0 route before final TuxGuitar checkpoint closure.

The successful user test of the earlier hosted candidate remains useful evidence for the unchanged legacy 1.0, 1.1, 1.2, 1.3, and 1.5 routes, but it is not final acceptance evidence for corrected modern 2.0.

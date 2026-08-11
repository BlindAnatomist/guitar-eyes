# TuxGuitar `.tg` Real-iPhone Acceptance

Date: 2026-08-11

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tuxguitar-tg-intake-investigation`

Status: accepted bounded real-device checkpoint.

## Accepted family

The bounded TuxGuitar native-format checkpoint now has real-iPhone Safari and VoiceOver acceptance for:

- TuxGuitar `.tg` 1.0;
- TuxGuitar `.tg` 1.1;
- TuxGuitar `.tg` 1.2;
- TuxGuitar `.tg` 1.3;
- TuxGuitar `.tg` 1.5;
- modern TuxGuitar native file format 2.0.0 as written by current TuxGuitar 2.1.0 producer authority.

No native 1.4 route is inferred. Historical read-only native generations 0.7, 0.8, and 0.9 remain deferred archival work.

## Source and hosted evidence

Current producer authority:

- upstream repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- modern native file-format version: `2.0.0`.

Corrected source authority for the accepted semantic route:

`b3a8d229aee832a7f6ea994dfc7465ff07d608c3`

Corrected source gate run:

`31537402146`

That gate passed:

- corrected deterministic fixture verification;
- fixed-point regeneration;
- 47 focused TuxGuitar/shared-routing tests;
- all 402 inherited repository tests;
- optimized production build;
- artifact-boundary inspection;
- clean-checkout verification.

Corrected hosted candidate source:

`dee0ba8d63d22c47b6570778acf8dad7ed003942`

Corrected hosted publication run:

`31537714794`

That publication passed exact-source authority checks, focused publication tests, production build, artifact inspection, Pages deployment, and complete live JavaScript asset read-back.

## Human acceptance evidence

The owner first tested the six-generation hosted corpus and reported that all six files loaded, were identified correctly, and VoiceOver focus and reading behavior worked correctly. That result remains accepted for the unchanged legacy 1.0, 1.1, 1.2, 1.3, and 1.5 routes.

A later producer-source audit corrected the modern 2.0 timing/application-version interpretation, so modern 2.0 was retested separately against the corrected candidate and corrected 2.0 fixture.

The owner reported of the corrected 2.0 test:

> OK, all of that worked. It was all good.

The bounded real-device gate therefore establishes that the corrected modern 2.0 fixture:

- loaded successfully;
- was identified as TuxGuitar 2.0;
- returned VoiceOver focus correctly after the Files picker;
- exposed all six proof positions correctly through the accepted VoiceOver reader flow.

Together with the earlier unchanged legacy-file observations, this closes the bounded TuxGuitar 1.0, 1.1, 1.2, 1.3, 1.5, and 2.0 real-iPhone checkpoint.

## Scope boundary

This acceptance does not claim arbitrary compatibility with every `.tg` file.

The accepted first profile remains bounded to the evidence exercised by the six-position corpus and the shared semantic contract, including standard six-string guitar, the demonstrated timing/measure profile, rest, palm mute, and final chord behavior.

Unless separately proven, this record does not establish support for:

- native `.tg` 0.7, 0.8, or 0.9;
- a nonexistent/inferred 1.4 route;
- arbitrary bass profiles;
- arbitrary alternate tunings;
- arbitrary multi-track or multi-voice files;
- broader effects, lyrics, automation, notation, repeats, tempo structures, or other TuxGuitar features outside the accepted evidence.

Unsupported structures must fail explicitly rather than be guessed.

## Closure

TuxGuitar `.tg` 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0 now have bounded source, automated, hosted, and real-iPhone Safari/VoiceOver acceptance.

No merge to `main` is authorized by this record. Fork `main` remains the clean upstream-tracking authority.

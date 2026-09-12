# Known Problems and Proven Solutions: Semantic Convergence Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Last reconciled: August 5, 2026

This addendum must be read with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` before changing a reader, importer, semantic model, desktop presentation, iPhone presentation, or future musical capability.

It supersedes the acceptance state of GE-012 in the main register. The original GE-012 entry remains historical evidence of the risk as it existed before convergence.

---

## GE-012 — Desktop convergence can overwrite the accepted iPhone engine

State: `local-proven`

### Original risk

Replacing the application parser or semantic model to improve desktop presentation could erase accepted iPhone behavior or create two disagreeing interpretations of the same tablature.

### Failed-do-not-repeat approaches

1. Do not create a desktop-only parser for a newly supported format.
2. Do not let a reader component reinterpret source notation independently.
3. Do not replace inherited iPhone semantic, speech, focus, rhythm, measure, or navigation tests with a thinner desktop-oriented suite.
4. Do not allow a third-party decoder model to become the application architecture.
5. Do not treat visual or spatial preservation as permission to fork musical meaning.

### Proven solution

1. Use one shared semantic tablature document as the sole musical authority.
2. Normalize every supported source format before either reader receives it.
3. Feed the same semantic document to the iPhone sequential reader and the desktop spatial reader.
4. Permit the readers to present the document differently without creating separate interpretations.
5. Preserve Jason Washburn's recognizable desktop spatial structure and VoiceOver modifier-key behavior.
6. Preserve the accepted iPhone control order, quiet movement, dedicated Read current action, actionable speech, and durable Files-picker focus recovery.
7. Keep third-party format decoders behind bounded importer adapters.
8. Preserve inherited tests and add parity and reader-specific regression coverage.
9. Require full-suite, production-build, artifact-boundary, hosted, and real-device evidence before declaring convergence accepted.

### Acceptance result

The accepted format-intake convergence established one shared semantic architecture for ASCII guitar and bass, extended-string ASCII profiles, MusicXML, compressed MXL, and Guitar Pro 3 through 7.

The clean convergence passed all 47 suites and 302 tests, the production build, decoder and asset-boundary inspection, hosted publication and live asset read-back, and bounded real-iPhone VoiceOver acceptance across all five accepted Guitar Pro versions and all six semantic positions in each fixture.

The accepted application source is:

`2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

The documentation-closure authority is:

`702edc44da85da4632f5ea2614782733d12b97a4`

### Derived standard

Reader diversity is presentation diversity, not semantic plurality. Every new format and every future teacher, playback, analysis, bookmark, or AI capability must consume the same accepted semantic document rather than creating a second musical system.

---

## Applies to

- new format intake, including PowerTab;
- desktop or iPhone reader changes;
- importer and decoder boundaries;
- track or instrument selection;
- rhythm, measure, technique, and tuning normalization;
- any future playback, teacher, analysis, bookmark, or AI layer.

## Evidence

- `docs/shared-semantic-core-plan.md`.
- `docs/shared-semantic-core-checkpoint-2.md`.
- `docs/convergence-lineage-recovery-2026-07-26.md`.
- `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`.
- `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`.
- `docs/accepted-format-intake-convergence-5b-real-iphone-acceptance-2026-08-04.md`.
- `BRANCH_AUTHORITY.md`.
- `docs/implementation-status.md`.

## Maintenance rule

If a future change causes the desktop and iPhone readers to disagree about strings, positions, durations, measures, rests, chords, techniques, tuning, tracks, or warnings, stop the checkpoint. Repair the shared importer or semantic document rather than compensating independently in either reader.

## Semantic evidence reliability — September 2026 candidate

State: `candidate` (automated implementation proof; real-device acceptance pending).

Missing modern TG fret evidence must not become zero. MusicXML notated and elapsed durations must have a supported explicit relationship; contradictory evidence cannot be selected by plausibility. GP four/six-string count alone cannot establish bass/guitar identity. Repair presence and lexical evidence at source boundaries and enforce common reader-admission invariants; do not add format-specific speech exceptions.

Specification and exact implementation evidence: `docs/semantic-reliability-checkpoint-1-spec-2026-09.md` and `docs/semantic-reliability-checkpoint-1-result-2026-09.md` on `work/semantic-reliability-checkpoint-1`. These do not supersede accepted operational authority.

The separate import/mode-switch focus concern now has controlled DOM reproduction in both reader directions and delayed inventory completion. It remains unrepaired; a passing defect-characterization test is not correct-behavior acceptance. Reuse committed-target/picker-return procedures and current-mode/request identity for a later bounded repair. Real VoiceOver consequences remain unverified.

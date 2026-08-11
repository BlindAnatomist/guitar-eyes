# TuxGuitar `.tg` Source Gate Result

Date: August 11, 2026

Branch: `work/tuxguitar-tg-intake-investigation`

Exact workflow source: `6903acdb204bb88b4433801c88a9ab81cc135bd6`

Run: `31521371357`

Job: `93878909864`

Result: passed on the first attempt.

This record preserves the non-device source gate only. It does not yet claim hosted or real-iPhone acceptance.

## Authority and execution boundary

The workflow verified that:

- it was running on `work/tuxguitar-tg-intake-investigation` at the exact triggering SHA;
- accepted PowerTab closure `10a0d7f40eedf701d55e519b8a311c1816d4e077` remained an ancestor;
- fork `main` remained exact clean authority `60c2e5de0887b1bcdd426d932632946edd07d3c3`;
- workflow permissions were read-only for repository contents;
- the checkout remained unchanged through the complete gate.

## Fixture evidence

The dependency-free verifier passed for all six deterministic project-authored source-derived `.tg` fixtures:

- legacy 1.0;
- legacy 1.1;
- legacy 1.2;
- legacy 1.3;
- legacy 1.5;
- modern native file format 2.0.0.

It verified exact manifest version order, `producerExported: false`, binary/base64 identity, byte counts, SHA-256 values, exact legacy headers, and the modern ZIP/version/content markers.

The fixture generator then regenerated all six proofs and produced zero repository diff, establishing a fixed point.

## Focused proof

Five focused suites passed with 44 tests:

- `src/tuxGuitarCompatibility.test.js`;
- `src/structuredTabReaderDocuments.test.js`;
- `src/tabFormatDetector.test.js`;
- `src/App.sharedCore.test.js`;
- `src/App.convergence.test.js`.

The focused proof covers exact version/container evidence, deterministic fixture transport, six-position semantic parity, palm-mute preservation, rest/chord behavior, shared-reader routing, structured selection continuity, bounded format detection, and inherited semantic convergence.

## Complete inherited proof

The complete inherited suite passed:

- 64 test suites passed;
- 399 tests passed;
- 0 failed.

Existing warnings about deprecated React test utilities and Create React App dependencies were present but did not produce test failures. They are inherited maintenance warnings, not TuxGuitar compatibility failures.

## Production build and artifact boundary

The optimized production build compiled successfully.

Artifact inspection reported:

- 30 production files;
- 7,285,099 total build bytes;
- no committed TuxGuitar proof fixture filename or `Guitar Eyes TG Proof` fixture content in the production artifact;
- `TUXGUITAR_LEGACY_BINARY` present in compiled JavaScript;
- `TUXGUITAR_ZIP_XML` present in compiled JavaScript;
- exact modern marker `TuxGuitar_file_format 2.0.0` present in compiled JavaScript.

The final checkout verification found no diff and no untracked work.

## Decision

The source gate passes for the bounded six-generation TuxGuitar checkpoint. The implementation may proceed to a uniquely identified hosted candidate and live read-back.

No `.tg` support claim is accepted yet. Hosted publication and bounded real-iPhone Safari/VoiceOver acceptance remain required.

Historical read-only TuxGuitar generations 0.7, 0.8, and 0.9 remain deferred and are not included in this checkpoint.
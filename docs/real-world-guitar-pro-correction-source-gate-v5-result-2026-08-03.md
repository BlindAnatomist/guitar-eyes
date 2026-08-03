# Real-World Guitar Pro Correction Source Gate v5 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Feature source tested:

`ea463ad45127e2d05a16092b7f0892c37503aa4a`

Workflow run:

`30855239636`

Job:

`91824596804`

## Result

The source gate failed at the production build step. It did not reach production-artifact inspection, external generator compilation, five-family generation, exact alphaTab semantic audit, provenance, or artifact upload.

## Passed evidence

The focused Guitar Pro gate passed completely:

- 12 test suites passed;
- 92 tests passed;
- zero failed.

The complete inherited regression gate also passed completely:

- 45 test suites passed;
- 287 tests passed;
- zero failed.

This establishes that the GP3 through GP8 source inspection, lazy worker route, version-neutral intermediate, source-evidence adapter, track inventory, explicit multi-track selection, reader projection, application routing, compressed MusicXML behavior, and all inherited application behavior were test-clean at the tested source.

## Exact build failure

`npm run build` reached ESLint and failed because CI treats warnings as errors:

`src/compressedMusicXmlImporter.js`

`Line 385:6: Unexpected control character(s) in regular expression: \x00, \x1f  no-control-regex`

The flagged expression was the inherited compressed-MusicXML rootfile-path safety check for C0 controls and DEL. This was not a Guitar Pro decoder, normalization, accessibility, fixture, or dependency failure.

## Repair

The control-character regular expression was replaced with an equivalent code-point predicate:

1. characters with code values zero through 31 remain rejected;
2. DEL, code 127, remains rejected;
3. all error messages and `UNSAFE_MXL_ROOTFILE_PATH` behavior remain unchanged;
4. no path validation was removed or weakened.

A new adversarial regression uses a DEL character in the declared rootfile path and requires the same unsafe-path rejection.

Repair commits:

- `b6cd3f1afb75541612fa40e705630bafcfac52eb` — source-equivalent lint repair;
- `9e3a86ebe2e14aef783b3d840d4b96163dfc0310` — DEL-path regression.

## Rerun discipline

The failed source will not be rerun unchanged. The next gate must target the new exact feature head containing:

1. the source-equivalent compressed-MusicXML lint repair;
2. the DEL-path regression;
3. this result record.

It must repeat the focused tests, complete inherited suite, production build, bundle-boundary inspection, all three exact external-generator corrections, coherent five-family generation, exact unsorted alphaTab semantics, and one-day artifact upload.

## Repository authority

Fork `main` was restored immediately after the pending status exposed the run identifier. The upstream repository remained untouched. No pull request, merge, Pages publication, deployment, or runtime external-writer dependency was introduced.
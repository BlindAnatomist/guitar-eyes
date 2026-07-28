# Compressed MusicXML Source Checkpoint 1

Repository: `BlindAnatomist/guitar-eyes`

Date: July 28, 2026

Status: source-complete; inherited repository gate pending

## Governing state reviewed

Before implementation, the checkpoint reconstructed the repository from:

1. `AGENTS.md`.
2. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.
3. `docs/implementation-status.md`.
4. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`.
5. `docs/known-problems-register-addendum-guitar-pro-selection.md`.
6. `docs/solved-problems-and-reusable-procedures.md`.
7. `docs/tablature-intake-expansion-plan-2026-07-26.md`.
8. The accepted convergence, publication-preflight, and real-iPhone acceptance records.

Two paths named in `AGENTS.md` were not present on the active branch: `docs/shared-semantic-core-implementation.md` and `docs/measure-recognition-checkpoint-1.md`. Their accepted contracts remain represented in the current implementation-status and known-solutions records. Their absence was treated as documentation drift, not permission to reopen or weaken accepted behavior.

## Repository state

- Active branch: `work/tablature-intake-expansion`.
- Starting head: `aa302dcee880df4a0947d3e374171554e4855022`.
- Implementation commit: `34eba97477782f65e94423c28930928bc5a09f52`.
- Hardening commit: `3ab7c06c3b17fbe1a1d9e11f65fd5f53031f952a`.
- Accepted application source preserved beneath this checkpoint: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- Fork `main` remains exactly `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- `Phlypper/guitar-eyes` was not modified.
- No pull request, merge, publication, workflow dispatch, or GitHub Actions change was made.

## Authorized scope

This checkpoint implements one bounded compressed MusicXML `.mxl` intake route.

It does not begin playback, teacher mode, pattern analysis, bookmarks, AI work, reader redesign, Guitar Pro expansion, PowerTab support, TuxGuitar support, TablEdit support, deployment, or publication.

## Implementation

### Container extraction

`src/compressedMusicXmlImporter.js` now:

1. Reads `.mxl` as a bounded ZIP-compatible container.
2. Requires a valid central directory and rejects multi-disk, ZIP64, encrypted, malformed, truncated, and unsupported-compression archives.
3. Supports stored and raw-DEFLATE entries only.
4. Enforces these checkpoint limits:
   - archive: 16 MiB;
   - entries: 256;
   - central directory: 1 MiB;
   - `META-INF/container.xml`: 64 KiB;
   - extracted score: 8 MiB;
   - optional `mimetype`: 128 bytes.
5. Enforces the DEFLATE output limit while streaming rather than only after expansion.
6. Accepts an optional stored `mimetype` entry only when it exactly identifies compressed MusicXML.
7. Requires exactly one `META-INF/container.xml`.
8. Rejects document-type and custom-entity declarations in the container document.
9. Uses the first declared MusicXML rootfile and requires a safe relative slash-separated path.
10. Requires exactly one archive entry matching that declared score path.
11. Decodes container and score text as strict UTF-8.

### Existing semantic parser reuse

The extracted score is passed directly to the accepted uncompressed MusicXML importer through `buildMusicXmlReaderDocuments`.

No second MusicXML semantic parser, parallel document model, or reader-specific interpretation was introduced.

### Application integration

`src/App.js` now recognizes the binary `.mxl` route before the existing text-file route and preserves the accepted success, failure, status, reader, and picker-return focus mechanisms.

`src/tabFormatDetector.js` now classifies `.mxl` as supported binary compressed MusicXML.

The source metadata remains explicit as `compressed-musicxml` and `compressed MusicXML tablature` while the resulting semantic document continues to use the accepted MusicXML model.

## Added regression evidence

`src/compressedMusicXmlImporter.test.js` covers:

1. Stored container and score extraction.
2. Deflated container and score extraction through the bounded inflater.
3. Missing container rejection.
4. Unsafe rootfile path rejection.
5. Duplicate container rejection.
6. Malformed archive error typing.
7. Full iPhone application intake using the existing MusicXML fixture.
8. Success status, semantic note and duration output, and picker-return focus recovery.

`src/tabFormatDetector.test.js` now verifies that `.mxl` is supported, binary, and not routed through text reading.

## Verification completed in the available environment

The following passed locally without GitHub Actions:

1. JavaScript syntax checks for the new importer and changed non-JSX modules.
2. JSX parser checks for the changed application and application-route regression.
3. Stored-ZIP extraction smoke tests.
4. Actual raw-DEFLATE extraction through the production `DecompressionStream("deflate-raw")` path.
5. Repeated extraction smoke tests after archive hardening.
6. Exact GitHub blob read-back.
7. Branch comparison proving a clean two-commit fast-forward from the starting head with only the six intended source and test paths changed.
8. Verification that fork `main` remains identical to its clean upstream-tracking authority.

## Gate not completed

The full inherited Jest suite and production build were not executable in this environment:

1. A fresh GitHub checkout could not resolve the GitHub host.
2. The available package registry did not provide `@chakra-ui/react`.
3. The required dependency set was not available in the offline package cache.

Therefore this checkpoint must not yet be described as fully accepted, production-ready, hosted, published, or real-iPhone verified.

## Next exact gate

Before publication or owner testing:

1. Check out exact head `3ab7c06c3b17fbe1a1d9e11f65fd5f53031f952a` in an environment with the repository dependencies available.
2. Run `CI=true npm test -- --runInBand`.
3. Run `npm run build`.
4. Inspect the resulting production bundle for unintended workflow, secret, network, playback, or publication changes.
5. If and only if those gates pass, prepare one bounded unhosted or explicitly authorized preview checkpoint for real-iPhone VoiceOver testing of `.mxl` upload, status, focus, and semantic reading.

No other feature phase is authorized by this checkpoint.

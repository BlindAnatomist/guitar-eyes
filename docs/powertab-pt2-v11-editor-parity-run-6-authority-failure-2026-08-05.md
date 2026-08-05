# PowerTab `.pt2` Version-11 Editor Parity Run 6 Authority Failure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `61c53912aa434adb3f3867e8f15c58ce2977335d`

Workflow run: `31038804754`

Job: `92417702807`

Artifact: `powertab-v11-editor-parity-31038804754`

Status: the run stopped in its authority and canonical-evidence preflight. Dependency installation, focused tests, the complete inherited suite, production build, and asset inspection were all skipped. This run establishes no application, parser, test, dependency, or build failure.

## Context

Run six was triggered by an overlapping continuation path while stream-interruption reconciliation was still in progress. The temporary parity workflow and trigger were not part of a completed single-writer checkpoint.

The run completed in approximately ten seconds and uploaded its bounded authority artifact.

## Authority checks that passed before the failure

The preflight reached the exact editor-audit comparison after proving:

1. the expected work branch;
2. accepted application and source-base ancestry;
3. the declared changed-file boundary;
4. editor binary size `973` bytes;
5. editor binary SHA-256 `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`;
6. the base64 mirror reproduced the binary exactly;
7. gzip decompression succeeded;
8. decompressed size `3651` bytes;
9. decompressed SHA-256 `c5082b9f7dec3401b74373b037ae7fb438f77e2db86f85c10322f6313d52f5bd`.

## Exact failed assertion

The next assertion required the committed JSON audit file to equal the decompressed producer bytes exactly:

`assert pathlib.Path(os.environ["EDITOR_JSON"]).read_bytes() == decompressed`

That assertion failed.

The preserved Power Tab Editor output contains the literal upstream key:

`bootleg_relaese_info`

The committed JSON audit had silently normalized that key to:

`bootleg_release_info`

The audit file was therefore valid JSON and musically similar, but it was not a byte-exact audit of the producer output. The authority gate was correct to stop.

## Gates not run

Because authority exit was `1`:

- `npm ci` was skipped;
- focused editor parity tests were skipped;
- the complete inherited suite was skipped;
- the production build was skipped;
- asset-boundary inspection was skipped.

Do not describe run six as a test or build failure.

## Reconciliation

The canonical JSON audit was restored directly from the preserved run-five gzip payload, retaining exactly `3651` bytes and SHA-256 `c5082b9f7dec3401b74373b037ae7fb438f77e2db86f85c10322f6313d52f5bd`.

The temporary run-six workflow and trigger were removed. No rerun or seventh run was created.

The application-source changes that normalize lawful `null` empty collections and their focused regression test remain unaccepted pending a future separately authorized checkpoint. The complete inherited suite, build, and asset inspection remain unperformed.

## Failed-do-not-repeat conclusion

1. Do not rerun run six unchanged.
2. Do not normalize spelling, whitespace, ordering, or optional fields in a file designated as a byte-exact producer audit.
3. Do not create another hosted checkpoint from an interrupted continuation path.
4. Begin any future verification read-only from the actual branch head and use one atomic, non-forced update only after local gates and authorization are complete.

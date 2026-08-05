# PowerTab `.pt2` Version-11 Hosted Producer Run 5 Semantic Harness Failure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `407070c33b66a045d69205bdcad6f40baf8738ab`

Workflow run: `31037072445`

Job: `92411707659`

Artifact: `powertab-v11-direct-gui-evidence-31037072445`

Status: the exact Power Tab Editor producer round trip passed, locked dependency installation passed, and the editor-produced file was preserved. The focused semantic test stopped in its Jest runtime before parsing JSON because that environment did not provide a usable global `TextDecoder`. No PowerTab support claim, publication, pull request, merge, fork-main change, or upstream change occurred.

## Producer gates that passed

1. Exact branch, accepted ancestry, temporary changed-file boundary, trigger identity, fixture hash, and fork-main authority passed.
2. Wine 32-bit and 64-bit runtime installation passed.
3. The exact official Power Tab Editor 2.0.22 installer hash passed.
4. The official installer completed successfully.
5. The exact application opened the copied project-authored fixture.
6. All visible MIDI error dialogs were dismissed through bounded direct-window input.
7. The main score window received direct X input focus.
8. Ctrl+S was sent to the identified score window.
9. The file rewrite was observed through its changed timestamp and changed binary hash.
10. Structural comparison completed.
11. Locked project dependency installation passed.

## Editor-produced evidence

Source-derived input:

- compressed bytes: `971`;
- compressed SHA-256: `669f9b71e7f8ba3c9ce939b98076bbddc17fb977b63b7f647f4bd01cfa072e71`;
- decompressed bytes: `3628`;
- internal version: `11`.

Editor-resaved output:

- compressed bytes: `973`;
- compressed SHA-256: `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`;
- decompressed bytes: `3651`;
- decompressed SHA-256: `c5082b9f7dec3401b74373b037ae7fb438f77e2db86f85c10322f6313d52f5bd`;
- internal version: `11`.

The editor canonicalized twelve structurally empty collections from `[]` to `null`, including empty score-level, system-level, staff-level, and unused-voice collections. The project importer already defines those fields through optional-array handling, so `null` and an empty array are intended to represent the same absence of unsupported notation.

## Exact semantic-test failure boundary

The focused gate invoked the real byte decoder against the editor-resaved file. The file itself was independently decompressed and decoded as valid UTF-8 JSON.

Inside the React Scripts Jest environment, `parseJson()` attempted to construct the global `TextDecoder`. That runtime did not provide a usable global decoder. The decoder's protective catch therefore converted the runtime failure into:

`The decompressed PowerTab document is not valid UTF-8.`

This message does not describe the preserved file bytes. It describes the test environment's missing decoder primitive.

The focused suite result was:

- test suites: `1 failed`;
- tests: `1 failed`;
- semantic gate exit code: `1`.

Because the workflow correctly required semantic exit `0`, the complete inherited suite, optimized build, and asset inspection were skipped.

## Correction

The next bounded run must change only the temporary focused test harness:

1. import Node's standards-compatible `TextDecoder` from `util`;
2. provide it as the Jest global only when the environment does not already provide one;
3. continue exercising `decodePowerTabV11Bytes()` and the real gzip-to-JSON byte path;
4. preserve all six-position, rest, chord, tuning, title, version, and source-evidence assertions;
5. keep application code, the fixture, the editor output, parser limits, workflow runtime, and every downstream gate unchanged.

Do not weaken the decoder's fatal UTF-8 validation and do not bypass the byte decoder by parsing JSON directly in the test.

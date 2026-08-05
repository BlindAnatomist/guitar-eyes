# PowerTab `.pt2` Version-11 Hosted Producer Run 5 Result

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `407070c33b66a045d69205bdcad6f40baf8738ab`

Workflow run: `31037072445`

Artifact: `powertab-v11-direct-gui-evidence-31037072445`

Status: exact editor production succeeded. The project-authored score was opened and resaved through the exact packaged Power Tab Editor GUI. The resulting version-11 file is canonical producer evidence. Parser parity and downstream verification remain pending because the temporary semantic test exposed stricter handling of the editor's lawful `null` representation for empty collections.

## Producer identity passed

1. Power Tab Editor release authority: `2.0.22`.
2. Upstream commit authority: `13cab27c7127d301f2747671071e53eb203dc940`.
3. Official installer SHA-256: `523f12b26b457afa1ea8b15cf0daa2dfd1d82106da723150f662d8bee6a48037`.
4. Installed executable SHA-256: `d6bc20f65edbbb509d15cf5e8e10a18ebbf14a48212ea3b417173f9b290046b1`.
5. Runtime title: `powertab-v11-editor-resaved-six-position.pt2 - Power Tab Editor 2.0.21 (v2.0.22-0-g13cab27)`.
6. The application opened the authored score visibly under Xvfb.
7. Six bounded MIDI-error dialogs were dismissed without altering score data.
8. The ordinary graphical Save command rewrote the same file path.

## Canonical editor output

Compressed bytes: `973`

Compressed SHA-256: `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`

Decompressed bytes: `3651`

Decompressed SHA-256: `c5082b9f7dec3401b74373b037ae7fb438f77e2db86f85c10322f6313d52f5bd`

Internal version: `11`

The before-save copy was `971` bytes with SHA-256 `669f9b71e7f8ba3c9ce939b98076bbddc17fb977b63b7f647f4bd01cfa072e71`. The post-save inode was unchanged, its timestamp advanced from the forced year-2000 value, its size changed to `973`, and its hash changed. This is direct rewrite evidence rather than inference from an open window.

## Structural comparison

The exact editor preserved the score and changed twelve semantically empty collections from `[]` to `null`:

- score chord diagrams;
- system alternate endings;
- system chords;
- system directions;
- staff dynamics;
- voice-one irregular groupings;
- rest-position notes;
- voice-two irregular groupings;
- unused voice-two positions;
- system tempo markers;
- system text items;
- score view filters.

Ten of those fields already pass through `requireOptionalArray`, which explicitly treats `null` as an empty collection. Two remain stricter than the real producer:

1. a rest position's `notes` field;
2. the unused second voice's `positions` field.

Accepting `null` as empty at those exact two fields does not widen notation support. Existing contradiction checks still reject a non-rest position without notes, and all unsupported musical collections remain rejected when nonempty.

## Temporary semantic-test result

The temporary Jest test returned internal exit code `1`, so the complete suite, production build, and asset inspection correctly did not run.

Its first failure occurred in the temporary Node gzip-to-Uint8Array adapter and was reported as invalid UTF-8. Independent artifact audit proves the editor output is valid gzip, valid UTF-8 JSON, and internal version 11. The canonical decompressed JSON parsed successfully and produced the structural comparison above.

The permanent parity checkpoint must therefore:

1. commit the exact editor binary and decompressed audit;
2. normalize `null` only at the two lawful empty-array positions identified above;
3. test the editor document directly and through the binary decoder with a verified byte adapter;
4. preserve strict rejection for nonempty unsupported collections and contradictory rest/note states;
5. run the complete inherited suite, production build, and asset inspection.

## Boundary

This result closes the exact-producer execution requirement. It does not yet claim accepted public PowerTab support, publish a hosted candidate, begin `.ptb`, merge, or alter fork `main` or upstream.

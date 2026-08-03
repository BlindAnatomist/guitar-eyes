# Real-World Guitar Pro Fixture Generation v2 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

Exact feature source:

`d788561572551729aa5a5e0f89bc835560e8a79f`

Workflow run:

`30854158621`

Job:

`91821121269`

## Purpose

Correct the first generator failure by routing the project-authored MusicXML source through the pinned generator's optimized score representation before writing GP3, GP4, GP5, GP6 GPX, and GP7 shared `.gp` binaries.

## Passed evidence

1. Exact feature source and accepted ancestry passed.
2. The project-authored `Chord Rest MusicXML Specimen` was present.
3. `slundi/guitarpro` was checked out at exact commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`.
4. The MIT-licensed `score_tool` CLI built successfully.
5. MusicXML converted successfully to the generator's optimized `.score` representation.
6. The optimized score wrote nonempty GP3, GP4, GP5, GP6 GPX, and GP7 shared `.gp` files.
7. The original GP4 empty-lyric panic did not recur.

## Exact failure

The independent alphaTab 1.8.4 audit failed while decoding the first generated family, GP3.

alphaTab reported:

`OverflowError: Detected string exceeding maxDecodingBufferSize at offset 206`

The stack stopped in:

1. `GpBinaryHelpers.gpReadString`;
2. `GpBinaryHelpers.gpReadStringIntByte`;
3. `Gp3To5Importer.readPageSetup`;
4. `Gp3To5Importer.readScore`.

The audit therefore stopped before GP4, GP5, GPX, and GP7 semantic assertions. No hashes, provenance manifest, or fixture artifact were published.

## Classification

This does not prove that alphaTab cannot read GP3.

It proves that the GP3 file produced by the pinned generator through this route is not independently compatible with alphaTab 1.8.4. The offset and call stack indicate a version-specific binary-layout disagreement near page-setup decoding. A preceding writer field is likely present, absent, or encoded differently from what alphaTab's GP3 reader expects.

The application source, source-family inspector, semantic normalizer, track selection, reader focus, and format-only surface were not exercised by this failure.

## Required next investigation

Before another fixture-generation attempt:

1. compare alphaTab's GP3 `readPageSetup` version gates against the generator's GP3 write order;
2. inspect the generator's `Song::write` and page-setup serialization for version 3.0;
3. determine whether the writer emits GP4/5-only metadata in GP3 or omits a GP3 field expected by alphaTab;
4. prefer a lawful generator fix, version-correct construction path, or original compatible fixture over post-hoc byte guessing;
5. retain independent alphaTab decode as a non-negotiable acceptance gate.

## Rerun discipline

Do not rerun the v2 workflow unchanged. Do not loosen the string/fret, chord, rest, duration, or tuning assertions merely to make a generated binary pass.

## Repository authority

The temporary v2 workflow was removed after inspection. Fork `main` was restored and independently verified identical to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

The comparison showed zero commits ahead, zero behind, and zero changed files. No pull request, merge, Pages deployment, publication, or upstream modification occurred.
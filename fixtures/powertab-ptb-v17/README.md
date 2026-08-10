# PowerTab `.ptb` Version-1.7 Provisional Evidence

This directory contains a project-authored legacy PowerTab version-1.7 (`ptab-4`) evidence specimen.

It is provisional source evidence, not an accepted Guitar Eyes input format.

## Files

- `powertab-v17-original-six-position.source.json` describes the original musical content.
- `powertab-v17-original-six-position.ptb` is the deterministic legacy binary.
- `powertab-v17-original-six-position.ptb.base64` is a text-safe exact mirror of the binary.
- `manifest.json` records provenance, hashes, source boundaries, and the current evidence state.
- `../../scripts/generate-powertab-ptb-v17-proof.mjs` regenerates the binary deterministically.
- `../../scripts/verify-powertab-ptb-v17-proof.mjs` performs two independent source-equivalent static parses based on the pinned Power Tab Editor legacy serializer/deserializer and the separately implemented TuxGuitar `ptab-4` reader.

## Exact identity

Binary bytes: `698`

SHA-256:

`2ab81e18e0867c738a121586ca5e01a1d05c5162e1cadd9adc30f866ed8b9354`

First six bytes:

`70 74 61 62 04 00`

That is ASCII `ptab` followed by little-endian file-version value `4`, the legacy PowerTab 1.7 boundary selected for the first `.ptb` checkpoint.

## Musical proof

The source is original Guitar Eyes test material with standard six-string tuning and six semantic positions:

1. low E fret 3, quarter note;
2. A open, eighth note;
3. A fret 2, eighth note;
4. D open, half note;
5. half-note rest;
6. high E open plus B fret 1, half-note chord.

Palm muting and other technique flags are deliberately absent from this first legacy specimen because the independent TuxGuitar reader inspected during preflight does not expose all of those legacy position flags. The first fixture is restricted to facts both source oracles can compare directly.

## Current evidence level

The exact binary passes:

1. deterministic generation;
2. binary/base64 identity;
3. exact `ptab-4` signature;
4. a Power Tab Editor legacy-source-equivalent parse through the entire document to exact EOF;
5. a TuxGuitar `ptab-4` source-equivalent parse through the complete legacy score payload;
6. parity for title, tuning, six positions, coordinates, durations, rest, and final chord note count.

The exact binary has not yet been opened by the actual Power Tab Editor 2.0.22 application or actual TuxGuitar application in this checkpoint. Do not describe it as editor-verified or accepted until that stronger gate is completed or replaced by stronger equivalent evidence.

Do not substitute or copy an upstream `.ptb` test song as the canonical fixture merely because it lives in an open-source repository. The musical content in this directory is project-authored and its generation is reproducible from source.

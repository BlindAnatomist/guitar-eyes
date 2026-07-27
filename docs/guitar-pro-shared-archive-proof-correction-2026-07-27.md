# Guitar Pro Shared-Archive Proof Correction

Date: July 27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Status: the prior GP7-specific result was removed; dependency and normalization evidence remains valid, but format-version acceptance is reopened

## Correction

The project-authored `.gp` fixture was generated with alphaTab's class named `Gp7Exporter`. Initial checkpoint language therefore described it as a Guitar Pro 7 fixture.

Direct archive inspection established that this was too strong.

The generated file contains:

1. root ZIP entry `VERSION` with text `7.0`;
2. `Content/score.gpif` element `GPVersion` with text `8.1.3`;
3. `Content/score.gpif` element `EncodingDescription` with text `GP8`.

Upstream alphaTab source confirms this combination is intentional:

1. `Gp7Exporter` is documented as writing Guitar Pro 7+ `.gp` files and always writes root `VERSION` as `7.0`;
2. `GpifWriter` currently writes `GPVersion` as `8.1.3` and `EncodingDescription` as `GP8`.

Primary upstream files:

- `packages/alphatab/src/exporter/Gp7Exporter.ts`;
- `packages/alphatab/src/exporter/GpifWriter.ts`.

## Consequence

Checkpoint 3A proved:

1. exact alphaTab dependency containment;
2. lazy worker decoding;
3. plain-data extraction;
4. strict semantic normalization;
5. deterministic generation of a shared `.gp` archive;
6. complete automated regression preservation;
7. successful production build;
8. absence of eager decoder code and prohibited renderer or audio assets.

It did not prove that the generated file is a clean GP7 specimen.

The prior file `docs/guitar-pro-7-proof-checkpoint-3a-result-2026-07-27.md` was deleted so it cannot act as an authoritative false record.

The fixture and source names containing `guitar-pro-7-proof` are historical checkpoint names only until renamed. They must not be cited as evidence of GP7 format identity.

## Required repair

Before any Guitar Pro support claim, publication, or iPhone test, Guitar Eyes must:

1. inspect archive entries directly;
2. read both the root `VERSION` marker and GPIF version metadata;
3. return a plain version-evidence object;
4. reject missing, malformed, contradictory, or unknown evidence;
5. stop hardcoding `sourceVersion: GP7` in the worker and normalizer;
6. relabel the current proof as a shared GP7-plus archive and GP8-semantic fixture;
7. add adversarial tests for root-only, GPIF-only, contradictory, GP7, GP8, and unknown evidence;
8. rename source identifiers and user-facing checkpoint language that imply accepted GP7 identity;
9. rerun the complete suite and production bundle inspection;
10. write a corrected proof result only after those gates pass.

## Scope boundary

No Guitar Pro version is currently accepted or published by Guitar Eyes.

ASCII and MusicXML acceptance remain unchanged.

PowerTab, TuxGuitar, TablEdit, compressed MusicXML, playback, teacher mode, AI, a pull request, and a merge remain outside this correction.

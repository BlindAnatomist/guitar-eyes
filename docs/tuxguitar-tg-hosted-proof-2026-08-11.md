# TuxGuitar `.tg` Hosted Proof

Date: August 11, 2026

Branch: `work/tuxguitar-tg-intake-investigation`

Exact hosted candidate source: `a50997d72010f10d2bfd415e0d44a6da2fea5c5b`

Accepted source-gate source: `6903acdb204bb88b4433801c88a9ab81cc135bd6`

Clean fork `main` authority before and after publication: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Status: hosted proof passed. Real-iPhone Safari/VoiceOver acceptance remains required before `.tg` support is accepted.

## Publication attempts

The first temporary publisher run was `31522133153` from temporary main commit `3d3c22ece26d6fff17d9eb80278fe1b30f732cbc`.

It failed before GitHub created any job. No source checkout, dependency installation, test, build, artifact upload, deployment, or live read-back occurred. The defect was confined to workflow YAML: the colon-bearing `BUILD_IDENTITY` scalar had not been quoted. Fork `main` was immediately restored to its clean authority.

The complete workflow was then audited outside Actions. The corrected YAML parsed successfully and every Bash `run` block passed `bash -n`. The timing-dependent `origin/main` assertion was also removed. Under the repository circuit-breaker rule, one corrective publication run was permitted.

The corrective publisher run was `31522318941`, job `93882127737`, triggered from temporary main commit `a7d918f38c7508a9cc23fd1b26d8a94e104312d8`.

As soon as the corrective run was confirmed in progress, fork `main` was restored to exact clean authority `60c2e5de0887b1bcdd426d932632946edd07d3c3`. The runner continued from the immutable work-branch source SHA rather than from `main`.

## Corrective hosted result

Every corrective-run step passed:

1. exact TuxGuitar source checkout;
2. publication authority and post-source-gate boundary verification;
3. locked Node dependency installation;
4. dependency-free verification of all six preserved `.tg` fixtures;
5. focused publication tests;
6. optimized Pages build;
7. exact artifact inspection;
8. GitHub Pages configuration;
9. Pages artifact upload;
10. Pages deployment;
11. complete live asset-manifest read-back.

The focused publication gate passed:

- 7 test suites;
- 46 tests;
- 0 failures.

The optimized production build compiled successfully.

The production artifact proved:

- the unique TuxGuitar test title and first level-one heading are present;
- source fixture filenames and the `Guitar Eyes TG Proof` fixture content are absent from the deployed application artifact;
- `TUXGUITAR_LEGACY_BINARY` is present in compiled JavaScript;
- `TUXGUITAR_ZIP_XML` is present in compiled JavaScript;
- `TuxGuitar_file_format 2.0.0` is present in compiled JavaScript;
- `asset-manifest.json` is present.

The live read-back loaded every JavaScript asset named by the deployed asset manifest. Eight JavaScript assets were read, and the required TuxGuitar legacy, modern-container, and exact modern-version markers were found across that complete hosted asset inventory.

## Hosted identity

The deployed candidate identifies itself as:

`Test build: Guitar Eyes TuxGuitar TG 1.0, 1.1, 1.2, 1.3, 1.5, and 2.0 proof.`

The live test address remains:

`https://blindanatomist.github.io/guitar-eyes/`

A cache-busting query may be appended for acceptance testing, but the first heading must match the identity above before testing begins.

## Remaining gate

The only remaining acceptance gate for this bounded checkpoint is real-iPhone Safari/VoiceOver testing of the six lawful project-authored fixtures:

- TuxGuitar 1.0;
- TuxGuitar 1.1;
- TuxGuitar 1.2;
- TuxGuitar 1.3;
- TuxGuitar 1.5;
- modern native file format 2.0.0.

The test must confirm the correct TuxGuitar version label, successful load, durable Files-picker focus recovery, and correct traversal/speech of the six shared semantic positions. No broader `.tg` compatibility claim follows until that real-device evidence is recorded.

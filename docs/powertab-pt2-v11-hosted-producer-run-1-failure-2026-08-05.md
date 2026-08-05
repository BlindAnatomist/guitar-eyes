# PowerTab `.pt2` Version-11 Hosted Producer Run 1 Failure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `e9d77a1bc9cf2ec99c7895d7c66bcf1e7bf795a3`

Workflow run: `31034047669`

Artifact: `powertab-v11-producer-evidence-31034047669`

Status: failed producer-launch preflight. No Power Tab Editor process ran. No source, semantic, test, build, or bundle conclusion is established by this run.

## Passed gates

1. Exact work branch was checked out.
2. Accepted application ancestry passed.
3. Source-checkpoint ancestry passed.
4. Exact temporary changed-file boundary passed.
5. Fork `main` remained exactly `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
6. The project-authored `.pt2` fixture hash passed.
7. The one-shot trigger content passed.
8. The standard Ubuntu runtime installation completed successfully.
9. The one-day evidence artifact uploaded successfully.

## Exact failure

The runtime installed Ubuntu package `wine64` version `9.0~repack-4build3`, but that minimal package did not place a `wine` or `wine64` wrapper on `PATH`.

The producer script checked only `command -v wine` and `command -v wine64`, found neither, and stopped with internal producer exit code `20`:

`Neither wine nor wine64 is available.`

The package's executable is available through the distribution's non-PATH Wine installation layout, or the `wine` wrapper package can be installed explicitly.

## Gates that did not run

The following did not run and must not be described as failures:

- official installer download and hash verification;
- installer extraction;
- packaged executable discovery and hashing;
- Power Tab Editor launch;
- graphical open and Save operation;
- editor-produced `.pt2` audit;
- semantic parity test;
- locked dependency installation;
- complete inherited suite;
- optimized production build;
- meaningful bundle inspection.

## Secondary workflow defect exposed

Skipped-step outputs were not safe as sole conditions for later steps. The first workflow allowed the complete-test and asset-inspection shells to start even though their prerequisite steps had been skipped. They then failed mechanically because locked dependencies and the build did not exist.

Those results do not establish a test or bundle defect.

The corrected workflow must include the producer, install, and semantic outputs explicitly in every downstream condition so a skipped prerequisite cannot be mistaken for success.

## Corrective boundary

Correct only:

1. Wine launcher discovery or wrapper installation;
2. explicit cumulative downstream conditions;
3. diagnostic runtime inventory sufficient to identify the actual executable path.

Do not change application source, fixture content, decoder behavior, dependencies, producer version, evidence standard, or repository authority.

A second run is justified only after the temporary workflow itself is corrected. The first failed run remains preserved as evidence and is not to be rerun unchanged.

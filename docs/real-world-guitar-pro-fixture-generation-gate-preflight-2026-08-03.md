# Real-World Guitar Pro Fixture-Generation Gate Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Feature branch: `work/real-world-guitar-pro-intake`

## Required purpose

Generate one lawful original cross-format Guitar Pro fixture pack before application implementation.

The gate will:

1. check out the exact Guitar Eyes feature source containing the project-authored MusicXML specimen;
2. clone `slundi/guitarpro` at exact commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`;
3. build its MIT-licensed `score_tool` CLI;
4. convert the source into GP3, GP4, GP5, GPX, and GP7 `.gp` outputs;
5. decode every output independently with pinned `@coderline/alphatab` `1.8.4`;
6. emit machine-readable semantic summaries, byte counts, and SHA-256 hashes;
7. fail if any output is missing, empty, undecodable, lacks a six-string staff, lacks bars, or lacks playable notes;
8. upload one short-retention artifact containing the source, five binaries, summaries, hashes, and generator provenance.

## Why GitHub-hosted execution is necessary

The active local container cannot resolve GitHub hosts and cannot clone or build the external Rust generator. The connected GitHub environment can run one standard Linux job and return the resulting artifact without owner file transport.

## Trigger

One temporary workflow committed to fork `main`, triggered only by the workflow file's own push path.

The workflow checks out immutable feature source:

`6c40b8b37abc73c216511e5c9280b2e2ba418d6c`

No application branch push triggers the workflow.

## Runner and expected duration

1. Runner: standard `ubuntu-24.04` GitHub-hosted runner.
2. Timeout: 20 minutes.
3. Expected dominant work: one Rust release build and five local conversions.
4. No paid runner or paid service.

## Permissions

1. Repository contents: read.
2. No write permission to the feature branch.
3. No Pages, deployment, package, issue, or pull-request permission.

## Artifact

1. Name: `real-world-guitar-pro-fixture-pack`.
2. Retention: one day.
3. Contents: source, five generated binaries, alphaTab summaries, hashes, and provenance.

## Duplication assessment

No existing workflow generates GP3, GP4, GP5, or GPX fixtures. Existing Guitar Pro workflows test project-authored shared `.gp` archives and cannot create the required legacy binaries.

The gate does not run the Guitar Eyes npm suite or production build. Those belong to the later application source gate after the fixture pack is committed.

## Failure discipline

1. Inspect the exact failing conversion or alphaTab assertion.
2. Do not rerun unchanged source.
3. Do not weaken semantic requirements merely to make a format pass.
4. If a feature fails to survive one format, reduce only the authored fixture feature set and document the loss.
5. If a required family cannot be generated or decoded, stop the checkpoint and record the unsupported family.

## Repository authority

The workflow exists temporarily on fork `main` only because GitHub Actions triggers from repository workflows. It must be removed by restoring `main` exactly to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

An independent comparison must show zero commits ahead, zero behind, and zero changed files after the run.

The upstream repository remains untouched. No pull request, merge, deployment, or publication is authorized.
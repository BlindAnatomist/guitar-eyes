# Real-World Guitar Pro Source Verification Gate Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Feature branch: `work/real-world-guitar-pro-intake`

## Purpose

Run one deliberate zero-dollar gate for the first real-world Guitar Pro intake foundation after source inspection, adapter implementation, and focused test review.

The gate must verify the exact feature head and must not publish Pages, deploy an application, modify the feature branch, open a pull request, merge, or touch upstream.

## Source boundary

The source gate covers only:

1. GP3, GP4, and GP5 legacy binary signature inspection;
2. GP6 GPX `BCFS` and `BCFZ` container inspection;
3. GP7 and GP8 shared `.gp` archive evidence;
4. one lazy alphaTab 1.8.4 runtime decoder;
5. one serializable Guitar Pro intermediate;
6. one accepted semantic musical normalizer reached through a source-evidence adapter;
7. inherited four-string bass and six-string guitar track selection;
8. current format-only desktop and iPhone readers;
9. project-authored cross-format fixture generation from one CC0 MusicXML source.

It does not authorize GP2, PowerTab, TuxGuitar, TablEdit, playback, alphaTab rendering, fonts, soundfonts, audio workers, publication, or arbitrary feature completeness.

## Required execution

1. Check out the exact feature SHA recorded in the temporary workflow.
2. Install from the committed npm lockfile.
3. Run the focused Guitar Pro source, worker, intermediate, normalizer, detector, reader-document, and application tests.
4. Run the complete inherited Jest suite once.
5. Run the production build once.
6. Inspect build output and fail if alphaTab fonts, soundfonts, audio worklets, or renderer workers are emitted.
7. Confirm the alphaTab importer remains in a lazy worker chunk rather than the initial application bundle.
8. Build the MIT-licensed `slundi/guitarpro` generator at exact commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`.
9. Convert `fixtures/real-world/musicxml-chord-rest-two-measures.musicxml` into GP3, GP4, GP5, GPX, and GP7 `.gp` specimens.
10. Decode every generated specimen independently with alphaTab 1.8.4 and require a six-string staff, playable notes, at least two bars, a chord, a timed rest, and more than one duration.
11. Upload one one-day artifact containing the authored source, generated binaries, hashes, semantic audit, and provenance.
12. Publish an explicit success or failure status against the exact feature commit with the Actions run URL.

## Runner, trigger, permissions, and cost

1. Trigger: one temporary workflow-file push to fork `main`.
2. Runner: standard `ubuntu-24.04` GitHub-hosted runner.
3. Timeout: 30 minutes.
4. Permissions: contents read, statuses write.
5. Artifact retention: one day.
6. No paid runner, paid service, Pages deployment, or environment deployment.
7. Fork `main` must be restored exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` immediately after the run is created.

## Failure discipline

1. Do not rerun unchanged source.
2. Inspect the exact failed step and logs first.
3. Repair only the demonstrated defect.
4. Do not weaken semantic assertions to make a family pass.
5. If one family cannot be generated and independently decoded, record that family as unproved rather than claiming support.

## Stop condition

Stop after source, test, build, artifact, and repository-authority evidence is complete. Do not publish a hosted acceptance candidate or ask for real-iPhone testing until this gate passes and the generated fixtures are committed with provenance.
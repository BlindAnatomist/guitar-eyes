# Known Problems and Proven Solutions: Audible Checkpoint Execution Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Date: July 28, 2026

Read this addendum with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`, `docs/known-problems-register-addendum-execution-gates.md`, and `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md` before changing test, build, artifact, or hosted-publication workflows.

---

## GE-EXEC-003 — Piping a gate through tee can conceal its failure

State: `local-proven`

### Symptoms

GitHub Actions displayed successful test or build steps even though Jest or Create React App had returned a nonzero exit. The later Pages sequence then failed in confusing downstream checks.

### Cause

The command used a pipeline equivalent to:

`npm test ... | tee log`

or:

`npm run build | tee log`

without enabling shell pipeline failure propagation. The shell returned the exit status of `tee`, not the test or build command.

### Failed-do-not-repeat approaches

1. Do not treat a green workflow step as proof when a required command is piped through `tee` without `pipefail`.
2. Do not diagnose downstream artifact or deployment checks before verifying the underlying test and build process exit.
3. Do not continue publication attempts from a build whose true exit status is unknown.

### Proven solution

For Bash commands whose output must also be preserved:

1. declare `shell: bash`;
2. run `set -o pipefail` before the pipeline;
3. pipe stdout and stderr through `tee` only after pipefail is active;
4. upload the log with `if: always()` so failed evidence survives;
5. accept the gate only when the command step itself succeeds.

### Evidence

Run `30387516414` used honest pipefail handling and preserved the exact Jest failure.

Run `30387935872` proved the repaired complete suite passed and preserved the exact remaining build lint failure.

Run `30388269269` then passed the complete suite, production build, and Pages deployment with honest exit handling.

### Derived standard

A retained log is useful only when the workflow also preserves the exit status of the command that produced it.

---

## GE-EXEC-004 — Broad artifact-name bans can reject accepted inherited architecture

State: `failed-do-not-repeat`

### Symptoms

The audible-output publication gate repeatedly rejected the build before Pages because a broad filename scan treated an inherited alphaTab worker or other existing resource as newly prohibited audio machinery.

### Cause

The workflow tried to infer feature scope from all emitted artifact names rather than from the exact source diff. Guitar Eyes already contains an accepted lazy alphaTab Guitar Pro decoder worker. The audible proof did not modify that worker, dependency, importer, public asset, or fixture route.

### Failed-do-not-repeat approaches

1. Do not classify every worker-named asset as an audio or renderer worker.
2. Do not use a new feature's boundary check to revoke an inherited accepted resource.
3. Do not infer newly introduced samples, fonts, or workers solely from a complete build inventory.
4. Do not add more artifact-reporting code when the exact source diff already answers whether a resource route changed.

### Proven solution

Establish a new feature's resource boundary by:

1. comparing the exact branch source against its accepted base;
2. proving package manifests did not change;
3. proving public/static asset paths did not change;
4. proving protected importer and decoder files did not change;
5. inspecting only the new runtime modules for external asset imports, network fetching, AudioWorklet, Worker, alphaSynth, or soundfont dependencies;
6. treating inherited accepted resources as unchanged unless the diff proves otherwise;
7. keeping the actual Pages workflow minimal after tests and build pass.

### Evidence

The audible proof source changed no package manifest, fixture, public audio asset, importer, alphaTab adapter, worker factory, decoder worker, or worker client.

Exact accepted application source: `4b6b2bedafa42044639606d373c72f46711d6cf8`.

Successful acceptance run: `30388269269`.

### Derived standard

Feature boundaries are properties of the exact source change, not guesses made from the names of every inherited build artifact.

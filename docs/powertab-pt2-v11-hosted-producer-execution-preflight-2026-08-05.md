# PowerTab `.pt2` Version-11 Hosted Producer-Execution Preflight

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Exact preflight base: `b9bcced66ca4b7a0c66ffce6a8d8d8b56d3c7c21`

Accepted application authority preserved: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Fork `main` authority preserved: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Pinned producer:

- Power Tab Editor release: `2.0.22`
- Power Tab Editor commit: `13cab27c7127d301f2747671071e53eb203dc940`
- Windows installer SHA-256: `523f12b26b457afa1ea8b15cf0daa2dfd1d82106da723150f662d8bee6a48037`
- required internal `.pt2` version: `11`

Status: execution preflight only. No producer run has occurred yet, no PowerTab support is claimed, and no publication is authorized.

## Exact purpose

Run one bounded standard-Linux GitHub-hosted execution gate that operates the exact packaged Power Tab Editor 2.0.22 Windows application under Wine and a virtual display. Open a copied instance of the project-authored source-derived version-11 `.pt2`, invoke the application's ordinary Save command through its graphical interface, preserve the rewritten file and execution evidence, and determine whether the exact producer accepts and re-exports the fixture without semantic loss.

This is not a new implementation checkpoint. It does not add a parser, widen a supported version, publish a preview, or claim accepted compatibility.

## Why hosted execution is necessary

The connected repository tools can inspect source, create bounded branch files, read workflow results, and retrieve artifacts, but they do not expose a new-workflow dispatch operation. The active local runtime has a virtual display but cannot resolve external package hosts, so it cannot install Wine or retrieve the official installer.

A public-repository standard Linux runner provides the missing zero-dollar network and Wine execution boundary without transferring desktop operation to the owner and without using a paid runner or service.

## Source boundary

The workflow may read:

- the exact branch content;
- `fixtures/powertab-v11/powertab-v11-original-six-position.pt2`;
- the exact official Power Tab Editor 2.0.22 installer;
- existing tests and build configuration.

The workflow must not modify or commit application source, dependencies, fixtures, manifests, or repository records. Its only repository output is a one-day workflow artifact.

## Trigger design

Preferred permanent trigger: `workflow_dispatch`.

Connector-limited bootstrap exception for this one run:

1. The temporary workflow also listens for a push to this exact work branch only.
2. That push trigger is path-limited to `.github/powertab-editor-evidence-trigger`.
3. The workflow file is committed first, before the trigger file exists, so installing the workflow does not execute it.
4. A second commit creates the exact trigger file and causes one intentional run.
5. After result inspection, remove the workflow first.
6. Remove the trigger file only after the workflow no longer exists, preventing cleanup from causing another run.

No wildcard branch, pull-request, schedule, repository-dispatch, release, deployment, or recurring trigger is permitted.

## Runner and cost boundary

- runner: GitHub-hosted `ubuntu-24.04` only;
- timeout: 15 minutes;
- concurrency: exact branch-scoped group with `cancel-in-progress: true`;
- permissions: `contents: read`;
- artifact retention: 1 day;
- paid runner: prohibited;
- paid service: prohibited;
- deployment: prohibited;
- bot commit: prohibited.

The repository is public. This checkpoint uses one standard Linux run and remains inside the governing zero-dollar policy.

## Planned execution sequence

1. Check out the exact triggering commit.
2. Assert branch name, fork-main authority, accepted application ancestry, exact source fixture path, and the temporary changed-file boundary with named expected-versus-actual diagnostics.
3. Install only Wine, Xvfb, xdotool, 7-Zip support, and minimal screenshot utilities from the standard Ubuntu repositories.
4. Download the exact 2.0.22 Windows installer.
5. Verify the installer SHA-256 before execution or extraction.
6. Extract the packaged application without recompiling or altering it.
7. Locate and hash the exact packaged `powertabeditor.exe`.
8. Copy the project-authored source-derived `.pt2` to an evidence workspace.
9. Initialize a fresh Wine prefix.
10. Run the packaged application under Xvfb while opening the copied `.pt2`.
11. Confirm that a Power Tab Editor window exists.
12. Capture diagnostic window information and a screenshot.
13. Activate the window and invoke `Ctrl+S`, the application's ordinary Save route.
14. Require observable rewrite evidence rather than assuming the keystroke succeeded.
15. Close the application cleanly or terminate it after the rewritten file is preserved.
16. Decompress and parse both source and producer-rewritten files.
17. Confirm internal version 11.
18. Record compressed and decompressed byte counts and SHA-256 hashes.
19. Compare the complete JSON structures and identify exact first differences, if any.
20. Run an ephemeral, noncommitted semantic-parity Jest test against the producer-rewritten file.
21. Only if producer and semantic gates pass, install locked project dependencies, run the complete inherited suite once, create the optimized production build, and inspect the bundle and asset boundary.
22. Upload the producer-rewritten file, decompressed audit, hashes, structured comparison, environment record, screenshot, window inventory, application logs, semantic test log, full test log, build log, and bundle inspection as one one-day artifact.

## Diagnostic stop conditions

Stop without running downstream project gates when any of these occurs:

1. installer hash mismatch;
2. packaged executable not found;
3. application cannot launch;
4. source fixture cannot be opened;
5. Power Tab Editor window cannot be identified;
6. Save does not produce observable rewrite evidence;
7. rewritten file is not valid gzip JSON;
8. rewritten file is not internal version 11;
9. producer output loses or materially changes the intended score;
10. ephemeral semantic normalization does not recover the six expected positions.

A producer-gate failure is not to be rewritten as a Jest, build, or application-source failure when those later gates did not run.

## Success boundary

This hosted execution succeeds only if:

1. the exact official installer hash passes;
2. the exact packaged application opens the project-authored fixture;
3. the graphical Save path rewrites the file;
4. the rewritten file remains valid version-11 `.pt2`;
5. structural differences, if any, are fully audited and semantically harmless;
6. Guitar Eyes recovers the exact six expected positions from the producer-rewritten file;
7. the complete inherited suite passes;
8. production build and bundle inspection pass;
9. all evidence is preserved in the one-day artifact.

Success would close the producer-execution and non-device verification gates only. A separately authorized hosted application candidate, live asset read-back, and bounded real-iPhone Safari and VoiceOver acceptance would still be required before `.pt2` support is claimed.

## Repository boundary

This checkpoint does not:

- alter fork `main`;
- alter upstream;
- open a pull request;
- merge;
- deploy;
- publish GitHub Pages;
- add a paid service or runner;
- begin legacy `.ptb`;
- begin another format family;
- reopen playback or teacher mode;
- involve John in dependency, producer, test, build, or artifact work.

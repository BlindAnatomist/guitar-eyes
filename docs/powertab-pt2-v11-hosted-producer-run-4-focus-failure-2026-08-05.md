# PowerTab `.pt2` Version-11 Hosted Producer Run 4 Focus Failure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `3cb0cfc010c232c064721c356f752be182394fb0`

Workflow run: `31036481027`

Job: `92409740998`

Artifact: `powertab-v11-direct-gui-evidence-31036481027`

Status: the exact installed Power Tab Editor GUI opened the copied fixture successfully, but the automation stopped before Save because `xdotool windowactivate` requires a window manager and the bounded Xvfb session intentionally had none. No PowerTab support claim, publication, pull request, merge, fork-main change, or upstream change occurred.

## Passed gates

1. Exact branch, accepted ancestry, temporary changed-file boundary, trigger identity, fixture hash, and fork-main authority passed.
2. Wine 32-bit and 64-bit runtime installation passed.
3. The exact official Power Tab Editor 2.0.22 installer hash passed.
4. The official installer completed successfully and the packaged application was located and hashed.
5. The copied `.pt2` opened in the real GUI.
6. A visible application window was found and a screenshot was preserved.
7. The exact window title was:

   `powertab-v11-editor-resaved-six-position.pt2 - Power Tab Editor 2.0.21 (v2.0.22-0-g13cab27)`

This title is direct runtime evidence from the pinned packaged application. It also preserves the upstream release-describe identity `v2.0.22-0-g13cab27` without relying on the failed console probe from run 3.

## Exact failure boundary

The GUI helper next invoked:

`xdotool windowactivate --sync <window-id>`

Xvfb reported:

`Your windowmanager claims not to support _NET_ACTIVE_WINDOW`

and `xdotool` exited nonzero. Because the helper used `set -e`, execution stopped before the subsequent direct `Ctrl+S` command.

The copied file therefore remained byte-identical to the source-derived fixture with SHA-256:

`669f9b71e7f8ba3c9ce939b98076bbddc17fb977b63b7f647f4bd01cfa072e71`

No graphical Save command was sent, no rewrite occurred, and no structural comparison was attempted.

## Gates not run

Because the producer internal exit code was `1`:

- locked dependency installation was skipped;
- editor-output semantic parity was skipped;
- the complete inherited suite was skipped;
- the optimized production build was skipped;
- bundle and asset-boundary inspection was skipped;
- no hosted publication or real-iPhone acceptance began.

## Correction

The next bounded run must change only the focus mechanism:

1. replace EWMH-dependent `windowactivate` with direct X input focus using `xdotool windowfocus --sync`;
2. retain the already proven visible-window search and exact window-title capture;
3. send `Ctrl+S` directly to the identified window;
4. preserve the existing rewrite observation, two-minute GUI timeout, and bounded Wine shutdown;
5. keep all repository, fixture, semantic, dependency, test, build, and cost gates unchanged.

Do not rerun run 4 unchanged.

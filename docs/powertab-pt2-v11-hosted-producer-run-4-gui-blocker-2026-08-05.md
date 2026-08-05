# PowerTab `.pt2` Version-11 Hosted Producer Run 4 GUI Blocker

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `3cb0cfc010c232c064721c356f752be182394fb0`

Workflow run: `31036481027`

Artifact: `powertab-v11-direct-gui-evidence-31036481027`

Status: the exact producer application opened the project-authored fixture successfully. GUI automation stopped before Save because a modal MIDI error dialog remained open and the virtual X server did not support the selected window-activation mechanism.

## Passed gates

1. Exact branch, ancestry, changed-file boundary, fixture hash, trigger identity, and fork-main authority passed.
2. Wine 32-bit and 64-bit runtimes installed successfully.
3. The exact official installer SHA-256 passed.
4. The official installer completed successfully.
5. The installed Power Tab Editor executable hash remained:

`d6bc20f65edbbb509d15cf5e8e10a18ebbf14a48212ea3b417173f9b290046b1`

6. The copied `.pt2` was passed directly to the installed application.
7. A visible main application window was found.
8. The captured main-window title was:

`powertab-v11-editor-resaved-six-position.pt2 - Power Tab Editor 2.0.21 (v2.0.22-0-g13cab27)`

9. The screenshot shows the authored score open in Power Tab Editor, including its title, authorship text, Proof Guitar instrument, notation, and the expected rest/chord material.
10. The run completed within the bounded GUI timeout and uploaded its complete one-day artifact.
11. All project dependency, semantic, complete-test, build, and asset gates remained skipped.

## Exact blocker

The application emitted MIDI initialization errors because the headless runner has no ALSA MIDI device. The application remained usable, but a modal `Midi Error` dialog with an `OK` button covered the score.

The X window inventory recorded the main Power Tab Editor window and three MIDI Error windows.

The automation then invoked `xdotool windowactivate --sync` on the main window. The Xvfb window manager does not support `_NET_ACTIVE_WINDOW`, so `windowactivate` aborted:

`Your windowmanager claims not to support _NET_ACTIVE_WINDOW`

`xdo_activate_window ... reported an error`

Because the script uses fail-fast shell behavior, it stopped before sending Ctrl+S.

## What did not occur

- the MIDI error dialogs were not dismissed;
- Ctrl+S was not sent;
- the copied file retained the forced pre-save timestamp and original SHA-256;
- no editor-resaved JSON audit occurred;
- no semantic or project verification gate ran.

## Corrective boundary

1. After locating the main window, enumerate every visible window titled `Midi Error`.
2. Send Return or click the `OK` control directly to each modal dialog until none remains.
3. Use `xdotool windowfocus`, which sets X input focus directly, rather than EWMH-dependent `windowactivate`.
4. Send Ctrl+S directly to the identified main-window ID.
5. Preserve the existing file-rewrite requirement, screenshots, window inventory, timeouts, installer identity, semantic gates, and repository boundaries.

Do not alter the fixture, application source, decoder, dependencies, producer version, or evidence standard. Do not rerun run four unchanged.

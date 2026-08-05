# PowerTab `.pt2` Version-11 Hosted Producer Run 3 Timeout

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `122b670a6dd4f2f0495134533144ca72601e3908`

Workflow run: `31034810435`

Artifact: `powertab-v11-producer-installer-evidence-31034810435`

Status: official installer passed; producer application version probe remained active until the fifteen-minute job timeout. The fixture was not opened or saved. No semantic, test, build, or bundle conclusion is established.

## Passed gates

1. Exact branch, ancestry, fork-main authority, fixture hash, trigger, and temporary changed-file boundary passed.
2. Wine 32-bit and 64-bit runtimes installed successfully.
3. The exact official installer downloaded and its pinned SHA-256 passed.
4. The exact official installer itself executed under Wine and exited `0`.
5. The installer log states `Installation process succeeded.`
6. The installed application and supporting runtime files were located under the fresh Wine prefix.
7. Installed `powertabeditor.exe` SHA-256 was recorded as:

`d6bc20f65edbbb509d15cf5e8e10a18ebbf14a48212ea3b417173f9b290046b1`

8. The source-derived `.pt2` was copied into the evidence workspace with its expected original SHA-256 and forced pre-save timestamp.
9. All downstream dependency, semantic, complete-test, build, and asset gates remained skipped.
10. The evidence artifact uploaded despite the job timeout.

## Exact timeout boundary

After successful installation, the helper invoked:

`powertabeditor.exe --version`

under Wine and Xvfb, expecting the Qt command-line parser to print version `2.0.22` and exit.

The process produced an empty version-output file and did not return before the job timeout. The helper therefore never reached the command that opens the copied `.pt2`.

This does not establish that the graphical application cannot run. It establishes that the command-line version probe is not a safe unattended readiness gate under this Wine environment.

## What did not occur

- no main application window was searched for;
- no fixture open was attempted;
- no graphical Save command was invoked;
- no file rewrite occurred;
- no editor-produced JSON was audited;
- no project dependencies, tests, build, or bundle gate ran.

The preserved evidence file still matched the original source-derived fixture exactly and retained the forced timestamp.

## Failed-do-not-repeat conclusion

Do not use an unbounded `--version` invocation as the producer readiness test.

Do not use an unbounded `wineserver -w` shutdown wait after GUI automation.

## Corrective boundary

1. Treat the pinned installer hash, successful official installer log, installed executable path, and installed executable hash as producer identity evidence.
2. Either omit the `--version` probe or cap it to a few seconds and record its diagnostic result without blocking the GUI path.
3. Launch the installed application directly with the copied `.pt2`.
4. Require a visible Power Tab Editor window and observable file rewrite after `Ctrl+S`.
5. Cap application close and Wine-server cleanup so successful evidence preservation cannot be trapped by a background Wine service.
6. Keep every source, fixture, semantic, repository, cost, and downstream gate unchanged.

A fourth run is justified only with those two waits bounded. The first three runs remain preserved as evidence.

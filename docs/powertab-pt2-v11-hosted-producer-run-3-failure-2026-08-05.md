# PowerTab `.pt2` Version-11 Hosted Producer Run 3 Failure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Work branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `122b670a6dd4f2f0495134533144ca72601e3908`

Workflow run: `31034810435`

Job: `92404109437`

Status: bounded producer execution stopped at the job timeout. No PowerTab support claim, preview publication, pull request, merge, fork-main change, or upstream change occurred.

## Gates that passed

1. Exact branch, ancestry, changed-file boundary, fixture hash, trigger identity, and fork-main authority passed.
2. Standard Ubuntu runner installation of Wine 32-bit and 64-bit support passed.
3. The exact official Power Tab Editor 2.0.22 Windows release asset downloaded with SHA-256:

   `523f12b26b457afa1ea8b15cf0daa2dfd1d82106da723150f662d8bee6a48037`

4. The official installer executed under Wine and returned exit code `0`.
5. The installer log recorded `Installation process succeeded.` and `Need to restart Windows? No`.
6. The packaged application installed at:

   `C:\PowerTabEditor\powertabeditor.exe`

7. The installed executable SHA-256 was:

   `d6bc20f65edbbb509d15cf5e8e10a18ebbf14a48212ea3b417173f9b290046b1`

8. The artifact preserved the complete installed application inventory, installer log, runtime versions, executable hash, and the untouched copied `.pt2` fixture.

## Exact failure boundary

After successful installation, the producer script invoked the Windows GUI executable with `--version` and redirected console output to `powertabeditor-version.txt`.

That command did not return before the workflow's fifteen-minute timeout. The version file remained empty. The application GUI was therefore never launched with the fixture, Ctrl+S was never sent, and no editor-resaved output was produced.

The upstream application source does register a Qt version option, but this run proved that a console-output version probe against the packaged Windows GUI executable is not a reliable execution gate under this Wine environment.

## Gates not run

Because the producer step never completed:

- locked dependency installation was skipped;
- editor-output semantic parity was skipped;
- the complete inherited suite was skipped;
- the optimized production build was skipped;
- bundle and asset-boundary inspection was skipped;
- no hosted publication or real-iPhone acceptance began.

## Correction

The next bounded run must change only the false producer preflight mechanism:

1. remove the blocking `powertabeditor.exe --version` console probe;
2. preserve release identity through the exact official installer asset hash, installer success log, installed executable hash, and installed package inventory;
3. launch the installed application directly with the copied fixture;
4. keep the GUI round trip under its own timeout;
5. terminate any remaining Wine server after the file rewrite is observed;
6. retain cumulative downstream gate conditions so no skipped gate can appear successful.

Do not rerun run 3 unchanged.

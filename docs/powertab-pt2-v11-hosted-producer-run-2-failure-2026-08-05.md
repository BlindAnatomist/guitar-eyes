# PowerTab `.pt2` Version-11 Hosted Producer Run 2 Failure

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Triggering commit: `bba4b32ba0372aceba5476eb153055cd0ed0cf8d`

Workflow run: `31034486380`

Artifact: `powertab-v11-producer-evidence-corrected-31034486380`

Status: failed installer-extraction gate. No Power Tab Editor process ran. No semantic, test, build, or bundle conclusion is established by this run.

## Passed gates

1. Exact branch, ancestry, fork-main authority, fixture hash, trigger, and temporary changed-file boundary passed.
2. Ubuntu installed the `wine` and `wine64` wrapper packages successfully.
3. Wine launcher, `wineboot`, `winepath`, and `wineserver` were all found on `PATH`.
4. The exact official Power Tab Editor 2.0.22 Windows installer downloaded successfully.
5. Installer SHA-256 matched the pinned value:

`523f12b26b457afa1ea8b15cf0daa2dfd1d82106da723150f662d8bee6a48037`

6. Cumulative workflow conditions behaved correctly. Every downstream dependency, semantic, complete-test, build, and asset gate was skipped after the producer failure.
7. The one-day evidence artifact uploaded successfully.

## Exact failure

Ubuntu `innoextract` version `1.9-0.1build1` identified the setup data as Inno Setup `6.4.0.1` but could not parse its headers:

`Stream error while parsing setup headers!`

The producer helper exited with code `2` at the extraction command.

This establishes an extractor-version incompatibility. It does not establish installer corruption because the official installer hash matched exactly.

## Gates that did not run

- packaged application discovery and hashing;
- installer execution;
- Power Tab Editor launch;
- fixture opening;
- graphical Save;
- editor-produced `.pt2` audit;
- semantic parity;
- locked project dependency installation;
- complete inherited suite;
- production build;
- bundle inspection.

## Failed-do-not-repeat conclusion

Do not retry Ubuntu `innoextract` 1.9 against this installer and do not substitute another unverified extractor merely to unpack the application.

## Corrective boundary

1. Install Wine 32-bit setup support in addition to the 64-bit runtime.
2. Run the exact hash-verified official installer itself under Wine using documented silent Inno Setup switches.
3. Preserve the installer log and installed executable hash.
4. Locate and run the installed Power Tab Editor application from the same fresh Wine prefix.
5. Keep every source, fixture, version, semantic, repository, cost, and downstream gate unchanged.

A third run is justified only after the workflow replaces extraction with execution of the exact official installer. The first two failed runs remain preserved as evidence.

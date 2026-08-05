# PowerTab `.pt2` Version-11 Editor-Evidence Gate Result

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-editor-evidence-gate`

Exact starting head: `6c17997eba96e16aa248d8fd5a0e632ba5f370ce`

Pinned producer authority:

- Power Tab Editor release: `2.0.22`
- Power Tab Editor commit: `13cab27c7127d301f2747671071e53eb203dc940`
- required internal `.pt2` version: `11`

Status: evidence gate stopped honestly at the producer-execution boundary. The source checkpoint remains provisional. No public PowerTab support is claimed.

## Question tested

Can this environment produce the project-authored six-position score through the exact Power Tab Editor 2.0.22 application, save it as a genuine editor-exported version-11 `.pt2`, preserve its hashes, and compare it with the source-derived fixture?

Answer: not in the available execution environment.

## Official application route audited

The pinned 2.0.22 release provides packaged applications for Windows and macOS. Linux distribution is through Snap or Flatpak.

The available execution environment has:

- no Windows runtime or Wine;
- no macOS runtime;
- no Snap or Flatpak runtime;
- no Qt 6 development installation sufficient to build the editor;
- no permitted network route for installing those missing runtimes or dependencies.

The pinned application entry point was also audited. Its command line accepts positional files to open plus help and version options. It does not expose a noninteractive save, convert, or export argument. Therefore opening a file from a shell is not a substitute for operating the graphical editor and invoking its save/export path.

No synthetic automation was presented as editor execution.

## Upstream producer fixtures discovered

The pinned upstream source tree contains two committed `.pt2` test fixtures under:

`test/score/data`

### `test_viewfilter.pt2`

- upstream Git blob: `47308dd3c20c3dcdef8a0689e4fa87725f9c9e3b`
- compressed bytes: `910`
- compressed SHA-256: `74f4112bdfc16ce4c9ed2ae466d3c8152c0e738a22505a009c586a5f7162c312`
- decompressed bytes: `8264`
- decompressed SHA-256: `c7d7a274c0c3c3751ff14c9e0a268c728b7db9b3310dd9d6f7e1552a47fac037`
- internal version: `2`

The pinned upstream test suite loads this file through `PowerTabImporter` to exercise player and view-filter behavior.

### `reordered.pt2`

- upstream Git blob: `2d19489e289070a550e2dcca36dcb500d702f7c9`
- compressed bytes: `1066`
- compressed SHA-256: `9c197bcd35219b2a62634c86a95072937d8710c8e07375149e5de368d7723a1b`
- decompressed bytes: `6864`
- decompressed SHA-256: `489f07c89d17f87015fe0f461ec2b41e568727f535e7fbbefc1658cc44c58684`
- internal version: `4`

## What the upstream fixtures prove

They strengthen lawful format-family evidence because they are preserved inside the pinned producer repository and exercised by its tests.

They prove that:

- gzip-compressed JSON is an authentic `.pt2` lineage;
- older internal versions exist in real producer-maintained fixtures;
- extension-only recognition is insufficient;
- exact internal-version gating is necessary.

## What they do not prove

Neither fixture:

- carries internal version 11;
- represents the Guitar Eyes six-position proof score;
- demonstrates the exact 2.0.22 graphical save path;
- establishes semantic parity with the project-authored source-derived fixture;
- authorizes widening the decoder to versions 2 or 4;
- closes the editor-export acceptance requirement.

The official older fixtures therefore remain external audit evidence. They are not copied into Guitar Eyes and are not substituted for the required canonical version-11 editor export.

## Verification performed

Without modifying application source, the gate completed these read-only checks:

1. verified the exact Guitar Eyes starting head;
2. verified the exact pinned producer commit and release;
3. audited the release packaging routes;
4. audited the application command-line parser;
5. enumerated the producer repository's committed `.pt2` fixtures;
6. retrieved both fixtures through GitHub's base64 file transport;
7. decoded their gzip containers;
8. parsed their JSON roots;
9. recorded their compressed and decompressed byte counts and SHA-256 hashes;
10. confirmed internal versions 2 and 4;
11. confirmed that the pinned producer test suite imports `test_viewfilter.pt2` through `PowerTabImporter`.

## Gates deliberately not run

The following remain incomplete:

- exact editor-produced version-11 fixture for the six-position score;
- structural and semantic parity comparison;
- locked Guitar Eyes dependency installation;
- focused and complete Jest execution;
- optimized production build;
- bundle and asset-boundary inspection;
- hosted publication;
- real-iPhone Safari and VoiceOver acceptance.

No GitHub Actions workflow was dispatched. The source precondition failed before an Actions or publication gate was justified.

## Required unblock

One of the following must occur without changing the evidence standard:

1. Run exact Power Tab Editor 2.0.22 on Windows, macOS, Snap, or Flatpak; reproduce the six-position score; save it through the application as `.pt2`; and return the resulting file with the environment recorded.
2. Provide an execution environment in which the exact pinned graphical application can be installed and operated reproducibly.

After the canonical file exists, the next gate is:

`editor export -> hash and decompression audit -> version-11 confirmation -> structural comparison -> Guitar Eyes semantic parity -> locked tests -> full suite -> production build -> bundle inspection`

The evidence standard must not be weakened merely because the producer application is graphical.

## Repository boundary

This gate does not:

- alter application source;
- alter fixtures;
- alter dependencies;
- change fork `main`;
- change upstream;
- run Actions;
- deploy;
- open a pull request;
- merge;
- begin legacy `.ptb`;
- claim accepted `.pt2` support.

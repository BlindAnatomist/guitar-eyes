# Shared Semantic Core Checkpoint 1

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Base branch: `work/iphone-voiceover-tablature-audit`

## Objective

Begin convergence without redesigning Jason's desktop reader or narrowing its existing capabilities.

A supported six-string guitar upload must be read once, parsed once into the semantic tablature document, and supplied to both reader interfaces. Unsupported semantic formats must continue through Jason's legacy desktop parser.

## Implemented result

1. Added `docs/shared-semantic-core-plan.md` as the governing convergence plan.
2. Added `src/desktopSemanticAdapter.js` to project semantic blocks and string source lines into Jason's existing desktop input shape.
3. Added `src/tabImportCoordinator.js` as the single import-routing boundary.
4. Refactored `src/parseFile.js` so the legacy parser can consume already-read source text instead of requiring a second file read.
5. Updated `src/App.js` so each file is read once.
6. Supported one-block six-string guitar tab now uses one semantic document for both the desktop grid and iPhone reader.
7. Multiple guitar blocks remain available through the legacy desktop fallback.
8. Four-string bass remains available through the legacy desktop fallback.
9. The accepted iPhone parsing, navigation, live-region, and native-picker focus code was not redesigned.
10. Jason's `DataGrid`, keyboard commands, grouped navigation, and speech behavior were not redesigned.

## Added contract coverage

1. `src/desktopSemanticAdapter.test.js` checks semantic-to-desktop projection.
2. `src/parseFile.test.js` checks the already-read legacy text path for guitar and bass.
3. `src/tabImportCoordinator.test.js` checks:
   - semantic-first six-string guitar routing;
   - multiple-block guitar fallback;
   - four-string bass fallback.

## Verification performed without GitHub Actions

1. JavaScript and JSX syntax parsing passed for:
   - `src/App.js`;
   - `src/desktopSemanticAdapter.js`;
   - `src/parseFile.js`;
   - `src/tabImportCoordinator.js`.
2. Targeted executable checks passed for:
   - semantic guitar routing;
   - semantic-to-desktop projection;
   - multiple-block guitar fallback;
   - four-string bass fallback.
3. Repository comparison confirms this branch is ahead of the accepted iPhone branch and is not behind it.
4. Both inherited GitHub Actions workflows remain `workflow_dispatch` only. These commits therefore did not automatically consume GitHub Actions minutes or deploy a preview.

## Verification not yet performed

The full React test suite and production build have not been run for this branch. The current environment did not have the repository dependency tree, and a GitHub Actions run was deliberately not triggered because remaining monthly Actions usage is constrained.

No hosted preview or new real-iPhone acceptance pass has been performed for this branch.

## Current verdict

Implementation boundary: complete.

Full automated and human acceptance: pending.

No pull request was opened. Nothing was merged into fork `main`. Upstream remains untouched.

## Next bounded step

Expand the semantic document to support four-string bass and multiple tablature blocks. Each added capability should replace one legacy fallback path while preserving the existing desktop interface and shared-reader contract.
# Phase 2: Parser Expansion and Measure Navigation

Date started: July 24, 2026

Branch: `work/phase-2-parser-measure-navigation`

Base: accepted bounded iPhone proof at `cd14af74f82b2b8e4d23d964324e76a095da31ae`

## Objective

Expand the accepted semantic reader without disturbing its proven iPhone reading order or native Files-picker focus recovery.

## Authorized implementation boundary

1. Accept multiple complete six-string tablature blocks.
2. Ignore and report ordinary headings, notes, and blank lines outside tablature blocks.
3. Treat internal vertical bars as measure boundaries rather than unsupported notation.
4. Preserve one semantic document containing blocks, measures, positions, strings, warnings, and source-column evidence.
5. Add VoiceOver-first navigation for start of tablature, previous and next measure, previous and next position, and reading the current position.
6. Add realistic fixtures and automated regression coverage.
7. Publish only after dependency installation, all tests, and production build pass.
8. Ask the owner for a narrowly bounded real-iPhone acceptance only after all automated and hosted work is exhausted.

## Preserved constraints

- Do not modify `Phlypper/guitar-eyes`.
- Keep fork `main` identical to upstream.
- Do not open a pull request.
- Preserve the accepted iOS Files-picker focus repair.
- Do not implement playback, teacher mode, bookmarks, pattern analysis, or AI in this phase.

## Implemented

- Multi-block parser with explicit six-string block validation.
- Non-tablature heading and note tolerance with warnings.
- Internal bar-line measure segmentation.
- Global and per-measure position metadata.
- Measure-aware spoken position descriptions.
- Start, previous measure, next measure, previous position, next position, and read-current controls.
- Multi-block, multi-measure fixture.
- Parser and reader regression tests.

## Verification status

Pending repository automation.

## Manual acceptance status

Not requested. Manual testing remains blocked until automation and hosted publication pass.

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
- Multi-block, multi-measure fixture in both repository and hosted-public fixture paths.
- Parser and reader regression tests.

## Automated verification

Repository automation passed on the implementation head:

1. `npm ci` passed.
2. Three test suites passed.
3. All 16 automated tests passed.
4. The production build passed.
5. Existing upload-focus regression coverage continued to pass.
6. Parser tests cover headings, blank lines, multiple blocks, internal measure boundaries, two-digit frets, open strings, techniques, unsupported notation, and incomplete blocks.
7. Reader tests cover position navigation, measure navigation, return to beginning, disabled boundary states, and restrained live announcements.

See `docs/proof-automated-results.md`.

## Hosted verification

The verified Phase 2 branch was built and published through the proven temporary-main procedure.

- Verification and build: success.
- GitHub Pages deployment: success.
- Preview: `https://blindanatomist.github.io/guitar-eyes/`
- Hosted fixture: `https://blindanatomist.github.io/guitar-eyes/fixtures/phase-2-multi-measure-six-string.txt`
- Fork `main` was restored to `60c2e5de0887b1bcdd426d932632946edd07d3c3` and independently compared as identical: zero ahead, zero behind, no changed files.

See `docs/phase-2-hosted-preview-status.md`.

## Real-iPhone acceptance progress

The owner first uploaded the Phase 2 fixture from an already-open Safari tab without refreshing. Safari was still running the previously published bounded-proof JavaScript and returned the old `too many lines` rejection. After refreshing the page, the same fixture loaded successfully under the Phase 2 parser.

This establishes:

1. the hosted Phase 2 parser is present;
2. the multi-block fixture is accepted after a current-page load;
3. the earlier rejection was stale page state, not a parser or deployment failure.

This result must not be misrecorded as an intermittent parser failure.

## Remaining manual acceptance gate

Only the new measure-navigation behavior still requires real-iPhone confirmation:

1. The first result announces measure 1 and position 1.
2. `Next measure` lands at the first position of measure 2.
3. `Previous measure` returns to the first position of measure 1.
4. `Next position` and `Previous position` remain understandable.
5. `Start of tablature` returns to the first position after moving away.
6. Button order and announcements do not become confusing or excessively verbose in VoiceOver.

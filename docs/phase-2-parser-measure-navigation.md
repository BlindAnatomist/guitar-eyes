# Phase 2: Parser Expansion and Measure Navigation

Date started: July 24, 2026

Branch: `work/phase-2-parser-measure-navigation`

Base: accepted bounded iPhone proof at `cd14af74f82b2b8e4d23d964324e76a095da31ae`

## Objective

Expand the accepted semantic reader without disturbing its proven iPhone reading order or native Files-picker focus recovery.

## Implemented parser work

- Multiple complete six-string tablature blocks.
- Headings, notes, and blank lines outside tablature blocks.
- Internal vertical bars as measure boundaries.
- One semantic document containing blocks, measures, steps, strings, warnings, and source-column evidence.
- Realistic multi-block and multi-measure fixtures.

## First navigation design

The first Phase 2 reader exposed measure and position navigation and passed automated verification, but failed real-iPhone usability acceptance.

Owner finding:

- The reader technically moved between positions and measures.
- VoiceOver presented measure numbers, position numbers, overall position counts, played strings, silent strings, and controls in one dense stream.
- The owner could not form a clear mental model of what was happening or what to expect.

This is an interaction-design failure, not a user-testing failure.

## Clarity redesign

- Replace the software-oriented term `position` with the musical-action term `step` in the reader interface.
- Separate location from instruction.
- Present location as `Measure X of Y. Step A of B.`
- Present only the strings that must be played at the current step.
- Omit routine silent-string recitation.
- Separate step navigation from measure navigation into labeled groups.
- Rename measure controls to `Previous measure start` and `Next measure start`.
- Rename `Read current position` to `Repeat current step`.
- Remove the redundant overall-position count.
- Collapse parsing notes unless the user chooses to inspect them.

## Automated verification

The clarity redesign passed repository automation:

1. `npm ci` passed.
2. All test suites passed.
3. The production build passed.
4. Existing native-picker focus recovery coverage continued to pass.
5. Reader tests verify the simplified labels, separated navigation groups, step language, measure jumps, return to beginning, and restrained live announcements.

See `docs/proof-automated-results.md`.

## Hosted verification

The exact verified clarity redesign was published successfully.

- Verification and build: success.
- Deployment: success.
- Preview: `https://blindanatomist.github.io/guitar-eyes/`
- Fixture: `https://blindanatomist.github.io/guitar-eyes/fixtures/phase-2-multi-measure-six-string.txt`

See `docs/phase-2-clarity-preview-status.md`.

## Remaining acceptance gate

A focused real-iPhone Safari and VoiceOver pass is required to determine whether the simplified model is understandable in actual use.

The owner should refresh the hosted page before testing because an already-open Safari tab may retain an older application build.

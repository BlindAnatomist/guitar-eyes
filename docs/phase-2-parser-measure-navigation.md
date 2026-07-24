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

This was an interaction-design failure, not a user-testing failure.

## Clarity redesign and second real-device failure

The reader was changed from `position` to `step`, location and playing instructions were separated, silent strings were omitted, and controls were divided into step and measure groups.

Real-iPhone testing exposed a second design failure:

- The current playing instruction was associated with navigation controls through `aria-describedby`.
- VoiceOver therefore repeated the current note after labels such as `Next step` and `Previous step`.
- This made it sound as though every control pointed to the same note or that the destination had not changed.
- The separate measure-navigation controls added more concepts and control chatter than the simple reading task required.

## Accepted simplified reader

The accepted reader now uses one linear reading flow:

- `Back`
- `Next`
- `Repeat instruction`

The main flow no longer exposes separate previous-measure, next-measure, or beginning controls.

Each step is one complete musical event. The reader explicitly distinguishes:

- a single note;
- multiple strings played together;
- a rest.

Navigation controls have no playing instruction attached to their accessible descriptions. After activating `Back` or `Next`, focus moves to the updated `What to play now` target so VoiceOver reads the destination instruction rather than repeating the source instruction on the button.

`Repeat instruction` remains as an optional recovery control for an interrupted announcement, repositioning the instrument or hands, or hearing the current fingering again without moving.

## Automated verification

The accepted simplified reader passed repository automation:

1. `npm ci` passed.
2. All test suites passed.
3. All 17 automated tests passed on the preceding clarity implementation, followed by passing verification on the simplified-reader commit.
4. The production build passed.
5. Existing native-picker focus recovery coverage continued to pass.
6. Reader tests verify that navigation buttons do not inherit the current playing instruction, focus moves to the new instruction, single notes and simultaneous strings are distinguished, and the simplified control set is present.

See `docs/proof-automated-results.md`.

## Hosted verification

The exact verified simplified reader was published successfully.

- Verification and build: success.
- Deployment: success.
- Preview: `https://blindanatomist.github.io/guitar-eyes/`
- Fixture: `https://blindanatomist.github.io/guitar-eyes/fixtures/phase-2-multi-measure-six-string.txt`

See `docs/phase-2-simplified-reader-preview-status.md`.

## Safari refresh note

During the first Phase 2 hosted test, an already-open Safari tab retained the previous application build and reported the old parser's `too many lines` error. Refreshing the page loaded the correct Phase 2 parser and the same file worked. Treat an unexpected old-interface message as possible stale page state and refresh once before diagnosing a deployment or parser regression.

## Real-iPhone VoiceOver acceptance

Status: passed July 24, 2026.

The owner refreshed the hosted page, loaded the multi-block fixture, and tested the simplified flow with VoiceOver. Final finding:

> `OK, that's much easier to understand. I'm not sure why we need the repeat instruction, but there's no reason to get rid of it.`

Accepted conclusions:

- The simplified `Back`, `Next`, and `Repeat instruction` flow is understandable.
- The earlier position-and-measure control designs are not accepted and must not be restored without a new real-device rationale and acceptance gate.
- `Repeat instruction` is retained as an optional non-navigation control.
- Phase 2 real-iPhone VoiceOver acceptance is complete.

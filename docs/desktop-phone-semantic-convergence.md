# Desktop and Phone Semantic Convergence

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iphone-voiceover-tablature-audit`

Status: source implementation complete; full repository test, build, hosted publication, and owner acceptance remain checkpoint gates

## Owner authorization

The owner explicitly authorized completing the convergence between Jason Washburn's desktop reader and the accepted iPhone semantic reader:

> We need to complete that convergence I want to bring his up-to-date with mine

The upstream repository remains untouched. Fork `main` remains reserved as a clean upstream-tracking branch. No pull request or merge is authorized.

## Problem being corrected

The accepted iPhone proof and the preserved desktop reader occupied one website but still interpreted an uploaded file through separate active paths:

- the desktop path grouped raw lines and rendered source characters;
- the iPhone path parsed synchronized musical positions into a semantic document.

That split allowed the two modes to disagree about multi-digit frets, alignment, string identity, unsupported notation, measures, valid blocks, error behavior, and what constituted a navigable unit. The desktop interface also retained hundreds of focusable character cells and intercepted modifier combinations VoiceOver uses for navigation.

## Converged architecture

The active application now follows one path:

`plain-text source -> shared semantic tablature document -> desktop presentation and iPhone presentation`

The shared document contains:

- instrument type and required string count;
- complete tablature blocks;
- source line numbers and original string lines;
- string identity and tuning;
- synchronized musical positions;
- multi-digit frets without row drift;
- open, fretted, silent, continuation, technique, and unsupported states;
- internal bar lines and derived measure position;
- ignored non-tablature source lines;
- user-facing warnings.

The former `iphoneTabModel.js` path is retained only as a compatibility re-export. The authoritative implementation is `src/tablatureModel.js`.

## Desktop reader modernization

The active desktop reader no longer consumes `parseFile` or `DataGrid` output.

It now provides:

1. the same current-position description used by the iPhone reader;
2. Previous position, Read current position, and Next position in the same order;
3. a focused keyboard navigator using unmodified Left Arrow, Right Arrow, Home, End, and Enter;
4. no interception of Control+Option VoiceOver commands;
5. standard semantic tables with rows as strings and columns as synchronized musical positions;
6. no `tabIndex` on every table cell;
7. named string-state cells rather than separate focus stops for dashes and separators;
8. current-position column marking;
9. shared guitar, bass, multiple-block, measure, warning, and error behavior.

Jason's spatial insight remains present in the desktop table. John's semantic navigation is no longer a phone-only interpretation. They are two presentations of one musical object.

## iPhone behavior preserved and extended

The iPhone reader continues to avoid raw-character swipe order and preserves the accepted native Files-picker focus recovery. It now consumes the generic shared model, supports the same multi-block document as desktop, identifies position within a measure, and uses the accepted Previous, Read current, Next control order.

## Source validation performed before repository write

The available local environment could not clone GitHub, install npm dependencies, or run the Create React App test/build gate. It did support source reconstruction and non-network validation.

Completed locally:

- all changed JavaScript and JSX parsed successfully with the TypeScript parser;
- all production modules transpiled successfully;
- all production modules loaded successfully against controlled React stubs, confirming import and export resolution;
- direct semantic-model assertions passed for guitar, bass, multiple blocks, title-line preservation, multi-digit fret synchronization, internal measures, compact cell states, and descriptive output.

Not yet claimed:

- `npm ci`;
- React Testing Library suite;
- production build;
- GitHub Pages publication;
- real Mac VoiceOver acceptance by Jason;
- regression acceptance on John's iPhone.

The manual `workflow_dispatch` verification workflow remains available for one intentional zero-dollar checkpoint. It was not triggered as an exploratory loop.

## Acceptance questions

Desktop acceptance should determine:

1. whether Jason recognizes the modernized desktop table as Guitar Eyes rather than a replacement project;
2. whether standard VoiceOver table navigation is more coherent than the intercepted raw-cell system;
3. whether position descriptions preserve the musical relationships he intended;
4. whether the keyboard navigator is efficient on his Mac;
5. whether guitar and bass files load as expected;
6. whether any part of the former multi-column workflow carried useful cognition that should be reintroduced semantically rather than as raw columns.

Phone acceptance should confirm that the previously accepted upload, focus recovery, description, and control behavior remain intact after the parser became shared.

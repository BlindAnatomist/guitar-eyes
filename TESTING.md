# Tablature integrity and accessibility checks

## Supported input

Choose Guitar (six rows per block) or Bass (four rows per block) before uploading a text file. Changing instrument clears the old tablature; upload again for the new instrument.

- Use plain-text tablature rows, optionally labelled with a note name, starting with a bar, dash, or colon after the label. Remove titles and prose.
- Rows within one block must have equal source-text width. Preserve spaces for alignment; tabs and control characters are rejected.
- Separate complete blocks with blank lines, or put complete blocks directly after one another. A partial block is an error, including when the file ends with a newline.
- Each uninterrupted run of one or two digits is one fret. Values are preserved verbatim, including 23 and 24. Runs of three or more digits are ambiguous and are rejected; distinct notes must be explicitly separated.
- Empty files and malformed blocks produce a visible alert. The app does not pad missing strings, change frets, or silently discard partial blocks.

Each note token stores its original start and end text columns. Two-digit frets occupy a single cell spanning two source columns. Vertical movement targets the same original column on another string; horizontal movement skips the continuation of a fret. Multi-column groups extend their right boundary when needed to avoid cutting any note on any string. The chosen width is therefore a minimum target, not permission to split a fret.

Speech traverses original columns and identifies each string. A two-digit fret is spoken once at its start column; its continuation is not a second note or an invented rest. Enter restarts reading. Escape, changing groups, moving focus out of the grid, and leaving the grid cancel the current reading.

## Automated commands

Dependency-free model/parser/speech regressions (tested with Node 24):

    npm run test:tablature

Existing React test suite, after installing the locked dependencies:

    CI=true npm test -- --watchAll=false --runInBand

Production build:

    npm run build

`src/App.test.js` covers actual component rendering, labelled controls, file errors and upload races, guitar/bass row counts, source-span cells, keyboard navigation, group changes, width changes, Tab escape, and mocked speech lifecycle. `tests/tablature.test.mjs` exercises pure parser/model/speech functions, including the three original integrity failures. Speech mocks establish sequencing and values, not audible output or screen-reader compatibility.

## Manual browser and assistive-technology acceptance

Use the local app, never a deployment as an implicit part of this checklist.

1. Upload the six-row fixture below. Confirm that 12 is one cell and column alignment does not shift on the B string.
2. Enable Multi-Column Navigation and choose width 5. Confirm the first group includes the whole 12; the second group begins at source column 7.
3. Use Control+Option+arrows to enter and traverse the grid. Check vertical movement into and out of a two-digit fret and wrapping on the short final group.
4. Use Control+Command+Shift+Left/Right to change groups, and the same modifiers with minus/equals to change width. Focus must remain on a visible cell.
5. Press Enter and verify that fret 12 is read once. Press Enter again, then Escape. Reading must not resume from a stale callback.
6. Use Tab and Shift+Tab between multiple grids and back to the controls. Keyboard focus must not be trapped.
7. Import frets 23 and 24, a complete bass block, and then an incomplete or misaligned file. Check exact values, four-string display, and announced errors.
8. Repeat with VoiceOver on the intended device/browser. Record device, OS, browser, navigation settings, and actual spoken output separately from automated test results.

Fixture:

    e|----3-|
    B|--12--|
    G|------|
    D|------|
    A|------|
    E|------|

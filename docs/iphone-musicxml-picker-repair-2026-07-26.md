# iPhone MusicXML Picker Failure and Repair

Date: July 26-27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Failed hosted candidate: `8fd5a5133269d6a277c5d9f9dd916aa5f8dd96d0`

Exact repaired and verified source: `9f171e6c00c1a8265e66f35d55fa0c9aea7f7fc7`

Status: source, automated, build, and compiled repair gates passed; repaired publication and real-iPhone retry remain open

## Owner observation

On the real iPhone, the downloaded `.musicxml` file appeared in the Files picker but was dimmed and could not be selected. Other previously supported files remained selectable.

This observation occurred before the application received a file. Therefore MusicXML parsing, validation, status, focus recovery, and reader behavior were never reached.

## Failure cause

`src/Upload.js` still supplied a browser-level `accept` attribute listing file extensions and MIME types.

Although `.musicxml`, `.xml`, `application/xml`, and `text/xml` appeared in that list, iOS Files used its own type classification and treated the selected MusicXML file as outside the accepted set. The native picker disabled the file before Guitar Eyes could inspect it.

The prior automated tests simulated a file after selection. They proved the application could import a supplied MusicXML `File`, but they did not verify whether the browser input configuration allowed the native iPhone Files picker to select that file.

This was an incomplete acceptance boundary and should have been caught before owner handoff.

## Proven repair

The browser-level `accept` attribute was removed entirely.

The file input now permits the native picker to offer any selectable document. Guitar Eyes performs format detection and validation after selection, using its existing explicit outcomes for:

1. supported ASCII;
2. supported uncompressed MusicXML;
3. recognized but unsupported compressed MusicXML and binary formats;
4. unsupported string-count families;
5. unsafe or unknown material.

A help description is associated with the file input and states that Guitar Eyes checks the selected file after selection.

## Regression tests

`src/Upload.test.js` now requires:

1. a file input with no `accept` attribute;
2. the associated post-selection validation description;
3. a `.musicxml` `File` being passed to the existing application validation path.

The complete repaired checkpoint passed:

1. exact-source and MusicXML ancestry checks;
2. explicit source assertion that `src/Upload.js` contains no `accept=` attribute;
3. 20 of 20 automated suites;
4. 117 of 117 automated tests;
5. production build;
6. compiled presence of the post-selection validation description;
7. compiled absence of the former extension-list filter;
8. continued MusicXML and compressed-MusicXML outcome strings;
9. current MusicXML checkpoint build identity.

Passing run: `30230707944`

The initial repair run `30230621621` was not blindly rerun. Its only failure was an obsolete build-identity test still expecting the earlier convergence title. The new picker-specific tests passed in that run. The stale identity assertion was corrected to the already-published MusicXML checkpoint identity before the successful complete gate.

## Mandatory derived standard

For every newly supported upload format:

1. test the parser with a supplied `File`;
2. inspect the actual file input restrictions;
3. ensure the native picker is not filtering the format before application code runs;
4. keep format validation inside the application unless a browser-level filter has been proven on the real target device;
5. require a real-device selection test before asking the owner to test downstream parsing or reader behavior.

A parser that can read a file is not usable support if the native picker prevents the file from reaching the parser.

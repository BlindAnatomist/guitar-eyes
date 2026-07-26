# Convergence Recovery Source Checkpoint

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/convergence-from-accepted-semantic-core`

Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Implementation source before this record: `b8da38496b24dec51bfcfddc143a3dc8e369a60c`

Status: source reconstruction complete; locked installation, complete tests, production build, hosted publication, and real-iPhone acceptance remain open

## Authority preflight

The recovery branch was created directly from the accepted rhythm-and-measure source. A commit comparison reports it ahead of that source with zero commits behind and the same merge base.

The failed convergence branch remains preserved as evidence. It is not a source of implementation or acceptance authority.

Fork `main` remains reserved as the clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`. No pull request or merge is authorized. Jason Washburn is not assumed to participate in testing.

## Accepted engine preserved

The following accepted implementation files were not changed by the recovery work:

1. `src/iphoneTabModel.js`;
2. `src/asciiRhythm.js`;
3. `src/measureModel.js`;
4. `src/tabImportCoordinator.js`;
5. `src/positionDescription.js`;
6. `src/IPhoneTabReader.js`;
7. inherited parser, rhythm, measure, import, speech, and iPhone acceptance tests.

The recovery therefore retains:

- automatic guitar and bass detection;
- durable iPhone Files-picker focus recovery after success and failure;
- quiet position and block movement;
- Previous position, Read current position, Next position order;
- dedicated Read current speech;
- omission of ordinary unplayed strings from playing instructions;
- speech for open strings, frets, techniques, explicit mute notation, and supported duration;
- W, H, Q, E, and S duration mapping;
- strict aligned-barline measure recognition;
- measure and position-within-measure speech.

## Desktop convergence implementation

### Shared semantic desktop reader

`src/DesktopSemanticReader.js` now consumes the exact accepted semantic document.

It provides:

1. strings as table rows;
2. synchronized musical positions as columns;
3. measure and duration context in column headings;
4. quiet Previous and Next controls;
5. quiet tablature-block jumps;
6. Read current position as the only full-content announcement;
7. a plain-key position navigator using Left Arrow, Right Arrow, Home, End, and Enter;
8. no interception of VoiceOver modifier commands;
9. a named horizontally scrollable semantic-table region;
10. original spatial source rows in a collapsed disclosure;
11. meaningful desktop result-heading focus after a successful upload.

The spatial table may display `Not played` in inactive cells for structural exploration. The dedicated playing instruction continues to omit ordinary inactive strings.

### Compatibility fallback

`src/LegacyDesktopReader.js` isolates the original raw grid for material that cannot be interpreted safely by the semantic engine.

`src/DataGrid.js` was repaired so the fallback:

1. no longer intercepts Control+Option arrows;
2. uses plain arrows only while the grid is focused;
3. keeps raw cells out of the ordinary Tab sequence;
4. removes the document-level Escape-listener leak;
5. retains explicit multi-column group controls and speech;
6. remains clearly labeled as a compatibility path rather than a second musical authority.

### Application shell

`src/App.js` now:

1. parses supported files once through the accepted import coordinator;
2. stores one semantic document for both interfaces;
3. mounts only the active interface;
4. routes supported files to the semantic desktop reader;
5. routes unsafe semantic material to the compatibility grid only in desktop mode;
6. preserves the accepted iPhone success-and-error focus recovery mechanism;
7. preserves automatic instrument correction;
8. preserves the accepted iPhone reader without modification.

## Regression coverage added

New tests cover:

1. desktop use of accepted duration and measure metadata;
2. omission of ordinary unplayed strings from complete desktop playing speech;
3. quiet desktop movement and dedicated Read current speech;
4. exact Previous, Read current, Next order;
5. non-interception of VoiceOver modifier commands;
6. quiet desktop block jumps;
7. preservation of original spatial source rows;
8. one parsed document surviving interface changes;
9. unchanged accepted iPhone duration, open-string, and compact-speech behavior after an interface change;
10. desktop result-heading focus;
11. compatibility-grid raw cells excluded from the Tab sequence;
12. compatibility-grid Control+Option commands left to VoiceOver;
13. deterministic static build identity before the React root.

Inherited tests were retained rather than replaced.

## Static verification completed in Chat

The changed JavaScript and JSX source and test files were parsed and transpiled successfully with the available TypeScript compiler.

This static evidence does not replace:

1. locked dependency installation;
2. the complete React test suite;
3. production build;
4. compiled-artifact inspection;
5. hosted preview publication and read-back;
6. real-iPhone Safari and VoiceOver acceptance.

## Build identity

The candidate static HTML now uses:

- page title: `Test build Convergence recovery checkpoint 1`;
- first heading: `Test build: Convergence recovery checkpoint 1.`

A test asserts that this unique heading occurs once and precedes the React root.

The currently hosted stable Pages address still serves the invalidated convergence preview until a corrected candidate is deliberately verified and published. Do not continue iPhone acceptance against the current hosted build.

## Next gate

Before asking the owner to test:

1. confirm the recovery branch remains a direct descendant of the accepted source with zero commits behind;
2. run locked installation once in an authenticated execution environment;
3. run the complete inherited and new test suite once;
4. run the production build;
5. inspect failures before making changes or rerunning anything;
6. verify the compiled artifact contains the accepted rhythm, measure, compact-speech, control-order, and recovery-build identity contracts;
7. publish one bounded preview through the proven temporary-main procedure;
8. restore and independently compare fork `main`;
9. hand off one bounded iPhone regression in Chat.

No playback, teacher mode, pattern analysis, bookmarks, AI work, pull request, merge, or upstream change is authorized.

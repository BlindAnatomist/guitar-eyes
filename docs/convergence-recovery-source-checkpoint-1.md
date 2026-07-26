# Convergence Recovery Source Checkpoint 1

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/convergence-from-accepted-semantic-core`

Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Implementation source before this final record: `f7b743e7e1033b498a6d1fb82d9e81ecd3c4584c`

Status: source implementation complete and statically verified; dependency installation, automated execution, production build, hosted publication, and real-device regression remain unverified

## Why this checkpoint exists

The previous convergence candidate was built from a diverged source line that was 120 commits behind the accepted rhythm-and-measure foundation. This recovery begins directly from the accepted foundation and treats every previously accepted iPhone, speech, rhythm, measure, import, and focus behavior as a regression requirement.

## Preserved accepted behavior

No source changes were made to:

1. `src/IPhoneTabReader.js`;
2. `src/positionDescription.js`;
3. `src/iphoneTabModel.js`;
4. `src/asciiRhythm.js`;
5. `src/measureModel.js`;
6. `src/tabImportCoordinator.js`;
7. `src/tabFormatDetector.js`;
8. inherited parser, rhythm, measure, import, playing-description, and iPhone tests.

The inherited contracts continue to require:

1. Previous position, Read current position, Next position in the accepted order;
2. quiet Previous and Next movement;
3. quiet tablature-block movement;
4. Read current position as the only semantic-reader action that writes the complete playing instruction to the live region;
5. omission of ordinary unplayed strings from spoken playing instructions;
6. continued speech for open strings, frets, explicit mute notation, techniques, and supported duration;
7. W, H, Q, E, and S duration mapping and speech;
8. explicit aligned-measure recognition;
9. measure and position-within-measure speech;
10. automatic guitar and bass detection;
11. successful and failed native iOS Files-picker focus recovery.

## Desktop convergence implementation

Supported semantic files now use `DesktopSemanticReader`, which consumes the same accepted semantic document as the iPhone reader.

The desktop reader provides:

1. strings as table rows;
2. synchronized musical positions as table columns;
3. duration in column headings when available;
4. measure and position context;
5. Previous position, Read current position, Next position in the same order as iPhone;
6. quiet movement and Read current position as the sole complete content-speech action;
7. quiet Previous and Next tablature-block controls for multi-block files;
8. a plain-key keyboard navigator using Left Arrow, Right Arrow, Home, and End for movement only;
9. no interception of VoiceOver Control+Option commands;
10. a collapsed Original spatial source layout disclosure for each block;
11. a named horizontally scrollable semantic-table region;
12. a highlighted current-position column;
13. a nonduplicated position-count summary;
14. desktop upload focus on the semantic reader heading.

Document-global positions are used when building every block table. This prevents block-local indexes from being mistaken for global indexes when the reader moves into block two or later.

The spatial table may expose `Not played` in inactive cells because absence is structurally meaningful in a string-by-position grid. The dedicated playing instruction continues to omit ordinary inactive strings.

## Compatibility fallback

Files that the semantic model cannot represent safely still use the original grid through `LegacyDesktopReader`.

The fallback now:

1. is explicitly labeled as a compatibility path;
2. keeps raw cells out of the ordinary Tab sequence;
3. leaves VoiceOver Control+Option commands untouched;
4. offers optional plain-arrow movement after the grid itself is focused;
5. retains multi-column grouping and an explicit legacy group-speech action;
6. removes the previous document-level Escape-listener leak;
7. no longer traps Tab between raw grid wrappers;
8. memoizes derived grid data so the effect dependency remains stable under Create React App linting.

The compatibility fallback is not the primary reader for supported semantic files and is not a second musical authority.

## Application shell

`src/App.js` now:

1. parses supported files once through the accepted import coordinator;
2. stores one semantic document for both interfaces;
3. mounts only the active interface;
4. routes supported files to the semantic desktop reader;
5. routes unsafe semantic material to the compatibility grid only in desktop mode;
6. preserves the accepted iPhone success-and-error focus mechanism;
7. preserves automatic instrument correction;
8. switches interfaces without reparsing or replacing the musical document.

## Regression coverage authored

New tests cover:

1. accepted duration and measure data reaching the desktop reader;
2. switching between desktop and iPhone without reparsing or weakening speech;
3. exact inherited iPhone markup and exact iPhone and desktop control order;
4. absence of ordinary `silent` speech in complete playing descriptions;
5. quiet desktop position movement;
6. Read current position as the only semantic desktop content-speech action;
7. desktop block jumps using document-global indexes;
8. preservation of original source rows on demand;
9. non-interception of VoiceOver modifier commands;
10. raw compatibility cells remaining outside the Tab sequence;
11. plain-arrow fallback navigation;
12. desktop result-heading focus;
13. deterministic static build identity before the React root.

The inherited suite was retained rather than replaced.

## Static verification completed

The changed JavaScript and JSX files and the new test files were parsed and transpiled successfully with the TypeScript compiler available in the Chat execution container.

The reviewed set included:

- `src/App.js`;
- `src/DesktopSemanticReader.js`;
- `src/LegacyDesktopReader.js`;
- `src/DataGrid.js`;
- `src/InfoSection.js`;
- `src/App.css`;
- `src/App.convergence.test.js`;
- `src/DesktopSemanticReader.test.js`;
- `src/DataGrid.test.js`;
- `src/buildIdentity.test.js`;
- inherited iPhone and position-description tests.

This was a syntax and static state-flow gate. The environment does not contain a runnable checkout with locked project dependencies and cannot reach the npm registry, so no React test or production-build result is claimed.

## Build identity

The candidate static HTML uses:

- page title: `Test build Convergence recovery checkpoint 1`;
- first heading: `Test build: Convergence recovery checkpoint 1.`

`src/buildIdentity.test.js` asserts that the unique heading occurs once and precedes the React root.

The stable Pages address still serves the invalidated convergence preview until a corrected candidate is deliberately verified and published. Do not continue iPhone acceptance against the current hosted build.

## Evidence boundary

This checkpoint does not claim:

- `npm ci` success;
- automated test success;
- production build success;
- browser execution success;
- hosted publication;
- iPhone acceptance of the recovery candidate;
- Mac owner acceptance.

## Next bounded gate

Before any publication:

1. obtain the exact final branch head;
2. compare it against the accepted foundation and require zero commits behind;
3. run locked dependency installation once in an authenticated execution environment;
4. run the complete inherited and new automated suite once;
5. run the production build once;
6. inspect any exact failure before changing source or rerunning;
7. verify compiled artifacts contain accepted duration, measure, quiet-navigation, compact-speech, control-order, and build-identity material;
8. publish only after all preceding gates pass;
9. restore fork `main` exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` after the temporary publication procedure;
10. ask John for one bounded iPhone regression only after a corrected preview is stable;
11. defer Jason's desktop acceptance unless he agrees to participate.

## Repository authority

- `Phlypper/guitar-eyes` remains untouched.
- Fork `main` must remain identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- No pull request or merge is authorized.
- No paid GitHub usage or overage is authorized.

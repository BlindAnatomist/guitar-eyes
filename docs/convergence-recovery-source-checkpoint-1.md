# Convergence Recovery Source Checkpoint 1

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/convergence-from-accepted-semantic-core`

Accepted foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Source checkpoint before this record: `cdb74b074caa76b0c44707c4e534db0b39754b82`

Status: source implementation complete and reviewed; dependency installation, automated execution, production build, hosted publication, and real-device regression remain unverified

## Why this checkpoint exists

The previous convergence candidate was built from a diverged source line that was 120 commits behind the accepted rhythm-and-measure foundation. This recovery begins directly from the accepted foundation and treats every previously accepted iPhone, speech, rhythm, measure, import, and focus behavior as a regression requirement.

## Preserved accepted behavior

No source changes were made to the accepted iPhone reader, position-description layer, semantic parser, rhythm mapper, measure model, format detector, import coordinator, or Files-picker focus-recovery algorithm.

The inherited tests continue to protect:

1. Previous position, Read current position, Next position in the accepted order;
2. quiet Previous and Next movement;
3. quiet tablature-block movement;
4. Read current position as the only control that writes the complete playing instruction to the live region;
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
6. quiet movement and explicit read speech;
7. Previous and Next tablature-block controls for multi-block files;
8. a plain-key keyboard navigator using Left Arrow, Right Arrow, Home, End, and Enter;
9. no interception of VoiceOver Control+Option commands;
10. a collapsed Original spatial source layout disclosure for each block;
11. a named horizontally scrollable semantic table region;
12. a highlighted current-position column.

Document-level positions are used when building every block table. This prevents block-local indexes from being mistaken for global indexes when the reader moves into block two or later.

## Compatibility fallback

Files that the semantic model cannot represent safely still use the original grid through `LegacyDesktopReader`.

The fallback now:

1. is explicitly labeled as a compatibility path;
2. keeps raw cells out of the ordinary Tab sequence;
3. leaves VoiceOver Control+Option commands untouched;
4. offers optional plain-arrow movement after the grid itself is focused;
5. retains the existing multi-column group controls and explicit speech action.

The compatibility fallback is not the primary reader for supported semantic files.

## New regression coverage authored

New tests cover:

1. accepted duration and measure data reaching the desktop reader;
2. switching between desktop and iPhone without reparsing or weakening speech;
3. exact iPhone control order after interface switching;
4. absence of ordinary `silent` speech in the iPhone reader;
5. quiet desktop position movement;
6. explicit desktop Read current speech;
7. desktop block jumps using document-global indexes;
8. preservation of original source rows on demand;
9. non-interception of VoiceOver modifier commands;
10. raw compatibility cells remaining outside the Tab sequence;
11. plain-arrow fallback navigation.

These tests have been authored and source-reviewed but have not yet been executed in an environment with installed project dependencies.

## Static source review completed

The following were reviewed together for state flow, imports, indexes, focus targets, labels, and accessibility relationships:

- `src/App.js`
- `src/DesktopSemanticReader.js`
- `src/LegacyDesktopReader.js`
- `src/DataGrid.js`
- `src/InfoSection.js`
- `src/App.css`
- `src/App.convergence.test.js`
- `src/DesktopSemanticReader.test.js`
- `src/DataGrid.test.js`
- inherited iPhone and position-description tests

The static build identity is now:

`Test build: Convergence recovery checkpoint 1.`

This identity exists in the document title and as the first heading before the React root.

## Evidence boundary

This checkpoint does not claim:

- `npm ci` success;
- automated test success;
- production build success;
- browser execution success;
- hosted publication;
- iPhone acceptance;
- Mac acceptance.

The chat runtime cannot reach GitHub or npm directly, so it cannot execute the repository. No substitute or fabricated local result is recorded.

## Next bounded gate

Before any publication:

1. obtain the exact final branch head;
2. run locked dependency installation once in an authenticated execution environment;
3. run the complete inherited and new automated test suite once;
4. run the production build once;
5. inspect any exact failure before changing source or rerunning;
6. verify compiled artifacts contain the accepted duration, measure, quiet-navigation, and build-identity strings;
7. publish only after all preceding gates pass;
8. restore fork `main` exactly to `60c2e5de0887b1bcdd426d932632946edd07d3c3` after any temporary publication procedure;
9. ask John for one bounded iPhone regression only after a corrected preview is stable;
10. defer Jason's desktop acceptance unless he agrees to participate.

## Repository authority

- `Phlypper/guitar-eyes` remains untouched.
- Fork `main` must remain identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- No pull request or merge is authorized.
- No paid GitHub usage or overage is authorized.

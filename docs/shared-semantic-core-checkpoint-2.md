# Shared Semantic Core Checkpoint 2

Date: July 25, 2026

Branch: `work/shared-semantic-core`

Base checkpoint: `docs/shared-semantic-core-checkpoint-1.md`

## Objective

Replace the two largest remaining legacy-only paths with shared semantic documents:

1. four-string bass;
2. multiple tablature blocks.

Preserve Jason Washburn's desktop interface and require no desktop or laptop testing from John Darrin Washburn.

## Implemented result

1. The semantic model now has explicit guitar and bass instrument configurations.
2. Clean four-string bass tab is parsed into the same document contract used for guitar.
3. Multiple complete guitar or bass blocks are located and retained as distinct semantic blocks.
4. Non-tablature headings between complete blocks are ignored with an explicit parsing note rather than entering Jason's desktop grid.
5. String identifiers are unique across blocks.
6. Document positions retain both overall position order and position-within-block information.
7. The desktop adapter projects semantic guitar and bass blocks into Jason's existing block-and-string input shape.
8. The import coordinator now attempts the shared semantic path for both instruments and multiple blocks.
9. The legacy desktop parser remains only as a safety fallback when semantic parsing rejects incomplete or unsafe input.
10. The iPhone reader now announces block context and provides Previous tablature block and Next tablature block controls when more than one block exists.
11. Existing Previous position, Next position, and Read current position controls remain.
12. Block controls use the same touch-sized, single-column mobile treatment as the position controls.

## Desktop preservation strategy

John does not use a desktop or laptop and is not assigned desktop acceptance testing.

Desktop preservation is protected through automated contracts that verify:

1. one semantic guitar block projects into the exact six-row shape Jason's grid expects;
2. multiple semantic guitar blocks remain separate and exclude headings;
3. semantic bass projects into the exact four-row shape Jason's grid expects;
4. malformed semantic input still reaches the legacy desktop fallback;
5. Jason's `DataGrid`, keyboard commands, grouped navigation, and speech implementation were not redesigned in this checkpoint.

A real desktop test by Jason or another desktop screen-reader user is deferred until a later integration checkpoint. It is not a prerequisite for John's iPhone acceptance pass.

## Added fixtures

1. `fixtures/shared-core-four-string-bass.txt`
2. `fixtures/shared-core-two-block-guitar.txt`
3. Matching public fixture copies for a future hosted acceptance preview.

## Added and updated test contracts

1. `src/semanticDocument.test.js`
   - bass parsing and speech;
   - multiple guitar blocks;
   - multiple bass blocks;
   - incomplete-block rejection.
2. `src/desktopSemanticAdapter.test.js`
   - one guitar block;
   - multiple guitar blocks without headings;
   - four-row bass projection.
3. `src/tabImportCoordinator.test.js`
   - semantic guitar routing;
   - semantic multi-block routing;
   - semantic bass routing;
   - legacy fallback for unsafe input.
4. `src/IPhoneTabReader.test.js`
   - existing position controls;
   - block jump controls and announcements.
5. `src/App.sharedCore.test.js`
   - complete bass upload through the iPhone workflow;
   - complete two-block guitar upload through the iPhone workflow.

## Verification performed without GitHub Actions

1. JavaScript syntax validation passed for the generalized semantic model and import coordinator.
2. JSX syntax validation passed for the block-aware iPhone reader.
3. Targeted executable contracts passed for:
   - one-block guitar parsing;
   - four-string bass parsing;
   - two-block guitar parsing;
   - block-aware descriptions;
   - semantic-to-desktop projection for guitar and bass;
   - legacy fallback for an incomplete block.
4. Repository comparison confirms the checkpoint is ahead of Shared Semantic Core Checkpoint 1 and is not behind it.
5. No GitHub Actions workflow was triggered.
6. No preview was deployed.
7. No pull request was opened.
8. Nothing was merged into fork `main` or the upstream repository.

## Verification still required

1. Full React automated test suite.
2. Production build.
3. Hosted iPhone preview.
4. John's Safari and VoiceOver acceptance pass using both new fixtures.

Because GitHub Actions usage is constrained, the full suite and hosted preview must be run as one intentional verification event rather than automatically on every repository commit.

## Required iPhone acceptance pass

John's testing is limited to the iPhone and must verify only the following:

### Bass fixture

1. Select Bass, four strings.
2. Upload `shared-core-four-string-bass.txt`.
3. Confirm focus returns to the iPhone tablature reader heading.
4. Confirm VoiceOver describes E, A, D, and G string activity as synchronized positions.
5. Confirm position controls work.
6. Confirm block controls are absent because the document contains one block.

### Two-block guitar fixture

1. Select Guitar, six strings.
2. Upload `shared-core-two-block-guitar.txt`.
3. Confirm focus returns to the iPhone tablature reader heading.
4. Confirm the reader announces Block 1 of 2.
5. Confirm Next tablature block moves directly to Block 2 of 2.
6. Confirm Previous tablature block returns to Block 1 of 2.
7. Confirm Previous position, Next position, and Read current position still work inside and across blocks.

## Current verdict

Implementation boundary: complete.

Targeted semantic and desktop-projection verification: pass.

Full automated, build, hosted, and real-iPhone acceptance: pending.

## Next authorization after acceptance

After this checkpoint passes the full suite and John's iPhone test, the next parser phase should address rhythm, measure boundaries, and broader real-world tab normalization. It should not create another interface-specific parser.

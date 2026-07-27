# MusicXML Intake Checkpoint 2 Publication and Hosted Read-Back

Date: July 26-27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Verified implementation source: `715547a123b2a6e862a8020858df96cb34c63526`

Published source with corrected static preview identity: `8fd5a5133269d6a277c5d9f9dd916aa5f8dd96d0`

Temporary main trigger commit: `9ccb2c8863b28e84c6f51a3fcd5c2c278a6c4876`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

Status: publication and hosted read-back passed; real-iPhone MusicXML acceptance remains open

## Source identity

The published source differs from the 19-suite, 115-test implementation source only in `public/index.html`:

1. the browser title identifies MusicXML intake checkpoint 2;
2. the metadata description identifies MusicXML intake;
3. the static first heading identifies MusicXML intake checkpoint 2.

No importer, parser, reader, focus, or test source changed after the complete passing test run.

## Publication procedure

A temporary workflow-only commit was placed on clean fork `main`. The workflow explicitly checked out published source `8fd5a5133269d6a277c5d9f9dd916aa5f8dd96d0`, proved ancestry from verified implementation source `715547a123b2a6e862a8020858df96cb34c63526`, installed locked dependencies, built for `/guitar-eyes`, verified the Pages artifact, deployed through the authorized `github-pages` environment, and performed a separate live read-back.

The workflow did not rerun the 115-test suite because that exact implementation had already passed the complete authenticated gate.

## Workflow evidence

Run: `30229933051`

Jobs:

1. build job `89866748247`: passed;
2. deployment job `89866836035`: passed;
3. live read-back job `89866858944`: passed;
4. failure-report job `89866871524`: skipped as expected.

## Hosted read-back evidence

The live verifier confirmed:

1. HTML returned HTTP 200;
2. the exact MusicXML browser title was present;
3. the exact MusicXML static heading was present;
4. every referenced Guitar Eyes Pages asset returned HTTP 200;
5. exactly one primary `main.*.js` bundle was referenced;
6. the live bundle contained MusicXML checkpoint identity;
7. the live bundle contained the MusicXML import-status construction;
8. the live bundle contained the normalized MusicXML spatial-layout label;
9. the live bundle contained the no-tab-coordinates error;
10. the live bundle contained the compressed-MusicXML unsupported message;
11. the live bundle contained Previous position, Read current position, and Next position;
12. the live bundle contained both desktop and iPhone reader identities;
13. the live bundle contained rest speech.

Commit status context `guitar-eyes/musicxml-readback` reported success and points to run `30229933051`.

## Main restoration

After hosted read-back passed, fork `main` was restored by ref to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

`Phlypper/guitar-eyes` remained untouched. No pull request or merge was created.

## Next gate

John performs one bounded real-iPhone Safari and VoiceOver test using the project-authored uncompressed MusicXML fixtures.

The first test must confirm:

1. native Files-picker return focus;
2. successful MusicXML import status;
3. Previous and Next remain quiet movement controls;
4. Read current announces measure, position, duration, and playing instruction;
5. the MusicXML low-E fret mapping is correct;
6. chords are spoken as simultaneous played strings at one position;
7. timed rests are announced as rests;
8. compressed `.mxl` remains honestly unsupported.

Do not begin another format importer or downstream feature before this real-device gate is recorded.

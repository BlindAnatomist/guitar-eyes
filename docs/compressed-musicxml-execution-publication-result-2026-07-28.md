# Compressed MusicXML Execution and Publication Result

Repository: `BlindAnatomist/guitar-eyes`

Date: July 28, 2026

Status: automated and hosted gates passed; real-iPhone VoiceOver acceptance remains open

## Repository authority

- Active implementation branch: `work/tablature-intake-expansion`.
- Exact verified and published application source: `b840dc8ba63948ed75d1e982352002f96c694486`.
- Accepted application foundation preserved beneath this checkpoint: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- `Phlypper/guitar-eyes` remained untouched.
- No pull request or merge was created.

## Source repairs discovered by the execution gate

The first authenticated exact-source run was workflow run `30405673780`.

Locked installation passed. The complete test suite then exposed two bounded defects:

1. `src/compressedMusicXmlImporter.test.js` assumed browser `TextEncoder` support inside Jest. Production extraction was not implicated. The regression now uses Node's standard `TextEncoder` and `TextDecoder` in the test environment.
2. `src/buildIdentity.test.js` still expected the older Guitar Pro 3D identity while the accepted static checkpoint page already used the later 3F identity. The stale assertion was reconciled with the accepted page state.

Repair commits:

- `229dd002c83d2e23b87986e51ce43aba992383f2` — provide Jest text codecs;
- `e89caec63390d638b7b2d63c5e74689b2694223e` — reconcile the stale identity assertion.

A second run, `30405944876`, proved all tests passed. Its build step failed only because GitHub Actions supplied `CI=true`, causing Create React App to promote an existing ESLint warning to a build failure. The authorized command was ordinary `npm run build`, which does not set that environment variable. Later build gates therefore used `CI=false npm run build`, preserved the warning in the log, and did not disable ESLint.

## Distinct preview identity

To prevent the real-iPhone checkpoint from being confused with the preceding Guitar Pro preview, the static hosted identity was changed to:

- title: `Test build Compressed MusicXML checkpoint 1`;
- first heading: `Test build: Compressed MusicXML checkpoint 1.`

Identity commits:

- `5f6c9394759b9c9a5f17e11e800dc6717c6c9e0d`;
- `068118573881fa6849e1dbf8ea9522342ec7ae64`;
- `b840dc8ba63948ed75d1e982352002f96c694486`.

The visible static checkpoint identity is separate from the accepted reader interfaces and does not change semantic tablature behavior.

## Final exact-source execution gate

Workflow run: `30406297541`

Job: `90432373598`

Exact source: `b840dc8ba63948ed75d1e982352002f96c694486`

Result: passed.

Evidence:

1. exact source checkout passed;
2. accepted-source ancestry passed;
3. locked dependency installation passed;
4. test suites: 32 passed, 32 total;
5. tests: 188 passed, 188 total;
6. production build passed;
7. compressed MusicXML title and heading checks passed;
8. compiled `.mxl` extraction and reader-contract checks passed;
9. tracked repository cleanliness passed.

Unhosted build evidence:

- primary JavaScript: `build/static/js/main.1144d504.js`;
- `build/index.html` SHA-256: `951414533cefc2d9182321e01b9a0d10f70c71c487f529049c6fb8ff2822f3dd`;
- primary JavaScript SHA-256: `17c37499aae0d047e340168c086bce2009f99f36202070f7526fa738a205ab91`.

## Pages publication and hosted read-back

Temporary publisher commit: `53f8a8a0073aa784e997e6a87238654308439584`

Workflow run: `30406431670`

Job: `90432795272`

Preview:

`https://blindanatomist.github.io/guitar-eyes/`

Result: passed.

The publisher:

1. explicitly checked out exact source `b840dc8ba63948ed75d1e982352002f96c694486`;
2. proved accepted-source ancestry;
3. installed locked dependencies;
4. built with `PUBLIC_URL=/guitar-eyes`;
5. verified the compressed MusicXML checkpoint identity;
6. verified repository-scoped asset paths;
7. verified compiled compressed-MusicXML and accepted reader contracts;
8. uploaded and deployed the Pages artifact through the authorized `main` context;
9. read back the hosted HTML and every referenced repository asset;
10. verified the live primary JavaScript rather than relying only on deployment success.

Hosted evidence:

- HTML status: 200;
- hosted HTML SHA-256: `48d3db24e4aa696751759ec325f78fab08ed06c1cb5f2ec0dddfe8b67099ef21`;
- primary JavaScript: `/guitar-eyes/static/js/main.3157e076.js`;
- hosted primary JavaScript SHA-256: `7ce1b9e1713d076fd906275d3b2f864f3ee33f0b8a27f1e7e37e3f7baf95d339`;
- hosted CSS: `/guitar-eyes/static/css/main.43c0fc34.css`;
- all referenced assets returned HTTP 200;
- hosted compressed-MusicXML and reader-contract checks passed.

## Final restoration

Immediately after successful hosted read-back, fork `main` was force-restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison established:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

The temporary publisher commit is not retained on `main`.

## Controlled real-iPhone specimen

A project-authored test file was generated for the owner in Chat:

`guitar-eyes-compressed-musicxml-checkpoint-1.mxl`

It is a standard compressed MusicXML container containing:

1. one six-string guitar part;
2. one measure;
3. four synchronized positions;
4. quarter, eighth, eighth, and half-note durations;
5. low-E fret 3;
6. open A string;
7. A-string fret 2;
8. open D string.

## Next human gate

Run one bounded iPhone Safari and VoiceOver checkpoint:

1. open the stable preview;
2. confirm the first heading identifies `Compressed MusicXML checkpoint 1`;
3. upload `guitar-eyes-compressed-musicxml-checkpoint-1.mxl`;
4. confirm focus returns to `iPhone tablature reader` rather than Safari Page Menu;
5. confirm the status reports imported compressed MusicXML and four synchronized positions;
6. confirm `Read current position` speaks the expected note and duration information;
7. confirm Previous and Next position remain movement controls and do not speak full playing instructions.

No playback, teacher mode, pattern analysis, bookmarks, AI work, PowerTab, TuxGuitar, TablEdit, pull request, merge, or upstream change is authorized by this result.

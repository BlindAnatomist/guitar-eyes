# Compressed MusicXML and Audition Convergence Checkpoint 1 Result

Repository: `BlindAnatomist/guitar-eyes`

Date: July 30, 2026

Status: source-verified, published, and awaiting bounded real-iPhone acceptance

## Repository authority

- Convergence branch: `work/mxl-audition-convergence`.
- Accepted audition ancestor preserved unchanged: `165e2ed5792811ebac9bf0488be93810bfa6246c`.
- Exact verified and published application source: `7c4ac3d20fbb1d1abc547d30039599804bfdbd7e`.
- Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Upstream `Phlypper/guitar-eyes` was not modified.
- No pull request or merge was created.

## Bounded convergence

The checkpoint adds the verified compressed MusicXML `.mxl` intake route to the accepted audition-enabled application rather than adding audition to the earlier intake-only branch.

The reader preserves these distinct groups and this VoiceOver order:

1. Position navigation:
   - Previous position;
   - Read current position;
   - Next position.
2. Position audio, immediately afterward:
   - Audition current position.

This structure preserves the stable Previous–Read–Next navigation sequence and leaves a deliberate future insertion point after Audition for measure or bar playback without rearranging navigation.

The audition mechanism preserves:

- explicit owner activation;
- a default two-second delay so VoiceOver can finish the control name;
- no automatic reader-position or focus movement;
- quiet Previous and Next behavior;
- stopping prior sound when navigation moves;
- Read current as the only full-position instruction action;
- explicit rest reporting when no pitched sound is played.

No measure playback, bar playback, full-document playback, teacher mode, looping, automatic progression, or new synthesis system was added.

## Verification

Exact gate run: `30591195588`.

- 39 of 39 test suites passed.
- 241 of 241 tests passed.
- Production build passed.
- Exact accepted-audition ancestry passed.
- Compiled compressed MusicXML contract passed.
- Compiled audition contract passed.
- Tracked repository cleanliness passed.
- Compiled primary JavaScript: `build/static/js/main.58b07f33.js`.
- Build `index.html` SHA-256: `8c644d588ccd2f1d15a3e73749719f0978431ca061c01b688fbe1461d8e1709a`.
- Build main JavaScript SHA-256: `63c64ba5466f63b7ee774968302642987a4612f7b587ffac81cc8cf3eb60b54c`.

## Publication

Exact publication run: `30591286746`.

Hosted address:

`https://blindanatomist.github.io/guitar-eyes/`

Hosted read-back established:

- HTTP 200 for the page;
- exact 1F HTML identity;
- exact primary JavaScript retrieval;
- all repository-scoped assets returned HTTP 200;
- hosted compressed MusicXML contract passed;
- hosted audition contract passed.

Hosted primary JavaScript: `/guitar-eyes/static/js/main.aaa16979.js`.

Hosted `index.html` SHA-256: `9bea1c33fe42b9f613d7eda4dac96ab0e67956abe8a57c8ed6eacfc8194363b8`.

Hosted main JavaScript SHA-256: `3037194ee476eef47cca3ed05fc5cc022ad9d6c19df7cb2ab524a8528585266c`.

After successful deployment and hosted read-back, fork `main` was immediately restored and independently verified identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Remaining acceptance boundary

The checkpoint is not yet real-iPhone accepted. The owner test must establish only:

1. the controlled `.mxl` file loads and focus returns to the iPhone tablature reader;
2. swipe order is Previous, Read current, Next, then Audition current;
3. Previous and Next remain quiet;
4. Read current remains the only action that speaks the full position instruction;
5. Audition begins after the selected two-second delay;
6. Audition does not move VoiceOver focus or reader position;
7. moving with Next stops the prior audition quietly.

A future Play current measure or Play current bar action remains deferred until this convergence checkpoint is accepted.
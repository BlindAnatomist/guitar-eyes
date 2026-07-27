# Known Problems and Proven Solutions: Guitar Pro Selection Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Date: July 27, 2026

This addendum must be read with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` before changing Guitar Pro intake, track selection, or VoiceOver reading order.

---

## GE-013 — Multi-track decoding can silently collapse to one track

State: `local-proven`

### Symptoms

A project-authored two-track Guitar Pro archive was reported as a single guitar result on one real-iPhone attempt. On a later upload, the same fixture exposed Proof Guitar and Proof Bass and allowed explicit bass selection.

### Evidence boundary

The report did not establish that the separate Guitar or Bass selector caused the different outcome. That selector is not an input to the Guitar Pro decoder.

### Failed-do-not-repeat approaches

1. Do not trust the decoder's returned track array without comparing it with structural evidence already available in the archive.
2. Do not auto-load a single returned guitar track when the archive declares multiple tracks.
3. Do not preselect the first supported track in the user interface.
4. Do not infer that an unrelated instrument selector filtered the archive.

### Proven solution

1. Read the declared track count from `Content/score.gpif` inside the shared archive.
2. Preserve that count in serializable archive-version evidence.
3. Compare the archive declaration with alphaTab's decoded track count.
4. Retry decoding once inside the existing lazy worker when the first result contradicts the archive.
5. Reject a persistent mismatch with `GUITAR_PRO_TRACK_COUNT_MISMATCH` rather than silently loading incomplete data.
6. Cross-check the accepted intermediate again before building inventory.
7. Begin a genuine multi-track selector with no radio option selected.
8. Keep `Load selected track` disabled until the owner explicitly chooses a track.
9. Reuse the accepted decoded intermediate after selection and do not run alphaTab a second time.

### Acceptance result

The complete automated and production-build gates passed, the exact hosted assets were read back, and real-iPhone VoiceOver acceptance established multi-track recognition, explicit Proof Guitar and Proof Bass choices, and successful Proof Bass loading.

### Derived standard

When the container format provides independent structural evidence, a decoder result that contradicts it is unsafe input, not a harmless simplification.

---

## GE-014 — Backward VoiceOver review skips the selected track description

State: `local-proven`

### Symptoms

After selecting Proof Bass and moving forward to `Load selected track` without activating it, a left swipe returned to general instructions about multiple choices instead of the bass description the owner wanted to review.

### Evidence boundary

This was a backward reading-order defect before activation. It was not an upload failure, loading failure, automatic activation problem, importer failure, or incorrect track selection.

### Failed-do-not-repeat approaches

1. Do not force focus merely because ordinary swipe order is unclear.
2. Do not add a live-region announcement that repeats the selection automatically.
3. Do not attach the full track description to the load button through `aria-describedby`.
4. Do not assume the radio label remains the immediately preceding VoiceOver item after the form introduces other content.

### Proven solution

1. Keep the radio options and explicit selection behavior unchanged.
2. Render one persistent plain-text selected-track summary after the radio group.
3. Place that summary immediately before `Load selected track` in document order.
4. When a track is selected, repeat its complete project-owned selection label in the summary.
5. Keep the summary non-live and do not move focus automatically.
6. Add a regression proving the summary is the load button's immediate previous element.

### Acceptance result

The complete inherited and new automated suite passed, the production build and exact hosted-asset read-back passed, and the owner completed the bounded real-iPhone test and reported:

> That worked

This establishes that the repaired backward-swipe path returned to the selected-track details in the tested sequence.

### Derived standard

When a user needs to review a choice before committing it, the confirmation details belong immediately adjacent to the commit action in ordinary reading order. Focus management is not a substitute for coherent document order.

---

## Evidence

- Accepted application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`.
- `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`.
- `docs/implementation-status.md`.

## Boundaries

These results apply only to the verified project-authored GP8-style shared-archive fixtures. They do not establish general GP7 support, GP3 through GP6 support, arbitrary Guitar Pro compatibility, rendering, playback, soundfonts, audio workers, or support for other deferred tablature formats.
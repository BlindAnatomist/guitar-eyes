# Known Problems and Proven Solutions: Guitar Pro Selection and Version Intake Addendum

Repository: `BlindAnatomist/guitar-eyes`

Status: active repository memory

Last reconciled: August 4, 2026

This addendum must be read with `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md` before changing Guitar Pro intake, version detection, track selection, or VoiceOver reading order.

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

1. Read declared track evidence from the source container when the format provides it.
2. Preserve that evidence in the serializable intermediate.
3. Compare source structural evidence with alphaTab's decoded track count.
4. Retry decoding once inside the existing lazy worker when the first result contradicts the source.
5. Reject a persistent mismatch with `GUITAR_PRO_TRACK_COUNT_MISMATCH` rather than silently loading incomplete data.
6. Cross-check the accepted intermediate again before building inventory.
7. Begin a genuine multi-track selector with no radio option selected.
8. Keep `Load selected track` disabled until the owner explicitly chooses a track.
9. Reuse the accepted decoded intermediate after selection and do not run alphaTab a second time.

### Acceptance result

The complete automated and production-build gates passed, the exact hosted assets were read back, and real-iPhone VoiceOver acceptance established multi-track recognition, explicit Proof Guitar and Proof Bass choices, and successful Proof Bass loading.

### Derived standard

When a source format provides independent structural evidence, a decoder result that contradicts it is unsafe input, not a harmless simplification.

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

### Derived standard

When a user needs to review a choice before committing it, the confirmation details belong immediately adjacent to the commit action in ordinary reading order. Focus management is not a substitute for coherent document order.

---

## GE-016 — Guitar Pro generation-specific routes can diverge semantically

State: `local-proven`

### Risk

Implementing GP3, GP4, GP5, GPX, and GP7 as unrelated readers or allowing alphaTab's generation-specific objects to escape the importer boundary can create multiple musical interpretations, inconsistent version announcements, and format-specific VoiceOver regressions.

### Failed-do-not-repeat approaches

1. Do not build a separate semantic reader for each Guitar Pro generation.
2. Do not infer a source version only from a file extension when internal evidence is available.
3. Do not claim GP7 support from a GP8-style project archive or claim legacy support from recognition alone.
4. Do not allow alphaTab renderer, notation, playback, soundfont, or worker machinery into the application architecture.
5. Do not use unlicensed or provenance-unknown third-party fixtures merely because they are convenient.
6. Do not accept semantic parity from one format and assume the other generations behave identically.

### Proven solution

1. Use lawful project-authored fixtures for GP3, GP4, GP5, GPX, and GP7 shared `.gp`.
2. Preserve generation method, external generator patch, audit evidence, SHA-256 hashes, and third-party notices.
3. Detect and validate source-version evidence before normalization.
4. Use alphaTab `1.8.4` lazily as a bounded low-level decoder only.
5. Transfer a serializable version-neutral intermediate across the importer boundary.
6. Normalize every supported generation into the same shared semantic tablature document.
7. Keep explicit track inventory and selection behavior generation-neutral.
8. Compare all five fixtures for the same six semantic positions, including string, fret, duration, rest, and version identity.
9. Run focused generation and parity suites, the complete inherited suite, production build, bundle-boundary inspection, hosted read-back, and real-iPhone VoiceOver acceptance.
10. State support as bounded to the verified corpus and profiles rather than arbitrary compatibility.

### Acceptance result

The clean convergence preserved the five lawful binaries and provenance, passed 10 focused suites and 53 focused tests, all 47 suites and 302 tests, production build, lazy-decoder and no-playback-asset boundaries, hosted read-back, and real-iPhone testing of all five versions and all six positions in each file.

### Derived standard

Different source generations may require different validation and decoding, but they must converge before application semantics. Generation-specific evidence belongs at the intake boundary; musical meaning belongs in the shared semantic document.

---

## Evidence

- Accepted earlier selection source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
- Clean convergence application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`.
- `docs/guitar-pro-real-iphone-checkpoint-3d-result-and-3e-repair.md`.
- `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`.
- `docs/real-world-guitar-pro-source-gate-final-result-2026-08-03.md`.
- `docs/real-world-guitar-pro-proof-5a-iphone-acceptance-2026-08-04.md`.
- `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`.
- `docs/accepted-format-intake-convergence-5b-real-iphone-acceptance-2026-08-04.md`.
- `docs/implementation-status.md`.

## Boundary

These results establish the accepted project-authored GP3, GP4, GP5, GPX, and GP7 corpus and profiles. They do not establish arbitrary Guitar Pro compatibility, rendering, playback, soundfonts, audio workers, or support for PowerTab, TuxGuitar, TablEdit, or another deferred format family.

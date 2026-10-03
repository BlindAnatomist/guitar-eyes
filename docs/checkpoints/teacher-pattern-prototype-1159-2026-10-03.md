# Bounded pattern-and-variation teacher prototype

This isolated prototype adds a relationship lesson over the shared canonical reader document. It recognizes an exact repeated explicit measure and a same-length measure with one changed final position, explains the shared opening and the two endings, and offers a rehearsal order with evidence controls into the existing reader.

The first source boundary is deliberately narrow: the original reviewed three-measure MusicXML example in `fixtures/teacher`, built in or uploaded with identical decoded text. Other files remain readable under existing import policy but do not receive teacher claims. IDs and source labels are not musical identity; comparison uses physical string/fret, simultaneous-note and rest grouping, validated ordinary duration, instrument and tuning. Unknown notation, technique/continuation, loss, rhythm or reference evidence fails closed. No absence-of-warning completeness inference is made.

The existing Read action remains the source of playing instructions; evidence movement is quiet, return restores the originating lesson control, and the session mark is independent. File/track replacement invalidates references, picker cancellation preserves the session, and reader-mode changes preserve the existing mark. There are no Played it/progress controls, playback, listening/grading, invented harmony/fingering, automatic phrases or AI.

The candidate identity is `Guitar Eyes teacher prototype 1` in the static title, first heading and App identity. This does not promote the accepted operational baseline, modify main/upstream, or broaden format support.

## Completed local proof

Frozen runtime: `c8376b990874eee60f31b5aaad47cd8b12ca3f19`.

- Candidate suite: 1,159 passing tests, same four intentional skips.
- Independent source restoration: 1,167 passing tests including eight additional probes, same four skips.
- Changed JavaScript/test-file lint: zero errors and warnings.
- Independently rebuilt optimized production output: all 30 files byte-identical.
- Existing minifiers run serially as a resource-only setting; production minimization, source maps and lint remain enabled.
- Production-asset JSDOM preflight: 49 checks passed, covering the new lesson and inherited importer/reader/mark behavior.

JSDOM and source review are not real-browser or VoiceOver acceptance. The separate one-shot Chromium workflow tests the exact already reviewed build archive. Its downloaded result is verified: [run 37154405896](https://github.com/BlindAnatomist/guitar-eyes/actions/runs/37154405896) passed all 16 checks across desktop and mobile-size views with zero browser console/network/runtime errors. The first workflow attempt failed before allocating any job because two runner-context expressions were at job-env scope; the minimal reviewed correction moved them to runner-time initialization. Application and archive bytes did not change. See the [technical result](../../technical-verification/teacher-chromium-smoke/RESULT.md).

## Bounded Chromium verification

The completed workflow was restricted to `work/teacher-chromium-smoke-2026-10-03`, an explicit head-commit intent marker and a first run attempt. It used one standard Ubuntu job, finite timeout and read-only repository permissions. It validated the committed archive hash and complete build manifest before serving the unchanged assets to a pinned Chromium/Playwright smoke. It did not install/rebuild the application, write a bot commit, deploy Pages or change sharing.

The executing commit carried `[skip netlify]` to suppress linked hosting while allowing the deliberately requested Actions run. The two inherited manual workflows are unchanged and are not dispatched. No budget, automatic stop, paid overage or credential settings are changed. A blocked allowance stops the checkpoint.

A successful automated browser smoke still does not establish Safari/VoiceOver behavior or the teaching value experienced by a person. Those remain a bounded later candidate check, not repetition of completed historical marking acceptance.

The temporary trigger was removed after the successful job, with skip markers on the documentation/cleanup commit. The original and corrected workflow remain in Git history as evidence. No additional run, rerun, main promotion or app deployment is part of this cleanup.

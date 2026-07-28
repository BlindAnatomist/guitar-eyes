# Playback Timing Foundation Checkpoint 1 Result

Date: July 28, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/playback-timing-foundation`

Branch starting point: `aa302dcee880df4a0947d3e374171554e4855022`

Exact accepted implementation source: `2b038b15afa09877f6d8dcf615bc060243578096`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Result

State: `passed`

Playback Timing Foundation 1 is accepted as a pure, deterministic, non-audio engine layer.

The checkpoint changes exactly five files relative to the completed tablature-intake record:

1. `AGENTS.md`;
2. `docs/implementation-status.md`;
3. `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
4. `src/playbackTiming.js`;
5. `src/playbackTiming.test.js`.

No importer, React component, reader, focus mechanism, upload mechanism, worker, renderer, player, audio system, format route, or production deployment was changed.

## Accepted capability

The new `buildPlaybackTimeline(semanticDocument, options)` engine:

1. consumes only the accepted semantic tablature document;
2. identifies its output as schema-versioned `playback-timeline` data;
3. preserves existing position and block order;
4. accepts an integer tempo from 20 through 300 quarter-note beats per minute;
5. uses 120 BPM only as the explicit checkpoint default when no tempo option is supplied;
6. records whether tempo was explicit or defaulted;
7. prefers existing Guitar Pro `quarterNoteFraction` evidence;
8. reconstructs MusicXML timing from `durationDivisions` and `divisionsPerQuarter`;
9. converts accepted finite decimal quarter-note units into reduced fractions only when no stronger exact source exists;
10. uses reduced integer fractions for cumulative musical time;
11. treats a chord as one onset because its notes share one semantic position;
12. treats rests as timed positions;
13. returns start, duration, and end offsets in quarter-note fractions, quarter-note units, and milliseconds;
14. produces measure summaries when measure identity exists;
15. reports total position, measure, musical-time, and millisecond duration;
16. declares playback order as `source-order`;
17. does not expand repeats, alternate endings, or loops;
18. rejects missing, zero, negative, non-finite, malformed, or unsafe duration evidence rather than guessing;
19. does not mutate the semantic document;
20. imports no browser, React, worker, renderer, player, or audio dependency.

## Automated verification

Exact successful workflow run: `30383944688`

Workflow context: `guitar-eyes/playback-timing-foundation-1`

The successful run passed every step:

1. exact source checkout;
2. ancestry and exact five-file boundary confirmation;
3. exact dependency installation;
4. complete inherited and new automated suite;
5. optimized production build;
6. source and production-asset boundary inspection;
7. one-day evidence upload;
8. source success status recording.

The optimized production build compiled successfully.

The captured boundary report confirmed:

1. source commit `2b038b15afa09877f6d8dcf615bc060243578096`;
2. exactly the five authorized changed files;
3. `build/index.html` and `build/asset-manifest.json` existed;
4. no forbidden soundfont, audio-worklet, synth-worker, alphaTab-renderer-worker, or Bravura asset was emitted.

Evidence artifact:

- artifact ID: `8698174076`;
- name: `playback-timing-foundation-checkpoint-evidence`;
- retention: one day;
- digest: `sha256:671ce33fc6b6e868a96ee49c26ea0fa8b31820b89fd0c797de13059723d908f5`.

The complete test step passed, but Jest wrote its detailed summary outside the captured `tee` stream. This record therefore states the verified complete-suite pass without inventing a suite or test count.

## Failed gate and correction

The first workflow run, `30383593006`, failed in its shell-only authority guard before Node setup, dependency installation, tests, or production build.

No source, test, or build failure occurred in that run. All expensive verification steps were skipped.

Before correcting it, repository API comparisons independently reconfirmed:

1. exact source head;
2. ancestry from `aa302dcee880df4a0947d3e374171554e4855022`;
3. the exact authorized five-file diff;
4. required timing contracts;
5. absence of prohibited dependencies.

The guard was replaced with named Python assertions that report exact expected and actual values. The corrected run then performed the installation, complete suite, build, and boundary inspection once. The failed shell guard is preserved as an execution-procedure lesson rather than repeated as a source diagnosis.

## Repository authority

After verification, fork `main` was restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison established:

- status: identical;
- ahead: 0;
- behind: 0;
- changed files: 0.

`Phlypper/guitar-eyes` remained untouched.

No pull request, merge, Pages deployment, Netlify deployment, production publication, or owner-operated test occurred.

## Acceptance boundary

This checkpoint establishes timing data, not playback behavior.

It does not establish or authorize:

1. audible playback;
2. Web Audio or MIDI synthesis;
3. sampled guitar or bass sound;
4. metronome sound;
5. playback controls;
6. reader auto-advance;
7. focus or VoiceOver movement during playback;
8. visual cursor behavior;
9. looping;
10. bookmarks;
11. teacher mode;
12. practice scoring;
13. repeat expansion;
14. tempo extraction or tempo maps;
15. count-in or swing behavior;
16. additional tablature formats.

No real-iPhone acceptance was required because the accepted source changes no interface, speech, focus, picker behavior, or hosted interaction.

## Next decision point

The next phase must be separately designed before implementation.

The owner may choose between:

1. an audible playback-output foundation that consumes this timeline; or
2. a non-audio teacher-mode foundation that uses the semantic document and timeline to organize instruction.

Neither route is authorized merely by closing this checkpoint.
# Rhythm Duration Checkpoint 1

Date: July 26, 2026

Branch: `work/real-world-tab-format-corpus`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=rhythm-duration-checkpoint-1`

## Implemented

1. Added a shared ASCII rhythm layer for W, H, Q, E, and S notation.
2. Normalized durations as:
   - W: whole note, 4 quarter-note units;
   - H: half note, 2 quarter-note units;
   - Q: quarter note, 1 quarter-note unit;
   - E: eighth note, 0.5 quarter-note units;
   - S: sixteenth note, 0.25 quarter-note units.
3. Associated the nearest preceding rhythm line with each tablature block.
4. Added column-aligned mapping when rhythm spacing matches semantic source columns.
5. Added sequential mapping only when the number of rhythm symbols exactly matches the number of playable positions.
6. Excluded technique-only positions from receiving independent durations.
7. Preserved ambiguous or incomplete rhythm lines without assigning guessed durations and added a parsing warning.
8. Stored duration data on the shared semantic positions used by both readers.
9. Preserved Jason's desktop string-row projection unchanged.
10. Added duration speech to the existing `Read current position` contract; no new control or navigation mode was introduced.

## Automated coverage

1. W, H, Q, E, and S vocabulary and normalized values.
2. Column-aligned rhythm mapping.
3. Exact sequential rhythm mapping.
4. Ambiguous symbol-count refusal.
5. Technique-only position exclusion.
6. Real-world rhythm corpus mapping across nine playable positions.
7. Spoken duration through the current-position description.
8. Unchanged desktop block projection when rhythm is attached.
9. Complete inherited application suite.
10. Production build and compiled-artifact inspection.

## Verification

Source checkpoint: `2275c3b60b3a8d0b887355017acbdfd9d29147b3`

Workflow run: `30191154088`

Result:

1. complete automated test suite passed;
2. production build passed;
3. rhythm checkpoint identity passed in the built artifact;
4. duration speech and vocabulary were present in compiled JavaScript;
5. Pages artifact upload passed;
6. Pages deployment passed;
7. the downloaded deployed artifact was inspected directly;
8. fork `main` was restored and confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Real-iPhone result

Status: passed.

The owner uploaded `ascii-rhythm-line.txt` in iPhone Safari with VoiceOver and confirmed:

1. focus returned correctly to the iPhone tablature reader;
2. `Read current position` announced the duration before the string-and-fret instructions;
3. quarter, eighth, half, and sixteenth-note values were understandable and matched the tested positions;
4. the resulting spoken instructions made musical sense;
5. Previous and Next position remained quiet and continued to move correctly.

This completes Rhythm Duration Checkpoint 1 on the real target device.

No desktop or laptop acceptance testing was assigned to the owner.
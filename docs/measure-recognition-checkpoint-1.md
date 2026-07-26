# Measure Recognition Checkpoint 1

Date: July 26, 2026

Branch: `work/real-world-tab-format-corpus`

Hosted build:

`https://blindanatomist.github.io/guitar-eyes/?build=measure-recognition-checkpoint-1`

## Implemented

1. Added explicit ASCII measure recognition based only on vertical bar columns shared by every string in a tablature block.
2. Shared barlines no longer become fake musical positions or unsupported notation announcements.
3. Each semantic position inside an explicit measure now stores:
   - measure number;
   - measure count within the block;
   - position number within the measure;
   - position count within the measure.
4. Each measure stores its positions, closing barline column, rhythm-coverage state, and total quarter-note units when every playable position has a mapped duration.
5. Misaligned barline characters are preserved without invented measure assignments and produce a parsing warning.
6. Measure context is announced before duration and string-and-fret instructions through the existing `Read current position` action.
7. Jason's desktop string rows and visible barlines remain unchanged.
8. Reordered the position controls to:
   - Previous position;
   - Read current position;
   - Next position.
9. Previous and Next remain quiet movement actions.
10. Upload focus still returns to the `iPhone tablature reader` heading, so the initial disabled Previous position control does not become the landing target.

## Corpus fixture

Added `fixtures/real-world/ascii-two-measures-rhythm.txt` with:

1. two explicit measures;
2. three playable positions per measure;
3. quarter, quarter, half rhythm in each measure;
4. four quarter-note units per complete measure;
5. aligned shared barlines across all six strings.

The first authored version accidentally used twelve dashes on the blank strings and eleven columns on the played string. The strict model correctly refused to assign measures. The fixture was corrected; the model was not weakened.

## Automated coverage

1. Two explicit measures are recognized.
2. Shared barlines are removed from semantic position navigation.
3. Measure and position-within-measure numbering are correct.
4. Each complete fixture measure totals four quarter-note units.
5. Measure context precedes duration and playing instructions.
6. Misaligned barlines do not generate guessed measures.
7. Jason's desktop projection preserves the original visible rows and barlines.
8. The rendered VoiceOver control order is Previous, Read current, Next.
9. Movement remains quiet across a barline.
10. Complete inherited application suite and production build.

## Verification

Final source checkpoint: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Workflow run: `30192049347`

Result:

1. complete automated test suite passed;
2. production build passed;
3. measure checkpoint identity passed in the built artifact;
4. centered control labels, measure speech, and duration-total model were present in compiled JavaScript;
5. Pages artifact upload passed;
6. Pages deployment passed;
7. the downloaded deployed artifact was inspected directly;
8. fork `main` was restored and confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Remaining real-iPhone gate

Upload `ascii-two-measures-rhythm.txt` in iPhone Safari with VoiceOver and confirm:

1. focus returns to `iPhone tablature reader`;
2. the position controls occur as Previous position, Read current position, Next position;
3. Read current position begins with `Measure 1 of 2` and `Position 1 of 3 in this measure`;
4. moving forward three times reaches measure 2, position 1;
5. Previous and Next remain quiet;
6. duration and string-and-fret instructions remain understandable.

No desktop or laptop acceptance testing is assigned to the owner.

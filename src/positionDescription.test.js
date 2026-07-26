import { parseFourStringBassTabText, parseSixStringTabText } from "./iphoneTabModel";
import { describePlayablePosition } from "./positionDescription";

const makeTab = (lines) => lines.join("\n");

describe("describePlayablePosition", () => {
  test("announces only actionable notes in the four-string bass acceptance fixture", () => {
    const document = parseFourStringBassTabText(
      makeTab([
        "G|--0--2--4--2--|",
        "D|--0--0--2--0--|",
        "A|--2--------2---|",
        "E|--3------------|",
      ])
    );

    expect(describePlayablePosition(document, 0)).toBe(
      "Position 1 of 4. E string, fret 3. A string, fret 2. D string, open. G string, open."
    );
    expect(describePlayablePosition(document, 1)).toBe(
      "Position 2 of 4. D string, open. G string, fret 2."
    );
    expect(describePlayablePosition(document, 2)).toBe(
      "Position 3 of 4. D string, fret 2. G string, fret 4."
    );
    expect(describePlayablePosition(document, 3)).toBe(
      "Position 4 of 4. A string, fret 2. D string, open. G string, fret 2."
    );

    document.positions.forEach((_, index) => {
      expect(describePlayablePosition(document, index)).not.toMatch(/silent/i);
    });
  });

  test("distinguishes an open string without enumerating unplayed strings", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--0--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
      ])
    );

    expect(describePlayablePosition(document, 0)).toBe(
      "Position 1 of 1. High E string, open."
    );
  });

  test("retains explicit muted-note notation because it is an instruction", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--x--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
      ])
    );

    expect(describePlayablePosition(document, 0)).toContain(
      "High E string, muted note notation preserved but not yet interpreted."
    );
  });
});

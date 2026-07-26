import { describeNavigationLocation } from "./navigationAnnouncements";
import { parseSixStringTabText } from "./tablatureModel";

const singleBlockDocument = parseSixStringTabText(
  [
    "e|--0---3--|",
    "B|---------|",
    "G|---------|",
    "D|---------|",
    "A|---------|",
    "E|---------|",
  ].join("\n")
);

const multiBlockDocument = parseSixStringTabText(
  [
    "e|--0--|",
    "B|-----|",
    "G|-----|",
    "D|-----|",
    "A|-----|",
    "E|-----|",
    "",
    "e|--3--|",
    "B|-----|",
    "G|-----|",
    "D|-----|",
    "A|-----|",
    "E|-----|",
  ].join("\n")
);

describe("navigation announcements", () => {
  test("describes position location without playing instructions", () => {
    const announcement = describeNavigationLocation(singleBlockDocument, 1);

    expect(announcement).toBe(
      "Measure 1, position 2 of 2. Overall position 2 of 2."
    );
    expect(announcement).not.toMatch(/string|fret|open/i);
  });

  test("includes block location without playing instructions", () => {
    const announcement = describeNavigationLocation(multiBlockDocument, 1);

    expect(announcement).toBe(
      "Tablature block 2 of 2. Measure 1, position 1 of 1. Overall position 2 of 2."
    );
    expect(announcement).not.toMatch(/string|fret|open/i);
  });
});

import {
  compactStringState,
  describePosition,
  parseSixStringTabText,
  parseTabText,
  TabParseError,
} from "./tablatureModel";

const makeTab = (lines) => lines.join("\n");

describe("shared semantic tablature model", () => {
  test("creates a synchronized semantic position from a clean six-string chord", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|----------|",
        "B|----------|",
        "G|----5-----|",
        "D|----5-----|",
        "A|----5-----|",
        "E|----3-----|",
      ])
    );

    expect(document.type).toBe("tablature-document");
    expect(document.instrument).toBe("guitar");
    expect(document.blocks).toHaveLength(1);
    expect(document.strings).toHaveLength(6);
    expect(document.positions).toHaveLength(1);
    expect(describePosition(document, 0)).toBe(
      "Measure 1, position 1 of 1. Low E string, fret 3. A string, fret 5. D string, fret 5. G string, fret 5. B and high E strings are silent."
    );
  });

  test("keeps a two-digit fret synchronized with another string", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--10--|",
        "B|---3--|",
        "G|------|",
        "D|------|",
        "A|------|",
        "E|------|",
      ])
    );

    expect(document.positions.map((position) => position.sourceColumn)).toEqual([2, 3]);
    expect(describePosition(document, 0)).toContain("High E string, fret 10.");
    expect(describePosition(document, 1)).toContain("B string, fret 3.");
    expect(describePosition(document, 1)).toContain(
      "High E string, continuation of fret 10."
    );
  });

  test("supports several guitar blocks and ignores surrounding title text with a warning", () => {
    const document = parseTabText(
      makeTab([
        "Verse",
        "e|--0--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
        "",
        "Chorus",
        "e|--3--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
      ]),
      "guitar"
    );

    expect(document.blocks).toHaveLength(2);
    expect(document.positions).toHaveLength(2);
    expect(describePosition(document, 1)).toContain("Tablature block 2 of 2.");
    expect(document.warnings.join(" ")).toMatch(/2 non-tablature source lines/i);
  });

  test("supports four-string bass through the same parser", () => {
    const document = parseTabText(
      makeTab(["G|--0--|", "D|-----|", "A|-----|", "E|--3--|"]),
      "bass"
    );

    expect(document.instrument).toBe("bass");
    expect(document.stringCount).toBe(4);
    expect(document.blocks[0].strings).toHaveLength(4);
    expect(describePosition(document, 0)).toContain("E string, fret 3.");
    expect(compactStringState(document.positions[0].strings[0])).toBe("Open");
  });

  test("derives measure position from internal bar lines", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--0--|--3--|",
        "B|-------------|",
        "G|-------------|",
        "D|-------------|",
        "A|-------------|",
        "E|-------------|",
      ])
    );

    expect(document.positions.map((position) => position.measureNumber)).toEqual([1, 2]);
    expect(describePosition(document, 1)).toContain(
      "Measure 2, position 1 of 1."
    );
  });

  test("preserves recognized and unsupported notation without pretending to understand it", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--5h7?--|",
        "B|---------|",
        "G|---------|",
        "D|---------|",
        "A|---------|",
        "E|---------|",
      ])
    );

    expect(describePosition(document, 1)).toContain(
      "hammer-on notation preserved but not yet interpreted"
    );
    expect(document.warnings.join(" ")).toMatch(/cannot yet be interpreted/i);
  });

  test("reports incomplete or absent blocks clearly", () => {
    expect(() =>
      parseTabText(makeTab(["e|--0--|", "B|-----|", "G|-----|"]), "guitar")
    ).toThrow(TabParseError);

    expect(() => parseTabText("Title only", "guitar")).toThrow(
      /No complete 6-string guitar tablature block/i
    );
  });
});

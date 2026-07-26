import {
  describePosition,
  parseSixStringTabText,
  TabParseError,
} from "./iphoneTabModel";

const makeTab = (lines) => lines.join("\n");

describe("parseSixStringTabText", () => {
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
    expect(document.strings).toHaveLength(6);
    expect(document.positions).toHaveLength(1);
    expect(describePosition(document, 0)).toBe(
      "Position 1 of 1. Low E string, fret 3. A string, fret 5. D string, fret 5. G string, fret 5. B and high E strings are silent."
    );
  });

  test("keeps a two-digit fret as one token without shifting another string", () => {
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

  test("distinguishes an open string from silent strings", () => {
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

    expect(describePosition(document, 0)).toContain("High E string, open.");
    expect(describePosition(document, 0)).toContain(
      "low E, A, D, G, and B strings are silent."
    );
  });

  test("preserves source columns when string lines have unequal lengths", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--0----|",
        "B|-------|",
        "G|-------|",
        "D|-------|",
        "A|---3|",
        "E|-------|",
      ])
    );

    expect(document.positions.map((position) => position.sourceColumn)).toEqual([2, 3]);
    expect(document.warnings[0]).toMatch(/unequal lengths/i);
  });

  test("preserves recognized technique notation without pretending to interpret it", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--5h7--|",
        "B|-------|",
        "G|-------|",
        "D|-------|",
        "A|-------|",
        "E|-------|",
      ])
    );

    expect(document.positions.map((position) => position.sourceColumn)).toEqual([2, 3, 4]);
    expect(describePosition(document, 1)).toContain(
      "hammer-on notation preserved but not yet interpreted"
    );
  });

  test("reports unsupported notation instead of silently deleting it", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--?--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
      ])
    );

    expect(document.warnings).toContain(
      "Block 1 contains 1 notation symbol that was preserved but cannot yet be interpreted."
    );
    expect(describePosition(document, 0)).toContain(
      "notation at this position cannot yet be interpreted"
    );
  });

  test("keeps the clean one-block wrapper strict", () => {
    expect(() =>
      parseSixStringTabText(
        makeTab([
          "Title",
          "e|--0--|",
          "B|-----|",
          "G|-----|",
          "D|-----|",
          "A|-----|",
          "E|-----|",
        ])
      )
    ).toThrow(TabParseError);

    expect(() =>
      parseSixStringTabText(
        makeTab([
          "Title",
          "e|--0--|",
          "B|-----|",
          "G|-----|",
          "D|-----|",
          "A|-----|",
          "E|-----|",
        ])
      )
    ).toThrow(/not part of the required clean six-string guitar tablature block/i);
  });
});

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

  test("attaches deterministic transition techniques without adding extra positions", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--5h7p5--|",
        "B|---------|",
        "G|---------|",
        "D|---------|",
        "A|---------|",
        "E|---------|",
      ])
    );

    expect(document.positions.map((position) => position.sourceColumn)).toEqual([2, 4, 6]);
    expect(describePosition(document, 1)).toContain(
      "High E string, fret 7, with hammer-on notation preserved but not yet interpreted."
    );
    expect(describePosition(document, 2)).toContain(
      "High E string, fret 5, with pull-off notation preserved but not yet interpreted."
    );
  });

  test("preserves unsupported notation without creating a false musical position", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--3?--|",
        "B|------|",
        "G|------|",
        "D|------|",
        "A|------|",
        "E|------|",
      ])
    );

    expect(document.positions.map((position) => position.sourceColumn)).toEqual([2]);
    expect(document.warnings.join(" ")).toMatch(
      /1 notation symbol.*preserved.*Unsupported symbols did not create musical positions/i
    );
    expect(document.strings[0].tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "unsupported", raw: "?", createsPosition: false }),
      ])
    );
    expect(describePosition(document, 0)).toContain("High E string, fret 3.");
    expect(describePosition(document, 0)).not.toMatch(/cannot yet be interpreted/i);
  });

  test("normalizes octave-qualified labels while preserving their source form", () => {
    const document = parseSixStringTabText(
      makeTab([
        "E4|--0--|",
        "B3|-----|",
        "G3|-----|",
        "D3|-----|",
        "A2|-----|",
        "E2|-----|",
      ])
    );

    expect(document.strings[0]).toMatchObject({
      tuning: "E",
      octave: 4,
      rawLabel: "E4",
      sourceLine: "E4|--0--|",
      spokenName: "High E string",
    });
    expect(document.strings[5]).toMatchObject({
      tuning: "E",
      octave: 2,
      rawLabel: "E2",
      spokenName: "Low E string",
    });
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

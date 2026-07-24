import {
  describePosition,
  parseSixStringTabText,
  TabParseError,
} from "./iphoneTabModel";

const makeTab = (lines) => lines.join("\n");

const silentLines = (highE) => [
  `e|${highE}`,
  "B|----------------|",
  "G|----------------|",
  "D|----------------|",
  "A|----------------|",
  "E|----------------|",
];

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
    expect(document.blocks).toHaveLength(1);
    expect(document.measures).toHaveLength(1);
    expect(document.positions).toHaveLength(1);
    expect(describePosition(document, 0)).toBe(
      "Measure 1 of 1, position 1 of 1. Low E string, fret 3. A string, fret 5. D string, fret 5. G string, fret 5. B and high E strings are silent."
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
    expect(describePosition(document, 1)).toContain("continuation of fret 10");
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

  test("uses internal bar lines as measure boundaries", () => {
    const document = parseSixStringTabText(
      makeTab(silentLines("--0---|--3---|"))
    );

    expect(document.measures).toHaveLength(2);
    expect(document.positions).toHaveLength(2);
    expect(document.positions[0]).toMatchObject({
      measureNumber: 1,
      totalMeasures: 2,
      positionInMeasure: 1,
    });
    expect(document.positions[1]).toMatchObject({
      measureNumber: 2,
      totalMeasures: 2,
      positionInMeasure: 1,
    });
    expect(describePosition(document, 1)).toContain(
      "Measure 2 of 2, position 1 of 1."
    );
  });

  test("accepts headings, blank lines, and multiple six-string blocks", () => {
    const firstBlock = silentLines("--0---|--3---|");
    const secondBlock = silentLines("--5---|--7---|");
    const document = parseSixStringTabText(
      makeTab(["Intro", "", ...firstBlock, "", "Verse", ...secondBlock])
    );

    expect(document.blocks).toHaveLength(2);
    expect(document.measures).toHaveLength(4);
    expect(document.positions).toHaveLength(4);
    expect(document.warnings).toContain(
      "2 non-tablature lines were ignored, such as headings or notes."
    );
    expect(describePosition(document, 3)).toContain("Measure 4 of 4");
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
      "1 notation symbol was preserved but cannot yet be interpreted."
    );
    expect(describePosition(document, 0)).toContain(
      "notation at this position cannot yet be interpreted"
    );
  });

  test("rejects incomplete six-string blocks", () => {
    expect(() =>
      parseSixStringTabText(
        makeTab([
          "Title",
          "e|--0--|",
          "B|-----|",
          "G|-----|",
          "D|-----|",
          "A|-----|",
        ])
      )
    ).toThrow(TabParseError);

    expect(() =>
      parseSixStringTabText(
        makeTab([
          "e|--0--|",
          "B|-----|",
          "G|-----|",
          "D|-----|",
          "A|-----|",
        ])
      )
    ).toThrow(/exactly six consecutive string lines/i);
  });
});

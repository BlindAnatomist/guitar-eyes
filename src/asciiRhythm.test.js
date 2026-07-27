import { applyAsciiRhythmToDocument, parseAsciiRhythmLine } from "./asciiRhythm";
import { parseSixStringTabText, parseTabDocumentText } from "./iphoneTabModel";

const makeTab = (lines) => lines.join("\n");

function cleanThreePositionTab() {
  return [
    "e|--0-2---3--|",
    "B|-----------|",
    "G|-----------|",
    "D|-----------|",
    "A|-----------|",
    "E|-----------|",
  ];
}

describe("ASCII rhythm extraction", () => {
  test("parses W H Q E and S duration symbols", () => {
    const rhythm = parseAsciiRhythmLine("Rhythm: W H Q E S", 7);

    expect(rhythm.sourceLineNumber).toBe(7);
    expect(rhythm.symbols.map((symbol) => symbol.name)).toEqual([
      "whole note",
      "half note",
      "quarter note",
      "eighth note",
      "sixteenth note",
    ]);
    expect(rhythm.symbols.map((symbol) => symbol.quarterNoteUnits)).toEqual([
      4,
      2,
      1,
      0.5,
      0.25,
    ]);
  });

  test("uses column alignment when symbols match playable source columns", () => {
    const source = makeTab([
      "Rhythm:  Q E   H",
      ...cleanThreePositionTab(),
    ]);
    const parsed = parseTabDocumentText(source, "guitar");
    const document = applyAsciiRhythmToDocument(source, parsed);

    expect(document.blocks[0].rhythm.alignment).toBe("column");
    expect(document.positions.map((position) => position.duration?.symbol)).toEqual([
      "Q",
      "E",
      "H",
    ]);
  });

  test("uses exact sequential mapping when spacing is not column aligned", () => {
    const source = makeTab([
      "Rhythm: Q E H",
      ...cleanThreePositionTab(),
    ]);
    const parsed = parseTabDocumentText(source, "guitar");
    const document = applyAsciiRhythmToDocument(source, parsed);

    expect(document.blocks[0].rhythm.alignment).toBe("sequential");
    expect(document.positions.map((position) => position.duration?.name)).toEqual([
      "quarter note",
      "eighth note",
      "half note",
    ]);
  });

  test("preserves but does not guess when the symbol count is ambiguous", () => {
    const source = makeTab([
      "Rhythm: Q E",
      ...cleanThreePositionTab(),
    ]);
    const parsed = parseTabDocumentText(source, "guitar");
    const document = applyAsciiRhythmToDocument(source, parsed);

    expect(document.blocks[0].rhythm.alignment).toBe("unmapped");
    expect(document.positions.every((position) => !position.duration)).toBe(true);
    expect(document.warnings.join(" ")).toMatch(
      /2 duration symbols for 3 playable positions/i
    );
  });

  test("maps durations only to notes when transition symbols occupy source columns", () => {
    const source = makeTab([
      "Rhythm: Q E",
      "e|--5h7--|",
      "B|-------|",
      "G|-------|",
      "D|-------|",
      "A|-------|",
      "E|-------|",
    ]);
    const parsed = parseTabDocumentText(source, "guitar");
    const document = applyAsciiRhythmToDocument(source, parsed);

    expect(document.positions).toHaveLength(2);
    expect(document.blocks[0].rhythm.mappedCount).toBe(2);
    expect(document.positions.map((position) => position.duration?.symbol)).toEqual([
      "Q",
      "E",
    ]);
    expect(
      document.positions[1].strings.find((state) => state.type === "fret")?.techniques
    ).toEqual([expect.objectContaining({ name: "hammer-on" })]);
  });

  test("keeps strict clean-tab parsing free of rhythm metadata when no line exists", () => {
    const document = parseSixStringTabText(makeTab(cleanThreePositionTab()));

    expect(document.positions.every((position) => !position.duration)).toBe(true);
  });
});

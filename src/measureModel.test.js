import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { buildReaderDocuments } from "./tabImportCoordinator";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

describe("explicit ASCII measure recognition", () => {
  test("turns shared barlines into two measures without fake musical positions", () => {
    const source = fixture("ascii-two-measures-rhythm.txt");
    const result = buildReaderDocuments(source, "guitar");
    const document = result.semanticDocument;

    expect(document.measures).toHaveLength(2);
    expect(document.positions).toHaveLength(6);
    expect(document.positions.map((position) => position.measureNumber)).toEqual([
      1,
      1,
      1,
      2,
      2,
      2,
    ]);
    expect(document.positions.map((position) => position.positionInMeasure)).toEqual([
      1,
      2,
      3,
      1,
      2,
      3,
    ]);
    expect(
      document.positions.some((position) =>
        position.strings.some(
          (state) => state.type === "unsupported" && state.raw === "|"
        )
      )
    ).toBe(false);
  });

  test("calculates measure duration totals only from mapped rhythm", () => {
    const document = buildReaderDocuments(
      fixture("ascii-two-measures-rhythm.txt"),
      "guitar"
    ).semanticDocument;

    expect(document.measures.map((measure) => measure.durationComplete)).toEqual([
      true,
      true,
    ]);
    expect(
      document.measures.map((measure) => measure.totalQuarterNoteUnits)
    ).toEqual([4, 4]);
  });

  test("announces measure context before duration and playing instructions", () => {
    const document = buildReaderDocuments(
      fixture("ascii-two-measures-rhythm.txt"),
      "guitar"
    ).semanticDocument;

    expect(describePlayablePosition(document, 0)).toBe(
      "Measure 1 of 2. Position 1 of 3 in this measure. Duration, quarter note. High E string, open."
    );
    expect(describePlayablePosition(document, 3)).toBe(
      "Measure 2 of 2. Position 1 of 3 in this measure. Duration, quarter note. High E string, fret 5."
    );
  });

  test("keeps Jason's desktop rows and their visible barlines unchanged", () => {
    const result = buildReaderDocuments(
      fixture("ascii-two-measures-rhythm.txt"),
      "guitar"
    );

    expect(result.desktopBlocks).toHaveLength(1);
    expect(result.desktopBlocks[0]).toEqual([
      "e|--0--2--3--|--5--3--2--|",
      "B|-----------|-----------|",
      "G|-----------|-----------|",
      "D|-----------|-----------|",
      "A|-----------|-----------|",
      "E|-----------|-----------|",
    ]);
  });

  test("refuses to invent measures when barlines do not align across strings", () => {
    const source = [
      "e|--0--|--2--|",
      "B|-------------|",
      "G|-------------|",
      "D|-------------|",
      "A|-------------|",
      "E|-------------|",
    ].join("\n");
    const document = buildReaderDocuments(source, "guitar").semanticDocument;

    expect(document.measures).toHaveLength(0);
    expect(document.warnings.join(" ")).toMatch(
      /barline characters that do not align across every string/i
    );
  });
});

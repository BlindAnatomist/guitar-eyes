import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { buildReaderDocuments } from "./tabImportCoordinator";
import { detectTabFileFormat } from "./tabFormatDetector";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

describe("real-world tablature format corpus", () => {
  test("normalizes copied-page guitar text while preserving two blocks", () => {
    const source = fixture("ascii-webpage-mixed-content.txt");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.semanticDocument.blocks).toHaveLength(2);
    expect(result.desktopBlocks).toHaveLength(2);
    expect(result.semanticDocument.warnings.join(" ")).toMatch(/non-tablature lines? were ignored/i);
  });

  test("maps W H Q E S rhythm notation onto semantic positions", () => {
    const source = fixture("ascii-rhythm-line.txt");
    const result = buildReaderDocuments(source, "guitar");
    const durations = result.semanticDocument.positions.map(
      (position) => position.duration?.symbol
    );

    expect(result.semanticDocument).not.toBeNull();
    expect(result.semanticDocument.blocks[0].rhythm.alignment).toBe("column");
    expect(result.semanticDocument.blocks[0].rhythm.mappedCount).toBe(9);
    expect(durations).toEqual(["Q", "E", "E", "H", "Q", "Q", "S", "S", "E"]);
    expect(result.semanticDocument.positions[0].duration).toMatchObject({
      name: "quarter note",
      quarterNoteUnits: 1,
      source: "ascii-rhythm-line",
    });
  });

  test("preserves recognized inline techniques from annotated ASCII", () => {
    const source = fixture("ascii-techniques-and-annotations.txt");
    const result = buildReaderDocuments(source, "guitar");
    const techniqueNames = result.semanticDocument.strings.flatMap((string) =>
      string.tokens
        .filter((token) => token.type === "technique")
        .map((token) => token.name)
    );

    expect(techniqueNames).toEqual(
      expect.arrayContaining([
        "hammer-on",
        "pull-off",
        "ascending slide",
        "descending slide",
        "bend",
        "bend release",
        "vibrato",
        "tap",
        "muted note",
      ])
    );
  });

  test("auto-detects metadata-rich four-string bass and preserves both blocks", () => {
    const source = fixture("ascii-bass-with-metadata.txt");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.resolvedInstrument).toBe("bass");
    expect(result.instrumentWasDetected).toBe(true);
    expect(result.semanticDocument.blocks).toHaveLength(2);
    expect(result.desktopBlocks).toHaveLength(2);
  });

  test("imports octave-qualified standard labels and Unicode custom tuning", () => {
    const octave = buildReaderDocuments(
      fixture("ascii-octave-qualified-standard.txt"),
      "guitar"
    );
    const unicode = buildReaderDocuments(
      fixture("ascii-unicode-accidentals.txt"),
      "guitar"
    );

    expect(octave.desktopSource).toBe("semantic");
    expect(octave.semanticDocument.strings.map((string) => string.octave)).toEqual([
      4,
      3,
      3,
      3,
      2,
      2,
    ]);
    expect(unicode.desktopSource).toBe("semantic");
    expect(unicode.semanticDocument.strings.map((string) => string.tuning)).toEqual([
      "F#",
      "C#",
      "A",
      "E",
      "B",
      "F#",
    ]);
  });

  test("keeps punctuation and transition notation out of the position count", () => {
    const result = buildReaderDocuments(
      fixture("ascii-ghost-harmonic-repeat-techniques.txt"),
      "guitar"
    );
    const descriptions = result.semanticDocument.positions.map((_, index) =>
      describePlayablePosition(result.semanticDocument, index)
    );

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.positions).toHaveLength(5);
    expect(result.semanticDocument.positions.map((position) => position.duration?.symbol)).toEqual([
      "Q",
      "Q",
      "Q",
      "Q",
      "Q",
    ]);
    expect(descriptions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("fret 7, with hammer-on notation"),
        expect.stringContaining("fret 5, with pull-off notation"),
      ])
    );
    expect(result.semanticDocument.warnings.join(" ")).toMatch(
      /Unsupported symbols did not create musical positions/i
    );
  });

  test.each([
    ["ascii-seven-string-guitar.txt", "guitar"],
    ["ascii-five-string-bass.txt", "bass"],
  ])("recognizes unsupported string-count family in %s without guessing", (name, instrument) => {
    const result = buildReaderDocuments(fixture(name), instrument);

    expect(result.supportOutcome).toBe("recognized-unsupported");
    expect(result.semanticError.code).toBe("UNSUPPORTED_STRING_COUNT");
    expect(result.semanticDocument).toBeNull();
  });

  test("recognizes the structured MusicXML target without sending it to ASCII parsing", () => {
    const source = fixture("musicxml-minimal-guitar-tab.musicxml");
    const format = detectTabFileFormat("musicxml-minimal-guitar-tab.musicxml", source);

    expect(format).toMatchObject({
      id: "musicxml",
      label: "MusicXML tablature",
      support: "planned",
      isText: true,
    });
  });
});

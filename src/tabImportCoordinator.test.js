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

const guitarLines = [
  "e|--0--2--|",
  "B|--1--3--|",
  "G|--0--2--|",
  "D|--2--0--|",
  "A|--3-----|",
  "E|--------|",
];

const bassLines = [
  "G|--0--|",
  "D|--0--|",
  "A|--2--|",
  "E|--3--|",
];

describe("buildReaderDocuments", () => {
  test("uses one semantic guitar document for both reader projections", () => {
    const result = buildReaderDocuments(guitarLines.join("\n"), "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument).not.toBeNull();
    expect(result.semanticError).toBeNull();
    expect(result.desktopBlocks).toEqual([guitarLines]);
    expect(result.semanticDocument.positions.length).toBeGreaterThan(0);
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.instrumentWasDetected).toBe(false);
    expect(result.supportOutcome).toBe("supported");
  });

  test("uses one multi-block guitar document for both reader projections", () => {
    const source = ["Intro", ...guitarLines, "Verse", ...guitarLines].join("\n");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.blocks).toHaveLength(2);
    expect(result.desktopBlocks).toEqual([guitarLines, guitarLines]);
    expect(result.semanticError).toBeNull();
  });

  test("uses the shared semantic core for four-string bass", () => {
    const result = buildReaderDocuments(bassLines.join("\n"), "bass");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("bass");
    expect(result.semanticDocument.blocks).toHaveLength(1);
    expect(result.desktopBlocks).toEqual([bassLines]);
    expect(result.semanticError).toBeNull();
  });

  test("auto-detects bass when the interface still says guitar", () => {
    const result = buildReaderDocuments(bassLines.join("\n"), "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("bass");
    expect(result.desktopBlocks).toEqual([bassLines]);
    expect(result.requestedInstrument).toBe("guitar");
    expect(result.resolvedInstrument).toBe("bass");
    expect(result.instrumentWasDetected).toBe(true);
  });

  test("auto-detects guitar when the interface still says bass", () => {
    const result = buildReaderDocuments(guitarLines.join("\n"), "bass");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("guitar");
    expect(result.desktopBlocks).toEqual([guitarLines]);
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.instrumentWasDetected).toBe(true);
  });

  test("does not misclassify two six-string guitar blocks as custom-tuned bass", () => {
    const source = ["Intro", ...guitarLines, "Verse", ...guitarLines].join("\n");
    const result = buildReaderDocuments(source, "bass");
    const description = describePlayablePosition(result.semanticDocument, 0);

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("guitar");
    expect(result.semanticDocument.blocks).toHaveLength(2);
    expect(result.desktopBlocks).toEqual([guitarLines, guitarLines]);
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.instrumentWasDetected).toBe(true);
    expect(description).toContain("High E string, open.");
    expect(description).not.toMatch(/String 1, tuned/i);
  });

  test("normalizes octave-qualified and Unicode accidental labels semantically", () => {
    const octaveResult = buildReaderDocuments(
      fixture("ascii-octave-qualified-standard.txt"),
      "guitar"
    );
    const unicodeResult = buildReaderDocuments(
      fixture("ascii-unicode-accidentals.txt"),
      "guitar"
    );

    expect(octaveResult).toMatchObject({
      desktopSource: "semantic",
      resolvedInstrument: "guitar",
      supportOutcome: "supported",
    });
    expect(octaveResult.semanticDocument.strings[0]).toMatchObject({
      tuning: "E",
      octave: 4,
      rawLabel: "E4",
    });
    expect(unicodeResult.desktopSource).toBe("semantic");
    expect(unicodeResult.semanticDocument.strings[0]).toMatchObject({
      tuning: "F#",
      octave: 4,
      rawLabel: "F♯4",
    });
    expect(unicodeResult.semanticDocument.warnings.join(" ")).toMatch(
      /custom six-string guitar tuning/i
    );
  });

  test.each([
    ["ascii-seven-string-guitar.txt", "guitar", "7-string"],
    ["ascii-five-string-bass.txt", "bass", "5-string"],
  ])("recognizes but does not guess unsupported string count in %s", (name, selected, label) => {
    const result = buildReaderDocuments(fixture(name), selected);

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("UNSUPPORTED_STRING_COUNT");
    expect(result.semanticError.message).toContain(label);
    expect(result.supportOutcome).toBe("recognized-unsupported");
  });

  test.each([
    "ascii-unsafe-octave-order.txt",
    "ascii-misordered-standard-labels.txt",
  ])("rejects unsafe tuning evidence in %s", (name) => {
    const result = buildReaderDocuments(fixture(name), "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("UNSAFE_TUNING_ORDER");
    expect(result.supportOutcome).toBe("unsafe-fallback");
  });

  test("retains the legacy desktop fallback when semantic parsing is unsafe", () => {
    const source = ["Title", ...guitarLines.slice(0, 5)].join("\n");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("INCOMPLETE_TABLATURE_BLOCK");
    expect(result.desktopBlocks.length).toBeGreaterThan(0);
  });
});

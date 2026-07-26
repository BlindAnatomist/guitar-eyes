import { describePlayablePosition } from "./positionDescription";
import { buildReaderDocuments } from "./tabImportCoordinator";

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

  test("retains the legacy desktop fallback when semantic parsing is unsafe", () => {
    const source = ["Title", ...guitarLines.slice(0, 5)].join("\n");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("INCOMPLETE_TABLATURE_BLOCK");
    expect(result.desktopBlocks.length).toBeGreaterThan(0);
  });
});

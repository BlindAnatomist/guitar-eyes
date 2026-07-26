import { buildReaderDocuments } from "./tabImportCoordinator";

const guitarLines = [
  "e|--0--2--|",
  "B|--1--3--|",
  "G|--0--2--|",
  "D|--2--0--|",
  "A|--3-----|",
  "E|--------|",
];

describe("buildReaderDocuments", () => {
  test("uses one semantic guitar document for both reader projections", () => {
    const result = buildReaderDocuments(guitarLines.join("\n"), "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument).not.toBeNull();
    expect(result.semanticError).toBeNull();
    expect(result.desktopBlocks).toEqual([guitarLines]);
    expect(result.semanticDocument.positions.length).toBeGreaterThan(0);
  });

  test("retains the legacy desktop fallback for multiple guitar blocks", () => {
    const source = [...guitarLines, ...guitarLines].join("\n");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError).not.toBeNull();
    expect(result.desktopBlocks).toHaveLength(2);
  });

  test("retains Jason's four-string bass path until the semantic core supports bass", () => {
    const source = [
      "G|--0--|",
      "D|--0--|",
      "A|--2--|",
      "E|--3--|",
    ].join("\n");
    const result = buildReaderDocuments(source, "bass");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.desktopBlocks).toHaveLength(1);
    expect(result.semanticError.code).toBe("SEMANTIC_BASS_NOT_IMPLEMENTED");
  });
});

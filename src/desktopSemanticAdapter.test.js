import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseSixStringTabText, parseTabDocumentText } from "./iphoneTabModel";
import { buildReaderDocuments } from "./tabImportCoordinator";

const guitarLines = [
  "e|--10h12--|",
  "B|----3----|",
  "G|---------|",
  "D|---------|",
  "A|---------|",
  "E|---------|",
];

const bassLines = [
  "G|--0--2--|",
  "D|--0--0--|",
  "A|--2-----|",
  "E|--3-----|",
];

describe("semanticDocumentToDesktopBlocks", () => {
  test("projects one semantic guitar document into Jason's desktop block shape", () => {
    const document = parseSixStringTabText(guitarLines.join("\n"));

    expect(semanticDocumentToDesktopBlocks(document)).toEqual([guitarLines]);
  });

  test("preserves multiple semantic guitar blocks without headings entering the grid", () => {
    const document = parseTabDocumentText(
      ["Intro", ...guitarLines, "Verse", ...guitarLines].join("\n"),
      "guitar"
    );

    expect(semanticDocumentToDesktopBlocks(document)).toEqual([
      guitarLines,
      guitarLines,
    ]);
  });

  test("projects semantic bass into the four-row desktop block shape", () => {
    const document = parseTabDocumentText(bassLines.join("\n"), "bass");

    expect(semanticDocumentToDesktopBlocks(document)).toEqual([bassLines]);
  });

  test("keeps Jason's desktop string rows unchanged when shared rhythm is attached", () => {
    const source = ["Rhythm: Q E", ...bassLines].join("\n");
    const result = buildReaderDocuments(source, "bass");

    expect(result.semanticDocument.positions.map((position) => position.duration?.symbol)).toEqual([
      "Q",
      "E",
    ]);
    expect(result.desktopBlocks).toEqual([bassLines]);
  });

  test("returns no desktop blocks when no semantic document is available", () => {
    expect(semanticDocumentToDesktopBlocks(null)).toEqual([]);
  });
});

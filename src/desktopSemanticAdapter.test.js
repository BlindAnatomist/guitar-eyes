import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseSixStringTabText } from "./iphoneTabModel";

const sourceLines = [
  "e|--10h12--|",
  "B|----3----|",
  "G|---------|",
  "D|---------|",
  "A|---------|",
  "E|---------|",
];

describe("semanticDocumentToDesktopBlocks", () => {
  test("projects the same semantic document into Jason's legacy desktop block shape", () => {
    const document = parseSixStringTabText(sourceLines.join("\n"));

    expect(semanticDocumentToDesktopBlocks(document)).toEqual([sourceLines]);
  });

  test("returns no desktop blocks when no semantic document is available", () => {
    expect(semanticDocumentToDesktopBlocks(null)).toEqual([]);
  });
});

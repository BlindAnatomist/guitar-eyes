export function semanticDocumentToDesktopBlocks(document) {
  if (!document || !Array.isArray(document.blocks)) {
    return [];
  }

  return document.blocks
    .map((block) => {
      if (!block || !Array.isArray(block.strings)) {
        return [];
      }

      return block.strings.map((string) => String(string?.sourceLine ?? "").trim());
    })
    .filter((block) => block.length > 0);
}

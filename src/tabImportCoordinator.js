import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseTabDocumentText } from "./iphoneTabModel";
import { parseTabText } from "./parseFile";

export function buildReaderDocuments(sourceText, selectedInstrument) {
  const numStrings = selectedInstrument === "bass" ? 4 : 6;
  let desktopBlocks = parseTabText(sourceText, numStrings);

  try {
    const semanticDocument = parseTabDocumentText(sourceText, selectedInstrument);
    const semanticDesktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

    if (semanticDesktopBlocks.length > 0) {
      desktopBlocks = semanticDesktopBlocks;
    }

    return {
      desktopBlocks,
      desktopSource: "semantic",
      semanticDocument,
      semanticError: null,
    };
  } catch (error) {
    return {
      desktopBlocks,
      desktopSource: "legacy-fallback",
      semanticDocument: null,
      semanticError: error,
    };
  }
}

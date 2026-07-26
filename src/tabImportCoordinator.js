import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseSixStringTabText, TabParseError } from "./iphoneTabModel";
import { parseTabText } from "./parseFile";

export function buildReaderDocuments(sourceText, selectedInstrument) {
  const isGuitar = selectedInstrument === "guitar";
  const numStrings = isGuitar ? 6 : 4;
  let desktopBlocks = parseTabText(sourceText, numStrings);

  if (!isGuitar) {
    return {
      desktopBlocks,
      desktopSource: "legacy-fallback",
      semanticDocument: null,
      semanticError: new TabParseError(
        "The shared semantic core currently supports one six-string guitar block. Jason's existing four-string bass parser remains active as a compatibility fallback.",
        "SEMANTIC_BASS_NOT_IMPLEMENTED"
      ),
    };
  }

  try {
    const semanticDocument = parseSixStringTabText(sourceText);
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

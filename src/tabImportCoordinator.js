import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseTabDocumentText } from "./iphoneTabModel";
import { parseTabText } from "./parseFile";

const SUPPORTED_INSTRUMENTS = ["guitar", "bass"];

function alternateInstrument(selectedInstrument) {
  return selectedInstrument === "bass" ? "guitar" : "bass";
}

export function buildReaderDocuments(sourceText, selectedInstrument = "guitar") {
  const requestedInstrument = SUPPORTED_INSTRUMENTS.includes(selectedInstrument)
    ? selectedInstrument
    : "guitar";
  const candidates = [requestedInstrument, alternateInstrument(requestedInstrument)];
  let semanticError = null;

  for (const candidate of candidates) {
    try {
      const semanticDocument = parseTabDocumentText(sourceText, candidate);
      const desktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

      return {
        desktopBlocks,
        desktopSource: "semantic",
        semanticDocument,
        semanticError: null,
        requestedInstrument,
        resolvedInstrument: candidate,
        instrumentWasDetected: candidate !== requestedInstrument,
      };
    } catch (error) {
      if (candidate === requestedInstrument) {
        semanticError = error;
      }
    }
  }

  const numStrings = requestedInstrument === "bass" ? 4 : 6;

  return {
    desktopBlocks: parseTabText(sourceText, numStrings),
    desktopSource: "legacy-fallback",
    semanticDocument: null,
    semanticError,
    requestedInstrument,
    resolvedInstrument: requestedInstrument,
    instrumentWasDetected: false,
  };
}

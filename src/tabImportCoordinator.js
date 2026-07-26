import { applyAsciiRhythmToDocument } from "./asciiRhythm";
import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseTabDocumentText, TabParseError } from "./iphoneTabModel";
import { parseTabText } from "./parseFile";

const SUPPORTED_INSTRUMENTS = ["guitar", "bass"];
const STRING_COUNTS = {
  guitar: 6,
  bass: 4,
};
const STRING_LINE_PATTERN = /^\s*[A-Ga-g](?:#|b)?\s*\|/;

function alternateInstrument(selectedInstrument) {
  return selectedInstrument === "bass" ? "guitar" : "bass";
}

function collectContiguousStringRunLengths(sourceText) {
  const runLengths = [];
  let currentRunLength = 0;

  String(sourceText)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .forEach((line) => {
      if (STRING_LINE_PATTERN.test(line)) {
        currentRunLength += 1;
        return;
      }

      if (currentRunLength > 0) {
        runLengths.push(currentRunLength);
        currentRunLength = 0;
      }
    });

  if (currentRunLength > 0) {
    runLengths.push(currentRunLength);
  }

  return runLengths;
}

function structurallyMatchesInstrument(runLengths, instrument) {
  const stringCount = STRING_COUNTS[instrument];

  return (
    runLengths.length > 0 &&
    runLengths.every((runLength) => runLength % stringCount === 0)
  );
}

export function buildReaderDocuments(sourceText, selectedInstrument = "guitar") {
  const requestedInstrument = SUPPORTED_INSTRUMENTS.includes(selectedInstrument)
    ? selectedInstrument
    : "guitar";
  const candidates = [requestedInstrument, alternateInstrument(requestedInstrument)];
  const runLengths = collectContiguousStringRunLengths(sourceText);
  const structurallyPlausibleCandidates = candidates.filter((candidate) =>
    structurallyMatchesInstrument(runLengths, candidate)
  );
  let semanticError = null;

  for (const candidate of structurallyPlausibleCandidates) {
    try {
      const parsedDocument = parseTabDocumentText(sourceText, candidate);
      const semanticDocument = applyAsciiRhythmToDocument(sourceText, parsedDocument);
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
      if (candidate === requestedInstrument || semanticError === null) {
        semanticError = error;
      }
    }
  }

  if (semanticError === null) {
    try {
      parseTabDocumentText(sourceText, requestedInstrument);
      semanticError = new TabParseError(
        "The tablature string-line groups do not match a complete four-string bass or six-string guitar document.",
        "INSTRUMENT_STRUCTURE_MISMATCH"
      );
    } catch (error) {
      semanticError = error;
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

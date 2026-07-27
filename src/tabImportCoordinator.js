import { applyAsciiRhythmToDocument } from "./asciiRhythm";
import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseTabDocumentText, TabParseError } from "./iphoneTabModel";
import { applyExplicitMeasuresToDocument } from "./measureModel";
import { parseTabText } from "./parseFile";
import {
  analyzeTabRunsForProfile,
  ASCII_INSTRUMENT_PROFILES,
  collectTabStringLineRuns,
  containsPlayableAsciiNotation,
} from "./tabStringLine";

const SUPPORTED_INSTRUMENTS = ["guitar", "bass"];

function alternateInstrument(selectedInstrument) {
  return selectedInstrument === "bass" ? "guitar" : "bass";
}

function supportedCandidateAnalyses(sourceText, requestedInstrument) {
  const candidates = [requestedInstrument, alternateInstrument(requestedInstrument)];

  return candidates
    .map((instrument) => ({
      instrument,
      analysis: analyzeTabRunsForProfile(
        sourceText,
        ASCII_INSTRUMENT_PROFILES[instrument]
      ),
    }))
    .filter((candidate) => candidate.analysis.valid)
    .sort((left, right) => {
      const confidenceDifference =
        right.analysis.confidence - left.analysis.confidence;
      if (confidenceDifference !== 0) return confidenceDifference;
      if (left.instrument === requestedInstrument) return -1;
      if (right.instrument === requestedInstrument) return 1;
      return 0;
    });
}

function unsupportedStringCountError(sourceText) {
  const collected = collectTabStringLineRuns(sourceText);
  const playableRuns = collected.runs.filter((run) =>
    run.some((entry) => containsPlayableAsciiNotation(entry.content))
  );
  const unsupportedLengths = [
    ...new Set(
      playableRuns
        .map((run) => run.length)
        .filter((length) => length > 0 && length % 4 !== 0 && length % 6 !== 0)
    ),
  ];

  if (unsupportedLengths.length === 0) return null;

  const labels = unsupportedLengths.map((length) => `${length}-string`).join(" and ");
  return new TabParseError(
    `Guitar Eyes recognized ${labels} ASCII tablature. Semantic reading currently supports complete four-string bass and six-string guitar blocks; this string count was preserved but not guessed into another instrument.`,
    "UNSUPPORTED_STRING_COUNT"
  );
}

export function buildReaderDocuments(sourceText, selectedInstrument = "guitar") {
  const requestedInstrument = SUPPORTED_INSTRUMENTS.includes(selectedInstrument)
    ? selectedInstrument
    : "guitar";
  const candidates = supportedCandidateAnalyses(sourceText, requestedInstrument);
  let semanticError = null;

  for (const candidate of candidates) {
    try {
      const parsedDocument = parseTabDocumentText(sourceText, candidate.instrument);
      const rhythmDocument = applyAsciiRhythmToDocument(sourceText, parsedDocument);
      const semanticDocument = applyExplicitMeasuresToDocument(rhythmDocument);
      const desktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

      return {
        desktopBlocks,
        desktopSource: "semantic",
        semanticDocument,
        semanticError: null,
        requestedInstrument,
        resolvedInstrument: candidate.instrument,
        instrumentWasDetected: candidate.instrument !== requestedInstrument,
        supportOutcome: "supported",
      };
    } catch (error) {
      if (candidate.instrument === requestedInstrument || semanticError === null) {
        semanticError = error;
      }
    }
  }

  semanticError =
    unsupportedStringCountError(sourceText) ||
    semanticError ||
    (() => {
      const requestedAnalysis = analyzeTabRunsForProfile(
        sourceText,
        ASCII_INSTRUMENT_PROFILES[requestedInstrument]
      );
      return new TabParseError(
        requestedAnalysis.message ||
          "The tablature could not be normalized safely as four-string bass or six-string guitar.",
        requestedAnalysis.code || "INSTRUMENT_STRUCTURE_MISMATCH"
      );
    })();

  const numStrings = requestedInstrument === "bass" ? 4 : 6;

  return {
    desktopBlocks: parseTabText(sourceText, numStrings),
    desktopSource: "legacy-fallback",
    semanticDocument: null,
    semanticError,
    requestedInstrument,
    resolvedInstrument: requestedInstrument,
    instrumentWasDetected: false,
    supportOutcome:
      semanticError.code === "UNSUPPORTED_STRING_COUNT"
        ? "recognized-unsupported"
        : "unsafe-fallback",
  };
}

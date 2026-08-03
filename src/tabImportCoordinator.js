import { applyAsciiRhythmToDocument } from "./asciiRhythm";
import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { parseTabDocumentText, TabParseError } from "./iphoneTabModel";
import { applyExplicitMeasuresToDocument } from "./measureModel";
import { parseMusicXmlTablature } from "./musicXmlImporter";
import { parseTabText } from "./parseFile";
import {
  analyzeTabRunsForProfile,
  ASCII_INSTRUMENT_PROFILES,
  collectTabStringLineRuns,
  containsPlayableAsciiNotation,
  SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY,
  UNSUPPORTED_ASCII_INSTRUMENT_PROFILES,
} from "./tabStringLine";

const SUPPORTED_INSTRUMENTS = ["guitar", "bass"];

function alternateInstrument(selectedInstrument) {
  return selectedInstrument === "bass" ? "guitar" : "bass";
}

function orderedProfileKeys(requestedInstrument) {
  const alternate = alternateInstrument(requestedInstrument);
  return [
    ...SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY[requestedInstrument],
    ...SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY[alternate],
  ];
}

function supportedCandidateAnalyses(sourceText, requestedInstrument) {
  return orderedProfileKeys(requestedInstrument)
    .map((profileKey) => {
      const profile = ASCII_INSTRUMENT_PROFILES[profileKey];
      return {
        profileKey,
        profile,
        analysis: analyzeTabRunsForProfile(sourceText, profile),
      };
    })
    .filter((candidate) => candidate.analysis.valid)
    .sort((left, right) => {
      const confidenceDifference =
        right.analysis.confidence - left.analysis.confidence;
      if (confidenceDifference !== 0) return confidenceDifference;

      const leftPreferred = left.profile.id === requestedInstrument;
      const rightPreferred = right.profile.id === requestedInstrument;
      if (leftPreferred && !rightPreferred) return -1;
      if (rightPreferred && !leftPreferred) return 1;
      return 0;
    });
}

function applyProfileStringIdentities(document, profile) {
  if (!Array.isArray(profile.stringIdentities)) return document;

  const blocks = document.blocks.map((block) => {
    const strings = block.strings.map((string, index) => ({
      ...string,
      ...(profile.stringIdentities[index] || {}),
    }));
    return { ...block, strings };
  });

  return {
    ...document,
    blocks,
    strings: blocks.flatMap((block) => block.strings),
  };
}

function runContainsExactStandardSegments(run, profile) {
  if (run.length === 0 || run.length % profile.stringCount !== 0) return false;

  for (let offset = 0; offset < run.length; offset += profile.stringCount) {
    const segment = run.slice(offset, offset + profile.stringCount);
    const exactLabels = segment.every(
      (entry, index) => entry.tuning === profile.standardTuning[index]
    );
    if (!exactLabels) return false;
  }

  return true;
}

function exactCountProfileError(sourceText, requestedInstrument) {
  const collected = collectTabStringLineRuns(sourceText);
  const hasPlayableRun = collected.runs.some((run) =>
    run.some((entry) => containsPlayableAsciiNotation(entry.content))
  );

  if (!hasPlayableRun) return null;

  for (const profileKey of orderedProfileKeys(requestedInstrument)) {
    const profile = ASCII_INSTRUMENT_PROFILES[profileKey];
    const hasPlausibleExactProfileRun = collected.runs.some((run) =>
      runContainsExactStandardSegments(run, profile)
    );
    if (!hasPlausibleExactProfileRun) continue;

    const analysis = analyzeTabRunsForProfile(sourceText, profile);
    if (
      !analysis.valid &&
      analysis.code !== "NO_TABLATURE_BLOCKS" &&
      analysis.code !== "INCOMPLETE_TABLATURE_BLOCK"
    ) {
      return new TabParseError(analysis.message, analysis.code);
    }
  }

  return null;
}

function unsupportedStringCountError(sourceText) {
  const collected = collectTabStringLineRuns(sourceText);
  const hasPlayableRun = collected.runs.some((run) =>
    run.some((entry) => containsPlayableAsciiNotation(entry.content))
  );

  if (!hasPlayableRun) return null;

  const matches = Object.values(UNSUPPORTED_ASCII_INSTRUMENT_PROFILES)
    .map((profile) => ({
      profile,
      analysis: analyzeTabRunsForProfile(sourceText, profile),
    }))
    .filter((candidate) => candidate.analysis.valid)
    .sort((left, right) => right.analysis.confidence - left.analysis.confidence);

  if (matches.length === 0) return null;

  const stringCounts = [...new Set(matches.map(({ profile }) => profile.stringCount))];
  const labels = stringCounts.map((count) => `${count}-string`).join(" and ");

  return new TabParseError(
    `Guitar Eyes recognized ${labels} ASCII tablature. This verified string-count family was preserved but is not yet supported by the semantic reader.`,
    "UNSUPPORTED_STRING_COUNT"
  );
}

export function buildReaderDocuments(sourceText, selectedInstrument = "guitar") {
  const requestedInstrument = SUPPORTED_INSTRUMENTS.includes(selectedInstrument)
    ? selectedInstrument
    : "guitar";
  const strictProfileError = exactCountProfileError(sourceText, requestedInstrument);
  const candidates = strictProfileError
    ? []
    : supportedCandidateAnalyses(sourceText, requestedInstrument);
  let semanticError = strictProfileError;

  for (const candidate of candidates) {
    try {
      const parsedDocument = parseTabDocumentText(sourceText, candidate.profileKey);
      const identifiedDocument = applyProfileStringIdentities(
        parsedDocument,
        candidate.profile
      );
      const rhythmDocument = applyAsciiRhythmToDocument(
        sourceText,
        identifiedDocument
      );
      const semanticDocument = applyExplicitMeasuresToDocument(rhythmDocument);
      const desktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

      return {
        desktopBlocks,
        desktopSource: "semantic",
        semanticDocument,
        semanticError: null,
        requestedInstrument,
        resolvedInstrument: candidate.profile.id,
        instrumentWasDetected: candidate.profile.id !== requestedInstrument,
        supportOutcome: "supported",
        sourceFormat: "ascii-text",
        sourceFormatLabel: "ASCII text tablature",
      };
    } catch (error) {
      if (candidate.profile.id === requestedInstrument || semanticError === null) {
        semanticError = error;
      }
    }
  }

  semanticError =
    semanticError ||
    unsupportedStringCountError(sourceText) ||
    (() => {
      const requestedAnalysis = analyzeTabRunsForProfile(
        sourceText,
        ASCII_INSTRUMENT_PROFILES[requestedInstrument]
      );
      return new TabParseError(
        requestedAnalysis.message ||
          "The tablature could not be normalized safely as a supported guitar or bass profile.",
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
    sourceFormat: "ascii-text",
    sourceFormatLabel: "ASCII text tablature",
  };
}

export function buildMusicXmlReaderDocuments(
  sourceText,
  {
    sourceFormat = "musicxml",
    sourceFormatLabel = "MusicXML tablature",
  } = {}
) {
  const semanticDocument = parseMusicXmlTablature(sourceText);
  const desktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

  return {
    desktopBlocks,
    desktopSource: "semantic",
    semanticDocument,
    semanticError: null,
    requestedInstrument: "guitar",
    resolvedInstrument: "guitar",
    instrumentWasDetected: false,
    supportOutcome: "supported",
    sourceFormat,
    sourceFormatLabel,
  };
}

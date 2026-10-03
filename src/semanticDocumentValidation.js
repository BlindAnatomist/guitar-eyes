import { verifiedStandardInstrument } from "./semanticEvidence";

export class SemanticValidationError extends Error {
  constructor(detail) {
    super(`The tablature contains incomplete or contradictory musical evidence: ${detail}. The file was not loaded.`);
    this.name = "SemanticValidationError";
    this.code = "INVALID_SEMANTIC_DOCUMENT";
  }
}
function requireTruth(condition, detail) {
  if (!condition) throw new SemanticValidationError(detail);
}
function positive(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function validateDuration(duration) {
  if (duration == null) return; // Untimed ASCII is an accepted profile.
  const units = duration.quarterNoteUnits;
  const names = { 1: "whole note", 2: "half note", 4: "quarter note", 8: "eighth note", 16: "sixteenth note", 32: "thirty-second note", 64: "sixty-fourth note" };
  requireTruth(positive(units), "duration must have positive numeric evidence");
  if (duration.quarterNoteFraction) {
    const { numerator, denominator } = duration.quarterNoteFraction;
    requireTruth(Number.isSafeInteger(numerator) && Number.isSafeInteger(denominator) &&
      numerator > 0 && denominator > 0 && numerator / denominator === units, "duration fraction disagrees with elapsed duration");
  }
  if (duration.denominator != null) {
    const dots = duration.dots ?? 0;
    const actual = duration.tupletNumerator ?? -1;
    const normal = duration.tupletDenominator ?? -1;
    requireTruth([1, 2, 4, 8, 16, 32, 64].includes(duration.denominator) &&
      Number.isInteger(dots) && dots >= 0 && dots <= 2, "unsupported notated duration");
    const noTuplet = actual === -1 && normal === -1;
    requireTruth(noTuplet || (Number.isSafeInteger(actual) && Number.isSafeInteger(normal) && actual > 0 && normal > 0), "incomplete tuplet ratio");
    const baseName = names[duration.denominator];
    const dottedName = dots === 0 ? baseName : dots === 1 ? `dotted ${baseName}` : `double-dotted ${baseName}`;
    const plainRatio = noTuplet || (actual === 1 && normal === 1);
    requireTruth(duration.name === (plainRatio ? dottedName : `${dottedName} tuplet, ${actual} in the time of ${normal}`), "duration wording disagrees with notation");
    const expected = (4 / duration.denominator) * (2 - 2 ** -dots) * (noTuplet ? 1 : normal / actual);
    requireTruth(Math.abs(expected - units) <= Number.EPSILON * Math.max(1, units) * 4, "notated duration and supported ratio disagree with elapsed duration");
  }
  if (duration.symbol != null) {
    const symbolUnits = { W: 4, H: 2, Q: 1, E: 0.5, S: 0.25 };
    requireTruth(symbolUnits[duration.symbol] === units && names[4 / units] === duration.name, "ASCII duration wording or value contradicts rhythm");
  }
  if (duration.source === "musicxml") {
    requireTruth(["ordinary", "elapsed-only"].includes(duration.relationship), "duration relationship was not established");
    const elapsed = duration.elapsed;
    requireTruth(elapsed && Number.isSafeInteger(elapsed.durationDivisions) && elapsed.durationDivisions > 0 &&
      Number.isSafeInteger(elapsed.divisionsPerQuarter) && elapsed.divisionsPerQuarter > 0 &&
      elapsed.durationDivisions / elapsed.divisionsPerQuarter === units && elapsed.quarterNoteUnits === units &&
      duration.durationDivisions === elapsed.durationDivisions && duration.divisionsPerQuarter === elapsed.divisionsPerQuarter,
    "elapsed duration evidence is inconsistent");
    if (duration.relationship === "ordinary") {
      const notation = duration.notated;
      const typeUnits = { whole: 4, half: 2, quarter: 1, eighth: 0.5, "16th": 0.25, "32nd": 0.125 };
      requireTruth(notation && Number.isInteger(notation.dots) && notation.dots >= 0 && notation.dots <= 2 &&
        typeUnits[notation.type] * (2 - 2 ** -notation.dots) === units && notation.quarterNoteUnits === units,
      "notated duration contradicts elapsed duration");
      const denominators = { whole: 1, half: 2, quarter: 4, eighth: 8, "16th": 16, "32nd": 32 };
      const prefix = notation.dots === 1 ? "dotted " : notation.dots === 2 ? "2-dot " : "";
      requireTruth(duration.name === prefix + names[denominators[notation.type]], "duration wording disagrees with notation");
    } else requireTruth(duration.notated === null && duration.name === `${units} quarter-note units`, "elapsed-only duration claims notation");
  }
}

// Importers historically keep equivalent nested copies without global numbering.
// Check every copy before joining it to the document's canonical navigation view.
const POSITION_GLOBAL_FIELDS = new Set(["index", "number", "total"]);
const MEASURE_GLOBAL_FIELDS = new Set(["documentNumber", "documentTotal"]);
function equalEvidence(left, right) {
  if (Object.is(left, right)) return true;
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) =>
    Object.prototype.hasOwnProperty.call(right, key) && equalEvidence(left[key], right[key]));
}
function matchingCopy(copy, canonical, permittedMissing = new Set(), ignored = new Set()) {
  if (!copy || !canonical || typeof copy !== "object") return false;
  const keys = new Set([...Object.keys(copy), ...Object.keys(canonical)]);
  return [...keys].every((key) => {
    if (ignored.has(key)) return true;
    if (!Object.prototype.hasOwnProperty.call(copy, key)) return permittedMissing.has(key);
    return Object.prototype.hasOwnProperty.call(canonical, key) && equalEvidence(copy[key], canonical[key]);
  });
}
function validateNavigationCollections(document) {
  let positionOffset = 0;
  let measureOffset = 0;
  const measureIds = new Set();
  const positionIds = new Set();
  requireTruth(document.measures === undefined || Array.isArray(document.measures), "invalid document measures");
  const documentMeasures = document.measures || [];
  document.blocks.forEach((block, blockIndex) => {
    requireTruth(block.index === blockIndex && block.number === blockIndex + 1, "block navigation identity is inconsistent");
    requireTruth(Array.isArray(block.positions) && block.positions.length > 0, "block positions are missing");
    const blockPositions = block.positions.map((position, blockPositionIndex) => {
      const canonical = document.positions[positionOffset];
      requireTruth(canonical && canonical.blockIndex === blockIndex &&
        canonical.index === positionOffset && canonical.number === positionOffset + 1 &&
        canonical.total === document.positions.length && canonical.blockNumber === blockIndex + 1 &&
        canonical.positionInBlock === blockPositionIndex + 1 && canonical.positionsInBlock === block.positions.length,
      "document position navigation identity is inconsistent");
      if (canonical.id !== undefined) {
        requireTruth(typeof canonical.id === "string" && canonical.id.length > 0 && !positionIds.has(canonical.id),
          "missing or duplicate position identity");
        positionIds.add(canonical.id);
      }
      requireTruth(matchingCopy(position, canonical, POSITION_GLOBAL_FIELDS), "block and document position evidence disagree");
      positionOffset += 1;
      return canonical;
    });
    requireTruth(block.measures === undefined || Array.isArray(block.measures), "invalid block measures");
    const measures = block.measures || [];
    requireTruth(measures.length > 0 || blockPositions.every((position) =>
      position.measureNumber == null && position.positionInMeasure == null &&
      position.positionsInMeasure == null && position.measureCountInBlock == null),
    "position declares a measure absent from its block");
    let blockPositionOffset = 0;
    measures.forEach((measure, measureIndex) => {
      const canonical = documentMeasures[measureOffset];
      requireTruth(canonical && typeof canonical.id === "string" && canonical.id.length > 0 &&
        !measureIds.has(canonical.id), "missing or duplicate measure identity");
      measureIds.add(canonical.id);
      requireTruth(canonical.blockIndex === blockIndex && canonical.blockNumber === blockIndex + 1 &&
        canonical.number === measureIndex + 1 && canonical.totalInBlock === measures.length &&
        canonical.documentNumber === measureOffset + 1 && canonical.documentTotal === documentMeasures.length,
      "measure navigation identity is inconsistent");
      requireTruth(matchingCopy(measure, canonical, MEASURE_GLOBAL_FIELDS, new Set(["positions"])),
        "block and document measure evidence disagree");
      requireTruth(Array.isArray(measure.positions) && Array.isArray(canonical.positions) &&
        measure.positions.length === canonical.positions.length, "measure positions are missing or inconsistent");
      canonical.positions.forEach((position, index) => {
        const documentPosition = blockPositions[blockPositionOffset];
        requireTruth(documentPosition && documentPosition.measureNumber === measureIndex + 1 &&
          documentPosition.positionInMeasure === index + 1 &&
          documentPosition.positionsInMeasure === canonical.positions.length &&
          documentPosition.measureCountInBlock === measures.length,
        "measure position membership or order is inconsistent");
        requireTruth(matchingCopy(position, documentPosition, POSITION_GLOBAL_FIELDS) &&
          matchingCopy(measure.positions[index], documentPosition, POSITION_GLOBAL_FIELDS),
        "measure and document position evidence disagree");
        blockPositionOffset += 1;
      });
      measureOffset += 1;
    });
    requireTruth(measures.length === 0 || blockPositionOffset === blockPositions.length,
      "measures do not cover their block positions");
  });
  requireTruth(positionOffset === document.positions.length, "blocks do not cover document positions");
  requireTruth(measureOffset === documentMeasures.length, "blocks do not cover document measures");
}

function nonemptyText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Optional document-local references, not durable identity across imports.
// Run only after canonical navigation membership has been checked.
function validateSemanticLosses(document) {
  if (document.semanticLosses === undefined) return;
  requireTruth(Array.isArray(document.semanticLosses), "invalid semantic loss declarations");
  if (document.semanticLosses.length === 0) return;
  const positions = new Map(document.positions.filter((position) => position.id !== undefined)
    .map((position) => [position.id, position]));
  const measures = new Map((document.measures || []).map((measure) => [measure.id, measure]));
  const positionMeasures = new Map();
  measures.forEach((measure) => measure.positions.forEach((position) => {
    if (position.id !== undefined) positionMeasures.set(position.id, measure);
  }));

  document.semanticLosses.forEach((loss) => {
    requireTruth(loss && typeof loss.kind === "string" && typeof loss.sourceFormat === "string" &&
      typeof loss.disposition === "string", "incomplete semantic loss record");
    const location = loss.location;
    if (location === undefined) return; // Compatibility for records not yet migrated.
    requireTruth(location && typeof location === "object" && !Array.isArray(location),
      "invalid semantic loss location");
    const fields = {
      position: ["scope", "positionId"],
      measure: ["scope", "measureId"],
      unlocalized: ["scope", "reason"],
    };
    const keys = Object.keys(location);
    const expected = Object.prototype.hasOwnProperty.call(fields, location.scope) ? fields[location.scope] : null;
    requireTruth(expected && keys.length === expected.length && expected.every((key) => keys.includes(key)),
      "invalid semantic loss location shape");
    if (location.scope === "unlocalized") {
      requireTruth(nonemptyText(location.reason), "unlocalized semantic loss needs a reason");
      return; // Preserve uncertain evidence; never infer a target from source labels.
    }
    const position = location.scope === "position" ? positions.get(location.positionId) : null;
    const measure = location.scope === "measure" ? measures.get(location.measureId) : positionMeasures.get(location.positionId);
    requireTruth(location.scope === "position"
      ? nonemptyText(location.positionId) && position
      : nonemptyText(location.measureId) && measure, "dangling semantic loss reference");

    // This first adopter already retains the source facts needed to prove attachment.
    // Other importers keep their established loss policy and are not migrated here.
    if (loss.sourceFormat !== "musicxml" || !["unsupported-technical", "source-order-only"].includes(loss.kind)) return;
    requireTruth(document.sourceFormat === "musicxml" && Number.isSafeInteger(loss.sourceMeasureIndex) &&
      loss.sourceMeasureIndex >= 0 && measure && document.measures?.[loss.sourceMeasureIndex] === measure &&
      measure.sourceNumber === loss.measureNumber, "semantic loss source measure contradicts its reference");
    if (loss.kind === "source-order-only") {
      requireTruth(location.scope === "measure", "source-order semantic loss must reference a measure");
    } else {
      requireTruth(location.scope === "position" && !position.isRest &&
        position.sourceMeasureNumber === loss.measureNumber &&
        Number.isSafeInteger(loss.noteIndex) && loss.noteIndex >= 0 && position.strings.some((state) =>
          state.source?.format === "musicxml" && state.source.measureNumber === loss.measureNumber &&
          state.source.noteIndex === loss.noteIndex), "semantic loss source note contradicts its reference");
    }
  });
}

// A pure admission step: contradictory copies reject, and only equivalent
// collections are joined. Existing musical values and source evidence are kept.
export function finalizeSemanticDocument(document) {
  validateSemanticDocument(document);
  let positionOffset = 0;
  let measureOffset = 0;
  const blocks = document.blocks.map((block) => {
    const positions = document.positions.slice(positionOffset, positionOffset + block.positions.length);
    positionOffset += positions.length;
    let blockPositionOffset = 0;
    const measures = (block.measures || []).map((measure) => {
      const canonical = document.measures[measureOffset++];
      const measurePositions = positions.slice(blockPositionOffset, blockPositionOffset + measure.positions.length);
      blockPositionOffset += measurePositions.length;
      return { ...canonical, positions: measurePositions };
    });
    return { ...block, positions, ...(block.measures !== undefined ? { measures } : {}) };
  });
  return {
    ...document,
    blocks,
    ...(document.measures !== undefined ? { measures: blocks.flatMap((block) => block.measures || []) } : {}),
  };
}

// Staged boundary: inherited adapters still establish format/profile admission.
// This validates their common output without reconstructing source or changing it.
export function validateSemanticDocument(document) {
  requireTruth(document?.type === "tablature-document" &&
    (document.schemaVersion === undefined || document.schemaVersion === 1), "invalid document identity");
  const counts = { guitar: [6, 7, 8], bass: [4, 5, 6] };
  requireTruth(counts[document.instrument]?.includes(document.stringCount), "unverified instrument family or string count");
  requireTruth(Array.isArray(document.blocks) && document.blocks.length > 0 &&
    Array.isArray(document.positions) && document.positions.length > 0 &&
    Array.isArray(document.strings), "missing musical collections");
  requireTruth(Array.isArray(document.warnings) && document.warnings.every((warning) => typeof warning === "string"), "invalid warning declarations");
  const allIds = new Set();
  const stringEvidence = new Map();
  document.blocks.forEach((block) => {
    requireTruth(Array.isArray(block.strings) && block.strings.length === document.stringCount, "block string count disagrees with tuning");
    block.strings.forEach((string) => {
      requireTruth(typeof string.id === "string" && !allIds.has(string.id), "missing or duplicate string identity");
      allIds.add(string.id);
      stringEvidence.set(string.id, string);
      requireTruth(typeof string.tuning === "string" && /^[A-G](?:#|b)?$/.test(string.tuning), "missing string tuning");
      if (string.octave != null) requireTruth(Number.isSafeInteger(string.octave), "invalid tuning octave");
      if (Object.prototype.hasOwnProperty.call(string, "tuningMidi")) {
        requireTruth(Number.isSafeInteger(string.tuningMidi) && string.tuningMidi >= 0 && string.tuningMidi <= 127, "invalid MIDI tuning evidence");
        const pitchClasses = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };
        requireTruth(Number.isSafeInteger(string.octave) &&
          (string.octave + 1) * 12 + pitchClasses[string.tuning] === string.tuningMidi,
        "MIDI tuning disagrees with pitch and octave");
      }
    });
    if (["guitar-pro", "guitar-pro-archive"].includes(document.sourceFormat)) {
      requireTruth(verifiedStandardInstrument(block.strings.map((string) => string.tuningMidi)) === document.instrument, "instrument identity exceeds verified tuning evidence");
    }
  });
  requireTruth(document.strings.length === allIds.size && document.strings.every((string) => allIds.has(string.id)), "document and block strings disagree");
  document.strings.forEach((string) => {
    const blockString = stringEvidence.get(string.id);
    requireTruth(["tuning", "octave", "tuningMidi", "spokenName"].every((key) => string[key] === blockString[key]), "document and block string evidence disagree");
  });
  document.positions.forEach((position) => {
    const block = document.blocks[position.blockIndex ?? 0];
    requireTruth(block && Array.isArray(position.strings) && position.strings.length === block.strings.length, "position lacks string states");
    position.strings.forEach((state, index) => {
      requireTruth(state.stringId === block.strings[index].id, "position string identity or order is inconsistent");
      requireTruth(["silent", "open", "fret", "technique", "continuation", "unsupported"].includes(state.type), "unknown string state");
      if (state.type === "continuation") requireTruth(Number.isSafeInteger(state.fret) && state.fret >= 0, "continuation fret is missing or invalid");
      if (state.type === "fret") requireTruth(Number.isSafeInteger(state.fret) && state.fret > 0, "fret is missing or invalid");
      if (state.type === "open" && Object.prototype.hasOwnProperty.call(state, "fret")) requireTruth(state.fret === 0, "open-string evidence contradicts fret");
      if (position.isRest) requireTruth(!["fret", "open", "technique"].includes(state.type), "rest contains a playing instruction");
    });
    validateDuration(position.duration);
    if (document.sourceFormat && document.sourceFormat !== "ascii-text") requireTruth(position.duration != null, "structured position lacks duration");
  });
  validateNavigationCollections(document);
  validateSemanticLosses(document);
  return document;
}

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
  if (document.semanticLosses !== undefined) {
    requireTruth(Array.isArray(document.semanticLosses), "invalid semantic loss declarations");
    document.semanticLosses.forEach((loss) => requireTruth(loss && typeof loss.kind === "string" &&
      typeof loss.sourceFormat === "string" && typeof loss.disposition === "string", "incomplete semantic loss record"));
  }
  return document;
}

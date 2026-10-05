import { validateSemanticDocument } from "./semanticDocumentValidation";
import { describePlayablePosition } from "./positionDescription";
import { reviewedTeacherLessonKind } from "./teacherExample";

export const TEACHER_LIMITS = Object.freeze({ measures: 256, positions: 4096 });
const PITCH_CLASS = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const unavailable = (reason) => ({ status: "unavailable", reason });

export function teacherEvidence(document, measure, position) {
  return { document, measure, position, index: position.index };
}

export function resolveTeacherEvidence(document, reference) {
  if (!reference || reference.document !== document ||
      document.positions?.[reference.index] !== reference.position ||
      reference.position?.index !== reference.index ||
      !document.measures?.includes(reference.measure) ||
      !reference.measure.positions.includes(reference.position)) return null;
  return reference.index;
}

function durationKey(duration) {
  if (duration?.source === "musicxml" && duration.relationship === "ordinary") {
    return [duration.quarterNoteUnits, duration.notated.type, duration.notated.dots];
  }
  // No guessed rhythm or use of historical playback calculations.
  return null;
}

// Pure bounded query. These are relationships among supported canonical facts,
// not a completeness certificate for the source. createTeacherLesson adds that gate.
function analyzeTeacherMeasures(document) {
  if (!Array.isArray(document?.measures) || !Array.isArray(document?.positions) ||
      document.measures.length > TEACHER_LIMITS.measures || document.positions.length > TEACHER_LIMITS.positions) {
    return unavailable("The prototype compares at most 256 explicit measures and 4,096 positions.");
  }
  try { validateSemanticDocument(document); } catch {
    return unavailable("The musical document has incomplete or contradictory evidence.");
  }
  if (document.instrument !== "guitar" || document.stringCount !== 6 || document.sourceFormat !== "musicxml") {
    return unavailable("This prototype requires the reviewed six-string MusicXML guitar profile.");
  }
  if (document.measures.length < 2 || document.blocks.some((block) => !block.measures?.length)) {
    return unavailable("This lesson needs at least two explicit measures to compare.");
  }
  if (document.warnings.length || document.semanticLosses?.length) {
    return unavailable("Preserved notation or source-order limitations prevent this comparison. The prototype requires a technique-free, repeat-free source.");
  }
  const facts = [];
  for (const measure of document.measures) {
    const block = document.blocks[measure.blockIndex];
    const tuning = block.strings.map((string) => Number.isSafeInteger(string.octave)
      ? (string.octave + 1) * 12 + PITCH_CLASS[string.tuning] : null);
    if (tuning.some((pitch) => pitch === null || !Number.isSafeInteger(pitch)) || measure.durationComplete !== true) {
      return unavailable("Every measure needs known tuning, octaves and complete rhythm evidence.");
    }
    if (tuning.join(",") !== "64,59,55,50,45,40") {
      return unavailable("Only the reviewed standard guitar tuning is eligible for this prototype.");
    }
    const positions = [];
    for (const position of measure.positions) {
      if (document.positions[position.index] !== position) {
        return unavailable("Measure references are not joined to the canonical reader positions.");
      }
      const duration = durationKey(position.duration);
      if (!duration || (position.techniques !== undefined && (!Array.isArray(position.techniques) || position.techniques.length))) {
        return unavailable("Only ordinary known rhythms without techniques or ties can be compared in this prototype.");
      }
      if (position.strings.some((state) => !["silent", "open", "fret"].includes(state.type) ||
          (state.techniques !== undefined && (!Array.isArray(state.techniques) || state.techniques.length)))) {
        return unavailable("Techniques, ties, continuations or unsupported notes cannot be compared in this prototype.");
      }
      const notes = position.strings.flatMap((state, index) => state.type === "silent" ? [] : [[index + 1, state.type === "open" ? 0 : state.fret]]);
      if (typeof position.isRest !== "boolean" || (!position.isRest && notes.length === 0) || (position.isRest && notes.length)) {
        return unavailable("A position lacks a proved rest or simultaneous-note grouping.");
      }
      positions.push(JSON.stringify([Boolean(position.isRest), notes, duration]));
    }
    const total = measure.positions.reduce((sum, position) => sum + position.duration.quarterNoteUnits, 0);
    if (total !== measure.totalQuarterNoteUnits) return unavailable("A measure's duration total is inconsistent.");
    const context = [document.instrument, document.stringCount, tuning];
    facts.push({
      measure,
      references: measure.positions.map((position) => teacherEvidence(document, measure, position)),
      key: JSON.stringify([context, positions]),
      openingKey: positions.length > 1 ? JSON.stringify([context, positions.slice(0, -1)]) : null,
    });
  }
  // Hash grouping + one prefix pass. No unrestricted all-pairs score alignment.
  const groups = new Map();
  facts.forEach((fact) => {
    if (!groups.has(fact.key)) groups.set(fact.key, []);
    groups.get(fact.key).push(fact);
  });
  const repeatedGroups = [...groups.values()].filter((group) => group.length > 1);
  return { status: "available", facts, repeatedGroups };
}

// Recurrence is useful on its own. It does not require or invent a changed ending.
export function findTeacherRecurrence(document) {
  const analysis = analyzeTeacherMeasures(document);
  if (analysis.status !== "available") return analysis;
  if (!analysis.repeatedGroups.length) {
    return unavailable("No exact repeated measure was found in this bounded comparison.");
  }
  return { status: "available", repeatedGroups: analysis.repeatedGroups, recurrence: analysis.repeatedGroups[0] };
}

export function compareTeacherMeasures(document) {
  const analysis = analyzeTeacherMeasures(document);
  if (analysis.status !== "available") return analysis;
  const { facts, repeatedGroups } = analysis;
  const repeatedOpenings = new Map();
  repeatedGroups.forEach((group) => {
    if (group[0].openingKey && !repeatedOpenings.has(group[0].openingKey)) repeatedOpenings.set(group[0].openingKey, group);
  });
  for (const fact of facts) {
    const group = repeatedOpenings.get(fact.openingKey);
    if (group && group[0].key !== fact.key) {
      return { status: "available", repeatedGroups, recurrence: group, variation: fact, changedPosition: fact.references.length - 1 };
    }
  }
  return unavailable("No exact repeated measure with a shared opening and just one changed final position was found in this bounded comparison.");
}

function measureList(facts) {
  const numbers = facts.map((fact) => fact.measure.documentNumber);
  return numbers.length < 2 ? String(numbers[0]) : `${numbers.slice(0, -1).join(", ")} and ${numbers[numbers.length - 1]}`;
}

function measurePhrase(facts) {
  return `${facts.length === 1 ? "measure" : "measures"} ${measureList(facts)}`;
}

// Selection is explicit, unique and in written order, even when the variant
// precedes the repeated group or an unrelated measure falls between occurrences.
export function teacherPracticeSelection(comparison) {
  if (comparison?.status !== "available" || !comparison.recurrence?.length) return [];
  return [...new Set([...comparison.recurrence, ...(comparison.variation ? [comparison.variation] : [])])]
    .sort((a, b) => a.measure.documentNumber - b.measure.documentNumber);
}

const evidence = (id, label, references) => ({ id, label, references });
const recurrenceControls = (recurrence) => recurrence.map((fact, index) => evidence(
  index === 0 ? "first" : index === 1 ? "recurrence" : `recurrence-${fact.measure.documentNumber}`,
  `Inspect ${index === 0 ? "first pattern" : "recurrence"}: measure ${fact.measure.documentNumber}`,
  fact.references,
));

function createRepetitionLesson(document, comparison) {
  const { recurrence } = comparison;
  const first = recurrence[0];
  const repeatedNumbers = measureList(recurrence);
  return {
    status: "available", kind: "repetition", document,
    title: "Recognize exact repetition",
    overview: `This original example contains ${document.measures.length} explicit measures. This lesson covers measures ${repeatedNumbers}. A measure is a written unit, not an inferred phrase.`,
    claims: [{ text: `Measures ${repeatedNumbers} have the same imported string-and-fret positions, simultaneous notes, rests and notated durations.`, references: recurrence.flatMap((fact) => fact.references) }],
    reusableText: "The whole measure can be reused at each listed occurrence, including its simultaneous notes, rest and rhythm. This lesson identifies an exact recurrence; it does not infer phrases or assess your playing.",
    evidence: recurrenceControls(recurrence),
    selectedMeasures: teacherPracticeSelection(comparison).map((fact) => fact.measure.documentNumber),
    practice: [
      `Study measure ${first.measure.documentNumber} with Inspect first pattern and the existing reader. Keep the whole measure together as one practice unit.`,
      `Compare ${measurePhrase(recurrence.slice(1))} with measure ${first.measure.documentNumber} using each recurrence control. Reuse the same measure-length pattern where the imported facts match.`,
      `Try the selected measures in written order: ${repeatedNumbers}. This suggestion covers only those measures; choose your own pace and repetitions.`,
    ],
  };
}

export function createTeacherLesson(document) {
  const kind = reviewedTeacherLessonKind(document);
  if (!kind) {
    return unavailable("Teaching is available only for the reviewed original examples, including unchanged uploads of them. Other files may omit notation the reader cannot yet interpret; no warnings does not prove they are safe to compare.");
  }
  const comparison = kind === "repetition" ? findTeacherRecurrence(document) : compareTeacherMeasures(document);
  if (comparison.status !== "available") return comparison;
  if (kind === "repetition") return createRepetitionLesson(document, comparison);
  const { recurrence, variation, changedPosition } = comparison;
  const first = recurrence[0];
  const repeatedNumbers = measureList(recurrence);
  const selected = teacherPracticeSelection(comparison);
  const selectedNumbers = measureList(selected);
  const variantNumber = variation.measure.documentNumber;
  const originalEnding = first.references[changedPosition];
  const changedEnding = variation.references[changedPosition];
  return {
    status: "available", kind: "changed-ending", document,
    title: "Pattern and changed ending",
    overview: `This original example contains ${document.measures.length} explicit measures. This lesson covers measures ${selectedNumbers}. A measure is a written unit, not an inferred phrase.`,
    claims: [
      { text: `Measures ${repeatedNumbers} have the same imported string-and-fret positions, simultaneous notes, rests and notated durations.`, references: recurrence.flatMap((fact) => fact.references) },
      { text: `Measure ${variantNumber} shares the first ${changedPosition} positions with measure ${first.measure.documentNumber}, then changes position ${changedPosition + 1}, the final position.`, references: [...first.references, ...variation.references] },
    ],
    openingIntroduction: `Learn these positions once for measures ${selectedNumbers}. Notes within one position are played together.`,
    opening: first.references.slice(0, changedPosition).map((reference) => ({
      text: describePlayablePosition(document, reference.index), references: [reference],
    })),
    endings: [originalEnding, changedEnding].map((reference) => ({
      text: describePlayablePosition(document, reference.index), references: [reference],
    })),
    evidence: [
      ...recurrenceControls(recurrence),
      evidence("original-ending", `Inspect original ending: measure ${first.measure.documentNumber}, position ${changedPosition + 1}`, [originalEnding]),
      evidence("changed-ending", `Inspect changed ending: measure ${variantNumber}, position ${changedPosition + 1}`, [changedEnding]),
      evidence("variant", `Inspect shared opening with changed ending: measure ${variantNumber}`, variation.references),
    ],
    selectedMeasures: selected.map((fact) => fact.measure.documentNumber),
    practice: [
      `Learn measure ${first.measure.documentNumber} once, then check its recurrence in ${measurePhrase(recurrence.slice(1))}.`,
      `Isolate the final position in measures ${first.measure.documentNumber} and ${variantNumber}. Compare the two endings using the reader.`,
      `Join the shared first ${changedPosition} positions to each ending, then try the selected measures in written order: ${selectedNumbers}. This suggestion covers only those measures.`,
    ],
  };
}

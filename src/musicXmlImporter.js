const STANDARD_GUITAR_TUNING = ["E", "B", "G", "D", "A", "E"];

const PITCH_CLASS = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const NOTE_TYPE_NAMES = {
  whole: "whole note",
  half: "half note",
  quarter: "quarter note",
  eighth: "eighth note",
  "16th": "sixteenth note",
  "32nd": "thirty-second note",
};

const TECHNIQUE_NAMES = {
  "hammer-on": "hammer-on",
  "pull-off": "pull-off",
  slide: "slide",
  bend: "bend",
  tap: "tap",
  harmonic: "harmonic",
  "open-string": "open-string",
  fingernails: "fingernails",
  pluck: "pluck",
};

export class MusicXmlImportError extends Error {
  constructor(message, code = "MUSICXML_IMPORT_ERROR") {
    super(message);
    this.name = "MusicXmlImportError";
    this.code = code;
  }
}

function localName(node) {
  return node?.localName || node?.nodeName?.split(":").at(-1) || "";
}

function childElements(node, name = null) {
  return Array.from(node?.children || []).filter(
    (child) => name === null || localName(child) === name
  );
}

function firstChild(node, name) {
  return childElements(node, name)[0] || null;
}

function descendants(node, name) {
  return Array.from(node?.getElementsByTagName("*") || []).filter(
    (candidate) => localName(candidate) === name
  );
}

function firstDescendant(node, name) {
  return descendants(node, name)[0] || null;
}

function textOf(node) {
  return String(node?.textContent || "").trim();
}

function integerText(node, label, { minimum = null } = {}) {
  const raw = textOf(node);
  if (!/^-?\d+$/.test(raw)) {
    throw new MusicXmlImportError(
      `${label} must be an integer in the MusicXML source.`,
      "INVALID_MUSICXML_NUMBER"
    );
  }

  const value = Number.parseInt(raw, 10);
  if (minimum !== null && value < minimum) {
    throw new MusicXmlImportError(
      `${label} must be at least ${minimum}.`,
      "INVALID_MUSICXML_NUMBER"
    );
  }
  return value;
}

function parseXml(sourceText) {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    throw new MusicXmlImportError("The MusicXML file is empty.", "EMPTY_MUSICXML");
  }

  if (/<!ENTITY\s/i.test(sourceText)) {
    throw new MusicXmlImportError(
      "MusicXML files containing custom entity declarations are not accepted.",
      "UNSAFE_MUSICXML_ENTITY"
    );
  }

  if (typeof DOMParser !== "function") {
    throw new MusicXmlImportError(
      "This browser cannot parse MusicXML.",
      "MUSICXML_DOM_UNAVAILABLE"
    );
  }

  const document = new DOMParser().parseFromString(sourceText, "application/xml");
  const parserError = descendants(document, "parsererror")[0];
  if (parserError) {
    throw new MusicXmlImportError(
      "The selected XML is malformed and could not be parsed.",
      "MALFORMED_MUSICXML"
    );
  }

  const root = document.documentElement;
  if (localName(root) !== "score-partwise") {
    throw new MusicXmlImportError(
      "This checkpoint supports MusicXML score-partwise documents only.",
      "UNSUPPORTED_MUSICXML_ROOT"
    );
  }

  return { xmlDocument: document, root };
}

function technicalCoordinates(note) {
  const technicalElements = descendants(note, "technical");
  const candidates = technicalElements
    .map((technical) => ({
      technical,
      stringNode: firstDescendant(technical, "string"),
      fretNode: firstDescendant(technical, "fret"),
    }))
    .filter((candidate) => candidate.stringNode && candidate.fretNode);

  if (candidates.length === 0) return null;
  if (candidates.length > 1) {
    throw new MusicXmlImportError(
      "A MusicXML note contains more than one string-and-fret coordinate pair.",
      "AMBIGUOUS_MUSICXML_COORDINATES"
    );
  }

  const candidate = candidates[0];
  return {
    technical: candidate.technical,
    stringNumber: integerText(candidate.stringNode, "MusicXML string number", {
      minimum: 1,
    }),
    fret: integerText(candidate.fretNode, "MusicXML fret number", { minimum: 0 }),
  };
}

function partHasTabCoordinates(part) {
  return descendants(part, "note").some((note) => technicalCoordinates(note));
}

function partNameFor(root, partId) {
  const scorePart = descendants(root, "score-part").find(
    (candidate) => candidate.getAttribute("id") === partId
  );
  return textOf(firstChild(scorePart, "part-name")) || "MusicXML guitar";
}

function chooseTabPart(root) {
  const candidates = childElements(root, "part").filter(partHasTabCoordinates);

  if (candidates.length === 0) {
    throw new MusicXmlImportError(
      "No MusicXML part contains explicit tablature string and fret data.",
      "NO_MUSICXML_TABLATURE_PART"
    );
  }

  if (candidates.length > 1) {
    throw new MusicXmlImportError(
      "More than one MusicXML part contains tablature coordinates. Choose or export one tablature part before importing.",
      "AMBIGUOUS_MUSICXML_TABLATURE_PART"
    );
  }

  return candidates[0];
}

function accidentalFromAlter(alter) {
  if (alter === 0) return "";
  if (alter === 1) return "#";
  if (alter === -1) return "b";
  throw new MusicXmlImportError(
    "This checkpoint supports natural, sharp, and flat MusicXML staff tuning only.",
    "UNSUPPORTED_MUSICXML_TUNING_ALTER"
  );
}

function parseStaffTuning(part) {
  const staffDetailsCandidates = descendants(part, "staff-details").filter((details) => {
    const staffLines = firstChild(details, "staff-lines");
    const tunings = childElements(details, "staff-tuning");
    return textOf(staffLines) === "6" && tunings.length === 6;
  });

  if (staffDetailsCandidates.length === 0) {
    throw new MusicXmlImportError(
      "MusicXML guitar tablature must provide six staff-tuning entries and staff-lines 6.",
      "MISSING_MUSICXML_GUITAR_TUNING"
    );
  }

  const details = staffDetailsCandidates[0];
  const byStaffLine = new Map();

  childElements(details, "staff-tuning").forEach((tuning) => {
    const line = Number.parseInt(tuning.getAttribute("line") || "", 10);
    if (!Number.isInteger(line) || line < 1 || line > 6 || byStaffLine.has(line)) {
      throw new MusicXmlImportError(
        "MusicXML staff-tuning lines must uniquely cover lines 1 through 6.",
        "INVALID_MUSICXML_STAFF_TUNING_LINES"
      );
    }

    const step = textOf(firstChild(tuning, "tuning-step")).toUpperCase();
    if (!/^[A-G]$/.test(step)) {
      throw new MusicXmlImportError(
        "Each MusicXML staff tuning requires an A through G tuning-step.",
        "INVALID_MUSICXML_TUNING_STEP"
      );
    }

    const alterNode = firstChild(tuning, "tuning-alter");
    const alter = alterNode ? integerText(alterNode, "MusicXML tuning alter") : 0;
    const octave = integerText(
      firstChild(tuning, "tuning-octave"),
      "MusicXML tuning octave"
    );

    byStaffLine.set(line, {
      tuning: `${step}${accidentalFromAlter(alter)}`,
      octave,
      staffLine: line,
    });
  });

  const semanticOrder = Array.from({ length: 6 }, (_, index) => {
    const staffLine = 6 - index;
    const tuning = byStaffLine.get(staffLine);
    if (!tuning) {
      throw new MusicXmlImportError(
        "MusicXML staff-tuning lines must cover every line from 1 through 6.",
        "INVALID_MUSICXML_STAFF_TUNING_LINES"
      );
    }
    return tuning;
  });

  const pitchValues = semanticOrder.map(({ tuning, octave }) => {
    const pitchClass = PITCH_CLASS[tuning];
    if (pitchClass === undefined) {
      throw new MusicXmlImportError(
        `Unsupported MusicXML tuning pitch ${tuning}.`,
        "UNSUPPORTED_MUSICXML_TUNING_PITCH"
      );
    }
    return (octave + 1) * 12 + pitchClass;
  });

  if (
    !pitchValues.every(
      (value, index) => index === 0 || pitchValues[index - 1] > value
    )
  ) {
    throw new MusicXmlImportError(
      "MusicXML staff tuning does not descend safely from the highest string to the lowest string.",
      "UNSAFE_MUSICXML_TUNING_ORDER"
    );
  }

  return semanticOrder;
}

function pitchForSpeech(pitch, octave) {
  let spoken = pitch;
  if (pitch.endsWith("#")) spoken = `${pitch[0]} sharp`;
  if (pitch.endsWith("b")) spoken = `${pitch[0]} flat`;
  return `${spoken} ${octave}`;
}

function makeStringIdentity(index, tuning, octave) {
  const isStandard = tuning === STANDARD_GUITAR_TUNING[index];

  if (isStandard && index === 0) {
    return { shortName: "high E", spokenName: "High E string" };
  }
  if (isStandard && index === 5) {
    return { shortName: "low E", spokenName: "Low E string" };
  }
  if (isStandard) {
    return { shortName: tuning, spokenName: `${tuning} string` };
  }
  return {
    shortName: `string ${index + 1}`,
    spokenName: `String ${index + 1}, tuned ${pitchForSpeech(tuning, octave)}`,
  };
}

function makeStrings(tuning) {
  return tuning.map((entry, index) => ({
    id: `block-1-string-${index + 1}`,
    index,
    blockIndex: 0,
    tuning: entry.tuning,
    octave: entry.octave,
    rawLabel: `${entry.tuning}${entry.octave}`,
    sourceLine: "",
    sourceLineNumber: null,
    content: "",
    tokens: [],
    sourceStaffLine: entry.staffLine,
    sourceFormat: "musicxml",
    ...makeStringIdentity(index, entry.tuning, entry.octave),
  }));
}

function durationName(note, quarterNoteUnits) {
  const noteType = textOf(firstChild(note, "type"));
  const base = NOTE_TYPE_NAMES[noteType] || null;
  const dots = childElements(note, "dot").length;

  if (base) {
    if (dots === 1) return `dotted ${base}`;
    if (dots > 1) return `${dots}-dot ${base}`;
    return base;
  }

  const knownByUnits = new Map([
    [4, "whole note"],
    [2, "half note"],
    [1, "quarter note"],
    [0.5, "eighth note"],
    [0.25, "sixteenth note"],
  ]);
  return knownByUnits.get(quarterNoteUnits) || `${quarterNoteUnits} quarter-note units`;
}

function parseDuration(note, divisions, measureNumber) {
  const durationNode = firstChild(note, "duration");
  if (!durationNode || !Number.isInteger(divisions) || divisions <= 0) {
    throw new MusicXmlImportError(
      `Measure ${measureNumber} requires positive divisions and note duration values.`,
      "MISSING_MUSICXML_DURATION"
    );
  }

  const durationDivisions = integerText(
    durationNode,
    `MusicXML duration in measure ${measureNumber}`,
    { minimum: 1 }
  );
  const quarterNoteUnits = durationDivisions / divisions;

  return {
    name: durationName(note, quarterNoteUnits),
    quarterNoteUnits,
    source: "musicxml",
    durationDivisions,
    divisionsPerQuarter: divisions,
  };
}

function collectTechniques(coordinates) {
  if (!coordinates?.technical) return { techniques: [], unsupported: [] };

  const techniques = [];
  const unsupported = [];

  childElements(coordinates.technical).forEach((child) => {
    const name = localName(child);
    if (name === "string" || name === "fret") return;
    const mapped = TECHNIQUE_NAMES[name];
    if (mapped) {
      techniques.push({ name: mapped, source: "musicxml" });
    } else {
      unsupported.push(name);
    }
  });

  descendants(coordinates.technical.parentElement, "slide").forEach(() => {
    if (!techniques.some((technique) => technique.name === "slide")) {
      techniques.push({ name: "slide", source: "musicxml" });
    }
  });

  return { techniques, unsupported };
}

function emptyStates(strings) {
  return strings.map((string) => ({
    stringId: string.id,
    type: "silent",
    techniques: [],
  }));
}

function directNoteChildren(measure) {
  return childElements(measure).filter((child) => localName(child) === "note");
}

function parseMeasurePositions(measure, strings, divisions, warnings, measureIndex) {
  const displayNumber = measure.getAttribute("number") || String(measureIndex + 1);

  if (
    childElements(measure).some((child) =>
      ["backup", "forward"].includes(localName(child))
    )
  ) {
    throw new MusicXmlImportError(
      `Measure ${displayNumber} uses backup or forward timing. Multi-voice MusicXML is outside this checkpoint.`,
      "UNSUPPORTED_MUSICXML_MULTIVOICE_TIMING"
    );
  }

  const notes = directNoteChildren(measure);
  const voices = new Set(
    notes
      .map((note) => textOf(firstChild(note, "voice")))
      .filter((voice) => voice.length > 0)
  );
  if (voices.size > 1) {
    throw new MusicXmlImportError(
      `Measure ${displayNumber} contains more than one voice. Multi-voice MusicXML is outside this checkpoint.`,
      "UNSUPPORTED_MUSICXML_MULTIVOICE_TIMING"
    );
  }

  const positions = [];

  notes.forEach((note, noteIndex) => {
    if (firstChild(note, "grace")) {
      throw new MusicXmlImportError(
        `Measure ${displayNumber} contains a grace note. Grace-note timing is outside this checkpoint.`,
        "UNSUPPORTED_MUSICXML_GRACE_NOTE"
      );
    }

    const isChordNote = Boolean(firstChild(note, "chord"));
    const isRest = Boolean(firstChild(note, "rest"));
    const duration = parseDuration(note, divisions, displayNumber);

    if (isChordNote && (positions.length === 0 || positions.at(-1).isRest)) {
      throw new MusicXmlImportError(
        `Measure ${displayNumber} contains a chord note without a playable preceding note.`,
        "INVALID_MUSICXML_CHORD"
      );
    }

    let position;
    if (isChordNote) {
      position = positions.at(-1);
      if (position.duration.quarterNoteUnits !== duration.quarterNoteUnits) {
        warnings.push(
          `Measure ${displayNumber} contains a chord note with a different duration; the onset duration from the first chord note was preserved.`
        );
      }
    } else {
      position = {
        id: `musicxml-measure-${measureIndex + 1}-position-${positions.length + 1}`,
        sourceFormat: "musicxml",
        sourceMeasureNumber: displayNumber,
        sourceNoteIndex: noteIndex,
        isRest,
        duration,
        strings: emptyStates(strings),
      };
      positions.push(position);
    }

    if (isRest) return;

    const coordinates = technicalCoordinates(note);
    if (!coordinates) {
      throw new MusicXmlImportError(
        `Measure ${displayNumber} contains a pitched note without explicit MusicXML string and fret data.`,
        "MISSING_MUSICXML_TAB_COORDINATES"
      );
    }
    if (coordinates.stringNumber > strings.length) {
      throw new MusicXmlImportError(
        `Measure ${displayNumber} references string ${coordinates.stringNumber}, but this checkpoint supports six-string guitar only.`,
        "MUSICXML_STRING_OUT_OF_RANGE"
      );
    }

    const stringIndex = coordinates.stringNumber - 1;
    const existing = position.strings[stringIndex];
    if (existing.type !== "silent") {
      throw new MusicXmlImportError(
        `Measure ${displayNumber} assigns more than one note to MusicXML string ${coordinates.stringNumber} at one onset.`,
        "DUPLICATE_MUSICXML_STRING_AT_ONSET"
      );
    }

    const techniqueResult = collectTechniques(coordinates);
    techniqueResult.unsupported.forEach((name) => {
      warnings.push(
        `Measure ${displayNumber} preserves unsupported MusicXML technical element ${name} without interpreting it.`
      );
    });

    position.strings[stringIndex] = {
      stringId: strings[stringIndex].id,
      type: coordinates.fret === 0 ? "open" : "fret",
      ...(coordinates.fret === 0 ? {} : { fret: coordinates.fret }),
      techniques: techniqueResult.techniques,
      source: {
        format: "musicxml",
        measureNumber: displayNumber,
        noteIndex,
        stringNumber: coordinates.stringNumber,
        fret: coordinates.fret,
      },
    };
  });

  return { displayNumber, positions };
}

function stateCell(state) {
  if (!state || state.type === "silent") return "-";
  if (state.type === "open") return "0";
  if (state.type === "fret") return String(state.fret);
  if (state.type === "technique" && state.name === "muted note") return "x";
  return "-";
}

function normalizedSourceLine(string, positions) {
  const parts = [];
  let previousMeasure = null;

  positions.forEach((position) => {
    if (previousMeasure !== null && position.measureNumber !== previousMeasure) {
      parts.push("|");
    }
    const state = position.strings.find((candidate) => candidate.stringId === string.id);
    parts.push(stateCell(state));
    previousMeasure = position.measureNumber;
  });

  return `${string.rawLabel}|${parts.join("-")}|`;
}

export function parseMusicXmlTablature(sourceText) {
  const { root } = parseXml(sourceText);
  const part = chooseTabPart(root);
  const partId = part.getAttribute("id") || "P1";
  const partName = partNameFor(root, partId);
  const tuning = parseStaffTuning(part);
  let strings = makeStrings(tuning);
  const warnings = [];
  const measureNodes = childElements(part, "measure");

  if (measureNodes.length === 0) {
    throw new MusicXmlImportError(
      "The MusicXML tablature part contains no measures.",
      "NO_MUSICXML_MEASURES"
    );
  }

  let divisions = null;
  const measureDrafts = measureNodes.map((measure, measureIndex) => {
    const attributes = firstChild(measure, "attributes");
    const divisionsNode = attributes ? firstChild(attributes, "divisions") : null;
    if (divisionsNode) {
      divisions = integerText(divisionsNode, "MusicXML divisions", { minimum: 1 });
    }
    if (!divisions) {
      throw new MusicXmlImportError(
        `Measure ${measure.getAttribute("number") || measureIndex + 1} appears before MusicXML divisions are defined.`,
        "MISSING_MUSICXML_DIVISIONS"
      );
    }

    return parseMeasurePositions(measure, strings, divisions, warnings, measureIndex);
  });

  const measureCount = measureDrafts.length;
  const blockPositionCount = measureDrafts.reduce(
    (count, measure) => count + measure.positions.length,
    0
  );
  let blockPositionIndex = 0;

  const measures = measureDrafts.map((draft, measureIndex) => {
    const positionsInMeasure = draft.positions.length;
    const positions = draft.positions.map((position, positionIndex) => {
      const next = {
        ...position,
        blockIndex: 0,
        blockNumber: 1,
        positionInBlock: blockPositionIndex + 1,
        positionsInBlock: blockPositionCount,
        sourceColumn: blockPositionIndex,
        measureNumber: measureIndex + 1,
        measureCountInBlock: measureCount,
        positionInMeasure: positionIndex + 1,
        positionsInMeasure,
      };
      blockPositionIndex += 1;
      return next;
    });
    const durationComplete = positions.every(
      (position) => typeof position.duration?.quarterNoteUnits === "number"
    );
    const totalQuarterNoteUnits = durationComplete
      ? positions.reduce(
          (total, position) => total + position.duration.quarterNoteUnits,
          0
        )
      : null;

    return {
      id: `block-1-measure-${measureIndex + 1}`,
      type: "measure",
      blockIndex: 0,
      blockNumber: 1,
      number: measureIndex + 1,
      sourceNumber: draft.displayNumber,
      totalInBlock: measureCount,
      positions,
      durationComplete,
      totalQuarterNoteUnits,
      startSourceColumn: positions[0]?.sourceColumn ?? null,
      endSourceColumn: positions.at(-1)?.sourceColumn ?? null,
      barlineAfterColumn: null,
    };
  });

  const positions = measures
    .flatMap((measure) => measure.positions)
    .map((position, index, allPositions) => ({
      ...position,
      index,
      number: index + 1,
      total: allPositions.length,
    }));

  strings = strings.map((string) => ({
    ...string,
    sourceLine: normalizedSourceLine(string, positions),
    content: normalizedSourceLine(string, positions).split("|").slice(1).join("|"),
  }));

  const stringIds = strings.map((string) => string.id);
  positions.forEach((position) => {
    const stateIds = position.strings.map((state) => state.stringId);
    if (stateIds.some((id, index) => id !== stringIds[index])) {
      throw new MusicXmlImportError(
        "The MusicXML importer produced inconsistent string ordering.",
        "MUSICXML_STRING_ORDER_MISMATCH"
      );
    }
  });

  const title =
    textOf(firstDescendant(root, "work-title")) ||
    textOf(firstDescendant(root, "movement-title")) ||
    partName;

  const block = {
    type: "tablature-block",
    index: 0,
    number: 1,
    sourceFormat: "musicxml",
    sourcePartId: partId,
    sourcePartName: partName,
    sourceLayoutLabel: "Normalized MusicXML spatial layout",
    strings,
    positions,
    measures,
    maxLineLength: Math.max(...strings.map((string) => string.sourceLine.length)),
  };

  return {
    type: "tablature-document",
    sourceFormat: "musicxml",
    sourceText,
    title,
    instrument: "guitar",
    instrumentLabel: "six-string guitar",
    stringCount: 6,
    sourcePartId: partId,
    sourcePartName: partName,
    blocks: [block],
    strings,
    positions,
    measures: measures.map((measure, index) => ({
      ...measure,
      documentNumber: index + 1,
      documentTotal: measures.length,
    })),
    warnings: [...new Set(warnings)],
  };
}

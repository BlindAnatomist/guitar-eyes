import { GUITAR_PRO_LIMITS } from "./guitarProLimits";

const GUITAR_PRO_SOURCE_FORMAT = "guitar-pro-archive";

const SUPPORTED_STRING_COUNTS = new Set([4, 6]);
const STANDARD_GUITAR_MIDI = [64, 59, 55, 50, 45, 40];
const STANDARD_BASS_MIDI = [43, 38, 33, 28];
const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DURATION_NAMES = new Map([
  [1, "whole note"],
  [2, "half note"],
  [4, "quarter note"],
  [8, "eighth note"],
  [16, "sixteenth note"],
  [32, "thirty-second note"],
  [64, "sixty-fourth note"],
]);
const SUPPORTED_TECHNIQUES = new Set([
  "hammer-on",
  "pull-off",
  "slide",
  "bend",
  "vibrato",
  "let ring",
  "palm mute",
  "tap",
  "slap",
  "pop",
  "harmonic",
]);

export class GuitarProImportError extends Error {
  constructor(message, code = "GUITAR_PRO_IMPORT_ERROR") {
    super(message);
    this.name = "GuitarProImportError";
    this.code = code;
  }
}

function requireArray(value, message, code) {
  if (!Array.isArray(value)) {
    throw new GuitarProImportError(message, code);
  }
  return value;
}

function requireInteger(value, label, minimum = null) {
  if (!Number.isInteger(value) || (minimum !== null && value < minimum)) {
    throw new GuitarProImportError(
      `${label} must be an integer${minimum === null ? "" : ` of at least ${minimum}`}.`,
      "INVALID_GUITAR_PRO_INTERMEDIATE"
    );
  }
  return value;
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function reduceFraction(numerator, denominator) {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0) {
    throw new GuitarProImportError(
      "A Guitar Pro duration could not be represented as an exact fraction.",
      "UNREPRESENTABLE_GUITAR_PRO_DURATION"
    );
  }
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function multiplyFractions(left, right) {
  return reduceFraction(
    left.numerator * right.numerator,
    left.denominator * right.denominator
  );
}

function addFractions(left, right) {
  return reduceFraction(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator
  );
}

function durationFromBeat(beat, context) {
  const denominator = requireInteger(
    beat.durationDenominator,
    `${context} duration denominator`,
    1
  );
  const baseName = DURATION_NAMES.get(denominator);
  if (!baseName) {
    throw new GuitarProImportError(
      `${context} uses unsupported duration denominator ${denominator}.`,
      "UNSUPPORTED_GUITAR_PRO_DURATION"
    );
  }

  const dots = beat.dots ?? 0;
  if (!Number.isInteger(dots) || dots < 0 || dots > 2) {
    throw new GuitarProImportError(
      `${context} uses an unsupported dotted duration.`,
      "UNSUPPORTED_GUITAR_PRO_DURATION"
    );
  }

  let fraction = reduceFraction(4, denominator);
  const dotFactor = dots === 0 ? { numerator: 1, denominator: 1 } : dots === 1
    ? { numerator: 3, denominator: 2 }
    : { numerator: 7, denominator: 4 };
  fraction = multiplyFractions(fraction, dotFactor);

  const tupletNumerator = beat.tupletNumerator ?? -1;
  const tupletDenominator = beat.tupletDenominator ?? -1;
  const hasTuplet = !(
    (tupletNumerator === -1 && tupletDenominator === -1) ||
    (tupletNumerator === 1 && tupletDenominator === 1)
  );

  if (hasTuplet) {
    if (
      !Number.isInteger(tupletNumerator) ||
      !Number.isInteger(tupletDenominator) ||
      tupletNumerator <= 0 ||
      tupletDenominator <= 0
    ) {
      throw new GuitarProImportError(
        `${context} contains an invalid tuplet ratio.`,
        "UNSUPPORTED_GUITAR_PRO_DURATION"
      );
    }
    fraction = multiplyFractions(fraction, {
      numerator: tupletDenominator,
      denominator: tupletNumerator,
    });
  }

  const dottedName = dots === 0 ? baseName : dots === 1 ? `dotted ${baseName}` : `double-dotted ${baseName}`;
  const name = hasTuplet
    ? `${dottedName} tuplet, ${tupletNumerator} in the time of ${tupletDenominator}`
    : dottedName;

  return {
    name,
    source: GUITAR_PRO_SOURCE_FORMAT,
    denominator,
    dots,
    tupletNumerator,
    tupletDenominator,
    quarterNoteFraction: fraction,
    quarterNoteUnits: fraction.numerator / fraction.denominator,
  };
}

function pitchFromMidi(midi) {
  requireInteger(midi, "Guitar Pro tuning pitch", 0);
  if (midi > 127) {
    throw new GuitarProImportError(
      `Guitar Pro tuning pitch ${midi} is outside the MIDI range.`,
      "INVALID_GUITAR_PRO_TUNING"
    );
  }
  return {
    tuning: PITCH_NAMES[midi % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
  };
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function spokenPitch(tuning, octave) {
  const pitch = tuning.endsWith("#") ? `${tuning[0]} sharp` : tuning;
  return `${pitch} ${octave}`;
}

function buildStrings(tuningMidiHighToLow) {
  const count = tuningMidiHighToLow.length;
  const instrument = count === 4 ? "bass" : "guitar";
  const isStandard = arraysEqual(
    tuningMidiHighToLow,
    count === 4 ? STANDARD_BASS_MIDI : STANDARD_GUITAR_MIDI
  );

  return tuningMidiHighToLow.map((midi, index) => {
    const pitch = pitchFromMidi(midi);
    let shortName;
    let spokenName;

    if (isStandard && instrument === "guitar" && index === 0) {
      shortName = "high E";
      spokenName = "High E string";
    } else if (isStandard && instrument === "guitar" && index === 5) {
      shortName = "low E";
      spokenName = "Low E string";
    } else if (isStandard) {
      shortName = pitch.tuning;
      spokenName = `${pitch.tuning} string`;
    } else {
      shortName = `string ${index + 1}`;
      spokenName = `String ${index + 1}, tuned ${spokenPitch(pitch.tuning, pitch.octave)}`;
    }

    return {
      id: `block-1-string-${index + 1}`,
      index,
      blockIndex: 0,
      tuning: pitch.tuning,
      octave: pitch.octave,
      tuningMidi: pitch.midi,
      rawLabel: `${pitch.tuning}${pitch.octave}`,
      shortName,
      spokenName,
      sourceLine: "",
      sourceLineNumber: null,
      content: "",
      tokens: [],
      sourceFormat: GUITAR_PRO_SOURCE_FORMAT,
    };
  });
}

function countAndValidateResources(intermediate, limits) {
  const tracks = requireArray(
    intermediate.tracks,
    "The Guitar Pro decoder did not return a track list.",
    "INVALID_GUITAR_PRO_INTERMEDIATE"
  );
  if (tracks.length > limits.maxTracks) {
    throw new GuitarProImportError(
      `The Guitar Pro file contains ${tracks.length} tracks; the proof limit is ${limits.maxTracks}.`,
      "GUITAR_PRO_TRACK_LIMIT"
    );
  }

  let staffCount = 0;
  let barCount = 0;
  let beatCount = 0;
  let noteCount = 0;

  tracks.forEach((track, trackIndex) => {
    const staves = requireArray(
      track.staves,
      `Track ${trackIndex + 1} does not contain a staff list.`,
      "INVALID_GUITAR_PRO_INTERMEDIATE"
    );
    staffCount += staves.length;

    staves.forEach((staff, staffIndex) => {
      const bars = requireArray(
        staff.bars,
        `Track ${trackIndex + 1}, staff ${staffIndex + 1} does not contain bars.`,
        "INVALID_GUITAR_PRO_INTERMEDIATE"
      );
      barCount += bars.length;

      bars.forEach((bar, barIndex) => {
        const voices = requireArray(
          bar.voices,
          `Track ${trackIndex + 1}, staff ${staffIndex + 1}, bar ${barIndex + 1} does not contain voices.`,
          "INVALID_GUITAR_PRO_INTERMEDIATE"
        );
        if (voices.length > limits.maxVoicesPerBar) {
          throw new GuitarProImportError(
            `Bar ${barIndex + 1} contains ${voices.length} voices; the proof limit is ${limits.maxVoicesPerBar}.`,
            "GUITAR_PRO_VOICE_LIMIT"
          );
        }
        voices.forEach((voice) => {
          const beats = requireArray(
            voice.beats,
            "A Guitar Pro voice does not contain beats.",
            "INVALID_GUITAR_PRO_INTERMEDIATE"
          );
          beatCount += beats.length;
          beats.forEach((beat) => {
            const notes = requireArray(
              beat.notes,
              "A Guitar Pro beat does not contain a note list.",
              "INVALID_GUITAR_PRO_INTERMEDIATE"
            );
            noteCount += notes.length;
          });
        });
      });
    });
  });

  if (staffCount > limits.maxStaves) {
    throw new GuitarProImportError(
      `The Guitar Pro file contains ${staffCount} staves; the proof limit is ${limits.maxStaves}.`,
      "GUITAR_PRO_STAFF_LIMIT"
    );
  }
  if (barCount > limits.maxBars) {
    throw new GuitarProImportError(
      `The Guitar Pro file contains ${barCount} bars; the proof limit is ${limits.maxBars}.`,
      "GUITAR_PRO_BAR_LIMIT"
    );
  }
  if (beatCount > limits.maxBeats) {
    throw new GuitarProImportError(
      `The Guitar Pro file contains ${beatCount} beats; the proof limit is ${limits.maxBeats}.`,
      "GUITAR_PRO_BEAT_LIMIT"
    );
  }
  if (noteCount > limits.maxNotes) {
    throw new GuitarProImportError(
      `The Guitar Pro file contains ${noteCount} notes; the proof limit is ${limits.maxNotes}.`,
      "GUITAR_PRO_NOTE_LIMIT"
    );
  }

  return { tracks, staffCount, barCount, beatCount, noteCount };
}

function selectCandidateStaff(tracks, selection = null) {
  const frettedCandidates = [];

  tracks.forEach((track, trackIndex) => {
    requireArray(track.staves, "A Guitar Pro track has no staff list.", "INVALID_GUITAR_PRO_INTERMEDIATE")
      .forEach((staff, staffIndex) => {
        const tuning = Array.isArray(staff.tuningMidiHighToLow)
          ? staff.tuningMidiHighToLow
          : [];
        if (!track.isPercussion && tuning.length > 0) {
          frettedCandidates.push({ track, staff, trackIndex, staffIndex, stringCount: tuning.length });
        }
      });
  });

  const supported = frettedCandidates.filter((candidate) =>
    SUPPORTED_STRING_COUNTS.has(candidate.stringCount)
  );


if (selection !== null) {
  const trackIndex = selection?.trackIndex;
  const staffIndex = selection?.staffIndex;
  if (
    !Number.isInteger(trackIndex) ||
    trackIndex < 0 ||
    !Number.isInteger(staffIndex) ||
    staffIndex < 0
  ) {
    throw new GuitarProImportError(
      "The selected Guitar Pro track coordinates are invalid.",
      "INVALID_GUITAR_PRO_TRACK_SELECTION"
    );
  }

  const selected = supported.find(
    (candidate) =>
      candidate.trackIndex === trackIndex && candidate.staffIndex === staffIndex
  );
  if (!selected) {
    throw new GuitarProImportError(
      "The selected Guitar Pro track is not available in the current four-string bass or six-string guitar profile.",
      "INVALID_GUITAR_PRO_TRACK_SELECTION"
    );
  }

  return {
    ...selected,
    ignoredTrackCount: Math.max(0, tracks.length - 1),
  };
}
  if (supported.length > 1) {
    throw new GuitarProImportError(
      `The Guitar Pro file contains ${supported.length} supported tablature tracks. Checkpoint 3C does not silently choose one; an accessible track selector is required first.`,
      "MULTIPLE_SUPPORTED_GUITAR_PRO_TRACKS"
    );
  }

  if (supported.length === 0) {
    const unsupportedCounts = [...new Set(frettedCandidates.map((candidate) => candidate.stringCount))];
    if (unsupportedCounts.length > 0) {
      throw new GuitarProImportError(
        `The Guitar Pro file contains fretted ${unsupportedCounts.join("- and ")}-string material. Checkpoint 3C supports one four-string bass or six-string guitar staff only.`,
        "UNSUPPORTED_GUITAR_PRO_STRING_COUNT"
      );
    }
    throw new GuitarProImportError(
      "No supported non-percussion four-string or six-string Guitar Pro staff was found.",
      "NO_SUPPORTED_GUITAR_PRO_TRACK"
    );
  }

  return {
    ...supported[0],
    ignoredTrackCount: Math.max(0, tracks.length - 1),
  };
}

function emptyStates(strings) {
  return strings.map((string) => ({
    stringId: string.id,
    type: "silent",
    techniques: [],
  }));
}

function normalizeTechniques(values, warnings, context) {
  const normalized = [];
  [...new Set(Array.isArray(values) ? values : [])].forEach((value) => {
    const name = String(value || "").trim().toLowerCase();
    if (!name) return;
    if (SUPPORTED_TECHNIQUES.has(name)) {
      normalized.push({ name, source: GUITAR_PRO_SOURCE_FORMAT });
    } else {
      warnings.push(`${context} preserves unsupported Guitar Pro technique ${name} without interpreting it.`);
    }
  });
  return normalized;
}

function activeVoiceForBar(bar, measureNumber) {
  const voices = requireArray(
    bar.voices,
    `Measure ${measureNumber} has no voice list.`,
    "INVALID_GUITAR_PRO_INTERMEDIATE"
  );
  const activeVoices = voices.filter((voice) => Array.isArray(voice.beats) && voice.beats.length > 0);

  if (activeVoices.length === 0) {
    throw new GuitarProImportError(
      `Measure ${measureNumber} contains no timed beats.`,
      "EMPTY_GUITAR_PRO_MEASURE"
    );
  }
  if (activeVoices.length > 1) {
    throw new GuitarProImportError(
      `Measure ${measureNumber} contains ${activeVoices.length} active voices. Checkpoint 3C does not merge voices by guessing.`,
      "CONFLICTING_GUITAR_PRO_VOICES"
    );
  }

  return activeVoices[0];
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
  let priorMeasure = null;

  positions.forEach((position) => {
    if (priorMeasure !== null && position.measureNumber !== priorMeasure) {
      parts.push("|");
    }
    const state = position.strings[string.index];
    parts.push(stateCell(state));
    priorMeasure = position.measureNumber;
  });

  return `${string.rawLabel}|${parts.join("-")}|`;
}

function validateVersionEvidence(intermediate) {
  const evidence = intermediate.versionEvidence;
  if (
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.archiveFamily !== "GUITAR_PRO_SHARED_ZIP" ||
    evidence.rootVersion !== "7.0" ||
    evidence.sourceVersion !== intermediate.sourceVersion
  ) {
    throw new GuitarProImportError(
      "The Guitar Pro decoder returned missing or inconsistent archive-version evidence.",
      "INVALID_GUITAR_PRO_VERSION_EVIDENCE"
    );
  }

  const gpMajor = /^([0-9]+)(?:\.|$)/.exec(evidence.gpVersion || "")?.[1] || null;
  const encodingMajor = /^GP([0-9]+)$/i.exec(evidence.encodingDescription || "")?.[1] || null;
  const sourceMajor = /^GP([0-9]+)$/i.exec(evidence.sourceVersion || "")?.[1] || null;
  if (!gpMajor || gpMajor !== encodingMajor || gpMajor !== sourceMajor) {
    throw new GuitarProImportError(
      "The Guitar Pro archive-version markers contradict one another.",
      "CONTRADICTORY_GUITAR_PRO_VERSION_EVIDENCE"
    );
  }
  if (evidence.sourceVersion !== "GP8") {
    throw new GuitarProImportError(
      "This checkpoint has direct project evidence for GP8 semantics inside the shared .gp archive only; the archive reports " +
        (evidence.sourceVersion || "an unknown version") +
        ".",
      "UNTESTED_GUITAR_PRO_VERSION"
    );
  }

  return evidence;
}

export function normalizeGuitarProIntermediate(
  intermediate,
  { limits = GUITAR_PRO_LIMITS, selection = null } = {}
) {
  if (!intermediate || intermediate.schemaVersion !== 1) {
    throw new GuitarProImportError(
      "The Guitar Pro decoder returned an unsupported intermediate schema.",
      "INVALID_GUITAR_PRO_INTERMEDIATE"
    );
  }
  const versionEvidence = validateVersionEvidence(intermediate);

  const { tracks } = countAndValidateResources(intermediate, limits);
  const candidate = selectCandidateStaff(tracks, selection);
  const tuning = requireArray(
    candidate.staff.tuningMidiHighToLow,
    "The selected Guitar Pro staff has no tuning.",
    "INVALID_GUITAR_PRO_TUNING"
  );
  if (!SUPPORTED_STRING_COUNTS.has(tuning.length)) {
    throw new GuitarProImportError(
      `The selected Guitar Pro staff has ${tuning.length} strings.`,
      "UNSUPPORTED_GUITAR_PRO_STRING_COUNT"
    );
  }

  const strings = buildStrings(tuning);
  const warnings = [];
  if (candidate.ignoredTrackCount > 0) {
    warnings.push(
      `${candidate.ignoredTrackCount} non-selected Guitar Pro ${candidate.ignoredTrackCount === 1 ? "track was" : "tracks were"} ignored because exactly one supported tablature staff was unambiguous.`
    );
  }

  const bars = requireArray(
    candidate.staff.bars,
    "The selected Guitar Pro staff has no bars.",
    "INVALID_GUITAR_PRO_INTERMEDIATE"
  );
  if (bars.length === 0) {
    throw new GuitarProImportError(
      "The selected Guitar Pro staff contains no measures.",
      "NO_GUITAR_PRO_MEASURES"
    );
  }

  let blockPositionIndex = 0;
  let previousStart = -1;
  const measureDrafts = bars.map((bar, barIndex) => {
    const measureNumber = barIndex + 1;
    const voice = activeVoiceForBar(bar, measureNumber);
    const beats = requireArray(
      voice.beats,
      `Measure ${measureNumber} has no beats.`,
      "INVALID_GUITAR_PRO_INTERMEDIATE"
    );
    const positions = beats.map((beat, beatIndex) => {
      const context = `Measure ${measureNumber}, beat ${beatIndex + 1}`;
      if (beat.graceType && beat.graceType !== "none") {
        throw new GuitarProImportError(
          `${context} uses grace timing, which is outside the current semantic timing model.`,
          "UNSUPPORTED_GUITAR_PRO_GRACE_TIMING"
        );
      }

      const startTicks = requireInteger(beat.startTicks, `${context} start tick`, 0);
      if (startTicks <= previousStart) {
        throw new GuitarProImportError(
          `${context} does not follow the prior beat in a strictly increasing timeline.`,
          "AMBIGUOUS_GUITAR_PRO_TIMING"
        );
      }
      previousStart = startTicks;

      const duration = durationFromBeat(beat, context);
      const isRest = Boolean(beat.isRest);
      const states = emptyStates(strings);
      const notes = requireArray(
        beat.notes,
        `${context} has no note list.`,
        "INVALID_GUITAR_PRO_INTERMEDIATE"
      ).filter((note) => note.visible !== false);

      if (isRest && notes.length > 0) {
        throw new GuitarProImportError(
          `${context} is marked as a rest but also contains visible notes.`,
          "INVALID_GUITAR_PRO_REST"
        );
      }
      if (!isRest && notes.length === 0) {
        throw new GuitarProImportError(
          `${context} has no visible fretted notes.`,
          "MISSING_GUITAR_PRO_NOTE_COORDINATES"
        );
      }

      const usedStrings = new Set();
      notes.forEach((note, noteIndex) => {
        const noteContext = `${context}, note ${noteIndex + 1}`;
        const sourceString = requireInteger(
          note.stringNumberLowToHigh,
          `${noteContext} string number`,
          1
        );
        if (sourceString > strings.length) {
          throw new GuitarProImportError(
            `${noteContext} references string ${sourceString}, outside the ${strings.length}-string staff.`,
            "GUITAR_PRO_STRING_OUT_OF_RANGE"
          );
        }
        if (usedStrings.has(sourceString)) {
          throw new GuitarProImportError(
            `${context} assigns more than one note to string ${sourceString}.`,
            "DUPLICATE_GUITAR_PRO_STRING_AT_ONSET"
          );
        }
        usedStrings.add(sourceString);

        const semanticIndex = strings.length - sourceString;
        const techniques = normalizeTechniques(
          [...(beat.techniques || []), ...(note.techniques || [])],
          warnings,
          noteContext
        );

        if (note.isDead) {
          states[semanticIndex] = {
            stringId: strings[semanticIndex].id,
            type: "technique",
            name: "muted note",
            techniques,
            source: { format: GUITAR_PRO_SOURCE_FORMAT, measureNumber, beatIndex, noteIndex },
          };
          return;
        }

        const fret = requireInteger(note.fret, `${noteContext} fret`, 0);
        states[semanticIndex] = {
          stringId: strings[semanticIndex].id,
          type: fret === 0 ? "open" : "fret",
          ...(fret === 0 ? {} : { fret }),
          techniques,
          source: { format: GUITAR_PRO_SOURCE_FORMAT, measureNumber, beatIndex, noteIndex },
        };
      });

      const position = {
        id: `guitar-pro-measure-${measureNumber}-position-${beatIndex + 1}`,
        sourceFormat: GUITAR_PRO_SOURCE_FORMAT,
        sourceMeasureNumber: String(bar.sourceNumber ?? measureNumber),
        sourceBeatIndex: beatIndex,
        sourceStartTicks: startTicks,
        isRest,
        duration,
        strings: states,
        blockIndex: 0,
        blockNumber: 1,
        sourceColumn: blockPositionIndex,
      };
      blockPositionIndex += 1;
      return position;
    });

    if (bar.repeatStart || (bar.repeatCount ?? 0) > 0 || (bar.alternateEndings ?? 0) > 0) {
      warnings.push(
        `Measure ${measureNumber} contains repeat or alternate-ending metadata. Source-order measures were preserved without expanding playback order.`
      );
    }

    return {
      sourceNumber: String(bar.sourceNumber ?? measureNumber),
      timeSignatureNumerator: bar.timeSignatureNumerator ?? null,
      timeSignatureDenominator: bar.timeSignatureDenominator ?? null,
      positions,
    };
  });

  const measureCount = measureDrafts.length;
  const totalPositions = measureDrafts.reduce(
    (total, measure) => total + measure.positions.length,
    0
  );
  let positionInBlock = 0;

  const measures = measureDrafts.map((draft, measureIndex) => {
    let totalFraction = { numerator: 0, denominator: 1 };
    const positions = draft.positions.map((position, positionIndex) => {
      totalFraction = addFractions(totalFraction, position.duration.quarterNoteFraction);
      positionInBlock += 1;
      return {
        ...position,
        positionInBlock,
        positionsInBlock: totalPositions,
        measureNumber: measureIndex + 1,
        measureCountInBlock: measureCount,
        positionInMeasure: positionIndex + 1,
        positionsInMeasure: draft.positions.length,
      };
    });

    return {
      id: `block-1-measure-${measureIndex + 1}`,
      type: "measure",
      blockIndex: 0,
      blockNumber: 1,
      number: measureIndex + 1,
      sourceNumber: draft.sourceNumber,
      totalInBlock: measureCount,
      positions,
      durationComplete: true,
      totalQuarterNoteFraction: totalFraction,
      totalQuarterNoteUnits: totalFraction.numerator / totalFraction.denominator,
      timeSignatureNumerator: draft.timeSignatureNumerator,
      timeSignatureDenominator: draft.timeSignatureDenominator,
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

  const stringsWithRows = strings.map((string) => {
    const sourceLine = normalizedSourceLine(string, positions);
    return {
      ...string,
      sourceLine,
      content: sourceLine.split("|").slice(1).join("|"),
    };
  });

  const stringIds = stringsWithRows.map((string) => string.id);
  positions.forEach((position) => {
    if (position.strings.some((state, index) => state.stringId !== stringIds[index])) {
      throw new GuitarProImportError(
        "The Guitar Pro normalizer produced inconsistent string ordering.",
        "GUITAR_PRO_STRING_ORDER_MISMATCH"
      );
    }
  });

  const stringCount = stringsWithRows.length;
  const instrument = stringCount === 4 ? "bass" : "guitar";
  const trackName = String(candidate.track.name || candidate.track.shortName || `${instrument} track`).trim();
  const block = {
    type: "tablature-block",
    index: 0,
    number: 1,
    sourceFormat: GUITAR_PRO_SOURCE_FORMAT,
    sourceVersion: intermediate.sourceVersion,
    versionEvidence,
    sourceTrackIndex: candidate.trackIndex,
    sourceStaffIndex: candidate.staffIndex,
    sourceTrackName: trackName,
    sourceLayoutLabel: "Normalized Guitar Pro spatial layout",
    strings: stringsWithRows,
    positions,
    measures,
    maxLineLength: Math.max(...stringsWithRows.map((string) => string.sourceLine.length)),
  };

  return {
    type: "tablature-document",
    sourceFormat: GUITAR_PRO_SOURCE_FORMAT,
    sourceVersion: intermediate.sourceVersion,
    versionEvidence,
    title: String(intermediate.title || trackName || "Guitar Pro tablature").trim(),
    instrument,
    instrumentLabel: stringCount === 4 ? "four-string bass" : "six-string guitar",
    stringCount,
    sourceTrackIndex: candidate.trackIndex,
    sourceStaffIndex: candidate.staffIndex,
    sourceTrackName: trackName,
    blocks: [block],
    strings: stringsWithRows,
    positions,
    measures: measures.map((measure, index) => ({
      ...measure,
      documentNumber: index + 1,
      documentTotal: measures.length,
    })),
    warnings: [...new Set(warnings)],
  };
}

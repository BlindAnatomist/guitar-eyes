import { buildPlaybackTimeline } from "./playbackTiming";

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

const STANDARD_PROFILES = {
  guitar: {
    stringCount: 6,
    tuningHighToLow: ["E", "B", "G", "D", "A", "E"],
    midiHighToLow: [64, 59, 55, 50, 45, 40],
  },
  bass: {
    stringCount: 4,
    tuningHighToLow: ["G", "D", "A", "E"],
    midiHighToLow: [43, 38, 33, 28],
  },
};

export class PositionSoundEventError extends Error {
  constructor(message, code = "POSITION_SOUND_EVENT_ERROR") {
    super(message);
    this.name = "PositionSoundEventError";
    this.code = code;
  }
}

function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function requireMidi(value, context) {
  if (!Number.isInteger(value) || value < 0 || value > 127) {
    throw new PositionSoundEventError(
      `${context} produced MIDI pitch ${value}, outside the supported 0 through 127 range.`,
      "INVALID_POSITION_SOUND_PITCH"
    );
  }
  return value;
}

function midiFromPitchAndOctave(tuning, octave, context) {
  const pitchClass = PITCH_CLASS[tuning];
  if (pitchClass === undefined || !Number.isInteger(octave)) {
    throw new PositionSoundEventError(
      `${context} requires an explicit supported tuning name and octave.`,
      "PLAYBACK_PITCH_INCOMPLETE"
    );
  }
  return requireMidi((octave + 1) * 12 + pitchClass, context);
}

function standardProfileForDocument(document) {
  const profile = STANDARD_PROFILES[document?.instrument];
  if (!profile || document?.stringCount !== profile.stringCount) return null;
  if (!Array.isArray(document?.strings) || document.strings.length !== profile.stringCount) {
    return null;
  }

  const exactStandardTuning = document.strings.every(
    (string, index) => string?.tuning === profile.tuningHighToLow[index]
  );
  return exactStandardTuning ? profile : null;
}

function openMidiForString(string, stringIndex, document, standardProfile) {
  const context = `String ${stringIndex + 1}`;

  if (Number.isInteger(string?.tuningMidi)) {
    return requireMidi(string.tuningMidi, context);
  }

  if (Number.isInteger(string?.octave)) {
    return midiFromPitchAndOctave(string.tuning, string.octave, context);
  }

  if (standardProfile) {
    return standardProfile.midiHighToLow[stringIndex];
  }

  throw new PositionSoundEventError(
    `${context}, tuned ${string?.tuning || "unknown"}, has no octave evidence. Audible playback does not guess a custom tuning octave.`,
    "PLAYBACK_PITCH_INCOMPLETE"
  );
}

function resolveTimeline(document, options) {
  if (options?.timeline) {
    const timeline = options.timeline;
    if (
      timeline?.type !== "playback-timeline" ||
      !Array.isArray(timeline.positions) ||
      timeline.positions.length !== document.positions.length
    ) {
      throw new PositionSoundEventError(
        "The supplied playback timeline does not match the semantic document.",
        "INVALID_POSITION_SOUND_TIMELINE"
      );
    }
    return timeline;
  }

  const timingOptions = Object.prototype.hasOwnProperty.call(
    options || {},
    "beatsPerMinute"
  )
    ? { beatsPerMinute: options.beatsPerMinute }
    : undefined;

  return buildPlaybackTimeline(document, timingOptions);
}

function playedState(state) {
  return state?.type === "open" || state?.type === "fret";
}

function mutedState(state) {
  return state?.type === "technique" && state?.name === "muted note";
}

export function buildPositionSoundEvents(
  semanticDocument,
  positionIndex,
  options = {}
) {
  if (
    !semanticDocument ||
    typeof semanticDocument !== "object" ||
    !Array.isArray(semanticDocument.positions) ||
    !Array.isArray(semanticDocument.strings)
  ) {
    throw new PositionSoundEventError(
      "Audible playback requires a semantic tablature document with positions and strings.",
      "INVALID_POSITION_SOUND_DOCUMENT"
    );
  }

  if (
    !Number.isInteger(positionIndex) ||
    positionIndex < 0 ||
    positionIndex >= semanticDocument.positions.length
  ) {
    throw new PositionSoundEventError(
      "The requested semantic position is not available.",
      "INVALID_POSITION_SOUND_INDEX"
    );
  }

  const timeline = resolveTimeline(semanticDocument, options);
  const timelinePosition = timeline.positions[positionIndex];
  if (
    !timelinePosition ||
    timelinePosition.sourcePositionIndex !== positionIndex ||
    !Number.isFinite(timelinePosition.durationMilliseconds) ||
    timelinePosition.durationMilliseconds <= 0
  ) {
    throw new PositionSoundEventError(
      "The playback timeline does not contain safe timing for the requested position.",
      "INVALID_POSITION_SOUND_TIMELINE"
    );
  }

  const position = semanticDocument.positions[positionIndex];
  if (!Array.isArray(position?.strings)) {
    throw new PositionSoundEventError(
      "The requested position has no semantic string-state list.",
      "INVALID_POSITION_SOUND_POSITION"
    );
  }

  const stringsById = new Map();
  semanticDocument.strings.forEach((string, index) => {
    const id = String(string?.id || "");
    if (!id || stringsById.has(id)) {
      throw new PositionSoundEventError(
        "The semantic document contains a missing or duplicate string identity.",
        "INVALID_POSITION_SOUND_STRING_IDENTITY"
      );
    }
    stringsById.set(id, { string, index });
  });

  const seenStateIds = new Set();
  const standardProfile = standardProfileForDocument(semanticDocument);
  const events = [];

  position.strings.forEach((state) => {
    const stringId = String(state?.stringId || "");
    const entry = stringsById.get(stringId);
    if (!entry || seenStateIds.has(stringId)) {
      throw new PositionSoundEventError(
        "The position contains an unknown or duplicate string state.",
        "INVALID_POSITION_SOUND_STRING_IDENTITY"
      );
    }
    seenStateIds.add(stringId);

    if (playedState(state)) {
      const fret = state.type === "open" ? 0 : state.fret;
      if (!Number.isInteger(fret) || fret < 0) {
        throw new PositionSoundEventError(
          `String ${entry.index + 1} has an invalid fret for audible playback.`,
          "INVALID_POSITION_SOUND_FRET"
        );
      }
      const openMidi = openMidiForString(
        entry.string,
        entry.index,
        semanticDocument,
        standardProfile
      );
      const midi = requireMidi(openMidi + fret, `String ${entry.index + 1}, fret ${fret}`);
      events.push({
        type: "pitched-string",
        stringId,
        stringIndex: entry.index,
        fret,
        midi,
        frequencyHz: midiToFrequency(midi),
        onsetMilliseconds: 0,
        durationMilliseconds: timelinePosition.durationMilliseconds,
      });
      return;
    }

    if (mutedState(state)) {
      events.push({
        type: "muted-string",
        stringId,
        stringIndex: entry.index,
        onsetMilliseconds: 0,
        durationMilliseconds: timelinePosition.durationMilliseconds,
      });
    }
  });

  if (position.isRest) {
    if (events.length > 0) {
      throw new PositionSoundEventError(
        "A semantic rest cannot also contain audible string events.",
        "INVALID_POSITION_SOUND_REST"
      );
    }
  } else if (events.length === 0) {
    throw new PositionSoundEventError(
      "The requested position contains no pitched or explicitly muted string event to audition.",
      "NO_POSITION_SOUND_EVENTS"
    );
  }

  const pitchedEventCount = events.filter(
    (event) => event.type === "pitched-string"
  ).length;
  const mutedEventCount = events.length - pitchedEventCount;

  return {
    schemaVersion: 1,
    type: "position-sound-events",
    sourceDocumentFormat: String(
      semanticDocument.sourceFormat || "ascii-text"
    ),
    positionIndex,
    positionId: String(position.id || `position-${positionIndex + 1}`),
    positionNumber: Number.isInteger(position.number)
      ? position.number
      : positionIndex + 1,
    measureNumber: Number.isInteger(position.measureNumber)
      ? position.measureNumber
      : null,
    isRest: Boolean(position.isRest),
    isChord: pitchedEventCount > 1,
    durationMilliseconds: timelinePosition.durationMilliseconds,
    durationQuarterNoteFraction: {
      ...timelinePosition.durationQuarterNoteFraction,
    },
    tempo: { ...timeline.tempo },
    events,
    pitchedEventCount,
    mutedEventCount,
  };
}

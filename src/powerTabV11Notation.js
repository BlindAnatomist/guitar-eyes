import {
  ALLOWED_NOTE_PROPERTIES,
  ALLOWED_POSITION_PROPERTIES,
  DURATION_DENOMINATORS,
  NOTE_TECHNIQUES,
  POSITION_TECHNIQUES,
  fail,
  fixedArray,
  isObject,
  requireArray,
  requireInteger,
  requireObject,
  requireOptionalArray,
  requireString,
} from "./powerTabV11Shared";

export function scoreTitle(scoreInfo) {
  if (!isObject(scoreInfo)) return "PowerTab tablature";
  const songTitle = scoreInfo.song_data?.title;
  if (typeof songTitle === "string" && songTitle.trim()) {
    return songTitle.trim();
  }
  const lessonTitle = scoreInfo.lesson_data?.title;
  if (typeof lessonTitle === "string" && lessonTitle.trim()) {
    return lessonTitle.trim();
  }
  return "PowerTab tablature";
}

export function parsePlayer(player, index) {
  const value = requireObject(player, `Player ${index + 1}`);
  const tuning = requireObject(value.tuning, `Player ${index + 1} tuning`);
  const notes = requireArray(
    tuning.notes,
    `Player ${index + 1} tuning notes`
  ).map((note, noteIndex) =>
    requireInteger(
      note,
      `Player ${index + 1} tuning note ${noteIndex + 1}`,
      0,
      127
    )
  );
  if (notes.length < 3 || notes.length > 8) {
    fail(
      `Player ${index + 1} reports ${notes.length} strings; PowerTab v11 permits three through eight.`,
      "INVALID_POWERTAB_TUNING"
    );
  }

  const capo = requireInteger(
    tuning.capo ?? 0,
    `Player ${index + 1} capo`,
    0,
    12
  );
  if (capo !== 0) {
    fail(
      `Player ${index + 1} uses capo ${capo}; capo semantics are outside the bounded v11 profile.`,
      "UNSUPPORTED_POWERTAB_CAPO"
    );
  }
  requireInteger(
    tuning.offset ?? 0,
    `Player ${index + 1} notation offset`,
    -12,
    12
  );

  return {
    index,
    description:
      typeof value.description === "string" && value.description.trim()
        ? value.description.trim()
        : `Player ${index + 1}`,
    tuningMidiHighToLow: notes,
  };
}

function parseProperties(value, label) {
  return requireOptionalArray(value, label).map((property, index) =>
    requireString(property, `${label} entry ${index + 1}`)
  );
}

function techniquesFromPosition(properties) {
  return [
    ...new Set(
      properties
        .map((property) => POSITION_TECHNIQUES[property])
        .filter(Boolean)
    ),
  ];
}

function techniquesFromNote(note, properties) {
  const techniques = properties
    .map((property) => NOTE_TECHNIQUES[property])
    .filter(Boolean);
  if (note.bend != null) techniques.push("bend");
  if (note.artificial_harmonic != null || note.tapped_harmonic != null) {
    techniques.push("harmonic");
  }
  return [...new Set(techniques)];
}

function parseNote(note, noteIndex, context, stringCount) {
  const value = requireObject(note, `${context}, note ${noteIndex + 1}`);
  const stringIndex = requireInteger(
    value.string,
    `${context}, note ${noteIndex + 1} string`,
    0,
    stringCount - 1
  );
  const fret = requireInteger(
    value.fret,
    `${context}, note ${noteIndex + 1} fret`,
    0,
    99
  );
  const properties = parseProperties(
    value.properties,
    `${context}, note ${noteIndex + 1} properties`
  );

  const unsupportedProperties = properties.filter(
    (property) => !ALLOWED_NOTE_PROPERTIES.has(property)
  );
  if (unsupportedProperties.length > 0) {
    fail(
      `${context}, note ${noteIndex + 1} uses unsupported note properties: ${unsupportedProperties.join(", ")}.`,
      "UNSUPPORTED_POWERTAB_NOTE_TECHNIQUE"
    );
  }
  if (value.trill != null) {
    fail(
      `${context}, note ${noteIndex + 1} uses a trill outside the bounded v11 profile.`,
      "UNSUPPORTED_POWERTAB_NOTE_TECHNIQUE"
    );
  }
  if (value.finger_hint != null) {
    fail(
      `${context}, note ${noteIndex + 1} contains left-hand fingering outside the bounded v11 profile.`,
      "UNSUPPORTED_POWERTAB_NOTE_STRUCTURE"
    );
  }
  if (value.tapped_harmonic != null) {
    requireInteger(
      value.tapped_harmonic,
      `${context}, note ${noteIndex + 1} tapped harmonic fret`,
      0,
      99
    );
  }
  if (value.artificial_harmonic != null) {
    requireObject(
      value.artificial_harmonic,
      `${context}, note ${noteIndex + 1} artificial harmonic`
    );
  }
  if (value.bend != null) {
    requireObject(value.bend, `${context}, note ${noteIndex + 1} bend`);
  }

  return {
    stringNumberLowToHigh: stringCount - stringIndex,
    fret,
    visible: true,
    isDead: properties.includes("Muted"),
    techniques: techniquesFromNote(value, properties),
  };
}

function parsePosition(position, positionIndex, context, stringCount) {
  const value = requireObject(position, `${context}, position ${positionIndex + 1}`);
  const sourcePosition = requireInteger(
    value.position,
    `${context}, position ${positionIndex + 1} coordinate`,
    0
  );
  const durationName = requireString(
    value.duration,
    `${context}, position ${positionIndex + 1} duration`
  );
  const durationDenominator = DURATION_DENOMINATORS[durationName];
  if (!durationDenominator) {
    fail(
      `${context}, position ${positionIndex + 1} uses unsupported duration ${durationName}.`,
      "UNSUPPORTED_POWERTAB_DURATION"
    );
  }

  const properties = parseProperties(
    value.properties,
    `${context}, position ${positionIndex + 1} properties`
  );
  const unsupportedProperties = properties.filter(
    (property) => !ALLOWED_POSITION_PROPERTIES.has(property)
  );
  if (unsupportedProperties.length > 0) {
    fail(
      `${context}, position ${positionIndex + 1} uses unsupported position properties: ${unsupportedProperties.join(", ")}.`,
      "UNSUPPORTED_POWERTAB_POSITION_PROPERTY"
    );
  }
  if (properties.includes("Dotted") && properties.includes("DoubleDotted")) {
    fail(
      `${context}, position ${positionIndex + 1} is both dotted and double-dotted.`,
      "CONTRADICTORY_POWERTAB_DURATION"
    );
  }
  const dots = properties.includes("DoubleDotted")
    ? 2
    : properties.includes("Dotted")
      ? 1
      : 0;
  const isRest = properties.includes("Rest");
  const multibarRest = requireInteger(
    value.multibar_rest ?? 0,
    `${context}, position ${positionIndex + 1} multibar rest`,
    0
  );
  if (multibarRest !== 0) {
    fail(
      `${context}, position ${positionIndex + 1} uses a multibar rest outside the bounded v11 profile.`,
      "UNSUPPORTED_POWERTAB_MULTIBAR_REST"
    );
  }
  if (value.volume_swell != null || value.tremolo_bar != null) {
    fail(
      `${context}, position ${positionIndex + 1} contains an unsupported volume-swell or tremolo-bar structure.`,
      "UNSUPPORTED_POWERTAB_POSITION_STRUCTURE"
    );
  }

  const notes = requireArray(
    value.notes,
    `${context}, position ${positionIndex + 1} notes`
  ).map((note, noteIndex) =>
    parseNote(
      note,
      noteIndex,
      `${context}, position ${positionIndex + 1}`,
      stringCount
    )
  );
  const noteStrings = notes.map((note) => note.stringNumberLowToHigh);
  if (new Set(noteStrings).size !== noteStrings.length) {
    fail(
      `${context}, position ${positionIndex + 1} contains more than one note on the same string.`,
      "DUPLICATE_POWERTAB_STRING_AT_POSITION"
    );
  }
  if (isRest && notes.length > 0) {
    fail(
      `${context}, position ${positionIndex + 1} is marked as a rest but also contains notes.`,
      "CONTRADICTORY_POWERTAB_REST"
    );
  }
  if (!isRest && notes.length === 0) {
    fail(
      `${context}, position ${positionIndex + 1} contains neither a rest nor a note.`,
      "EMPTY_POWERTAB_POSITION"
    );
  }

  return {
    sourcePosition,
    durationDenominator,
    dots,
    tupletNumerator: -1,
    tupletDenominator: -1,
    graceType: "none",
    isRest,
    techniques: techniquesFromPosition(properties),
    notes,
  };
}

export function parseVoices(staff, context, stringCount) {
  return fixedArray(staff.voices, 2, `${context} voices`).map(
    (voice, voiceIndex) => {
      const value = requireObject(voice, `${context}, voice ${voiceIndex + 1}`);
      const irregular = requireOptionalArray(
        value.irregular_groupings,
        `${context}, voice ${voiceIndex + 1} irregular groupings`
      );
      if (irregular.length > 0) {
        fail(
          `${context}, voice ${voiceIndex + 1} uses irregular grouping outside the bounded v11 profile.`,
          "UNSUPPORTED_POWERTAB_IRREGULAR_GROUPING"
        );
      }
      const positions = requireArray(
        value.positions,
        `${context}, voice ${voiceIndex + 1} positions`
      ).map((position, positionIndex) =>
        parsePosition(
          position,
          positionIndex,
          `${context}, voice ${voiceIndex + 1}`,
          stringCount
        )
      );
      const coordinates = positions.map((position) => position.sourcePosition);
      for (let index = 1; index < coordinates.length; index += 1) {
        if (coordinates[index] <= coordinates[index - 1]) {
          fail(
            `${context}, voice ${voiceIndex + 1} positions are not in strictly increasing source order.`,
            "AMBIGUOUS_POWERTAB_POSITION_ORDER"
          );
        }
      }
      return { index: voiceIndex, positions };
    }
  );
}


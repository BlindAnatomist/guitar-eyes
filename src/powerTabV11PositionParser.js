import {
  ALLOWED_NOTE_PROPERTIES,
  ALLOWED_POSITION_PROPERTIES,
  DURATION_DENOMINATORS,
  NOTE_TECHNIQUES,
  POSITION_TECHNIQUES,
  fail,
  fixedArray,
  requireArray,
  requireInteger,
  requireObject,
  requireOptionalArray,
  requireString,
} from "./powerTabV11Schema";

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
  if (
    value.tapped_harmonic != null ||
    value.artificial_harmonic != null ||
    value.bend != null
  ) {
    fail(
      `${context}, note ${noteIndex + 1} contains a harmonic or bend outside the bounded fixture-proven profile.`,
      "UNSUPPORTED_POWERTAB_NOTE_STRUCTURE"
    );
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
  const dots = 0;
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

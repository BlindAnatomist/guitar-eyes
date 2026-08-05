import { PowerTabImportError } from "./powerTabErrors";

export const DURATION_DENOMINATORS = Object.freeze({
  Half: 2,
  Quarter: 4,
  Eighth: 8,
});

export const POSITION_TECHNIQUES = Object.freeze({
  PalmMuting: "palm mute",
});

export const NOTE_TECHNIQUES = Object.freeze({});

export const ALLOWED_POSITION_PROPERTIES = new Set([
  "Rest",
  ...Object.keys(POSITION_TECHNIQUES),
]);

export const ALLOWED_NOTE_PROPERTIES = new Set(Object.keys(NOTE_TECHNIQUES));

export const ALLOWED_BAR_TYPES = new Set([
  "SingleBar",
  "DoubleBar",
  "DoubleBarFine",
]);

export const TICKS_PER_QUARTER = 960;
export const ALLOWED_TIME_SIGNATURE_DENOMINATORS = new Set([1, 2, 4, 8, 16, 32, 64]);

export function fail(message, code = "INVALID_POWERTAB_V11") {
  throw new PowerTabImportError(message, code);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function requireObject(value, label) {
  if (!isObject(value)) {
    fail(`${label} must be an object.`);
  }
  return value;
}

export function requireArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
  }
  return value;
}

export function requireInteger(value, label, minimum = null, maximum = null) {
  if (
    !Number.isInteger(value) ||
    (minimum !== null && value < minimum) ||
    (maximum !== null && value > maximum)
  ) {
    fail(`${label} contains an invalid integer value.`);
  }
  return value;
}

export function requireString(value, label) {
  if (typeof value !== "string") {
    fail(`${label} must be a string.`);
  }
  return value;
}

export function requireBoolean(value, label) {
  if (typeof value !== "boolean") {
    fail(`${label} must be a boolean.`);
  }
  return value;
}

export function requireOptionalArray(value, label) {
  if (value == null) return [];
  return requireArray(value, label);
}

export function fixedArray(value, count, label) {
  const object = requireObject(value, label);
  const expectedKeys = Array.from({ length: count }, (_, index) =>
    String(index)
  );
  const keys = Object.keys(object).sort();
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key, index) => key !== expectedKeys[index])
  ) {
    fail(
      `${label} must contain exactly the object-indexed entries ${expectedKeys.join(
        ", "
      )}.`,
      "INVALID_POWERTAB_FIXED_ARRAY"
    );
  }
  return expectedKeys.map((key) => object[key]);
}


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
  requireInteger(
    value.max_volume,
    `Player ${index + 1} maximum volume`,
    0,
    127
  );
  requireInteger(value.pan, `Player ${index + 1} pan`, 0, 127);
  const tuning = requireObject(value.tuning, `Player ${index + 1} tuning`);
  requireString(tuning.name, `Player ${index + 1} tuning name`);
  requireBoolean(tuning.sharps, `Player ${index + 1} accidental preference`);
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

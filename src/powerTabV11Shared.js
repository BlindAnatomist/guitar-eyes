import { PowerTabImportError } from "./powerTabErrors";


export const DURATION_DENOMINATORS = Object.freeze({
  Whole: 1,
  Half: 2,
  Quarter: 4,
  Eighth: 8,
  Sixteenth: 16,
  ThirtySecond: 32,
  SixtyFourth: 64,
});

export const POSITION_TECHNIQUES = Object.freeze({
  Vibrato: "vibrato",
  WideVibrato: "vibrato",
  PalmMuting: "palm mute",
  Tap: "tap",
  LetRing: "let ring",
});

export const NOTE_TECHNIQUES = Object.freeze({
  NaturalHarmonic: "harmonic",
  ShiftSlide: "slide",
  LegatoSlide: "slide",
});

export const ALLOWED_POSITION_PROPERTIES = new Set([
  "Dotted",
  "DoubleDotted",
  "Rest",
  ...Object.keys(POSITION_TECHNIQUES),
]);

export const ALLOWED_NOTE_PROPERTIES = new Set([
  "Muted",
  ...Object.keys(NOTE_TECHNIQUES),
]);

export const ALLOWED_BAR_TYPES = new Set([
  "SingleBar",
  "DoubleBar",
  "RepeatStart",
  "RepeatEnd",
  "DoubleBarFine",
]);

export const TICKS_PER_QUARTER = 960;
export const ALLOWED_TIME_SIGNATURE_DENOMINATORS = new Set([1, 2, 4, 8, 16, 32, 64]);

export function fail(message, code = "INVALID_POWERTAB_V11") {
  throw new PowerTabImportError(message, code);
}

export function isObject(value) {
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


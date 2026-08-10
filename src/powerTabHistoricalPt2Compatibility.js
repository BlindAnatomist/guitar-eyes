import { PowerTabImportError } from "./powerTabErrors";

const CLEF_TYPES = ["Treble", "Bass"];
const BAR_TYPES = [
  "SingleBar",
  "DoubleBar",
  "FreeTimeBar",
  "RepeatStart",
  "RepeatEnd",
  "DoubleBarFine",
];
const KEY_TYPES = ["Major", "Minor"];
const METER_TYPES = ["Normal", "CutTime", "CommonTime"];
const DURATIONS = new Map([
  [1, "Whole"],
  [2, "Half"],
  [4, "Quarter"],
  [8, "Eighth"],
  [16, "Sixteenth"],
  [32, "ThirtySecond"],
  [64, "SixtyFourth"],
]);

export const HISTORICAL_POSITION_PROPERTIES = Object.freeze([
  "Dotted",
  "DoubleDotted",
  "Rest",
  "Vibrato",
  "WideVibrato",
  "ArpeggioUp",
  "ArpeggioDown",
  "PickStrokeUp",
  "PickStrokeDown",
  "Staccato",
  "Marcato",
  "Sforzando",
  "TremoloPicking",
  "PalmMuting",
  "Tap",
  "Acciaccatura",
  "TripletFeelFirst",
  "TripletFeelSecond",
  "LetRing",
  "Fermata",
]);

export const HISTORICAL_NOTE_PROPERTIES = Object.freeze([
  "Tied",
  "Muted",
  "HammerOnOrPullOff",
  "HammerOnFromNowhere",
  "PullOffToNowhere",
  "NaturalHarmonic",
  "GhostNote",
  "Octave8va",
  "Octave15ma",
  "Octave8vb",
  "Octave15mb",
  "SlideIntoFromBelow",
  "SlideIntoFromAbove",
  "ShiftSlide",
  "LegatoSlide",
  "SlideOutOfDownwards",
  "SlideOutOfUpwards",
]);

export const HISTORICAL_PT2_MILESTONE_COMMITS = Object.freeze({
  1: "8f780d0f36157e9209662908994c6c27ced184ff",
  2: "84236e64c72a6d933ef3ca3b358e28fef3786f07",
  3: "044c1d30ee6a0374e02154d47f7ebcc4b80296e8",
  4: "17a2e1bf49a417f2dc5244f7a9868d24edc839ce",
  5: "42d2f00195efd4bb7c5aae65b2d6e36a5b7db935",
  6: "0152c3320e48368e93752382d16fd4e1d71ef538",
  7: "17219c446434f6ec0c6cb52e14770759219015de",
  8: "bca17cbb1b2ddfbd1f273bb9eda427044ed7a446",
  9: "228836ac7c18a59873d1c0231580c854d262e872",
  10: "ad7e051e1f1bb784c54b1ee564ef19682258dff8",
});

function fail(message, code = "INVALID_HISTORICAL_POWERTAB_PT2") {
  throw new PowerTabImportError(message, code);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isObject(value)) fail(`${label} must be an object.`);
  return value;
}

function enumName(value, names, label) {
  if (!Number.isInteger(value) || value < 0 || value >= names.length) {
    fail(`${label} contains unsupported historical enum value ${String(value)}.`);
  }
  return names[value];
}

function durationName(value, label) {
  const name = DURATIONS.get(value);
  if (!name) {
    fail(`${label} contains unsupported historical duration ${String(value)}.`);
  }
  return name;
}

export function decodeHistoricalFlagString(value, names, label = "PowerTab flags") {
  if (
    typeof value !== "string" ||
    value.length !== names.length ||
    !/^[01]+$/u.test(value)
  ) {
    fail(
      `${label} must be the exact ${names.length}-bit string emitted by the historical PowerTab writer.`,
      "INVALID_HISTORICAL_POWERTAB_FLAGS"
    );
  }

  return names.filter((name, bitIndex) => {
    const stringIndex = names.length - 1 - bitIndex;
    return value[stringIndex] === "1";
  });
}

function canonicalizeNote(note, version, context) {
  const value = requireObject(note, context);
  if (version < 10) {
    value.properties = decodeHistoricalFlagString(
      value.properties,
      HISTORICAL_NOTE_PROPERTIES,
      `${context} properties`
    );
    if (value.trill === -1) value.trill = null;
    if (value.tapped_harmonic === -1) value.tapped_harmonic = null;
  }
  return value;
}

function canonicalizePosition(position, version, context) {
  const value = requireObject(position, context);
  if (version < 10) {
    value.duration = durationName(value.duration, `${context} duration`);
    value.properties = decodeHistoricalFlagString(
      value.properties,
      HISTORICAL_POSITION_PROPERTIES,
      `${context} properties`
    );
  }
  if (Array.isArray(value.notes)) {
    value.notes.forEach((note, noteIndex) =>
      canonicalizeNote(note, version, `${context}, note ${noteIndex + 1}`)
    );
  }
  return value;
}

function canonicalizeStaff(staff, version, context) {
  const value = requireObject(staff, context);
  if (version < 3) {
    if (value.view_type !== 0) {
      fail(
        `${context} uses historical staff view ${String(
          value.view_type
        )}; the bounded historical .pt2 checkpoint accepts GuitarView only.`,
        "UNSUPPORTED_HISTORICAL_POWERTAB_STAFF_VIEW"
      );
    }
    delete value.view_type;
  }
  if (version < 10) {
    value.clef_type = enumName(value.clef_type, CLEF_TYPES, `${context} clef`);
  }

  const voices = requireObject(value.voices, `${context} voices`);
  Object.entries(voices).forEach(([voiceKey, voice]) => {
    const voiceValue = requireObject(voice, `${context}, voice ${voiceKey}`);
    if (Array.isArray(voiceValue.positions)) {
      voiceValue.positions.forEach((position, positionIndex) =>
        canonicalizePosition(
          position,
          version,
          `${context}, voice ${voiceKey}, position ${positionIndex + 1}`
        )
      );
    }
  });
  return value;
}

function canonicalizeBarline(barline, version, context) {
  const value = requireObject(barline, context);
  if (version < 10) {
    value.bar_type = enumName(value.bar_type, BAR_TYPES, `${context} type`);
    const key = requireObject(value.key_signature, `${context} key signature`);
    key.key_type = enumName(key.key_type, KEY_TYPES, `${context} key type`);
    const time = requireObject(value.time_signature, `${context} time signature`);
    time.meter_type = enumName(
      time.meter_type,
      METER_TYPES,
      `${context} meter type`
    );
  }
  return value;
}

export function canonicalizeHistoricalPowerTabDocument(root) {
  let document;
  try {
    document = JSON.parse(JSON.stringify(root));
  } catch {
    fail("The historical PowerTab document could not be copied as JSON.");
  }
  const version = document?.version;
  if (!Number.isInteger(version) || version < 1 || version > 10) {
    fail(
      `Historical PowerTab compatibility accepts exact internal versions 1 through 10; received ${String(
        version ?? "missing"
      )}.`,
      "UNTESTED_POWERTAB_VERSION"
    );
  }

  const score = requireObject(document.score, "PowerTab score");
  if (!Array.isArray(score.systems)) fail("PowerTab score systems must be an array.");

  score.systems.forEach((system, systemIndex) => {
    const systemValue = requireObject(system, `System ${systemIndex + 1}`);
    if (!Array.isArray(systemValue.barlines)) {
      fail(`System ${systemIndex + 1} barlines must be an array.`);
    }
    systemValue.barlines.forEach((barline, barlineIndex) =>
      canonicalizeBarline(
        barline,
        version,
        `System ${systemIndex + 1}, barline ${barlineIndex + 1}`
      )
    );
    if (!Array.isArray(systemValue.staves)) {
      fail(`System ${systemIndex + 1} staves must be an array.`);
    }
    systemValue.staves.forEach((staff, staffIndex) =>
      canonicalizeStaff(
        staff,
        version,
        `System ${systemIndex + 1}, staff ${staffIndex + 1}`
      )
    );
  });

  return document;
}

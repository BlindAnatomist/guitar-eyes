import { PowerTabImportError } from "./powerTabErrors";

const SOURCE_VERSION = "PTB_V17";
const UPSTREAM_RELEASE = "2.0.22";
const UPSTREAM_COMMIT = "13cab27c7127d301f2747671071e53eb203dc940";
const TICKS_PER_QUARTER = 960;
const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];
const SUPPORTED_DURATIONS = new Set([2, 4, 8]);
const MAX_STRING_BYTES = 64 * 1024;
const MAX_VECTOR_ITEMS = 50000;

function fail(message, code = "INVALID_POWERTAB_LEGACY_V17") {
  throw new PowerTabImportError(message, code);
}

class Reader {
  constructor(bytes) {
    this.bytes = bytes;
    this.offset = 0;
  }

  require(count, label = "data") {
    if (
      !Number.isInteger(count) ||
      count < 0 ||
      this.offset + count > this.bytes.length
    ) {
      fail(
        `The legacy PowerTab file ended unexpectedly while reading ${label}.`,
        "TRUNCATED_POWERTAB_LEGACY"
      );
    }
  }

  take(count, label) {
    this.require(count, label);
    const value = this.bytes.subarray(this.offset, this.offset + count);
    this.offset += count;
    return value;
  }

  u8(label) {
    return this.take(1, label)[0];
  }

  i8(label) {
    const value = this.u8(label);
    return value > 127 ? value - 256 : value;
  }

  u16(label) {
    const bytes = this.take(2, label);
    return bytes[0] | (bytes[1] << 8);
  }

  u32(label) {
    const bytes = this.take(4, label);
    return (
      bytes[0] |
      (bytes[1] << 8) |
      (bytes[2] << 16) |
      (bytes[3] << 24)
    ) >>> 0;
  }

  i32(label) {
    return this.u32(label) | 0;
  }

  bool(label) {
    const value = this.u8(label);
    if (value !== 0 && value !== 1) {
      fail(
        `${label} contains an invalid boolean value.`,
        "INVALID_POWERTAB_LEGACY_BOOLEAN"
      );
    }
    return value === 1;
  }

  count(label, maximum = MAX_VECTOR_ITEMS) {
    let value = this.u16(label);
    if (value === 0xffff) value = this.u32(label);
    if (value > maximum) {
      fail(
        `${label} contains ${value} entries; the bounded limit is ${maximum}.`,
        "POWERTAB_LEGACY_COUNT_LIMIT"
      );
    }
    return value;
  }

  string(label) {
    let length = this.u8(`${label} length`);
    if (length === 0xff) {
      length = this.u16(`${label} length`);
      if (length === 0xffff) length = this.u32(`${label} length`);
    }
    if (length > MAX_STRING_BYTES) {
      fail(
        `${label} exceeds the bounded string limit.`,
        "POWERTAB_LEGACY_STRING_LIMIT"
      );
    }
    const raw = this.take(length, label);
    let value = "";
    for (const byte of raw) value += String.fromCharCode(byte);
    return value;
  }
}

class ClassMap {
  constructor() {
    this.next = 1;
    this.classes = new Map();
  }

  read(reader, expected, context) {
    const tag = reader.u16(`${context} class tag`);
    let name;

    if (tag === 0xffff) {
      const schema = reader.u16(`${context} class schema`);
      if (schema !== 1) {
        fail(
          `${context} uses unsupported MFC class schema ${schema}.`,
          "UNSUPPORTED_POWERTAB_LEGACY_CLASS_SCHEMA"
        );
      }
      const length = reader.u16(`${context} class name length`);
      if (length === 0 || length > 128) {
        fail(
          `${context} has an invalid MFC class name.`,
          "INVALID_POWERTAB_LEGACY_CLASS"
        );
      }
      name = String.fromCharCode(
        ...reader.take(length, `${context} class name`)
      );
      this.classes.set(this.next, name);
      this.next += 1;
    } else if ((tag & 0x8000) !== 0) {
      const index = tag & 0x7fff;
      name = this.classes.get(index);
      if (!name) {
        fail(
          `${context} references unknown MFC class ${index}.`,
          "INVALID_POWERTAB_LEGACY_CLASS_REFERENCE"
        );
      }
    } else {
      fail(
        `${context} uses an unsupported MFC object reference tag.`,
        "UNSUPPORTED_POWERTAB_LEGACY_OBJECT_REFERENCE"
      );
    }

    this.next += 1;
    if (name !== expected) {
      fail(
        `${context} uses MFC class ${name}; expected ${expected}.`,
        "UNSUPPORTED_POWERTAB_LEGACY_CLASS"
      );
    }
  }
}

function parseTimeSignature(reader, context) {
  const data = reader.u32(`${context} time signature`);
  const pulses = reader.u8(`${context} pulses`);
  const common = (data & 0x400000) !== 0;
  const cut = (data & 0x800000) !== 0;
  const numerator = common ? 4 : cut ? 2 : ((data & 0xf8000000) >>> 27) + 1;
  const denominator = common
    ? 4
    : cut
      ? 2
      : 2 ** ((data & 0x07000000) >>> 24);

  if (numerator !== 4 || denominator !== 4 || pulses !== 4) {
    fail(
      `${context} uses ${numerator}/${denominator} or nonstandard pulses outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_TIME_SIGNATURE"
    );
  }
  return { numerator, denominator };
}

function parseBarline(reader, context) {
  const position = reader.u8(`${context} position`);
  const data = reader.u8(`${context} data`);
  const key = reader.u8(`${context} key signature`);
  if (key !== 0) {
    fail(
      `${context} uses a key-signature change outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_KEY_SIGNATURE"
    );
  }
  const timeSignature = parseTimeSignature(reader, context);
  const rehearsal = reader.i8(`${context} rehearsal marker`);
  const rehearsalText = reader.string(`${context} rehearsal text`);
  if (rehearsal !== 127 || rehearsalText !== "") {
    fail(
      `${context} uses rehearsal-sign data outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_REHEARSAL_SIGN"
    );
  }
  const barType = data >>> 5;
  const repeatCount = data & 0x1f;
  if (barType !== 0 || repeatCount !== 0) {
    fail(
      `${context} uses repeat or non-simple barline data outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_BARLINE"
    );
  }
  return {
    position,
    numerator: timeSignature.numerator,
    denominator: timeSignature.denominator,
  };
}

function parseNote(reader, classes, context, stringCount) {
  classes.read(reader, "CLineData", context);
  const packed = reader.u8(`${context} packed string and fret`);
  const stringIndex = packed >>> 5;
  const fret = packed & 0x1f;
  if (stringIndex >= stringCount) {
    fail(
      `${context} references string ${stringIndex + 1} outside the ${stringCount}-string staff.`,
      "POWERTAB_LEGACY_STRING_OUT_OF_RANGE"
    );
  }
  const simple = reader.u16(`${context} simple technique flags`);
  if (simple !== 0) {
    fail(
      `${context} uses note techniques outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_NOTE_TECHNIQUE"
    );
  }
  const complexCount = reader.u8(`${context} complex symbol count`);
  if (complexCount !== 3) {
    fail(
      `${context} reports ${complexCount} complex symbol slots; expected 3.`,
      "INVALID_POWERTAB_LEGACY_NOTE_STRUCTURE"
    );
  }
  for (let index = 0; index < complexCount; index += 1) {
    if (reader.u32(`${context} complex symbol ${index + 1}`) !== 0) {
      fail(
        `${context} uses a complex note symbol outside the first v1.7 profile.`,
        "UNSUPPORTED_POWERTAB_LEGACY_NOTE_TECHNIQUE"
      );
    }
  }
  return {
    stringNumberLowToHigh: stringCount - stringIndex,
    fret,
    visible: true,
    isDead: false,
    techniques: [],
  };
}

function parsePosition(reader, classes, context, stringCount) {
  classes.read(reader, "CPosition", context);
  const sourcePosition = reader.u8(`${context} coordinate`);
  const beaming = reader.u16(`${context} beaming`);
  if (beaming !== 0) {
    fail(
      `${context} uses beaming data outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_BEAMING"
    );
  }

  const raw = reader.u32(`${context} position data`);
  const durationDenominator = raw >>> 24;
  const flags = raw & 0xffffff;
  if (!SUPPORTED_DURATIONS.has(durationDenominator)) {
    fail(
      `${context} uses unsupported duration denominator ${durationDenominator}.`,
      "UNSUPPORTED_POWERTAB_LEGACY_DURATION"
    );
  }
  if ((flags & ~0x04) !== 0) {
    fail(
      `${context} uses position flags outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_POSITION_PROPERTY"
    );
  }
  const isRest = (flags & 0x04) !== 0;

  const complexCount = reader.u8(`${context} complex symbol count`);
  if (complexCount !== 2) {
    fail(
      `${context} reports ${complexCount} complex symbol slots; expected 2.`,
      "INVALID_POWERTAB_LEGACY_POSITION_STRUCTURE"
    );
  }
  for (let index = 0; index < complexCount; index += 1) {
    if (reader.u32(`${context} complex symbol ${index + 1}`) !== 0) {
      fail(
        `${context} uses a complex position symbol outside the first v1.7 profile.`,
        "UNSUPPORTED_POWERTAB_LEGACY_POSITION_PROPERTY"
      );
    }
  }

  const noteCount = reader.count(`${context} notes`, stringCount);
  const notes = [];
  for (let index = 0; index < noteCount; index += 1) {
    notes.push(
      parseNote(reader, classes, `${context}, note ${index + 1}`, stringCount)
    );
  }
  if (isRest && notes.length > 0) {
    fail(
      `${context} is marked as a rest but also contains notes.`,
      "CONTRADICTORY_POWERTAB_LEGACY_REST"
    );
  }
  if (!isRest && notes.length === 0) {
    fail(
      `${context} contains neither a rest nor a note.`,
      "EMPTY_POWERTAB_LEGACY_POSITION"
    );
  }
  const usedStrings = new Set();
  for (const note of notes) {
    if (usedStrings.has(note.stringNumberLowToHigh)) {
      fail(
        `${context} contains more than one note on the same string.`,
        "DUPLICATE_POWERTAB_LEGACY_STRING_AT_POSITION"
      );
    }
    usedStrings.add(note.stringNumberLowToHigh);
  }

  return {
    sourcePosition,
    durationDenominator,
    dots: 0,
    tupletNumerator: -1,
    tupletDenominator: -1,
    graceType: "none",
    isRest,
    techniques: [],
    notes,
  };
}

function parseStaff(reader, classes, context, stringCount) {
  classes.read(reader, "CStaff", context);
  const data = reader.u8(`${context} staff data`);
  if (data !== 0x06) {
    fail(
      `${context} is not the bounded six-string treble tablature staff.`,
      "UNSUPPORTED_POWERTAB_LEGACY_STAFF"
    );
  }
  reader.take(4, `${context} staff spacing`);

  const voices = [];
  for (let voiceIndex = 0; voiceIndex < 2; voiceIndex += 1) {
    const count = reader.count(
      `${context} voice ${voiceIndex + 1} positions`,
      1000
    );
    const positions = [];
    for (let index = 0; index < count; index += 1) {
      positions.push(
        parsePosition(
          reader,
          classes,
          `${context}, voice ${voiceIndex + 1}, position ${index + 1}`,
          stringCount
        )
      );
    }
    voices.push({ index: voiceIndex, positions });
  }

  if (voices[1].positions.length !== 0) {
    fail(
      `${context} contains a second active voice outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_MULTIVOICE"
    );
  }
  const coordinates = voices[0].positions.map(
    (position) => position.sourcePosition
  );
  for (let index = 1; index < coordinates.length; index += 1) {
    if (coordinates[index] <= coordinates[index - 1]) {
      fail(
        `${context} positions are not in strictly increasing source order.`,
        "AMBIGUOUS_POWERTAB_LEGACY_POSITION_ORDER"
      );
    }
  }
  return voices[0];
}

function readEmptyVector(reader, label) {
  const count = reader.count(label, 1000);
  if (count !== 0) {
    fail(
      `${label} contains ${count} entries outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_SCORE_STRUCTURE"
    );
  }
}

function parseGuitar(reader, classes, context) {
  classes.read(reader, "CGuitar", context);
  const number = reader.u8(`${context} number`);
  if (number !== 0) {
    fail(
      `${context} uses unexpected player number ${number}.`,
      "UNSUPPORTED_POWERTAB_LEGACY_PLAYER"
    );
  }
  const description = reader.string(`${context} description`) || "PowerTab Guitar";
  const preset = reader.u8(`${context} preset`);
  const volume = reader.u8(`${context} volume`);
  const pan = reader.u8(`${context} pan`);
  reader.take(4, `${context} effects`);
  const capo = reader.u8(`${context} capo`);
  if (capo !== 0) {
    fail(
      `${context} uses capo ${capo} outside the first v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_CAPO"
    );
  }
  const tuningName = reader.string(`${context} tuning name`);
  reader.u8(`${context} tuning data`);
  const stringCount = reader.u8(`${context} string count`);
  if (stringCount !== 6) {
    fail(
      `${context} reports ${stringCount} strings; the first v1.7 profile accepts six-string guitar only.`,
      "UNSUPPORTED_POWERTAB_LEGACY_STRING_COUNT"
    );
  }
  const tuning = [
    ...reader.take(stringCount, `${context} tuning pitches`),
  ];
  if (tuning.some((value, index) => value !== STANDARD_GUITAR[index])) {
    fail(
      `${context} uses tuning outside exact standard E4 B3 G3 D3 A2 E2.`,
      "UNSUPPORTED_POWERTAB_LEGACY_TUNING"
    );
  }
  if (preset > 127 || volume > 127 || pan > 127 || !tuningName) {
    fail(
      `${context} contains invalid player metadata.`,
      "INVALID_POWERTAB_LEGACY_PLAYER"
    );
  }
  return {
    name: description,
    shortName: description,
    isPercussion: false,
    tuningMidiHighToLow: tuning,
  };
}

function durationTicks(beat) {
  return (4 * TICKS_PER_QUARTER) / beat.durationDenominator;
}

function splitBars(positions, startBar, internalBars) {
  const starts = [startBar.position, ...internalBars.map((bar) => bar.position)];
  if (starts[0] !== 0) {
    fail(
      "The first v1.7 profile requires the system to begin at source coordinate 0.",
      "UNSUPPORTED_POWERTAB_LEGACY_BARLINE"
    );
  }
  for (let index = 1; index < starts.length; index += 1) {
    if (starts[index] <= starts[index - 1]) {
      fail(
        "Legacy PowerTab barlines are not in strictly increasing source order.",
        "AMBIGUOUS_POWERTAB_LEGACY_BARLINE_ORDER"
      );
    }
  }

  let absoluteTick = 0;
  return starts.map((start, index) => {
    const end = index + 1 < starts.length ? starts[index + 1] : Infinity;
    const selected = positions.filter(
      (position) =>
        position.sourcePosition >= start && position.sourcePosition < end
    );
    if (selected.length === 0) {
      fail(
        `Measure ${index + 1} contains no positions in the first v1.7 profile.`,
        "EMPTY_POWERTAB_LEGACY_MEASURE"
      );
    }

    let relativeTick = 0;
    const beats = selected.map((position) => {
      const beat = { ...position, startTicks: absoluteTick + relativeTick };
      relativeTick += durationTicks(position);
      return beat;
    });
    if (relativeTick !== 4 * TICKS_PER_QUARTER) {
      fail(
        `Measure ${index + 1} totals ${relativeTick} ticks; the first v1.7 profile requires complete 4/4 measures.`,
        "UNSUPPORTED_POWERTAB_LEGACY_MEASURE_DURATION"
      );
    }
    absoluteTick += 4 * TICKS_PER_QUARTER;

    return {
      sourceNumber: index + 1,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      repeatStart: false,
      repeatCount: 0,
      alternateEndings: 0,
      voices: [
        { index: 0, beats },
        { index: 1, beats: [] },
      ],
    };
  });
}

function parseSystem(reader, classes, context, guitar) {
  classes.read(reader, "CSection", context);
  reader.take(16, `${context} rectangle`);
  const endBar = reader.u8(`${context} end bar`);
  const endType = endBar >>> 5;
  const endRepeat = endBar & 0x1f;
  if (![0, 1].includes(endType) || endRepeat !== 0) {
    fail(
      `${context} uses an unsupported final barline.`,
      "UNSUPPORTED_POWERTAB_LEGACY_BARLINE"
    );
  }
  reader.take(4, `${context} spacing`);

  const startBar = parseBarline(reader, `${context} start bar`);
  readEmptyVector(reader, `${context} directions`);
  readEmptyVector(reader, `${context} chord text`);
  readEmptyVector(reader, `${context} rhythm slashes`);

  const staffCount = reader.count(`${context} staves`, 8);
  if (staffCount !== 1) {
    fail(
      `${context} contains ${staffCount} staves; the first v1.7 profile requires one.`,
      "UNSUPPORTED_POWERTAB_LEGACY_STAFF_COUNT"
    );
  }
  const voice = parseStaff(
    reader,
    classes,
    `${context}, staff 1`,
    guitar.tuningMidiHighToLow.length
  );

  const barlineCount = reader.count(`${context} internal barlines`, 64);
  const internalBars = [];
  for (let index = 0; index < barlineCount; index += 1) {
    classes.read(
      reader,
      "CMusicBar",
      `${context}, internal barline ${index + 1}`
    );
    internalBars.push(
      parseBarline(reader, `${context}, internal barline ${index + 1}`)
    );
  }
  return splitBars(voice.positions, startBar, internalBars);
}

function parseScore(reader, classes, context, { allowContent }) {
  const guitarCount = reader.count(`${context} guitars`, 32);
  if (allowContent) {
    if (guitarCount !== 1) {
      fail(
        `${context} contains ${guitarCount} guitars; the first v1.7 profile requires exactly one.`,
        "UNSUPPORTED_POWERTAB_LEGACY_PLAYER_COUNT"
      );
    }
  } else if (guitarCount !== 0) {
    fail(
      `${context} must be empty in the first guitar-only v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_BASS_SCORE"
    );
  }

  let guitar = null;
  for (let index = 0; index < guitarCount; index += 1) {
    guitar = parseGuitar(reader, classes, `${context}, guitar ${index + 1}`);
  }
  for (const label of [
    "chord diagrams",
    "floating text",
    "guitar-in",
    "tempo markers",
    "dynamic symbols",
    "alternate endings",
  ]) {
    readEmptyVector(reader, `${context} ${label}`);
  }

  const systemCount = reader.count(`${context} systems`, 256);
  if (allowContent) {
    if (systemCount !== 1) {
      fail(
        `${context} contains ${systemCount} systems; the first v1.7 profile requires exactly one.`,
        "UNSUPPORTED_POWERTAB_LEGACY_SYSTEM_COUNT"
      );
    }
  } else if (systemCount !== 0) {
    fail(
      `${context} must not contain systems in the first guitar-only v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_BASS_SCORE"
    );
  }

  const bars = [];
  for (let index = 0; index < systemCount; index += 1) {
    bars.push(
      ...parseSystem(
        reader,
        classes,
        `${context}, system ${index + 1}`,
        guitar
      )
    );
  }
  return guitar
    ? {
        ...guitar,
        staves: [{ tuningMidiHighToLow: guitar.tuningMidiHighToLow, bars }],
      }
    : null;
}

function parseHeader(reader) {
  const marker = reader.u32("PowerTab marker");
  if (marker !== 0x62617470) {
    fail(
      "The selected .ptb file does not contain the PowerTab ptab marker.",
      "INVALID_POWERTAB_LEGACY_MARKER"
    );
  }

  const version = reader.u16("PowerTab file version");
  if (version !== 4) {
    if ([1, 2, 3].includes(version)) {
      fail(
        `The legacy PowerTab file reports historical version value ${version}. This checkpoint accepts PowerTab 1.7 value 4 only.`,
        "UNTESTED_POWERTAB_LEGACY_VERSION"
      );
    }
    fail(
      `The legacy PowerTab file reports unsupported version value ${version}.`,
      "INVALID_POWERTAB_LEGACY_VERSION"
    );
  }

  const fileType = reader.u8("PowerTab file type");
  if (fileType !== 0) {
    fail(
      "The first legacy PowerTab v1.7 profile accepts song files only.",
      "UNSUPPORTED_POWERTAB_LEGACY_FILE_TYPE"
    );
  }
  const contentType = reader.u8("PowerTab content type");
  if (contentType !== 1) {
    fail(
      "The first legacy PowerTab v1.7 profile accepts guitar-only content.",
      "UNSUPPORTED_POWERTAB_LEGACY_CONTENT_TYPE"
    );
  }

  const title = reader.string("song title");
  const artist = reader.string("song artist");
  const releaseType = reader.u8("release type");
  if (releaseType === 0) {
    reader.u8("audio release type");
    reader.string("audio release title");
    reader.u16("audio release year");
    reader.bool("audio live flag");
  } else if (releaseType === 1) {
    reader.string("video release title");
    reader.bool("video live flag");
  } else if (releaseType === 2) {
    reader.string("bootleg title");
    reader.u8("bootleg month");
    reader.u8("bootleg day");
    reader.u16("bootleg year");
  } else if (releaseType !== 3) {
    fail(
      `The legacy PowerTab header contains invalid release type ${releaseType}.`,
      "INVALID_POWERTAB_LEGACY_HEADER"
    );
  }

  const authorType = reader.u8("author type");
  if (authorType === 0) {
    reader.string("composer");
    reader.string("lyricist");
  } else if (authorType !== 1) {
    fail(
      `The legacy PowerTab header contains invalid author type ${authorType}.`,
      "INVALID_POWERTAB_LEGACY_HEADER"
    );
  }
  reader.string("arranger");
  reader.string("guitar score transcriber");
  reader.string("bass score transcriber");
  reader.string("copyright");
  reader.string("lyrics");
  reader.string("guitar score notes");
  reader.string("bass score notes");

  return { title: title || "PowerTab 1.7 tablature", artist, version };
}

function parseFont(reader, context) {
  reader.string(`${context} face`);
  const pointSize = reader.i32(`${context} size`);
  const weight = reader.i32(`${context} weight`);
  reader.bool(`${context} italic`);
  reader.bool(`${context} underline`);
  reader.bool(`${context} strikeout`);
  reader.take(4, `${context} color`);
  if (pointSize < 1 || pointSize > 200 || weight < 0 || weight > 1000) {
    fail(
      `${context} contains invalid font metadata.`,
      "INVALID_POWERTAB_LEGACY_FOOTER"
    );
  }
}

export function decodePowerTabLegacyV17Bytes(
  input,
  { maxFileBytes = 5 * 1024 * 1024 } = {}
) {
  const bytes =
    input instanceof Uint8Array
      ? input
      : new Uint8Array(input || new ArrayBuffer(0));
  if (bytes.length === 0 || bytes.length > maxFileBytes) {
    fail(
      `The selected legacy PowerTab file must be between 1 and ${maxFileBytes} bytes.`,
      "POWERTAB_LEGACY_FILE_SIZE_LIMIT"
    );
  }

  const reader = new Reader(bytes);
  const classes = new ClassMap();
  const header = parseHeader(reader);
  const guitar = parseScore(reader, classes, "Guitar score", {
    allowContent: true,
  });
  parseScore(reader, classes, "Bass score", { allowContent: false });
  parseFont(reader, "Chord font");
  parseFont(reader, "Text font");
  parseFont(reader, "Music font");
  const lineSpacing = reader.i32("line spacing");
  reader.u32("fade in");
  reader.u32("fade out");
  if (lineSpacing < 1 || lineSpacing > 100) {
    fail(
      "The legacy PowerTab document contains invalid line spacing.",
      "INVALID_POWERTAB_LEGACY_FOOTER"
    );
  }
  if (reader.offset !== bytes.length) {
    fail(
      `The legacy PowerTab document contains ${bytes.length - reader.offset} trailing bytes outside the bounded v1.7 profile.`,
      "UNSUPPORTED_POWERTAB_LEGACY_TRAILING_DATA"
    );
  }

  const tracks = [guitar];
  const measureCount = guitar.staves[0].bars.length;
  return {
    schemaVersion: 1,
    sourceVersion: SOURCE_VERSION,
    versionEvidence: {
      schemaVersion: 1,
      containerFamily: "POWERTAB_LEGACY_MFC_BINARY",
      extensionFamily: ".ptb",
      serialization: "mfc-binary",
      marker: "ptab",
      fileVersion: 4,
      powerTabVersion: "1.7",
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
      independentSignature: "ptab-4",
      decodedTrackCount: tracks.length,
      decodedMeasureCount: measureCount,
    },
    title: header.title,
    tracks,
  };
}

export async function decodePowerTabLegacyV17File(file, options = {}) {
  if (!file || typeof file.arrayBuffer !== "function") {
    fail(
      "A readable legacy PowerTab .ptb file is required.",
      "INVALID_POWERTAB_LEGACY_FILE"
    );
  }
  if (!/\.ptb$/iu.test(String(file.name || ""))) {
    fail(
      "The legacy PowerTab v1.7 decoder accepts .ptb files only.",
      "INVALID_POWERTAB_LEGACY_EXTENSION"
    );
  }
  const maxFileBytes = options.maxFileBytes || 5 * 1024 * 1024;
  if (
    !Number.isInteger(file.size) ||
    file.size <= 0 ||
    file.size > maxFileBytes
  ) {
    fail(
      `The selected legacy PowerTab file must be between 1 and ${maxFileBytes} bytes.`,
      "POWERTAB_LEGACY_FILE_SIZE_LIMIT"
    );
  }
  return decodePowerTabLegacyV17Bytes(
    new Uint8Array(await file.arrayBuffer()),
    options
  );
}

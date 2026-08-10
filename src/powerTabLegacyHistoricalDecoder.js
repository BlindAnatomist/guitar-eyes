import { PowerTabImportError } from "./powerTabErrors";

const UPSTREAM_RELEASE = "2.0.22";
const UPSTREAM_COMMIT = "13cab27c7127d301f2747671071e53eb203dc940";
const TICKS_PER_QUARTER = 960;
const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];
const SUPPORTED_DURATIONS = new Set([2, 4, 8]);
const MAX_STRING_BYTES = 64 * 1024;
const MAX_VECTOR_ITEMS = 50000;

const VERSION_PROFILES = new Map([
  [1, { sourceVersion: "PTB_V10", powerTabVersion: "1.0", signature: "ptab-1" }],
  [2, { sourceVersion: "PTB_V102", powerTabVersion: "1.0.2", signature: "ptab-2" }],
  [3, { sourceVersion: "PTB_V15", powerTabVersion: "1.5", signature: "ptab-3" }],
]);

function fail(message, code = "INVALID_POWERTAB_LEGACY_HISTORICAL") {
  throw new PowerTabImportError(message, code);
}

class Reader {
  constructor(bytes) {
    this.bytes = bytes;
    this.offset = 0;
  }
  require(count, label = "data") {
    if (!Number.isInteger(count) || count < 0 || this.offset + count > this.bytes.length) {
      fail(
        `The historical PowerTab file ended unexpectedly while reading ${label}.`,
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
  u8(label) { return this.take(1, label)[0]; }
  i8(label) { const value = this.u8(label); return value > 127 ? value - 256 : value; }
  u16(label) { const b = this.take(2, label); return b[0] | (b[1] << 8); }
  u32(label) {
    const b = this.take(4, label);
    return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
  }
  i32(label) { return this.u32(label) | 0; }
  bool(label) {
    const value = this.u8(label);
    if (value !== 0 && value !== 1) {
      fail(`${label} contains an invalid boolean value.`, "INVALID_POWERTAB_LEGACY_BOOLEAN");
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
      fail(`${label} exceeds the bounded string limit.`, "POWERTAB_LEGACY_STRING_LIMIT");
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
        fail(`${context} uses unsupported MFC class schema ${schema}.`, "UNSUPPORTED_POWERTAB_LEGACY_CLASS_SCHEMA");
      }
      const length = reader.u16(`${context} class name length`);
      if (length === 0 || length > 128) {
        fail(`${context} has an invalid MFC class name.`, "INVALID_POWERTAB_LEGACY_CLASS");
      }
      name = String.fromCharCode(...reader.take(length, `${context} class name`));
      this.classes.set(this.next, name);
      this.next += 1;
    } else if ((tag & 0x8000) !== 0) {
      const index = tag & 0x7fff;
      name = this.classes.get(index);
      if (!name) {
        fail(`${context} references unknown MFC class ${index}.`, "INVALID_POWERTAB_LEGACY_CLASS_REFERENCE");
      }
    } else {
      fail(`${context} uses an unsupported MFC object reference tag.`, "UNSUPPORTED_POWERTAB_LEGACY_OBJECT_REFERENCE");
    }
    this.next += 1;
    if (name !== expected) {
      fail(`${context} uses MFC class ${name}; expected ${expected}.`, "UNSUPPORTED_POWERTAB_LEGACY_CLASS");
    }
  }
}

function parseModernTimeSignature(reader, context) {
  const data = reader.u32(`${context} time signature`);
  const pulses = reader.u8(`${context} pulses`);
  const common = (data & 0x400000) !== 0;
  const cut = (data & 0x800000) !== 0;
  const numerator = common ? 4 : cut ? 2 : ((data & 0xf8000000) >>> 27) + 1;
  const denominator = common ? 4 : cut ? 2 : 2 ** ((data & 0x07000000) >>> 24);
  if (numerator !== 4 || denominator !== 4 || pulses !== 4) {
    fail(`${context} uses a time signature outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_TIME_SIGNATURE");
  }
  return { numerator, denominator };
}

function parseModernBarline(reader, context) {
  const position = reader.u8(`${context} position`);
  const data = reader.u8(`${context} data`);
  const key = reader.u8(`${context} key signature`);
  if (key !== 0) {
    fail(`${context} uses a key-signature change outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_KEY_SIGNATURE");
  }
  const timeSignature = parseModernTimeSignature(reader, context);
  const rehearsal = reader.i8(`${context} rehearsal marker`);
  const rehearsalText = reader.string(`${context} rehearsal text`);
  if (rehearsal !== 127 || rehearsalText !== "") {
    fail(`${context} uses rehearsal-sign data outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_REHEARSAL_SIGN");
  }
  const barType = data >>> 5;
  const repeatCount = data & 0x1f;
  if (barType !== 0 || repeatCount !== 0) {
    fail(`${context} uses repeat or non-simple barline data outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_BARLINE");
  }
  return { position, numerator: timeSignature.numerator, denominator: timeSignature.denominator };
}

function parseOldBarline(reader, context) {
  const position = reader.u8(`${context} position`);
  const symbol = reader.u16(`${context} compact barline symbol`);
  const key = (symbol >>> 8) & 0xff;
  const data = symbol & 0xff;
  if (key !== 0 || data !== 0) {
    fail(`${context} uses key or repeat data outside the first historical 1.0/1.0.2 profile.`, "UNSUPPORTED_POWERTAB_LEGACY_BARLINE");
  }
  return { position, numerator: 4, denominator: 4 };
}

function parseNote(reader, classes, context, stringCount) {
  classes.read(reader, "CLineData", context);
  const packed = reader.u8(`${context} packed string and fret`);
  const stringIndex = packed >>> 5;
  const fret = packed & 0x1f;
  if (stringIndex >= stringCount) {
    fail(`${context} references a string outside the six-string staff.`, "POWERTAB_LEGACY_STRING_OUT_OF_RANGE");
  }
  if (reader.u16(`${context} simple technique flags`) !== 0) {
    fail(`${context} uses note techniques outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_NOTE_TECHNIQUE");
  }
  const complexCount = reader.u8(`${context} complex symbol count`);
  if (complexCount !== 3) {
    fail(`${context} reports ${complexCount} complex symbol slots; expected 3.`, "INVALID_POWERTAB_LEGACY_NOTE_STRUCTURE");
  }
  for (let index = 0; index < complexCount; index += 1) {
    if (reader.u32(`${context} complex symbol ${index + 1}`) !== 0) {
      fail(`${context} uses a complex note symbol outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_NOTE_TECHNIQUE");
    }
  }
  return { stringNumberLowToHigh: stringCount - stringIndex, fret, visible: true, isDead: false, techniques: [] };
}

function parsePosition(reader, classes, context, stringCount) {
  classes.read(reader, "CPosition", context);
  const sourcePosition = reader.u8(`${context} coordinate`);
  const beaming = reader.u16(`${context} beaming`);
  if (beaming !== 0) {
    fail(`${context} uses beaming data outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_BEAMING");
  }
  const raw = reader.u32(`${context} position data`);
  const durationDenominator = raw >>> 24;
  const flags = raw & 0xffffff;
  if (!SUPPORTED_DURATIONS.has(durationDenominator)) {
    fail(`${context} uses unsupported duration denominator ${durationDenominator}.`, "UNSUPPORTED_POWERTAB_LEGACY_DURATION");
  }
  if ((flags & ~0x04) !== 0) {
    fail(`${context} uses position flags outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_POSITION_PROPERTY");
  }
  const isRest = (flags & 0x04) !== 0;
  const complexCount = reader.u8(`${context} complex symbol count`);
  if (complexCount !== 2) {
    fail(`${context} reports ${complexCount} complex symbol slots; expected 2.`, "INVALID_POWERTAB_LEGACY_POSITION_STRUCTURE");
  }
  for (let index = 0; index < complexCount; index += 1) {
    if (reader.u32(`${context} complex symbol ${index + 1}`) !== 0) {
      fail(`${context} uses a complex position symbol outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_POSITION_PROPERTY");
    }
  }
  const noteCount = reader.count(`${context} notes`, stringCount);
  const notes = [];
  for (let index = 0; index < noteCount; index += 1) {
    notes.push(parseNote(reader, classes, `${context}, note ${index + 1}`, stringCount));
  }
  if (isRest && notes.length > 0) {
    fail(`${context} is marked as a rest but also contains notes.`, "CONTRADICTORY_POWERTAB_LEGACY_REST");
  }
  if (!isRest && notes.length === 0) {
    fail(`${context} contains neither a rest nor a note.`, "EMPTY_POWERTAB_LEGACY_POSITION");
  }
  return { sourcePosition, durationDenominator, dots: 0, tupletNumerator: -1, tupletDenominator: -1, graceType: "none", isRest, techniques: [], notes };
}

function parseStaff(reader, classes, context, stringCount) {
  classes.read(reader, "CStaff", context);
  const data = reader.u8(`${context} staff data`);
  if (data !== 0x06) {
    fail(`${context} is not the bounded six-string treble tablature staff.`, "UNSUPPORTED_POWERTAB_LEGACY_STAFF");
  }
  reader.take(4, `${context} staff spacing`);
  const voices = [];
  for (let voiceIndex = 0; voiceIndex < 2; voiceIndex += 1) {
    const count = reader.count(`${context} voice ${voiceIndex + 1} positions`, 1000);
    const positions = [];
    for (let index = 0; index < count; index += 1) {
      positions.push(parsePosition(reader, classes, `${context}, voice ${voiceIndex + 1}, position ${index + 1}`, stringCount));
    }
    voices.push({ index: voiceIndex, positions });
  }
  if (voices[1].positions.length !== 0) {
    fail(`${context} contains a second active voice outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_MULTIVOICE");
  }
  return voices[0];
}

function readEmptyVector(reader, label) {
  const count = reader.count(label, 1000);
  if (count !== 0) {
    fail(`${label} contains ${count} entries outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_SCORE_STRUCTURE");
  }
}

function parseGuitar(reader, classes, context) {
  classes.read(reader, "CGuitar", context);
  if (reader.u8(`${context} number`) !== 0) {
    fail(`${context} uses an unexpected player number.`, "UNSUPPORTED_POWERTAB_LEGACY_PLAYER");
  }
  const description = reader.string(`${context} description`) || "PowerTab Guitar";
  const preset = reader.u8(`${context} preset`);
  const volume = reader.u8(`${context} volume`);
  const pan = reader.u8(`${context} pan`);
  reader.take(4, `${context} effects`);
  if (reader.u8(`${context} capo`) !== 0) {
    fail(`${context} uses a capo outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_CAPO");
  }
  const tuningName = reader.string(`${context} tuning name`);
  reader.u8(`${context} tuning data`);
  const stringCount = reader.u8(`${context} string count`);
  const tuning = [...reader.take(stringCount, `${context} tuning pitches`)];
  if (stringCount !== 6 || tuning.some((value, index) => value !== STANDARD_GUITAR[index])) {
    fail(`${context} uses tuning outside exact standard E4 B3 G3 D3 A2 E2.`, "UNSUPPORTED_POWERTAB_LEGACY_TUNING");
  }
  if (preset > 127 || volume > 127 || pan > 127 || !tuningName) {
    fail(`${context} contains invalid player metadata.`, "INVALID_POWERTAB_LEGACY_PLAYER");
  }
  return { name: description, shortName: description, isPercussion: false, tuningMidiHighToLow: tuning };
}

function durationTicks(beat) { return (4 * TICKS_PER_QUARTER) / beat.durationDenominator; }

function splitBars(positions, internalBars) {
  const starts = [0, ...internalBars.map((bar) => bar.position)];
  for (let index = 1; index < starts.length; index += 1) {
    if (starts[index] <= starts[index - 1]) {
      fail("Historical PowerTab barlines are not in strictly increasing source order.", "AMBIGUOUS_POWERTAB_LEGACY_BARLINE_ORDER");
    }
  }
  let absoluteTick = 0;
  return starts.map((start, index) => {
    const end = index + 1 < starts.length ? starts[index + 1] : Infinity;
    const selected = positions.filter((position) => position.sourcePosition >= start && position.sourcePosition < end);
    if (selected.length === 0) {
      fail(`Measure ${index + 1} contains no positions in the first historical profile.`, "EMPTY_POWERTAB_LEGACY_MEASURE");
    }
    let relativeTick = 0;
    const beats = selected.map((position) => {
      const beat = { ...position, startTicks: absoluteTick + relativeTick };
      relativeTick += durationTicks(position);
      return beat;
    });
    if (relativeTick !== 4 * TICKS_PER_QUARTER) {
      fail(`Measure ${index + 1} is not a complete 4/4 measure.`, "UNSUPPORTED_POWERTAB_LEGACY_MEASURE_DURATION");
    }
    absoluteTick += 4 * TICKS_PER_QUARTER;
    return { sourceNumber: index + 1, timeSignatureNumerator: 4, timeSignatureDenominator: 4, repeatStart: false, repeatCount: 0, alternateEndings: 0, voices: [{ index: 0, beats }, { index: 1, beats: [] }] };
  });
}

function parseSystem(reader, classes, context, guitar, fileVersion) {
  classes.read(reader, "CSection", context);
  reader.take(16, `${context} rectangle`);
  if (fileVersion <= 2) {
    const key = reader.u8(`${context} system key`);
    const endBar = reader.u16(`${context} end bar`);
    if (key !== 0 || ((endBar >>> 8) & 0xff) !== 1 || (endBar & 0xff) !== 0) {
      fail(`${context} uses old-system key or final-bar data outside the first historical profile.`, "UNSUPPORTED_POWERTAB_LEGACY_BARLINE");
    }
    reader.take(4, `${context} spacing`);
  } else {
    const endBar = reader.u8(`${context} end bar`);
    if ((endBar >>> 5) !== 1 || (endBar & 0x1f) !== 0) {
      fail(`${context} uses an unsupported final barline.`, "UNSUPPORTED_POWERTAB_LEGACY_BARLINE");
    }
    reader.take(4, `${context} spacing`);
    const startBar = parseModernBarline(reader, `${context} start bar`);
    if (startBar.position !== 0) {
      fail(`${context} does not begin at source coordinate 0.`, "UNSUPPORTED_POWERTAB_LEGACY_BARLINE");
    }
  }
  readEmptyVector(reader, `${context} directions`);
  readEmptyVector(reader, `${context} chord text`);
  readEmptyVector(reader, `${context} rhythm slashes`);
  const staffCount = reader.count(`${context} staves`, 8);
  if (staffCount !== 1) {
    fail(`${context} contains ${staffCount} staves; the first historical profile requires one.`, "UNSUPPORTED_POWERTAB_LEGACY_STAFF_COUNT");
  }
  const voice = parseStaff(reader, classes, `${context}, staff 1`, guitar.tuningMidiHighToLow.length);
  const barlineCount = reader.count(`${context} internal barlines`, 64);
  const internalBars = [];
  for (let index = 0; index < barlineCount; index += 1) {
    classes.read(reader, "CMusicBar", `${context}, internal barline ${index + 1}`);
    internalBars.push(fileVersion <= 2 ? parseOldBarline(reader, `${context}, internal barline ${index + 1}`) : parseModernBarline(reader, `${context}, internal barline ${index + 1}`));
  }
  return splitBars(voice.positions, internalBars);
}

function parseScore(reader, classes, context, { allowContent, fileVersion }) {
  const guitarCount = reader.count(`${context} guitars`, 32);
  if (allowContent ? guitarCount !== 1 : guitarCount !== 0) {
    fail(`${context} is outside the first guitar-only historical profile.`, allowContent ? "UNSUPPORTED_POWERTAB_LEGACY_PLAYER_COUNT" : "UNSUPPORTED_POWERTAB_LEGACY_BASS_SCORE");
  }
  let guitar = null;
  for (let index = 0; index < guitarCount; index += 1) {
    guitar = parseGuitar(reader, classes, `${context}, guitar ${index + 1}`);
  }
  for (const label of ["chord diagrams", "floating text", "guitar-in", "tempo markers", "dynamic symbols", "alternate endings"]) {
    readEmptyVector(reader, `${context} ${label}`);
  }
  const systemCount = reader.count(`${context} systems`, 256);
  if (allowContent ? systemCount !== 1 : systemCount !== 0) {
    fail(`${context} has an unsupported system count.`, allowContent ? "UNSUPPORTED_POWERTAB_LEGACY_SYSTEM_COUNT" : "UNSUPPORTED_POWERTAB_LEGACY_BASS_SCORE");
  }
  const bars = [];
  for (let index = 0; index < systemCount; index += 1) {
    bars.push(...parseSystem(reader, classes, `${context}, system ${index + 1}`, guitar, fileVersion));
  }
  return guitar ? { ...guitar, staves: [{ tuningMidiHighToLow: guitar.tuningMidiHighToLow, bars }] } : null;
}

function parseHistoricalHeader(reader) {
  const marker = reader.u32("PowerTab marker");
  if (marker !== 0x62617470) {
    fail("The selected .ptb file does not contain the PowerTab ptab marker.", "INVALID_POWERTAB_LEGACY_MARKER");
  }
  const fileVersion = reader.u16("PowerTab file version");
  const profile = VERSION_PROFILES.get(fileVersion);
  if (!profile) {
    fail(`The historical decoder accepts file-version values 1, 2, or 3; this file reports ${fileVersion}.`, fileVersion === 4 ? "POWERTAB_LEGACY_VERSION_4_REQUIRES_ACCEPTED_DECODER" : "INVALID_POWERTAB_LEGACY_VERSION");
  }
  const title = reader.string("song title");
  const artist = reader.string("song artist");
  const releasedOn = reader.u8("released-on value");
  reader.string("release title");
  const live = reader.u8("live flag");
  if (releasedOn > 10 || (live !== 0 && live !== 1)) {
    fail("The historical PowerTab header contains invalid release metadata.", "INVALID_POWERTAB_LEGACY_HEADER");
  }
  reader.string("composer");
  reader.string("lyricist");
  reader.string("arranger");
  if (fileVersion <= 2) reader.string("guitar score transcriber");
  reader.u16("release year");
  const authorType = reader.u8("author type");
  if (authorType > 1) {
    fail("The historical PowerTab header contains an invalid author type.", "INVALID_POWERTAB_LEGACY_HEADER");
  }
  reader.string("copyright");
  reader.string("lyrics");
  if (fileVersion <= 2) reader.string("guitar score notes");
  return { fileVersion, title: title || `PowerTab ${profile.powerTabVersion} tablature`, artist, ...profile };
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
    fail(`${context} contains invalid font metadata.`, "INVALID_POWERTAB_LEGACY_FOOTER");
  }
}

export function decodePowerTabLegacyHistoricalBytes(input, { maxFileBytes = 5 * 1024 * 1024 } = {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || new ArrayBuffer(0));
  if (bytes.length === 0 || bytes.length > maxFileBytes) {
    fail(`The selected historical PowerTab file must be between 1 and ${maxFileBytes} bytes.`, "POWERTAB_LEGACY_FILE_SIZE_LIMIT");
  }
  const reader = new Reader(bytes);
  const classes = new ClassMap();
  const header = parseHistoricalHeader(reader);
  const guitar = parseScore(reader, classes, "Guitar score", { allowContent: true, fileVersion: header.fileVersion });
  parseScore(reader, classes, "Bass score", { allowContent: false, fileVersion: header.fileVersion });
  parseFont(reader, "Chord font");
  parseFont(reader, "Text font");
  parseFont(reader, "Music font");
  const lineSpacing = reader.i32("line spacing");
  reader.u32("fade in");
  reader.u32("fade out");
  if (lineSpacing < 1 || lineSpacing > 100) {
    fail("The historical PowerTab document contains invalid line spacing.", "INVALID_POWERTAB_LEGACY_FOOTER");
  }
  if (reader.offset !== bytes.length) {
    fail(`The historical PowerTab document contains ${bytes.length - reader.offset} trailing bytes outside the bounded profile.`, "UNSUPPORTED_POWERTAB_LEGACY_TRAILING_DATA");
  }
  const tracks = [guitar];
  const measureCount = guitar.staves[0].bars.length;
  return {
    schemaVersion: 1,
    sourceVersion: header.sourceVersion,
    versionEvidence: {
      schemaVersion: 1,
      containerFamily: "POWERTAB_LEGACY_MFC_BINARY",
      extensionFamily: ".ptb",
      serialization: "mfc-binary",
      marker: "ptab",
      fileVersion: header.fileVersion,
      powerTabVersion: header.powerTabVersion,
      historicalSignature: header.signature,
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
      evidenceKind: "powertab-editor-source-faithful",
      independentParserParity: false,
      decodedTrackCount: tracks.length,
      decodedMeasureCount: measureCount,
    },
    title: header.title,
    tracks,
  };
}

export async function decodePowerTabLegacyHistoricalFile(file, options = {}) {
  if (!file || typeof file.arrayBuffer !== "function") {
    fail("A readable historical PowerTab .ptb file is required.", "INVALID_POWERTAB_LEGACY_FILE");
  }
  if (!/\.ptb$/iu.test(String(file.name || ""))) {
    fail("The historical PowerTab decoder accepts .ptb files only.", "INVALID_POWERTAB_LEGACY_EXTENSION");
  }
  const maxFileBytes = options.maxFileBytes || 5 * 1024 * 1024;
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > maxFileBytes) {
    fail(`The selected historical PowerTab file must be between 1 and ${maxFileBytes} bytes.`, "POWERTAB_LEGACY_FILE_SIZE_LIMIT");
  }
  return decodePowerTabLegacyHistoricalBytes(new Uint8Array(await file.arrayBuffer()), options);
}

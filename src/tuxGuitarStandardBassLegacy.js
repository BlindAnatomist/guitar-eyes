import {
  STANDARD_BASS,
  STANDARD_GUITAR,
  arraysEqual,
  requireValue,
} from "./tuxGuitarStandardBassShared";

const PALM_MUTE = 0x002000;
const LEGACY_HEADERS = new Set([
  "TuxGuitar File Format - 1.0",
  "TuxGuitar File Format - 1.1",
  "TuxGuitar File Format - 1.2",
  "TuxGuitar File Format - 1.3",
  "TuxGuitar File Format - 1.5",
]);

class Cursor {
  constructor(bytes) { this.bytes = bytes; this.offset = 0; }
  need(count) { requireValue(this.offset + count <= this.bytes.length, "The TuxGuitar bass file is truncated.", "TRUNCATED_TUXGUITAR_FILE"); }
  u8() { this.need(1); return this.bytes[this.offset++]; }
  u16() { this.need(2); const value = (this.bytes[this.offset] << 8) | this.bytes[this.offset + 1]; this.offset += 2; return value; }
  u32() { this.need(4); const value = this.bytes[this.offset] * 0x1000000 + (this.bytes[this.offset + 1] << 16) + (this.bytes[this.offset + 2] << 8) + this.bytes[this.offset + 3]; this.offset += 4; return value >>> 0; }
  skip(count) { this.need(count); this.offset += count; }
  string8() { const count = this.u8(); this.need(count * 2); let text = ""; for (let index = 0; index < count; index += 1) text += String.fromCharCode(this.u16()); return text; }
  string32() { const count = this.u32(); requireValue(count <= 1000000, "A TuxGuitar bass string field is too large.", "TUXGUITAR_STRING_LIMIT"); this.need(count * 2); this.skip(count * 2); }
}

function skipDuration(cursor) {
  const flags = cursor.u8();
  requireValue((flags & ~0x07) === 0, "The TuxGuitar bass file uses unsupported duration flags.", "UNSUPPORTED_TUXGUITAR_DURATION");
  const denominator = cursor.u8();
  requireValue([1, 2, 4, 8, 16, 32, 64].includes(denominator), "The TuxGuitar bass file uses an unsupported duration.", "UNSUPPORTED_TUXGUITAR_DURATION");
  if (flags & 0x04) cursor.skip(2);
}
function skipEffect(cursor) {
  const flags = (cursor.u8() << 16) | (cursor.u8() << 8) | cursor.u8();
  requireValue((flags & ~PALM_MUTE) === 0, "The TuxGuitar bass file uses an effect outside the bounded palm-mute profile.", "UNSUPPORTED_TUXGUITAR_EFFECT");
}
function skipNotes(cursor) {
  let more = true;
  let count = 0;
  while (more) {
    count += 1;
    requireValue(count <= 64, "A TuxGuitar bass beat contains too many notes.", "TUXGUITAR_NOTE_LIMIT");
    const flags = cursor.u8();
    requireValue((flags & ~0x0f) === 0 && (flags & 0x02) === 0, "The TuxGuitar bass note is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_NOTE");
    cursor.skip(2);
    if (flags & 0x08) cursor.skip(1);
    if (flags & 0x04) skipEffect(cursor);
    more = Boolean(flags & 0x01);
  }
}
function skipMeasureHeaders(cursor, count) {
  for (let index = 0; index < count; index += 1) {
    const flags = cursor.u8();
    requireValue((flags & ~0x7f) === 0 && (flags & 0x7c) === 0, "The TuxGuitar bass measure header is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_MEASURE_STRUCTURE");
    if (flags & 0x01) { cursor.skip(1); skipDuration(cursor); }
    if (flags & 0x02) cursor.skip(2);
  }
}
function skipMeasure10(cursor, clefOffsets) {
  const flags = cursor.u8();
  requireValue((flags & ~0x03) === 0, "The TuxGuitar bass measure metadata is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_MEASURE");
  let more = true;
  while (more) {
    const beat = cursor.u8();
    requireValue((beat & ~0x1f) === 0 && (beat & 0x18) === 0, "The TuxGuitar bass beat is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_BEAT");
    if (beat & 0x02) skipDuration(cursor);
    if (beat & 0x04) skipNotes(cursor);
    more = Boolean(beat & 0x01);
  }
  if (flags & 0x01) { clefOffsets.push(cursor.offset); requireValue(cursor.u8() === 2, "The bounded TuxGuitar bass profile requires bass clef.", "UNSUPPORTED_TUXGUITAR_CLEF"); }
  if (flags & 0x02) requireValue(cursor.u8() === 0, "The TuxGuitar bass key signature is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_KEY");
}
function skipMeasure11(cursor, clefOffsets) {
  const flags = cursor.u8();
  requireValue((flags & ~0x03) === 0, "The TuxGuitar bass measure metadata is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_MEASURE");
  let voiceFlags = 0;
  let more = true;
  while (more) {
    const beat = cursor.u8();
    requireValue((beat & 0x0e) === 0 && (beat & 0xc0) === 0 && (beat & 0x10) !== 0, "The TuxGuitar bass voice structure is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_BEAT");
    if (beat & 0x20) voiceFlags = cursor.u8();
    requireValue((voiceFlags & ~0x0f) === 0 && (voiceFlags & 0x0c) === 0, "The TuxGuitar bass voice is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_VOICE");
    if (voiceFlags & 0x02) skipDuration(cursor);
    if (voiceFlags & 0x01) skipNotes(cursor);
    more = Boolean(beat & 0x01);
  }
  if (flags & 0x01) { clefOffsets.push(cursor.offset); requireValue(cursor.u8() === 2, "The bounded TuxGuitar bass profile requires bass clef.", "UNSUPPORTED_TUXGUITAR_CLEF"); }
  if (flags & 0x02) requireValue(cursor.u8() === 0, "The TuxGuitar bass key signature is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_KEY");
}
function skipLocalChannel(cursor, version) {
  if (version === "1.0") requireValue(cursor.u8() === 0, "Solo/mute state is outside the bounded TuxGuitar bass profile.", "UNSUPPORTED_TUXGUITAR_TRACK_STATE");
  cursor.skip(9);
}
function skipGlobalChannel(cursor) {
  cursor.skip(10);
  cursor.string8();
  const parameters = cursor.u16();
  for (let index = 0; index < parameters; index += 1) { cursor.string8(); cursor.string32(); }
}

export function canonicalizeLegacyBass(bytes) {
  const cursor = new Cursor(bytes);
  const header = cursor.string8();
  requireValue(LEGACY_HEADERS.has(header), "This is not an accepted TuxGuitar legacy generation.", "UNSUPPORTED_TUXGUITAR_VERSION");
  const version = header.slice(-3);
  cursor.string8(); cursor.string8(); cursor.string8(); cursor.string8();
  if (!["1.0", "1.1"].includes(version)) { cursor.string8(); cursor.string8(); cursor.string8(); cursor.string8(); cursor.string32(); }
  if (["1.3", "1.5"].includes(version)) { const channels = cursor.u8(); requireValue(channels <= 64, "The TuxGuitar bass file contains too many channels.", "TUXGUITAR_CHANNEL_LIMIT"); for (let index = 0; index < channels; index += 1) skipGlobalChannel(cursor); }
  const measureCount = cursor.u16();
  requireValue(measureCount > 0 && measureCount <= 4096, "The TuxGuitar bass measure count is outside the limit.", "TUXGUITAR_MEASURE_LIMIT");
  skipMeasureHeaders(cursor, measureCount);
  requireValue(cursor.u8() === 1, "The bounded TuxGuitar bass profile accepts exactly one track.", "UNSUPPORTED_TUXGUITAR_TRACK_COUNT");
  const trackFlags = cursor.u8();
  requireValue(trackFlags === 0, "The TuxGuitar bass track state is outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_TRACK_STATE");
  cursor.string8();
  if (["1.3", "1.5"].includes(version)) cursor.skip(2); else skipLocalChannel(cursor, version);
  const clefOffsets = [];
  for (let index = 0; index < measureCount; index += 1) {
    if (version === "1.0") skipMeasure10(cursor, clefOffsets); else skipMeasure11(cursor, clefOffsets);
  }
  const stringCountOffset = cursor.offset;
  requireValue(cursor.u8() === 4, "The bounded TuxGuitar bass profile requires four strings.", "UNSUPPORTED_TUXGUITAR_STRING_COUNT");
  const tuning = [cursor.u8(), cursor.u8(), cursor.u8(), cursor.u8()];
  requireValue(arraysEqual(tuning, STANDARD_BASS), "The bounded TuxGuitar bass profile requires standard G2 D2 A1 E1 tuning.", "UNSUPPORTED_TUXGUITAR_TUNING");
  const tailOffset = cursor.offset;
  cursor.skip(4);
  requireValue(cursor.offset === bytes.length, "The TuxGuitar bass legacy file contains trailing data outside the bounded profile.", "UNSUPPORTED_TUXGUITAR_TRAILING_DATA");

  const patched = new Uint8Array(bytes);
  clefOffsets.forEach((offset) => { patched[offset] = 1; });
  const replacement = Uint8Array.from([6, ...STANDARD_GUITAR]);
  const output = new Uint8Array(patched.length + 2);
  output.set(patched.subarray(0, stringCountOffset), 0);
  output.set(replacement, stringCountOffset);
  output.set(patched.subarray(tailOffset), stringCountOffset + replacement.length);
  return output;
}


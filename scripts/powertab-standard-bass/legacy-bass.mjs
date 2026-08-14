import { Writer } from "./mfc-writer.mjs";

function writeModernBarline(writer, position = 0, type = 0) {
  writer.u8(position); writer.u8(type);
  writer.u8(0);
  writer.u32(0x1a018000);
  writer.u8(4);
  writer.i8(0x7f);
  writer.mfcString("");
}

function writeOldBarline(writer, position = 0, data = 0) {
  writer.u8(position);
  writer.u16(data & 0xff);
}

function writeNote(writer, note) {
  writer.objectPrefix("CLineData");
  writer.u8((note.stringIndexHighToLow << 5) | note.fret);
  writer.u16(0);
  writer.u8(3);
  writer.u32(0); writer.u32(0); writer.u32(0);
}

function writePosition(writer, position) {
  writer.objectPrefix("CPosition");
  writer.u8(position.coordinate);
  writer.u16(0);
  writer.u32((((position.duration & 0xff) << 24) | (position.rest ? 0x04 : 0)) >>> 0);
  writer.u8(2);
  writer.u32(0); writer.u32(0);
  writer.count(position.notes.length);
  for (const note of position.notes) writeNote(writer, note);
}

function writeBassStaff(writer, source) {
  writer.objectPrefix("CStaff");
  writer.u8(0x14);
  writer.u8(9); writer.u8(9); writer.u8(0); writer.u8(0);
  writer.count(source.positions.length);
  for (const position of source.positions) writePosition(writer, position);
  writer.count(0);
}

function writeSystem(writer, source, fileVersion) {
  writer.objectPrefix("CSection");
  for (const value of [50, 20, 750, 0]) writer.i32(value);
  if (fileVersion <= 2) {
    writer.u8(0);
    writer.u16(0x0100);
    writer.u8(20); writer.u8(0); writer.u8(0); writer.u8(0);
  } else {
    writer.u8(0x20);
    writer.u8(20); writer.u8(0); writer.u8(0); writer.u8(0);
    writeModernBarline(writer, 0, 0);
  }
  writer.count(0); writer.count(0); writer.count(0);
  writer.count(1); writeBassStaff(writer, source);
  writer.count(1);
  writer.objectPrefix("CMusicBar");
  if (fileVersion <= 2) writeOldBarline(writer, source.measureBoundaries[1], 0);
  else writeModernBarline(writer, source.measureBoundaries[1], 0);
}

function writeBassPlayer(writer, source) {
  writer.objectPrefix("CGuitar");
  writer.u8(0);
  writer.mfcString(source.player);
  for (const value of [33, 104, 64, 0, 0, 0, 0, 0]) writer.u8(value);
  writer.mfcString(source.tuningName);
  writer.u8(1);
  writer.u8(source.tuningMidiHighToLow.length);
  for (const note of source.tuningMidiHighToLow) writer.u8(note);
}

function writeBassScore(writer, source, fileVersion) {
  writer.count(1); writeBassPlayer(writer, source);
  for (let index = 0; index < 6; index += 1) writer.count(0);
  writer.count(1); writeSystem(writer, source, fileVersion);
}

function writeEmptyScore(writer) {
  for (let index = 0; index < 8; index += 1) writer.count(0);
}

function writeFont(writer) {
  writer.mfcString("Times New Roman");
  writer.i32(8); writer.i32(400);
  writer.bool(false); writer.bool(false); writer.bool(false);
  writer.u8(0); writer.u8(0); writer.u8(0); writer.u8(0);
}

function writeHistoricalHeader(writer, source, fileVersion) {
  writer.u32(0x62617470);
  writer.u16(fileVersion);
  writer.mfcString(source.title);
  writer.mfcString(source.artist);
  writer.u8(7);
  writer.mfcString("");
  writer.u8(0);
  writer.mfcString(""); writer.mfcString(""); writer.mfcString("");
  if (fileVersion <= 2) writer.mfcString("");
  writer.u16(0);
  writer.u8(0);
  writer.mfcString("CC0-1.0 project-authored test material");
  writer.mfcString("");
  if (fileVersion <= 2) writer.mfcString("");
}

export function generateLegacyBass(source, fileVersion) {
  const writer = new Writer();
  if (fileVersion <= 3) {
    writeHistoricalHeader(writer, source, fileVersion);
  } else {
    writer.u32(0x62617470);
    writer.u16(4);
    writer.u8(0);
    writer.u8(0x02);
    writer.mfcString(source.title);
    writer.mfcString(source.artist);
    writer.u8(3);
    writer.u8(0);
    writer.mfcString(""); writer.mfcString("");
    writer.mfcString("");
    writer.mfcString("");
    writer.mfcString("Guitar Eyes");
    writer.mfcString("CC0-1.0 project-authored test material");
    writer.mfcString("");
    writer.mfcString("");
    writer.mfcString("Six positions: four single-note events, one rest, and one two-note chord.");
  }
  writeEmptyScore(writer);
  writeBassScore(writer, source, fileVersion);
  writeFont(writer); writeFont(writer); writeFont(writer);
  writer.i32(9); writer.u32(0); writer.u32(0);
  return writer.finish();
}

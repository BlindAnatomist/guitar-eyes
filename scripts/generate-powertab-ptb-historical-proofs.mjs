import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const outDir = process.argv[2] || process.cwd();
fs.mkdirSync(outDir, { recursive: true });

const source = {
  title: 'Guitar Eyes Historical PTB Proof',
  artist: 'Guitar Eyes',
  player: 'Proof Guitar',
  tuningName: 'Standard',
  tuningMidiHighToLow: [64, 59, 55, 50, 45, 40],
  measureBoundaries: [0, 50, 100],
  positions: [
    { coordinate: 10, duration: 4, notes: [{ stringIndexHighToLow: 5, fret: 3 }] },
    { coordinate: 20, duration: 8, notes: [{ stringIndexHighToLow: 4, fret: 0 }] },
    { coordinate: 30, duration: 8, notes: [{ stringIndexHighToLow: 4, fret: 2 }] },
    { coordinate: 40, duration: 2, notes: [{ stringIndexHighToLow: 3, fret: 0 }] },
    { coordinate: 60, duration: 2, rest: true, notes: [] },
    { coordinate: 70, duration: 2, notes: [
      { stringIndexHighToLow: 0, fret: 0 },
      { stringIndexHighToLow: 1, fret: 1 },
    ] },
  ],
};

const versions = [
  { fileVersion: 1, powerTabVersion: '1.0', sourceVersion: 'PTB_V10', stem: 'powertab-v10-original-six-position' },
  { fileVersion: 2, powerTabVersion: '1.0.2', sourceVersion: 'PTB_V102', stem: 'powertab-v102-original-six-position' },
  { fileVersion: 3, powerTabVersion: '1.5', sourceVersion: 'PTB_V15', stem: 'powertab-v15-original-six-position' },
];

class Writer {
  constructor() { this.parts = []; this.classIndices = new Map(); this.mapCount = 1; }
  push(buffer) { this.parts.push(buffer); }
  u8(value) { const b = Buffer.alloc(1); b.writeUInt8(value & 0xff); this.push(b); }
  i8(value) { const b = Buffer.alloc(1); b.writeInt8(value); this.push(b); }
  u16(value) { const b = Buffer.alloc(2); b.writeUInt16LE(value & 0xffff); this.push(b); }
  u32(value) { const b = Buffer.alloc(4); b.writeUInt32LE(value >>> 0); this.push(b); }
  i32(value) { const b = Buffer.alloc(4); b.writeInt32LE(value); this.push(b); }
  bool(value) { this.u8(value ? 1 : 0); }
  raw(buffer) { this.push(Buffer.from(buffer)); }
  mfcString(value) {
    const raw = Buffer.from(value, 'latin1');
    if (raw.length < 0xff) this.u8(raw.length);
    else if (raw.length < 0xffff) { this.u8(0xff); this.u16(raw.length); }
    else { this.u8(0xff); this.u16(0xffff); this.u32(raw.length); }
    this.raw(raw);
  }
  count(value) {
    if (value < 0xffff) this.u16(value);
    else { this.u16(0xffff); this.u32(value); }
  }
  objectPrefix(className, schema = 1) {
    if (this.classIndices.has(className)) {
      this.u16(0x8000 | this.classIndices.get(className));
    } else {
      this.u16(0xffff);
      this.u16(schema);
      const raw = Buffer.from(className, 'ascii');
      this.u16(raw.length);
      this.raw(raw);
      this.classIndices.set(className, this.mapCount);
      this.mapCount += 1;
    }
    this.mapCount += 1;
  }
  finish() { return Buffer.concat(this.parts); }
}

function writeModernBarline(writer, position = 0, type = 0) {
  writer.u8(position); writer.u8(type);
  writer.u8(0);
  writer.u32(0x1a018000);
  writer.u8(4);
  writer.i8(0x7f);
  writer.mfcString('');
}

function writeOldBarline(writer, position = 0, data = 0) {
  writer.u8(position);
  writer.u16(data & 0xff);
}

function writeNote(writer, note) {
  writer.objectPrefix('CLineData');
  writer.u8((note.stringIndexHighToLow << 5) | note.fret);
  writer.u16(0);
  writer.u8(3);
  writer.u32(0); writer.u32(0); writer.u32(0);
}

function writePosition(writer, position) {
  writer.objectPrefix('CPosition');
  writer.u8(position.coordinate);
  writer.u16(0);
  writer.u32((((position.duration & 0xff) << 24) | (position.rest ? 0x04 : 0)) >>> 0);
  writer.u8(2);
  writer.u32(0); writer.u32(0);
  writer.count(position.notes.length);
  for (const note of position.notes) writeNote(writer, note);
}

function writeStaff(writer) {
  writer.objectPrefix('CStaff');
  writer.u8(0x06);
  writer.u8(9); writer.u8(9); writer.u8(0); writer.u8(0);
  writer.count(source.positions.length);
  for (const position of source.positions) writePosition(writer, position);
  writer.count(0);
}

function writeSystem(writer, fileVersion) {
  writer.objectPrefix('CSection');
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

  writer.count(0);
  writer.count(0);
  writer.count(0);
  writer.count(1); writeStaff(writer);
  writer.count(1);
  writer.objectPrefix('CMusicBar');
  if (fileVersion <= 2) writeOldBarline(writer, source.measureBoundaries[1], 0);
  else writeModernBarline(writer, source.measureBoundaries[1], 0);
}

function writeGuitar(writer) {
  writer.objectPrefix('CGuitar');
  writer.u8(0);
  writer.mfcString(source.player);
  for (const value of [25, 104, 64, 0, 0, 0, 0, 0]) writer.u8(value);
  writer.mfcString(source.tuningName);
  writer.u8(1);
  writer.u8(source.tuningMidiHighToLow.length);
  for (const note of source.tuningMidiHighToLow) writer.u8(note);
}

function writeGuitarScore(writer, fileVersion) {
  writer.count(1); writeGuitar(writer);
  for (let i = 0; i < 6; i += 1) writer.count(0);
  writer.count(1); writeSystem(writer, fileVersion);
}

function writeEmptyScore(writer) {
  for (let i = 0; i < 8; i += 1) writer.count(0);
}

function writeFont(writer) {
  writer.mfcString('Times New Roman');
  writer.i32(8); writer.i32(400);
  writer.bool(false); writer.bool(false); writer.bool(false);
  writer.u8(0); writer.u8(0); writer.u8(0); writer.u8(0);
}

function writeHistoricalHeader(writer, fileVersion) {
  writer.u32(0x62617470);
  writer.u16(fileVersion);
  writer.mfcString(source.title);
  writer.mfcString(source.artist);
  writer.u8(7);
  writer.mfcString('');
  writer.u8(0);
  writer.mfcString('');
  writer.mfcString('');
  writer.mfcString('');

  if (fileVersion <= 2) writer.mfcString('Guitar Eyes');

  writer.u16(0);
  writer.u8(0);
  writer.mfcString('CC0-1.0 project-authored test material');
  writer.mfcString('');

  if (fileVersion <= 2) {
    writer.mfcString('Six positions: four single-note events, one rest, and one two-note chord.');
  }
}

function generate(fileVersion) {
  const writer = new Writer();
  writeHistoricalHeader(writer, fileVersion);
  writeGuitarScore(writer, fileVersion);
  writeEmptyScore(writer);
  writeFont(writer); writeFont(writer); writeFont(writer);
  writer.i32(9); writer.u32(0); writer.u32(0);
  return writer.finish();
}

const output = [];
for (const version of versions) {
  const binary = generate(version.fileVersion);
  const binaryName = `${version.stem}.ptb`;
  const base64Name = `${binaryName}.base64`;
  fs.writeFileSync(path.join(outDir, binaryName), binary);
  fs.writeFileSync(path.join(outDir, base64Name), `${binary.toString('base64')}\n`);
  output.push({
    ...version,
    bytes: binary.length,
    sha256: crypto.createHash('sha256').update(binary).digest('hex'),
    headerHex: binary.subarray(0, 6).toString('hex'),
  });
}
fs.writeFileSync(path.join(outDir, 'powertab-historical-six-position.source.json'), `${JSON.stringify(source, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));

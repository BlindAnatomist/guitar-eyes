import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const outDir = process.argv[2] || process.cwd();
fs.mkdirSync(outDir, { recursive: true });

const source = {
  title: 'Guitar Eyes PTB 1.7 Proof',
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

class Writer {
  constructor() {
    this.parts = [];
    this.classIndices = new Map();
    this.mapCount = 1;
  }
  push(buffer) { this.parts.push(buffer); }
  u8(v) { const b = Buffer.alloc(1); b.writeUInt8(v & 0xff); this.push(b); }
  i8(v) { const b = Buffer.alloc(1); b.writeInt8(v); this.push(b); }
  u16(v) { const b = Buffer.alloc(2); b.writeUInt16LE(v & 0xffff); this.push(b); }
  u32(v) { const b = Buffer.alloc(4); b.writeUInt32LE(v >>> 0); this.push(b); }
  i32(v) { const b = Buffer.alloc(4); b.writeInt32LE(v); this.push(b); }
  bool(v) { this.u8(v ? 1 : 0); }
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

function writeBarline(w, position = 0, type = 0) {
  w.u8(position); w.u8(type); // position, bar type
  w.u8(0);                // default key signature
  w.u32(0x1a018000);      // default 4/4 time signature data
  w.u8(4);                // pulses
  w.i8(0x7f);             // no rehearsal sign
  w.mfcString('');
}

function writeNote(w, note) {
  w.objectPrefix('CLineData');
  w.u8((note.stringIndexHighToLow << 5) | note.fret);
  w.u16(0);
  w.u8(3);
  w.u32(0); w.u32(0); w.u32(0);
}

function writePosition(w, position) {
  w.objectPrefix('CPosition');
  w.u8(position.coordinate);
  w.u16(0);
  const data = ((position.duration & 0xff) << 24) | (position.rest ? 0x04 : 0);
  w.u32(data >>> 0);
  w.u8(2);
  w.u32(0); w.u32(0);
  w.count(position.notes.length);
  for (const note of position.notes) writeNote(w, note);
}

function writeStaff(w) {
  w.objectPrefix('CStaff');
  w.u8(0x06);             // treble clef, six tablature strings
  w.u8(9); w.u8(9); w.u8(0); w.u8(0);
  w.count(source.positions.length);
  for (const position of source.positions) writePosition(w, position);
  w.count(0);             // second voice empty
}

function writeSystem(w) {
  w.objectPrefix('CSection');
  for (const value of [50, 20, 750, 0]) w.i32(value);
  w.u8(0x20);             // final double bar, repeat count zero
  w.u8(20); w.u8(0); w.u8(0); w.u8(0);
  writeBarline(w, 0, 0);
  w.count(0);             // directions
  w.count(0);             // chord text
  w.count(0);             // rhythm slashes
  w.count(1); writeStaff(w);
  w.count(1);             // one internal barline splits the proof into two measures
  w.objectPrefix('CMusicBar');
  writeBarline(w, source.measureBoundaries[1], 0);
}

function writeGuitar(w) {
  w.objectPrefix('CGuitar');
  w.u8(0);
  w.mfcString(source.player);
  for (const value of [25, 104, 64, 0, 0, 0, 0, 0]) w.u8(value);
  w.mfcString(source.tuningName);
  w.u8(1);                // display sharps, notation offset zero
  w.u8(source.tuningMidiHighToLow.length);
  for (const note of source.tuningMidiHighToLow) w.u8(note);
}

function writeGuitarScore(w) {
  w.count(1); writeGuitar(w);
  for (let i = 0; i < 6; i += 1) w.count(0);
  w.count(1); writeSystem(w);
}

function writeEmptyScore(w) {
  for (let i = 0; i < 8; i += 1) w.count(0);
}

function writeFont(w) {
  w.mfcString('Times New Roman');
  w.i32(8); w.i32(400);
  w.bool(false); w.bool(false); w.bool(false);
  w.u8(0); w.u8(0); w.u8(0); w.u8(0);
}

function generate() {
  const w = new Writer();
  w.u32(0x62617470);      // little-endian bytes: ptab
  w.u16(4);               // PowerTab 1.7
  w.u8(0);                // song
  w.u8(1);                // guitar content
  w.mfcString(source.title);
  w.mfcString(source.artist);
  w.u8(3);                // not released
  w.u8(0);                // known author
  w.mfcString(''); w.mfcString('');
  w.mfcString('');
  w.mfcString('Guitar Eyes');
  w.mfcString('');
  w.mfcString('CC0-1.0 project-authored test material');
  w.mfcString('');
  w.mfcString('Six positions: four single-note events, one rest, and one two-note chord.');
  w.mfcString('');
  writeGuitarScore(w);
  writeEmptyScore(w);
  writeFont(w); writeFont(w); writeFont(w);
  w.i32(9); w.u32(0); w.u32(0);
  return w.finish();
}

const binary = generate();
const binaryName = 'powertab-v17-original-six-position.ptb';
const sourceName = 'powertab-v17-original-six-position.source.json';
const base64Name = `${binaryName}.base64`;

fs.writeFileSync(path.join(outDir, binaryName), binary);
fs.writeFileSync(path.join(outDir, base64Name), `${binary.toString('base64')}\n`);
fs.writeFileSync(path.join(outDir, sourceName), `${JSON.stringify(source, null, 2)}\n`);

const sha = crypto.createHash('sha256').update(binary).digest('hex');
console.log(JSON.stringify({ bytes: binary.length, sha256: sha, headerHex: binary.subarray(0, 6).toString('hex') }));

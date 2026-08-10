import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const binaryPath = path.join(root, 'powertab-v17-original-six-position.ptb');
const mirrorPath = `${binaryPath}.base64`;
const data = fs.readFileSync(binaryPath);
const mirror = Buffer.from(fs.readFileSync(mirrorPath, 'utf8').trim(), 'base64');

function assert(condition, message) { if (!condition) throw new Error(message); }

class Reader {
  constructor(buffer) { this.b = buffer; this.i = 0; }
  take(n) { assert(this.i + n <= this.b.length, `EOF at ${this.i}, need ${n}`); const v = this.b.subarray(this.i, this.i+n); this.i += n; return v; }
  u8() { return this.take(1).readUInt8(0); }
  i8() { return this.take(1).readInt8(0); }
  u16() { return this.take(2).readUInt16LE(0); }
  u32() { return this.take(4).readUInt32LE(0); }
  i32() { return this.take(4).readInt32LE(0); }
  bool() { return this.u8() !== 0; }
  string() { let n = this.u8(); if (n === 0xff) { n = this.u16(); if (n === 0xffff) n = this.u32(); } return this.take(n).toString('latin1'); }
  count() { const n = this.u16(); return n === 0xffff ? this.u32() : n; }
}

class ClassMap {
  constructor() { this.next = 1; this.classes = new Map(); }
  prefix(r) {
    const tag = r.u16(); let name;
    if (tag === 0xffff) {
      assert(r.u16() === 1, 'unexpected MFC schema');
      name = r.take(r.u16()).toString('ascii');
      this.classes.set(this.next, name); this.next += 1;
    } else {
      assert((tag & 0x8000) !== 0, `unexpected MFC tag ${tag}`);
      name = this.classes.get(tag & 0x7fff);
      assert(name, `unknown MFC class reference ${tag & 0x7fff}`);
    }
    this.next += 1;
    return name;
  }
}

function bar(r) {
  const position = r.u8(); const type = r.u8(); const key = r.u8(); const time = r.u32(); const pulses = r.u8(); const rehearsal = r.i8(); const description = r.string();
  return { position, type, key, time, pulses, rehearsal, description };
}

function pteNote(r, classes) {
  assert(classes.prefix(r) === 'CLineData', 'expected CLineData');
  const packed = r.u8(); const simple = r.u16(); const complexCount = r.u8();
  for (let i = 0; i < complexCount; i += 1) assert(r.u32() === 0, 'unexpected note complex symbol');
  return { stringIndex: packed >>> 5, fret: packed & 0x1f, simple };
}
function ptePosition(r, classes) {
  assert(classes.prefix(r) === 'CPosition', 'expected CPosition');
  const coordinate = r.u8(); const beaming = r.u16(); const flagsAndDuration = r.u32(); const complexCount = r.u8();
  for (let i = 0; i < complexCount; i += 1) assert(r.u32() === 0, 'unexpected position complex symbol');
  const noteCount = r.count(); const notes = [];
  for (let i = 0; i < noteCount; i += 1) notes.push(pteNote(r, classes));
  return { coordinate, beaming, duration: flagsAndDuration >>> 24, flags: flagsAndDuration & 0xffffff, rest: (flagsAndDuration & 4) !== 0, notes };
}
function pteStaff(r, classes) {
  assert(classes.prefix(r) === 'CStaff', 'expected CStaff');
  const dataByte = r.u8(); r.take(4); const voices = [];
  for (let voice = 0; voice < 2; voice += 1) { const n = r.count(); const positions = []; for (let i = 0; i < n; i += 1) positions.push(ptePosition(r, classes)); voices.push(positions); }
  return { dataByte, voices };
}
function pteSystem(r, classes) {
  assert(classes.prefix(r) === 'CSection', 'expected CSection');
  const rect = [r.i32(), r.i32(), r.i32(), r.i32()]; r.take(5); const startBar = bar(r);
  assert(r.count() === 0 && r.count() === 0 && r.count() === 0, 'unexpected section auxiliary data');
  const staffCount = r.count(); const staffs = []; for (let i = 0; i < staffCount; i += 1) staffs.push(pteStaff(r, classes));
  const barlineCount = r.count(); const barlines = [];
  for (let i = 0; i < barlineCount; i += 1) { assert(classes.prefix(r) === 'CMusicBar', 'expected CMusicBar'); barlines.push(bar(r)); }
  return { rect, startBar, staffs, barlines };
}
function pteGuitar(r, classes) {
  assert(classes.prefix(r) === 'CGuitar', 'expected CGuitar');
  const number = r.u8(); const description = r.string(); const instrument = r.u8(); r.take(7); const tuningName = r.string(); const tuningData = r.u8(); const count = r.u8(); const tuning = [...r.take(count)];
  return { number, description, instrument, tuningName, tuningData, tuning };
}
function pteScore(r, classes) {
  const guitarCount = r.count(); const guitars = []; for (let i = 0; i < guitarCount; i += 1) guitars.push(pteGuitar(r, classes));
  for (let i = 0; i < 6; i += 1) assert(r.count() === 0, 'unexpected score auxiliary vector');
  const systemCount = r.count(); const systems = []; for (let i = 0; i < systemCount; i += 1) systems.push(pteSystem(r, classes));
  return { guitars, systems };
}
function pteParse(buffer) {
  const r = new Reader(buffer); const classes = new ClassMap();
  assert(r.take(4).toString('ascii') === 'ptab', 'bad marker'); assert(r.u16() === 4, 'not v1.7'); assert(r.u8() === 0, 'not song'); const content = r.u8();
  const title = r.string(); const artist = r.string(); assert(r.u8() === 3, 'unexpected release type'); assert(r.u8() === 0, 'unexpected author type'); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); r.string();
  const guitarScore = pteScore(r, classes); const bassScore = pteScore(r, classes);
  for (let f = 0; f < 3; f += 1) { r.string(); r.i32(); r.i32(); r.bool(); r.bool(); r.bool(); r.take(4); }
  const spacing = r.i32(); const fadeIn = r.u32(); const fadeOut = r.u32();
  assert(r.i === buffer.length, `PTE-style parser did not end at EOF: ${r.i}/${buffer.length}`);
  return { content, title, artist, guitarScore, bassScore, spacing, fadeIn, fadeOut };
}

function tuxHeaderItems(r) {
  const n = r.u16(); if (n) { const tag = r.u16(); if (tag === 0xffff) { assert(r.u16() === 1, 'Tux-style schema mismatch'); r.take(r.u16()); } } return n;
}
function tuxNote(r) { const packed = r.u8(); const simple = r.u16(); const n = r.u8(); r.take(n * 4); return { stringNumberHighToLow: ((packed & 0xe0) >>> 5) + 1, fret: packed & 0x1f, simple }; }
function tuxPosition(r) {
  const coordinate = r.u8(); r.u8(); r.u8(); const f0 = r.u8(); const f1 = r.u8(); const f2 = r.u8(); const duration = r.u8(); const complex = r.u8(); r.take(complex * 4);
  const n = tuxHeaderItems(r); const notes = []; for (let i = 0; i < n; i += 1) { notes.push(tuxNote(r)); if (i < n - 1) r.u16(); }
  return { coordinate, duration, flags: f0 | (f1 << 8) | (f2 << 16), rest: n === 0, notes };
}
function tuxStaff(r) { r.take(5); const voices = []; for (let v = 0; v < 2; v += 1) { const n = tuxHeaderItems(r); const p = []; for (let i = 0; i < n; i += 1) { p.push(tuxPosition(r)); if (i < n - 1) r.u16(); } voices.push(p); } return { voices }; }
function tuxSection(r) { r.take(16); r.take(5); const startBar = bar(r); for (let i = 0; i < 3; i += 1) assert(tuxHeaderItems(r) === 0, 'unexpected Tux section data'); const n = tuxHeaderItems(r); const staffs = []; for (let i = 0; i < n; i += 1) { staffs.push(tuxStaff(r)); if (i < n - 1) r.u16(); } const nb = tuxHeaderItems(r); const barlines = []; for (let i = 0; i < nb; i += 1) { barlines.push(bar(r)); if (i < nb - 1) r.u16(); } return { startBar, staffs, barlines }; }
function tuxTrack(r) {
  const ng = tuxHeaderItems(r); const guitars = [];
  for (let i = 0; i < ng; i += 1) { const number = r.u8(); const description = r.string(); const instrument = r.u8(); r.take(7); const tuningName = r.string(); r.u8(); const count = r.u8(); const tuning = [...r.take(count)]; guitars.push({ number, description, instrument, tuningName, tuning }); if (i < ng - 1) r.u16(); }
  for (let i = 0; i < 6; i += 1) assert(tuxHeaderItems(r) === 0, 'unexpected Tux auxiliary vector');
  const ns = tuxHeaderItems(r); const sections = []; for (let i = 0; i < ns; i += 1) { sections.push(tuxSection(r)); if (i < ns - 1) r.u16(); }
  return { guitars, sections };
}
function tuxParse(buffer) {
  const r = new Reader(buffer); assert(r.take(4).toString('ascii') === 'ptab', 'Tux marker mismatch'); assert(r.u16() === 4, 'Tux version mismatch'); assert(r.u8() === 0, 'Tux song classification mismatch'); r.u8(); const title = r.string(); const artist = r.string(); assert(r.u8() === 3); assert(r.u8() === 0); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); r.string(); const guitarTrack = tuxTrack(r); const bassTrack = tuxTrack(r); return { title, artist, guitarTrack, bassTrack, consumed: r.i };
}

assert(data.equals(mirror), 'base64 mirror mismatch');
assert(data.length > 698 && data.length < 800, `unexpected byte size ${data.length}`);
const digest = crypto.createHash('sha256').update(data).digest('hex');

assert(data.subarray(0, 6).toString('hex') === '707461620400', 'wire signature mismatch');

const pte = pteParse(data); const tux = tuxParse(data);
const ptePositions = pte.guitarScore.systems[0].staffs[0].voices[0];
const tuxPositions = tux.guitarTrack.sections[0].staffs[0].voices[0];
assert(pte.title === tux.title && pte.title === 'Guitar Eyes PTB 1.7 Proof', 'title parity failed');
assert(JSON.stringify(pte.guitarScore.guitars[0].tuning) === JSON.stringify([64,59,55,50,45,40]), 'PTE tuning mismatch');
assert(JSON.stringify(tux.guitarTrack.guitars[0].tuning) === JSON.stringify([64,59,55,50,45,40]), 'Tux tuning mismatch');
assert(ptePositions.length === 6 && tuxPositions.length === 6, 'position count mismatch');
for (let i = 0; i < 6; i += 1) { assert(ptePositions[i].coordinate === tuxPositions[i].coordinate, `coordinate mismatch ${i}`); assert(ptePositions[i].duration === tuxPositions[i].duration, `duration mismatch ${i}`); assert(ptePositions[i].notes.length === tuxPositions[i].notes.length, `note-count mismatch ${i}`); }
assert(pte.guitarScore.systems[0].barlines.length === 1 && pte.guitarScore.systems[0].barlines[0].position === 50, 'PTE barline parity failed');
assert(tux.guitarTrack.sections[0].barlines.length === 1 && tux.guitarTrack.sections[0].barlines[0].position === 50, 'Tux barline parity failed');
assert(ptePositions[4].rest && tuxPositions[4].rest, 'rest parity failed');
assert(ptePositions[5].notes.length === 2 && tuxPositions[5].notes.length === 2, 'chord parity failed');

console.log(JSON.stringify({
  bytes: data.length,
  sha256: digest,
  signature: 'ptab-4',
  pteStyleEof: true,
  tuxStylePayloadBytes: tux.consumed,
  tuningMidiHighToLow: pte.guitarScore.guitars[0].tuning,
  internalBarlines: pte.guitarScore.systems[0].barlines.map((b) => b.position),
  positions: ptePositions.map((p) => ({ coordinate: p.coordinate, duration: p.duration, rest: p.rest, noteCount: p.notes.length })),
  parity: 'passed'
}, null, 2));

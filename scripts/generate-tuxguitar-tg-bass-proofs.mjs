import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "fixtures", "tuxguitar-tg-bass");
const source = JSON.parse(fs.readFileSync(path.join(outputDir, "source.json"), "utf8"));
const UPSTREAM_RELEASE = "2.1.0";
const UPSTREAM_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const PRECISE_STARTS = [2882880, 5765760, 7207200, 8648640, 14414400, 20180160];
const tuning = source.tuningMidiHighToLow;
const measures = source.measures.map((measure) =>
  measure.map((event) => ({
    d: event.duration,
    notes: event.notes.map((note) => ({
      s: note.string,
      f: note.fret,
      palm: Boolean(note.palmMute),
    })),
  }))
);

if (
  source.schemaVersion !== 1 ||
  source.license !== "CC0-1.0" ||
  source.clef !== "bass" ||
  tuning.join(",") !== "43,38,33,28" ||
  measures.length !== 2 ||
  measures[0].length !== 4 ||
  measures[1].length !== 2
) {
  throw new Error("Unexpected standard-bass proof source.");
}

class Writer {
  constructor() { this.bytes = []; }
  u8(value) { this.bytes.push(value & 0xff); }
  u16(value) { this.u8(value >> 8); this.u8(value); }
  u32(value) { this.u8(value >>> 24); this.u8(value >>> 16); this.u8(value >>> 8); this.u8(value); }
  str8(value = "") { this.u8(value.length); for (const char of value) this.u16(char.charCodeAt(0)); }
  str32(value = "") { this.u32(value.length); for (const char of value) this.u16(char.charCodeAt(0)); }
  buffer() { return Buffer.from(this.bytes); }
}

function writeDuration(writer, value) { writer.u8(0); writer.u8(value); }
function writeMeasureHeaders(writer) {
  writer.u16(2);
  writer.u8(0x03); writer.u8(4); writeDuration(writer, 4); writer.u16(120);
  writer.u8(0);
}
function writeEffect(writer, palm) { if (palm) { writer.u8(0); writer.u8(0x20); writer.u8(0); } }
function writeNotes(writer, notes) {
  notes.forEach((note, index) => {
    writer.u8((index < notes.length - 1 ? 1 : 0) | (note.palm ? 4 : 0));
    writer.u8(note.f); writer.u8(note.s); writeEffect(writer, note.palm);
  });
}
function writeMeasure10(writer, events, first) {
  writer.u8(first ? 0x03 : 0);
  let duration = 4;
  events.forEach((event, index) => {
    let header = index < events.length - 1 ? 1 : 0;
    if (event.d !== duration) { header |= 2; duration = event.d; }
    if (event.notes.length) header |= 4;
    writer.u8(header);
    if (header & 2) writeDuration(writer, event.d);
    if (header & 4) writeNotes(writer, event.notes);
  });
  if (first) { writer.u8(2); writer.u8(0); }
}
function writeMeasure11(writer, events, first) {
  writer.u8(first ? 0x03 : 0);
  let duration = 4;
  let flags = 0;
  events.forEach((event, index) => {
    let voiceFlags = event.notes.length ? 1 : 0;
    if (event.d !== duration) { voiceFlags |= 2; duration = event.d; }
    let header = (index < events.length - 1 ? 1 : 0) | 0x10;
    if (voiceFlags !== flags) { header |= 0x20; flags = voiceFlags; }
    writer.u8(header);
    if (header & 0x20) writer.u8(voiceFlags);
    if (voiceFlags & 2) writeDuration(writer, event.d);
    if (voiceFlags & 1) writeNotes(writer, event.notes);
  });
  if (first) { writer.u8(2); writer.u8(0); }
}
function writeTrackTail(writer) {
  writer.u8(4); tuning.forEach((pitch) => writer.u8(pitch));
  writer.u8(24); writer.u8(0); writer.u8(0); writer.u8(0);
}
function writeLocalChannel(writer, header) {
  if (header) writer.u8(0);
  [0, 0, source.channelProgram, 100, 64, 0, 0, 0, 0].forEach((value) => writer.u8(value));
}
function writeGlobalChannel(writer) {
  writer.u16(1);
  [0, source.channelProgram, 100, 64, 0, 0, 0, 0].forEach((value) => writer.u8(value));
  writer.str8(source.channelName); writer.u16(0);
}
function legacy(version) {
  const writer = new Writer();
  writer.str8(`TuxGuitar File Format - ${version}`);
  [source.title, source.artist, "", source.author].forEach((value) => writer.str8(value));
  if (!["1.0", "1.1"].includes(version)) {
    ["", source.license, source.author, source.author].forEach((value) => writer.str8(value));
    writer.str32("");
  }
  if (["1.3", "1.5"].includes(version)) { writer.u8(1); writeGlobalChannel(writer); }
  writeMeasureHeaders(writer);
  writer.u8(1); writer.u8(0); writer.str8(source.trackName);
  if (version === "1.0") writeLocalChannel(writer, true);
  else if (["1.1", "1.2"].includes(version)) writeLocalChannel(writer, false);
  else writer.u16(1);
  measures.forEach((measure, index) =>
    (version === "1.0" ? writeMeasure10 : writeMeasure11)(writer, measure, index === 0)
  );
  writeTrackTail(writer);
  return writer.buffer();
}
function xml() {
  let cursor = 0;
  const measureXml = measures.map((measure) =>
    `<TGMeasure>${cursor === 0 ? "<clef>bass</clef><keySignature>0</keySignature>" : ""}${measure.map((event) => {
      const notes = event.notes.map((note) => `<note value="${note.f}" string="${note.s}" velocity="95">${note.palm ? "<palmMute/>" : ""}</note>`).join("");
      return `<TGBeat><preciseStart>${PRECISE_STARTS[cursor++]}</preciseStart><voice><duration value="${event.d}"/>${notes}</voice><voice empty="true"><duration value="4"/></voice></TGBeat>`;
    }).join("")}</TGMeasure>`
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?><TuxGuitarFile><TGVersion major="2" minor="1" revision="0"/><TGSong><name>${source.title}</name><artist>${source.artist}</artist><album></album><author>${source.author}</author><date></date><copyright>${source.license}</copyright><writer>${source.author}</writer><transcriber>${source.author}</transcriber><comments></comments><TGChannel><id>1</id><bank>0</bank><program>${source.channelProgram}</program><volume>100</volume><balance>64</balance><chorus>0</chorus><reverb>0</reverb><phaser>0</phaser><tremolo>0</tremolo><name>${source.channelName}</name></TGChannel><TGMeasureHeader><timeSignature numerator="4" denominator="4"/><tempo>120</tempo></TGMeasureHeader><TGMeasureHeader><timeSignature numerator="4" denominator="4"/><tempo>120</tempo></TGMeasureHeader><TGTrack maxFret="29"><name>${source.trackName}</name><channelId>1</channelId><color R="0" G="0" B="0"/>${tuning.map((pitch) => `<TGString>${pitch}</TGString>`).join("")}<TGLyric from="1"></TGLyric>${measureXml}</TGTrack></TGSong></TuxGuitarFile>`;
}

const crcTable = Array.from({ length: 256 }, (_, n) => { let c=n; for(let i=0;i<8;i++) c=c&1?0xedb88320^(c>>>1):c>>>1; return c>>>0; });
function crc32(buffer) { let c=0xffffffff; for(const byte of buffer)c=crcTable[(c^byte)&0xff]^(c>>>8); return (c^0xffffffff)>>>0; }
function u16le(value) { const b=Buffer.alloc(2); b.writeUInt16LE(value); return b; }
function u32le(value) { const b=Buffer.alloc(4); b.writeUInt32LE(value>>>0); return b; }
function zipStored(entries) {
  const locals=[],centrals=[]; let offset=0;
  for(const [name,sourceBytes] of entries){const data=Buffer.from(sourceBytes),nameBytes=Buffer.from(name),crc=crc32(data);const local=Buffer.concat([Buffer.from([0x50,0x4b,0x03,0x04]),u16le(20),u16le(0),u16le(0),u16le(0),u16le(0),u32le(crc),u32le(data.length),u32le(data.length),u16le(nameBytes.length),u16le(0),nameBytes,data]);locals.push(local);const central=Buffer.concat([Buffer.from([0x50,0x4b,0x01,0x02]),u16le(20),u16le(20),u16le(0),u16le(0),u16le(0),u16le(0),u32le(crc),u32le(data.length),u32le(data.length),u16le(nameBytes.length),u16le(0),u16le(0),u16le(0),u16le(0),u32le(0),u32le(offset),nameBytes]);centrals.push(central);offset+=local.length;}
  const localBytes=Buffer.concat(locals),centralBytes=Buffer.concat(centrals);return Buffer.concat([localBytes,centralBytes,Buffer.concat([Buffer.from([0x50,0x4b,0x05,0x06]),u16le(0),u16le(0),u16le(entries.length),u16le(entries.length),u32le(centralBytes.length),u32le(localBytes.length),u16le(0)])]);
}
function modern(){return zipStored([["version.txt",Buffer.from("TuxGuitar_file_format 2.0.0")],["content.xml",Buffer.from(xml())]]);}
function sha256(buffer){return crypto.createHash("sha256").update(buffer).digest("hex");}

fs.mkdirSync(outputDir,{recursive:true});
const specifications=[["1.0",legacy("1.0")],["1.1",legacy("1.1")],["1.2",legacy("1.2")],["1.3",legacy("1.3")],["1.5",legacy("1.5")],["2.0",modern()]];
const records=[];
for(const [version,bytes] of specifications){const stem=`tuxguitar-${version.replace(".","")}-standard-bass.tg`;fs.writeFileSync(path.join(outputDir,stem),bytes);fs.writeFileSync(path.join(outputDir,`${stem}.base64`),`${bytes.toString("base64")}\n`);const record={version,file:stem,bytes:bytes.length,sha256:sha256(bytes),container:version==="2.0"?"zip-xml":"legacy-binary",producerExported:false};if(version==="2.0"){const content=Buffer.from(xml());fs.writeFileSync(path.join(outputDir,"tuxguitar-20-standard-bass-content.xml"),`${content}\n`);record.producerApplicationVersion=UPSTREAM_RELEASE;record.contentXmlBytes=content.length;record.contentXmlSha256=sha256(content);}records.push(record);}
const manifest={schemaVersion:1,fixtureFamily:"TUXGUITAR_TG_STANDARD_BASS_SOURCE_DERIVED",sourceLicense:source.license,sourcePath:"fixtures/tuxguitar-tg-bass/source.json",upstreamRepository:"helge17/tuxguitar",upstreamRelease:UPSTREAM_RELEASE,upstreamCommit:UPSTREAM_COMMIT,profile:{instrument:"bass",stringCount:4,tuningMidiHighToLow:tuning,clef:"bass"},fixtures:records};
fs.writeFileSync(path.join(outputDir,"manifest.json"),`${JSON.stringify(manifest,null,2)}\n`);
console.log("Generated six deterministic TuxGuitar standard-bass .tg proofs.");

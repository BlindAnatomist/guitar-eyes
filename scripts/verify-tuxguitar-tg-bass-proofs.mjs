import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const fixtureDir = path.join(repoRoot, "fixtures", "tuxguitar-tg-bass");
const source = JSON.parse(fs.readFileSync(path.join(fixtureDir, "source.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(fixtureDir, "manifest.json"), "utf8"));
const EXPECTED_RELEASE = "2.1.0";
const EXPECTED_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const EXPECTED_VERSIONS = ["1.0", "1.1", "1.2", "1.3", "1.5", "2.0"];
const EXPECTED_TUNING = [43, 38, 33, 28];
const EXPECTED_PRECISE_STARTS = [2882880, 5765760, 7207200, 8648640, 14414400, 20180160];

function assert(condition, message) { if (!condition) throw new Error(message); }
function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function readUInt16LE(bytes, offset) { return bytes.readUInt16LE(offset); }
function readUInt32LE(bytes, offset) { return bytes.readUInt32LE(offset); }
function storedZipEntries(bytes) {
  let eocd=-1;
  for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset-=1){if(readUInt32LE(bytes,offset)===0x06054b50){eocd=offset;break;}}
  assert(eocd>=0,"Modern bass .tg ZIP has no EOCD record.");
  const totalEntries=readUInt16LE(bytes,eocd+10),centralSize=readUInt32LE(bytes,eocd+12),centralOffset=readUInt32LE(bytes,eocd+16);
  assert(totalEntries===2,`Modern bass .tg ZIP has ${totalEntries} entries instead of 2.`);
  const entries=new Map();let cursor=centralOffset;
  for(let index=0;index<totalEntries;index+=1){assert(readUInt32LE(bytes,cursor)===0x02014b50,"Invalid bass ZIP central entry.");const method=readUInt16LE(bytes,cursor+10),compressedSize=readUInt32LE(bytes,cursor+20),uncompressedSize=readUInt32LE(bytes,cursor+24),nameLength=readUInt16LE(bytes,cursor+28),extraLength=readUInt16LE(bytes,cursor+30),commentLength=readUInt16LE(bytes,cursor+32),localOffset=readUInt32LE(bytes,cursor+42),name=bytes.subarray(cursor+46,cursor+46+nameLength).toString("utf8");assert(method===0,`Bass fixture entry ${name} is not stored.`);assert(readUInt32LE(bytes,localOffset)===0x04034b50,`Invalid local header for ${name}.`);const localNameLength=readUInt16LE(bytes,localOffset+26),localExtraLength=readUInt16LE(bytes,localOffset+28),dataStart=localOffset+30+localNameLength+localExtraLength,data=bytes.subarray(dataStart,dataStart+compressedSize);assert(data.length===uncompressedSize,`Unexpected stored size for ${name}.`);entries.set(name,data);cursor+=46+nameLength+extraLength+commentLength;}
  assert(cursor===centralOffset+centralSize,"Bass ZIP central-directory size mismatch.");
  return entries;
}

assert(source.schemaVersion===1,"Unexpected bass source schema.");
assert(source.license==="CC0-1.0","Unexpected bass source license.");
assert(source.clef==="bass","Bass source clef must be bass.");
assert(source.tuningMidiHighToLow.join(",")===EXPECTED_TUNING.join(","),"Bass source tuning is not standard G2 D2 A1 E1.");
assert(manifest.schemaVersion===1,"Unexpected bass manifest schema.");
assert(manifest.fixtureFamily==="TUXGUITAR_TG_STANDARD_BASS_SOURCE_DERIVED","Unexpected bass fixture family.");
assert(manifest.upstreamRelease===EXPECTED_RELEASE,"Bass manifest producer release is stale.");
assert(manifest.upstreamCommit===EXPECTED_COMMIT,"Bass manifest producer commit is stale.");
assert(manifest.profile.instrument==="bass"&&manifest.profile.stringCount===4&&manifest.profile.clef==="bass","Bass profile metadata is inconsistent.");
assert(manifest.profile.tuningMidiHighToLow.join(",")===EXPECTED_TUNING.join(","),"Bass manifest tuning is inconsistent.");
assert(manifest.fixtures.map((fixture)=>fixture.version).join(",")===EXPECTED_VERSIONS.join(","),"Unexpected bass fixture-version sequence.");

for(const fixture of manifest.fixtures){const binaryPath=path.join(fixtureDir,fixture.file),binary=fs.readFileSync(binaryPath);assert(binary.length===fixture.bytes,`${fixture.version} bass byte count does not match manifest.`);assert(sha256(binary)===fixture.sha256,`${fixture.version} bass SHA-256 does not match manifest.`);const decoded=Buffer.from(fs.readFileSync(`${binaryPath}.base64`,"utf8").trim(),"base64");assert(binary.equals(decoded),`${fixture.version} bass base64 twin does not reproduce binary.`);if(fixture.version==="2.0"){const entries=storedZipEntries(binary);assert(entries.size===2&&entries.has("version.txt")&&entries.has("content.xml"),"Modern bass .tg must contain version.txt and content.xml only.");assert(entries.get("version.txt").toString("utf8")==="TuxGuitar_file_format 2.0.0","Modern bass version.txt is not exact 2.0.0 evidence.");const xmlBytes=entries.get("content.xml"),xml=xmlBytes.toString("utf8");assert(xmlBytes.length===fixture.contentXmlBytes,"Modern bass content.xml byte count mismatch.");assert(sha256(xmlBytes)===fixture.contentXmlSha256,"Modern bass content.xml hash mismatch.");assert(xml.includes('<TGVersion major="2" minor="1" revision="0"/>'),"Modern bass producer application metadata is not 2.1.0.");assert(xml.includes("<clef>bass</clef>"),"Modern bass proof lacks bass clef.");const tuning=[...xml.matchAll(/<TGString>(\d+)<\/TGString>/gu)].map((match)=>Number(match[1]));assert(tuning.join(",")===EXPECTED_TUNING.join(","),"Modern bass tuning mismatch.");const starts=[...xml.matchAll(/<preciseStart>(\d+)<\/preciseStart>/gu)].map((match)=>Number(match[1]));assert(starts.join(",")===EXPECTED_PRECISE_STARTS.join(","),"Modern bass preciseStart sequence mismatch.");assert((xml.match(/<TGMeasure>/gu)||[]).length===2,"Modern bass proof must contain two measures.");assert((xml.match(/<TGBeat>/gu)||[]).length===6,"Modern bass proof must contain six beats.");assert((xml.match(/<note\b/gu)||[]).length===6,"Modern bass proof must contain six notes.");assert((xml.match(/<palmMute\/>/gu)||[]).length===1,"Modern bass proof must contain one palm mute.");const audited=fs.readFileSync(path.join(fixtureDir,"tuxguitar-20-standard-bass-content.xml"));assert(audited.equals(Buffer.concat([xmlBytes,Buffer.from("\n")])),"Audited modern bass XML does not match archive content.");}else{const signature=`TuxGuitar File Format - ${fixture.version}`,utf16be=Buffer.alloc(signature.length*2);[...signature].forEach((character,index)=>utf16be.writeUInt16BE(character.charCodeAt(0),index*2));assert(binary.includes(utf16be),`${fixture.version} legacy bass internal signature is missing.`);}}
console.log("Verified six deterministic TuxGuitar standard-bass proofs against pinned 2.1.0 authority.");

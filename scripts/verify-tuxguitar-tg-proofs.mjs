import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const fixtureDir = path.join(repoRoot, "fixtures", "tuxguitar-tg");
const manifestPath = path.join(fixtureDir, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const EXPECTED_RELEASE = "2.1.0";
const EXPECTED_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const EXPECTED_VERSIONS = ["1.0", "1.1", "1.2", "1.3", "1.5", "2.0"];
const EXPECTED_PRECISE_STARTS = [
  2882880,
  5765760,
  7207200,
  8648640,
  14414400,
  20180160,
];
const EXPECTED_TUNING = [64, 59, 55, 50, 45, 40];

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readUInt16LE(bytes, offset) {
  return bytes.readUInt16LE(offset);
}

function readUInt32LE(bytes, offset) {
  return bytes.readUInt32LE(offset);
}

function storedZipEntries(bytes) {
  const eocdSignature = 0x06054b50;
  let eocd = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (readUInt32LE(bytes, offset) === eocdSignature) {
      eocd = offset;
      break;
    }
  }
  assert(eocd >= 0, "Modern .tg ZIP has no EOCD record.");
  const totalEntries = readUInt16LE(bytes, eocd + 10);
  const centralSize = readUInt32LE(bytes, eocd + 12);
  const centralOffset = readUInt32LE(bytes, eocd + 16);
  assert(totalEntries === 2, `Modern .tg ZIP has ${totalEntries} entries instead of 2.`);

  const entries = new Map();
  let cursor = centralOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    assert(readUInt32LE(bytes, cursor) === 0x02014b50, "Invalid ZIP central entry.");
    const method = readUInt16LE(bytes, cursor + 10);
    const compressedSize = readUInt32LE(bytes, cursor + 20);
    const uncompressedSize = readUInt32LE(bytes, cursor + 24);
    const nameLength = readUInt16LE(bytes, cursor + 28);
    const extraLength = readUInt16LE(bytes, cursor + 30);
    const commentLength = readUInt16LE(bytes, cursor + 32);
    const localOffset = readUInt32LE(bytes, cursor + 42);
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    assert(method === 0, `Source-derived modern fixture entry ${name} is not stored.`);
    assert(readUInt32LE(bytes, localOffset) === 0x04034b50, `Invalid local header for ${name}.`);
    const localNameLength = readUInt16LE(bytes, localOffset + 26);
    const localExtraLength = readUInt16LE(bytes, localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = bytes.subarray(dataStart, dataStart + compressedSize);
    assert(data.length === uncompressedSize, `Unexpected stored size for ${name}.`);
    entries.set(name, data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  assert(cursor === centralOffset + centralSize, "Modern .tg central-directory size mismatch.");
  assert(entries.size === 2, "Modern .tg has duplicate ZIP entry names.");
  assert(entries.has("version.txt") && entries.has("content.xml"), "Modern .tg must contain only version.txt and content.xml.");
  return entries;
}

assert(manifest.schemaVersion === 1, "Unexpected TuxGuitar manifest schema.");
assert(manifest.fixtureFamily === "TUXGUITAR_TG_SOURCE_DERIVED", "Unexpected fixture family.");
assert(manifest.upstreamRelease === EXPECTED_RELEASE, "Manifest producer release is stale.");
assert(manifest.upstreamCommit === EXPECTED_COMMIT, "Manifest producer commit is stale.");
assert(manifest.fixtures.length === EXPECTED_VERSIONS.length, "Unexpected fixture count.");
assert(
  manifest.fixtures.map((fixture) => fixture.version).join(",") === EXPECTED_VERSIONS.join(","),
  "Unexpected TuxGuitar fixture-version sequence."
);

for (const fixture of manifest.fixtures) {
  const binaryPath = path.join(fixtureDir, fixture.file);
  const binary = fs.readFileSync(binaryPath);
  assert(binary.length === fixture.bytes, `${fixture.version} byte count does not match manifest.`);
  assert(sha256(binary) === fixture.sha256, `${fixture.version} SHA-256 does not match manifest.`);
  const base64Path = `${binaryPath}.base64`;
  const decoded = Buffer.from(fs.readFileSync(base64Path, "utf8").trim(), "base64");
  assert(binary.equals(decoded), `${fixture.version} base64 twin does not reproduce the binary.`);

  if (fixture.version === "2.0") {
    assert(fixture.producerApplicationVersion === EXPECTED_RELEASE, "Modern producer application version is stale.");
    const entries = storedZipEntries(binary);
    const versionText = entries.get("version.txt").toString("utf8");
    assert(versionText === "TuxGuitar_file_format 2.0.0", "Modern native version.txt is not exact 2.0.0 evidence.");
    const xmlBytes = entries.get("content.xml");
    const xml = xmlBytes.toString("utf8");
    assert(xmlBytes.length === fixture.contentXmlBytes, "Modern content.xml byte count does not match manifest.");
    assert(sha256(xmlBytes) === fixture.contentXmlSha256, "Modern content.xml SHA-256 does not match manifest.");
    assert(xml.includes('<TGVersion major="2" minor="1" revision="0"/>'), "Modern content.xml does not identify TuxGuitar 2.1.0 producer metadata.");
    const tuning = [...xml.matchAll(/<TGString>(\d+)<\/TGString>/gu)].map((match) => Number(match[1]));
    assert(tuning.join(",") === EXPECTED_TUNING.join(","), "Modern tuning does not match the six-string proof.");
    const starts = [...xml.matchAll(/<preciseStart>(\d+)<\/preciseStart>/gu)].map((match) => Number(match[1]));
    assert(starts.join(",") === EXPECTED_PRECISE_STARTS.join(","), "Modern preciseStart sequence does not match TuxGuitar 2.1.0 timing.");
    assert((xml.match(/<TGMeasure>/gu) || []).length === 2, "Modern proof must contain exactly two measures.");
    assert((xml.match(/<TGBeat>/gu) || []).length === 6, "Modern proof must contain exactly six beats.");
    assert((xml.match(/<note\b/gu) || []).length === 6, "Modern proof must contain exactly six notes.");
    assert((xml.match(/<palmMute\/>/gu) || []).length === 1, "Modern proof must contain exactly one palm-mute marker.");
    const auditedXml = fs.readFileSync(path.join(fixtureDir, "tuxguitar-20-content.xml"));
    assert(auditedXml.equals(Buffer.concat([xmlBytes, Buffer.from("\n")])), "Audited modern XML file does not match archive content.");
  } else {
    const signature = `TuxGuitar File Format - ${fixture.version}`;
    const utf16be = Buffer.alloc(signature.length * 2);
    [...signature].forEach((character, index) => utf16be.writeUInt16BE(character.charCodeAt(0), index * 2));
    assert(binary.includes(utf16be), `${fixture.version} legacy internal signature is missing.`);
  }
}

console.log("Verified six deterministic TuxGuitar .tg source-derived proofs against the pinned 2.1.0 authority.");

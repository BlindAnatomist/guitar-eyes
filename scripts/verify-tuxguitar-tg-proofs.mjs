import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.join(process.cwd(), "fixtures", "tuxguitar-tg");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const expectedVersions = ["1.0", "1.1", "1.2", "1.3", "1.5", "2.0"];

function fail(message) {
  throw new Error(message);
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function readLegacyHeader(buffer) {
  if (buffer.length < 1) fail("Legacy fixture is empty.");
  const length = buffer[0];
  if (buffer.length < 1 + length * 2) fail("Legacy fixture header is truncated.");
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += String.fromCharCode(buffer.readUInt16BE(1 + index * 2));
  }
  return value;
}

if (manifest.schemaVersion !== 1) fail("Unexpected TuxGuitar manifest schema.");
if (manifest.fixtureFamily !== "TUXGUITAR_TG_SOURCE_DERIVED") {
  fail("Unexpected TuxGuitar fixture family.");
}
if (manifest.upstreamRelease !== "2.0.1") fail("Unexpected TuxGuitar producer release.");
if (manifest.upstreamCommit !== "533efa74e6a56bdae28bb776358305607c79cbff") {
  fail("Unexpected TuxGuitar producer commit.");
}
if (!Array.isArray(manifest.fixtures) || manifest.fixtures.length !== expectedVersions.length) {
  fail("The TuxGuitar manifest must contain exactly six fixtures.");
}

for (let index = 0; index < expectedVersions.length; index += 1) {
  const fixture = manifest.fixtures[index];
  const expectedVersion = expectedVersions[index];
  if (fixture.version !== expectedVersion) fail(`Unexpected fixture order at ${expectedVersion}.`);
  if (fixture.producerExported !== false) fail(`${expectedVersion} is incorrectly labeled as producer-exported.`);

  const binaryPath = path.join(root, fixture.file);
  const mirrorPath = `${binaryPath}.base64`;
  const binary = fs.readFileSync(binaryPath);
  const mirror = Buffer.from(fs.readFileSync(mirrorPath, "utf8").trim(), "base64");

  if (!binary.equals(mirror)) fail(`${expectedVersion} binary and base64 twin differ.`);
  if (binary.length !== fixture.bytes) fail(`${expectedVersion} byte count differs from the manifest.`);
  if (sha256(binary) !== fixture.sha256) fail(`${expectedVersion} SHA-256 differs from the manifest.`);

  if (expectedVersion === "2.0") {
    if (fixture.container !== "zip-xml") fail("Modern TuxGuitar fixture has the wrong container label.");
    if (binary.readUInt32LE(0) !== 0x04034b50) fail("Modern TuxGuitar fixture lacks the ZIP local-header signature.");
    if (!binary.includes(Buffer.from("TuxGuitar_file_format 2.0.0", "utf8"))) {
      fail("Modern TuxGuitar fixture lacks exact version.txt evidence.");
    }
    if (!binary.includes(Buffer.from("content.xml", "utf8"))) {
      fail("Modern TuxGuitar fixture lacks the content.xml entry name.");
    }
  } else {
    if (fixture.container !== "legacy-binary") fail(`${expectedVersion} has the wrong legacy container label.`);
    const header = readLegacyHeader(binary);
    if (header !== `TuxGuitar File Format - ${expectedVersion}`) {
      fail(`${expectedVersion} carries unexpected legacy header ${header}.`);
    }
  }
}

console.log("Verified six deterministic TuxGuitar .tg proof fixtures.");

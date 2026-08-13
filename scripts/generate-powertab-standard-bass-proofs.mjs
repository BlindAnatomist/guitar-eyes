import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import zlib from "node:zlib";
import { generateLegacyBass } from "./powertab-standard-bass/legacy-bass.mjs";
import { verifyV11Template } from "./powertab-standard-bass/verify-v11-template.mjs";

const outDir = process.argv[2] || path.join(process.cwd(), "fixtures", "powertab-standard-bass");
fs.mkdirSync(outDir, { recursive: true });
const fixtureDir = path.join(process.cwd(), "fixtures", "powertab-standard-bass");
const sourcePath = path.join(fixtureDir, "powertab-standard-bass-six-position.source.json");
const templatePath = path.join(fixtureDir, "powertab-v11-standard-bass.template.json");
const sourceText = fs.readFileSync(sourcePath, "utf8");
const source = JSON.parse(sourceText);
const v11 = JSON.parse(fs.readFileSync(templatePath, "utf8"));
const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const files = [];

verifyV11Template(v11, source);

for (const [fileVersion, powerTabVersion, stem] of [
  [1, "1.0", "powertab-v10-standard-bass"],
  [2, "1.0.2", "powertab-v102-standard-bass"],
  [3, "1.5", "powertab-v15-standard-bass"],
  [4, "1.7", "powertab-v17-standard-bass"],
]) {
  const binary = generateLegacyBass(source, fileVersion);
  const filename = `${stem}.ptb`;
  fs.writeFileSync(path.join(outDir, filename), binary);
  fs.writeFileSync(path.join(outDir, `${filename}.base64`), `${binary.toString("base64")}\n`);
  files.push({ filename, family: "ptb", fileVersion, powerTabVersion, bytes: binary.length, sha256: hash(binary), headerHex: binary.subarray(0, 6).toString("hex") });
}

const v11SourceText = `${JSON.stringify(v11, null, 2)}\n`;
fs.writeFileSync(path.join(outDir, "powertab-v11-standard-bass.source.json"), v11SourceText);
const canonicalV11 = `${JSON.stringify(v11)}\n`;
const compressedV11 = zlib.gzipSync(Buffer.from(canonicalV11, "utf8"), { level: 9, mtime: 0 });
const v11Name = "powertab-v11-standard-bass.pt2";
fs.writeFileSync(path.join(outDir, v11Name), compressedV11);
fs.writeFileSync(path.join(outDir, `${v11Name}.base64`), `${compressedV11.toString("base64")}\n`);
files.push({
  filename: v11Name,
  family: "pt2",
  internalVersion: 11,
  powerTabVersion: "2.0.22",
  bytes: compressedV11.length,
  sha256: hash(compressedV11),
  canonicalJsonBytes: Buffer.byteLength(canonicalV11),
  canonicalJsonSha256: hash(Buffer.from(canonicalV11, "utf8")),
});

const manifest = {
  schemaVersion: 1,
  title: "Guitar Eyes PowerTab standard four-string bass proof corpus",
  license: "CC0-1.0 project-authored test material",
  provenance: {
    generator: "scripts/generate-powertab-standard-bass-proofs.mjs",
    powerTabEditorRelease: "2.0.22",
    powerTabEditorCommit: "13cab27c7127d301f2747671071e53eb203dc940",
    legacySourceBasis: "PowerTab old-format serializer/deserializer structures already accepted for file versions 1 through 4",
    standardBassTuningMidiHighToLow: source.tuningMidiHighToLow,
  },
  semanticProof: { measures: 2, positions: 6, restPositions: 1, finalChordNotes: 2, tuningMidiHighToLow: source.tuningMidiHighToLow },
  source: { filename: "powertab-standard-bass-six-position.source.json", bytes: Buffer.byteLength(sourceText), sha256: hash(Buffer.from(sourceText, "utf8")) },
  files,
};
fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

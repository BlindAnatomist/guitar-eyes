import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const fixtureDirectory = "fixtures/powertab-v11";
const sourcePath = `${fixtureDirectory}/powertab-v11-original-six-position.source.json`;
const outputPath = `${fixtureDirectory}/powertab-v11-original-six-position.pt2`;
const base64Path = `${outputPath}.base64`;
const manifestPath = `${fixtureDirectory}/manifest.json`;

const sourceText = await readFile(sourcePath, "utf8");
const parsed = JSON.parse(sourceText);
if (parsed.version !== 11 || !parsed.score) {
  throw new Error("The fixture source must be a PowerTab v11 score document.");
}

const canonicalJson = `${JSON.stringify(parsed)}\n`;
const compressed = gzipSync(Buffer.from(canonicalJson, "utf8"), {
  level: 9,
  mtime: 0,
});
const base64 = `${compressed.toString("base64")}\n`;
const sha256 = createHash("sha256").update(compressed).digest("hex");
const jsonSha256 = createHash("sha256")
  .update(Buffer.from(canonicalJson, "utf8"))
  .digest("hex");

await writeFile(outputPath, compressed);
await writeFile(base64Path, base64);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const expectedSource = manifest.files?.source;
const expectedBinary = manifest.files?.binary;
const mismatches = [
  ["canonical JSON bytes", expectedSource?.canonicalJsonBytes, Buffer.byteLength(canonicalJson)],
  ["canonical JSON SHA-256", expectedSource?.sha256, jsonSha256],
  ["binary bytes", expectedBinary?.bytes, compressed.byteLength],
  ["binary SHA-256", expectedBinary?.sha256, sha256],
].filter(([, expected, actual]) => expected !== actual);
if (mismatches.length > 0) {
  throw new Error(
    `The generated PowerTab fixture contradicts manifest.json: ${mismatches
      .map(([label, expected, actual]) => `${label}, expected ${expected}, received ${actual}`)
      .join("; ")}.`
  );
}

console.log(
  JSON.stringify(
    {
      outputPath,
      compressedBytes: compressed.byteLength,
      sha256,
      canonicalJsonBytes: Buffer.byteLength(canonicalJson),
      canonicalJsonSha256: jsonSha256,
      manifestVerified: true,
    },
    null,
    2
  )
);

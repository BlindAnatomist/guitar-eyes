import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { TextDecoder as NodeTextDecoder } from "util";
import { describePlayablePosition } from "./positionDescription";
import { decodeTuxGuitarFile } from "./tuxGuitarDecoder";
import { normalizeVerifiedTuxGuitarIntermediate } from "./tuxGuitarSourceNormalizer";
import { buildTuxGuitarReaderDocuments } from "./tuxGuitarReaderDocuments";

if (typeof globalThis.TextDecoder !== "function") {
  globalThis.TextDecoder = NodeTextDecoder;
}

const UPSTREAM_RELEASE = "2.1.0";
const UPSTREAM_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const PRECISE_STARTS = [2882880, 5765760, 7207200, 8648640, 14414400, 20180160];
const CASES = [
  ["1.0", "10", "TG_1_0", "TuxGuitar File Format - 1.0"],
  ["1.1", "11", "TG_1_1", "TuxGuitar File Format - 1.1"],
  ["1.2", "12", "TG_1_2", "TuxGuitar File Format - 1.2"],
  ["1.3", "13", "TG_1_3", "TuxGuitar File Format - 1.3"],
  ["1.5", "15", "TG_1_5", "TuxGuitar File Format - 1.5"],
  ["2.0", "20", "TG_2_0", "2.0.0"],
];

function fixturePath(filename) {
  return path.join(process.cwd(), "fixtures", "tuxguitar-tg", filename);
}
function fixtureBytes(code) {
  return fs.readFileSync(fixturePath(`tuxguitar-${code}-six-position.tg`));
}
function asFile(name, bytes) {
  return {
    name,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}
function fixtureFile(code) {
  return asFile(`tuxguitar-${code}-six-position.tg`, fixtureBytes(code));
}
function legacyHeaderFile(header) {
  const bytes = [header.length];
  for (const character of header) {
    const code = character.charCodeAt(0);
    bytes.push((code >> 8) & 0xff, code & 0xff);
  }
  return asFile("historical.tg", Buffer.from(bytes));
}
function tamperAscii(bytes, original, replacement) {
  expect(original).toHaveLength(replacement.length);
  const copy = Buffer.from(bytes);
  const offset = copy.indexOf(Buffer.from(original));
  expect(offset).toBeGreaterThanOrEqual(0);
  copy.write(replacement, offset, replacement.length, "utf8");
  return copy;
}
function expectSixPositionIntermediate(intermediate, sourceVersion, formatVersion) {
  expect(intermediate).toMatchObject({
    schemaVersion: 1,
    sourceVersion,
    title: "Guitar Eyes TG Proof",
    versionEvidence: {
      schemaVersion: 1,
      extensionFamily: ".tg",
      formatVersion,
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
      declaredTrackCount: 1,
      decodedTrackCount: 1,
    },
  });
  if (sourceVersion === "TG_2_0") {
    expect(intermediate.versionEvidence.producerApplicationVersion).toBe("2.1.0");
    expect(
      intermediate.tracks[0].staves[0].bars.flatMap((bar) =>
        bar.voices[0].beats.map((beat) => beat.sourcePreciseStart)
      )
    ).toEqual(PRECISE_STARTS);
  }
  expect(intermediate.tracks[0]).toMatchObject({ name: "Proof Guitar", isPercussion: false });
  const staff = intermediate.tracks[0].staves[0];
  expect(staff.tuningMidiHighToLow).toEqual([64, 59, 55, 50, 45, 40]);
  expect(staff.bars).toHaveLength(2);
  expect(staff.bars.map((bar) => bar.voices[0].beats.length)).toEqual([4, 2]);
  expect(staff.bars[0].voices[0].beats.map((beat) => beat.durationDenominator)).toEqual([4, 8, 8, 2]);
  expect(staff.bars[1].voices[0].beats.map((beat) => beat.durationDenominator)).toEqual([2, 2]);
  expect(staff.bars[1].voices[0].beats[0].isRest).toBe(true);
  expect(staff.bars[1].voices[0].beats[1].notes).toHaveLength(2);
  expect(staff.bars[0].voices[0].beats[3].notes[0]).toMatchObject({
    stringNumberLowToHigh: 3,
    fret: 0,
    techniques: ["palm mute"],
  });
}
function expectSixPositionDocument(document, sourceVersion) {
  expect(document).toMatchObject({
    type: "tablature-document",
    sourceFormat: "tuxguitar",
    sourceVersion,
    title: "Guitar Eyes TG Proof",
    instrument: "guitar",
    instrumentLabel: "six-string guitar",
    stringCount: 6,
    sourceTrackName: "Proof Guitar",
  });
  expect(document.positions).toHaveLength(6);
  expect(document.measures).toHaveLength(2);
  expect(document.positions[0].strings[5]).toMatchObject({ type: "fret", fret: 3 });
  expect(document.positions[1].strings[4]).toMatchObject({ type: "open" });
  expect(document.positions[2].strings[4]).toMatchObject({ type: "fret", fret: 2 });
  expect(document.positions[3].strings[3]).toMatchObject({ type: "open" });
  expect(document.positions[3].strings[3].techniques).toEqual([
    expect.objectContaining({ name: "palm mute", source: "tuxguitar" }),
  ]);
  expect(document.positions[4].isRest).toBe(true);
  expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
  expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 1 });
  expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([4, 4]);
  expect(document.blocks[0].sourceLayoutLabel).toBe("Normalized TuxGuitar spatial layout");
  expect(describePlayablePosition(document, 4)).toContain("Rest.");
  expect(describePlayablePosition(document, 5)).toContain("High E string, open.");
  expect(describePlayablePosition(document, 5)).toContain("B string, fret 1.");
  expect(JSON.stringify(document)).not.toMatch(/guitar-pro/iu);
}

describe("bounded TuxGuitar .tg compatibility", () => {
  test.each(CASES)("decodes and normalizes TuxGuitar %s", async (_label, code, sourceVersion, formatVersion) => {
    const intermediate = await decodeTuxGuitarFile(fixtureFile(code));
    expectSixPositionIntermediate(intermediate, sourceVersion, formatVersion);
    const document = normalizeVerifiedTuxGuitarIntermediate(intermediate);
    expectSixPositionDocument(document, sourceVersion);
  });

  test.each(CASES)("routes TuxGuitar %s through the shared reader documents", async (_label, code, sourceVersion) => {
    const result = await buildTuxGuitarReaderDocuments(fixtureFile(code));
    expect(result).toMatchObject({
      desktopSource: "semantic",
      supportOutcome: "source-checkpoint-provisional",
      sourceFormat: "tuxguitar",
      requiresTrackSelection: false,
    });
    expect(result.sourceFormatLabel).toContain("TuxGuitar");
    expectSixPositionDocument(result.semanticDocument, sourceVersion);
    expect(result.desktopBlocks).toHaveLength(1);
  });

  test("verifies every binary, base64 transport twin, byte count, hash, and producer authority", () => {
    const manifest = JSON.parse(fs.readFileSync(fixturePath("manifest.json"), "utf8"));
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      fixtureFamily: "TUXGUITAR_TG_SOURCE_DERIVED",
      sourceLicense: "CC0-1.0",
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
    });
    expect(manifest.fixtures).toHaveLength(6);
    for (const fixture of manifest.fixtures) {
      expect(fixture.producerExported).toBe(false);
      const binary = fs.readFileSync(fixturePath(fixture.file));
      const mirror = Buffer.from(
        fs.readFileSync(fixturePath(`${fixture.file}.base64`), "utf8").trim(),
        "base64"
      );
      expect(mirror.equals(binary)).toBe(true);
      expect(binary.byteLength).toBe(fixture.bytes);
      expect(createHash("sha256").update(binary).digest("hex")).toBe(fixture.sha256);
    }
    expect(manifest.fixtures.find((fixture) => fixture.version === "2.0")).toMatchObject({
      bytes: 2529,
      sha256: "f9c3536a8db9f4ebf9216d4223ad3a7994f225b7e37faaf4bf3285fb8f7b200a",
      producerApplicationVersion: "2.1.0",
      contentXmlBytes: 2284,
      contentXmlSha256: "aa3bb84a2894aef519fc37355c9ffb60a9ae048306b6cc2f91338227c62133e2",
    });
  });

  test("recognizes but defers the producer's read-only 0.9 generation", async () => {
    await expect(
      decodeTuxGuitarFile(legacyHeaderFile("TuxGuitar File Format - 0.9"))
    ).rejects.toMatchObject({
      name: "TuxGuitarImportError",
      code: "DEFERRED_TUXGUITAR_LEGACY_VERSION",
    });
  });

  test("rejects unsupported or contradictory source evidence instead of guessing", async () => {
    const intermediate = await decodeTuxGuitarFile(fixtureFile("10"));
    intermediate.versionEvidence = { ...intermediate.versionEvidence, decodedTrackCount: 2 };
    expect(() => normalizeVerifiedTuxGuitarIntermediate(intermediate)).toThrow(
      /source evidence is missing, unsupported, or contradictory/i
    );
  });

  test("uses a distinct exact two-entry container for modern 2.0", async () => {
    const legacy = await decodeTuxGuitarFile(fixtureFile("15"));
    const modern = await decodeTuxGuitarFile(fixtureFile("20"));
    expect(legacy.versionEvidence.containerFamily).toBe("TUXGUITAR_LEGACY_BINARY");
    expect(modern.versionEvidence).toMatchObject({
      containerFamily: "TUXGUITAR_ZIP_XML",
      versionText: "TuxGuitar_file_format 2.0.0",
      versionEntry: "version.txt",
      contentEntry: "content.xml",
      producerApplicationVersion: "2.1.0",
    });
  });

  test("rejects a modern source-derived file whose producer preciseStart evidence is wrong", async () => {
    const bytes = tamperAscii(fixtureBytes("20"), "2882880", "2882881");
    await expect(decodeTuxGuitarFile(asFile("wrong-time.tg", bytes))).rejects.toMatchObject({
      name: "TuxGuitarImportError",
      code: "INVALID_TUXGUITAR_PRECISE_START",
    });
  });

  test("rejects modern application-version metadata outside the proven 2.0-2.1 producer range", async () => {
    const bytes = tamperAscii(fixtureBytes("20"), 'minor="1"', 'minor="2"');
    await expect(decodeTuxGuitarFile(asFile("future-producer.tg", bytes))).rejects.toMatchObject({
      name: "TuxGuitarImportError",
      code: "UNSUPPORTED_TUXGUITAR_PRODUCER_VERSION",
    });
  });

  test("rejects a future modern native major version instead of inferring compatibility from .tg", async () => {
    const bytes = tamperAscii(
      fixtureBytes("20"),
      "TuxGuitar_file_format 2.0.0",
      "TuxGuitar_file_format 3.0.0"
    );
    await expect(decodeTuxGuitarFile(asFile("future-native.tg", bytes))).rejects.toMatchObject({
      name: "TuxGuitarImportError",
      code: "UNSUPPORTED_TUXGUITAR_VERSION",
    });
  });
});

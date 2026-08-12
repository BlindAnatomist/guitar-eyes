import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder,
} from "util";
import { decodeTuxGuitarFile } from "./tuxGuitarDecoder";
import { decodeTuxGuitarProfileFile } from "./tuxGuitarProfileDecoder";
import { normalizeVerifiedTuxGuitarIntermediate } from "./tuxGuitarSourceNormalizer";
import { buildTuxGuitarTrackInventory } from "./tuxGuitarTrackInventory";
import { buildTuxGuitarReaderDocuments } from "./tuxGuitarReaderDocuments";
import { describePlayablePosition } from "./positionDescription";

if (typeof globalThis.TextDecoder !== "function") {
  globalThis.TextDecoder = NodeTextDecoder;
}
if (typeof globalThis.TextEncoder !== "function") {
  globalThis.TextEncoder = NodeTextEncoder;
}

const UPSTREAM_RELEASE = "2.1.0";
const UPSTREAM_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const STANDARD_BASS = [43, 38, 33, 28];
const PRECISE_STARTS = [2882880, 5765760, 7207200, 8648640, 14414400, 20180160];
const CASES = [
  ["1.0", "10", "TG_1_0", "TuxGuitar File Format - 1.0"],
  ["1.1", "11", "TG_1_1", "TuxGuitar File Format - 1.1"],
  ["1.2", "12", "TG_1_2", "TuxGuitar File Format - 1.2"],
  ["1.3", "13", "TG_1_3", "TuxGuitar File Format - 1.3"],
  ["1.5", "15", "TG_1_5", "TuxGuitar File Format - 1.5"],
  ["2.0", "20", "TG_2_0", "2.0.0"],
];

function bassFixturePath(filename) {
  return path.join(process.cwd(), "fixtures", "tuxguitar-tg-bass", filename);
}
function guitarFixturePath(filename) {
  return path.join(process.cwd(), "fixtures", "tuxguitar-tg", filename);
}
function asFile(name, bytes) {
  return {
    name,
    size: bytes.byteLength,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}
function bassFile(code) {
  const bytes = fs.readFileSync(bassFixturePath(`tuxguitar-${code}-standard-bass.tg`));
  return asFile(`tuxguitar-${code}-standard-bass.tg`, bytes);
}
function guitarFile(code) {
  const bytes = fs.readFileSync(guitarFixturePath(`tuxguitar-${code}-six-position.tg`));
  return asFile(`tuxguitar-${code}-six-position.tg`, bytes);
}

function expectBassIntermediate(intermediate, sourceVersion, formatVersion) {
  expect(intermediate).toMatchObject({
    schemaVersion: 1,
    sourceVersion,
    title: "Guitar Eyes TG Bass Proof",
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
  const staff = intermediate.tracks[0].staves[0];
  expect(intermediate.tracks[0].name).toBe("Proof Bass");
  expect(staff.tuningMidiHighToLow).toEqual(STANDARD_BASS);
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
  if (sourceVersion === "TG_2_0") {
    expect(intermediate.versionEvidence.producerApplicationVersion).toBe("2.1.0");
    expect(
      staff.bars.flatMap((bar) =>
        bar.voices[0].beats.map((beat) => beat.sourcePreciseStart)
      )
    ).toEqual(PRECISE_STARTS);
  }
}

function expectBassDocument(document, sourceVersion) {
  expect(document).toMatchObject({
    type: "tablature-document",
    sourceFormat: "tuxguitar",
    sourceVersion,
    title: "Guitar Eyes TG Bass Proof",
    instrument: "bass",
    instrumentLabel: "four-string bass",
    stringCount: 4,
    sourceTrackName: "Proof Bass",
  });
  expect(document.positions).toHaveLength(6);
  expect(document.measures).toHaveLength(2);
  expect(document.positions[0].strings[3]).toMatchObject({ type: "fret", fret: 3 });
  expect(document.positions[1].strings[2]).toMatchObject({ type: "open" });
  expect(document.positions[2].strings[2]).toMatchObject({ type: "fret", fret: 2 });
  expect(document.positions[3].strings[1]).toMatchObject({ type: "open" });
  expect(document.positions[3].strings[1].techniques).toEqual([
    expect.objectContaining({ name: "palm mute", source: "tuxguitar" }),
  ]);
  expect(document.positions[4].isRest).toBe(true);
  expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
  expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 2 });
  expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([4, 4]);
  expect(document.blocks[0].sourceLayoutLabel).toBe("Normalized TuxGuitar spatial layout");
  expect(describePlayablePosition(document, 4)).toContain("Rest.");
  expect(describePlayablePosition(document, 5)).toContain("G string, open.");
  expect(describePlayablePosition(document, 5)).toContain("D string, fret 2.");
  expect(JSON.stringify(document)).not.toMatch(/guitar-pro/iu);
}

describe("bounded TuxGuitar standard-bass compatibility", () => {
  test.each(CASES)("decodes and normalizes standard bass in TuxGuitar %s", async (_label, code, sourceVersion, formatVersion) => {
    const intermediate = await decodeTuxGuitarProfileFile(bassFile(code));
    expectBassIntermediate(intermediate, sourceVersion, formatVersion);
    const inventory = buildTuxGuitarTrackInventory(intermediate);
    expect(inventory).toMatchObject({ supportedCount: 1, requiresSelection: false });
    expect(inventory.supportedItems[0]).toMatchObject({
      instrument: "bass",
      instrumentLabel: "four-string bass",
      tuningMidiHighToLow: STANDARD_BASS,
    });
    expectBassDocument(normalizeVerifiedTuxGuitarIntermediate(intermediate), sourceVersion);
  });

  test.each(CASES)("routes standard bass in TuxGuitar %s through the shared readers", async (_label, code, sourceVersion) => {
    const result = await buildTuxGuitarReaderDocuments(bassFile(code));
    expect(result).toMatchObject({
      desktopSource: "semantic",
      requestedInstrument: "bass",
      resolvedInstrument: "bass",
      supportOutcome: "source-checkpoint-provisional",
      sourceFormat: "tuxguitar",
      requiresTrackSelection: false,
    });
    expect(result.sourceFormatLabel).toContain("TuxGuitar");
    expectBassDocument(result.semanticDocument, sourceVersion);
    expect(result.desktopBlocks).toHaveLength(1);
  });

  test.each(CASES)("preserves the accepted guitar decoder result for TuxGuitar %s", async (_label, code) => {
    const accepted = await decodeTuxGuitarFile(guitarFile(code));
    const profiled = await decodeTuxGuitarProfileFile(guitarFile(code));
    expect(profiled).toEqual(accepted);
  });

  test("verifies every bass binary, transport twin, hash, source license, and producer authority", () => {
    const source = JSON.parse(fs.readFileSync(bassFixturePath("source.json"), "utf8"));
    const manifest = JSON.parse(fs.readFileSync(bassFixturePath("manifest.json"), "utf8"));
    expect(source).toMatchObject({
      schemaVersion: 1,
      license: "CC0-1.0",
      clef: "bass",
      tuningMidiHighToLow: STANDARD_BASS,
    });
    expect(manifest).toMatchObject({
      schemaVersion: 1,
      fixtureFamily: "TUXGUITAR_TG_STANDARD_BASS_SOURCE_DERIVED",
      sourceLicense: "CC0-1.0",
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
      profile: {
        instrument: "bass",
        stringCount: 4,
        tuningMidiHighToLow: STANDARD_BASS,
        clef: "bass",
      },
    });
    expect(manifest.fixtures).toHaveLength(6);
    for (const fixture of manifest.fixtures) {
      expect(fixture.producerExported).toBe(false);
      const binary = fs.readFileSync(bassFixturePath(fixture.file));
      const mirror = Buffer.from(
        fs.readFileSync(bassFixturePath(`${fixture.file}.base64`), "utf8").trim(),
        "base64"
      );
      expect(mirror.equals(binary)).toBe(true);
      expect(binary.byteLength).toBe(fixture.bytes);
      expect(createHash("sha256").update(binary).digest("hex")).toBe(fixture.sha256);
    }
    expect(manifest.fixtures.find((fixture) => fixture.version === "2.0")).toMatchObject({
      bytes: 2485,
      sha256: "1c10dec929f09a13cb219532d62db0c65e0697a7d502ed26e3a8aeea5cc4e2d3",
      producerApplicationVersion: "2.1.0",
      contentXmlBytes: 2240,
      contentXmlSha256: "2d8d000c9c3afb3e202a346c0601cd546bb37851eb495522bb6f429ec8742e75",
    });
  });
});

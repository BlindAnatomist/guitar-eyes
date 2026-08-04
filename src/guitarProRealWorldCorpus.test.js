import fs from "fs";
import path from "path";
import crypto from "crypto";
import { TextDecoder, TextEncoder } from "util";
import { inflateRawSync } from "zlib";
import * as alphaTab from "@coderline/alphatab";
import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";
import { inspectGuitarProSource } from "./guitarProSourceVersion";
import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";
import { normalizeVerifiedGuitarProIntermediate } from "./guitarProSourceNormalizer";
import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";

beforeAll(() => {
  global.TextDecoder = TextDecoder;
  global.TextEncoder = TextEncoder;
});

const FIXTURE_DIRECTORY = path.join(
  process.cwd(),
  "fixtures",
  "real-world",
  "guitar-pro",
  "cross-format"
);

const EXPECTED_TUNING = [64, 59, 55, 50, 45, 40];
const EXPECTED_DURATIONS = [4, 4, 4, 4, 2, 2];
const EXPECTED_COORDINATES = [
  [
    [6, 0],
    [5, 1],
  ],
  [],
  [[4, 0]],
  [[3, 2]],
  [[2, 0]],
  [[1, 3]],
];

const FAMILIES = [
  {
    fileName: "guitar-eyes-cross-format.gp3",
    sourceVersion: "GP3",
    sha256: "5f189a6cc3a14b71e12ab8940fbe58b65b5a3c013467fcae709c210a6859653e",
  },
  {
    fileName: "guitar-eyes-cross-format.gp4",
    sourceVersion: "GP4",
    sha256: "d805150df2ae0a4e3882825ed591406dae41f2d80ba8047da7bf1d2d478ceda0",
  },
  {
    fileName: "guitar-eyes-cross-format.gp5",
    sourceVersion: "GP5",
    sha256: "b9dd13284980cf1e4fc20511c08b7887cd9c3b1f7d3679f7ca4f28514d5a393d",
  },
  {
    fileName: "guitar-eyes-cross-format.gpx",
    sourceVersion: "GP6",
    sha256: "0df9b63f7c5eeac824e8ec7945c2352dc91fd4ac01687588afc9056f246d3787",
  },
  {
    fileName: "guitar-eyes-cross-format.gp",
    sourceVersion: "GP7",
    sha256: "b0d61d613c7bbdd338a087bb3adc25ca3f14716bc780f4f6eb09ed7267c8c965",
  },
];

function bytesFor(fileName) {
  return fs.readFileSync(path.join(FIXTURE_DIRECTORY, fileName));
}

async function inflateRaw(bytes) {
  return new Uint8Array(inflateRawSync(Buffer.from(bytes)));
}

function musicalProjection(document) {
  return {
    sourceFormat: document.sourceFormat,
    instrument: document.instrument,
    stringCount: document.stringCount,
    strings: document.strings.map((string) => string.spokenName),
    positions: document.positions.map((position) => ({
      isRest: position.isRest,
      duration: position.duration,
      strings: position.strings.map((string) => ({
        stringNumber: string.stringNumber,
        fret: string.fret,
      })),
    })),
    measures: document.measures.map((measure) => ({
      totalQuarterNoteFraction: measure.totalQuarterNoteFraction,
      positionsInMeasure: measure.positions.length,
    })),
  };
}

async function decodeFixture(family) {
  const raw = bytesFor(family.fileName);
  const versionEvidence = await inspectGuitarProSource(raw, {
    fileName: family.fileName,
    inspectSharedArchive: (input) =>
      inspectGuitarProArchiveVersion(input, { inflateRaw }),
  });
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
    new Uint8Array(raw),
    new alphaTab.Settings()
  );
  const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
    versionEvidence,
  });
  return { raw, versionEvidence, intermediate };
}

function intermediateCoordinates(intermediate) {
  const staff = intermediate.tracks[0].staves[0];
  const beats = staff.bars.flatMap((bar) =>
    bar.voices.flatMap((voice) => voice.beats)
  );
  return {
    tuning: staff.tuningMidiHighToLow,
    durations: beats.map((beat) => beat.durationDenominator),
    coordinates: beats.map((beat) =>
      beat.notes
        .map((note) => [note.stringNumberLowToHigh, note.fret])
        .sort((left, right) => right[0] - left[0])
    ),
    restIndexes: beats
      .map((beat, index) => (beat.isRest ? index : -1))
      .filter((index) => index >= 0),
  };
}

describe("verified real-world Guitar Pro corpus", () => {
  test.each(FAMILIES)(
    "$fileName preserves its locked bytes and exact decoded musical evidence",
    async (family) => {
      const { raw, versionEvidence, intermediate } = await decodeFixture(family);

      expect(crypto.createHash("sha256").update(raw).digest("hex")).toBe(
        family.sha256
      );
      expect(versionEvidence.sourceVersion).toBe(family.sourceVersion);
      expect(intermediate).toMatchObject({
        schemaVersion: 1,
        sourceVersion: family.sourceVersion,
        title: "Chord Rest MusicXML Specimen",
      });
      expect(intermediate.tracks).toHaveLength(1);
      expect(intermediate.tracks[0]).toMatchObject({
        name: "Guitar",
        isPercussion: false,
      });
      expect(intermediate.tracks[0].staves).toHaveLength(1);
      expect(intermediate.tracks[0].staves[0].bars).toHaveLength(2);
      expect(intermediateCoordinates(intermediate)).toEqual({
        tuning: EXPECTED_TUNING,
        durations: EXPECTED_DURATIONS,
        coordinates: EXPECTED_COORDINATES,
        restIndexes: [1],
      });
    }
  );

  test("projects every committed family through one identical Guitar Eyes semantic model", async () => {
    const decoded = await Promise.all(FAMILIES.map(decodeFixture));
    const documents = decoded.map(({ intermediate }) =>
      normalizeVerifiedGuitarProIntermediate(intermediate)
    );
    const projections = documents.map(musicalProjection);

    projections.slice(1).forEach((projection) => {
      expect(projection).toEqual(projections[0]);
    });
    documents.forEach((document, index) => {
      expect(document).toMatchObject({
        sourceFormat: "guitar-pro",
        sourceVersion: FAMILIES[index].sourceVersion,
        instrument: "guitar",
        stringCount: 6,
      });
      expect(document.positions).toHaveLength(6);
      expect(document.positions[1].isRest).toBe(true);
    });
  });

  test.each(FAMILIES)(
    "$fileName reaches both readers through the public Guitar Pro intake coordinator",
    async (family) => {
      const { raw, intermediate } = await decodeFixture(family);
      const file = {
        name: family.fileName,
        size: raw.length,
        arrayBuffer: jest.fn(async () =>
          raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
        ),
      };
      const decode = jest.fn(async () => intermediate);

      const result = await buildGuitarProReaderDocuments(file, {
        decode,
        workerFactory: jest.fn(),
      });

      expect(decode).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        desktopSource: "semantic",
        semanticError: null,
        requestedInstrument: "guitar",
        resolvedInstrument: "guitar",
        sourceFormat: "guitar-pro",
        requiresTrackSelection: false,
      });
      expect(result.semanticDocument.sourceVersion).toBe(family.sourceVersion);
      expect(result.semanticDocument.positions).toHaveLength(6);
      expect(result.desktopBlocks.length).toBeGreaterThan(0);
    }
  );
});

import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import { inflateRawSync } from "zlib";
import * as alphaTab from "@coderline/alphatab";
import {
  inspectGuitarProArchiveVersion,
} from "./guitarProArchiveVersion";
import { inspectGuitarProSource } from "./guitarProSourceVersion";
import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";
import {
  normalizeVerifiedGuitarProIntermediate,
  validateGuitarProSourceEvidence,
} from "./guitarProSourceNormalizer";
import { GuitarProImportError } from "./guitarProNormalizer";

beforeAll(() => {
  global.TextDecoder = TextDecoder;
  global.TextEncoder = TextEncoder;
});

const FILE_NAME = "guitar-eyes-cross-format.gp";
const FILE_PATH = path.join(
  process.cwd(),
  "fixtures",
  "real-world",
  "guitar-pro",
  "cross-format",
  FILE_NAME
);

async function inflateRaw(bytes) {
  return new Uint8Array(inflateRawSync(Buffer.from(bytes)));
}

function loadBytes() {
  return fs.readFileSync(FILE_PATH);
}

async function inspectSource(bytes) {
  return inspectGuitarProSource(bytes, {
    fileName: FILE_NAME,
    inspectSharedArchive: (input) =>
      inspectGuitarProArchiveVersion(input, { inflateRaw }),
  });
}

describe("GP7 GPIF-only shared archive evidence", () => {
  test("classifies the committed GP7 archive without fabricating GP8 VERSION metadata", async () => {
    await expect(
      inspectGuitarProArchiveVersion(loadBytes(), { inflateRaw })
    ).resolves.toEqual({
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      packageVariant: "GP7_GPIF_ONLY",
      rootVersion: null,
      gpVersion: null,
      encodingDescription: null,
      sourceVersion: "GP7",
      versionText: "Guitar Pro 7 GPIF-only shared archive",
      signature: "Content/score.gpif",
      entryCount: 1,
      declaredTrackCount: 1,
    });
  });

  test("survives source inspection, worker serialization, and semantic normalization", async () => {
    const bytes = loadBytes();
    const versionEvidence = await inspectSource(bytes);
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      new Uint8Array(bytes),
      new alphaTab.Settings()
    );
    const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
      versionEvidence,
    });

    expect(versionEvidence).toMatchObject({
      schemaVersion: 2,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      sourceFamily: "GUITAR_PRO_SHARED_ZIP",
      extensionFamily: ".gp",
      packageVariant: "GP7_GPIF_ONLY",
      sourceVersion: "GP7",
      versionText: "Guitar Pro 7 GPIF-only shared archive",
      signature: "Content/score.gpif",
      entryCount: 1,
      declaredTrackCount: 1,
      trackCountEvidence: "gpif-declaration",
    });
    expect(intermediate.versionEvidence).toMatchObject({
      packageVariant: "GP7_GPIF_ONLY",
      sourceVersion: "GP7",
      versionText: "Guitar Pro 7 GPIF-only shared archive",
      signature: "Content/score.gpif",
      declaredTrackCount: 1,
    });
    expect(intermediate.versionEvidence).not.toHaveProperty("rootVersion");
    expect(intermediate.versionEvidence).not.toHaveProperty("gpVersion");
    expect(intermediate.versionEvidence).not.toHaveProperty(
      "encodingDescription"
    );

    const document = normalizeVerifiedGuitarProIntermediate(intermediate);
    expect(document).toMatchObject({
      sourceFormat: "guitar-pro",
      sourceVersion: "GP7",
      instrument: "guitar",
      stringCount: 6,
      versionEvidence: intermediate.versionEvidence,
    });
    expect(document.positions).toHaveLength(6);
    expect(document.positions[1].isRest).toBe(true);
  });

  test("rejects a fabricated or incomplete GP7 GPIF-only package identity", async () => {
    const bytes = loadBytes();
    const versionEvidence = await inspectSource(bytes);
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      new Uint8Array(bytes),
      new alphaTab.Settings()
    );
    const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
      versionEvidence,
    });

    const contradictory = {
      ...intermediate,
      versionEvidence: {
        ...intermediate.versionEvidence,
        packageVariant: "VERSIONED_SHARED_ARCHIVE",
      },
    };

    expect(() => validateGuitarProSourceEvidence(contradictory)).toThrow(
      GuitarProImportError
    );
  });
});

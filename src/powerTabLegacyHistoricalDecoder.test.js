import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import {
  decodePowerTabLegacyHistoricalBytes,
  decodePowerTabLegacyHistoricalFile,
} from "./powerTabLegacyHistoricalDecoder";
import { PowerTabImportError } from "./powerTabErrors";

const FIXTURES = [
  {
    filename: "powertab-v10-original-six-position.ptb",
    bytes: 715,
    sha256: "e85487ca2e71d944e67c536b0e90f6e5f424567ad3bc24601e457e7d66ae091b",
    headerHex: "707461620100",
    fileVersion: 1,
    powerTabVersion: "1.0",
    sourceVersion: "PTB_V10",
    historicalSignature: "ptab-1",
  },
  {
    filename: "powertab-v102-original-six-position.ptb",
    bytes: 715,
    sha256: "ae91e9693692c764835db64b524f87f27492db4e68d8adc2d534ea6b70e413be",
    headerHex: "707461620200",
    fileVersion: 2,
    powerTabVersion: "1.0.2",
    sourceVersion: "PTB_V102",
    historicalSignature: "ptab-2",
  },
  {
    filename: "powertab-v15-original-six-position.ptb",
    bytes: 644,
    sha256: "bdcdd04f0e4b1f558c0d6c8fa0f30feea78113e656530a4195c6cc683e083f53",
    headerHex: "707461620300",
    fileVersion: 3,
    powerTabVersion: "1.5",
    sourceVersion: "PTB_V15",
    historicalSignature: "ptab-3",
  },
];

function fixturePath(filename) {
  return path.join(
    process.cwd(),
    "fixtures",
    "powertab-ptb-historical",
    filename
  );
}

function fixtureBytes(filename) {
  return fs.readFileSync(fixturePath(filename));
}

function readableFile(binary, name) {
  return {
    name,
    size: binary.length,
    arrayBuffer: async () =>
      binary.buffer.slice(
        binary.byteOffset,
        binary.byteOffset + binary.byteLength
      ),
  };
}

function expectCode(callback, code) {
  try {
    callback();
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(PowerTabImportError);
    expect(error.code).toBe(code);
  }
}

describe("historical legacy PowerTab decoder", () => {
  test.each(FIXTURES)(
    "decodes $powerTabVersion from exact project-authored $historicalSignature evidence",
    (fixture) => {
      const binary = fixtureBytes(fixture.filename);
      const intermediate = decodePowerTabLegacyHistoricalBytes(binary);

      expect(binary).toHaveLength(fixture.bytes);
      expect(createHash("sha256").update(binary).digest("hex")).toBe(
        fixture.sha256
      );
      expect(binary.subarray(0, 6).toString("hex")).toBe(fixture.headerHex);
      expect(intermediate).toMatchObject({
        schemaVersion: 1,
        sourceVersion: fixture.sourceVersion,
        title: "Guitar Eyes Historical PTB Proof",
        versionEvidence: {
          containerFamily: "POWERTAB_LEGACY_MFC_BINARY",
          extensionFamily: ".ptb",
          marker: "ptab",
          fileVersion: fixture.fileVersion,
          powerTabVersion: fixture.powerTabVersion,
          historicalSignature: fixture.historicalSignature,
          evidenceKind: "powertab-editor-source-faithful",
          independentParserParity: false,
          decodedTrackCount: 1,
          decodedMeasureCount: 2,
        },
      });
      expect(intermediate.tracks[0]).toMatchObject({
        name: "Proof Guitar",
        isPercussion: false,
      });
      expect(intermediate.tracks[0].staves[0].tuningMidiHighToLow).toEqual([
        64, 59, 55, 50, 45, 40,
      ]);
      expect(
        intermediate.tracks[0].staves[0].bars.map(
          (bar) => bar.voices[0].beats.length
        )
      ).toEqual([4, 2]);
      expect(
        intermediate.tracks[0].staves[0].bars.flatMap((bar) =>
          bar.voices[0].beats.map((beat) => beat.startTicks)
        )
      ).toEqual([0, 960, 1440, 1920, 3840, 5760]);
      expect(
        intermediate.tracks[0].staves[0].bars[1].voices[0].beats[0].isRest
      ).toBe(true);
      expect(
        intermediate.tracks[0].staves[0].bars[1].voices[0].beats[1].notes
      ).toHaveLength(2);
    }
  );

  test.each(FIXTURES)("keeps $historicalSignature base64 mirror exact", (fixture) => {
    const binary = fixtureBytes(fixture.filename);
    const mirror = Buffer.from(
      fs.readFileSync(fixturePath(`${fixture.filename}.base64`), "utf8").trim(),
      "base64"
    );
    expect(mirror.equals(binary)).toBe(true);
  });

  test("does not consume the already accepted version-4 family", () => {
    const binary = Buffer.from(fixtureBytes(FIXTURES[2].filename));
    binary.writeUInt16LE(4, 4);
    expectCode(
      () => decodePowerTabLegacyHistoricalBytes(binary),
      "POWERTAB_LEGACY_VERSION_4_REQUIRES_ACCEPTED_DECODER"
    );
  });

  test("rejects invalid identity, truncation, and unexplained trailing bytes", () => {
    const original = fixtureBytes(FIXTURES[0].filename);
    const marker = Buffer.from(original);
    marker[0] = 0;
    expectCode(
      () => decodePowerTabLegacyHistoricalBytes(marker),
      "INVALID_POWERTAB_LEGACY_MARKER"
    );
    expectCode(
      () => decodePowerTabLegacyHistoricalBytes(original.subarray(0, 200)),
      "TRUNCATED_POWERTAB_LEGACY"
    );
    expectCode(
      () =>
        decodePowerTabLegacyHistoricalBytes(
          Buffer.concat([original, Buffer.from([0])])
        ),
      "UNSUPPORTED_POWERTAB_LEGACY_TRAILING_DATA"
    );
  });

  test("requires the .ptb extension at the historical file boundary", async () => {
    const binary = fixtureBytes(FIXTURES[1].filename);
    await expect(
      decodePowerTabLegacyHistoricalFile(readableFile(binary, "proof.ptb"))
    ).resolves.toMatchObject({ sourceVersion: "PTB_V102" });
    await expect(
      decodePowerTabLegacyHistoricalFile(readableFile(binary, "proof.pt2"))
    ).rejects.toMatchObject({ code: "INVALID_POWERTAB_LEGACY_EXTENSION" });
  });
});

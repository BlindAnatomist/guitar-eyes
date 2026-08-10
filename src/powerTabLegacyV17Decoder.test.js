import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import {
  decodePowerTabLegacyV17Bytes,
  decodePowerTabLegacyV17File,
} from "./powerTabLegacyV17Decoder";
import { PowerTabImportError } from "./powerTabErrors";

function fixturePath(filename) {
  return path.join(
    process.cwd(),
    "fixtures",
    "powertab-ptb-v17",
    filename
  );
}

function fixtureBytes() {
  return fs.readFileSync(
    fixturePath("powertab-v17-original-six-position.ptb")
  );
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

describe("legacy PowerTab v1.7 decoder", () => {
  test("decodes the exact project-authored ptab-4 fixture into two bounded measures", () => {
    const binary = fixtureBytes();
    const intermediate = decodePowerTabLegacyV17Bytes(binary);

    expect(binary).toHaveLength(723);
    expect(createHash("sha256").update(binary).digest("hex")).toBe(
      "9cd2e677b8898900822afad4160acc004b5bbea70a57f0b62f412e5a52ce2216"
    );
    expect(binary.subarray(0, 6).toString("hex")).toBe("707461620400");
    expect(intermediate).toMatchObject({
      schemaVersion: 1,
      sourceVersion: "PTB_V17",
      title: "Guitar Eyes PTB 1.7 Proof",
      versionEvidence: {
        containerFamily: "POWERTAB_LEGACY_MFC_BINARY",
        extensionFamily: ".ptb",
        marker: "ptab",
        fileVersion: 4,
        powerTabVersion: "1.7",
        independentSignature: "ptab-4",
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
    expect(intermediate.tracks[0].staves[0].bars).toHaveLength(2);
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
  });

  test("keeps the text-safe mirror identical to the canonical binary", () => {
    const binary = fixtureBytes();
    const mirror = Buffer.from(
      fs
        .readFileSync(
          fixturePath("powertab-v17-original-six-position.ptb.base64"),
          "utf8"
        )
        .trim(),
      "base64"
    );
    expect(mirror.equals(binary)).toBe(true);
  });

  test.each([1, 2, 3])(
    "rejects historical file-version value %i rather than guessing",
    (version) => {
      const binary = Buffer.from(fixtureBytes());
      binary.writeUInt16LE(version, 4);
      expectCode(
        () => decodePowerTabLegacyV17Bytes(binary),
        "UNTESTED_POWERTAB_LEGACY_VERSION"
      );
    }
  );

  test("rejects invalid identity, truncation, and unexplained trailing bytes", () => {
    const marker = Buffer.from(fixtureBytes());
    marker[0] = 0;
    expectCode(
      () => decodePowerTabLegacyV17Bytes(marker),
      "INVALID_POWERTAB_LEGACY_MARKER"
    );

    expectCode(
      () => decodePowerTabLegacyV17Bytes(fixtureBytes().subarray(0, 200)),
      "TRUNCATED_POWERTAB_LEGACY"
    );

    expectCode(
      () =>
        decodePowerTabLegacyV17Bytes(
          Buffer.concat([fixtureBytes(), Buffer.from([0])])
        ),
      "UNSUPPORTED_POWERTAB_LEGACY_TRAILING_DATA"
    );
  });

  test("requires the legacy .ptb extension at the file boundary", async () => {
    const binary = fixtureBytes();
    const file = new File([binary], "proof.ptb", {
      type: "application/octet-stream",
    });
    await expect(decodePowerTabLegacyV17File(file)).resolves.toMatchObject({
      sourceVersion: "PTB_V17",
    });

    const wrong = new File([binary], "proof.pt2", {
      type: "application/octet-stream",
    });
    await expect(decodePowerTabLegacyV17File(wrong)).rejects.toMatchObject({
      code: "INVALID_POWERTAB_LEGACY_EXTENSION",
    });
  });
});

import fs from "fs";
import path from "path";
import {
  decodePowerTabLegacyBytes,
  decodePowerTabLegacyFile,
} from "./powerTabLegacyDecoder";
import { PowerTabImportError } from "./powerTabErrors";

function historical(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "powertab-ptb-historical", name)
  );
}
function v17() {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      "fixtures",
      "powertab-ptb-v17",
      "powertab-v17-original-six-position.ptb"
    )
  );
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

describe("legacy PowerTab family dispatcher", () => {
  test.each([
    ["powertab-v10-original-six-position.ptb", "PTB_V10", 1],
    ["powertab-v102-original-six-position.ptb", "PTB_V102", 2],
    ["powertab-v15-original-six-position.ptb", "PTB_V15", 3],
  ])("routes %s to the historical compatibility decoder", (name, sourceVersion, fileVersion) => {
    expect(decodePowerTabLegacyBytes(historical(name))).toMatchObject({
      sourceVersion,
      versionEvidence: { fileVersion },
    });
  });

  test("routes file version 4 through the unchanged accepted v1.7 decoder", () => {
    expect(decodePowerTabLegacyBytes(v17())).toMatchObject({
      sourceVersion: "PTB_V17",
      versionEvidence: {
        fileVersion: 4,
        powerTabVersion: "1.7",
        independentSignature: "ptab-4",
      },
    });
  });

  test("rejects unknown legacy file versions rather than guessing", () => {
    const binary = Buffer.from(historical("powertab-v15-original-six-position.ptb"));
    binary.writeUInt16LE(5, 4);
    expect(() => decodePowerTabLegacyBytes(binary)).toThrow(PowerTabImportError);
    try {
      decodePowerTabLegacyBytes(binary);
    } catch (error) {
      expect(error.code).toBe("INVALID_POWERTAB_LEGACY_VERSION");
    }
  });

  test("enforces the .ptb file boundary once for every legacy version", async () => {
    const binary = historical("powertab-v10-original-six-position.ptb");
    await expect(
      decodePowerTabLegacyFile(readableFile(binary, "proof.ptb"))
    ).resolves.toMatchObject({ sourceVersion: "PTB_V10" });
    await expect(
      decodePowerTabLegacyFile(readableFile(binary, "proof.bin"))
    ).rejects.toMatchObject({ code: "INVALID_POWERTAB_LEGACY_EXTENSION" });
  });
});

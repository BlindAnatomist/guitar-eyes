import {
  GuitarProSourceError,
  inspectGuitarProSource,
} from "./guitarProSourceVersion";

function legacy(version) {
  const text = `FICHIER GUITAR PRO v${version}`;
  const bytes = new Uint8Array(31);
  bytes[0] = text.length;
  for (let index = 0; index < text.length; index += 1) {
    bytes[index + 1] = text.charCodeAt(index);
  }
  return bytes;
}

function gpx(signature) {
  return new Uint8Array(Array.from(signature, (character) => character.charCodeAt(0)));
}

async function expectCode(promise, code) {
  await promise.catch((error) => {
    expect(error).toBeInstanceOf(GuitarProSourceError);
    expect(error.code).toBe(code);
  });
}

describe("inspectGuitarProSource", () => {
  test.each([
    ["proof.gp3", "3.00", "GP3"],
    ["proof.GP4", "4.06", "GP4"],
    ["folder/proof.gp5", "5.10", "GP5"],
  ])("accepts authentic legacy evidence for %s", async (fileName, version, sourceVersion) => {
    await expect(
      inspectGuitarProSource(legacy(version), { fileName })
    ).resolves.toMatchObject({
      schemaVersion: 2,
      sourceFamily: "GUITAR_PRO_LEGACY_BINARY",
      extensionFamily: `.${fileName.split(".").pop().toLowerCase()}`,
      sourceVersion,
      versionText: `FICHIER GUITAR PRO v${version}`,
      declaredTrackCount: null,
      trackCountEvidence: "decoder-only",
    });
  });

  test.each(["BCFS", "BCFZ"])("accepts GPX %s container evidence", async (signature) => {
    await expect(
      inspectGuitarProSource(gpx(signature), { fileName: "proof.gpx" })
    ).resolves.toEqual({
      schemaVersion: 2,
      sourceFamily: "GUITAR_PRO_GPX_CONTAINER",
      extensionFamily: ".gpx",
      sourceVersion: "GP6",
      versionText: "Guitar Pro 6",
      major: 6,
      minor: null,
      signature,
      declaredTrackCount: null,
      trackCountEvidence: "decoder-only",
    });
  });

  test("preserves shared GP7 or GP8 archive evidence", async () => {
    const inspectSharedArchive = jest.fn().mockResolvedValue({
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      sourceVersion: "GP8",
      declaredTrackCount: 2,
      entryCount: 6,
    });

    await expect(
      inspectGuitarProSource(new Uint8Array([1, 2, 3]), {
        fileName: "ordinary.gp",
        inspectSharedArchive,
      })
    ).resolves.toMatchObject({
      schemaVersion: 2,
      sourceFamily: "GUITAR_PRO_SHARED_ZIP",
      extensionFamily: ".gp",
      sourceVersion: "GP8",
      declaredTrackCount: 2,
      trackCountEvidence: "gpif-declaration",
    });
    expect(inspectSharedArchive).toHaveBeenCalledTimes(1);
  });

  test("rejects extension and internal legacy-version conflicts", async () => {
    await expectCode(
      inspectGuitarProSource(legacy("5.10"), { fileName: "wrong.gp4" }),
      "CONTRADICTORY_GUITAR_PRO_EXTENSION_EVIDENCE"
    );
  });

  test("rejects malformed legacy signatures and version text", async () => {
    await expectCode(
      inspectGuitarProSource(new Uint8Array([3, 65, 66, 67]), {
        fileName: "broken.gp3",
      }),
      "MALFORMED_LEGACY_GUITAR_PRO_HEADER"
    );

    const malformed = legacy("5.10");
    malformed["FICHIER GUITAR PRO ".length + 1] = "x".charCodeAt(0);
    await expectCode(
      inspectGuitarProSource(malformed, { fileName: "broken.gp5" }),
      "MALFORMED_LEGACY_GUITAR_PRO_VERSION"
    );
  });

  test("rejects non-GPX signatures and unknown extensions", async () => {
    await expectCode(
      inspectGuitarProSource(gpx("PK\u0003\u0004"), { fileName: "wrong.gpx" }),
      "INVALID_GPX_SIGNATURE"
    );
    await expectCode(
      inspectGuitarProSource(new Uint8Array([1, 2, 3]), { fileName: "song.gtp" }),
      "UNSUPPORTED_GUITAR_PRO_EXTENSION"
    );
  });
});

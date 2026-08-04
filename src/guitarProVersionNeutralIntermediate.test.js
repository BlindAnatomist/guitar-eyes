import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";

function score() {
  return {
    title: "Cross-format proof",
    tracks: [
      {
        name: "Guitar",
        shortName: "Gtr",
        isPercussion: false,
        staves: [
          {
            tuning: [64, 59, 55, 50, 45, 40],
            bars: [],
          },
        ],
      },
    ],
  };
}

describe("version-neutral Guitar Pro intermediate evidence", () => {
  test("preserves legacy evidence without inventing ZIP fields", () => {
    const result = alphaTabScoreToGuitarProIntermediate(score(), {
      versionEvidence: {
        schemaVersion: 2,
        sourceFamily: "GUITAR_PRO_LEGACY_BINARY",
        extensionFamily: ".gp3",
        sourceVersion: "GP3",
        versionText: "FICHIER GUITAR PRO v3.00",
        major: 3,
        minor: 0,
        signature: "FICHIER GUITAR PRO",
        declaredTrackCount: null,
        trackCountEvidence: "decoder-only",
      },
    });

    expect(result.sourceVersion).toBe("GP3");
    expect(result.versionEvidence).toEqual({
      schemaVersion: 2,
      major: 3,
      minor: 0,
      sourceFamily: "GUITAR_PRO_LEGACY_BINARY",
      extensionFamily: ".gp3",
      sourceVersion: "GP3",
      versionText: "FICHIER GUITAR PRO v3.00",
      signature: "FICHIER GUITAR PRO",
      trackCountEvidence: "decoder-only",
      declaredTrackCount: null,
    });
    expect(result.versionEvidence).not.toHaveProperty("rootVersion");
    expect(result.versionEvidence).not.toHaveProperty("entryCount");
    expect(JSON.stringify(result)).not.toContain("undefined");
    expect(JSON.stringify(result)).not.toContain("NaN");
  });

  test("preserves GPX signature evidence", () => {
    const result = alphaTabScoreToGuitarProIntermediate(score(), {
      versionEvidence: {
        schemaVersion: 2,
        sourceFamily: "GUITAR_PRO_GPX_CONTAINER",
        extensionFamily: ".gpx",
        sourceVersion: "GP6",
        versionText: "Guitar Pro 6",
        major: 6,
        minor: null,
        signature: "BCFZ",
        declaredTrackCount: null,
        trackCountEvidence: "decoder-only",
      },
    });

    expect(result.sourceVersion).toBe("GP6");
    expect(result.versionEvidence).toMatchObject({
      sourceFamily: "GUITAR_PRO_GPX_CONTAINER",
      extensionFamily: ".gpx",
      signature: "BCFZ",
      minor: null,
      declaredTrackCount: null,
    });
  });

  test("retains independent GPIF track evidence for shared archives", () => {
    const result = alphaTabScoreToGuitarProIntermediate(score(), {
      versionEvidence: {
        schemaVersion: 2,
        archiveFamily: "GUITAR_PRO_SHARED_ZIP",
        sourceFamily: "GUITAR_PRO_SHARED_ZIP",
        extensionFamily: ".gp",
        rootVersion: "7.0",
        gpVersion: "8.1.3",
        encodingDescription: "GP8",
        sourceVersion: "GP8",
        entryCount: 6,
        declaredTrackCount: 2,
        trackCountEvidence: "gpif-declaration",
      },
    });

    expect(result.versionEvidence).toMatchObject({
      sourceVersion: "GP8",
      declaredTrackCount: 2,
      trackCountEvidence: "gpif-declaration",
    });
  });
});

import {
  normalizeVerifiedGuitarProIntermediate,
  validateGuitarProSourceEvidence,
} from "./guitarProSourceNormalizer";
import { GuitarProImportError } from "./guitarProNormalizer";

const tuning = [64, 59, 55, 50, 45, 40];

function evidence(sourceVersion) {
  if (["GP3", "GP4", "GP5"].includes(sourceVersion)) {
    const major = Number(sourceVersion.slice(2));
    return {
      schemaVersion: 2,
      sourceFamily: "GUITAR_PRO_LEGACY_BINARY",
      extensionFamily: `.gp${major}`,
      sourceVersion,
      versionText: `FICHIER GUITAR PRO v${major}.${major === 5 ? "10" : "00"}`,
      major,
      minor: major === 5 ? 10 : 0,
      signature: "FICHIER GUITAR PRO",
      declaredTrackCount: null,
      trackCountEvidence: "decoder-only",
    };
  }
  if (sourceVersion === "GP6") {
    return {
      schemaVersion: 2,
      sourceFamily: "GUITAR_PRO_GPX_CONTAINER",
      extensionFamily: ".gpx",
      sourceVersion,
      versionText: "Guitar Pro 6",
      major: 6,
      minor: null,
      signature: "BCFZ",
      declaredTrackCount: null,
      trackCountEvidence: "decoder-only",
    };
  }

  const major = sourceVersion.slice(2);
  return {
    schemaVersion: 2,
    archiveFamily: "GUITAR_PRO_SHARED_ZIP",
    sourceFamily: "GUITAR_PRO_SHARED_ZIP",
    extensionFamily: ".gp",
    rootVersion: "7.0",
    gpVersion: `${major}.0.0`,
    encodingDescription: sourceVersion,
    sourceVersion,
    entryCount: 6,
    declaredTrackCount: 1,
    trackCountEvidence: "gpif-declaration",
  };
}

function intermediate(sourceVersion) {
  return {
    schemaVersion: 1,
    sourceVersion,
    versionEvidence: evidence(sourceVersion),
    title: "Cross-format semantic proof",
    tracks: [
      {
        name: "Guitar",
        shortName: "Gtr",
        isPercussion: false,
        staves: [
          {
            tuningMidiHighToLow: tuning,
            bars: [
              {
                sourceNumber: 1,
                timeSignatureNumerator: 4,
                timeSignatureDenominator: 4,
                repeatStart: false,
                repeatCount: 0,
                alternateEndings: 0,
                voices: [
                  {
                    index: 0,
                    beats: [
                      {
                        startTicks: 0,
                        displayDurationTicks: 960,
                        durationDenominator: 4,
                        dots: 0,
                        tupletNumerator: -1,
                        tupletDenominator: -1,
                        graceType: "none",
                        isRest: false,
                        techniques: [],
                        notes: [
                          {
                            stringNumberLowToHigh: 6,
                            fret: 0,
                            visible: true,
                            isDead: false,
                            techniques: [],
                          },
                          {
                            stringNumberLowToHigh: 5,
                            fret: 2,
                            visible: true,
                            isDead: false,
                            techniques: [],
                          },
                        ],
                      },
                      {
                        startTicks: 960,
                        displayDurationTicks: 1920,
                        durationDenominator: 2,
                        dots: 0,
                        tupletNumerator: -1,
                        tupletDenominator: -1,
                        graceType: "none",
                        isRest: true,
                        techniques: [],
                        notes: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function musicalProjection(document) {
  return {
    instrument: document.instrument,
    stringCount: document.stringCount,
    spokenStrings: document.strings.map((string) => string.spokenName),
    positions: document.positions.map((position) => ({
      isRest: position.isRest,
      duration: position.duration,
      strings: position.strings,
    })),
    measures: document.measures.map((measure) => ({
      totalQuarterNoteFraction: measure.totalQuarterNoteFraction,
      positionsInMeasure: measure.positions.length,
    })),
  };
}

describe("normalizeVerifiedGuitarProIntermediate", () => {
  test.each(["GP3", "GP4", "GP5", "GP6", "GP7", "GP8"])(
    "normalizes %s through the same musical model while preserving true source metadata",
    (sourceVersion) => {
      const source = intermediate(sourceVersion);
      const document = normalizeVerifiedGuitarProIntermediate(source);

      expect(document).toMatchObject({
        sourceFormat: "guitar-pro",
        sourceVersion,
        versionEvidence: source.versionEvidence,
        instrument: "guitar",
        stringCount: 6,
      });
      expect(document.blocks[0]).toMatchObject({
        sourceFormat: "guitar-pro",
        sourceVersion,
        versionEvidence: source.versionEvidence,
      });
      expect(document.positions[0].sourceFormat).toBe("guitar-pro");
      expect(document.positions[0].duration.source).toBe("guitar-pro");
      expect(document.positions[0].strings[0].source.format).toBe("guitar-pro");
      expect(document.positions[1].isRest).toBe(true);
    }
  );

  test("produces one identical musical projection for every authorized family", () => {
    const projections = ["GP3", "GP4", "GP5", "GP6", "GP7", "GP8"].map(
      (sourceVersion) =>
        musicalProjection(
          normalizeVerifiedGuitarProIntermediate(intermediate(sourceVersion))
        )
    );

    projections.slice(1).forEach((projection) => {
      expect(projection).toEqual(projections[0]);
    });
  });

  test("rejects contradictory legacy, GPX, and shared-archive evidence before musical normalization", () => {
    const cases = [
      {
        ...intermediate("GP3"),
        versionEvidence: { ...evidence("GP3"), extensionFamily: ".gp4" },
      },
      {
        ...intermediate("GP6"),
        versionEvidence: { ...evidence("GP6"), signature: "PK\u0003\u0004" },
      },
      {
        ...intermediate("GP8"),
        versionEvidence: {
          ...evidence("GP8"),
          encodingDescription: "GP7",
        },
      },
    ];

    cases.forEach((value) => {
      expect(() => validateGuitarProSourceEvidence(value)).toThrow(
        GuitarProImportError
      );
    });
  });
});

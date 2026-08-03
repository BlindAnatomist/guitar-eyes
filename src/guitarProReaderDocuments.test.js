import {
  buildGuitarProArchiveProofReaderDocuments,
  buildGuitarProReaderDocuments,
} from "./guitarProReaderDocuments";
import { describePlayablePosition } from "./positionDescription";

const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];
const STANDARD_BASS = [43, 38, 33, 28];

const GP8_VERSION_EVIDENCE = Object.freeze({
  schemaVersion: 1,
  archiveFamily: "GUITAR_PRO_SHARED_ZIP",
  rootVersion: "7.0",
  gpVersion: "8.1.3",
  encodingDescription: "GP8",
  sourceVersion: "GP8",
  entryCount: 6,
});

function sourceEvidence(sourceVersion) {
  if (sourceVersion === "GP8") return GP8_VERSION_EVIDENCE;

  const major = Number(sourceVersion.slice(2));
  if (major >= 3 && major <= 5) {
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

function proofTrack(name, tuning = STANDARD_GUITAR, fret = 3) {
  return {
    name,
    shortName: name,
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
                        stringNumberLowToHigh: 1,
                        fret,
                        visible: true,
                        isDead: false,
                        techniques: [],
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

function proofIntermediate(
  tracks = [proofTrack("Proof Guitar")],
  sourceVersion = "GP8"
) {
  return {
    schemaVersion: 1,
    sourceVersion,
    versionEvidence: sourceEvidence(sourceVersion),
    title: "Reader proof",
    tracks,
  };
}

describe("buildGuitarProReaderDocuments", () => {
  test("decodes once and projects one semantic document into both readers", async () => {
    const file = { name: "proof.gp", size: 4, arrayBuffer: jest.fn() };
    const workerFactory = jest.fn(() => ({ postMessage: jest.fn() }));
    const decode = jest.fn(async () => proofIntermediate());

    const result = await buildGuitarProReaderDocuments(file, {
      workerFactory,
      decode,
    });

    expect(decode).toHaveBeenCalledTimes(1);
    expect(decode).toHaveBeenCalledWith(file, { workerFactory });
    expect(result).toMatchObject({
      desktopSource: "semantic",
      semanticError: null,
      requestedInstrument: "guitar",
      resolvedInstrument: "guitar",
      instrumentWasDetected: false,
      supportOutcome: "checkpoint-foundation",
      sourceFormat: "guitar-pro",
      sourceFormatLabel: "Guitar Pro 8 tablature",
      requiresTrackSelection: false,
    });
    expect(result.trackInventory.autoSelection).toEqual({
      trackIndex: 0,
      staffIndex: 0,
    });
    expect(result.semanticDocument.positions).toHaveLength(1);
    expect(result.desktopBlocks).toHaveLength(1);
    expect(describePlayablePosition(result.semanticDocument, 0)).toContain(
      "Low E string, fret 3."
    );
  });

  test.each([
    ["GP3", "Guitar Pro 3 tablature"],
    ["GP4", "Guitar Pro 4 tablature"],
    ["GP5", "Guitar Pro 5 tablature"],
    ["GP6", "Guitar Pro 6 tablature"],
    ["GP7", "Guitar Pro 7 tablature"],
    ["GP8", "Guitar Pro 8 tablature"],
  ])(
    "reports %s without calling it a shared archive",
    async (sourceVersion, sourceFormatLabel) => {
      const result = await buildGuitarProReaderDocuments(
        {
          name: `proof.${sourceVersion.toLowerCase()}`,
          size: 4,
          arrayBuffer: jest.fn(),
        },
        {
          decode: jest.fn(async () =>
            proofIntermediate(undefined, sourceVersion)
          ),
          workerFactory: jest.fn(),
        }
      );

      expect(result.sourceFormatLabel).toBe(sourceFormatLabel);
      expect(result.semanticDocument.sourceVersion).toBe(sourceVersion);
      expect(result.semanticDocument.sourceFormat).toBe("guitar-pro");
    }
  );

  test("returns a selection request instead of silently choosing among supported tracks", async () => {
    const ambiguous = proofIntermediate([
      proofTrack("Lead Guitar"),
      proofTrack("Bass", STANDARD_BASS, 5),
    ]);
    const decode = jest.fn(async () => ambiguous);

    const result = await buildGuitarProReaderDocuments(
      { name: "two-tracks.gp", size: 3, arrayBuffer: jest.fn() },
      { workerFactory: jest.fn(), decode }
    );

    expect(decode).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      requiresTrackSelection: true,
      supportOutcome: "track-selection-required",
      semanticDocument: null,
      guitarProIntermediate: ambiguous,
      sourceFormat: "guitar-pro",
      sourceFormatLabel: "Guitar Pro 8 tablature",
    });
    expect(result.trackInventory.supportedCount).toBe(2);
    expect(
      result.trackInventory.supportedItems.map((item) => item.trackName)
    ).toEqual(["Lead Guitar", "Bass"]);
  });

  test("reuses the decoded intermediate and normalizes the explicit second track", async () => {
    const file = { name: "two-tracks.gp", size: 3, arrayBuffer: jest.fn() };
    const decoded = proofIntermediate([
      proofTrack("Lead Guitar"),
      proofTrack("Bass", STANDARD_BASS, 5),
    ]);
    const decode = jest.fn();

    const result = await buildGuitarProReaderDocuments(file, {
      intermediate: decoded,
      selection: { trackIndex: 1, staffIndex: 0 },
      decode,
    });

    expect(decode).not.toHaveBeenCalled();
    expect(result.requiresTrackSelection).toBe(false);
    expect(result.semanticDocument).toMatchObject({
      sourceTrackIndex: 1,
      sourceTrackName: "Bass",
      instrument: "bass",
    });
    expect(describePlayablePosition(result.semanticDocument, 0)).toContain(
      "E string, fret 5."
    );
  });

  test("keeps the historical export as an exact compatibility alias", () => {
    expect(buildGuitarProArchiveProofReaderDocuments).toBe(
      buildGuitarProReaderDocuments
    );
  });

  test("propagates worker failures without constructing a partial reader document", async () => {
    const failure = Object.assign(new Error("Corrupt Guitar Pro file"), {
      code: "CORRUPT_GUITAR_PRO_FILE",
    });
    const decode = jest.fn(async () => {
      throw failure;
    });

    await expect(
      buildGuitarProReaderDocuments(
        { name: "broken.gp5", size: 3, arrayBuffer: jest.fn() },
        { workerFactory: jest.fn(), decode }
      )
    ).rejects.toBe(failure);
  });
});

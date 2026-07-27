import { buildGuitarPro7ProofReaderDocuments } from "./guitarProReaderDocuments";
import { describePlayablePosition } from "./positionDescription";

const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];

function proofIntermediate() {
  return {
    schemaVersion: 1,
    sourceVersion: "GP7",
    title: "Reader proof",
    tracks: [
      {
        name: "Proof Guitar",
        shortName: "Proof",
        isPercussion: false,
        staves: [
          {
            tuningMidiHighToLow: STANDARD_GUITAR,
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
                            fret: 3,
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
      },
    ],
  };
}

describe("buildGuitarPro7ProofReaderDocuments", () => {
  test("decodes once and projects one semantic document into both readers", async () => {
    const file = { name: "proof.gp", size: 4, arrayBuffer: jest.fn() };
    const workerFactory = jest.fn(() => ({ postMessage: jest.fn() }));
    const decode = jest.fn(async () => proofIntermediate());

    const result = await buildGuitarPro7ProofReaderDocuments(file, {
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
      supportOutcome: "checkpoint-proof",
      sourceFormat: "guitar-pro-7",
      sourceFormatLabel: "Guitar Pro 7 tablature",
    });
    expect(result.semanticDocument.positions).toHaveLength(1);
    expect(result.desktopBlocks).toHaveLength(1);
    expect(result.desktopBlocks[0]).toHaveLength(6);
    expect(result.desktopBlocks[0][0]).toMatch(/^E4\|/);
    expect(result.desktopBlocks[0][5]).toMatch(/^E2\|/);
    expect(describePlayablePosition(result.semanticDocument, 0)).toContain(
      "Low E string, fret 3."
    );
  });

  test("propagates worker failures without constructing a partial reader document", async () => {
    const failure = Object.assign(new Error("Corrupt GP7 archive"), {
      code: "CORRUPT_GP7_ARCHIVE",
    });
    const decode = jest.fn(async () => {
      throw failure;
    });

    await expect(
      buildGuitarPro7ProofReaderDocuments(
        { name: "broken.gp", size: 3, arrayBuffer: jest.fn() },
        {
          workerFactory: jest.fn(),
          decode,
        }
      )
    ).rejects.toBe(failure);
  });

  test("propagates semantic rejection after successful binary decoding", async () => {
    const ambiguous = proofIntermediate();
    ambiguous.tracks.push({ ...ambiguous.tracks[0], name: "Second Guitar" });

    await expect(
      buildGuitarPro7ProofReaderDocuments(
        { name: "two-guitars.gp", size: 3, arrayBuffer: jest.fn() },
        {
          workerFactory: jest.fn(),
          decode: jest.fn(async () => ambiguous),
        }
      )
    ).rejects.toMatchObject({
      code: "MULTIPLE_SUPPORTED_GUITAR_PRO_TRACKS",
    });
  });
});

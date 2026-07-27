import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildGuitarProArchiveProofReaderDocuments } from "./guitarProReaderDocuments";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";

jest.mock("./guitarProReaderDocuments", () => ({
  buildGuitarProArchiveProofReaderDocuments: jest.fn(),
}));

const originalMatchMedia = window.matchMedia;

const GP8_VERSION_EVIDENCE = Object.freeze({
  schemaVersion: 1,
  archiveFamily: "GUITAR_PRO_SHARED_ZIP",
  rootVersion: "7.0",
  gpVersion: "8.1.3",
  encodingDescription: "GP8",
  sourceVersion: "GP8",
  entryCount: 6,
});

function useTouchDevice() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: jest.fn().mockReturnValue({
      matches: true,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

function proofDocument() {
  return normalizeGuitarProIntermediate({
    schemaVersion: 1,
    sourceVersion: "GP8",
    versionEvidence: GP8_VERSION_EVIDENCE,
    title: "Application GP proof",
    tracks: [
      {
        name: "Proof Guitar",
        shortName: "Proof",
        isPercussion: false,
        staves: [
          {
            tuningMidiHighToLow: [64, 59, 55, 50, 45, 40],
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
  });
}

function proofReaderDocuments() {
  const semanticDocument = proofDocument();
  return {
    desktopBlocks: [semanticDocument.strings.map((string) => string.sourceLine)],
    desktopSource: "semantic",
    semanticDocument,
    semanticError: null,
    requestedInstrument: "guitar",
    resolvedInstrument: "guitar",
    instrumentWasDetected: false,
    supportOutcome: "checkpoint-proof",
    sourceFormat: "guitar-pro-archive",
    sourceFormatLabel: "Guitar Pro archive tablature",
  };
}

beforeEach(() => {
  buildGuitarProArchiveProofReaderDocuments.mockReset();
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  }
});

afterEach(() => {
  if (originalMatchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  } else {
    delete window.matchMedia;
  }
});

describe("Guitar Pro checkpoint application path", () => {
  test("loads a GP proof into the iPhone reader and preserves picker-return focus", async () => {
    useTouchDevice();
    buildGuitarProArchiveProofReaderDocuments.mockResolvedValue(proofReaderDocuments());
    render(<App />);

    const file = new File([new Uint8Array([1, 2, 3])], "guitar-pro-shared-archive-proof.gp", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    expect(buildGuitarProArchiveProofReaderDocuments).toHaveBeenCalledWith(file);
    expect(
      screen.getByText(/Imported Guitar Pro archive tablature\. Loaded 1 synchronized position/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("routes GP decoder failure through the durable iPhone upload error", async () => {
    useTouchDevice();
    buildGuitarProArchiveProofReaderDocuments.mockRejectedValue(
      Object.assign(new Error("The Guitar Pro archive is corrupt."), {
        code: "CORRUPT_GUITAR_PRO_ARCHIVE",
      })
    );
    render(<App />);

    const file = new File([new Uint8Array([9])], "broken.gp", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "Tablature could not be loaded",
    });

    expect(screen.getByText("The Guitar Pro archive is corrupt.")).toBeInTheDocument();
    expect(
      screen.getByText(/selected Guitar Pro checkpoint file could not be imported/i)
    ).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("keeps GP5 recognized but unsupported and never calls the Guitar Pro archive proof decoder", async () => {
    useTouchDevice();
    render(<App />);

    const file = new File([new Uint8Array([1])], "older.gp5", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(/does not yet import this Guitar Pro version/i)
    ).toBeInTheDocument();
    expect(buildGuitarProArchiveProofReaderDocuments).not.toHaveBeenCalled();
  });
});

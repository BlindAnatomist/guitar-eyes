import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildGuitarPro7ProofReaderDocuments } from "./guitarProReaderDocuments";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";

jest.mock("./guitarProReaderDocuments", () => ({
  buildGuitarPro7ProofReaderDocuments: jest.fn(),
}));

const originalMatchMedia = window.matchMedia;

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
    sourceVersion: "GP7",
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
    sourceFormat: "guitar-pro-7",
    sourceFormatLabel: "Guitar Pro 7 tablature",
  };
}

beforeEach(() => {
  buildGuitarPro7ProofReaderDocuments.mockReset();
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
    buildGuitarPro7ProofReaderDocuments.mockResolvedValue(proofReaderDocuments());
    render(<App />);

    const file = new File([new Uint8Array([1, 2, 3])], "guitar-pro-7-proof.gp", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    expect(buildGuitarPro7ProofReaderDocuments).toHaveBeenCalledWith(file);
    expect(
      screen.getByText(/Imported Guitar Pro 7 tablature\. Loaded 1 synchronized position/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("routes GP decoder failure through the durable iPhone upload error", async () => {
    useTouchDevice();
    buildGuitarPro7ProofReaderDocuments.mockRejectedValue(
      Object.assign(new Error("The GP7 archive is corrupt."), {
        code: "CORRUPT_GP7_ARCHIVE",
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

    expect(screen.getByText("The GP7 archive is corrupt.")).toBeInTheDocument();
    expect(
      screen.getByText(/selected Guitar Pro checkpoint file could not be imported/i)
    ).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("keeps GP5 recognized but unsupported and never calls the GP7 proof decoder", async () => {
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
    expect(buildGuitarPro7ProofReaderDocuments).not.toHaveBeenCalled();
  });
});

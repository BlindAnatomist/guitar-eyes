import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";

jest.mock("./guitarProReaderDocuments", () => ({
  buildGuitarProReaderDocuments: jest.fn(),
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

function proofReaderDocuments(sourceFormatLabel = "Guitar Pro 8 tablature") {
  const semanticDocument = proofDocument();
  return {
    desktopBlocks: [semanticDocument.strings.map((string) => string.sourceLine)],
    desktopSource: "semantic",
    semanticDocument,
    semanticError: null,
    requestedInstrument: "guitar",
    resolvedInstrument: "guitar",
    instrumentWasDetected: false,
    supportOutcome: "checkpoint-foundation",
    sourceFormat: "guitar-pro",
    sourceFormatLabel,
    requiresTrackSelection: false,
  };
}

beforeEach(() => {
  buildGuitarProReaderDocuments.mockReset();
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

describe("Guitar Pro application path", () => {
  test("loads a GP8 file into the iPhone reader and preserves picker-return focus", async () => {
    useTouchDevice();
    buildGuitarProReaderDocuments.mockResolvedValue(proofReaderDocuments());
    render(<App />);

    const file = new File(
      [new Uint8Array([1, 2, 3])],
      "guitar-pro-shared-archive-proof.gp",
      { type: "application/octet-stream" }
    );
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    expect(buildGuitarProReaderDocuments).toHaveBeenCalledWith(file);
    expect(
      screen.getByText(
        /Imported Guitar Pro 8 tablature\. Loaded 1 synchronized position/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("routes GP5 through the same reader path instead of rejecting the extension", async () => {
    useTouchDevice();
    buildGuitarProReaderDocuments.mockResolvedValue(
      proofReaderDocuments("Guitar Pro 5 tablature")
    );
    render(<App />);

    const file = new File([new Uint8Array([1])], "older.gp5", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(
        /Imported Guitar Pro 5 tablature\. Loaded 1 synchronized position/i
      )
    ).toBeInTheDocument();
    expect(buildGuitarProReaderDocuments).toHaveBeenCalledWith(file);
  });

  test("moves VoiceOver focus into track selection and reuses the decoded file", async () => {
    useTouchDevice();
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "GP8",
      versionEvidence: GP8_VERSION_EVIDENCE,
      title: "Two-track proof",
      tracks: [],
    };
    const inventory = {
      supportedCount: 2,
      supportedItems: [
        {
          id: "guitar-pro-track-1-staff-1",
          trackIndex: 0,
          staffIndex: 0,
          selectionLabel:
            "Lead Guitar. six-string guitar. Tuning high to low: E4, B3, G3, D3, A2, E2. 1 measure.",
          supported: true,
        },
        {
          id: "guitar-pro-track-2-staff-1",
          trackIndex: 1,
          staffIndex: 0,
          selectionLabel:
            "Bass. four-string bass. Tuning high to low: G2, D2, A1, E1. 1 measure.",
          supported: true,
        },
      ],
      items: [],
    };
    buildGuitarProReaderDocuments
      .mockResolvedValueOnce({
        requiresTrackSelection: true,
        trackInventory: inventory,
        guitarProIntermediate: intermediate,
        sourceFormatLabel: "Guitar Pro 8 tablature",
      })
      .mockResolvedValueOnce(proofReaderDocuments());
    render(<App />);

    const file = new File([new Uint8Array([1, 2, 3])], "two-tracks.gp", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(
        /Guitar Pro 8 tablature contains 2 supported tablature tracks/i
      )
    ).toBeInTheDocument();
    const selectorHeading = await screen.findByRole("heading", {
      level: 2,
      name: "Choose a Guitar Pro track",
    });
    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(selectorHeading));

    fireEvent.click(screen.getByRole("radio", { name: /Bass\. four-string bass/i }));
    fireEvent.click(screen.getByRole("button", { name: "Load selected track" }));

    expect(buildGuitarProReaderDocuments).toHaveBeenNthCalledWith(2, file, {
      intermediate,
      selection: { trackIndex: 1, staffIndex: 0 },
    });
    const readerHeading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });
    await waitFor(() => expect(document.activeElement).toBe(readerHeading));
  });

  test("routes decoder failure through the durable iPhone upload error", async () => {
    useTouchDevice();
    buildGuitarProReaderDocuments.mockRejectedValue(
      Object.assign(new Error("The Guitar Pro internal version evidence is corrupt."), {
        code: "CORRUPT_GUITAR_PRO_FILE",
      })
    );
    render(<App />);

    const file = new File([new Uint8Array([9])], "broken.gp5", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "Tablature could not be loaded",
    });

    expect(
      screen.getByText("The Guitar Pro internal version evidence is corrupt.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/selected Guitar Pro file could not be imported/i)
    ).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";

jest.mock("./guitarProReaderDocuments", () => ({
  buildGuitarProReaderDocuments: jest.fn(),
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

function semanticProof() {
  const document = normalizeGuitarProIntermediate({
    schemaVersion: 1,
    sourceVersion: "GP8",
    versionEvidence: {
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      rootVersion: "7.0",
      gpVersion: "8.0.0",
      encodingDescription: "GP8",
      sourceVersion: "GP8",
      entryCount: 1,
      declaredTrackCount: 1,
    },
    title: "PowerTab application proof",
    tracks: [
      {
        name: "Proof Guitar",
        shortName: "Proof Guitar",
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
  document.sourceFormat = "powertab-pt2";
  document.sourceVersion = "PT2_V11";
  return document;
}

function powerTabDocuments() {
  const semanticDocument = semanticProof();
  return {
    desktopBlocks: [semanticDocument.strings.map((string) => string.sourceLine)],
    desktopSource: "semantic",
    semanticDocument,
    semanticError: null,
    requestedInstrument: "guitar",
    resolvedInstrument: "guitar",
    instrumentWasDetected: false,
    supportOutcome: "source-checkpoint-provisional",
    sourceFormat: "powertab-pt2",
    sourceFormatLabel: "PowerTab 2 version 11 tablature",
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

describe("PowerTab v11 application path", () => {
  test("routes .pt2 into the shared semantic reader and preserves picker-return focus", async () => {
    useTouchDevice();
    buildGuitarProReaderDocuments.mockResolvedValue(powerTabDocuments());
    render(<App />);

    const file = new File([new Uint8Array([0x1f, 0x8b])], "proof.pt2", {
      type: "application/octet-stream",
    });
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
        /Imported PowerTab 2 version 11 tablature\. Loaded 1 synchronized position/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("uses explicit PowerTab player labels and reuses the decoded intermediate", async () => {
    useTouchDevice();
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "PT2_V11",
      tracks: [],
    };
    const inventory = {
      supportedCount: 2,
      supportedItems: [
        {
          id: "powertab-player-1-staff-1",
          trackIndex: 0,
          staffIndex: 0,
          selectionLabel:
            "Lead Guitar. six-string guitar. Tuning high to low: E4, B3, G3, D3, A2, E2. 1 measure.",
          supported: true,
        },
        {
          id: "powertab-player-2-staff-1",
          trackIndex: 1,
          staffIndex: 0,
          selectionLabel:
            "Second Guitar. six-string guitar. Tuning high to low: E4, B3, G3, D3, A2, E2. 1 measure.",
          supported: true,
        },
      ],
      items: [],
      selectorLabels: {
        formatName: "PowerTab",
        singular: "player",
        plural: "players",
        heading: "Choose a PowerTab player",
        loadAction: "Load selected player",
        selectedPrefix: "Selected player details",
        noneSelected: "No player selected.",
        unavailableHeading: "Other players not available",
        controlNote:
          "The separate Guitar or Bass control does not filter PowerTab players.",
      },
    };
    buildGuitarProReaderDocuments
      .mockResolvedValueOnce({
        requiresTrackSelection: true,
        trackInventory: inventory,
        guitarProIntermediate: intermediate,
        sourceFormatLabel: "PowerTab 2 version 11 tablature",
      })
      .mockResolvedValueOnce(powerTabDocuments());
    render(<App />);

    const file = new File([new Uint8Array([0x1f, 0x8b])], "players.pt2", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(
        /PowerTab 2 version 11 tablature contains 2 supported tablature tracks/i
      )
    ).toBeInTheDocument();
    const selectorHeading = await screen.findByRole("heading", {
      level: 2,
      name: "Choose a PowerTab player",
    });
    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(selectorHeading));

    fireEvent.click(
      screen.getByRole("radio", { name: /Second Guitar\. six-string guitar/i })
    );
    fireEvent.click(screen.getByRole("button", { name: "Load selected player" }));

    expect(buildGuitarProReaderDocuments).toHaveBeenNthCalledWith(2, file, {
      intermediate,
      selection: { trackIndex: 1, staffIndex: 0 },
    });
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "iPhone tablature reader",
      })
    ).toBeInTheDocument();
  });

  test("routes PowerTab decoder failure through the durable generic upload error", async () => {
    useTouchDevice();
    buildGuitarProReaderDocuments.mockResolvedValue({
      desktopBlocks: [],
      semanticDocument: null,
      semanticError: new Error(
        "The PowerTab document reports internal version 10. This checkpoint accepts exact version 11 only."
      ),
      resolvedInstrument: null,
      instrumentWasDetected: false,
      supportOutcome: "powertab-import-error",
      sourceFormat: "powertab-pt2",
      sourceFormatLabel: "PowerTab 2 version 11 tablature",
    });
    render(<App />);

    const file = new File([new Uint8Array([0x1f, 0x8b])], "older.pt2", {
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
      screen.getByText(/accepts exact version 11 only/i)
    ).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });
});

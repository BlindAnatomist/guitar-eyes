import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";

jest.mock("./structuredTabReaderDocuments", () => ({
  buildStructuredTabReaderDocuments: jest.fn(),
}));

function useTouchDevice() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

function legacyDocuments() {
  return {
    desktopBlocks: [],
    semanticDocument: {
      type: "tablature-document",
      sourceFormat: "powertab-legacy",
      sourceVersion: "PTB_V17",
      versionEvidence: { fileVersion: 4, powerTabVersion: "1.7" },
      instrument: "guitar",
      instrumentLabel: "six-string guitar",
      title: "Guitar Eyes PTB 1.7 Proof",
      sourceTrackName: "Proof Guitar",
      stringCount: 6,
      strings: [
        { id: "s1", spokenName: "High E string", order: 0 },
        { id: "s2", spokenName: "B string", order: 1 },
        { id: "s3", spokenName: "G string", order: 2 },
        { id: "s4", spokenName: "D string", order: 3 },
        { id: "s5", spokenName: "A string", order: 4 },
        { id: "s6", spokenName: "Low E string", order: 5 },
      ],
      positions: [
        {
          id: "p1",
          number: 1,
          total: 1,
          blockNumber: 1,
          positionInBlock: 1,
          positionsInBlock: 1,
          measureNumber: 1,
          measureCountInBlock: 1,
          positionInMeasure: 1,
          positionsInMeasure: 1,
          duration: { name: "quarter note" },
          isRest: false,
          strings: [
            { stringId: "s1", type: "unplayed" },
            { stringId: "s2", type: "unplayed" },
            { stringId: "s3", type: "unplayed" },
            { stringId: "s4", type: "unplayed" },
            { stringId: "s5", type: "unplayed" },
            { stringId: "s6", type: "fret", fret: 3, techniques: [] },
          ],
        },
      ],
      blocks: [{ number: 1 }],
      measures: [{ number: 1 }],
      warnings: [],
    },
    semanticError: null,
    resolvedInstrument: "guitar",
    instrumentWasDetected: false,
    supportOutcome: "source-checkpoint-provisional",
    sourceFormat: "powertab-legacy",
    sourceFormatLabel: "PowerTab 1.7 tablature",
    requiresTrackSelection: false,
  };
}

describe("legacy PowerTab application intake", () => {
  beforeEach(() => {
    buildStructuredTabReaderDocuments.mockReset();
    window.GUITAR_EYES_FORMAT_ONLY = true;
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
      window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    }
  });

  afterEach(() => {
    delete window.GUITAR_EYES_FORMAT_ONLY;
  });

  test("loads a .ptb file through the shared iPhone reader and restores focus", async () => {
    useTouchDevice();
    buildStructuredTabReaderDocuments.mockResolvedValue(legacyDocuments());
    render(<App />);

    const file = new File([new Uint8Array([0x70, 0x74, 0x61, 0x62, 4, 0])], "proof.ptb", {
      type: "application/octet-stream",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    expect(buildStructuredTabReaderDocuments).toHaveBeenCalledWith(file);
    await waitFor(() =>
      expect(screen.getByText(/Imported PowerTab 1\.7 tablature/i)).toBeInTheDocument()
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /Guitar Eyes PTB 1\.7 Proof/i,
    });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 20));
    });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();
  });
});

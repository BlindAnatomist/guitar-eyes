import fs from "fs";
import path from "path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { describePlayablePosition } from "./positionDescription";
import { buildReaderDocuments } from "./tabImportCoordinator";
import {
  ASCII_INSTRUMENT_PROFILES,
  SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY,
} from "./tabStringLine";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

const originalMatchMedia = window.matchMedia;
const originalFormatOnly = window.GUITAR_EYES_FORMAT_ONLY;

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

beforeEach(() => {
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

  if (originalFormatOnly === undefined) {
    delete window.GUITAR_EYES_FORMAT_ONLY;
  } else {
    window.GUITAR_EYES_FORMAT_ONLY = originalFormatOnly;
  }
});

describe("ASCII extended-string intake checkpoint 2", () => {
  test("defines exact eight-string guitar and six-string bass profiles within existing families", () => {
    expect(ASCII_INSTRUMENT_PROFILES.eightStringGuitar).toMatchObject({
      id: "guitar",
      profileId: "eight-string-guitar",
      label: "eight-string guitar",
      stringCount: 8,
      standardTuning: ["E", "B", "G", "D", "A", "E", "B", "F#"],
      standardOctaves: [4, 3, 3, 3, 2, 2, 1, 1],
      requireEveryOctave: true,
      requireExactStandardOctaves: true,
    });
    expect(ASCII_INSTRUMENT_PROFILES.sixStringBass).toMatchObject({
      id: "bass",
      profileId: "six-string-bass",
      label: "six-string bass",
      stringCount: 6,
      standardTuning: ["C", "G", "D", "A", "E", "B"],
      standardOctaves: [3, 2, 2, 1, 1, 0],
      requireEveryOctave: true,
      requireExactStandardOctaves: true,
    });
    expect(SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY.guitar).toEqual([
      "guitar",
      "sevenStringGuitar",
      "eightStringGuitar",
    ]);
    expect(SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY.bass).toEqual([
      "bass",
      "fiveStringBass",
      "sixStringBass",
    ]);
  });

  test("imports exact eight-string guitar without leaving the Guitar family", () => {
    const result = buildReaderDocuments(
      fixture("ascii-eight-string-guitar.txt"),
      "guitar"
    );
    const description = describePlayablePosition(result.semanticDocument, 0);

    expect(result).toMatchObject({
      resolvedInstrument: "guitar",
      instrumentWasDetected: false,
      supportOutcome: "supported",
    });
    expect(result.semanticDocument).toMatchObject({
      instrument: "guitar",
      instrumentLabel: "eight-string guitar",
      stringCount: 8,
    });
    expect(result.semanticDocument.strings.map((string) => string.tuning)).toEqual([
      "E",
      "B",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
    ]);
    expect(result.semanticDocument.strings.map((string) => string.octave)).toEqual([
      4,
      3,
      3,
      3,
      2,
      2,
      1,
      1,
    ]);
    expect(result.semanticDocument.positions).toHaveLength(1);
    expect(result.semanticDocument.positions[0].duration).toMatchObject({
      symbol: "Q",
      name: "quarter note",
      quarterNoteUnits: 1,
    });
    expect(result.desktopBlocks[0]).toHaveLength(8);
    expect(description).toContain("High E string, open.");
    expect(description).toContain("Low E string, open.");
    expect(description).toContain("Low B string, open.");
    expect(description).toContain("Low F sharp string, open.");
  });

  test("auto-detects exact six-string bass from Guitar family", () => {
    const result = buildReaderDocuments(
      fixture("ascii-six-string-bass.txt"),
      "guitar"
    );
    const description = describePlayablePosition(result.semanticDocument, 0);

    expect(result).toMatchObject({
      resolvedInstrument: "bass",
      instrumentWasDetected: true,
      supportOutcome: "supported",
    });
    expect(result.semanticDocument).toMatchObject({
      instrument: "bass",
      instrumentLabel: "six-string bass",
      stringCount: 6,
    });
    expect(result.semanticDocument.strings.map((string) => string.tuning)).toEqual([
      "C",
      "G",
      "D",
      "A",
      "E",
      "B",
    ]);
    expect(result.semanticDocument.strings.map((string) => string.octave)).toEqual([
      3,
      2,
      2,
      1,
      1,
      0,
    ]);
    expect(result.semanticDocument.positions).toHaveLength(1);
    expect(result.semanticDocument.positions[0].duration).toMatchObject({
      symbol: "Q",
      name: "quarter note",
      quarterNoteUnits: 1,
    });
    expect(result.desktopBlocks[0]).toHaveLength(6);
    expect(description).toContain("High C string, open.");
    expect(description).toContain("Low B string, open.");
  });

  test.each([
    [
      "eight-string guitar",
      [
        "E|--0--|",
        "B|--0--|",
        "G|--0--|",
        "D|--0--|",
        "A|--0--|",
        "E|--0--|",
        "B|--0--|",
        "F#|--0--|",
      ].join("\n"),
    ],
    [
      "six-string bass",
      [
        "C|--0--|",
        "G|--0--|",
        "D|--0--|",
        "A|--0--|",
        "E|--0--|",
        "B|--0--|",
      ].join("\n"),
    ],
  ])("rejects %s when octave evidence is missing", (_label, source) => {
    const result = buildReaderDocuments(source, "guitar");

    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError).toMatchObject({
      code: "MISSING_TUNING_OCTAVES",
    });
  });

  test.each([
    [
      "altered eight-string guitar",
      [
        "E4|--0--|",
        "B3|--0--|",
        "G3|--0--|",
        "D3|--0--|",
        "A2|--0--|",
        "E2|--0--|",
        "B1|--0--|",
        "F1|--0--|",
      ].join("\n"),
    ],
    [
      "six-string bass with the wrong high-C octave",
      [
        "C2|--0--|",
        "G2|--0--|",
        "D2|--0--|",
        "A1|--0--|",
        "E1|--0--|",
        "B0|--0--|",
      ].join("\n"),
    ],
  ])("rejects %s instead of treating string count as authority", (_label, source) => {
    const result = buildReaderDocuments(source, "guitar");

    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError).toMatchObject({
      code: "UNVERIFIED_TUNING_PROFILE",
    });
  });

  test("loads both fixtures through the format-only iPhone workflow", async () => {
    useTouchDevice();
    window.GUITAR_EYES_FORMAT_ONLY = true;
    render(<App />);

    const instrument = screen.getByLabelText("Choose Instrument:");
    const upload = screen.getByLabelText("Upload tablature file:");

    expect(instrument).toHaveValue("guitar");

    fireEvent.change(upload, {
      target: {
        files: [
          new File(
            [fixture("ascii-eight-string-guitar.txt")],
            "eight-string-guitar.txt",
            { type: "text/plain" }
          ),
        ],
      },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });
    expect(instrument).toHaveValue("guitar");
    expect(screen.getByText(/Low F sharp string, open/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration, quarter note/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Sound delay")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Audition current position" })
    ).not.toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));

    fireEvent.change(upload, {
      target: {
        files: [
          new File(
            [fixture("ascii-six-string-bass.txt")],
            "six-string-bass.txt",
            { type: "text/plain" }
          ),
        ],
      },
    });

    await waitFor(() => expect(instrument).toHaveValue("bass"));
    expect(screen.getByText(/Detected six-string bass/i)).toBeInTheDocument();
    expect(screen.getByText(/High C string, open/i)).toBeInTheDocument();
    expect(screen.getByText(/Low B string, open/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration, quarter note/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Sound delay")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Audition current position" })
    ).not.toBeInTheDocument();
  });
});

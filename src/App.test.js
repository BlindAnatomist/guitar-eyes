import fs from "fs";
import path from "path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const originalMatchMedia = window.matchMedia;

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

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
});

describe("Guitar Eyes application shell", () => {
  test("preserves the desktop reader and exposes the iPhone mode", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Guitar Eyes for Mac - The Guitar Tablature reader/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: "Desktop grid reader" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "iPhone semantic reader" })).not.toBeChecked();
    expect(screen.getByLabelText("Upload tablature file:")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose Instrument:")).toBeInTheDocument();
    expect(screen.getByLabelText("Multi-Column Navigation")).toBeInTheDocument();
    expect(
      screen.getByText(/Test build: Guitar Pro shared-archive proof 3B/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close Mac keyboard instructions" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("allows the reader mode to change without removing desktop controls", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("radio", { name: "iPhone semantic reader" }));

    expect(screen.getByRole("radio", { name: "iPhone semantic reader" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Desktop grid reader" })).not.toBeChecked();
    expect(screen.getByLabelText("Upload tablature file:")).toBeInTheDocument();
  });

  test("puts the instrument and upload workflow before collapsed Mac instructions on a touch device", () => {
    useTouchDevice();
    render(<App />);

    const iphoneMode = screen.getByRole("radio", { name: "iPhone semantic reader" });
    const instrument = screen.getByLabelText("Choose Instrument:");
    const upload = screen.getByLabelText("Upload tablature file:");
    const instructionsButton = screen.getByRole("button", {
      name: "Open Mac keyboard instructions",
    });

    expect(iphoneMode).toBeChecked();
    expect(instructionsButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Welcome to Guitar Eyes for Mac!/i)).not.toBeInTheDocument();
    expect(
      instrument.compareDocumentPosition(upload) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      upload.compareDocumentPosition(instructionsButton) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test("recovers focus to the persistent iPhone reader heading after Safari returns from ASCII file selection", async () => {
    useTouchDevice();
    render(<App />);

    const file = new File(
      [
        "e|--0--2--3--2--0-----|\n",
        "B|--1--3--0--3--1-----|\n",
        "G|--0--2--0--2--0-----|\n",
        "D|--2--0--0--0--2-----|\n",
        "A|--3--------3--3------|\n",
        "E|--------------------|\n",
      ],
      "iphone-proof-clean-six-string.txt",
      { type: "text/plain" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    fireEvent.focus(window);

    await waitFor(() => expect(document.activeElement).toBe(heading));
    expect(screen.getByText(/Loaded 5 synchronized positions/i)).toBeInTheDocument();
  });

  test("recovers focus to the persistent error heading after Safari returns from a failed upload", async () => {
    useTouchDevice();
    render(<App />);

    const file = new File(
      ["This file contains no complete tablature block."],
      "invalid-tab.txt",
      { type: "text/plain" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "Tablature could not be loaded",
    });

    fireEvent.focus(window);

    await waitFor(() => expect(document.activeElement).toBe(heading));
    expect(screen.getByText(/could not be loaded in iPhone reading mode/i)).toBeInTheDocument();
  });

  test("recognizes unsupported seven-string ASCII without showing a misleading desktop grid", async () => {
    render(<App />);

    const file = new File(
      [fixture("ascii-seven-string-guitar.txt")],
      "seven-string.tab",
      { type: "text/plain" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "Tablature could not be loaded",
    });

    expect(screen.getByText(/recognized 7-string ASCII tablature/i)).toBeInTheDocument();
    expect(screen.getByText(/string count that is not yet supported/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Tablature 1" })).not.toBeInTheDocument();

    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("imports MusicXML into the iPhone reader and recovers picker-return focus", async () => {
    useTouchDevice();
    render(<App />);

    const file = new File(
      [fixture("musicxml-minimal-guitar-tab.musicxml")],
      "structured-guitar.musicxml",
      { type: "application/xml" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    expect(
      screen.getByText(/Imported MusicXML tablature\. Loaded 4 synchronized positions/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration, quarter note/i)).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  test("imports MusicXML into the desktop semantic reader without switching modes", async () => {
    render(<App />);

    const file = new File(
      [fixture("musicxml-chord-rest-two-measures.musicxml")],
      "chord-rest.musicxml",
      { type: "application/xml" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "Desktop tablature reader",
    });

    expect(
      screen.getByText(/Imported MusicXML tablature\. Loaded 6 synchronized positions/i)
    ).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
    await waitFor(() => expect(document.activeElement).toBe(heading));

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));
    expect(screen.getByText(/Duration, quarter note\. Rest\./i)).toBeInTheDocument();
  });

  test("rejects non-tablature MusicXML and keeps compressed MusicXML unsupported", async () => {
    useTouchDevice();
    render(<App />);

    const nonTabXmlText = [
      '<?xml version="1.0"?>',
      '<score-partwise version="4.0"><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>',
      '<part id="P1"><measure number="1"><attributes><divisions>4</divisions></attributes>',
      '<note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>',
      '</measure></part></score-partwise>',
    ].join("");
    const nonTabXml = new File([nonTabXmlText], "piano.xml", {
      type: "application/xml",
    });

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [nonTabXml] },
    });

    expect(
      await screen.findByText(/No MusicXML part contains explicit tablature string and fret data/i)
    ).toBeInTheDocument();

    const compressed = new File(["binary"], "score.mxl", {
      type: "application/vnd.recordare.musicxml",
    });
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [compressed] },
    });

    expect(await screen.findByText(/Compressed MusicXML was recognized/i)).toBeInTheDocument();
    expect(screen.getByText(/does not yet import \.mxl/i)).toBeInTheDocument();
  });
});

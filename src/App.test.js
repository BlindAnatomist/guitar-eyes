import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

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
    expect(screen.getByText(/Test build: Shared semantic core repair 1/i)).toBeInTheDocument();
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

  test("recovers focus to the persistent iPhone reader heading after Safari returns from file selection", async () => {
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

  test("recognizes MusicXML without pretending that structured import exists", async () => {
    useTouchDevice();
    render(<App />);

    const file = new File(
      [
        '<?xml version="1.0"?>\n',
        '<score-partwise version="4.0">\n',
        '<part id="P1"><measure number="1"><note><notations><technical>',
        '<string>6</string><fret>3</fret>',
        '</technical></notations></note></measure></part>\n',
        '</score-partwise>\n',
      ],
      "structured-guitar.musicxml",
      { type: "application/xml" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "Tablature could not be loaded",
    });

    expect(screen.getByText(/MusicXML tablature was recognized/i)).toBeInTheDocument();
    expect(screen.getByText(/does not yet import MusicXML/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "iPhone tablature reader" })
    ).not.toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });
});

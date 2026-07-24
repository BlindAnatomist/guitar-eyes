import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const originalMatchMedia = window.matchMedia;

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
    expect(screen.getByLabelText("Upload .txt file:")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose Instrument:")).toBeInTheDocument();
    expect(screen.getByLabelText("Multi-Column Navigation")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close Mac keyboard instructions" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("allows the reader mode to change without removing desktop controls", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("radio", { name: "iPhone semantic reader" }));

    expect(screen.getByRole("radio", { name: "iPhone semantic reader" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Desktop grid reader" })).not.toBeChecked();
    expect(screen.getByLabelText("Upload .txt file:")).toBeInTheDocument();
  });

  test("puts iPhone controls before collapsed Mac instructions on a touch device", () => {
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

    render(<App />);

    const iphoneMode = screen.getByRole("radio", { name: "iPhone semantic reader" });
    const upload = screen.getByLabelText("Upload .txt file:");
    const instructionsButton = screen.getByRole("button", {
      name: "Open Mac keyboard instructions",
    });

    expect(iphoneMode).toBeChecked();
    expect(instructionsButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Welcome to Guitar Eyes for Mac!/i)).not.toBeInTheDocument();
    expect(
      upload.compareDocumentPosition(instructionsButton) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test("recovers focus to the persistent iPhone reader heading after Safari returns from file selection", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: true,
        media: "(pointer: coarse)",
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });

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

    fireEvent.change(screen.getByLabelText("Upload .txt file:"), {
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
});

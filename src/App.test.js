import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

const originalMatchMedia = window.matchMedia;

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
});

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

function makeGuitarFile(name = "shared-guitar-tab.txt") {
  return new File(
    [
      "e|--0--2--3--2--0-----|\n",
      "B|--1--3--0--3--1-----|\n",
      "G|--0--2--0--2--0-----|\n",
      "D|--2--0--0--0--2-----|\n",
      "A|--3--------3--3------|\n",
      "E|--------------------|\n",
    ],
    name,
    { type: "text/plain" }
  );
}

describe("Guitar Eyes converged application shell", () => {
  test("starts with the semantic desktop reader while retaining the iPhone mode", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Guitar Eyes for Mac and iPhone/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: "Desktop semantic reader" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "iPhone semantic reader" })).not.toBeChecked();
    expect(screen.getByLabelText("Upload .txt file:")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose Instrument:")).toBeInTheDocument();
    expect(screen.queryByLabelText("Multi-Column Navigation")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close Mac keyboard instructions" })
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("allows mode changes without replacing the uploaded semantic document", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Upload .txt file:"), {
      target: { files: [makeGuitarFile()] },
    });

    const desktopHeading = await screen.findByRole("heading", {
      level: 2,
      name: "Desktop tablature reader",
    });
    const desktopSection = desktopHeading.closest("section");
    expect(within(desktopSection).getByText(/Measure 1, position 1 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/same semantic document is available in both reading modes/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "iPhone semantic reader" }));

    const iphoneHeading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });
    const iphoneSection = iphoneHeading.closest("section");
    expect(within(iphoneSection).getByText(/Measure 1, position 1 of 5/)).toBeInTheDocument();
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
    expect(screen.queryByText(/Desktop navigation/i)).not.toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText("Upload .txt file:"), {
      target: { files: [makeGuitarFile("iphone-proof-clean-six-string.txt")] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    fireEvent.focus(window);

    await waitFor(() => expect(document.activeElement).toBe(heading));
    expect(screen.getByText(/Loaded 5 synchronized positions/i)).toBeInTheDocument();
  });

  test("loads bass through the shared model", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Choose Instrument:"), {
      target: { value: "bass" },
    });

    const bassFile = new File(
      ["G|--0--|\n", "D|-----|\n", "A|-----|\n", "E|--3--|\n"],
      "bass-tab.txt",
      { type: "text/plain" }
    );
    fireEvent.change(screen.getByLabelText("Upload .txt file:"), {
      target: { files: [bassFile] },
    });

    const desktopHeading = await screen.findByRole("heading", {
      level: 2,
      name: "Desktop tablature reader",
    });
    const desktopSection = desktopHeading.closest("section");
    expect(within(desktopSection).getByText(/E string, fret 3/)).toBeInTheDocument();
    expect(screen.getByText(/Loaded 1 synchronized position/i)).toBeInTheDocument();
  });
});

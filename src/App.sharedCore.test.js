import { fireEvent, render, screen } from "@testing-library/react";
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
  useTouchDevice();
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

describe("shared semantic core in the iPhone workflow", () => {
  test("auto-detects and loads four-string bass into the semantic iPhone reader", async () => {
    render(<App />);

    expect(screen.getByLabelText("Choose Instrument:")).toHaveValue("guitar");

    const file = new File(
      [
        "G|--0--2--4--2--|\n",
        "D|--0--0--2--0--|\n",
        "A|--2--------2---|\n",
        "E|--3------------|\n",
      ],
      "shared-core-four-string-bass.txt",
      { type: "text/plain" }
    );

    fireEvent.change(screen.getByLabelText("Upload .txt file:"), {
      target: { files: [file] },
    });

    expect(await screen.findByText(/E string, fret 3\./)).toBeInTheDocument();
    expect(screen.getByLabelText("Choose Instrument:")).toHaveValue("bass");
    expect(screen.getByText(/Detected four-string bass/i)).toBeInTheDocument();
    expect(screen.getByText(/Loaded 4 synchronized positions/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next tablature block" })
    ).not.toBeInTheDocument();
  });

  test("loads two guitar blocks and exposes block navigation", async () => {
    render(<App />);

    const file = new File(
      [
        "Intro\n\n",
        "e|--0--2--3--2--0-----|\n",
        "B|--1--3--0--3--1-----|\n",
        "G|--0--2--0--2--0-----|\n",
        "D|--2--0--0--0--2-----|\n",
        "A|--3--------3--3------|\n",
        "E|--------------------|\n\n",
        "Verse\n\n",
        "e|--3--2--0--2--3-----|\n",
        "B|--0--3--1--3--0-----|\n",
        "G|--0--2--0--2--0-----|\n",
        "D|--0--0--2--0--0-----|\n",
        "A|--2-----3-----2------|\n",
        "E|--3-----------3------|\n",
      ],
      "shared-core-two-block-guitar.txt",
      { type: "text/plain" }
    );

    fireEvent.change(screen.getByLabelText("Upload .txt file:"), {
      target: { files: [file] },
    });

    const nextBlock = await screen.findByRole("button", {
      name: "Next tablature block",
    });
    expect(nextBlock).toBeEnabled();
    expect(screen.getAllByText(/Block 1 of 2/).length).toBeGreaterThan(0);

    fireEvent.click(nextBlock);

    expect(screen.getAllByText(/Block 2 of 2/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Previous tablature block" })
    ).toBeEnabled();
  });
});

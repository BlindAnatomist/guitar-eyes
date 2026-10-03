import fs from "fs";
import path from "path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";

jest.mock("./structuredTabReaderDocuments", () => ({
  buildStructuredTabReaderDocuments: jest.fn(),
}));

const realBuildStructuredTabReaderDocuments = jest.requireActual(
  "./structuredTabReaderDocuments"
).buildStructuredTabReaderDocuments;
const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
const modes = ["iphone", "desktop"];
const header = (version) => [0x70, 0x74, 0x61, 0x62, version, 0];
const rejectedFiles = [
  ["empty", [], /must be between 1 and/],
  ["short-header", [0x70, 0x74], /too short to contain a complete ptab version header/],
  ["wrong-marker", [0, 0, 0, 0, 4, 0], /does not contain the PowerTab ptab marker/],
  ["unsupported-version", header(9), /unsupported file-version value 9/],
  ...[1, 2, 3, 4].map((version) => [
    `truncated-version-${version}`,
    header(version),
    /ended unexpectedly/,
  ]),
];
const legacyFixtures = [
  ["1.0", "powertab-ptb-historical/powertab-v10-original-six-position.ptb"],
  ["1.0.2", "powertab-ptb-historical/powertab-v102-original-six-position.ptb"],
  ["1.5", "powertab-ptb-historical/powertab-v15-original-six-position.ptb"],
  ["1.7", "powertab-ptb-v17/powertab-v17-original-six-position.ptb"],
];

function setMode(mode) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn(() => ({
      matches: mode === "iphone",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

function binaryFile(name, values) {
  const bytes = Uint8Array.from(values);
  return {
    name,
    size: bytes.length,
    arrayBuffer: jest.fn(async () => bytes.buffer),
  };
}

beforeEach(() => {
  buildStructuredTabReaderDocuments.mockReset();
  buildStructuredTabReaderDocuments.mockImplementation(realBuildStructuredTabReaderDocuments);
});

afterEach(() => {
  if (originalMatchMedia) {
    Object.defineProperty(window, "matchMedia", originalMatchMedia);
  } else {
    delete window.matchMedia;
  }
});

describe.each(modes)("support wording in %s mode", (mode) => {
  test.each(rejectedFiles)("does not guess PowerTab 1.7 for a real %s rejection", async (name, bytes, errorPattern) => {
    setMode(mode);
    render(<App />);
    const file = binaryFile(`${name}.ptb`, bytes);
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(errorPattern);
    expect(alert).not.toHaveTextContent("PowerTab 1.7");
    expect(screen.getByText("The selected legacy PowerTab file could not be imported.")).toBeVisible();
    expect(buildStructuredTabReaderDocuments).toHaveBeenCalledTimes(1);
    expect(buildStructuredTabReaderDocuments).toHaveBeenCalledWith(file);
    expect(screen.getByLabelText("Upload tablature file:")).not.toHaveAttribute("accept");
    expect(screen.getByLabelText("Upload tablature file:")).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Read current position" })).not.toBeInTheDocument();
    const heading = screen.getByRole("heading", { name: "Tablature could not be loaded" });
    fireEvent.focus(window);
    await waitFor(() => expect(heading).toHaveFocus());
  });

  test("uses a version-neutral fallback for non-Error rejection and allows a valid retry", async () => {
    setMode(mode);
    buildStructuredTabReaderDocuments.mockRejectedValueOnce(null);
    render(<App />);
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [binaryFile("unknown.ptb", header(1))] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The legacy PowerTab file could not be prepared for the Guitar Eyes readers."
    );
    expect(screen.getByText("The selected legacy PowerTab file could not be imported.")).toBeVisible();
    const file = new File(
      ["e|--0--2--|\nB|--------|\nG|--------|\nD|--------|\nA|--------|\nE|--------|"],
      "retry.txt",
      { type: "text/plain" }
    );
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      name: mode === "iphone" ? "iPhone tablature reader" : "Desktop tablature reader",
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Read current position" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /audition|sound|audio/i })).not.toBeInTheDocument();
    fireEvent.focus(window);
    await waitFor(() => expect(heading).toHaveFocus());
  });

  test("retains a decoder's evidence-based error detail", async () => {
    setMode(mode);
    buildStructuredTabReaderDocuments.mockRejectedValueOnce(
      new Error("PowerTab 1.5 source evidence is contradictory.")
    );
    render(<App />);
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [binaryFile("contradictory.ptb", header(3))] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "PowerTab 1.5 source evidence is contradictory."
    );
    expect(screen.getByText("The selected legacy PowerTab file could not be imported.")).toBeVisible();
  });

  test.each(legacyFixtures)("keeps the verified PowerTab %s success identity", async (version, relativePath) => {
    setMode(mode);
    render(<App />);
    const bytes = fs.readFileSync(path.join(process.cwd(), "fixtures", relativePath));
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [binaryFile("proof.ptb", bytes)] },
    });
    const heading = await screen.findByRole("heading", {
      name: mode === "iphone" ? "iPhone tablature reader" : "Desktop tablature reader",
    });
    expect(screen.getByText(new RegExp(`Imported PowerTab ${version.replaceAll(".", "\\.")} tablature\\. Loaded 6 synchronized positions`))).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.focus(window);
    await waitFor(() => expect(heading).toHaveFocus());
  });

  test.each([
    ["unsupported.gtp", "Guitar Pro 2 tablature", /does not import GP2 files/],
    ["unsupported.tef", "TablEdit tablature", /does not yet import \.tef files/],
  ])("keeps %s recognition distinct from import support", async (name, label, errorPattern) => {
    setMode(mode);
    render(<App />);
    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [binaryFile(name, [1])] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(errorPattern);
    expect(screen.getByText(`Recognized ${label}, but import support is not available yet.`)).toBeVisible();
    expect(buildStructuredTabReaderDocuments).not.toHaveBeenCalled();
  });
});

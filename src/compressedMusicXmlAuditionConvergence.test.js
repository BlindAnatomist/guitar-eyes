import fs from "fs";
import path from "path";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import { readCompressedMusicXmlFile } from "./compressedMusicXmlImporter";
import { createPositionAuditioner } from "./sampleAwarePositionAuditioner";

jest.mock("./compressedMusicXmlImporter", () => ({
  readCompressedMusicXmlFile: jest.fn(),
}));

jest.mock("./sampleAwarePositionAuditioner", () => ({
  createPositionAuditioner: jest.fn(),
}));

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

afterEach(() => {
  jest.clearAllMocks();
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

test("compressed MusicXML reaches the accepted audition reader without breaking navigation order", async () => {
  useTouchDevice();
  readCompressedMusicXmlFile.mockResolvedValue(
    fixture("musicxml-minimal-guitar-tab.musicxml")
  );

  const auditioner = {
    audition: jest.fn().mockResolvedValue({
      outcome: "auditioned",
      pitchedEventCount: 1,
      mutedEventCount: 0,
      sampledEventCount: 1,
      proceduralFallbackCount: 0,
      activeVoiceCount: 1,
      contextState: "running",
    }),
    stop: jest.fn(),
    dispose: jest.fn().mockResolvedValue(undefined),
    state: jest.fn(),
  };
  createPositionAuditioner.mockReturnValue(auditioner);

  render(<App />);

  const file = new File([new Uint8Array([1, 2, 3])], "structured-guitar.mxl", {
    type: "application/vnd.recordare.musicxml",
  });
  fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
    target: { files: [file] },
  });

  const heading = await screen.findByRole("heading", {
    level: 2,
    name: "iPhone tablature reader",
  });
  const reader = heading.closest("section");
  const previous = within(reader).getByRole("button", {
    name: "Previous position",
  });
  const read = within(reader).getByRole("button", {
    name: "Read current position",
  });
  const next = within(reader).getByRole("button", {
    name: "Next position",
  });
  const audition = within(reader).getByRole("button", {
    name: "Audition current position",
  });

  expect(readCompressedMusicXmlFile).toHaveBeenCalledWith(file);
  expect(screen.getByText(/Imported compressed MusicXML tablature/i)).toBeInTheDocument();
  expect(previous.compareDocumentPosition(read) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(read.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(next.compareDocumentPosition(audition) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(audition).not.toHaveAttribute("aria-describedby");

  audition.focus();
  fireEvent.click(audition);

  await waitFor(() => expect(auditioner.audition).toHaveBeenCalledTimes(1));
  expect(createPositionAuditioner).toHaveBeenCalledWith({
    startDelaySeconds: 2,
  });
  expect(document.activeElement).toBe(audition);

  fireEvent.click(next);
  expect(auditioner.stop).toHaveBeenCalledTimes(1);
  expect(reader.querySelector('.visually-hidden[aria-live="polite"]')).toBeEmptyDOMElement();
});

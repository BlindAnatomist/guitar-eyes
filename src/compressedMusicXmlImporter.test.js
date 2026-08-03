import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import {
  CompressedMusicXmlImportError,
  extractCompressedMusicXml,
} from "./compressedMusicXmlImporter";

Object.assign(global, { TextDecoder, TextEncoder });

const originalMatchMedia = window.matchMedia;

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

function encode(text) {
  return new TextEncoder().encode(text);
}

function concatenate(parts) {
  const total = parts.reduce((size, part) => size + part.byteLength, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.byteLength;
  });
  return output;
}

function setUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function setUint32(view, offset, value) {
  view.setUint32(offset, value >>> 0, true);
}

function storedEntry(name, text) {
  const bytes = encode(text);
  return {
    name,
    method: 0,
    compressed: bytes,
    uncompressed: bytes,
  };
}

function deflatedEntry(name, text, marker) {
  return {
    name,
    method: 8,
    compressed: new Uint8Array([marker]),
    uncompressed: encode(text),
  };
}

function makeZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  entries.forEach((entry) => {
    const nameBytes = encode(entry.name);
    const local = new Uint8Array(30 + nameBytes.byteLength + entry.compressed.byteLength);
    const localView = new DataView(local.buffer);
    setUint32(localView, 0, 0x04034b50);
    setUint16(localView, 4, 20);
    setUint16(localView, 6, 0x0800);
    setUint16(localView, 8, entry.method);
    setUint32(localView, 18, entry.compressed.byteLength);
    setUint32(localView, 22, entry.uncompressed.byteLength);
    setUint16(localView, 26, nameBytes.byteLength);
    local.set(nameBytes, 30);
    local.set(entry.compressed, 30 + nameBytes.byteLength);
    localParts.push(local);

    const central = new Uint8Array(46 + nameBytes.byteLength);
    const centralView = new DataView(central.buffer);
    setUint32(centralView, 0, 0x02014b50);
    setUint16(centralView, 4, 20);
    setUint16(centralView, 6, 20);
    setUint16(centralView, 8, 0x0800);
    setUint16(centralView, 10, entry.method);
    setUint32(centralView, 20, entry.compressed.byteLength);
    setUint32(centralView, 24, entry.uncompressed.byteLength);
    setUint16(centralView, 28, nameBytes.byteLength);
    setUint32(centralView, 42, localOffset);
    central.set(nameBytes, 46);
    centralParts.push(central);

    localOffset += local.byteLength;
  });

  const centralDirectory = concatenate(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  setUint32(endView, 0, 0x06054b50);
  setUint16(endView, 8, entries.length);
  setUint16(endView, 10, entries.length);
  setUint32(endView, 12, centralDirectory.byteLength);
  setUint32(endView, 16, localOffset);

  return concatenate([...localParts, centralDirectory, end]);
}

function containerXml(rootPath = "score.musicxml", mediaType = true) {
  const mediaTypeAttribute = mediaType
    ? ' media-type="application/vnd.recordare.musicxml+xml"'
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="${rootPath}"${mediaTypeAttribute}/>
  </rootfiles>
</container>`;
}

function makeStoredMxl(scoreText, rootPath = "score.musicxml") {
  return makeZip([
    storedEntry("mimetype", "application/vnd.recordare.musicxml"),
    storedEntry("META-INF/container.xml", containerXml(rootPath)),
    storedEntry(rootPath, scoreText),
  ]);
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

describe("compressed MusicXML extraction", () => {
  test("uses META-INF/container.xml to extract the declared MusicXML score", async () => {
    const scoreText = fixture("musicxml-minimal-guitar-tab.musicxml");
    const result = await extractCompressedMusicXml(makeStoredMxl(scoreText));

    expect(result).toMatchObject({
      sourceText: scoreText,
      rootPath: "score.musicxml",
      entryCount: 3,
      hasMimeTypeEntry: true,
    });
  });

  test("accepts deflated container and score entries through the bounded inflater", async () => {
    const scoreText = fixture("musicxml-minimal-guitar-tab.musicxml");
    const containerText = containerXml("scores/guitar.musicxml", false);
    const archive = makeZip([
      storedEntry("mimetype", "application/vnd.recordare.musicxml"),
      deflatedEntry("META-INF/container.xml", containerText, 1),
      deflatedEntry("scores/guitar.musicxml", scoreText, 2),
    ]);
    const inflated = new Map([
      [1, encode(containerText)],
      [2, encode(scoreText)],
    ]);

    const result = await extractCompressedMusicXml(archive, {
      inflateRaw: async (bytes) => inflated.get(bytes[0]),
    });

    expect(result.sourceText).toBe(scoreText);
    expect(result.rootPath).toBe("scores/guitar.musicxml");
  });

  test.each([
    [
      makeZip([storedEntry("score.musicxml", "<score-partwise/>")]),
      "MISSING_MXL_CONTAINER",
    ],
    [
      makeZip([
        storedEntry("META-INF/container.xml", containerXml("../score.musicxml")),
        storedEntry("../score.musicxml", "<score-partwise/>"),
      ]),
      "UNSAFE_MXL_ROOTFILE_PATH",
    ],
    [
      makeZip([
        storedEntry(
          "META-INF/container.xml",
          containerXml("score\u007f.musicxml")
        ),
        storedEntry("score\u007f.musicxml", "<score-partwise/>"),
      ]),
      "UNSAFE_MXL_ROOTFILE_PATH",
    ],
    [
      makeZip([
        storedEntry("META-INF/container.xml", containerXml()),
        storedEntry("META-INF/container.xml", containerXml()),
        storedEntry("score.musicxml", "<score-partwise/>"),
      ]),
      "DUPLICATE_MXL_ENTRY",
    ],
  ])("rejects unsafe or contradictory container evidence", async (archive, code) => {
    await expect(extractCompressedMusicXml(archive)).rejects.toMatchObject({
      name: "CompressedMusicXmlImportError",
      code,
    });
  });

  test("uses a specific error type for malformed archives", async () => {
    await expect(extractCompressedMusicXml(encode("not a ZIP"))).rejects.toBeInstanceOf(
      CompressedMusicXmlImportError
    );
  });
});

describe("compressed MusicXML application route", () => {
  test("imports .mxl into the accepted iPhone reader and preserves picker-return focus", async () => {
    useTouchDevice();
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    }
    render(<App />);

    const file = new File(
      [makeStoredMxl(fixture("musicxml-minimal-guitar-tab.musicxml"))],
      "structured-guitar.mxl",
      { type: "application/vnd.recordare.musicxml" }
    );

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    expect(
      screen.getByText(
        /Imported compressed MusicXML tablature\. Loaded 4 synchronized positions/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Low E string, fret 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration, quarter note/i)).toBeInTheDocument();

    fireEvent.focus(window);
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });
});
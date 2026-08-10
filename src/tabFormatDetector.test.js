import fs from "fs";
import path from "path";
import {
  detectTabFileFormat,
  shouldReadTabFileAsText,
  unsupportedTabFormatMessage,
} from "./tabFormatDetector";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

const asciiGuitar = [
  "Title and copied webpage text",
  "e|--0--2--|",
  "B|--1--3--|",
  "G|--0--2--|",
  "D|--2--0--|",
  "A|--3-----|",
  "E|--------|",
].join("\n");

const musicXml = `<?xml version="1.0"?>
<score-partwise version="4.0">
  <part id="P1">
    <measure number="1">
      <note>
        <notations><technical><string>6</string><fret>3</fret></technical></notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

describe("detectTabFileFormat", () => {
  test("recognizes supported ASCII extensions", () => {
    expect(detectTabFileFormat("riff.txt").id).toBe("ascii-text");
    expect(detectTabFileFormat("riff.tab").id).toBe("ascii-text");
  });

  test("recognizes ASCII tablature from content even with an unknown extension", () => {
    expect(detectTabFileFormat("shared-note.dat", asciiGuitar)).toMatchObject({
      id: "ascii-text",
      support: "supported",
      isText: true,
    });
  });

  test("recognizes octave-qualified and Unicode accidental ASCII content", () => {
    expect(
      detectTabFileFormat(
        "octave-labels.data",
        fixture("ascii-octave-qualified-standard.txt")
      ).id
    ).toBe("ascii-text");
    expect(
      detectTabFileFormat(
        "unicode-labels.data",
        fixture("ascii-unicode-accidentals.txt")
      ).id
    ).toBe("ascii-text");
  });

  test("does not mistake pipe-delimited prose for ASCII tablature", () => {
    expect(
      detectTabFileFormat(
        "table.data",
        fixture("ascii-pipe-delimited-nontab.txt")
      ).id
    ).toBe("unknown");
  });

  test("recognizes uncompressed MusicXML as supported by extension and content", () => {
    expect(detectTabFileFormat("score.musicxml")).toMatchObject({
      id: "musicxml",
      support: "supported",
      isText: true,
    });
    expect(detectTabFileFormat("score.txt", musicXml)).toMatchObject({
      id: "musicxml",
      support: "supported",
      isText: true,
    });
    expect(shouldReadTabFileAsText(detectTabFileFormat("score.xml"))).toBe(true);
  });

  test("recognizes compressed MusicXML as a supported binary container", () => {
    const format = detectTabFileFormat("score.mxl");
    expect(format).toMatchObject({
      id: "compressed-musicxml",
      support: "supported",
      isText: false,
    });
    expect(shouldReadTabFileAsText(format)).toBe(false);
    expect(unsupportedTabFormatMessage(format)).toMatch(/valid \.mxl ZIP container/i);
  });

  test.each([
    ["song.gp3", "GP3", "Guitar Pro 3 tablature"],
    ["song.gp4", "GP4", "Guitar Pro 4 tablature"],
    ["song.gp5", "GP5", "Guitar Pro 5 tablature"],
    ["song.gpx", "GP6", "Guitar Pro 6 tablature"],
    ["song.gp", "GP7_OR_GP8", "Guitar Pro 7 or 8 tablature"],
  ])("routes %s through the authorized Guitar Pro importer", (fileName, sourceFamily, label) => {
    const format = detectTabFileFormat(fileName);
    expect(format).toMatchObject({
      id: "guitar-pro-proof",
      support: "checkpoint-foundation",
      isText: false,
      sourceFamily,
      label,
    });
    expect(shouldReadTabFileAsText(format)).toBe(false);
    expect(unsupportedTabFormatMessage(format)).toMatch(/valid GP3, GP4, GP5, GP6 GPX/i);
  });

  test("routes accepted modern .pt2 through the bounded PowerTab v11 importer", () => {
    const format = detectTabFileFormat("score.pt2");
    expect(format).toMatchObject({
      id: "powertab-pt2",
      support: "supported",
      isText: false,
      sourceFamily: "PT2",
      label: "PowerTab 2 tablature",
    });
    expect(shouldReadTabFileAsText(format)).toBe(false);
    expect(unsupportedTabFormatMessage(format)).toMatch(/exact internal version 11/i);
  });

  test("routes legacy .ptb only into the provisional PowerTab 1.7 checkpoint", () => {
    const format = detectTabFileFormat("song.ptb");
    expect(format).toMatchObject({
      id: "powertab-legacy",
      support: "source-checkpoint-provisional",
      isText: false,
      sourceFamily: "PTB_V17",
      label: "PowerTab 1.7 tablature",
    });
    expect(shouldReadTabFileAsText(format)).toBe(false);
    expect(unsupportedTabFormatMessage(format)).toMatch(/exact PowerTab 1\.7 ptab-4/i);
  });

  test.each([
    ["song.gtp", "guitar-pro-2"],
    ["song.tg", "tuxguitar"],
    ["song.tef", "tabledit"],
  ])("recognizes %s as unsupported %s", (fileName, expectedId) => {
    const format = detectTabFileFormat(fileName);
    expect(format.id).toBe(expectedId);
    expect(format.support).toBe("planned");
    expect(shouldReadTabFileAsText(format)).toBe(false);
  });

  test("keeps unknown material distinct from known planned formats", () => {
    const format = detectTabFileFormat("mystery.bin");
    expect(format.id).toBe("unknown");
    expect(format.support).toBe("unknown");
  });
});

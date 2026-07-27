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

  test("keeps compressed MusicXML recognized but unsupported", () => {
    const format = detectTabFileFormat("score.mxl");
    expect(format).toMatchObject({
      id: "compressed-musicxml",
      support: "planned",
      isText: false,
    });
    expect(unsupportedTabFormatMessage(format)).toMatch(/does not yet import \.mxl/i);
  });

  test.each([
    ["song.gp5", "guitar-pro"],
    ["song.gpx", "guitar-pro"],
    ["song.gp", "guitar-pro"],
    ["song.ptb", "powertab"],
    ["song.pt2", "powertab"],
    ["song.tg", "tuxguitar"],
    ["song.tef", "tabledit"],
  ])("recognizes %s as %s", (fileName, expectedId) => {
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

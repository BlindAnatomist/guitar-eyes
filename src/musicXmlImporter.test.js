import fs from "fs";
import path from "path";
import { parseMusicXmlTablature, MusicXmlImportError } from "./musicXmlImporter";
import { describePlayablePosition } from "./positionDescription";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

function tuningXml() {
  return `
    <staff-details number="1">
      <staff-lines>6</staff-lines>
      <staff-tuning line="1"><tuning-step>E</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>
      <staff-tuning line="2"><tuning-step>A</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>
      <staff-tuning line="3"><tuning-step>D</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
      <staff-tuning line="4"><tuning-step>G</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
      <staff-tuning line="5"><tuning-step>B</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
      <staff-tuning line="6"><tuning-step>E</tuning-step><tuning-octave>4</tuning-octave></staff-tuning>
    </staff-details>`;
}

function noteXml({ string = 1, fret = 0, duration = 4, voice = 1, extra = "" } = {}) {
  return `<note>
    <pitch><step>E</step><octave>4</octave></pitch>
    <duration>${duration}</duration><voice>${voice}</voice><type>quarter</type>
    <notations><technical><string>${string}</string><fret>${fret}</fret>${extra}</technical></notations>
  </note>`;
}

function scoreXml({ body, attributes = null, secondPart = "" } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <score-partwise version="4.0">
    <part-list>
      <score-part id="P1"><part-name>Guitar</part-name></score-part>
      ${secondPart ? '<score-part id="P2"><part-name>Second guitar</part-name></score-part>' : ""}
    </part-list>
    <part id="P1">
      <measure number="1">
        <attributes><divisions>4</divisions>${attributes ?? tuningXml()}</attributes>
        ${body}
      </measure>
    </part>
    ${secondPart}
  </score-partwise>`;
}

describe("parseMusicXmlTablature", () => {
  test("imports the minimal MusicXML fixture into the accepted semantic document", () => {
    const document = parseMusicXmlTablature(
      fixture("musicxml-minimal-guitar-tab.musicxml")
    );

    expect(document).toMatchObject({
      type: "tablature-document",
      sourceFormat: "musicxml",
      title: "Guitar Eyes Format Specimen 05",
      instrument: "guitar",
      instrumentLabel: "six-string guitar",
      stringCount: 6,
      sourcePartId: "P1",
      sourcePartName: "Guitar",
    });
    expect(document.strings.map(({ tuning, octave }) => [tuning, octave])).toEqual([
      ["E", 4],
      ["B", 3],
      ["G", 3],
      ["D", 3],
      ["A", 2],
      ["E", 2],
    ]);
    expect(document.strings[0].spokenName).toBe("High E string");
    expect(document.strings[5].spokenName).toBe("Low E string");
    expect(document.positions).toHaveLength(4);
    expect(document.positions.map((position) => position.duration.name)).toEqual([
      "quarter note",
      "eighth note",
      "eighth note",
      "half note",
    ]);
    expect(document.positions.map((position) => position.duration.quarterNoteUnits)).toEqual([
      1,
      0.5,
      0.5,
      2,
    ]);
    expect(document.positions[0].strings[5]).toMatchObject({ type: "fret", fret: 3 });
    expect(document.positions[1].strings[4]).toMatchObject({ type: "open" });
    expect(document.positions[2].strings[4]).toMatchObject({ type: "fret", fret: 2 });
    expect(document.positions[3].strings[3]).toMatchObject({ type: "open" });
    expect(document.measures).toHaveLength(1);
    expect(document.measures[0]).toMatchObject({
      number: 1,
      sourceNumber: "1",
      totalInBlock: 1,
      durationComplete: true,
      totalQuarterNoteUnits: 4,
    });
    expect(document.blocks[0].sourceLayoutLabel).toBe(
      "Normalized MusicXML spatial layout"
    );
    expect(document.strings.every((string) => string.sourceLine.includes("|"))).toBe(
      true
    );
    expect(describePlayablePosition(document, 0)).toBe(
      "Measure 1 of 1. Position 1 of 4 in this measure. Duration, quarter note. Low E string, fret 3."
    );
  });

  test("imports chords, timed rests, measures, and supported technical notation", () => {
    const document = parseMusicXmlTablature(
      fixture("musicxml-chord-rest-two-measures.musicxml")
    );

    expect(document.positions).toHaveLength(6);
    expect(document.measures).toHaveLength(2);
    expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([
      4,
      4,
    ]);
    expect(document.positions[0].strings[0]).toMatchObject({ type: "open" });
    expect(document.positions[0].strings[1]).toMatchObject({ type: "fret", fret: 1 });
    expect(document.positions[1]).toMatchObject({
      isRest: true,
      measureNumber: 1,
      positionInMeasure: 2,
    });
    expect(describePlayablePosition(document, 1)).toBe(
      "Measure 1 of 2. Position 2 of 4 in this measure. Duration, quarter note. Rest."
    );
    expect(document.positions[3].strings[3]).toMatchObject({
      type: "fret",
      fret: 2,
      techniques: [expect.objectContaining({ name: "hammer-on" })],
    });
    expect(describePlayablePosition(document, 3)).toContain(
      "D string, fret 2, with hammer-on notation preserved but not yet interpreted."
    );
    expect(document.positions[4]).toMatchObject({
      measureNumber: 2,
      positionInMeasure: 1,
      positionsInMeasure: 2,
    });
    expect(document.strings[0].sourceLine).toMatch(/\|/);
  });

  test("rejects malformed XML and custom entity declarations", () => {
    expect(() => parseMusicXmlTablature("<score-partwise>")).toThrow(
      MusicXmlImportError
    );

    try {
      parseMusicXmlTablature("<score-partwise>");
    } catch (error) {
      expect(error.code).toBe("MALFORMED_MUSICXML");
    }

    expect(() =>
      parseMusicXmlTablature(
        '<!DOCTYPE score-partwise [<!ENTITY unsafe "value">]><score-partwise>&unsafe;</score-partwise>'
      )
    ).toThrow(/custom entity declarations/i);
  });

  test("rejects MusicXML without explicit tablature coordinates", () => {
    const source = scoreXml({
      body: `<note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>`,
    });

    expect(() => parseMusicXmlTablature(source)).toThrow(
      /No MusicXML part contains explicit tablature string and fret data/i
    );
  });

  test("rejects missing six-string tuning", () => {
    const source = scoreXml({
      attributes: "<staff-details><staff-lines>5</staff-lines></staff-details>",
      body: noteXml(),
    });

    try {
      parseMusicXmlTablature(source);
    } catch (error) {
      expect(error.code).toBe("MISSING_MUSICXML_GUITAR_TUNING");
    }
  });

  test("rejects more than one tablature part", () => {
    const secondPart = `<part id="P2"><measure number="1"><attributes><divisions>4</divisions>${tuningXml()}</attributes>${noteXml({ string: 2, fret: 1 })}</measure></part>`;
    const source = scoreXml({ body: noteXml(), secondPart });

    try {
      parseMusicXmlTablature(source);
    } catch (error) {
      expect(error.code).toBe("AMBIGUOUS_MUSICXML_TABLATURE_PART");
    }
  });

  test("rejects multi-voice timing and notes missing coordinates within a tab part", () => {
    const multiVoice = scoreXml({
      body: `${noteXml()}<backup><duration>4</duration></backup>${noteXml({ voice: 2 })}`,
    });
    const missingCoordinates = scoreXml({
      body: `${noteXml()}<note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>`,
    });

    try {
      parseMusicXmlTablature(multiVoice);
    } catch (error) {
      expect(error.code).toBe("UNSUPPORTED_MUSICXML_MULTIVOICE_TIMING");
    }

    try {
      parseMusicXmlTablature(missingCoordinates);
    } catch (error) {
      expect(error.code).toBe("MISSING_MUSICXML_TAB_COORDINATES");
    }
  });

  test("rejects out-of-range strings and duplicate strings at one chord onset", () => {
    const outOfRange = scoreXml({ body: noteXml({ string: 7 }) });
    const duplicate = scoreXml({
      body: `${noteXml({ string: 1, fret: 0 })}<note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>1</fret></technical></notations></note>`,
    });

    try {
      parseMusicXmlTablature(outOfRange);
    } catch (error) {
      expect(error.code).toBe("MUSICXML_STRING_OUT_OF_RANGE");
    }

    try {
      parseMusicXmlTablature(duplicate);
    } catch (error) {
      expect(error.code).toBe("DUPLICATE_MUSICXML_STRING_AT_ONSET");
    }
  });
});

import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { buildPositionSoundEvents } from "./positionSoundEvents";
import {
  buildMusicXmlReaderDocuments,
  buildReaderDocuments,
} from "./tabImportCoordinator";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

const guitarLines = [
  "e|--0--2--|",
  "B|--1--3--|",
  "G|--0--2--|",
  "D|--2--0--|",
  "A|--3-----|",
  "E|--------|",
];

const bassLines = [
  "G|--0--|",
  "D|--0--|",
  "A|--2--|",
  "E|--3--|",
];

describe("buildReaderDocuments", () => {
  test("uses one semantic guitar document for both reader projections", () => {
    const result = buildReaderDocuments(guitarLines.join("\n"), "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument).not.toBeNull();
    expect(result.semanticError).toBeNull();
    expect(result.desktopBlocks).toEqual([guitarLines]);
    expect(result.semanticDocument.positions.length).toBeGreaterThan(0);
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.instrumentWasDetected).toBe(false);
    expect(result.supportOutcome).toBe("supported");
    expect(result.sourceFormat).toBe("ascii-text");
  });

  test("uses one multi-block guitar document for both reader projections", () => {
    const source = ["Intro", ...guitarLines, "Verse", ...guitarLines].join("\n");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.blocks).toHaveLength(2);
    expect(result.desktopBlocks).toEqual([guitarLines, guitarLines]);
    expect(result.semanticError).toBeNull();
  });

  test("uses the shared semantic core for four-string bass", () => {
    const result = buildReaderDocuments(bassLines.join("\n"), "bass");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("bass");
    expect(result.semanticDocument.blocks).toHaveLength(1);
    expect(result.desktopBlocks).toEqual([bassLines]);
    expect(result.semanticError).toBeNull();
  });

  test("auto-detects bass when the interface still says guitar", () => {
    const result = buildReaderDocuments(bassLines.join("\n"), "guitar");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("bass");
    expect(result.desktopBlocks).toEqual([bassLines]);
    expect(result.requestedInstrument).toBe("guitar");
    expect(result.resolvedInstrument).toBe("bass");
    expect(result.instrumentWasDetected).toBe(true);
  });

  test("auto-detects guitar when the interface still says bass", () => {
    const result = buildReaderDocuments(guitarLines.join("\n"), "bass");

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("guitar");
    expect(result.desktopBlocks).toEqual([guitarLines]);
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.instrumentWasDetected).toBe(true);
  });

  test("does not misclassify two six-string guitar blocks as custom-tuned bass", () => {
    const source = ["Intro", ...guitarLines, "Verse", ...guitarLines].join("\n");
    const result = buildReaderDocuments(source, "bass");
    const description = describePlayablePosition(result.semanticDocument, 0);

    expect(result.desktopSource).toBe("semantic");
    expect(result.semanticDocument.instrument).toBe("guitar");
    expect(result.semanticDocument.blocks).toHaveLength(2);
    expect(result.desktopBlocks).toEqual([guitarLines, guitarLines]);
    expect(result.resolvedInstrument).toBe("guitar");
    expect(result.instrumentWasDetected).toBe(true);
    expect(description).toContain("High E string, open.");
    expect(description).not.toMatch(/String 1, tuned/i);
  });

  test("normalizes octave-qualified and Unicode accidental labels semantically", () => {
    const octaveResult = buildReaderDocuments(
      fixture("ascii-octave-qualified-standard.txt"),
      "guitar"
    );
    const unicodeResult = buildReaderDocuments(
      fixture("ascii-unicode-accidentals.txt"),
      "guitar"
    );

    expect(octaveResult).toMatchObject({
      desktopSource: "semantic",
      resolvedInstrument: "guitar",
      supportOutcome: "supported",
    });
    expect(octaveResult.semanticDocument.strings[0]).toMatchObject({
      tuning: "E",
      octave: 4,
      rawLabel: "E4",
    });
    expect(unicodeResult.desktopSource).toBe("semantic");
    expect(unicodeResult.semanticDocument.strings[0]).toMatchObject({
      tuning: "F#",
      octave: 4,
      rawLabel: "F♯4",
    });
    expect(unicodeResult.semanticDocument.warnings.join(" ")).toMatch(
      /custom six-string guitar tuning/i
    );
  });

  test.each([
    [
      "ascii-seven-string-guitar.txt",
      "guitar",
      "seven-string guitar",
      7,
      35,
    ],
    ["ascii-five-string-bass.txt", "bass", "five-string bass", 5, 23],
  ])(
    "imports exact extended-string ASCII from %s into both readers",
    (name, family, label, stringCount, lowBMidi) => {
      const result = buildReaderDocuments(fixture(name), family);
      const description = describePlayablePosition(result.semanticDocument, 0);
      const soundEvents = buildPositionSoundEvents(result.semanticDocument, 0);
      const lowB = soundEvents.events.find(
        (event) => event.stringIndex === stringCount - 1
      );

      expect(result).toMatchObject({
        desktopSource: "semantic",
        semanticError: null,
        requestedInstrument: family,
        resolvedInstrument: family,
        instrumentWasDetected: false,
        supportOutcome: "supported",
      });
      expect(result.semanticDocument).toMatchObject({
        instrument: family,
        instrumentLabel: label,
        stringCount,
      });
      expect(result.semanticDocument.strings).toHaveLength(stringCount);
      expect(result.desktopBlocks).toHaveLength(1);
      expect(result.desktopBlocks[0]).toHaveLength(stringCount);
      expect(description).toContain("Low B string, open.");
      expect(soundEvents).toMatchObject({
        isChord: true,
        pitchedEventCount: stringCount,
      });
      expect(lowB).toMatchObject({
        type: "pitched-string",
        fret: 0,
        midi: lowBMidi,
      });
    }
  );

  test.each([
    ["ascii-seven-string-guitar.txt", "bass", "guitar"],
    ["ascii-five-string-bass.txt", "guitar", "bass"],
  ])("auto-detects the extended family in %s", (name, selected, resolved) => {
    const result = buildReaderDocuments(fixture(name), selected);

    expect(result.desktopSource).toBe("semantic");
    expect(result.requestedInstrument).toBe(selected);
    expect(result.resolvedInstrument).toBe(resolved);
    expect(result.instrumentWasDetected).toBe(true);
  });

  test("rejects seven-string material without complete octave evidence", () => {
    const source = fixture("ascii-seven-string-guitar.txt").replace(
      /([A-G])\d(?=\|)/g,
      "$1"
    );
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("MISSING_TUNING_OCTAVES");
    expect(result.supportOutcome).toBe("unsafe-fallback");
  });

  test.each([
    "ascii-unsafe-octave-order.txt",
    "ascii-misordered-standard-labels.txt",
  ])("rejects unsafe tuning evidence in %s", (name) => {
    const result = buildReaderDocuments(fixture(name), "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("UNSAFE_TUNING_ORDER");
    expect(result.supportOutcome).toBe("unsafe-fallback");
  });

  test("retains the legacy desktop fallback when semantic parsing is unsafe", () => {
    const source = ["Title", ...guitarLines.slice(0, 5)].join("\n");
    const result = buildReaderDocuments(source, "guitar");

    expect(result.desktopSource).toBe("legacy-fallback");
    expect(result.semanticDocument).toBeNull();
    expect(result.semanticError.code).toBe("INCOMPLETE_TABLATURE_BLOCK");
    expect(result.desktopBlocks.length).toBeGreaterThan(0);
  });
});

describe("buildMusicXmlReaderDocuments", () => {
  test("projects one imported MusicXML document into both readers", () => {
    const result = buildMusicXmlReaderDocuments(
      fixture("musicxml-minimal-guitar-tab.musicxml")
    );

    expect(result).toMatchObject({
      desktopSource: "semantic",
      semanticError: null,
      requestedInstrument: "guitar",
      resolvedInstrument: "guitar",
      instrumentWasDetected: false,
      supportOutcome: "supported",
      sourceFormat: "musicxml",
      sourceFormatLabel: "MusicXML tablature",
    });
    expect(result.semanticDocument.sourceFormat).toBe("musicxml");
    expect(result.semanticDocument.positions).toHaveLength(4);
    expect(result.desktopBlocks).toHaveLength(1);
    expect(result.desktopBlocks[0]).toHaveLength(6);
    expect(result.desktopBlocks[0][0]).toMatch(/^E4\|/);
    expect(result.desktopBlocks[0][5]).toMatch(/^E2\|/);
    expect(describePlayablePosition(result.semanticDocument, 0)).toContain(
      "Low E string, fret 3."
    );
  });

  test("preserves MusicXML chords, rests, measures, and durations in one document", () => {
    const result = buildMusicXmlReaderDocuments(
      fixture("musicxml-chord-rest-two-measures.musicxml")
    );

    expect(result.semanticDocument.positions).toHaveLength(6);
    expect(result.semanticDocument.measures).toHaveLength(2);
    expect(result.semanticDocument.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([
      4,
      4,
    ]);
    expect(result.semanticDocument.positions[0].strings[0]).toMatchObject({ type: "open" });
    expect(result.semanticDocument.positions[0].strings[1]).toMatchObject({
      type: "fret",
      fret: 1,
    });
    expect(result.semanticDocument.positions[1].isRest).toBe(true);
    expect(describePlayablePosition(result.semanticDocument, 1)).toContain("Rest.");
  });
});

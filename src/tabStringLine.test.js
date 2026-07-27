import fs from "fs";
import path from "path";
import {
  analyzeTabRunsForProfile,
  ASCII_INSTRUMENT_PROFILES,
  classifyTabStringLine,
  collectTabStringLineRuns,
  containsPlayableAsciiNotation,
} from "./tabStringLine";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

describe("ASCII string-line analysis", () => {
  test("normalizes octave suffixes and Unicode accidentals without changing source", () => {
    expect(classifyTabStringLine(" F♯4|--2--|", 9)).toMatchObject({
      kind: "string-line",
      sourceLine: " F♯4|--2--|",
      lineNumber: 9,
      rawLabel: "F♯4",
      tuning: "F#",
      octave: 4,
      content: "--2--|",
    });

    expect(classifyTabStringLine("B♭2|--0--|")).toMatchObject({
      tuning: "Bb",
      octave: 2,
    });
  });

  test("separates complete string-line runs at headings and blank lines", () => {
    const source = [
      "Intro",
      "e|--0--|",
      "B|-----|",
      "G|-----|",
      "D|-----|",
      "A|-----|",
      "E|-----|",
      "",
      "Verse",
      "e|--3--|",
      "B|-----|",
      "G|-----|",
      "D|-----|",
      "A|-----|",
      "E|-----|",
    ].join("\n");

    const result = collectTabStringLineRuns(source);
    expect(result.runs.map((run) => run.length)).toEqual([6, 6]);
    expect(result.nonTabLineNumbers).toEqual([1, 9]);
  });

  test("accepts provable octave-qualified and Unicode custom tunings", () => {
    const standard = analyzeTabRunsForProfile(
      fixture("ascii-octave-qualified-standard.txt"),
      ASCII_INSTRUMENT_PROFILES.guitar
    );
    const unicode = analyzeTabRunsForProfile(
      fixture("ascii-unicode-accidentals.txt"),
      ASCII_INSTRUMENT_PROFILES.guitar
    );

    expect(standard).toMatchObject({ valid: true, confidence: 110 });
    expect(standard.blocks).toHaveLength(1);
    expect(unicode.valid).toBe(true);
    expect(unicode.blocks[0].map((entry) => entry.tuning)).toEqual([
      "F#",
      "C#",
      "A",
      "E",
      "B",
      "F#",
    ]);
    expect(unicode.warnings.join(" ")).toMatch(/custom six-string guitar tuning/i);
  });

  test("rejects duplicate octave pitches and misordered standard labels", () => {
    const duplicate = analyzeTabRunsForProfile(
      fixture("ascii-unsafe-octave-order.txt"),
      ASCII_INSTRUMENT_PROFILES.guitar
    );
    const misordered = analyzeTabRunsForProfile(
      fixture("ascii-misordered-standard-labels.txt"),
      ASCII_INSTRUMENT_PROFILES.guitar
    );

    expect(duplicate).toMatchObject({
      valid: false,
      code: "UNSAFE_TUNING_ORDER",
    });
    expect(misordered).toMatchObject({
      valid: false,
      code: "UNSAFE_TUNING_ORDER",
    });
  });

  test("keeps five- and seven-string runs distinct from supported profiles", () => {
    const sevenAsGuitar = analyzeTabRunsForProfile(
      fixture("ascii-seven-string-guitar.txt"),
      ASCII_INSTRUMENT_PROFILES.guitar
    );
    const fiveAsBass = analyzeTabRunsForProfile(
      fixture("ascii-five-string-bass.txt"),
      ASCII_INSTRUMENT_PROFILES.bass
    );

    expect(sevenAsGuitar).toMatchObject({
      valid: false,
      code: "INCOMPLETE_TABLATURE_BLOCK",
    });
    expect(fiveAsBass).toMatchObject({
      valid: false,
      code: "INCOMPLETE_TABLATURE_BLOCK",
    });
  });

  test("distinguishes visually similar pipe-delimited text from playable notation", () => {
    const source = fixture("ascii-pipe-delimited-nontab.txt");
    const collected = collectTabStringLineRuns(source);

    expect(collected.runs).toHaveLength(1);
    expect(
      collected.runs[0].some((entry) => containsPlayableAsciiNotation(entry.content))
    ).toBe(false);
  });
});

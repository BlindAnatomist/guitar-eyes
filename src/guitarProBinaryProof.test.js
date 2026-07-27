import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import * as alphaTab from "@coderline/alphatab";
import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";
import { describePlayablePosition } from "./positionDescription";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name)
  );
}

beforeAll(() => {
  if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder;
  }
  if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder;
  }
});

describe("project-authored Guitar Pro 7 binary proof", () => {
  test("decodes and normalizes the generated GP7 fixture through alphaTab", () => {
    const bytes = fixture("guitar-pro-7-proof.gp");
    const settings = new alphaTab.Settings();
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      new Uint8Array(bytes),
      settings
    );
    const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
      sourceVersion: "GP7",
    });
    const document = normalizeGuitarProIntermediate(intermediate);

    expect(score.title).toBe("Guitar Eyes GP7 Proof");
    expect(document).toMatchObject({
      sourceFormat: "guitar-pro-7",
      sourceVersion: "GP7",
      instrument: "guitar",
      stringCount: 6,
      sourceTrackName: "Proof Guitar",
    });
    expect(document.positions).toHaveLength(6);
    expect(document.measures).toHaveLength(2);
    expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([
      4,
      4,
    ]);

    expect(document.positions[0].strings[0]).toMatchObject({ type: "open" });
    expect(document.positions[0].strings[1]).toMatchObject({ type: "fret", fret: 1 });
    expect(document.positions[1].isRest).toBe(true);
    expect(document.positions[2].strings[2]).toMatchObject({ type: "open" });
    expect(document.positions[3].strings[3]).toMatchObject({ type: "fret", fret: 2 });
    expect(document.positions[4].strings[4]).toMatchObject({ type: "open" });
    expect(document.positions[5].strings[5]).toMatchObject({ type: "fret", fret: 3 });

    expect(describePlayablePosition(document, 0)).toBe(
      "Measure 1 of 2. Position 1 of 4 in this measure. Duration, quarter note. B string, fret 1. High E string, open."
    );
    expect(describePlayablePosition(document, 1)).toBe(
      "Measure 1 of 2. Position 2 of 4 in this measure. Duration, quarter note. Rest."
    );
    expect(describePlayablePosition(document, 5)).toBe(
      "Measure 2 of 2. Position 2 of 2 in this measure. Duration, half note. Low E string, fret 3."
    );
  });
});

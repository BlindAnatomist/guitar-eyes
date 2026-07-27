import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import { inflateRawSync } from "zlib";
import * as alphaTab from "@coderline/alphatab";
import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";
import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";
import { describePlayablePosition } from "./positionDescription";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name)
  );
}

async function inflateRaw(bytes) {
  return new Uint8Array(inflateRawSync(Buffer.from(bytes)));
}

beforeAll(() => {
  if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder;
  }
  if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder;
  }
});

describe("project-authored Guitar Pro shared-archive binary proof", () => {
  test("decodes and normalizes the generated GP8-semantic shared archive through alphaTab", async () => {
    const bytes = fixture("guitar-pro-shared-archive-proof.gp");
    const versionEvidence = await inspectGuitarProArchiveVersion(
      new Uint8Array(bytes),
      { inflateRaw }
    );
    const settings = new alphaTab.Settings();
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
      new Uint8Array(bytes),
      settings
    );
    const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
      versionEvidence,
    });
    const document = normalizeGuitarProIntermediate(intermediate);

    expect(score.title).toBe("Guitar Eyes Shared Archive Proof");
    expect(document).toMatchObject({
      sourceFormat: "guitar-pro-archive",
      sourceVersion: "GP8",
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

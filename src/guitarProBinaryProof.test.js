import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import { inflateRawSync } from "zlib";
import * as alphaTab from "@coderline/alphatab";
import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";
import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";
import { buildGuitarProArchiveProofReaderDocuments } from "./guitarProReaderDocuments";
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
test("drives inventory and explicit bass selection from project-authored multi-track bytes", async () => {
  const bytes = fixture("guitar-pro-multi-track-proof.gp");
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
  const file = {
    name: "guitar-pro-multi-track-proof.gp",
    size: bytes.byteLength,
  };
  const decode = jest.fn();

  const selectionRequest = await buildGuitarProArchiveProofReaderDocuments(file, {
    intermediate,
    decode,
  });

  expect(decode).not.toHaveBeenCalled();
  expect(score.tracks.map((track) => track.name)).toEqual([
    "Proof Guitar",
    "Proof Bass",
  ]);
  expect(selectionRequest).toMatchObject({
    requiresTrackSelection: true,
    supportOutcome: "track-selection-required",
    guitarProIntermediate: intermediate,
  });
  expect(
    selectionRequest.trackInventory.supportedItems.map((item) => ({
      name: item.trackName,
      strings: item.stringCount,
      measures: item.measureCount,
    }))
  ).toEqual([
    { name: "Proof Guitar", strings: 6, measures: 2 },
    { name: "Proof Bass", strings: 4, measures: 2 },
  ]);

  const selected = await buildGuitarProArchiveProofReaderDocuments(file, {
    intermediate,
    selection: { trackIndex: 1, staffIndex: 0 },
    decode,
  });

  expect(decode).not.toHaveBeenCalled();
  expect(selected.requiresTrackSelection).toBe(false);
  expect(selected.semanticDocument).toMatchObject({
    sourceTrackIndex: 1,
    sourceStaffIndex: 0,
    sourceTrackName: "Proof Bass",
    instrument: "bass",
    stringCount: 4,
  });
  expect(selected.semanticDocument.positions).toHaveLength(6);
  expect(describePlayablePosition(selected.semanticDocument, 0)).toContain(
    "E string, fret 3."
  );
});

});

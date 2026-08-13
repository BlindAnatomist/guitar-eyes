import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";

function intermediate() {
  return decodePowerTabV11Document(
    JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "fixtures",
          "powertab-v11",
          "powertab-v11-original-six-position.source.json"
        ),
        "utf8"
      )
    )
  );
}

function bassIntermediate() {
  const value = intermediate();
  value.tracks[0].name = "Proof Bass";
  value.tracks[0].shortName = "Proof Bass";
  value.tracks[0].staves[0].tuningMidiHighToLow = [43, 38, 33, 28];
  const remap = new Map([
    [1, 1],
    [2, 2],
    [3, 3],
    [5, 3],
    [6, 4],
  ]);
  value.tracks[0].staves[0].bars.forEach((bar) => {
    bar.voices.forEach((voice) => {
      voice.beats.forEach((beat) => {
        beat.notes.forEach((note) => {
          note.stringNumberLowToHigh = remap.get(note.stringNumberLowToHigh);
        });
      });
    });
  });
  return value;
}

describe("PowerTab v11 semantic normalization", () => {
  test("uses the accepted semantic document for both readers", () => {
    const document = normalizeVerifiedPowerTabIntermediate(intermediate());

    expect(document).toMatchObject({
      type: "tablature-document",
      sourceFormat: "powertab-pt2",
      sourceVersion: "PT2_V11",
      title: "Guitar Eyes PowerTab v11 Proof",
      instrument: "guitar",
      instrumentLabel: "six-string guitar",
      stringCount: 6,
      sourceTrackName: "Proof Guitar",
    });
    expect(document.positions).toHaveLength(6);
    expect(document.measures).toHaveLength(2);
    expect(document.positions[0].strings[5]).toMatchObject({
      type: "fret",
      fret: 3,
    });
    expect(document.positions[1].strings[4]).toMatchObject({ type: "open" });
    expect(document.positions[2].strings[4]).toMatchObject({
      type: "fret",
      fret: 2,
    });
    expect(document.positions[3].strings[3]).toMatchObject({ type: "open" });
    expect(document.positions[4].isRest).toBe(true);
    expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
    expect(document.positions[5].strings[1]).toMatchObject({
      type: "fret",
      fret: 1,
    });
    expect(document.positions[3].strings[3].techniques).toEqual([
      expect.objectContaining({ name: "palm mute", source: "powertab-pt2" }),
    ]);
    expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([
      4, 4,
    ]);
    expect(document.blocks[0].sourceLayoutLabel).toBe(
      "Normalized PowerTab spatial layout"
    );
    expect(describePlayablePosition(document, 4)).toContain("Rest.");
    expect(describePlayablePosition(document, 5)).toContain(
      "High E string, open."
    );
    expect(describePlayablePosition(document, 5)).toContain(
      "B string, fret 1."
    );
  });

  test("accepts exact standard four-string bass through inventory and semantics", () => {
    const value = bassIntermediate();
    const inventory = buildPowerTabTrackInventory(value);
    const document = normalizeVerifiedPowerTabIntermediate(value);

    expect(inventory).toMatchObject({
      supportedCount: 1,
      requiresSelection: false,
      autoSelection: { trackIndex: 0, staffIndex: 0 },
    });
    expect(inventory.supportedItems[0]).toMatchObject({
      instrument: "bass",
      instrumentLabel: "four-string bass",
      tuningMidiHighToLow: [43, 38, 33, 28],
      tuningLabel: "G2, D2, A1, E1",
      supported: true,
    });
    expect(document).toMatchObject({
      type: "tablature-document",
      sourceFormat: "powertab-pt2",
      sourceVersion: "PT2_V11",
      instrument: "bass",
      instrumentLabel: "four-string bass",
      stringCount: 4,
      strings: [
        { shortName: "G" },
        { shortName: "D" },
        { shortName: "A" },
        { shortName: "E" },
      ],
      sourceTrackName: "Proof Bass",
    });
    expect(document.positions).toHaveLength(6);
    expect(document.measures).toHaveLength(2);
    expect(document.positions[4].isRest).toBe(true);
    expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
    expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 1 });
  });

  test("preserves exact v11 evidence rather than compatibility metadata", () => {
    const document = normalizeVerifiedPowerTabIntermediate(intermediate());

    expect(document.versionEvidence).toMatchObject({
      containerFamily: "POWERTAB_PT2_GZIP_JSON",
      internalVersion: 11,
      upstreamRelease: "2.0.22",
    });
    expect(JSON.stringify(document)).not.toMatch(/guitar-pro/iu);
  });

  test("does not rewrite user-authored titles or player names", () => {
    const value = intermediate();
    value.title = "Guitar Pro comparison study";
    value.tracks[0].name = "Guitar Pro named player";
    value.tracks[0].shortName = "Guitar Pro named player";

    const document = normalizeVerifiedPowerTabIntermediate(value);

    expect(document.title).toBe("Guitar Pro comparison study");
    expect(document.sourceTrackName).toBe("Guitar Pro named player");
    expect(document.sourceFormat).toBe("powertab-pt2");
  });

  test("rejects contradictory declared player evidence", () => {
    const value = intermediate();
    value.versionEvidence = {
      ...value.versionEvidence,
      declaredPlayerCount: 2,
    };

    expect(() => normalizeVerifiedPowerTabIntermediate(value)).toThrow(
      /source evidence is missing, unsupported, or contradictory/i
    );
  });
});

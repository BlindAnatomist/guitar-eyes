import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { decodePowerTabLegacyV17Bytes } from "./powerTabLegacyV17Decoder";
import { normalizeVerifiedPowerTabLegacyIntermediate } from "./powerTabLegacySourceNormalizer";

function intermediate() {
  return decodePowerTabLegacyV17Bytes(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-ptb-v17",
        "powertab-v17-original-six-position.ptb"
      )
    )
  );
}

describe("legacy PowerTab v1.7 semantic normalization", () => {
  test("normalizes the two-measure fixture through the shared semantic document", () => {
    const document = normalizeVerifiedPowerTabLegacyIntermediate(intermediate());

    expect(document).toMatchObject({
      type: "tablature-document",
      sourceFormat: "powertab-legacy",
      sourceVersion: "PTB_V17",
      title: "Guitar Eyes PTB 1.7 Proof",
      instrument: "guitar",
      instrumentLabel: "six-string guitar",
      stringCount: 6,
      sourceTrackName: "Proof Guitar",
    });
    expect(document.positions).toHaveLength(6);
    expect(document.measures).toHaveLength(2);
    expect(
      document.measures.map((measure) => measure.totalQuarterNoteUnits)
    ).toEqual([4, 4]);
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
    expect(document.blocks[0].sourceLayoutLabel).toBe(
      "Normalized legacy PowerTab spatial layout"
    );
    expect(describePlayablePosition(document, 4)).toContain("Rest.");
    expect(describePlayablePosition(document, 5)).toContain(
      "High E string, open."
    );
    expect(describePlayablePosition(document, 5)).toContain(
      "B string, fret 1."
    );
  });

  test("preserves exact legacy evidence without leaking Guitar Pro compatibility metadata", () => {
    const document = normalizeVerifiedPowerTabLegacyIntermediate(intermediate());

    expect(document.versionEvidence).toMatchObject({
      containerFamily: "POWERTAB_LEGACY_MFC_BINARY",
      marker: "ptab",
      fileVersion: 4,
      powerTabVersion: "1.7",
      independentSignature: "ptab-4",
    });
    expect(JSON.stringify(document)).not.toMatch(/guitar-pro/iu);
  });

  test("rejects contradictory decoded measure evidence", () => {
    const value = intermediate();
    value.versionEvidence = {
      ...value.versionEvidence,
      decodedMeasureCount: 3,
    };

    expect(() => normalizeVerifiedPowerTabLegacyIntermediate(value)).toThrow(
      /measure count contradicts/i
    );
  });
});

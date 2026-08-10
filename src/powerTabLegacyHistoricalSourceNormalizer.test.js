import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { decodePowerTabLegacyHistoricalBytes } from "./powerTabLegacyHistoricalDecoder";
import { normalizeVerifiedPowerTabLegacyHistoricalIntermediate } from "./powerTabLegacyHistoricalSourceNormalizer";

const FIXTURES = [
  ["powertab-v10-original-six-position.ptb", "PTB_V10", 1, "1.0"],
  ["powertab-v102-original-six-position.ptb", "PTB_V102", 2, "1.0.2"],
  ["powertab-v15-original-six-position.ptb", "PTB_V15", 3, "1.5"],
];

function intermediate(filename) {
  return decodePowerTabLegacyHistoricalBytes(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-ptb-historical",
        filename
      )
    )
  );
}

describe("historical PowerTab semantic normalization", () => {
  test.each(FIXTURES)(
    "normalizes %s through the shared semantic document",
    (filename, sourceVersion, fileVersion, powerTabVersion) => {
      const document = normalizeVerifiedPowerTabLegacyHistoricalIntermediate(
        intermediate(filename)
      );
      expect(document).toMatchObject({
        type: "tablature-document",
        sourceFormat: "powertab-legacy",
        sourceVersion,
        title: "Guitar Eyes Historical PTB Proof",
        instrument: "guitar",
        instrumentLabel: "six-string guitar",
        stringCount: 6,
        sourceTrackName: "Proof Guitar",
        versionEvidence: {
          fileVersion,
          powerTabVersion,
          independentParserParity: false,
        },
      });
      expect(document.positions).toHaveLength(6);
      expect(document.measures).toHaveLength(2);
      expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([4, 4]);
      expect(document.positions[0].strings[5]).toMatchObject({ type: "fret", fret: 3 });
      expect(document.positions[4].isRest).toBe(true);
      expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
      expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 1 });
      expect(document.blocks[0].sourceLayoutLabel).toBe(
        "Normalized legacy PowerTab spatial layout"
      );
      expect(describePlayablePosition(document, 4)).toContain("Rest.");
    }
  );

  test("rejects contradictory historical version evidence", () => {
    const value = intermediate(FIXTURES[0][0]);
    value.versionEvidence = {
      ...value.versionEvidence,
      fileVersion: 2,
    };
    expect(() =>
      normalizeVerifiedPowerTabLegacyHistoricalIntermediate(value)
    ).toThrow(/missing, unsupported, or contradictory/i);
  });
});

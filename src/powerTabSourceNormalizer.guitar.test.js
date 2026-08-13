import fs from "fs";
import path from "path";
import { describePlayablePosition } from "./positionDescription";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";

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

test("PowerTab v11 uses the accepted semantic document for both readers", () => {
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
  expect(document.positions[0].strings[5]).toMatchObject({ type: "fret", fret: 3 });
  expect(document.positions[1].strings[4]).toMatchObject({ type: "open" });
  expect(document.positions[2].strings[4]).toMatchObject({ type: "fret", fret: 2 });
  expect(document.positions[3].strings[3]).toMatchObject({ type: "open" });
  expect(document.positions[4].isRest).toBe(true);
  expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
  expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 1 });
  expect(document.positions[3].strings[3].techniques).toEqual([
    expect.objectContaining({ name: "palm mute", source: "powertab-pt2" }),
  ]);
  expect(document.measures.map((measure) => measure.totalQuarterNoteUnits)).toEqual([4, 4]);
  expect(document.blocks[0].sourceLayoutLabel).toBe("Normalized PowerTab spatial layout");
  expect(describePlayablePosition(document, 4)).toContain("Rest.");
  expect(describePlayablePosition(document, 5)).toContain("High E string, open.");
  expect(describePlayablePosition(document, 5)).toContain("B string, fret 1.");
});

import fs from "fs";
import path from "path";
import { decodePowerTabLegacyBytes } from "./powerTabLegacyDecoder";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";
import { normalizeVerifiedPowerTabLegacyFamilyIntermediate } from "./powerTabLegacyFamilySourceNormalizer";

const dir = process.env.POWERTAB_BASS_GENERATED_DIR;
const boundedTest = dir ? test : test.skip;
const cases = [
  ["powertab-v10-standard-bass.ptb", "PTB_V10", 1],
  ["powertab-v102-standard-bass.ptb", "PTB_V102", 2],
  ["powertab-v15-standard-bass.ptb", "PTB_V15", 3],
  ["powertab-v17-standard-bass.ptb", "PTB_V17", 4],
];

cases.forEach(([filename, sourceVersion, fileVersion]) => {
  boundedTest(`${filename} decodes as standard bass`, () => {
    const bytes = fs.readFileSync(path.join(dir, filename));
    const intermediate = decodePowerTabLegacyBytes(bytes);
    expect(intermediate).toMatchObject({
      sourceVersion,
      versionEvidence: {
        fileVersion,
        instrumentProfile: "standard-four-string-bass",
        decodedTrackCount: 1,
        decodedMeasureCount: 2,
      },
    });
    expect(intermediate.tracks[0].staves[0].tuningMidiHighToLow).toEqual([43, 38, 33, 28]);
    const inventory = buildPowerTabTrackInventory(intermediate);
    expect(inventory.supportedItems[0].instrument).toBe("bass");
    const document = normalizeVerifiedPowerTabLegacyFamilyIntermediate(intermediate);
    expect(document).toMatchObject({ instrument: "bass", instrumentLabel: "four-string bass", stringCount: 4 });
    expect(document.positions).toHaveLength(6);
    expect(document.measures).toHaveLength(2);
    expect(document.positions[4].isRest).toBe(true);
    expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
    expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 1 });
  });
});

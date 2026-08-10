import fs from "fs";
import path from "path";
import { decodePowerTabLegacyV17Bytes } from "./powerTabLegacyV17Decoder";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";

function decoded() {
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

function decodedLegacy() {
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

describe("PowerTab player inventory", () => {
  test("auto-selects exactly one supported player", () => {
    const inventory = buildPowerTabTrackInventory(decoded());

    expect(inventory).toMatchObject({
      supportedCount: 1,
      requiresSelection: false,
      autoSelection: { trackIndex: 0, staffIndex: 0 },
      selectorLabels: {
        heading: "Choose a PowerTab player",
        loadAction: "Load selected player",
      },
    });
    expect(inventory.supportedItems[0].selectionLabel).toMatch(
      /Proof Guitar\. six-string guitar\. Tuning high to low: E4, B3, G3, D3, A2, E2\. 2 measures\./u
    );
  });

  test("uses the same inventory contract for verified legacy PowerTab v1.7", () => {
    const inventory = buildPowerTabTrackInventory(decodedLegacy());

    expect(inventory).toMatchObject({
      sourceVersion: "PTB_V17",
      supportedCount: 1,
      requiresSelection: false,
      autoSelection: { trackIndex: 0, staffIndex: 0 },
    });
    expect(inventory.supportedItems[0].selectionLabel).toMatch(
      /Proof Guitar\. six-string guitar\. Tuning high to low: E4, B3, G3, D3, A2, E2\. 2 measures\./u
    );
  });

  test("requires explicit selection when two supported players are present", () => {
    const value = decoded();
    value.tracks.push({
      ...value.tracks[0],
      name: "Second Guitar",
      shortName: "Second Guitar",
      staves: value.tracks[0].staves.map((staff) => ({
        ...staff,
        bars: staff.bars.map((bar) => ({ ...bar })),
      })),
    });
    value.versionEvidence = {
      ...value.versionEvidence,
      declaredPlayerCount: 2,
      decodedTrackCount: 2,
    };

    const inventory = buildPowerTabTrackInventory(value);
    expect(inventory.supportedCount).toBe(2);
    expect(inventory.requiresSelection).toBe(true);
    expect(inventory.autoSelection).toBeNull();
  });

  test("keeps four-string material outside the first fixture-proven profile", () => {
    const value = decoded();
    value.tracks[0].staves[0].tuningMidiHighToLow = [43, 38, 33, 28];

    const inventory = buildPowerTabTrackInventory(value);

    expect(inventory.supportedCount).toBe(0);
    expect(inventory.items[0]).toMatchObject({
      supported: false,
      reasonCode: "UNSUPPORTED_STRING_COUNT",
    });
    expect(inventory.items[0].reason).toMatch(/fixture-proven six-string guitar/i);
  });
});

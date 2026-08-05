import fs from "fs";
import path from "path";
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
});

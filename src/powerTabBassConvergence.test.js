import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";

function onePlayer(sourceVersion, internalVersion) {
  return {
    schemaVersion: 1,
    sourceVersion,
    title: "Convergence proof",
    versionEvidence: {
      internalVersion,
      decodedTrackCount: 1,
    },
    tracks: [
      {
        name: "Proof Bass",
        shortName: "Proof Bass",
        isPercussion: false,
        staves: [
          {
            tuningMidiHighToLow: [43, 38, 33, 28],
            bars: [
              {
                voices: [
                  {
                    beats: [
                      { notes: [{ stringNumberLowToHigh: 1 }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("PowerTab bass convergence boundary", () => {
  test("keeps historical pt2 versions 1 through 10 outside the unproved bass profile", () => {
    const inventory = buildPowerTabTrackInventory(onePlayer("PT2_V1", 1));

    expect(inventory.supportedCount).toBe(0);
    expect(inventory.items[0]).toMatchObject({
      supported: false,
      instrument: null,
      reasonCode: "UNSUPPORTED_PROFILE",
    });
  });

  test("retains the accepted standard-bass profile for pt2 v11", () => {
    const inventory = buildPowerTabTrackInventory(onePlayer("PT2_V11", 11));

    expect(inventory.supportedCount).toBe(1);
    expect(inventory.supportedItems[0]).toMatchObject({
      instrument: "bass",
      instrumentLabel: "four-string bass",
      tuningMidiHighToLow: [43, 38, 33, 28],
    });
  });
});

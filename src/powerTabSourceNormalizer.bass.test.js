import { makePowerTabBassIntermediate } from "./powerTabBassTestFixture";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";

test("PowerTab v11 standard bass uses the shared string contract", () => {
  const value = makePowerTabBassIntermediate();
  const inventory = buildPowerTabTrackInventory(value);
  const document = normalizeVerifiedPowerTabIntermediate(value);
  expect(inventory.supportedItems[0]).toMatchObject({
    instrument: "bass",
    instrumentLabel: "four-string bass",
    tuningMidiHighToLow: [43, 38, 33, 28],
    tuningLabel: "G2, D2, A1, E1",
    supported: true,
  });
  expect(document).toMatchObject({
    sourceFormat: "powertab-pt2",
    sourceVersion: "PT2_V11",
    instrument: "bass",
    instrumentLabel: "four-string bass",
    stringCount: 4,
    sourceTrackName: "Proof Bass",
  });
  expect(document.strings.map((string) => string.shortName)).toEqual(["G", "D", "A", "E"]);
  expect(document.positions).toHaveLength(6);
  expect(document.measures).toHaveLength(2);
  expect(document.positions[4].isRest).toBe(true);
  expect(document.positions[5].strings[0]).toMatchObject({ type: "open" });
  expect(document.positions[5].strings[1]).toMatchObject({ type: "fret", fret: 1 });
});

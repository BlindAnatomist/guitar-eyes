import { makePowerTabBassIntermediate } from "./powerTabBassTestFixture";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";

test("PowerTab preserves user-authored titles and player names", () => {
  const value = makePowerTabBassIntermediate();
  value.title = "Guitar Pro comparison study";
  value.tracks[0].name = "Guitar Pro named player";
  value.tracks[0].shortName = "Guitar Pro named player";
  const document = normalizeVerifiedPowerTabIntermediate(value);
  expect(document.title).toBe("Guitar Pro comparison study");
  expect(document.sourceTrackName).toBe("Guitar Pro named player");
  expect(document.sourceFormat).toBe("powertab-pt2");
});

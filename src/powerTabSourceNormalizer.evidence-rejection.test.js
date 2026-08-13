import { makePowerTabBassIntermediate } from "./powerTabBassTestFixture";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";

test("PowerTab rejects contradictory declared player evidence", () => {
  const value = makePowerTabBassIntermediate();
  value.versionEvidence = { ...value.versionEvidence, declaredPlayerCount: 2 };
  expect(() => normalizeVerifiedPowerTabIntermediate(value)).toThrow(
    /source evidence is missing, unsupported, or contradictory/i
  );
});

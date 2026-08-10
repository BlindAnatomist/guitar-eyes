import { PowerTabImportError } from "./powerTabErrors";
import { normalizeVerifiedPowerTabLegacyHistoricalIntermediate } from "./powerTabLegacyHistoricalSourceNormalizer";
import { normalizeVerifiedPowerTabLegacyIntermediate } from "./powerTabLegacySourceNormalizer";

const HISTORICAL = new Set(["PTB_V10", "PTB_V102", "PTB_V15"]);

export function normalizeVerifiedPowerTabLegacyFamilyIntermediate(
  intermediate,
  options = {}
) {
  if (intermediate?.sourceVersion === "PTB_V17") {
    return normalizeVerifiedPowerTabLegacyIntermediate(intermediate, options);
  }
  if (HISTORICAL.has(intermediate?.sourceVersion)) {
    return normalizeVerifiedPowerTabLegacyHistoricalIntermediate(
      intermediate,
      options
    );
  }
  throw new PowerTabImportError(
    "The legacy PowerTab source version is not recognized by the bounded family normalizer.",
    "INVALID_POWERTAB_LEGACY_VERSION_EVIDENCE"
  );
}

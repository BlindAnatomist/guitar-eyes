import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";
import { PowerTabImportError } from "./powerTabErrors";

const LEGACY_SOURCE_FORMAT = "powertab-legacy";
const LEGACY_SOURCE_VERSION = "PTB_V17";
const UPSTREAM_RELEASE = "2.0.22";
const UPSTREAM_COMMIT = "13cab27c7127d301f2747671071e53eb203dc940";

function validateLegacyEvidence(intermediate) {
  const evidence = intermediate?.versionEvidence;
  if (
    !intermediate ||
    intermediate.schemaVersion !== 1 ||
    intermediate.sourceVersion !== LEGACY_SOURCE_VERSION ||
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.containerFamily !== "POWERTAB_LEGACY_MFC_BINARY" ||
    evidence.extensionFamily !== ".ptb" ||
    evidence.serialization !== "mfc-binary" ||
    evidence.marker !== "ptab" ||
    evidence.fileVersion !== 4 ||
    evidence.powerTabVersion !== "1.7" ||
    evidence.upstreamRelease !== UPSTREAM_RELEASE ||
    evidence.upstreamCommit !== UPSTREAM_COMMIT ||
    evidence.independentSignature !== "ptab-4" ||
    evidence.decodedTrackCount !== intermediate.tracks?.length
  ) {
    throw new PowerTabImportError(
      "The legacy PowerTab 1.7 source evidence is missing, unsupported, or contradictory.",
      "INVALID_POWERTAB_LEGACY_VERSION_EVIDENCE"
    );
  }

  const decodedMeasures = intermediate.tracks.reduce(
    (total, track) =>
      total +
      (Array.isArray(track?.staves)
        ? track.staves.reduce(
            (staffTotal, staff) =>
              staffTotal + (Array.isArray(staff?.bars) ? staff.bars.length : 0),
            0
          )
        : 0),
    0
  );
  if (evidence.decodedMeasureCount !== decodedMeasures) {
    throw new PowerTabImportError(
      "The legacy PowerTab measure count contradicts the decoded source evidence.",
      "POWERTAB_LEGACY_MEASURE_COUNT_MISMATCH"
    );
  }
  return evidence;
}

function compatibilityIntermediate(intermediate) {
  return {
    ...intermediate,
    sourceVersion: "GP8",
    versionEvidence: {
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      rootVersion: "7.0",
      gpVersion: "8.0.0",
      encodingDescription: "GP8",
      sourceVersion: "GP8",
      entryCount: 1,
      declaredTrackCount: intermediate.tracks.length,
    },
  };
}

function restoreLegacyMetadata(value, versionEvidence) {
  if (Array.isArray(value)) {
    return value.map((item) => restoreLegacyMetadata(item, versionEvidence));
  }
  if (!value || typeof value !== "object") return value;

  const restored = {};
  Object.entries(value).forEach(([key, item]) => {
    if (key === "versionEvidence") {
      restored[key] = versionEvidence;
      return;
    }
    if (key === "sourceVersion") {
      restored[key] = LEGACY_SOURCE_VERSION;
      return;
    }
    if (
      ["source", "sourceFormat", "format"].includes(key) &&
      item === "guitar-pro-archive"
    ) {
      restored[key] = LEGACY_SOURCE_FORMAT;
      return;
    }
    if (
      key === "id" &&
      typeof item === "string" &&
      item.startsWith("guitar-pro-")
    ) {
      restored[key] = `powertab-legacy-${item.slice("guitar-pro-".length)}`;
      return;
    }
    if (
      key === "sourceLayoutLabel" &&
      item === "Normalized Guitar Pro spatial layout"
    ) {
      restored[key] = "Normalized legacy PowerTab spatial layout";
      return;
    }
    if (key === "warnings" && Array.isArray(item)) {
      restored[key] = item.map((warning) =>
        typeof warning === "string"
          ? warning.replaceAll("Guitar Pro", "PowerTab 1.7")
          : warning
      );
      return;
    }
    restored[key] = restoreLegacyMetadata(item, versionEvidence);
  });
  return restored;
}

export function normalizeVerifiedPowerTabLegacyIntermediate(
  intermediate,
  options = {}
) {
  const versionEvidence = validateLegacyEvidence(intermediate);
  try {
    const normalized = normalizeGuitarProIntermediate(
      compatibilityIntermediate(intermediate),
      options
    );
    return restoreLegacyMetadata(normalized, versionEvidence);
  } catch (error) {
    if (error instanceof PowerTabImportError) throw error;
    if (error instanceof GuitarProImportError) {
      throw new PowerTabImportError(
        error.message.replaceAll("Guitar Pro", "PowerTab 1.7"),
        String(error.code || "POWERTAB_LEGACY_NORMALIZATION_ERROR").replaceAll(
          "GUITAR_PRO",
          "POWERTAB_LEGACY"
        )
      );
    }
    throw error;
  }
}

import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";
import { PowerTabImportError } from "./powerTabErrors";

const PT2_SOURCE_VERSION = "PT2_V11";

function fail(message, code = "INVALID_POWERTAB_VERSION_EVIDENCE") {
  throw new PowerTabImportError(message, code);
}

function validatePowerTabSourceEvidence(intermediate) {
  const evidence = intermediate?.versionEvidence;
  if (
    intermediate?.schemaVersion !== 1 ||
    intermediate?.sourceVersion !== PT2_SOURCE_VERSION ||
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.containerFamily !== "POWERTAB_PT2_GZIP_JSON" ||
    evidence.extensionFamily !== ".pt2" ||
    evidence.compression !== "gzip" ||
    evidence.serialization !== "json" ||
    evidence.rootKey !== "score" ||
    evidence.internalVersion !== 11 ||
    evidence.upstreamRelease !== "2.0.22" ||
    evidence.upstreamCommit !==
      "13cab27c7127d301f2747671071e53eb203dc940" ||
    !Array.isArray(intermediate.tracks) ||
    !Number.isInteger(evidence.declaredPlayerCount) ||
    evidence.declaredPlayerCount < 1 ||
    evidence.declaredPlayerCount !== intermediate.tracks.length ||
    evidence.decodedTrackCount !== intermediate.tracks.length
  ) {
    fail(
      "The PowerTab v11 source evidence is missing, unsupported, or contradictory."
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
      gpVersion: "8.1.3",
      encodingDescription: "GP8",
      sourceVersion: "GP8",
      entryCount: 1,
      declaredTrackCount: intermediate.tracks.length,
    },
  };
}

function restorePowerTabMetadata(value, evidence, key = null) {
  if (Array.isArray(value)) {
    return value.map((item) => restorePowerTabMetadata(item, evidence, key));
  }
  if (!value || typeof value !== "object") {
    if (
      (key === "source" || key === "sourceFormat") &&
      value === "guitar-pro-archive"
    ) {
      return "powertab-pt2";
    }
    if (
      key === "sourceLayoutLabel" &&
      value === "Normalized Guitar Pro spatial layout"
    ) {
      return "Normalized PowerTab spatial layout";
    }
    return value;
  }

  const restored = {};
  Object.entries(value).forEach(([childKey, child]) => {
    if (childKey === "versionEvidence") {
      restored[childKey] = evidence;
    } else if (childKey === "sourceVersion") {
      restored[childKey] = PT2_SOURCE_VERSION;
    } else if (childKey === "warnings" && Array.isArray(child)) {
      restored[childKey] = child.map((warning) =>
        typeof warning === "string"
          ? warning.replace(/Guitar Pro/gu, "PowerTab")
          : warning
      );
    } else {
      restored[childKey] = restorePowerTabMetadata(
        child,
        evidence,
        childKey
      );
    }
  });
  return restored;
}

function mapNormalizerError(error) {
  if (!(error instanceof GuitarProImportError)) throw error;
  const message = String(error.message || "The PowerTab score could not be normalized.")
    .replace(/Guitar Pro/gu, "PowerTab");
  const code = String(error.code || "POWERTAB_IMPORT_ERROR").replace(/GUITAR_PRO/gu, "POWERTAB");
  throw new PowerTabImportError(message, code);
}

export function normalizeVerifiedPowerTabIntermediate(
  intermediate,
  options = {}
) {
  const evidence = validatePowerTabSourceEvidence(intermediate);
  let normalized;
  try {
    normalized = normalizeGuitarProIntermediate(
      compatibilityIntermediate(intermediate),
      options
    );
  } catch (error) {
    mapNormalizerError(error);
  }
  return restorePowerTabMetadata(normalized, evidence);
}

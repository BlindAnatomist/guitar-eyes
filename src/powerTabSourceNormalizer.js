import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";
import { PowerTabImportError } from "./powerTabErrors";
import { HISTORICAL_PT2_MILESTONE_COMMITS } from "./powerTabHistoricalPt2Compatibility";

const UPSTREAM_RELEASE = "2.0.22";
const UPSTREAM_COMMIT = "13cab27c7127d301f2747671071e53eb203dc940";

function fail(message, code = "INVALID_POWERTAB_VERSION_EVIDENCE") {
  throw new PowerTabImportError(message, code);
}

function sourceVersionForEvidence(evidence) {
  const version = evidence?.internalVersion;
  if (!Number.isInteger(version) || version < 1 || version > 11) return null;
  return `PT2_V${version}`;
}

function validateHistoricalEvidence(evidence) {
  const version = evidence.internalVersion;
  if (version === 11) return true;
  const expectedSerialization =
    version < 10
      ? "integer-enums-bitset-flags"
      : "named-enums-named-flags";
  return (
    evidence.sourceMilestoneCommit === HISTORICAL_PT2_MILESTONE_COMMITS[version] &&
    evidence.historicalSerialization === expectedSerialization
  );
}

function validatePowerTabSourceEvidence(intermediate) {
  const evidence = intermediate?.versionEvidence;
  const expectedSourceVersion = sourceVersionForEvidence(evidence);
  if (
    intermediate?.schemaVersion !== 1 ||
    expectedSourceVersion === null ||
    intermediate?.sourceVersion !== expectedSourceVersion ||
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.containerFamily !== "POWERTAB_PT2_GZIP_JSON" ||
    evidence.extensionFamily !== ".pt2" ||
    evidence.compression !== "gzip" ||
    evidence.serialization !== "json" ||
    evidence.rootKey !== "score" ||
    evidence.upstreamRelease !== UPSTREAM_RELEASE ||
    evidence.upstreamCommit !== UPSTREAM_COMMIT ||
    !validateHistoricalEvidence(evidence) ||
    !Array.isArray(intermediate.tracks) ||
    !Number.isInteger(evidence.declaredPlayerCount) ||
    evidence.declaredPlayerCount < 1 ||
    evidence.declaredPlayerCount !== intermediate.tracks.length ||
    evidence.decodedTrackCount !== intermediate.tracks.length
  ) {
    fail(
      "The PowerTab .pt2 source evidence is missing, unsupported, or contradictory."
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

function restorePowerTabMetadata(
  value,
  evidence,
  sourceVersion,
  key = null
) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      restorePowerTabMetadata(item, evidence, sourceVersion, key)
    );
  }
  if (!value || typeof value !== "object") {
    if (
      (key === "source" || key === "sourceFormat" || key === "format") &&
      value === "guitar-pro-archive"
    ) {
      return "powertab-pt2";
    }
    if (
      key === "id" &&
      typeof value === "string" &&
      value.startsWith("guitar-pro-")
    ) {
      return value.replace(/^guitar-pro-/u, "powertab-");
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
      restored[childKey] = sourceVersion;
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
        sourceVersion,
        childKey
      );
    }
  });
  return restored;
}

function mapNormalizerError(error) {
  if (!(error instanceof GuitarProImportError)) throw error;
  const message = String(
    error.message || "The PowerTab score could not be normalized."
  ).replace(/Guitar Pro/gu, "PowerTab");
  const code = String(error.code || "POWERTAB_IMPORT_ERROR").replace(
    /GUITAR_PRO/gu,
    "POWERTAB"
  );
  throw new PowerTabImportError(message, code);
}

export function normalizeVerifiedPowerTabIntermediate(
  intermediate,
  options = {}
) {
  const evidence = validatePowerTabSourceEvidence(intermediate);
  const sourceVersion = sourceVersionForEvidence(evidence);
  let normalized;
  try {
    normalized = normalizeGuitarProIntermediate(
      compatibilityIntermediate(intermediate),
      options
    );
  } catch (error) {
    mapNormalizerError(error);
  }
  return restorePowerTabMetadata(
    normalized,
    evidence,
    sourceVersion
  );
}

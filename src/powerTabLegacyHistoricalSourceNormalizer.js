import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";
import { PowerTabImportError } from "./powerTabErrors";

const LEGACY_SOURCE_FORMAT = "powertab-legacy";
const UPSTREAM_RELEASE = "2.0.22";
const UPSTREAM_COMMIT = "13cab27c7127d301f2747671071e53eb203dc940";
const HISTORICAL_PROFILES = new Map([
  ["PTB_V10", { fileVersion: 1, powerTabVersion: "1.0", historicalSignature: "ptab-1" }],
  ["PTB_V102", { fileVersion: 2, powerTabVersion: "1.0.2", historicalSignature: "ptab-2" }],
  ["PTB_V15", { fileVersion: 3, powerTabVersion: "1.5", historicalSignature: "ptab-3" }],
]);

function fail(message, code = "INVALID_POWERTAB_LEGACY_VERSION_EVIDENCE") {
  throw new PowerTabImportError(message, code);
}

function decodedMeasureCount(intermediate) {
  return intermediate.tracks.reduce(
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
}

function validateHistoricalEvidence(intermediate) {
  const profile = HISTORICAL_PROFILES.get(intermediate?.sourceVersion);
  const evidence = intermediate?.versionEvidence;
  if (
    !intermediate ||
    intermediate.schemaVersion !== 1 ||
    !profile ||
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.containerFamily !== "POWERTAB_LEGACY_MFC_BINARY" ||
    evidence.extensionFamily !== ".ptb" ||
    evidence.serialization !== "mfc-binary" ||
    evidence.marker !== "ptab" ||
    evidence.fileVersion !== profile.fileVersion ||
    evidence.powerTabVersion !== profile.powerTabVersion ||
    evidence.historicalSignature !== profile.historicalSignature ||
    evidence.upstreamRelease !== UPSTREAM_RELEASE ||
    evidence.upstreamCommit !== UPSTREAM_COMMIT ||
    evidence.evidenceKind !== "powertab-editor-source-faithful" ||
    evidence.independentParserParity !== false ||
    evidence.decodedTrackCount !== intermediate.tracks?.length
  ) {
    fail(
      "The historical PowerTab source evidence is missing, unsupported, or contradictory."
    );
  }

  if (evidence.decodedMeasureCount !== decodedMeasureCount(intermediate)) {
    fail(
      "The historical PowerTab measure count contradicts the decoded source evidence.",
      "POWERTAB_LEGACY_MEASURE_COUNT_MISMATCH"
    );
  }
  return { evidence, profile };
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

function restoreHistoricalMetadata(value, sourceVersion, versionEvidence, powerTabVersion) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      restoreHistoricalMetadata(
        item,
        sourceVersion,
        versionEvidence,
        powerTabVersion
      )
    );
  }
  if (!value || typeof value !== "object") return value;

  const restored = {};
  Object.entries(value).forEach(([key, item]) => {
    if (key === "versionEvidence") {
      restored[key] = versionEvidence;
      return;
    }
    if (key === "sourceVersion") {
      restored[key] = sourceVersion;
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
          ? warning.replaceAll("Guitar Pro", `PowerTab ${powerTabVersion}`)
          : warning
      );
      return;
    }
    restored[key] = restoreHistoricalMetadata(
      item,
      sourceVersion,
      versionEvidence,
      powerTabVersion
    );
  });
  return restored;
}

export function normalizeVerifiedPowerTabLegacyHistoricalIntermediate(
  intermediate,
  options = {}
) {
  const { evidence, profile } = validateHistoricalEvidence(intermediate);
  try {
    const normalized = normalizeGuitarProIntermediate(
      compatibilityIntermediate(intermediate),
      options
    );
    return restoreHistoricalMetadata(
      normalized,
      intermediate.sourceVersion,
      evidence,
      profile.powerTabVersion
    );
  } catch (error) {
    if (error instanceof PowerTabImportError) throw error;
    if (error instanceof GuitarProImportError) {
      throw new PowerTabImportError(
        error.message.replaceAll("Guitar Pro", `PowerTab ${profile.powerTabVersion}`),
        String(error.code || "POWERTAB_LEGACY_NORMALIZATION_ERROR").replaceAll(
          "GUITAR_PRO",
          "POWERTAB_LEGACY"
        )
      );
    }
    throw error;
  }
}

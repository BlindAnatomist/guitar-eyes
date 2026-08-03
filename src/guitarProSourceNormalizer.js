import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";

const SUPPORTED_SOURCE_VERSIONS = new Set([
  "GP3",
  "GP4",
  "GP5",
  "GP6",
  "GP7",
  "GP8",
]);

function fail(message, code = "INVALID_GUITAR_PRO_VERSION_EVIDENCE") {
  throw new GuitarProImportError(message, code);
}

function requireMatchingSourceVersion(intermediate) {
  const sourceVersion = String(intermediate?.sourceVersion || "");
  const evidence = intermediate?.versionEvidence;

  if (!SUPPORTED_SOURCE_VERSIONS.has(sourceVersion)) {
    fail(
      `The Guitar Pro decoder reported unsupported source version ${sourceVersion || "unknown"}.`,
      "UNTESTED_GUITAR_PRO_VERSION"
    );
  }
  if (!evidence || evidence.sourceVersion !== sourceVersion) {
    fail("The Guitar Pro source-version evidence does not match the decoded intermediate.");
  }

  return { sourceVersion, evidence };
}

function validateLegacy(sourceVersion, evidence) {
  const major = Number(sourceVersion.slice(2));
  const expectedExtension = `.gp${major}`;
  const versionMatch = /^FICHIER GUITAR PRO v([0-9]+)\.([0-9]+)$/u.exec(
    String(evidence.versionText || "")
  );

  if (
    evidence.sourceFamily !== "GUITAR_PRO_LEGACY_BINARY" ||
    evidence.extensionFamily !== expectedExtension ||
    evidence.signature !== "FICHIER GUITAR PRO" ||
    evidence.major !== major ||
    !versionMatch ||
    Number(versionMatch[1]) !== major
  ) {
    fail("The legacy Guitar Pro source evidence is missing or contradictory.");
  }
}

function validateGpx(evidence) {
  if (
    evidence.sourceFamily !== "GUITAR_PRO_GPX_CONTAINER" ||
    evidence.extensionFamily !== ".gpx" ||
    evidence.major !== 6 ||
    !["BCFS", "BCFZ"].includes(evidence.signature)
  ) {
    fail("The Guitar Pro 6 GPX source evidence is missing or contradictory.");
  }
}

function validateShared(sourceVersion, evidence) {
  const expectedMajor = sourceVersion.slice(2);
  const gpMajor = /^([0-9]+)(?:\.|$)/u.exec(
    String(evidence.gpVersion || "")
  )?.[1];
  const encodingMajor = /^GP([0-9]+)$/iu.exec(
    String(evidence.encodingDescription || "")
  )?.[1];

  if (
    (evidence.sourceFamily || evidence.archiveFamily) !==
      "GUITAR_PRO_SHARED_ZIP" ||
    evidence.rootVersion !== "7.0" ||
    gpMajor !== expectedMajor ||
    encodingMajor !== expectedMajor
  ) {
    fail("The shared Guitar Pro archive evidence is missing or contradictory.");
  }
}

export function validateGuitarProSourceEvidence(intermediate) {
  const { sourceVersion, evidence } = requireMatchingSourceVersion(intermediate);

  if (["GP3", "GP4", "GP5"].includes(sourceVersion)) {
    validateLegacy(sourceVersion, evidence);
  } else if (sourceVersion === "GP6") {
    validateGpx(evidence);
  } else {
    validateShared(sourceVersion, evidence);
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
      ...(Number.isInteger(intermediate?.versionEvidence?.declaredTrackCount)
        ? {
            declaredTrackCount:
              intermediate.versionEvidence.declaredTrackCount,
          }
        : {}),
    },
  };
}

function restoreSourceMetadata(value, sourceVersion, versionEvidence) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      restoreSourceMetadata(item, sourceVersion, versionEvidence)
    );
  }
  if (!value || typeof value !== "object") {
    return value === "guitar-pro-archive" ? "guitar-pro" : value;
  }

  const restored = {};
  Object.entries(value).forEach(([key, child]) => {
    if (key === "versionEvidence") {
      restored[key] = versionEvidence;
    } else if (key === "sourceVersion") {
      restored[key] = sourceVersion;
    } else {
      restored[key] = restoreSourceMetadata(
        child,
        sourceVersion,
        versionEvidence
      );
    }
  });
  return restored;
}

export function normalizeVerifiedGuitarProIntermediate(
  intermediate,
  options = {}
) {
  const versionEvidence = validateGuitarProSourceEvidence(intermediate);
  const sourceVersion = intermediate.sourceVersion;
  const normalized = normalizeGuitarProIntermediate(
    compatibilityIntermediate(intermediate),
    options
  );

  return restoreSourceMetadata(normalized, sourceVersion, versionEvidence);
}

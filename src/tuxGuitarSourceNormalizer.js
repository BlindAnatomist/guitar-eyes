import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";
import { TuxGuitarImportError } from "./tuxGuitarDecoder";

const UPSTREAM_RELEASE = "2.1.0";
const UPSTREAM_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const SUPPORTED = new Map([
  [
    "TG_1_0",
    {
      container: "TUXGUITAR_LEGACY_BINARY",
      version: "TuxGuitar File Format - 1.0",
    },
  ],
  [
    "TG_1_1",
    {
      container: "TUXGUITAR_LEGACY_BINARY",
      version: "TuxGuitar File Format - 1.1",
    },
  ],
  [
    "TG_1_2",
    {
      container: "TUXGUITAR_LEGACY_BINARY",
      version: "TuxGuitar File Format - 1.2",
    },
  ],
  [
    "TG_1_3",
    {
      container: "TUXGUITAR_LEGACY_BINARY",
      version: "TuxGuitar File Format - 1.3",
    },
  ],
  [
    "TG_1_5",
    {
      container: "TUXGUITAR_LEGACY_BINARY",
      version: "TuxGuitar File Format - 1.5",
    },
  ],
  ["TG_2_0", { container: "TUXGUITAR_ZIP_XML", version: "2.0.0" }],
]);

function fail(message, code = "INVALID_TUXGUITAR_VERSION_EVIDENCE") {
  throw new TuxGuitarImportError(message, code);
}

function validate(intermediate) {
  const expected = SUPPORTED.get(intermediate?.sourceVersion);
  const evidence = intermediate?.versionEvidence;
  if (
    !expected ||
    intermediate?.schemaVersion !== 1 ||
    !evidence ||
    evidence.schemaVersion !== 1 ||
    evidence.containerFamily !== expected.container ||
    evidence.extensionFamily !== ".tg" ||
    evidence.upstreamRelease !== UPSTREAM_RELEASE ||
    evidence.upstreamCommit !== UPSTREAM_COMMIT ||
    evidence.formatVersion !== expected.version ||
    !Array.isArray(intermediate.tracks) ||
    evidence.declaredTrackCount !== intermediate.tracks.length ||
    evidence.decodedTrackCount !== intermediate.tracks.length
  ) {
    fail("The TuxGuitar source evidence is missing, unsupported, or contradictory.");
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
      decodedTrackCount: intermediate.tracks.length,
    },
  };
}

function restore(value, evidence, sourceVersion, key = null) {
  if (Array.isArray(value)) {
    return value.map((child) => restore(child, evidence, sourceVersion, key));
  }
  if (!value || typeof value !== "object") {
    if (
      (key === "source" || key === "sourceFormat" || key === "format") &&
      value === "guitar-pro-archive"
    ) {
      return "tuxguitar";
    }
    if (key === "id" && typeof value === "string" && value.startsWith("guitar-pro-")) {
      return value.replace(/^guitar-pro-/u, "tuxguitar-");
    }
    if (
      key === "sourceLayoutLabel" &&
      value === "Normalized Guitar Pro spatial layout"
    ) {
      return "Normalized TuxGuitar spatial layout";
    }
    return value;
  }

  const output = {};
  for (const [childKey, child] of Object.entries(value)) {
    if (childKey === "versionEvidence") output[childKey] = evidence;
    else if (childKey === "sourceVersion") output[childKey] = sourceVersion;
    else if (childKey === "warnings" && Array.isArray(child)) {
      output[childKey] = child.map((warning) =>
        typeof warning === "string"
          ? warning.replace(/Guitar Pro/gu, "TuxGuitar")
          : warning
      );
    } else {
      output[childKey] = restore(child, evidence, sourceVersion, childKey);
    }
  }
  return output;
}

function mapError(error) {
  if (!(error instanceof GuitarProImportError)) throw error;
  throw new TuxGuitarImportError(
    String(error.message || "The TuxGuitar score could not be normalized.").replace(
      /Guitar Pro/gu,
      "TuxGuitar"
    ),
    String(error.code || "TUXGUITAR_IMPORT_ERROR").replace(
      /GUITAR_PRO/gu,
      "TUXGUITAR"
    )
  );
}

export function normalizeVerifiedTuxGuitarIntermediate(intermediate, options = {}) {
  const evidence = validate(intermediate);
  const sourceVersion = intermediate.sourceVersion;
  let normalized;
  try {
    normalized = normalizeGuitarProIntermediate(
      compatibilityIntermediate(intermediate),
      options
    );
  } catch (error) {
    mapError(error);
  }
  return restore(normalized, evidence, sourceVersion);
}

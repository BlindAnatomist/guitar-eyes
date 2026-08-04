import {
  GuitarProArchiveError,
  inspectGuitarProArchiveVersion,
} from "./guitarProArchiveVersion";

const LEGACY_PREFIX = "FICHIER GUITAR PRO ";
const GPX_HEADERS = new Set(["BCFS", "BCFZ"]);

export const GUITAR_PRO_SOURCE_FAMILIES = Object.freeze({
  gp3: Object.freeze({ extension: ".gp3", major: 3, sourceVersion: "GP3" }),
  gp4: Object.freeze({ extension: ".gp4", major: 4, sourceVersion: "GP4" }),
  gp5: Object.freeze({ extension: ".gp5", major: 5, sourceVersion: "GP5" }),
  gpx: Object.freeze({ extension: ".gpx", major: 6, sourceVersion: "GP6" }),
  gp: Object.freeze({ extension: ".gp", major: null, sourceVersion: null }),
});

export class GuitarProSourceError extends Error {
  constructor(message, code = "GUITAR_PRO_SOURCE_ERROR") {
    super(message);
    this.name = "GuitarProSourceError";
    this.code = code;
  }
}

function bytesFrom(input) {
  return input instanceof Uint8Array ? input : new Uint8Array(input || 0);
}

function normalizedExtension(fileName = "") {
  const match = /(?:^|\/)([^/]+)$/u.exec(String(fileName));
  const leaf = match?.[1] || String(fileName);
  const dot = leaf.lastIndexOf(".");
  return dot >= 0 ? leaf.slice(dot).toLowerCase() : "";
}

function familyForExtension(extension) {
  return Object.values(GUITAR_PRO_SOURCE_FAMILIES).find(
    (family) => family.extension === extension
  );
}

function ascii(bytes, start, length) {
  let value = "";
  const end = Math.min(bytes.length, start + length);
  for (let index = start; index < end; index += 1) {
    const code = bytes[index];
    if (code === 0) break;
    value += String.fromCharCode(code);
  }
  return value;
}

function inspectLegacy(bytes, expectedFamily) {
  if (bytes.length < 2) {
    throw new GuitarProSourceError(
      "The legacy Guitar Pro file is too short to contain version evidence.",
      "MALFORMED_LEGACY_GUITAR_PRO_HEADER"
    );
  }

  const declaredLength = bytes[0];
  if (declaredLength < LEGACY_PREFIX.length + 4 || declaredLength > 30) {
    throw new GuitarProSourceError(
      "The legacy Guitar Pro version-string length is invalid.",
      "MALFORMED_LEGACY_GUITAR_PRO_HEADER"
    );
  }
  if (bytes.length < 1 + declaredLength) {
    throw new GuitarProSourceError(
      "The legacy Guitar Pro version string is truncated.",
      "MALFORMED_LEGACY_GUITAR_PRO_HEADER"
    );
  }

  const versionText = ascii(bytes, 1, declaredLength).trim();
  if (!versionText.startsWith(LEGACY_PREFIX)) {
    throw new GuitarProSourceError(
      "The selected legacy file does not contain the Guitar Pro binary signature.",
      "INVALID_LEGACY_GUITAR_PRO_SIGNATURE"
    );
  }

  const versionMatch = /^FICHIER GUITAR PRO v([0-9]+)\.([0-9]+)$/u.exec(
    versionText
  );
  if (!versionMatch) {
    throw new GuitarProSourceError(
      "The legacy Guitar Pro version evidence is malformed.",
      "MALFORMED_LEGACY_GUITAR_PRO_VERSION"
    );
  }

  const major = Number(versionMatch[1]);
  const minor = Number(versionMatch[2]);
  if (![3, 4, 5].includes(major)) {
    throw new GuitarProSourceError(
      `Legacy Guitar Pro version ${major}.${minor} is outside the supported GP3–GP5 families.`,
      "UNSUPPORTED_LEGACY_GUITAR_PRO_VERSION"
    );
  }
  if (major !== expectedFamily.major) {
    throw new GuitarProSourceError(
      `The ${expectedFamily.extension} filename conflicts with internal Guitar Pro ${major}.${minor} evidence.`,
      "CONTRADICTORY_GUITAR_PRO_EXTENSION_EVIDENCE"
    );
  }

  return {
    schemaVersion: 2,
    sourceFamily: "GUITAR_PRO_LEGACY_BINARY",
    extensionFamily: expectedFamily.extension,
    sourceVersion: `GP${major}`,
    versionText,
    major,
    minor,
    signature: LEGACY_PREFIX.trim(),
    declaredTrackCount: null,
    trackCountEvidence: "decoder-only",
  };
}

function inspectGpx(bytes, expectedFamily) {
  if (bytes.length < 4) {
    throw new GuitarProSourceError(
      "The GPX file is too short to contain its container signature.",
      "MALFORMED_GPX_HEADER"
    );
  }
  const signature = ascii(bytes, 0, 4);
  if (!GPX_HEADERS.has(signature)) {
    throw new GuitarProSourceError(
      "The selected .gpx file does not begin with a BCFS or BCFZ Guitar Pro 6 container signature.",
      "INVALID_GPX_SIGNATURE"
    );
  }

  return {
    schemaVersion: 2,
    sourceFamily: "GUITAR_PRO_GPX_CONTAINER",
    extensionFamily: expectedFamily.extension,
    sourceVersion: expectedFamily.sourceVersion,
    versionText: "Guitar Pro 6",
    major: 6,
    minor: null,
    signature,
    declaredTrackCount: null,
    trackCountEvidence: "decoder-only",
  };
}

function mapArchiveError(error) {
  if (error instanceof GuitarProArchiveError) return error;
  return error;
}

export async function inspectGuitarProSource(
  input,
  {
    fileName = "",
    inspectSharedArchive = inspectGuitarProArchiveVersion,
  } = {}
) {
  const bytes = bytesFrom(input);
  const extension = normalizedExtension(fileName);
  const expectedFamily = familyForExtension(extension);

  if (!expectedFamily) {
    throw new GuitarProSourceError(
      "The Guitar Pro source family could not be determined from the selected filename.",
      "UNSUPPORTED_GUITAR_PRO_EXTENSION"
    );
  }

  if (expectedFamily.major >= 3 && expectedFamily.major <= 5) {
    return inspectLegacy(bytes, expectedFamily);
  }
  if (expectedFamily.major === 6) {
    return inspectGpx(bytes, expectedFamily);
  }

  try {
    const archive = await inspectSharedArchive(bytes);
    return {
      ...archive,
      schemaVersion: 2,
      sourceFamily: "GUITAR_PRO_SHARED_ZIP",
      extensionFamily: expectedFamily.extension,
      trackCountEvidence: "gpif-declaration",
    };
  } catch (error) {
    throw mapArchiveError(error);
  }
}

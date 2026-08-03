const ZIP_SIGNATURES = Object.freeze({
  localHeader: 0x04034b50,
  centralHeader: 0x02014b50,
  endOfCentralDirectory: 0x06054b50,
});

export const GUITAR_PRO_ARCHIVE_LIMITS = Object.freeze({
  maxEntries: 64,
  maxVersionBytes: 64,
  maxGpifBytes: 2 * 1024 * 1024,
  maxCentralDirectoryBytes: 512 * 1024,
});

export class GuitarProArchiveError extends Error {
  constructor(message, code = "GUITAR_PRO_ARCHIVE_ERROR") {
    super(message);
    this.name = "GuitarProArchiveError";
    this.code = code;
  }
}

function requireBounds(condition, message, code = "MALFORMED_GUITAR_PRO_ARCHIVE") {
  if (!condition) {
    throw new GuitarProArchiveError(message, code);
  }
}

function findEndOfCentralDirectory(view) {
  const minimum = 22;
  requireBounds(view.byteLength >= minimum, "The Guitar Pro archive is too short.");
  const earliest = Math.max(0, view.byteLength - (0xffff + minimum));

  for (let offset = view.byteLength - minimum; offset >= earliest; offset -= 1) {
    if (view.getUint32(offset, true) === ZIP_SIGNATURES.endOfCentralDirectory) {
      return offset;
    }
  }

  throw new GuitarProArchiveError(
    "The selected .gp file does not contain a valid ZIP central directory.",
    "INVALID_GUITAR_PRO_ZIP"
  );
}

function decodeUtf8(bytes, label) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new GuitarProArchiveError(
      `${label} is not valid UTF-8 text.`,
      "INVALID_GUITAR_PRO_VERSION_TEXT"
    );
  }
}

async function browserInflateRaw(bytes) {
  if (typeof DecompressionStream !== "function") {
    throw new GuitarProArchiveError(
      "This browser cannot inspect compressed Guitar Pro archive entries.",
      "GUITAR_PRO_DECOMPRESSION_UNAVAILABLE"
    );
  }

  let stream;
  try {
    stream = new DecompressionStream("deflate-raw");
  } catch {
    throw new GuitarProArchiveError(
      "This browser does not support raw DEFLATE needed for Guitar Pro archives.",
      "GUITAR_PRO_DECOMPRESSION_UNAVAILABLE"
    );
  }

  const response = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

function parseCentralDirectory(bytes, limits) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);
  const diskNumber = view.getUint16(eocdOffset + 4, true);
  const centralDisk = view.getUint16(eocdOffset + 6, true);
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  const commentLength = view.getUint16(eocdOffset + 20, true);

  requireBounds(diskNumber === 0 && centralDisk === 0, "Multi-disk Guitar Pro archives are not supported.");
  requireBounds(entriesOnDisk === totalEntries, "The Guitar Pro archive entry counts are inconsistent.");
  requireBounds(totalEntries <= limits.maxEntries, `The Guitar Pro archive contains more than ${limits.maxEntries} entries.`, "GUITAR_PRO_ARCHIVE_ENTRY_LIMIT");
  requireBounds(centralSize <= limits.maxCentralDirectoryBytes, "The Guitar Pro central directory exceeds the checkpoint limit.", "GUITAR_PRO_CENTRAL_DIRECTORY_LIMIT");
  requireBounds(eocdOffset + 22 + commentLength <= bytes.byteLength, "The Guitar Pro ZIP comment is truncated.");
  requireBounds(centralOffset + centralSize <= eocdOffset, "The Guitar Pro central directory points outside the archive.");

  const decoder = new TextDecoder("utf-8", { fatal: true });
  const entries = [];
  let cursor = centralOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    requireBounds(cursor + 46 <= bytes.byteLength, "A Guitar Pro central-directory entry is truncated.");
    requireBounds(view.getUint32(cursor, true) === ZIP_SIGNATURES.centralHeader, "A Guitar Pro central-directory signature is invalid.");

    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const fileNameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const entryCommentLength = view.getUint16(cursor + 32, true);
    const diskStart = view.getUint16(cursor + 34, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + fileNameLength;

    requireBounds(nameEnd + extraLength + entryCommentLength <= bytes.byteLength, "A Guitar Pro central-directory filename is truncated.");
    requireBounds((flags & 0x1) === 0, "Encrypted Guitar Pro archive entries are not supported.", "ENCRYPTED_GUITAR_PRO_ARCHIVE");
    requireBounds(diskStart === 0, "A Guitar Pro entry starts on another disk.");
    requireBounds(method === 0 || method === 8, `Guitar Pro ZIP compression method ${method} is not supported.`, "UNSUPPORTED_GUITAR_PRO_ZIP_COMPRESSION");

    let name;
    try {
      name = decoder.decode(bytes.subarray(nameStart, nameEnd));
    } catch {
      throw new GuitarProArchiveError(
        "A Guitar Pro archive entry name is not valid UTF-8.",
        "INVALID_GUITAR_PRO_ZIP_FILENAME"
      );
    }

    entries.push({
      name,
      flags,
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });
    cursor = nameEnd + extraLength + entryCommentLength;
  }

  requireBounds(cursor === centralOffset + centralSize, "The Guitar Pro central-directory size does not match its entries.");
  return { entries, view };
}

async function readEntry(bytes, view, entry, maxBytes, inflateRaw) {
  requireBounds(entry.uncompressedSize <= maxBytes, `${entry.name} exceeds the checkpoint extraction limit.`, "GUITAR_PRO_ARCHIVE_EXPANSION_LIMIT");
  const offset = entry.localHeaderOffset;
  requireBounds(offset + 30 <= bytes.byteLength, `${entry.name} has a truncated local header.`);
  requireBounds(view.getUint32(offset, true) === ZIP_SIGNATURES.localHeader, `${entry.name} has an invalid local-header signature.`);

  const flags = view.getUint16(offset + 6, true);
  const method = view.getUint16(offset + 8, true);
  const fileNameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const dataStart = offset + 30 + fileNameLength + extraLength;
  const dataEnd = dataStart + entry.compressedSize;

  requireBounds((flags & 0x1) === 0, `${entry.name} is encrypted.`, "ENCRYPTED_GUITAR_PRO_ARCHIVE");
  requireBounds(method === entry.method, `${entry.name} has conflicting compression metadata.`);
  requireBounds(dataEnd <= bytes.byteLength, `${entry.name} has truncated compressed data.`);

  const compressed = bytes.subarray(dataStart, dataEnd);
  let output;
  if (method === 0) {
    output = new Uint8Array(compressed);
  } else {
    output = await inflateRaw(compressed);
  }

  requireBounds(output.byteLength === entry.uncompressedSize, `${entry.name} expanded to an unexpected size.`, "GUITAR_PRO_ARCHIVE_SIZE_MISMATCH");
  requireBounds(output.byteLength <= maxBytes, `${entry.name} exceeds the checkpoint extraction limit.`, "GUITAR_PRO_ARCHIVE_EXPANSION_LIMIT");
  return output;
}

function optionalUniqueEntry(entries, name) {
  const matches = entries.filter((entry) => entry.name === name);
  if (matches.length > 1) {
    throw new GuitarProArchiveError(
      `The Guitar Pro archive contains duplicate ${name} entries.`,
      "DUPLICATE_GUITAR_PRO_VERSION_EVIDENCE"
    );
  }
  return matches[0] || null;
}

function requiredUniqueEntry(entries, name) {
  const entry = optionalUniqueEntry(entries, name);
  if (!entry) {
    throw new GuitarProArchiveError(
      `The Guitar Pro archive is missing ${name}.`,
      "MISSING_GUITAR_PRO_VERSION_EVIDENCE"
    );
  }
  return entry;
}

function tagText(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]+)</${tag}>`));
  return match ? match[1].trim() : null;
}

function isGpifDocument(xml) {
  const value = String(xml || "").trim();
  return (
    /^(?:<\?xml[\s\S]*?\?>\s*)?<GPIF(?:\s|>)/u.test(value) &&
    /<\/GPIF>\s*$/u.test(value)
  );
}

function declaredTrackCount(gpifXml) {
  const trackIds = tagText(gpifXml, "Tracks");
  if (trackIds === null) {
    throw new GuitarProArchiveError(
      "The Guitar Pro GPIF track declaration is missing.",
      "MISSING_GUITAR_PRO_TRACK_EVIDENCE"
    );
  }

  const ids = trackIds.split(/\s+/).filter(Boolean);
  if (ids.length === 0) {
    throw new GuitarProArchiveError(
      "The Guitar Pro GPIF does not declare any tracks.",
      "MISSING_GUITAR_PRO_TRACK_EVIDENCE"
    );
  }
  if (new Set(ids).size !== ids.length) {
    throw new GuitarProArchiveError(
      "The Guitar Pro GPIF track declaration contains duplicate identifiers.",
      "CONTRADICTORY_GUITAR_PRO_TRACK_EVIDENCE"
    );
  }

  return ids.length;
}

function classifyVersionEvidence(rootVersion, gpVersion, encodingDescription) {
  if (rootVersion !== "7.0") {
    throw new GuitarProArchiveError(
      `The shared .gp archive marker is ${rootVersion || "missing"}, not the tested 7.0 container family.`,
      "UNSUPPORTED_GUITAR_PRO_ARCHIVE_FAMILY"
    );
  }

  const gpMajor = /^([0-9]+)(?:\.|$)/.exec(gpVersion || "")?.[1] || null;
  const encodingMajor = /^GP([0-9]+)$/i.exec(encodingDescription || "")?.[1] || null;

  if (!gpMajor || !encodingMajor) {
    throw new GuitarProArchiveError(
      "The Guitar Pro GPIF version evidence is missing or malformed.",
      "MISSING_GUITAR_PRO_VERSION_EVIDENCE"
    );
  }
  if (gpMajor !== encodingMajor) {
    throw new GuitarProArchiveError(
      `The Guitar Pro GPVersion ${gpVersion} conflicts with EncodingDescription ${encodingDescription}.`,
      "CONTRADICTORY_GUITAR_PRO_VERSION_EVIDENCE"
    );
  }
  if (gpMajor !== "7" && gpMajor !== "8") {
    throw new GuitarProArchiveError(
      `Guitar Pro semantic version ${gpVersion} is outside the shared .gp archive family.`,
      "UNTESTED_GUITAR_PRO_VERSION"
    );
  }

  return `GP${gpMajor}`;
}

export async function inspectGuitarProArchiveVersion(
  input,
  {
    inflateRaw = browserInflateRaw,
    limits = GUITAR_PRO_ARCHIVE_LIMITS,
  } = {}
) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
  const { entries, view } = parseCentralDirectory(bytes, limits);
  const versionEntry = optionalUniqueEntry(entries, "VERSION");
  const gpifEntry = requiredUniqueEntry(entries, "Content/score.gpif");
  const gpifBytes = await readEntry(
    bytes,
    view,
    gpifEntry,
    limits.maxGpifBytes,
    inflateRaw
  );
  const gpifXml = decodeUtf8(gpifBytes, "The Guitar Pro score.gpif entry");
  requireBounds(
    isGpifDocument(gpifXml),
    "The Guitar Pro score.gpif entry is not a complete GPIF document.",
    "INVALID_GUITAR_PRO_GPIF"
  );

  const gpVersion = tagText(gpifXml, "GPVersion");
  const encodingDescription = tagText(gpifXml, "EncodingDescription");
  const trackCount = declaredTrackCount(gpifXml);

  if (!versionEntry) {
    if (gpVersion !== null || encodingDescription !== null) {
      throw new GuitarProArchiveError(
        "A versioned Guitar Pro shared archive is missing its VERSION entry.",
        "MISSING_GUITAR_PRO_VERSION_EVIDENCE"
      );
    }

    return {
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      packageVariant: "GP7_GPIF_ONLY",
      rootVersion: null,
      gpVersion: null,
      encodingDescription: null,
      sourceVersion: "GP7",
      versionText: "Guitar Pro 7 GPIF-only shared archive",
      signature: "Content/score.gpif",
      entryCount: entries.length,
      declaredTrackCount: trackCount,
    };
  }

  const versionBytes = await readEntry(
    bytes,
    view,
    versionEntry,
    limits.maxVersionBytes,
    inflateRaw
  );
  const rootVersion = decodeUtf8(
    versionBytes,
    "The Guitar Pro VERSION entry"
  ).trim();
  const sourceVersion = classifyVersionEvidence(
    rootVersion,
    gpVersion,
    encodingDescription
  );

  return {
    schemaVersion: 1,
    archiveFamily: "GUITAR_PRO_SHARED_ZIP",
    rootVersion,
    gpVersion,
    encodingDescription,
    sourceVersion,
    entryCount: entries.length,
    declaredTrackCount: trackCount,
  };
}

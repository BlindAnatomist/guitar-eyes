const ZIP_SIGNATURES = Object.freeze({
  localHeader: 0x04034b50,
  centralHeader: 0x02014b50,
  endOfCentralDirectory: 0x06054b50,
});

const MUSICXML_MEDIA_TYPE = "application/vnd.recordare.musicxml+xml";
const MXL_MIME_TYPE = "application/vnd.recordare.musicxml";

export const COMPRESSED_MUSICXML_LIMITS = Object.freeze({
  maxArchiveBytes: 16 * 1024 * 1024,
  maxEntries: 256,
  maxCentralDirectoryBytes: 1024 * 1024,
  maxContainerBytes: 64 * 1024,
  maxScoreBytes: 8 * 1024 * 1024,
  maxMimeTypeBytes: 128,
});

export class CompressedMusicXmlImportError extends Error {
  constructor(message, code = "COMPRESSED_MUSICXML_IMPORT_ERROR") {
    super(message);
    this.name = "CompressedMusicXmlImportError";
    this.code = code;
  }
}

function requireArchive(condition, message, code = "MALFORMED_COMPRESSED_MUSICXML") {
  if (!condition) {
    throw new CompressedMusicXmlImportError(message, code);
  }
}

function findEndOfCentralDirectory(view) {
  const minimumLength = 22;
  requireArchive(
    view.byteLength >= minimumLength,
    "Compressed MusicXML was recognized, but Guitar Eyes does not yet import .mxl files without a valid ZIP central directory.",
    "INVALID_MXL_ZIP"
  );
  const earliestOffset = Math.max(0, view.byteLength - (0xffff + minimumLength));

  for (let offset = view.byteLength - minimumLength; offset >= earliestOffset; offset -= 1) {
    if (view.getUint32(offset, true) !== ZIP_SIGNATURES.endOfCentralDirectory) {
      continue;
    }

    const commentLength = view.getUint16(offset + 20, true);
    if (offset + minimumLength + commentLength === view.byteLength) {
      return offset;
    }
  }

  throw new CompressedMusicXmlImportError(
    "Compressed MusicXML was recognized, but Guitar Eyes does not yet import .mxl files without a valid ZIP central directory.",
    "INVALID_MXL_ZIP"
  );
}

function decodeUtf8(bytes, label, code = "INVALID_MXL_TEXT") {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new CompressedMusicXmlImportError(`${label} is not valid UTF-8 text.`, code);
  }
}

async function browserInflateRaw(bytes, maxBytes) {
  if (typeof DecompressionStream !== "function") {
    throw new CompressedMusicXmlImportError(
      "This browser cannot expand compressed MusicXML archive entries.",
      "MXL_DECOMPRESSION_UNAVAILABLE"
    );
  }

  let stream;
  try {
    stream = new DecompressionStream("deflate-raw");
  } catch {
    throw new CompressedMusicXmlImportError(
      "This browser does not support raw DEFLATE needed for compressed MusicXML.",
      "MXL_DECOMPRESSION_UNAVAILABLE"
    );
  }

  const reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      totalBytes += chunk.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new CompressedMusicXmlImportError(
          "A compressed MusicXML archive entry exceeds the checkpoint extraction limit.",
          "MXL_ARCHIVE_EXPANSION_LIMIT"
        );
      }
      chunks.push(chunk);
    }
  } catch (error) {
    if (error instanceof CompressedMusicXmlImportError) throw error;
    throw new CompressedMusicXmlImportError(
      "A compressed MusicXML archive entry could not be expanded.",
      "MXL_DECOMPRESSION_FAILED"
    );
  }

  const output = new Uint8Array(totalBytes);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return output;
}

function parseCentralDirectory(bytes, limits) {
  requireArchive(
    bytes.byteLength <= limits.maxArchiveBytes,
    `The compressed MusicXML archive exceeds the ${limits.maxArchiveBytes / (1024 * 1024)} MB checkpoint limit.`,
    "MXL_ARCHIVE_SIZE_LIMIT"
  );

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);
  const diskNumber = view.getUint16(eocdOffset + 4, true);
  const centralDisk = view.getUint16(eocdOffset + 6, true);
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  const commentLength = view.getUint16(eocdOffset + 20, true);

  requireArchive(diskNumber === 0 && centralDisk === 0, "Multi-disk compressed MusicXML archives are not supported.");
  requireArchive(entriesOnDisk === totalEntries, "The compressed MusicXML archive entry counts are inconsistent.");
  requireArchive(
    totalEntries !== 0xffff && centralSize !== 0xffffffff && centralOffset !== 0xffffffff,
    "ZIP64 compressed MusicXML archives are not supported by this checkpoint.",
    "UNSUPPORTED_MXL_ZIP64"
  );
  requireArchive(
    totalEntries <= limits.maxEntries,
    `The compressed MusicXML archive contains more than ${limits.maxEntries} entries.`,
    "MXL_ARCHIVE_ENTRY_LIMIT"
  );
  requireArchive(
    centralSize <= limits.maxCentralDirectoryBytes,
    "The compressed MusicXML central directory exceeds the checkpoint limit.",
    "MXL_CENTRAL_DIRECTORY_LIMIT"
  );
  requireArchive(
    eocdOffset + 22 + commentLength === bytes.byteLength,
    "The compressed MusicXML ZIP comment length is inconsistent."
  );
  requireArchive(
    centralOffset + centralSize <= eocdOffset,
    "The compressed MusicXML central directory points outside the archive."
  );

  const decoder = new TextDecoder("utf-8", { fatal: true });
  const entries = [];
  let cursor = centralOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    requireArchive(cursor + 46 <= bytes.byteLength, "A compressed MusicXML central-directory entry is truncated.");
    requireArchive(
      view.getUint32(cursor, true) === ZIP_SIGNATURES.centralHeader,
      "A compressed MusicXML central-directory signature is invalid."
    );

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

    requireArchive(
      nameEnd + extraLength + entryCommentLength <= bytes.byteLength,
      "A compressed MusicXML central-directory filename is truncated."
    );
    requireArchive((flags & 0x1) === 0, "Encrypted compressed MusicXML entries are not supported.", "ENCRYPTED_MXL_ARCHIVE");
    requireArchive(diskStart === 0, "A compressed MusicXML entry starts on another disk.");
    requireArchive(
      method === 0 || method === 8,
      `Compressed MusicXML ZIP compression method ${method} is not supported.`,
      "UNSUPPORTED_MXL_ZIP_COMPRESSION"
    );
    requireArchive(
      compressedSize !== 0xffffffff &&
        uncompressedSize !== 0xffffffff &&
        localHeaderOffset !== 0xffffffff,
      "ZIP64 compressed MusicXML entries are not supported by this checkpoint.",
      "UNSUPPORTED_MXL_ZIP64"
    );

    let name;
    try {
      name = decoder.decode(bytes.subarray(nameStart, nameEnd));
    } catch {
      throw new CompressedMusicXmlImportError(
        "A compressed MusicXML archive entry name is not valid UTF-8.",
        "INVALID_MXL_ZIP_FILENAME"
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

  requireArchive(
    cursor === centralOffset + centralSize,
    "The compressed MusicXML central-directory size does not match its entries."
  );

  return { entries, view };
}

async function readEntry(bytes, view, entry, maxBytes, inflateRaw) {
  requireArchive(
    entry.uncompressedSize <= maxBytes,
    `${entry.name} exceeds the checkpoint extraction limit.`,
    "MXL_ARCHIVE_EXPANSION_LIMIT"
  );

  const offset = entry.localHeaderOffset;
  requireArchive(offset + 30 <= bytes.byteLength, `${entry.name} has a truncated local header.`);
  requireArchive(
    view.getUint32(offset, true) === ZIP_SIGNATURES.localHeader,
    `${entry.name} has an invalid local-header signature.`
  );

  const flags = view.getUint16(offset + 6, true);
  const method = view.getUint16(offset + 8, true);
  const localCompressedSize = view.getUint32(offset + 18, true);
  const localUncompressedSize = view.getUint32(offset + 22, true);
  const fileNameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const nameStart = offset + 30;
  const nameEnd = nameStart + fileNameLength;
  const dataStart = nameEnd + extraLength;
  const dataEnd = dataStart + entry.compressedSize;

  requireArchive((flags & 0x1) === 0, `${entry.name} is encrypted.`, "ENCRYPTED_MXL_ARCHIVE");
  requireArchive(method === entry.method, `${entry.name} has conflicting compression metadata.`);
  requireArchive(nameEnd <= bytes.byteLength, `${entry.name} has a truncated local filename.`);
  const localName = decodeUtf8(
    bytes.subarray(nameStart, nameEnd),
    `The local ZIP filename for ${entry.name}`,
    "INVALID_MXL_ZIP_FILENAME"
  );
  requireArchive(localName === entry.name, `${entry.name} has conflicting local filename metadata.`);
  if ((flags & 0x8) === 0) {
    requireArchive(
      localCompressedSize === entry.compressedSize &&
        localUncompressedSize === entry.uncompressedSize,
      `${entry.name} has conflicting local size metadata.`
    );
  }
  requireArchive(dataEnd <= bytes.byteLength, `${entry.name} has truncated compressed data.`);

  const compressed = bytes.subarray(dataStart, dataEnd);
  const output =
    method === 0 ? new Uint8Array(compressed) : await inflateRaw(compressed, maxBytes);

  requireArchive(
    output.byteLength === entry.uncompressedSize,
    `${entry.name} expanded to an unexpected size.`,
    "MXL_ARCHIVE_SIZE_MISMATCH"
  );
  requireArchive(
    output.byteLength <= maxBytes,
    `${entry.name} exceeds the checkpoint extraction limit.`,
    "MXL_ARCHIVE_EXPANSION_LIMIT"
  );
  return output;
}

function uniqueEntry(entries, name, { required = true, code = "MISSING_MXL_ENTRY" } = {}) {
  const matches = entries.filter((entry) => entry.name === name);
  if (matches.length === 0) {
    if (!required) return null;
    throw new CompressedMusicXmlImportError(
      `The compressed MusicXML archive is missing ${name}.`,
      code
    );
  }
  if (matches.length > 1) {
    throw new CompressedMusicXmlImportError(
      `The compressed MusicXML archive contains duplicate ${name} entries.`,
      "DUPLICATE_MXL_ENTRY"
    );
  }
  return matches[0];
}

function localName(node) {
  return node?.localName || node?.nodeName?.split(":").at(-1) || "";
}

function descendants(node, name) {
  return Array.from(node?.getElementsByTagName("*") || []).filter(
    (candidate) => localName(candidate) === name
  );
}

function parseContainerXml(sourceText) {
  if (/<!DOCTYPE\s|<!ENTITY\s/i.test(sourceText)) {
    throw new CompressedMusicXmlImportError(
      "The compressed MusicXML container contains a document type or custom entity declaration.",
      "UNSAFE_MXL_CONTAINER_ENTITY"
    );
  }
  if (typeof DOMParser !== "function") {
    throw new CompressedMusicXmlImportError(
      "This browser cannot parse the compressed MusicXML container.",
      "MXL_DOM_UNAVAILABLE"
    );
  }

  const document = new DOMParser().parseFromString(sourceText, "application/xml");
  if (descendants(document, "parsererror").length > 0) {
    throw new CompressedMusicXmlImportError(
      "META-INF/container.xml is malformed.",
      "MALFORMED_MXL_CONTAINER"
    );
  }
  if (localName(document.documentElement) !== "container") {
    throw new CompressedMusicXmlImportError(
      "META-INF/container.xml does not contain a MusicXML container root.",
      "INVALID_MXL_CONTAINER_ROOT"
    );
  }

  const rootfile = descendants(document.documentElement, "rootfile")[0];
  if (!rootfile) {
    throw new CompressedMusicXmlImportError(
      "META-INF/container.xml does not identify a MusicXML root file.",
      "MISSING_MXL_ROOTFILE"
    );
  }

  const fullPath = String(rootfile.getAttribute("full-path") || "").trim();
  const mediaType = String(rootfile.getAttribute("media-type") || "").trim();
  if (!fullPath) {
    throw new CompressedMusicXmlImportError(
      "The first MusicXML rootfile is missing its required full-path.",
      "MISSING_MXL_ROOTFILE_PATH"
    );
  }
  if (mediaType && mediaType !== MUSICXML_MEDIA_TYPE) {
    throw new CompressedMusicXmlImportError(
      `The first compressed MusicXML rootfile uses unsupported media type ${mediaType}.`,
      "UNSUPPORTED_MXL_ROOTFILE_MEDIA_TYPE"
    );
  }

  return fullPath;
}

function containsControlCharacter(value) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
}

function requireSafeRootPath(path) {
  requireArchive(
    !path.startsWith("/") && !path.startsWith("\\") && !path.includes("\\"),
    "The compressed MusicXML rootfile path must be a relative slash-separated path.",
    "UNSAFE_MXL_ROOTFILE_PATH"
  );
  requireArchive(
    !containsControlCharacter(path),
    "The compressed MusicXML rootfile path contains a control character.",
    "UNSAFE_MXL_ROOTFILE_PATH"
  );
  const segments = path.split("/");
  requireArchive(
    segments.every((segment) => segment && segment !== "." && segment !== ".."),
    "The compressed MusicXML rootfile path contains an unsafe path segment.",
    "UNSAFE_MXL_ROOTFILE_PATH"
  );
}

export async function extractCompressedMusicXml(
  input,
  {
    inflateRaw = browserInflateRaw,
    limits = COMPRESSED_MUSICXML_LIMITS,
  } = {}
) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
  const { entries, view } = parseCentralDirectory(bytes, limits);

  const mimeEntry = uniqueEntry(entries, "mimetype", { required: false });
  if (mimeEntry) {
    requireArchive(
      mimeEntry.method === 0,
      "The compressed MusicXML mimetype entry must be stored without compression.",
      "INVALID_MXL_MIMETYPE_ENTRY"
    );
    const mimeBytes = await readEntry(bytes, view, mimeEntry, limits.maxMimeTypeBytes, inflateRaw);
    const mimeType = decodeUtf8(mimeBytes, "The compressed MusicXML mimetype entry").trim();
    requireArchive(
      mimeType === MXL_MIME_TYPE,
      `The compressed MusicXML mimetype entry is ${mimeType || "empty"}.`,
      "INVALID_MXL_MIMETYPE"
    );
  }

  const containerEntry = uniqueEntry(entries, "META-INF/container.xml", {
    code: "MISSING_MXL_CONTAINER",
  });
  const containerBytes = await readEntry(
    bytes,
    view,
    containerEntry,
    limits.maxContainerBytes,
    inflateRaw
  );
  const containerXml = decodeUtf8(
    containerBytes,
    "META-INF/container.xml",
    "INVALID_MXL_CONTAINER_TEXT"
  );
  const rootPath = parseContainerXml(containerXml);
  requireSafeRootPath(rootPath);

  const scoreEntry = uniqueEntry(entries, rootPath, { code: "MISSING_MXL_SCORE" });
  const scoreBytes = await readEntry(bytes, view, scoreEntry, limits.maxScoreBytes, inflateRaw);
  const sourceText = decodeUtf8(scoreBytes, rootPath, "INVALID_MXL_SCORE_TEXT");

  return {
    sourceText,
    rootPath,
    entryCount: entries.length,
    hasMimeTypeEntry: Boolean(mimeEntry),
  };
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(
        new CompressedMusicXmlImportError(
          "Choose a compressed MusicXML file first.",
          "NO_MXL_FILE"
        )
      );
      return;
    }

    if (
      typeof file.size === "number" &&
      file.size > COMPRESSED_MUSICXML_LIMITS.maxArchiveBytes
    ) {
      reject(
        new CompressedMusicXmlImportError(
          `The compressed MusicXML archive exceeds the ${COMPRESSED_MUSICXML_LIMITS.maxArchiveBytes / (1024 * 1024)} MB checkpoint limit.`,
          "MXL_ARCHIVE_SIZE_LIMIT"
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = () =>
      reject(
        new CompressedMusicXmlImportError(
          "The compressed MusicXML file could not be read.",
          "MXL_FILE_READ_ERROR"
        )
      );
    reader.readAsArrayBuffer(file);
  });
}

export async function readCompressedMusicXmlFile(file, options = {}) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const result = await extractCompressedMusicXml(arrayBuffer, options);
  return result.sourceText;
}
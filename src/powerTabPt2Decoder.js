import { PowerTabImportError } from "./powerTabErrors";
import {
  canonicalizeHistoricalPowerTabDocument,
  HISTORICAL_PT2_MILESTONE_COMMITS,
} from "./powerTabHistoricalPt2Compatibility";
import { POWERTAB_LIMITS } from "./powerTabLimits";
import { buildTracks } from "./powerTabV11SystemParser";
import { scoreTitle } from "./powerTabV11Schema";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";

const UPSTREAM_RELEASE = "2.0.22";
const UPSTREAM_COMMIT = "13cab27c7127d301f2747671071e53eb203dc940";

function fail(message, code = "INVALID_POWERTAB_PT2") {
  throw new PowerTabImportError(message, code);
}

function fileNameOf(file) {
  return String(file?.name || "PowerTab.pt2");
}

function validateGzipHeader(bytes) {
  if (
    !(bytes instanceof Uint8Array) ||
    bytes.length < 10 ||
    bytes[0] !== 0x1f ||
    bytes[1] !== 0x8b ||
    bytes[2] !== 0x08
  ) {
    fail(
      "The selected .pt2 file is not a valid gzip container.",
      "INVALID_POWERTAB_GZIP"
    );
  }
}

async function decompressGzip(bytes, limits) {
  if (typeof DecompressionStream !== "function") {
    fail(
      "This browser does not provide the bounded gzip decoder required for PowerTab .pt2 files.",
      "POWERTAB_GZIP_UNAVAILABLE"
    );
  }

  try {
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    const decompressed = new Uint8Array(await new Response(stream).arrayBuffer());
    if (decompressed.byteLength > limits.maxDecompressedBytes) {
      fail(
        `The decompressed PowerTab document exceeds the ${limits.maxDecompressedBytes}-byte safety limit.`,
        "POWERTAB_DECOMPRESSED_SIZE_LIMIT"
      );
    }
    return decompressed;
  } catch (error) {
    if (error instanceof PowerTabImportError) throw error;
    fail(
      "The selected .pt2 gzip container could not be decompressed safely.",
      "INVALID_POWERTAB_GZIP"
    );
  }
}

function parseJson(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(
      "The decompressed PowerTab document is not valid UTF-8.",
      "INVALID_POWERTAB_UTF8"
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    fail(
      "The decompressed PowerTab document is not valid JSON.",
      "INVALID_POWERTAB_JSON"
    );
  }
}

function decodeHistoricalDocument(root, { limits = POWERTAB_LIMITS } = {}) {
  const version = root?.version;
  if (!Number.isInteger(version) || version < 1 || version > 10) {
    fail(
      `The PowerTab document reports internal version ${String(
        version ?? "missing"
      )}. This checkpoint accepts exact versions 1 through 11 only.`,
      "UNTESTED_POWERTAB_VERSION"
    );
  }

  const document = canonicalizeHistoricalPowerTabDocument(root);
  const score = document.score;
  const players = score?.players;
  if (!Array.isArray(players)) {
    fail("PowerTab score players must be an array.");
  }
  const tracks = buildTracks(score, limits);

  return {
    schemaVersion: 1,
    sourceVersion: `PT2_V${version}`,
    versionEvidence: {
      schemaVersion: 1,
      containerFamily: "POWERTAB_PT2_GZIP_JSON",
      extensionFamily: ".pt2",
      compression: "gzip",
      serialization: "json",
      rootKey: "score",
      internalVersion: version,
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
      sourceMilestoneCommit: HISTORICAL_PT2_MILESTONE_COMMITS[version],
      historicalSerialization:
        version < 10
          ? "integer-enums-bitset-flags"
          : "named-enums-named-flags",
      declaredPlayerCount: players.length,
      decodedTrackCount: tracks.length,
    },
    title: scoreTitle(score.score_info),
    tracks,
  };
}

export function decodePowerTabPt2Document(
  root,
  { limits = POWERTAB_LIMITS } = {}
) {
  if (root?.version === 11) {
    return decodePowerTabV11Document(root, { limits });
  }
  return decodeHistoricalDocument(root, { limits });
}

export async function decodePowerTabPt2Bytes(
  compressed,
  { limits = POWERTAB_LIMITS, decompress = decompressGzip } = {}
) {
  const bytes =
    compressed instanceof Uint8Array
      ? compressed
      : new Uint8Array(compressed || new ArrayBuffer(0));
  if (bytes.byteLength === 0 || bytes.byteLength > limits.maxCompressedBytes) {
    fail(
      `The selected PowerTab file must be between 1 and ${limits.maxCompressedBytes} bytes.`,
      "POWERTAB_COMPRESSED_SIZE_LIMIT"
    );
  }
  validateGzipHeader(bytes);
  const decompressed = await decompress(bytes, limits);
  if (!(decompressed instanceof Uint8Array)) {
    fail(
      "The PowerTab gzip decoder returned an invalid byte sequence.",
      "INVALID_POWERTAB_GZIP"
    );
  }
  if (decompressed.byteLength > limits.maxDecompressedBytes) {
    fail(
      `The decompressed PowerTab document exceeds the ${limits.maxDecompressedBytes}-byte safety limit.`,
      "POWERTAB_DECOMPRESSED_SIZE_LIMIT"
    );
  }
  return decodePowerTabPt2Document(parseJson(decompressed), { limits });
}

export async function decodePowerTabPt2File(file, options = {}) {
  if (!file || typeof file.arrayBuffer !== "function") {
    fail("A readable PowerTab .pt2 file is required.", "INVALID_POWERTAB_FILE");
  }
  const limits = options.limits || POWERTAB_LIMITS;
  if (
    !Number.isInteger(file.size) ||
    file.size <= 0 ||
    file.size > limits.maxCompressedBytes
  ) {
    fail(
      `The selected PowerTab file must be between 1 and ${limits.maxCompressedBytes} bytes.`,
      "POWERTAB_COMPRESSED_SIZE_LIMIT"
    );
  }
  if (!/\.pt2$/iu.test(fileNameOf(file))) {
    fail(
      "The PowerTab .pt2 decoder accepts .pt2 files only. Legacy .ptb files require the separate historical parser.",
      "INVALID_POWERTAB_EXTENSION"
    );
  }
  return decodePowerTabPt2Bytes(
    new Uint8Array(await file.arrayBuffer()),
    options
  );
}

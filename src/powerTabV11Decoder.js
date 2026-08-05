import { POWERTAB_LIMITS } from "./powerTabLimits";
import {
  decompressGzip,
  fileNameOf,
  parseJson,
  validateGzipHeader,
} from "./powerTabV11Container";
import { scoreTitle } from "./powerTabV11Notation";
import { fail, requireArray, requireObject, requireOptionalArray } from "./powerTabV11Shared";
import { buildTracks } from "./powerTabV11Systems";

export function decodePowerTabV11Document(root, { limits = POWERTAB_LIMITS } = {}) {
  const document = requireObject(root, "PowerTab document");
  if (document.version !== 11) {
    fail(
      `The PowerTab document reports internal version ${String(
        document.version ?? "missing"
      )}. This checkpoint accepts exact version 11 only.`,
      "UNTESTED_POWERTAB_VERSION"
    );
  }
  const score = requireObject(document.score, "PowerTab score");
  if (
    requireOptionalArray(score.chord_diagrams, "PowerTab score chord diagrams")
      .length > 0
  ) {
    fail(
      "The PowerTab score contains chord diagrams outside the bounded v11 profile.",
      "UNSUPPORTED_POWERTAB_SCORE_STRUCTURE"
    );
  }
  const tracks = buildTracks(score, limits);

  return {
    schemaVersion: 1,
    sourceVersion: "PT2_V11",
    versionEvidence: {
      schemaVersion: 1,
      containerFamily: "POWERTAB_PT2_GZIP_JSON",
      extensionFamily: ".pt2",
      compression: "gzip",
      serialization: "json",
      rootKey: "score",
      internalVersion: 11,
      upstreamRelease: "2.0.22",
      upstreamCommit: "13cab27c7127d301f2747671071e53eb203dc940",
      declaredPlayerCount: requireArray(score.players, "PowerTab score players")
        .length,
      decodedTrackCount: tracks.length,
    },
    title: scoreTitle(score.score_info),
    tracks,
  };
}

export async function decodePowerTabV11Bytes(
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
  return decodePowerTabV11Document(parseJson(decompressed), { limits });
}

export async function decodePowerTabV11File(file, options = {}) {
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
      "The PowerTab v11 decoder accepts .pt2 files only. Legacy .ptb files require a separate parser.",
      "INVALID_POWERTAB_EXTENSION"
    );
  }
  return decodePowerTabV11Bytes(
    new Uint8Array(await file.arrayBuffer()),
    options
  );
}

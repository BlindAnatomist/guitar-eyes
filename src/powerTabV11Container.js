import { PowerTabImportError } from "./powerTabErrors";
import { fail } from "./powerTabV11Shared";

export function fileNameOf(file) {
  return String(file?.name || "PowerTab.pt2");
}

export function validateGzipHeader(bytes) {
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

export async function decompressGzip(bytes, limits) {
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

export function parseJson(bytes) {
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


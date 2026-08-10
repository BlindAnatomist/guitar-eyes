import { PowerTabImportError } from "./powerTabErrors";
import { decodePowerTabLegacyHistoricalBytes } from "./powerTabLegacyHistoricalDecoder";
import { decodePowerTabLegacyV17Bytes } from "./powerTabLegacyV17Decoder";

const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024;

function fail(message, code) {
  throw new PowerTabImportError(message, code);
}

function asBytes(input) {
  return input instanceof Uint8Array
    ? input
    : new Uint8Array(input || new ArrayBuffer(0));
}

function readVersion(bytes) {
  if (bytes.length < 6) {
    fail(
      "The legacy PowerTab file is too short to contain a complete ptab version header.",
      "TRUNCATED_POWERTAB_LEGACY"
    );
  }
  if (
    bytes[0] !== 0x70 ||
    bytes[1] !== 0x74 ||
    bytes[2] !== 0x61 ||
    bytes[3] !== 0x62
  ) {
    fail(
      "The selected .ptb file does not contain the PowerTab ptab marker.",
      "INVALID_POWERTAB_LEGACY_MARKER"
    );
  }
  return bytes[4] | (bytes[5] << 8);
}

export function decodePowerTabLegacyBytes(input, options = {}) {
  const bytes = asBytes(input);
  const maxFileBytes = options.maxFileBytes || DEFAULT_MAX_FILE_BYTES;
  if (bytes.length === 0 || bytes.length > maxFileBytes) {
    fail(
      `The selected legacy PowerTab file must be between 1 and ${maxFileBytes} bytes.`,
      "POWERTAB_LEGACY_FILE_SIZE_LIMIT"
    );
  }

  const fileVersion = readVersion(bytes);
  if (fileVersion >= 1 && fileVersion <= 3) {
    return decodePowerTabLegacyHistoricalBytes(bytes, options);
  }
  if (fileVersion === 4) {
    return decodePowerTabLegacyV17Bytes(bytes, options);
  }
  fail(
    `The legacy PowerTab file reports unsupported file-version value ${fileVersion}. Guitar Eyes currently recognizes historical values 1 through 4 only.`,
    "INVALID_POWERTAB_LEGACY_VERSION"
  );
}

export async function decodePowerTabLegacyFile(file, options = {}) {
  if (!file || typeof file.arrayBuffer !== "function") {
    fail(
      "A readable legacy PowerTab .ptb file is required.",
      "INVALID_POWERTAB_LEGACY_FILE"
    );
  }
  if (!/\.ptb$/iu.test(String(file.name || ""))) {
    fail(
      "The legacy PowerTab decoder accepts .ptb files only.",
      "INVALID_POWERTAB_LEGACY_EXTENSION"
    );
  }
  const maxFileBytes = options.maxFileBytes || DEFAULT_MAX_FILE_BYTES;
  if (
    !Number.isInteger(file.size) ||
    file.size <= 0 ||
    file.size > maxFileBytes
  ) {
    fail(
      `The selected legacy PowerTab file must be between 1 and ${maxFileBytes} bytes.`,
      "POWERTAB_LEGACY_FILE_SIZE_LIMIT"
    );
  }
  return decodePowerTabLegacyBytes(
    new Uint8Array(await file.arrayBuffer()),
    options
  );
}

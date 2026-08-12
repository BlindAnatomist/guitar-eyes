import { TuxGuitarImportError } from "./tuxGuitarDecoder";

export const STANDARD_BASS = Object.freeze([43, 38, 33, 28]);
export const STANDARD_GUITAR = Object.freeze([64, 59, 55, 50, 45, 40]);
export const MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
export const MAX_XML_BYTES = 8 * 1024 * 1024;

export function fail(message, code = "UNSUPPORTED_TUXGUITAR_STANDARD_BASS") {
  throw new TuxGuitarImportError(message, code);
}

export function requireValue(condition, message, code) {
  if (!condition) fail(message, code);
}

export function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function memoryFile(file, bytes) {
  return {
    name: String(file?.name || "tablature.tg"),
    size: bytes.byteLength,
    type: String(file?.type || ""),
    arrayBuffer: async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ),
  };
}

import { decodeTuxGuitarFile, TuxGuitarImportError } from "./tuxGuitarDecoder";
import { decodeStandardBassTuxGuitarFile } from "./tuxGuitarStandardBassAdapter";

const BASS_RETRY_CODES = new Set([
  "UNSUPPORTED_TUXGUITAR_STRING_COUNT",
  "UNSUPPORTED_TUXGUITAR_TUNING",
  "UNSUPPORTED_TUXGUITAR_CLEF",
]);

function memoryFile(file, bytes) {
  return {
    name: String(file?.name || "tablature.tg"),
    size: bytes.byteLength,
    type: String(file?.type || ""),
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}

export async function decodeTuxGuitarProfileFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") return decodeTuxGuitarFile(file);
  const bytes = new Uint8Array(await file.arrayBuffer()).slice();
  try {
    return await decodeTuxGuitarFile(memoryFile(file, bytes));
  } catch (error) {
    if (!(error instanceof TuxGuitarImportError) || !BASS_RETRY_CODES.has(error.code)) throw error;
    try {
      return await decodeStandardBassTuxGuitarFile(memoryFile(file, bytes));
    } catch {
      throw error;
    }
  }
}

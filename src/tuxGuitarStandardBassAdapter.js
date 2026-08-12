import { decodeTuxGuitarFile } from "./tuxGuitarDecoder";
import { canonicalizeLegacyBass } from "./tuxGuitarStandardBassLegacy";
import { canonicalizeModernBass } from "./tuxGuitarStandardBassModern";
import {
  MAX_ARCHIVE_BYTES,
  STANDARD_BASS,
  STANDARD_GUITAR,
  arraysEqual,
  memoryFile,
  requireValue,
} from "./tuxGuitarStandardBassShared";

function restoreBassIntermediate(intermediate) {
  const tracks = intermediate.tracks;
  requireValue(Array.isArray(tracks) && tracks.length === 1, "The accepted TuxGuitar decoder returned an unexpected track count.", "INVALID_TUXGUITAR_TRACK_COUNT");
  const staff = tracks[0]?.staves?.[0];
  requireValue(staff && arraysEqual(staff.tuningMidiHighToLow || [], STANDARD_GUITAR), "The accepted TuxGuitar decoder returned an unexpected canonical tuning.", "INVALID_TUXGUITAR_TUNING");
  staff.tuningMidiHighToLow = [...STANDARD_BASS];
  staff.bars.forEach((bar) => bar.voices.forEach((voice) => voice.beats.forEach((beat) => beat.notes.forEach((note) => {
    note.stringNumberLowToHigh -= 2;
    requireValue(note.stringNumberLowToHigh >= 1 && note.stringNumberLowToHigh <= 4, "A canonicalized TuxGuitar bass note maps outside four strings.", "TUXGUITAR_STRING_OUT_OF_RANGE");
  }))));
  intermediate.versionEvidence = {
    ...intermediate.versionEvidence,
    profileEvidence: "standard-four-string-bass-g2-d2-a1-e1",
    semanticCanonicalization: "accepted-tuxguitar-guitar-decoder",
  };
  return intermediate;
}

export async function decodeStandardBassTuxGuitarFile(file) {
  requireValue(file && typeof file.arrayBuffer === "function", "Choose a TuxGuitar .tg file first.", "MISSING_TUXGUITAR_FILE");
  const bytes = new Uint8Array(await file.arrayBuffer()).slice();
  requireValue(bytes.byteLength > 0 && bytes.byteLength <= MAX_ARCHIVE_BYTES, "The TuxGuitar bass file is empty or too large.", "TUXGUITAR_FILE_SIZE_LIMIT");
  const canonical = bytes[0] === 0x50 && bytes[1] === 0x4b ? await canonicalizeModernBass(bytes) : canonicalizeLegacyBass(bytes);
  const intermediate = await decodeTuxGuitarFile(memoryFile(file, canonical));
  return restoreBassIntermediate(intermediate);
}


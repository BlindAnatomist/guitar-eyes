import {
  STANDARD_BASS,
  STANDARD_GUITAR,
  arraysEqual,
  requireValue,
} from "./tuxGuitarStandardBassShared";
import { readModernEntries, zipStored } from "./tuxGuitarStandardBassZip";

export async function canonicalizeModernBass(bytes) {
  requireValue(typeof DOMParser === "function" && typeof XMLSerializer === "function", "This browser cannot transform TuxGuitar bass XML.", "TUXGUITAR_DOM_UNAVAILABLE");
  const entries = await readModernEntries(bytes);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const versionText = decoder.decode(entries.get("version.txt")).trim();
  requireValue(versionText === "TuxGuitar_file_format 2.0.0", "The modern TuxGuitar bass file is not native format 2.0.0.", "UNSUPPORTED_TUXGUITAR_VERSION");
  const xml = decoder.decode(entries.get("content.xml"));
  requireValue(!/<!DOCTYPE\s|<!ENTITY\s/i.test(xml), "The TuxGuitar bass XML contains a document type or entity declaration.", "UNSAFE_TUXGUITAR_XML");
  const document = new DOMParser().parseFromString(xml, "application/xml");
  requireValue(document.getElementsByTagName("parsererror").length === 0, "The TuxGuitar bass XML is malformed.", "INVALID_TUXGUITAR_XML");
  const tracks = Array.from(document.getElementsByTagName("TGTrack"));
  requireValue(tracks.length === 1, "The bounded TuxGuitar bass profile accepts exactly one track.", "UNSUPPORTED_TUXGUITAR_TRACK_COUNT");
  const strings = Array.from(tracks[0].children).filter((node) => node.nodeName === "TGString");
  const tuning = strings.map((node) => Number(String(node.textContent || "").trim()));
  requireValue(arraysEqual(tuning, STANDARD_BASS), "The bounded TuxGuitar bass profile requires standard G2 D2 A1 E1 tuning.", "UNSUPPORTED_TUXGUITAR_TUNING");
  strings.forEach((node) => node.parentNode.removeChild(node));
  const lyric = Array.from(tracks[0].children).find((node) => node.nodeName === "TGLyric");
  requireValue(lyric, "The TuxGuitar bass track is missing its lyric boundary.", "INVALID_TUXGUITAR_XML");
  STANDARD_GUITAR.forEach((pitch) => { const node = document.createElement("TGString"); node.textContent = String(pitch); tracks[0].insertBefore(node, lyric); });
  const clefs = Array.from(tracks[0].getElementsByTagName("clef"));
  requireValue(clefs.length > 0 && clefs.every((node) => String(node.textContent || "").trim() === "bass"), "The bounded TuxGuitar bass profile requires bass clef.", "UNSUPPORTED_TUXGUITAR_CLEF");
  clefs.forEach((node) => { node.textContent = "treble"; });
  const serialized = new XMLSerializer().serializeToString(document);
  return zipStored([["version.txt", new TextEncoder().encode(versionText)], ["content.xml", new TextEncoder().encode(serialized)]]);
}


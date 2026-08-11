import {
  decodeTuxGuitarFile as decodeProvisionalTuxGuitarFile,
  TuxGuitarImportError,
} from "./tuxGuitarDecoderProvisional";

export { TuxGuitarImportError };

const UPSTREAM_RELEASE = "2.1.0";
const UPSTREAM_COMMIT = "2c46e2a1cccdfdfa6e6f2692f241bd60bf418129";
const MODERN_VERSION_TEXT = "TuxGuitar_file_format 2.0.0";
const STANDARD_GUITAR_TUNING = Object.freeze([64, 59, 55, 50, 45, 40]);
const MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
const MAX_CENTRAL_DIRECTORY_BYTES = 64 * 1024;
const MAX_XML_BYTES = 8 * 1024 * 1024;
const PRECISE_UNITS_PER_TICK = 3003;
const START_TICKS = 960;

function fail(message, code = "TUXGUITAR_IMPORT_ERROR") {
  throw new TuxGuitarImportError(message, code);
}

function requireValue(condition, message, code) {
  if (!condition) fail(message, code);
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function durationTicks(duration) {
  requireValue(
    duration.dots === 0 && duration.tupletNumerator === -1,
    "The first TuxGuitar profile does not include dotted or tuplet timing.",
    "UNSUPPORTED_TUXGUITAR_DURATION"
  );
  return 3840 / duration.durationDenominator;
}

function requireFirstProfileTracks(intermediate) {
  requireValue(
    Array.isArray(intermediate?.tracks) && intermediate.tracks.length === 1,
    "The first TuxGuitar checkpoint accepts exactly one guitar track.",
    "UNSUPPORTED_TUXGUITAR_TRACK_COUNT"
  );
  const tuning = intermediate.tracks[0]?.staves?.[0]?.tuningMidiHighToLow;
  requireValue(
    Array.isArray(tuning) && arraysEqual(tuning, STANDARD_GUITAR_TUNING),
    "The first TuxGuitar checkpoint is bounded to standard six-string guitar tuning.",
    "UNSUPPORTED_TUXGUITAR_TUNING"
  );
}

function withCurrentAuthority(intermediate) {
  requireFirstProfileTracks(intermediate);
  return {
    ...intermediate,
    versionEvidence: {
      ...intermediate.versionEvidence,
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
    },
  };
}

function findEndOfCentralDirectory(view) {
  requireValue(
    view.byteLength >= 22,
    "The modern TuxGuitar .tg ZIP central directory is missing.",
    "INVALID_TUXGUITAR_ZIP"
  );
  const earliest = Math.max(0, view.byteLength - 65557);
  for (let offset = view.byteLength - 22; offset >= earliest; offset -= 1) {
    if (view.getUint32(offset, true) !== 0x06054b50) continue;
    const commentLength = view.getUint16(offset + 20, true);
    if (offset + 22 + commentLength === view.byteLength) return offset;
  }
  fail(
    "The modern TuxGuitar .tg ZIP central directory is missing.",
    "INVALID_TUXGUITAR_ZIP"
  );
}

function decodeUtf8(bytes, label) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`${label} is not valid UTF-8 text.`, "INVALID_TUXGUITAR_TEXT");
  }
}

function parseZip(bytes) {
  requireValue(
    bytes.byteLength <= MAX_ARCHIVE_BYTES,
    "The TuxGuitar archive exceeds the checkpoint size limit.",
    "TUXGUITAR_ARCHIVE_LIMIT"
  );
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(view);
  const diskNumber = view.getUint16(eocd + 4, true);
  const centralDisk = view.getUint16(eocd + 6, true);
  const entriesOnDisk = view.getUint16(eocd + 8, true);
  const totalEntries = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);

  requireValue(
    diskNumber === 0 && centralDisk === 0 && entriesOnDisk === totalEntries,
    "Multi-disk or inconsistent TuxGuitar ZIP archives are not supported.",
    "INVALID_TUXGUITAR_ZIP"
  );
  requireValue(
    totalEntries !== 0xffff &&
      centralSize !== 0xffffffff &&
      centralOffset !== 0xffffffff,
    "ZIP64 TuxGuitar archives are outside this checkpoint.",
    "UNSUPPORTED_TUXGUITAR_ZIP64"
  );
  requireValue(
    totalEntries === 2,
    "The modern TuxGuitar archive must contain exactly version.txt and content.xml.",
    "INVALID_TUXGUITAR_ZIP"
  );
  requireValue(
    centralSize <= MAX_CENTRAL_DIRECTORY_BYTES &&
      centralOffset + centralSize <= eocd,
    "The TuxGuitar ZIP central directory is invalid or too large.",
    "INVALID_TUXGUITAR_ZIP"
  );

  const entries = [];
  let cursor = centralOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    requireValue(
      cursor + 46 <= bytes.byteLength &&
        view.getUint32(cursor, true) === 0x02014b50,
      "A TuxGuitar ZIP central-directory entry is invalid.",
      "INVALID_TUXGUITAR_ZIP"
    );
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const diskStart = view.getUint16(cursor + 34, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + nameLength;

    requireValue(
      nameEnd + extraLength + commentLength <= bytes.byteLength,
      "A TuxGuitar ZIP central-directory entry is truncated.",
      "INVALID_TUXGUITAR_ZIP"
    );
    requireValue(
      (flags & 0x1) === 0 && (method === 0 || method === 8),
      "The TuxGuitar ZIP uses encryption or unsupported compression.",
      "UNSUPPORTED_TUXGUITAR_ZIP"
    );
    requireValue(
      diskStart === 0 &&
        compressedSize !== 0xffffffff &&
        uncompressedSize !== 0xffffffff &&
        localHeaderOffset !== 0xffffffff,
      "The TuxGuitar ZIP uses an unsupported disk or ZIP64 entry.",
      "UNSUPPORTED_TUXGUITAR_ZIP64"
    );

    const name = decodeUtf8(
      bytes.subarray(nameStart, nameEnd),
      "A TuxGuitar ZIP entry name"
    );
    entries.push({
      name,
      flags,
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });
    cursor = nameEnd + extraLength + commentLength;
  }

  requireValue(
    cursor === centralOffset + centralSize,
    "The TuxGuitar ZIP central-directory size does not match its entries.",
    "INVALID_TUXGUITAR_ZIP"
  );
  const names = entries.map((entry) => entry.name);
  requireValue(
    new Set(names).size === 2 &&
      names.includes("version.txt") &&
      names.includes("content.xml"),
    "The modern TuxGuitar archive must contain only version.txt and content.xml.",
    "INVALID_TUXGUITAR_ZIP"
  );
  return { view, entries };
}

async function inflateRaw(bytes, maxBytes) {
  requireValue(
    typeof DecompressionStream === "function",
    "This browser cannot expand compressed TuxGuitar archive entries.",
    "TUXGUITAR_DECOMPRESSION_UNAVAILABLE"
  );
  let stream;
  try {
    stream = new DecompressionStream("deflate-raw");
  } catch {
    fail(
      "This browser cannot expand raw DEFLATE TuxGuitar entries.",
      "TUXGUITAR_DECOMPRESSION_UNAVAILABLE"
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
        fail(
          "A TuxGuitar archive entry exceeds the extraction limit.",
          "TUXGUITAR_ARCHIVE_EXPANSION_LIMIT"
        );
      }
      chunks.push(chunk);
    }
  } catch (error) {
    if (error instanceof TuxGuitarImportError) throw error;
    fail(
      "A compressed TuxGuitar archive entry could not be expanded.",
      "TUXGUITAR_DECOMPRESSION_FAILED"
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

async function readZipEntry(bytes, zip, name, maxBytes) {
  const entry = zip.entries.find((candidate) => candidate.name === name);
  requireValue(
    entry,
    `The modern TuxGuitar archive is missing ${name}.`,
    "INVALID_TUXGUITAR_ZIP"
  );
  requireValue(
    entry.uncompressedSize <= maxBytes,
    `${name} exceeds the extraction limit.`,
    "TUXGUITAR_ARCHIVE_EXPANSION_LIMIT"
  );

  const view = zip.view;
  const offset = entry.localHeaderOffset;
  requireValue(
    offset + 30 <= bytes.byteLength &&
      view.getUint32(offset, true) === 0x04034b50,
    `${name} has an invalid local ZIP header.`,
    "INVALID_TUXGUITAR_ZIP"
  );
  const localFlags = view.getUint16(offset + 6, true);
  const localMethod = view.getUint16(offset + 8, true);
  const localCompressedSize = view.getUint32(offset + 18, true);
  const localUncompressedSize = view.getUint32(offset + 22, true);
  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const nameStart = offset + 30;
  const nameEnd = nameStart + nameLength;
  const dataStart = nameEnd + extraLength;
  const dataEnd = dataStart + entry.compressedSize;

  requireValue(
    (localFlags & 0x1) === 0,
    `${name} is encrypted.`,
    "UNSUPPORTED_TUXGUITAR_ZIP"
  );
  requireValue(
    localMethod === entry.method,
    `${name} has conflicting compression metadata.`,
    "INVALID_TUXGUITAR_ZIP"
  );
  requireValue(
    nameEnd <= bytes.byteLength,
    `${name} has a truncated local filename.`,
    "INVALID_TUXGUITAR_ZIP"
  );
  const localName = decodeUtf8(
    bytes.subarray(nameStart, nameEnd),
    `The local ZIP filename for ${name}`
  );
  requireValue(
    localName === name,
    `${name} has conflicting local filename metadata.`,
    "INVALID_TUXGUITAR_ZIP"
  );
  if ((localFlags & 0x8) === 0) {
    requireValue(
      localCompressedSize === entry.compressedSize &&
        localUncompressedSize === entry.uncompressedSize,
      `${name} has conflicting local size metadata.`,
      "INVALID_TUXGUITAR_ZIP"
    );
  }
  requireValue(
    dataEnd <= bytes.byteLength,
    `${name} has truncated archive data.`,
    "INVALID_TUXGUITAR_ZIP"
  );

  const compressed = bytes.subarray(dataStart, dataEnd);
  const output =
    entry.method === 0
      ? new Uint8Array(compressed)
      : await inflateRaw(compressed, maxBytes);
  requireValue(
    output.byteLength === entry.uncompressedSize,
    `${name} expanded to an unexpected size.`,
    "INVALID_TUXGUITAR_ZIP"
  );
  return output;
}

function direct(node, name) {
  return Array.from(node?.children || []).filter(
    (candidate) => candidate.localName === name || candidate.nodeName === name
  );
}

function one(node, name, required = true) {
  const matches = direct(node, name);
  if (required) {
    requireValue(
      matches.length === 1,
      `The TuxGuitar XML requires one ${name} element.`,
      "INVALID_TUXGUITAR_XML"
    );
  } else {
    requireValue(
      matches.length <= 1,
      `The TuxGuitar XML contains duplicate ${name} elements.`,
      "INVALID_TUXGUITAR_XML"
    );
  }
  return matches[0] || null;
}

function text(node, name, fallback = "") {
  const child = one(node, name, false);
  return child ? String(child.textContent || "").trim() : fallback;
}

function intText(node, name, fallback = null) {
  const source = text(node, name, fallback === null ? "" : String(fallback));
  const value = Number(source);
  requireValue(
    Number.isInteger(value),
    `The TuxGuitar XML ${name} value is invalid.`,
    "INVALID_TUXGUITAR_XML"
  );
  return value;
}

function parseApplicationVersion(root) {
  const node = one(root, "TGVersion");
  const major = Number(node.getAttribute("major"));
  const minor = Number(node.getAttribute("minor"));
  const revision = Number(node.getAttribute("revision"));
  requireValue(
    Number.isInteger(major) &&
      Number.isInteger(minor) &&
      Number.isInteger(revision) &&
      major === 2 &&
      minor >= 0 &&
      minor <= 1 &&
      revision >= 0,
    "The TuxGuitar XML application-version metadata is outside the proven 2.0-2.1 producer range.",
    "UNSUPPORTED_TUXGUITAR_PRODUCER_VERSION"
  );
  return `${major}.${minor}.${revision}`;
}

function mapStrings(track) {
  const stringCount = track.staves[0].tuningMidiHighToLow.length;
  track.staves[0].bars.forEach((bar) =>
    bar.voices.forEach((voice) =>
      voice.beats.forEach((beat) =>
        beat.notes.forEach((note) => {
          requireValue(
            note.sourceString >= 1 && note.sourceString <= stringCount,
            "A TuxGuitar note references a string outside the track tuning.",
            "TUXGUITAR_STRING_OUT_OF_RANGE"
          );
          note.stringNumberLowToHigh = stringCount - note.sourceString + 1;
          delete note.sourceString;
        })
      )
    )
  );
}

function parseModernXml(source) {
  requireValue(
    !/<!DOCTYPE\s|<!ENTITY\s/i.test(source),
    "The TuxGuitar XML contains a document type or custom entity declaration.",
    "UNSAFE_TUXGUITAR_XML"
  );
  requireValue(
    typeof DOMParser === "function",
    "This browser cannot parse TuxGuitar XML.",
    "TUXGUITAR_DOM_UNAVAILABLE"
  );
  const document = new DOMParser().parseFromString(source, "application/xml");
  requireValue(
    document.getElementsByTagName("parsererror").length === 0,
    "The TuxGuitar content.xml is malformed.",
    "INVALID_TUXGUITAR_XML"
  );
  const root = document.documentElement;
  requireValue(
    root?.nodeName === "TuxGuitarFile",
    "The TuxGuitar XML root is invalid.",
    "INVALID_TUXGUITAR_XML"
  );
  const producerApplicationVersion = parseApplicationVersion(root);
  const song = one(root, "TGSong");
  const title = text(song, "name", "TuxGuitar tablature");
  const headerNodes = direct(song, "TGMeasureHeader");
  requireValue(
    headerNodes.length > 0 && headerNodes.length <= 4096,
    "The TuxGuitar measure-header count is outside the limit.",
    "TUXGUITAR_MEASURE_LIMIT"
  );
  const headers = headerNodes.map((header, index) => {
    requireValue(
      direct(header, "repeatOpen").length === 0 &&
        direct(header, "repeatClose").length === 0 &&
        direct(header, "repeatAlternative").length === 0 &&
        direct(header, "marker").length === 0,
      "Repeats or markers are outside the first TuxGuitar profile.",
      "UNSUPPORTED_TUXGUITAR_MEASURE_STRUCTURE"
    );
    const signature = one(header, "timeSignature");
    const numerator = Number(signature.getAttribute("numerator"));
    const denominator = Number(signature.getAttribute("denominator"));
    requireValue(
      numerator === 4 && denominator === 4,
      `TuxGuitar measure ${index + 1} is not 4/4.`,
      "UNSUPPORTED_TUXGUITAR_METER"
    );
    return { numerator, denominator };
  });

  const trackNodes = direct(song, "TGTrack");
  requireValue(
    trackNodes.length === 1,
    "The first TuxGuitar checkpoint accepts exactly one guitar track.",
    "UNSUPPORTED_TUXGUITAR_TRACK_COUNT"
  );
  const tracks = trackNodes.map((trackNode, trackIndex) => {
    requireValue(
      !one(trackNode, "soloMute", false),
      "Solo/mute track state is outside the first TuxGuitar profile.",
      "UNSUPPORTED_TUXGUITAR_TRACK_STATE"
    );
    const tuning = direct(trackNode, "TGString").map((node) =>
      Number(String(node.textContent || "").trim())
    );
    requireValue(
      arraysEqual(tuning, STANDARD_GUITAR_TUNING),
      "The first TuxGuitar checkpoint is bounded to standard six-string guitar tuning.",
      "UNSUPPORTED_TUXGUITAR_TUNING"
    );
    const measureNodes = direct(trackNode, "TGMeasure");
    requireValue(
      measureNodes.length === headers.length,
      "The TuxGuitar track measure count contradicts the song headers.",
      "INVALID_TUXGUITAR_XML"
    );

    const bars = [];
    let sequentialTicks = START_TICKS;
    measureNodes.forEach((measure, measureIndex) => {
      const measureStartTicks = sequentialTicks;
      const clef = text(measure, "clef", measureIndex === 0 ? "treble" : "");
      if (clef) {
        requireValue(
          clef === "treble",
          "Only treble-clef guitar measures are accepted.",
          "UNSUPPORTED_TUXGUITAR_CLEF"
        );
      }
      const key = text(measure, "keySignature", measureIndex === 0 ? "0" : "");
      if (key) {
        requireValue(
          Number(key) === 0,
          "Key-signature changes are outside the first profile.",
          "UNSUPPORTED_TUXGUITAR_KEY"
        );
      }

      const beats = [];
      direct(measure, "TGBeat").forEach((beatNode, beatIndex) => {
        requireValue(
          direct(beatNode, "stroke").length === 0 &&
            direct(beatNode, "pickStroke").length === 0 &&
            direct(beatNode, "chord").length === 0 &&
            direct(beatNode, "text").length === 0,
          "A TuxGuitar beat object is outside the first profile.",
          "UNSUPPORTED_TUXGUITAR_BEAT_OBJECT"
        );
        const voices = direct(beatNode, "voice");
        const activeVoices = voices.filter(
          (voice) => String(voice.getAttribute("empty") || "false") !== "true"
        );
        requireValue(
          activeVoices.length === 1,
          "The first TuxGuitar profile requires exactly one active voice per beat.",
          "MULTIPLE_TUXGUITAR_VOICES"
        );
        const voice = activeVoices[0];
        const durationNode = one(voice, "duration");
        const durationDenominator = Number(durationNode.getAttribute("value"));
        const dotted = String(durationNode.getAttribute("dotted") || "");
        requireValue(
          [1, 2, 4, 8, 16, 32, 64].includes(durationDenominator) &&
            !dotted &&
            direct(durationNode, "divisionType").length === 0,
          "The beat uses unsupported duration timing.",
          "UNSUPPORTED_TUXGUITAR_DURATION"
        );

        const notes = direct(voice, "note").map((noteNode) => {
          const fret = Number(noteNode.getAttribute("value"));
          const sourceString = Number(noteNode.getAttribute("string"));
          requireValue(
            Number.isInteger(fret) && Number.isInteger(sourceString),
            "A TuxGuitar note lacks fret/string coordinates.",
            "INVALID_TUXGUITAR_NOTE"
          );
          const allowedChildren = new Set(["palmMute"]);
          for (const child of Array.from(noteNode.children || [])) {
            requireValue(
              allowedChildren.has(child.nodeName),
              `A TuxGuitar note effect ${child.nodeName} is outside the first profile.`,
              "UNSUPPORTED_TUXGUITAR_EFFECT"
            );
          }
          requireValue(
            noteNode.getAttribute("tiedNote") !== "true",
            "Tied notes are outside the first profile.",
            "UNSUPPORTED_TUXGUITAR_TIE"
          );
          return {
            sourceString,
            fret,
            visible: true,
            isDead: false,
            techniques:
              direct(noteNode, "palmMute").length === 1 ? ["palm mute"] : [],
          };
        });

        const sourcePreciseStart = intText(beatNode, "preciseStart");
        requireValue(
          sourcePreciseStart === sequentialTicks * PRECISE_UNITS_PER_TICK,
          `TuxGuitar measure ${measureIndex + 1} beat ${beatIndex + 1} has a preciseStart outside the bounded sequential profile.`,
          "INVALID_TUXGUITAR_PRECISE_START"
        );
        const beat = {
          startTicks: sequentialTicks,
          sourcePreciseStart,
          isRest: notes.length === 0,
          durationDenominator,
          dots: 0,
          tupletNumerator: -1,
          tupletDenominator: -1,
          graceType: "none",
          techniques: [],
          notes,
        };
        beats.push(beat);
        sequentialTicks += durationTicks(beat);
      });
      requireValue(
        sequentialTicks - measureStartTicks === 3840,
        `TuxGuitar measure ${measureIndex + 1} does not fill exactly one 4/4 measure in the first profile.`,
        "UNSUPPORTED_TUXGUITAR_MEASURE_DURATION"
      );
      bars.push({
        sourceNumber: measureIndex + 1,
        timeSignatureNumerator: headers[measureIndex].numerator,
        timeSignatureDenominator: headers[measureIndex].denominator,
        repeatStart: false,
        repeatCount: 0,
        alternateEndings: 0,
        voices: [{ beats }],
      });
    });

    const track = {
      name: text(trackNode, "name", `Track ${trackIndex + 1}`),
      shortName: "",
      isPercussion: false,
      staves: [{ tuningMidiHighToLow: tuning, bars }],
    };
    mapStrings(track);
    return track;
  });

  return { title, tracks, producerApplicationVersion };
}

async function readModern(bytes) {
  const zip = parseZip(bytes);
  const versionBytes = await readZipEntry(bytes, zip, "version.txt", 256);
  const contentBytes = await readZipEntry(
    bytes,
    zip,
    "content.xml",
    MAX_XML_BYTES
  );
  const versionText = decodeUtf8(versionBytes, "TuxGuitar version.txt").trim();
  const xml = decodeUtf8(contentBytes, "TuxGuitar content.xml");
  requireValue(
    versionText === MODERN_VERSION_TEXT,
    `The modern .tg archive reports ${versionText || "no version"}; this checkpoint requires exact TuxGuitar file format 2.0.0 evidence.`,
    "UNSUPPORTED_TUXGUITAR_VERSION"
  );
  const parsed = parseModernXml(xml);
  return {
    schemaVersion: 1,
    sourceVersion: "TG_2_0",
    title: parsed.title,
    tracks: parsed.tracks,
    versionEvidence: {
      schemaVersion: 1,
      containerFamily: "TUXGUITAR_ZIP_XML",
      extensionFamily: ".tg",
      formatVersion: "2.0.0",
      versionText,
      versionEntry: "version.txt",
      contentEntry: "content.xml",
      producerApplicationVersion: parsed.producerApplicationVersion,
      upstreamRelease: UPSTREAM_RELEASE,
      upstreamCommit: UPSTREAM_COMMIT,
      declaredTrackCount: parsed.tracks.length,
      decodedTrackCount: parsed.tracks.length,
    },
  };
}

export async function decodeTuxGuitarFile(file) {
  requireValue(
    file && typeof file.arrayBuffer === "function",
    "Choose a TuxGuitar .tg file first.",
    "MISSING_TUXGUITAR_FILE"
  );
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  requireValue(
    bytes.byteLength > 0 && bytes.byteLength <= MAX_ARCHIVE_BYTES,
    "The TuxGuitar file is empty or exceeds the checkpoint size limit.",
    "TUXGUITAR_FILE_SIZE_LIMIT"
  );
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return readModern(bytes);
  }
  const copy = bytes.slice();
  const provisional = await decodeProvisionalTuxGuitarFile({
    arrayBuffer: async () => copy.buffer,
  });
  return withCurrentAuthority(provisional);
}

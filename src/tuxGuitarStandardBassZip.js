import {
  MAX_XML_BYTES,
  fail,
  requireValue,
} from "./tuxGuitarStandardBassShared";

function findEocd(view) {
  for (let offset = view.byteLength - 22; offset >= Math.max(0, view.byteLength - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50 && offset + 22 + view.getUint16(offset + 20, true) === view.byteLength) return offset;
  }
  fail("The TuxGuitar bass ZIP central directory is missing.", "INVALID_TUXGUITAR_ZIP");
}
async function inflateRaw(bytes, maxBytes) {
  requireValue(typeof DecompressionStream === "function", "This browser cannot expand compressed TuxGuitar entries.", "TUXGUITAR_DECOMPRESSION_UNAVAILABLE");
  const stream = new DecompressionStream("deflate-raw");
  const output = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
  requireValue(output.byteLength <= maxBytes, "A TuxGuitar bass ZIP entry exceeds the extraction limit.", "TUXGUITAR_ARCHIVE_EXPANSION_LIMIT");
  return output;
}
export async function readModernEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEocd(view);
  const count = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  requireValue(count === 2 && centralOffset + centralSize <= eocd, "The modern TuxGuitar bass archive must contain exactly two entries.", "INVALID_TUXGUITAR_ZIP");
  let cursor = centralOffset;
  const entries = new Map();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  for (let index = 0; index < count; index += 1) {
    requireValue(view.getUint32(cursor, true) === 0x02014b50, "The TuxGuitar bass ZIP central entry is invalid.", "INVALID_TUXGUITAR_ZIP");
    const flags = view.getUint16(cursor + 8, true), method = view.getUint16(cursor + 10, true), compressedSize = view.getUint32(cursor + 20, true), uncompressedSize = view.getUint32(cursor + 24, true), nameLength = view.getUint16(cursor + 28, true), extraLength = view.getUint16(cursor + 30, true), commentLength = view.getUint16(cursor + 32, true), localOffset = view.getUint32(cursor + 42, true);
    requireValue((flags & 1) === 0 && (method === 0 || method === 8), "The TuxGuitar bass ZIP uses unsupported encryption or compression.", "UNSUPPORTED_TUXGUITAR_ZIP");
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    requireValue(view.getUint32(localOffset, true) === 0x04034b50, "The TuxGuitar bass ZIP local header is invalid.", "INVALID_TUXGUITAR_ZIP");
    const localNameLength = view.getUint16(localOffset + 26, true), localExtraLength = view.getUint16(localOffset + 28, true), start = localOffset + 30 + localNameLength + localExtraLength, end = start + compressedSize;
    requireValue(end <= bytes.length && uncompressedSize <= MAX_XML_BYTES, "A TuxGuitar bass ZIP entry is truncated or too large.", "TUXGUITAR_ARCHIVE_EXPANSION_LIMIT");
    const packed = bytes.subarray(start, end);
    const data = method === 0 ? new Uint8Array(packed) : await inflateRaw(packed, MAX_XML_BYTES);
    requireValue(data.byteLength === uncompressedSize, "A TuxGuitar bass ZIP entry expanded to an unexpected size.", "INVALID_TUXGUITAR_ZIP");
    entries.set(name, data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  requireValue(entries.size === 2 && entries.has("version.txt") && entries.has("content.xml"), "The modern TuxGuitar bass archive must contain only version.txt and content.xml.", "INVALID_TUXGUITAR_ZIP");
  return entries;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => { let crc = value; for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; return crc >>> 0; });
function crc32(bytes) { let crc = 0xffffffff; for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
function le16(value) { const bytes = new Uint8Array(2); new DataView(bytes.buffer).setUint16(0, value, true); return bytes; }
function le32(value) { const bytes = new Uint8Array(4); new DataView(bytes.buffer).setUint32(0, value >>> 0, true); return bytes; }
function concat(parts) { const size = parts.reduce((sum, part) => sum + part.byteLength, 0); const output = new Uint8Array(size); let offset = 0; parts.forEach((part) => { output.set(part, offset); offset += part.byteLength; }); return output; }
export function zipStored(entries) {
  const encoder = new TextEncoder();
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBytes = encoder.encode(name), crc = crc32(data);
    const local = concat([Uint8Array.from([0x50,0x4b,0x03,0x04]),le16(20),le16(0),le16(0),le16(0),le16(0),le32(crc),le32(data.byteLength),le32(data.byteLength),le16(nameBytes.byteLength),le16(0),nameBytes,data]);
    const central = concat([Uint8Array.from([0x50,0x4b,0x01,0x02]),le16(20),le16(20),le16(0),le16(0),le16(0),le16(0),le32(crc),le32(data.byteLength),le32(data.byteLength),le16(nameBytes.byteLength),le16(0),le16(0),le16(0),le16(0),le32(0),le32(offset),nameBytes]);
    locals.push(local); centrals.push(central); offset += local.byteLength;
  }
  const localBytes = concat(locals), centralBytes = concat(centrals);
  return concat([localBytes, centralBytes, Uint8Array.from([0x50,0x4b,0x05,0x06]),le16(0),le16(0),le16(entries.length),le16(entries.length),le32(centralBytes.byteLength),le32(localBytes.byteLength),le16(0)]);
}


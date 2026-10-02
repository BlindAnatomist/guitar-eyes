/** @jest-environment node */
import fs from "fs";
import path from "path";
import { Blob as NodeBlob } from "buffer";
import { DecompressionStream as NativeDecompressionStream } from "stream/web";
import { TextDecoder, TextEncoder } from "util";
import { deflateRawSync, gzipSync, inflateRawSync } from "zlib";
import { decodePowerTabPt2Bytes } from "./powerTabPt2Decoder";
import { decodePowerTabV11Bytes } from "./powerTabV11Decoder";
import { POWERTAB_LIMITS } from "./powerTabLimits";
import {
  GUITAR_PRO_ARCHIVE_LIMITS,
  inspectGuitarProArchiveVersion,
} from "./guitarProArchiveVersion";
import { readModernEntries } from "./tuxGuitarStandardBassZip";

// Lower only the bass entry extraction ceiling, without allocating multi-MiB data.
jest.mock("./tuxGuitarStandardBassShared", () => ({
  ...jest.requireActual("./tuxGuitarStandardBassShared"),
  MAX_XML_BYTES: 64,
}));

const originalGlobals = {
  Blob: global.Blob,
  DecompressionStream: global.DecompressionStream,
  Response: global.Response,
  TextDecoder: global.TextDecoder,
  TextEncoder: global.TextEncoder,
};
beforeEach(() => {
  Object.assign(global, {
    Blob: NodeBlob,
    DecompressionStream: NativeDecompressionStream,
    TextDecoder,
    TextEncoder,
  });

});
afterEach(() => Object.assign(global, originalGlobals));

function zip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const { name, content, method = 8, declaredSize, packedBytes } of entries) {
    const nameBytes = Buffer.from(name);
    const source = Buffer.from(content);
    const packed = packedBytes || (method === 0 ? source : deflateRawSync(source));
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(declaredSize ?? source.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(declaredSize ?? source.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, packed);
    centrals.push(central, nameBytes);
    offset += local.length + nameBytes.length + packed.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Uint8Array.from(Buffer.concat([...locals, directory, end]));
}

const GPIF = "<GPIF><GPVersion>7.0</GPVersion><EncodingDescription>GP7</EncodingDescription><Tracks>0</Tracks></GPIF>";
const powerTabLimits = { ...POWERTAB_LIMITS, maxDecompressedBytes: 64 };
const gpLimits = { ...GUITAR_PRO_ARCHIVE_LIMITS, maxGpifBytes: 64 };
const powerTabBytes = Uint8Array.from(gzipSync("{}"));
const routes = [
  ["PT2", () => decodePowerTabPt2Bytes(powerTabBytes, { limits: powerTabLimits }), "POWERTAB_DECOMPRESSED_SIZE_LIMIT"],
  ["PT-v11", () => decodePowerTabV11Bytes(powerTabBytes, { limits: powerTabLimits }), "POWERTAB_DECOMPRESSED_SIZE_LIMIT"],
  ["GP", () => inspectGuitarProArchiveVersion(zip([{ name: "Content/score.gpif", content: "x", declaredSize: 1 }]), { limits: gpLimits }), "GUITAR_PRO_ARCHIVE_EXPANSION_LIMIT"],
  ["TG bass", () => readModernEntries(zip([{ name: "version.txt", content: "x" }, { name: "content.xml", content: "y" }])), "TUXGUITAR_ARCHIVE_EXPANSION_LIMIT"],
];

function fakeExpansion(chunks, { readError, cancelError, releaseError } = {}) {
  let index = 0;
  const reader = {
    read: jest.fn(async () => {
      if (readError) throw readError;
      return index < chunks.length ? { done: false, value: chunks[index++] } : { done: true };
    }),
    cancel: jest.fn(async () => { if (cancelError) throw cancelError; }),
    releaseLock: jest.fn(() => { if (releaseError) throw releaseError; }),
  };
  const stream = { getReader: () => reader };
  global.Blob = class { stream() { return { pipeThrough: () => stream }; } };
  global.DecompressionStream = class {};
  // The previous implementation fully materialized this response before checking size.
  global.Response = class {
    async arrayBuffer() {
      const retained = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        retained.push(value);
      }
      const result = Buffer.concat(retained);
      return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
    }
  };
  return reader;
}

describe.each(routes)("%s default streaming expansion", (name, decode, code) => {
  test("stops on the first over-limit chunk and releases the lock", async () => {
    const reader = fakeExpansion([new Uint8Array(40), new Uint8Array(40), new Uint8Array(40)]);
    await expect(decode()).rejects.toMatchObject({ code });
    expect(reader.read).toHaveBeenCalledTimes(2);
    expect(reader.cancel).toHaveBeenCalledTimes(1);
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });
  test("preserves the limit error when cancellation and lock release both fail", async () => {
    const reader = fakeExpansion([new Uint8Array(65), new Uint8Array(1)], {
      cancelError: new Error("cancel failed"), releaseError: new Error("release failed"),
    });
    await expect(decode()).rejects.toMatchObject({ code });
    expect(reader.read).toHaveBeenCalledTimes(1);
    expect(reader.cancel).toHaveBeenCalledTimes(1);
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  test("cleans up a decoder read failure without reading again", async () => {
    const reader = fakeExpansion([], { readError: new Error("read failed") });
    await expect(decode()).rejects.toThrow();
    expect(reader.read).toHaveBeenCalledTimes(1);
    expect(reader.cancel).toHaveBeenCalledTimes(1);
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  test("cleans up an invalid byte chunk without reading again", async () => {
    const reader = fakeExpansion(["invalid chunk", new Uint8Array(1)]);
    await expect(decode()).rejects.toThrow();
    expect(reader.read).toHaveBeenCalledTimes(1);
    expect(reader.cancel).toHaveBeenCalledTimes(1);
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });
});

const powerTabDecoders = [["PT2", decodePowerTabPt2Bytes], ["direct v11", decodePowerTabV11Bytes]];
describe.each(powerTabDecoders)("%s native browser gzip route", (name, decode) => {
  test("accepts preserved editor bytes at the exact output limit and rejects one less", async () => {
    const base = path.join(process.cwd(), "fixtures/powertab-v11/powertab-v11-editor-export-six-position");
    const bytes = Uint8Array.from(fs.readFileSync(`${base}.pt2`));
    const expandedLength = fs.readFileSync(`${base}.json`).length;
    const limits = { ...POWERTAB_LIMITS, maxDecompressedBytes: expandedLength };
    await expect(decode(bytes, { limits })).resolves.toMatchObject({ sourceVersion: "PT2_V11" });
    await expect(decode(bytes, { limits: { ...limits, maxDecompressedBytes: expandedLength - 1 } }))
      .rejects.toMatchObject({ code: "POWERTAB_DECOMPRESSED_SIZE_LIMIT" });
    // A rejected expansion must not poison an ordinary retry.
    await expect(decode(bytes, { limits })).resolves.toMatchObject({ sourceVersion: "PT2_V11" });
  });

  test.each([63, 64, 65])("checks tiny native output of %i bytes before JSON parsing", async (length) => {
    const bytes = Uint8Array.from(gzipSync(" ".repeat(length)));
    await expect(decode(bytes, { limits: powerTabLimits })).rejects.toMatchObject({
      code: length > 64 ? "POWERTAB_DECOMPRESSED_SIZE_LIMIT" : "INVALID_POWERTAB_JSON",
    });
  });

  test("retains the custom inflater actual-byte guard and passes its limits", async () => {
    const decompress = jest.fn(async () => new Uint8Array(65));
    await expect(decode(powerTabBytes, { limits: powerTabLimits, decompress }))
      .rejects.toMatchObject({ code: "POWERTAB_DECOMPRESSED_SIZE_LIMIT" });
    expect(decompress).toHaveBeenCalledWith(powerTabBytes, powerTabLimits);
  });

  test("rejects unavailable, corrupt and truncated gzip with existing codes", async () => {
    global.DecompressionStream = undefined;
    await expect(decode(powerTabBytes)).rejects.toMatchObject({ code: "POWERTAB_GZIP_UNAVAILABLE" });
    global.DecompressionStream = NativeDecompressionStream;
    const corrupt = powerTabBytes.slice();
    corrupt[corrupt.length - 5] ^= 255;
    for (const bytes of [corrupt, powerTabBytes.subarray(0, powerTabBytes.length - 2)]) {
      await expect(decode(bytes)).rejects.toMatchObject({ code: "INVALID_POWERTAB_GZIP" });
    }
  });
});

function gpArchive({ gpif = GPIF, version = "7.0", declaredGpif, declaredVersion, method = 8, packedBytes } = {}) {
  return zip([
    { name: "Content/score.gpif", content: gpif, declaredSize: declaredGpif, method, packedBytes },
    { name: "VERSION", content: version, declaredSize: declaredVersion, method },
  ]);
}
const exactGpLimits = { ...GUITAR_PRO_ARCHIVE_LIMITS, maxGpifBytes: GPIF.length, maxVersionBytes: 3 };

describe("GP default browser raw-DEFLATE route", () => {
  test("accepts exact entry-specific caps using native decompression", async () => {
    await expect(inspectGuitarProArchiveVersion(gpArchive(), { limits: exactGpLimits }))
      .resolves.toMatchObject({ sourceVersion: "GP7", rootVersion: "7.0" });
  });

  test.each([
    ["GPIF", { gpif: `${GPIF} `, declaredGpif: GPIF.length }, "Content/score.gpif"],
    ["VERSION", { version: "7.0 ", declaredVersion: 3 }, "VERSION"],
  ])("rejects one extra actual %s byte despite forged metadata", async (label, options, entryName) => {
    await expect(inspectGuitarProArchiveVersion(gpArchive(options), { limits: exactGpLimits }))
      .rejects.toMatchObject({
        code: "GUITAR_PRO_ARCHIVE_EXPANSION_LIMIT",
        message: `${entryName} exceeds the checkpoint extraction limit.`,
      });
  });

  test("passes separate GPIF and VERSION caps to a custom inflater", async () => {
    const inflateRaw = jest.fn(async (bytes) => Uint8Array.from(inflateRawSync(bytes)));
    await inspectGuitarProArchiveVersion(gpArchive(), { limits: exactGpLimits, inflateRaw });
    expect(inflateRaw.mock.calls.map((call) => call.slice(1)))
      .toEqual([[GPIF.length, "Content/score.gpif"], [3, "VERSION"]]);
  });

  test("keeps actual/declaration checks for an already-materialized custom result", async () => {
    const inflateRaw = jest.fn(async () => new Uint8Array(GPIF.length + 1));
    await expect(inspectGuitarProArchiveVersion(gpArchive(), { limits: exactGpLimits, inflateRaw }))
      .rejects.toMatchObject({ code: "GUITAR_PRO_ARCHIVE_SIZE_MISMATCH" });
  });

  test("rejects missing or unsupported native DEFLATE and corrupt data", async () => {
    global.DecompressionStream = undefined;
    await expect(inspectGuitarProArchiveVersion(gpArchive()))
      .rejects.toMatchObject({ code: "GUITAR_PRO_DECOMPRESSION_UNAVAILABLE" });
    global.DecompressionStream = class { constructor() { throw new Error("unsupported"); } };
    await expect(inspectGuitarProArchiveVersion(gpArchive()))
      .rejects.toMatchObject({ code: "GUITAR_PRO_DECOMPRESSION_UNAVAILABLE" });
    global.DecompressionStream = NativeDecompressionStream;
    for (const packedBytes of [Buffer.from([255, 255]), deflateRawSync(GPIF).subarray(0, 2)]) {
      await expect(inspectGuitarProArchiveVersion(gpArchive({ packedBytes }))).rejects.toThrow();
    }
  });
});

function bassArchive({ content = "x".repeat(64), declaredSize, method = 8, packedBytes } = {}) {
  return zip([
    { name: "version.txt", content: "2.0", method },
    { name: "content.xml", content, declaredSize, method, packedBytes },
  ]);
}

describe("TG bass default browser raw-DEFLATE route", () => {
  test.each([63, 64])("accepts %i actual bytes within the tiny extraction cap", async (length) => {
    const entries = await readModernEntries(bassArchive({ content: "x".repeat(length) }));
    expect(entries.get("content.xml")).toEqual(new Uint8Array(length).fill(120));
  });

  test("rejects one extra actual byte despite forged metadata", async () => {
    await expect(readModernEntries(bassArchive({ content: "x".repeat(65), declaredSize: 64 })))
      .rejects.toMatchObject({ code: "TUXGUITAR_ARCHIVE_EXPANSION_LIMIT" });
    await expect(readModernEntries(bassArchive())).resolves.toBeInstanceOf(Map);
  });

  test("retains the under-limit declared-size mismatch check", async () => {
    await expect(readModernEntries(bassArchive({ content: "x".repeat(63), declaredSize: 64 })))
      .rejects.toMatchObject({ code: "INVALID_TUXGUITAR_ZIP" });
  });

  test("rejects unavailable, corrupt and truncated native raw DEFLATE", async () => {
    global.DecompressionStream = undefined;
    await expect(readModernEntries(bassArchive()))
      .rejects.toMatchObject({ code: "TUXGUITAR_DECOMPRESSION_UNAVAILABLE" });
    global.DecompressionStream = NativeDecompressionStream;
    for (const packedBytes of [Buffer.from([255, 255]), deflateRawSync("x".repeat(64)).subarray(0, 2)]) {
      await expect(readModernEntries(bassArchive({ packedBytes }))).rejects.toThrow();
    }
  });
});

describe("stored-entry actual-size preflight", () => {
  test.each([
    ["GP", () => gpArchive({ gpif: `${GPIF} `, declaredGpif: GPIF.length, method: 0 }), (bytes) => inspectGuitarProArchiveVersion(bytes, { limits: exactGpLimits }), "GUITAR_PRO_ARCHIVE_SIZE_MISMATCH"],
    // Put the forged first entry first so no legitimate earlier copy is needed.
    ["TG bass", () => zip([{ name: "content.xml", content: "x".repeat(65), declaredSize: 64, method: 0 }, { name: "version.txt", content: "2.0", method: 0 }]), readModernEntries, "INVALID_TUXGUITAR_ZIP"],
  ])("rejects a forged %s size before copying stored data", async (name, build, decode, code) => {
    const bytes = build();
    const Uint8 = global.Uint8Array;
    global.Uint8Array = new Proxy(Uint8, {
      construct(target, args) {
        if (ArrayBuffer.isView(args[0])) throw new Error("Unexpected stored-entry copy");
        return Reflect.construct(target, args);
      },
    });
    try { await expect(decode(bytes)).rejects.toMatchObject({ code }); }
    finally { global.Uint8Array = Uint8; }
  });

  test("accepts exact-size stored GP and bass entries", async () => {
    await expect(inspectGuitarProArchiveVersion(gpArchive({ method: 0 }), { limits: exactGpLimits }))
      .resolves.toMatchObject({ sourceVersion: "GP7" });
    await expect(readModernEntries(bassArchive({ method: 0 }))).resolves.toBeInstanceOf(Map);
  });
});

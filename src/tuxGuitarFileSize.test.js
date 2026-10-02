import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import { decodeTuxGuitarFile } from "./tuxGuitarDecoder";
import { decodeTuxGuitarProfileFile } from "./tuxGuitarProfileDecoder";
import { decodeStandardBassTuxGuitarFile } from "./tuxGuitarStandardBassAdapter";

if (typeof global.TextDecoder !== "function") global.TextDecoder = TextDecoder;
if (typeof global.TextEncoder !== "function") global.TextEncoder = TextEncoder;

const MAX_BYTES = 16 * 1024 * 1024;
const SIZE_ERROR = { name: "TuxGuitarImportError", code: "TUXGUITAR_FILE_SIZE_LIMIT" };
const CASES = [
  ["ordinary", decodeTuxGuitarFile, "tuxguitar-tg", "six-position"],
  ["profile", decodeTuxGuitarProfileFile, "tuxguitar-tg", "six-position"],
  ["bass", decodeStandardBassTuxGuitarFile, "tuxguitar-tg-bass", "standard-bass"],
];
const INVALID_SIZES = [
  ["zero", 0], ["negative", -1], ["fraction", 1.5], ["NaN", NaN],
  ["positive infinity", Infinity], ["negative infinity", -Infinity],
  ["string", "1"], ["null", null], ["boolean", true],
  ["bigint", global.BigInt(1)], ["symbol", Symbol("size")], ["boxed number", Object(1)],
];
let oversizedBuffer;

function fixtureFile(directory, suffix, code = "10") {
  const name = `tuxguitar-${code}-${suffix}.tg`;
  const bytes = fs.readFileSync(path.join(process.cwd(), "fixtures", directory, name));
  return {
    name,
    size: bytes.byteLength,
    arrayBuffer: jest.fn(async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)),
  };
}

function sentinelFile(size) {
  return { size, arrayBuffer: jest.fn(() => { throw new Error("arrayBuffer must not run"); }) };
}

describe.each(CASES)("TuxGuitar %s file-size preflight", (_label, decode, directory, suffix) => {
  test("rejects a declared oversized file without reading or allocating bytes", async () => {
    const file = sentinelFile(MAX_BYTES + 1);
    await expect(decode(file)).rejects.toMatchObject(SIZE_ERROR);
    expect(file.arrayBuffer).not.toHaveBeenCalled();
  });

  test.each(INVALID_SIZES)("rejects present invalid %s metadata without a read", async (_description, size) => {
    const file = sentinelFile(size);
    await expect(decode(file)).rejects.toMatchObject(SIZE_ERROR);
    expect(file.arrayBuffer).not.toHaveBeenCalled();
  });

  test("never coerces a size object", async () => {
    const valueOf = jest.fn(() => 1);
    const toString = jest.fn(() => "1");
    const file = sentinelFile({ valueOf, toString });
    await expect(decode(file)).rejects.toMatchObject(SIZE_ERROR);
    expect(file.arrayBuffer).not.toHaveBeenCalled();
    expect(valueOf).not.toHaveBeenCalled();
    expect(toString).not.toHaveBeenCalled();
  });

  test.each([MAX_BYTES - 1, MAX_BYTES])("allows declared size %i through to byte validation", async (size) => {
    const file = fixtureFile(directory, suffix);
    file.size = size;
    await expect(decode(file)).resolves.toMatchObject({ sourceVersion: "TG_1_0" });
    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
  });

  test.each(["absent", "undefined"])("preserves %s size metadata", async (kind) => {
    const file = fixtureFile(directory, suffix);
    if (kind === "absent") delete file.size;
    else file.size = undefined;
    await expect(decode(file)).resolves.toMatchObject({ sourceVersion: "TG_1_0" });
    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
  });

  test("checks inherited metadata on a frozen file-like object", async () => {
    const file = sentinelFile(undefined);
    delete file.size;
    Object.setPrototypeOf(file, { size: MAX_BYTES + 1 });
    Object.freeze(file);
    await expect(decode(file)).rejects.toMatchObject(SIZE_ERROR);
    expect(file.arrayBuffer).not.toHaveBeenCalled();
  });

  test("snapshots metadata once", async () => {
    const file = fixtureFile(directory, suffix);
    const size = jest.fn().mockReturnValueOnce(MAX_BYTES).mockReturnValue(MAX_BYTES + 1);
    Object.defineProperty(file, "size", { get: size });
    await expect(decode(file)).resolves.toMatchObject({ sourceVersion: "TG_1_0" });
    expect(size).toHaveBeenCalledTimes(1);
    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
  });

  test.each(["small", "absent"])("rejects actual oversized bytes with %s metadata before copying", async (kind) => {
    // One shared 16 MiB + 1 backing store exercises the real production cap.
    // The metadata-only sentinel tests above do not allocate any file bytes.
    if (!oversizedBuffer) oversizedBuffer = new ArrayBuffer(MAX_BYTES + 1);
    const file = { arrayBuffer: jest.fn(async () => oversizedBuffer) };
    if (kind === "small") file.size = 1;
    const slice = jest.spyOn(Uint8Array.prototype, "slice");
    try {
      await expect(decode(file)).rejects.toMatchObject(SIZE_ERROR);
      expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
      expect(slice).not.toHaveBeenCalled();
    } finally {
      slice.mockRestore();
    }
  });

  test("retains actual empty-byte rejection despite valid metadata", async () => {
    const file = { size: 1, arrayBuffer: jest.fn(async () => new ArrayBuffer(0)) };
    await expect(decode(file)).rejects.toMatchObject(SIZE_ERROR);
    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
  });

  test("preserves the original read failure", async () => {
    const error = new Error("file read failed");
    const file = { size: 1, arrayBuffer: jest.fn(async () => { throw error; }) };
    await expect(decode(file)).rejects.toBe(error);
    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
  });

  test("preserves missing-file validation before metadata access", async () => {
    const size = jest.fn(() => { throw new Error("must not inspect invalid file"); });
    const file = Object.defineProperty({}, "size", { get: size });
    for (const invalidFile of [undefined, null, file]) {
      await expect(decode(invalidFile)).rejects.toMatchObject({ code: "MISSING_TUXGUITAR_FILE" });
    }
    expect(size).not.toHaveBeenCalled();
  });

  test("a rejected oversized file does not affect a later valid import", async () => {
    await expect(decode(sentinelFile(MAX_BYTES + 1))).rejects.toMatchObject(SIZE_ERROR);
    await expect(decode(fixtureFile(directory, suffix, "20"))).resolves.toMatchObject({ sourceVersion: "TG_2_0" });
  });
});

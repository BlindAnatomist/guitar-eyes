/** @jest-environment node */
import vm from "vm";
import { Blob } from "buffer";
import { DecompressionStream } from "stream/web";
import { deflateRawSync, gzipSync } from "zlib";
import { readBoundedByteStream } from "./readBoundedByteStream";

function source(values, options = {}) {
  let offset = 0;
  const reader = {
    read: jest.fn(async () => {
      if (options.readError) throw options.readError;
      return offset < values.length ? { done: false, value: values[offset++] } : { done: true };
    }),
    cancel: jest.fn(async () => { if (options.cancelError) throw options.cancelError; }),
    releaseLock: jest.fn(() => { if (options.releaseError) throw options.releaseError; }),
  };
  return { reader, getReader: jest.fn(() => reader) };
}
const limitError = new Error("family-specific extraction limit");

describe("readBoundedByteStream", () => {
  test.each([
    ["empty", [], 0, []],
    ["zero-length chunks", [new Uint8Array(0), new Uint8Array(0)], 0, []],
    ["below limit", [Uint8Array.from([1, 2, 3])], 4, [1, 2, 3]],
    ["exact limit", [Uint8Array.from([1, 2]), Uint8Array.from([3, 4])], 4, [1, 2, 3, 4]],
    ["view offset", [Uint8Array.from([99, 1, 2, 99]).subarray(1, 3)], 2, [1, 2]],
    ["cross-realm bytes", [vm.runInNewContext("new Uint8Array([1, 2])")], 2, [1, 2]],
    ["safe maximum", [Uint8Array.from([1])], Number.MAX_SAFE_INTEGER, [1]],
  ])("accepts %s and releases its lock", async (label, chunks, cap, expected) => {
    const stream = source(chunks);
    const result = await readBoundedByteStream(stream, cap, limitError);
    expect(Array.from(result)).toEqual(expected);
    expect(stream.reader.read).toHaveBeenCalledTimes(chunks.length + 1);
    expect(stream.reader.cancel).not.toHaveBeenCalled();
    expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
    expect(result).not.toBe(chunks[0]);
  });

  test.each([
    ["first chunk", [new Uint8Array(9), new Uint8Array(1)], 8, 1],
    ["second chunk", [new Uint8Array(5), new Uint8Array(4), new Uint8Array(1)], 8, 2],
    ["one byte after exact limit", [new Uint8Array(8), new Uint8Array(1), new Uint8Array(1)], 8, 2],
    ["zero cap", [new Uint8Array(1), new Uint8Array(1)], 0, 1],
  ])("rejects %s before retaining or concatenating the excess", async (label, chunks, cap, reads) => {
    const stream = source(chunks);
    const set = jest.spyOn(Uint8Array.prototype, "set");
    try {
      await expect(readBoundedByteStream(stream, cap, limitError)).rejects.toBe(limitError);
      expect(set).not.toHaveBeenCalled();
      expect(stream.reader.read).toHaveBeenCalledTimes(reads);
      expect(stream.reader.cancel).toHaveBeenCalledTimes(1);
      expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
    } finally { set.mockRestore(); }
  });

  test.each([undefined, null, NaN, Infinity, -Infinity, -1, 0.5, "8", Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid cap %s before taking the reader",
    async (cap) => {
      const stream = source([]);
      await expect(readBoundedByteStream(stream, cap, limitError)).rejects.toBeInstanceOf(RangeError);
      expect(stream.getReader).not.toHaveBeenCalled();
    }
  );

  test.each([null, undefined, "abc", [1, 2], new ArrayBuffer(2), new DataView(new ArrayBuffer(2)), new Uint16Array(2), new Int8Array(2), new Uint8ClampedArray(2), { byteLength: 100 }])(
    "rejects non-Uint8Array chunks without coercion: %p",
    async (value) => {
      const stream = source([value, new Uint8Array(1)]);
      await expect(readBoundedByteStream(stream, 8, limitError)).rejects.toBeInstanceOf(TypeError);
      expect(stream.reader.read).toHaveBeenCalledTimes(1);
      expect(stream.reader.cancel).toHaveBeenCalledTimes(1);
      expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
    }
  );

  test("rejects another typed-array brand even if its tag is forged", async () => {
    const value = new Uint16Array([258]);
    Object.defineProperty(value, Symbol.toStringTag, { value: "Uint8Array" });
    const stream = source([value]);
    await expect(readBoundedByteStream(stream, 8, limitError)).rejects.toBeInstanceOf(TypeError);
    expect(stream.reader.cancel).toHaveBeenCalledTimes(1);
    expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  test("counts intrinsic byte length even if an own property shadows it", async () => {
    const value = Uint8Array.from([7]);
    Object.defineProperty(value, "byteLength", { value: 0 });
    await expect(readBoundedByteStream(source([value]), 0, limitError)).rejects.toBe(limitError);
    expect(Array.from(await readBoundedByteStream(source([value]), 1, limitError))).toEqual([7]);
  });

  test.each(["cancel", "release", "both"])("preserves the limit error if %s cleanup fails", async (failure) => {
    const cleanupError = new Error("cleanup failed");
    const stream = source([new Uint8Array(9)], {
      cancelError: failure === "release" ? undefined : cleanupError,
      releaseError: failure === "cancel" ? undefined : cleanupError,
    });
    await expect(readBoundedByteStream(stream, 8, limitError)).rejects.toBe(limitError);
    expect(stream.reader.cancel).toHaveBeenCalledTimes(1);
    expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  test("preserves read rejection even if both cleanup operations fail", async () => {
    const readError = new Error("decoder read failed");
    const stream = source([], { readError, cancelError: new Error("cancel"), releaseError: new Error("release") });
    await expect(readBoundedByteStream(stream, 8, limitError)).rejects.toBe(readError);
    expect(stream.reader.read).toHaveBeenCalledTimes(1);
    expect(stream.reader.cancel).toHaveBeenCalledTimes(1);
    expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  test("reports release failure after otherwise successful reading", async () => {
    const releaseError = new Error("release failed");
    const stream = source([new Uint8Array(1)], { releaseError });
    await expect(readBoundedByteStream(stream, 8, limitError)).rejects.toBe(releaseError);
    expect(stream.reader.cancel).not.toHaveBeenCalled();
    expect(stream.reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  describe.each([["gzip", gzipSync], ["deflate-raw", deflateRawSync]])(
    "actual native %s output",
    (format, compress) => {
      test.each([0, 63, 64])("accepts %i bytes at the tiny cap", async (length) => {
        const stream = new Blob([compress(Buffer.alloc(length, 42))])
          .stream().pipeThrough(new DecompressionStream(format));
        const result = await readBoundedByteStream(stream, 64, limitError);
        expect(Array.from(result)).toEqual(Array(length).fill(42));
        expect(stream.locked).toBe(false);
      });

      test("rejects one extra byte and releases the actual native stream", async () => {
        const stream = new Blob([compress(Buffer.alloc(65, 42))])
          .stream().pipeThrough(new DecompressionStream(format));
        await expect(readBoundedByteStream(stream, 64, limitError)).rejects.toBe(limitError);
        expect(stream.locked).toBe(false);
      });
    }
  );
});

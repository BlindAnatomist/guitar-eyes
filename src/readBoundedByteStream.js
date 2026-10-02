const typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const typedArrayName = Object.getOwnPropertyDescriptor(
  typedArrayPrototype, Symbol.toStringTag
).get;
const typedArrayByteLength = Object.getOwnPropertyDescriptor(
  typedArrayPrototype, "byteLength"
).get;

// Bound retained output before concatenation. This does not bound a decoder's
// internal allocations or the size of the single chunk it has already emitted.
export async function readBoundedByteStream(stream, maxBytes, limitError) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError("The byte-stream limit must be a nonnegative safe integer.");
  }

  const reader = stream.getReader();
  const chunks = [];
  let totalBytes = 0;
  let failed = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Native streams can deliver bytes from another realm; reject non-byte
      // values instead of coercing them into an allocation of an unknown size.
      if (
        !ArrayBuffer.isView(value) ||
        typedArrayName.call(value) !== "Uint8Array"
      ) {
        throw new TypeError("The byte stream returned an invalid byte sequence.");
      }
      const chunkBytes = typedArrayByteLength.call(value);
      if (chunkBytes > maxBytes - totalBytes) throw limitError;
      totalBytes += chunkBytes;
      if (chunkBytes > 0) chunks.push({ value, byteLength: chunkBytes });
    }
  } catch (error) {
    failed = true;
    try {
      await reader.cancel();
    } catch {
      // Cleanup must not replace the size/type/read error that stopped reading.
    }
    throw error;
  } finally {
    try {
      reader.releaseLock();
    } catch (error) {
      if (!failed) throw error;
    }
  }

  const output = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk.value, offset);
    offset += chunk.byteLength;
  }
  return output;
}

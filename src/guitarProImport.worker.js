/* global globalThis */

import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";
import { decodeGuitarProScoreWithIntegrity } from "./guitarProDecodeIntegrity";

function workerError(error) {
  return {
    name: String(error?.name || "Error"),
    message: String(error?.message || "The Guitar Pro file could not be decoded."),
    code: String(error?.code || "GUITAR_PRO_DECODE_ERROR"),
  };
}

globalThis.onmessage = async (event) => {
  const { requestId, bytes } = event.data || {};

  try {
    if (!(bytes instanceof ArrayBuffer)) {
      throw Object.assign(new Error("The Guitar Pro worker did not receive binary data."), {
        code: "INVALID_GUITAR_PRO_WORKER_INPUT",
      });
    }

    const rawBytes = new Uint8Array(bytes);
    const versionEvidence = await inspectGuitarProArchiveVersion(rawBytes);
    const alphaTab = await import("@coderline/alphatab");
    const intermediate = decodeGuitarProScoreWithIntegrity(alphaTab, rawBytes, {
      versionEvidence,
    });

    globalThis.postMessage({ requestId, ok: true, intermediate });
  } catch (error) {
    globalThis.postMessage({ requestId, ok: false, error: workerError(error) });
  }
};

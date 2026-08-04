import { formatByteLimit, GUITAR_PRO_LIMITS } from "./guitarProLimits";

export class GuitarProWorkerError extends Error {
  constructor(message, code = "GUITAR_PRO_WORKER_ERROR") {
    super(message);
    this.name = "GuitarProWorkerError";
    this.code = code;
  }
}

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `guitar-pro-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function decodeGuitarProArchiveProofFile(
  file,
  {
    workerFactory = null,
    timeoutMs = GUITAR_PRO_LIMITS.workerTimeoutMs,
    maxFileBytes = GUITAR_PRO_LIMITS.maxFileBytes,
  } = {}
) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new GuitarProWorkerError(
      "Choose a Guitar Pro file first.",
      "MISSING_GUITAR_PRO_FILE"
    );
  }
  if (!Number.isFinite(file.size) || file.size < 0) {
    throw new GuitarProWorkerError(
      "The selected Guitar Pro file does not report a valid size.",
      "INVALID_GUITAR_PRO_FILE_SIZE"
    );
  }
  if (file.size > maxFileBytes) {
    throw new GuitarProWorkerError(
      `The selected Guitar Pro file is larger than the checkpoint limit of ${formatByteLimit(maxFileBytes)}.`,
      "GUITAR_PRO_FILE_TOO_LARGE"
    );
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new GuitarProWorkerError(
      "The Guitar Pro worker timeout is invalid.",
      "INVALID_GUITAR_PRO_TIMEOUT"
    );
  }
  if (typeof workerFactory !== "function") {
    throw new GuitarProWorkerError(
      "The Guitar Pro decoder worker factory is unavailable.",
      "GUITAR_PRO_WORKER_UNAVAILABLE"
    );
  }

  const bytes = await file.arrayBuffer();
  const worker = workerFactory();
  if (!worker || typeof worker.postMessage !== "function") {
    throw new GuitarProWorkerError(
      "The Guitar Pro decoder worker could not be created.",
      "GUITAR_PRO_WORKER_UNAVAILABLE"
    );
  }

  const id = requestId();

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.removeEventListener?.("message", onMessage);
      worker.removeEventListener?.("error", onError);
      worker.terminate?.();
      callback(value);
    };

    const onMessage = (event) => {
      const response = event.data || {};
      if (response.requestId !== id) return;
      if (response.ok) {
        finish(resolve, response.intermediate);
        return;
      }
      finish(
        reject,
        new GuitarProWorkerError(
          response.error?.message || "The Guitar Pro file could not be decoded.",
          response.error?.code || "GUITAR_PRO_DECODE_ERROR"
        )
      );
    };

    const onError = () => {
      finish(
        reject,
        new GuitarProWorkerError(
          "The Guitar Pro decoder worker stopped unexpectedly.",
          "GUITAR_PRO_WORKER_CRASH"
        )
      );
    };

    const timer = window.setTimeout(() => {
      finish(
        reject,
        new GuitarProWorkerError(
          `The Guitar Pro decoder exceeded the ${timeoutMs}-millisecond checkpoint deadline.`,
          "GUITAR_PRO_WORKER_TIMEOUT"
        )
      );
    }, timeoutMs);

    worker.addEventListener?.("message", onMessage);
    worker.addEventListener?.("error", onError);
    worker.postMessage(
      {
        requestId: id,
        fileName: String(file.name || ""),
        bytes,
      },
      [bytes]
    );
  });
}

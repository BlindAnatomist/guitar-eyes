import { GUITAR_PRO_LIMITS } from "./guitarProLimits";
import {
  decodeGuitarPro7ProofFile,
  GuitarProWorkerError,
} from "./guitarProWorkerClient";

class MockWorker {
  constructor() {
    this.listeners = new Map();
    this.terminated = false;
    this.message = null;
    this.transfer = null;
  }

  addEventListener(type, callback) {
    this.listeners.set(type, callback);
  }

  removeEventListener(type, callback) {
    if (this.listeners.get(type) === callback) this.listeners.delete(type);
  }

  postMessage(message, transfer) {
    this.message = message;
    this.transfer = transfer;
  }

  terminate() {
    this.terminated = true;
  }

  emitMessage(data) {
    this.listeners.get("message")?.({ data });
  }

  emitError() {
    this.listeners.get("error")?.(new Error("worker failed"));
  }
}

function fileOfSize(size = 4) {
  return {
    name: "proof.gp",
    size,
    arrayBuffer: jest.fn(async () => new Uint8Array(size).buffer),
  };
}

function expectWorkerError(error, code) {
  expect(error).toBeInstanceOf(GuitarProWorkerError);
  expect(error.code).toBe(code);
}

describe("decodeGuitarPro7ProofFile", () => {
  test("transfers bytes once and terminates after a matching success response", async () => {
    const worker = new MockWorker();
    const file = fileOfSize(8);
    const promise = decodeGuitarPro7ProofFile(file, {
      workerFactory: () => worker,
    });

    await Promise.resolve();
    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
    expect(worker.message.sourceVersion).toBe("GP7");
    expect(worker.message.bytes).toBeInstanceOf(ArrayBuffer);
    expect(worker.transfer).toEqual([worker.message.bytes]);

    const expected = { schemaVersion: 1, sourceVersion: "GP7", tracks: [] };
    worker.emitMessage({
      requestId: worker.message.requestId,
      ok: true,
      intermediate: expected,
    });

    await expect(promise).resolves.toEqual(expected);
    expect(worker.terminated).toBe(true);
  });

  test("ignores unrelated worker responses until the matching request arrives", async () => {
    const worker = new MockWorker();
    const promise = decodeGuitarPro7ProofFile(fileOfSize(), {
      workerFactory: () => worker,
    });

    await Promise.resolve();
    worker.emitMessage({ requestId: "another-request", ok: true, intermediate: {} });
    expect(worker.terminated).toBe(false);

    worker.emitMessage({
      requestId: worker.message.requestId,
      ok: true,
      intermediate: { schemaVersion: 1 },
    });

    await expect(promise).resolves.toEqual({ schemaVersion: 1 });
    expect(worker.terminated).toBe(true);
  });

  test("returns the decoder error code and terminates the worker", async () => {
    const worker = new MockWorker();
    const promise = decodeGuitarPro7ProofFile(fileOfSize(), {
      workerFactory: () => worker,
    });

    await Promise.resolve();
    worker.emitMessage({
      requestId: worker.message.requestId,
      ok: false,
      error: { message: "Corrupt archive", code: "CORRUPT_GP7_ARCHIVE" },
    });

    await expect(promise).rejects.toMatchObject({
      message: "Corrupt archive",
      code: "CORRUPT_GP7_ARCHIVE",
    });
    expect(worker.terminated).toBe(true);
  });

  test("terminates and reports a browser worker crash", async () => {
    const worker = new MockWorker();
    const promise = decodeGuitarPro7ProofFile(fileOfSize(), {
      workerFactory: () => worker,
    });

    await Promise.resolve();
    worker.emitError();

    await expect(promise).rejects.toMatchObject({
      code: "GUITAR_PRO_WORKER_CRASH",
    });
    expect(worker.terminated).toBe(true);
  });

  test("terminates a decoder that exceeds the deadline", async () => {
    jest.useFakeTimers();
    const worker = new MockWorker();
    const promise = decodeGuitarPro7ProofFile(fileOfSize(), {
      workerFactory: () => worker,
      timeoutMs: 25,
    });

    await Promise.resolve();
    jest.advanceTimersByTime(25);

    await expect(promise).rejects.toMatchObject({
      code: "GUITAR_PRO_WORKER_TIMEOUT",
    });
    expect(worker.terminated).toBe(true);
    jest.useRealTimers();
  });

  test("rejects an oversized file before reading bytes or creating a worker", async () => {
    const file = fileOfSize(GUITAR_PRO_LIMITS.maxFileBytes + 1);
    const workerFactory = jest.fn();

    try {
      await decodeGuitarPro7ProofFile(file, { workerFactory });
      throw new Error("Expected oversized rejection");
    } catch (error) {
      expectWorkerError(error, "GUITAR_PRO_FILE_TOO_LARGE");
    }

    expect(file.arrayBuffer).not.toHaveBeenCalled();
    expect(workerFactory).not.toHaveBeenCalled();
  });

  test("rejects missing files, invalid sizes, invalid timeouts, and unavailable workers", async () => {
    await expect(decodeGuitarPro7ProofFile(null)).rejects.toMatchObject({
      code: "MISSING_GUITAR_PRO_FILE",
    });

    await expect(
      decodeGuitarPro7ProofFile({ size: Number.NaN, arrayBuffer: async () => new ArrayBuffer(0) })
    ).rejects.toMatchObject({ code: "INVALID_GUITAR_PRO_FILE_SIZE" });

    await expect(
      decodeGuitarPro7ProofFile(fileOfSize(), {
        timeoutMs: 0,
        workerFactory: () => new MockWorker(),
      })
    ).rejects.toMatchObject({ code: "INVALID_GUITAR_PRO_TIMEOUT" });

    await expect(
      decodeGuitarPro7ProofFile(fileOfSize(), {
        workerFactory: () => null,
      })
    ).rejects.toMatchObject({ code: "GUITAR_PRO_WORKER_UNAVAILABLE" });
  });
});

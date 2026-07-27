export const GUITAR_PRO_LIMITS = Object.freeze({
  maxFileBytes: 5 * 1024 * 1024,
  workerTimeoutMs: 10_000,
  maxTracks: 32,
  maxStaves: 64,
  maxBars: 1_000,
  maxVoicesPerBar: 4,
  maxBeats: 50_000,
  maxNotes: 150_000,
});

export function formatByteLimit(bytes) {
  if (!Number.isInteger(bytes) || bytes < 0) return "unknown size";
  if (bytes % (1024 * 1024) === 0) return `${bytes / (1024 * 1024)} MiB`;
  if (bytes % 1024 === 0) return `${bytes / 1024} KiB`;
  return `${bytes} bytes`;
}

export const POWERTAB_LIMITS = Object.freeze({
  maxCompressedBytes: 5 * 1024 * 1024,
  maxDecompressedBytes: 20 * 1024 * 1024,
  maxSystems: 256,
  maxPlayers: 32,
  maxInstruments: 64,
  maxStaves: 64,
  maxMeasures: 4096,
  maxPositions: 50000,
  maxNotes: 200000,
});

export const POWERTAB_STANDARD_BASS_MIDI = Object.freeze([43, 38, 33, 28]);

export const POWERTAB_LEGACY_BASS_PROFILES = Object.freeze({
  1: Object.freeze({ sourceVersion: "PTB_V10", powerTabVersion: "1.0", signature: "ptab-1" }),
  2: Object.freeze({ sourceVersion: "PTB_V102", powerTabVersion: "1.0.2", signature: "ptab-2" }),
  3: Object.freeze({ sourceVersion: "PTB_V15", powerTabVersion: "1.5", signature: "ptab-3" }),
  4: Object.freeze({ sourceVersion: "PTB_V17", powerTabVersion: "1.7", signature: "ptab-4" }),
});

export const POWERTAB_EVIDENCE = Object.freeze({
  upstreamRelease: "2.0.22",
  upstreamCommit: ["13cab27c", "7127d301", "f2747671", "071e53eb", "203dc940"].join(""),
});

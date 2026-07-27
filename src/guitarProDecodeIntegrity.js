import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";

export class GuitarProDecodeIntegrityError extends Error {
  constructor(message, code = "GUITAR_PRO_DECODE_INTEGRITY_ERROR") {
    super(message);
    this.name = "GuitarProDecodeIntegrityError";
    this.code = code;
  }
}

function declaredTrackCount(versionEvidence) {
  return Number.isInteger(versionEvidence?.declaredTrackCount)
    ? versionEvidence.declaredTrackCount
    : null;
}

function decodedTrackCount(intermediate) {
  return Array.isArray(intermediate?.tracks) ? intermediate.tracks.length : 0;
}

export function decodeGuitarProScoreWithIntegrity(
  alphaTab,
  rawBytes,
  {
    versionEvidence = null,
    adapt = alphaTabScoreToGuitarProIntermediate,
  } = {}
) {
  const expected = declaredTrackCount(versionEvidence);
  const load = () => {
    const settings = new alphaTab.Settings();
    const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(rawBytes, settings);
    return adapt(score, { versionEvidence });
  };

  let intermediate = load();
  if (expected !== null && decodedTrackCount(intermediate) !== expected) {
    intermediate = load();
  }

  const actual = decodedTrackCount(intermediate);
  if (expected !== null && actual !== expected) {
    throw new GuitarProDecodeIntegrityError(
      `The Guitar Pro archive declares ${expected} tracks, but the decoder returned ${actual}. The file was not loaded because silently dropping a track is unsafe.`,
      "GUITAR_PRO_TRACK_COUNT_MISMATCH"
    );
  }

  return intermediate;
}

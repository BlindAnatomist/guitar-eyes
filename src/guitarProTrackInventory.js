import { GUITAR_PRO_LIMITS } from "./guitarProLimits";

const SUPPORTED_STRING_COUNTS = new Set([4, 6]);
const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export class GuitarProTrackInventoryError extends Error {
  constructor(message, code = "GUITAR_PRO_TRACK_INVENTORY_ERROR") {
    super(message);
    this.name = "GuitarProTrackInventoryError";
    this.code = code;
  }
}

function requireArray(value, message) {
  if (!Array.isArray(value)) {
    throw new GuitarProTrackInventoryError(
      message,
      "INVALID_GUITAR_PRO_TRACK_INVENTORY"
    );
  }
  return value;
}

function pitchLabel(midi) {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    return "unknown pitch";
  }
  const pitch = PITCH_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitch}${octave}`;
}

function plural(value, singular, pluralValue = `${singular}s`) {
  return value === 1 ? singular : pluralValue;
}

function supportForStaff({ isPercussion, stringCount, measureCount }) {
  if (isPercussion) {
    return {
      supported: false,
      reasonCode: "PERCUSSION_TRACK",
      reason: "Percussion tracks do not contain fretted tablature coordinates.",
    };
  }
  if (stringCount === 0) {
    return {
      supported: false,
      reasonCode: "NO_FRETTED_TUNING",
      reason: "This staff does not report a fretted-string tuning.",
    };
  }
  if (!SUPPORTED_STRING_COUNTS.has(stringCount)) {
    return {
      supported: false,
      reasonCode: "UNSUPPORTED_STRING_COUNT",
      reason: `This ${stringCount}-string staff is outside the current four-string bass and six-string guitar profile.`,
    };
  }
  if (measureCount === 0) {
    return {
      supported: false,
      reasonCode: "NO_MEASURES",
      reason: "This staff contains no measures.",
    };
  }
  return {
    supported: true,
    reasonCode: null,
    reason: "Available for the Guitar Eyes semantic readers.",
  };
}

function inventoryItem(track, staff, trackIndex, staffIndex) {
  const tuning = Array.isArray(staff?.tuningMidiHighToLow)
    ? staff.tuningMidiHighToLow.map(Number)
    : [];
  const bars = Array.isArray(staff?.bars) ? staff.bars : [];
  const stringCount = tuning.length;
  const measureCount = bars.length;
  const isPercussion = Boolean(track?.isPercussion);
  const support = supportForStaff({ isPercussion, stringCount, measureCount });
  const instrument = stringCount === 4 ? "bass" : stringCount === 6 ? "guitar" : null;
  const instrumentLabel =
    instrument === "bass"
      ? "four-string bass"
      : instrument === "guitar"
        ? "six-string guitar"
        : stringCount > 0
          ? `${stringCount}-string fretted staff`
          : "non-fretted staff";
  const trackName = String(
    track?.name || track?.shortName || `Track ${trackIndex + 1}`
  ).trim();
  const tuningLabel = tuning.length > 0
    ? tuning.map(pitchLabel).join(", ")
    : "not reported";
  const selectionLabel = `${trackName}. ${instrumentLabel}. Tuning high to low: ${tuningLabel}. ${measureCount} ${plural(measureCount, "measure")}.`;

  return {
    id: `guitar-pro-track-${trackIndex + 1}-staff-${staffIndex + 1}`,
    trackIndex,
    staffIndex,
    trackNumber: trackIndex + 1,
    staffNumber: staffIndex + 1,
    trackName,
    shortName: String(track?.shortName || "").trim(),
    isPercussion,
    stringCount,
    tuningMidiHighToLow: tuning,
    tuningLabel,
    measureCount,
    instrument,
    instrumentLabel,
    supported: support.supported,
    reasonCode: support.reasonCode,
    reason: support.reason,
    selectionLabel,
  };
}

export function buildGuitarProTrackInventory(
  intermediate,
  { limits = GUITAR_PRO_LIMITS } = {}
) {
  if (!intermediate || intermediate.schemaVersion !== 1) {
    throw new GuitarProTrackInventoryError(
      "The Guitar Pro decoder returned an unsupported intermediate schema.",
      "INVALID_GUITAR_PRO_TRACK_INVENTORY"
    );
  }

  const tracks = requireArray(
    intermediate.tracks,
    "The Guitar Pro decoder did not return a track list."
  );
  if (tracks.length > limits.maxTracks) {
    throw new GuitarProTrackInventoryError(
      `The Guitar Pro file contains ${tracks.length} tracks; the inventory limit is ${limits.maxTracks}.`,
      "GUITAR_PRO_TRACK_LIMIT"
    );
  }

  const items = [];
  tracks.forEach((track, trackIndex) => {
    const staves = requireArray(
      track?.staves,
      `Track ${trackIndex + 1} does not contain a staff list.`
    );
    staves.forEach((staff, staffIndex) => {
      items.push(inventoryItem(track, staff, trackIndex, staffIndex));
    });
  });

  if (items.length > limits.maxStaves) {
    throw new GuitarProTrackInventoryError(
      `The Guitar Pro file contains ${items.length} staves; the inventory limit is ${limits.maxStaves}.`,
      "GUITAR_PRO_STAFF_LIMIT"
    );
  }

  const supportedItems = items.filter((item) => item.supported);
  const autoSelection =
    supportedItems.length === 1
      ? {
          trackIndex: supportedItems[0].trackIndex,
          staffIndex: supportedItems[0].staffIndex,
        }
      : null;

  return {
    schemaVersion: 1,
    sourceVersion: intermediate.sourceVersion,
    versionEvidence: intermediate.versionEvidence,
    title: String(intermediate.title || "Guitar Pro tablature").trim(),
    items,
    supportedItems,
    supportedCount: supportedItems.length,
    requiresSelection: supportedItems.length > 1,
    autoSelection,
  };
}

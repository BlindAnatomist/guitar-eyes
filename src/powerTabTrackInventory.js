import { PowerTabImportError } from "./powerTabErrors";
import { POWERTAB_LIMITS } from "./powerTabLimits";

const SUPPORTED_SOURCE_VERSIONS = new Set([
  "PT2_V11",
  "PTB_V10",
  "PTB_V102",
  "PTB_V15",
  "PTB_V17",
]);
const SUPPORTED_STRING_COUNTS = new Set([4, 6]);
const STANDARD_BASS_MIDI = [43, 38, 33, 28];
const PITCH_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function fail(message, code = "POWERTAB_TRACK_INVENTORY_ERROR") {
  throw new PowerTabImportError(message, code);
}

function pitchLabel(midi) {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) {
    return "unknown pitch";
  }
  return `${PITCH_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

function plural(value, singular) {
  return value === 1 ? singular : `${singular}s`;
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function noteCoordinatesFit(bars, stringCount) {
  for (const bar of bars) {
    for (const voice of Array.isArray(bar?.voices) ? bar.voices : []) {
      for (const beat of Array.isArray(voice?.beats) ? voice.beats : []) {
        for (const note of Array.isArray(beat?.notes) ? beat.notes : []) {
          if (
            !Number.isInteger(note?.stringNumberLowToHigh) ||
            note.stringNumberLowToHigh < 1 ||
            note.stringNumberLowToHigh > stringCount
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function inventoryItem(track, staff, trackIndex, staffIndex) {
  const tuning = Array.isArray(staff?.tuningMidiHighToLow)
    ? staff.tuningMidiHighToLow
    : [];
  const bars = Array.isArray(staff?.bars) ? staff.bars : [];
  const stringCount = tuning.length;
  const measureCount = bars.length;
  const standardBassTuning =
    stringCount === 4 && arraysEqual(tuning, STANDARD_BASS_MIDI);
  const coherentCoordinates = noteCoordinatesFit(bars, stringCount);
  const standardBass = standardBassTuning && coherentCoordinates;
  const supportedStringProfile = stringCount === 6 || standardBass;
  const supported =
    !track?.isPercussion && supportedStringProfile && measureCount > 0;
  let reason = "Available for the Guitar Eyes semantic readers.";
  let reasonCode = null;

  if (track?.isPercussion) {
    reasonCode = "PERCUSSION_TRACK";
    reason = "Percussion does not contain supported fretted tablature.";
  } else if (!SUPPORTED_STRING_COUNTS.has(stringCount)) {
    reasonCode = "UNSUPPORTED_STRING_COUNT";
    reason = `This ${stringCount}-string player is outside the current PowerTab profiles.`;
  } else if (standardBassTuning && !coherentCoordinates) {
    reasonCode = "UNSUPPORTED_STRING_COUNT";
    reason =
      "This four-string tuning contains note coordinates outside four strings and remains outside the fixture-proven six-string guitar profile and exact four-string bass profile.";
  } else if (stringCount === 4 && !standardBass) {
    reasonCode = "UNSUPPORTED_TUNING";
    reason =
      "This four-string player is outside the current exact standard G2 D2 A1 E1 PowerTab bass profile.";
  } else if (measureCount === 0) {
    reasonCode = "NO_MEASURES";
    reason = "This player contains no assigned tablature measures.";
  }

  const instrument =
    stringCount === 4 ? "bass" : stringCount === 6 ? "guitar" : null;
  const instrumentLabel =
    instrument === "bass"
      ? "four-string bass"
      : instrument === "guitar"
        ? "six-string guitar"
        : `${stringCount}-string fretted player`;
  const trackName = String(
    track?.name || track?.shortName || `Player ${trackIndex + 1}`
  ).trim();
  const tuningLabel =
    tuning.length > 0 ? tuning.map(pitchLabel).join(", ") : "not reported";

  return {
    id: `powertab-player-${trackIndex + 1}-staff-${staffIndex + 1}`,
    trackIndex,
    staffIndex,
    trackNumber: trackIndex + 1,
    staffNumber: staffIndex + 1,
    trackName,
    shortName: String(track?.shortName || "").trim(),
    isPercussion: Boolean(track?.isPercussion),
    stringCount,
    tuningMidiHighToLow: tuning,
    tuningLabel,
    measureCount,
    instrument,
    instrumentLabel,
    supported,
    reasonCode,
    reason,
    selectionLabel: `${trackName}. ${instrumentLabel}. Tuning high to low: ${tuningLabel}. ${measureCount} ${plural(
      measureCount,
      "measure"
    )}.`,
  };
}

export function buildPowerTabTrackInventory(
  intermediate,
  { limits = POWERTAB_LIMITS } = {}
) {
  if (
    !intermediate ||
    intermediate.schemaVersion !== 1 ||
    !SUPPORTED_SOURCE_VERSIONS.has(intermediate.sourceVersion)
  ) {
    fail(
      "The PowerTab decoder returned an unsupported intermediate schema.",
      "INVALID_POWERTAB_TRACK_INVENTORY"
    );
  }
  if (!Array.isArray(intermediate.tracks)) {
    fail(
      "The PowerTab decoder did not return a player list.",
      "INVALID_POWERTAB_TRACK_INVENTORY"
    );
  }
  if (
    intermediate.versionEvidence?.decodedTrackCount !==
    intermediate.tracks.length
  ) {
    fail(
      "The PowerTab player count contradicts the decoded source evidence.",
      "POWERTAB_TRACK_COUNT_MISMATCH"
    );
  }
  if (intermediate.tracks.length > limits.maxPlayers) {
    fail(
      `The PowerTab file contains ${intermediate.tracks.length} players; the inventory limit is ${limits.maxPlayers}.`,
      "POWERTAB_PLAYER_LIMIT"
    );
  }

  const items = [];
  intermediate.tracks.forEach((track, trackIndex) => {
    if (!Array.isArray(track?.staves)) {
      fail(
        `PowerTab player ${trackIndex + 1} does not contain a staff list.`,
        "INVALID_POWERTAB_TRACK_INVENTORY"
      );
    }
    track.staves.forEach((staff, staffIndex) => {
      items.push(inventoryItem(track, staff, trackIndex, staffIndex));
    });
  });
  if (items.length > limits.maxStaves) {
    fail(
      `The PowerTab file contains ${items.length} player staves; the inventory limit is ${limits.maxStaves}.`,
      "POWERTAB_STAFF_LIMIT"
    );
  }

  const supportedItems = items.filter((item) => item.supported);
  return {
    schemaVersion: 1,
    sourceVersion: intermediate.sourceVersion,
    versionEvidence: intermediate.versionEvidence,
    title: String(intermediate.title || "PowerTab tablature").trim(),
    items,
    supportedItems,
    supportedCount: supportedItems.length,
    requiresSelection: supportedItems.length > 1,
    autoSelection:
      supportedItems.length === 1
        ? {
            trackIndex: supportedItems[0].trackIndex,
            staffIndex: supportedItems[0].staffIndex,
          }
        : null,
    selectorLabels: {
      formatName: "PowerTab",
      singular: "player",
      plural: "players",
      heading: "Choose a PowerTab player",
      loadAction: "Load selected player",
      selectedPrefix: "Selected player details",
      noneSelected: "No player selected.",
      unavailableHeading: "Other players not available",
      controlNote:
        "The separate Guitar or Bass control does not filter PowerTab players.",
    },
  };
}

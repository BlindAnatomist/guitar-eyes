const STRING_LINE_PATTERN = /^\s*([A-Ga-g])([#b♯♭]?)(-?\d+)?\s*\|(.*)$/;

export const ASCII_INSTRUMENT_PROFILES = {
  guitar: {
    id: "guitar",
    profileId: "six-string-guitar",
    label: "six-string guitar",
    stringCount: 6,
    standardTuning: ["E", "B", "G", "D", "A", "E"],
    allowCustomTuningWithoutOctaves: true,
  },
  sevenStringGuitar: {
    id: "guitar",
    profileId: "seven-string-guitar",
    label: "seven-string guitar",
    stringCount: 7,
    standardTuning: ["E", "B", "G", "D", "A", "E", "B"],
    standardOctaves: [4, 3, 3, 3, 2, 2, 1],
    requireEveryOctave: true,
    requireExactStandardOctaves: true,
    allowCustomTuningWithoutOctaves: false,
    stringIdentities: [
      { shortName: "high E", spokenName: "High E string" },
      { shortName: "B", spokenName: "B string" },
      { shortName: "G", spokenName: "G string" },
      { shortName: "D", spokenName: "D string" },
      { shortName: "A", spokenName: "A string" },
      { shortName: "low E", spokenName: "Low E string" },
      { shortName: "low B", spokenName: "Low B string" },
    ],
  },
  bass: {
    id: "bass",
    profileId: "four-string-bass",
    label: "four-string bass",
    stringCount: 4,
    standardTuning: ["G", "D", "A", "E"],
    allowCustomTuningWithoutOctaves: true,
  },
  fiveStringBass: {
    id: "bass",
    profileId: "five-string-bass",
    label: "five-string bass",
    stringCount: 5,
    standardTuning: ["G", "D", "A", "E", "B"],
    standardOctaves: [2, 2, 1, 1, 0],
    requireEveryOctave: true,
    requireExactStandardOctaves: true,
    allowCustomTuningWithoutOctaves: false,
    stringIdentities: [
      { shortName: "G", spokenName: "G string" },
      { shortName: "D", spokenName: "D string" },
      { shortName: "A", spokenName: "A string" },
      { shortName: "E", spokenName: "E string" },
      { shortName: "low B", spokenName: "Low B string" },
    ],
  },
};

export const SUPPORTED_ASCII_PROFILE_KEYS_BY_FAMILY = {
  guitar: ["guitar", "sevenStringGuitar"],
  bass: ["bass", "fiveStringBass"],
};

export const UNSUPPORTED_ASCII_INSTRUMENT_PROFILES = {};

const PITCH_CLASS = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

function normalizeAccidental(accidental) {
  if (accidental === "♯") return "#";
  if (accidental === "♭") return "b";
  return accidental || "";
}

export function normalizePitchLabel(letter, accidental = "") {
  return `${String(letter).toUpperCase()}${normalizeAccidental(accidental)}`;
}

export function classifyTabStringLine(line, lineNumber = null) {
  const sourceLine = String(line ?? "");
  const match = sourceLine.match(STRING_LINE_PATTERN);

  if (!match) {
    return {
      kind: "non-string-line",
      sourceLine,
      lineNumber,
    };
  }

  const tuning = normalizePitchLabel(match[1], match[2]);
  const octave = match[3] === undefined ? null : Number.parseInt(match[3], 10);

  return {
    kind: "string-line",
    sourceLine,
    lineNumber,
    rawLabel: `${match[1]}${match[2] || ""}${match[3] || ""}`,
    tuning,
    octave,
    content: match[4].replace(/\r$/, ""),
  };
}

export function isTabStringLine(line) {
  return classifyTabStringLine(line).kind === "string-line";
}

export function collectTabStringLineRuns(sourceText) {
  const normalizedLines = String(sourceText ?? "").replace(/\r\n?/g, "\n").split("\n");
  const runs = [];
  const nonTabLineNumbers = [];
  let currentRun = [];

  const finishRun = () => {
    if (currentRun.length > 0) {
      runs.push(currentRun);
      currentRun = [];
    }
  };

  normalizedLines.forEach((line, index) => {
    const classified = classifyTabStringLine(line, index + 1);

    if (classified.kind === "string-line") {
      currentRun.push(classified);
      return;
    }

    finishRun();
    if (line.trim().length > 0) nonTabLineNumbers.push(index + 1);
  });

  finishRun();

  return {
    normalizedLines,
    runs,
    nonTabLineNumbers,
  };
}

function countValues(values) {
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return counts;
}

function equalMultisets(left, right) {
  const leftCounts = countValues(left);
  const rightCounts = countValues(right);

  if (leftCounts.size !== rightCounts.size) return false;
  return [...leftCounts].every(([value, count]) => rightCounts.get(value) === count);
}

function pitchNumber(tuning, octave) {
  const pitchClass = PITCH_CLASS[tuning];
  if (pitchClass === undefined || octave === null) return null;
  return (octave + 1) * 12 + pitchClass;
}

function tuningSignature(segment) {
  return segment.map((entry) => `${entry.tuning}${entry.octave ?? ""}`).join("|");
}

function validateTuningSegment(segment, profile) {
  const tuning = segment.map((entry) => entry.tuning);
  const octaves = segment.map((entry) => entry.octave);
  const exactStandard = tuning.every(
    (pitch, index) => pitch === profile.standardTuning[index]
  );
  const exactStandardOctaves =
    !Array.isArray(profile.standardOctaves) ||
    octaves.every((octave, index) => octave === profile.standardOctaves[index]);
  const hasEveryOctave = octaves.every((octave) => octave !== null);
  const hasSomeOctave = octaves.some((octave) => octave !== null);

  if (hasEveryOctave) {
    const values = segment.map((entry) => pitchNumber(entry.tuning, entry.octave));
    const strictlyDescending = values.every(
      (value, index) => index === 0 || values[index - 1] > value
    );

    if (!strictlyDescending) {
      return {
        valid: false,
        code: "UNSAFE_TUNING_ORDER",
        message:
          "Octave-qualified string labels must descend from the highest-pitched string to the lowest without duplicate pitches.",
      };
    }

    if (
      profile.requireExactStandardOctaves &&
      (!exactStandard || !exactStandardOctaves)
    ) {
      return {
        valid: false,
        code: "UNVERIFIED_TUNING_PROFILE",
        message: `This checkpoint supports ${profile.label} only in exact standard tuning with the complete expected octave sequence.`,
      };
    }

    const exactStandardProfile = exactStandard && exactStandardOctaves;
    return {
      valid: true,
      confidence: exactStandardProfile ? 110 : 90,
      warnings: exactStandardProfile
        ? []
        : [`Custom ${profile.label} tuning was preserved from octave-qualified labels.`],
    };
  }

  if (profile.requireEveryOctave) {
    return {
      valid: false,
      code: "MISSING_TUNING_OCTAVES",
      message: `This checkpoint requires every ${profile.label} string label to include its octave so pitch and string order are explicit.`,
    };
  }

  if (!exactStandard && equalMultisets(tuning, profile.standardTuning)) {
    return {
      valid: false,
      code: "UNSAFE_TUNING_ORDER",
      message: `The string labels contain the pitches of standard ${profile.label} tuning but are not ordered from the highest string to the lowest.`,
    };
  }

  if (new Set(tuning).size === 1) {
    return {
      valid: false,
      code: "DUPLICATE_TUNING_LABELS",
      message: "Every string line uses the same tuning label, so the instrument cannot be identified safely.",
    };
  }

  if (!exactStandard && profile.allowCustomTuningWithoutOctaves === false) {
    return {
      valid: false,
      code: "UNVERIFIED_TUNING_PROFILE",
      message: `The ${profile.stringCount}-line run does not contain enough pitch evidence to identify ${profile.label} safely.`,
    };
  }

  const warnings = [];
  if (hasSomeOctave) {
    warnings.push(
      `Only some ${profile.label} string labels include octave numbers; pitch order could not be fully verified.`
    );
  } else if (!exactStandard) {
    warnings.push(`Custom ${profile.label} tuning was preserved from the supplied labels.`);
  }

  return {
    valid: true,
    confidence: exactStandard ? 100 : 60,
    warnings,
  };
}

export function analyzeTabRunsForProfile(sourceText, profile) {
  const collected = collectTabStringLineRuns(sourceText);

  if (collected.runs.length === 0) {
    return {
      valid: false,
      code: "NO_TABLATURE_BLOCKS",
      message: `No complete ${profile.label} tablature block was found.`,
      ...collected,
    };
  }

  const blocks = [];
  const warnings = [];
  const confidences = [];

  for (const run of collected.runs) {
    if (run.length % profile.stringCount !== 0) {
      return {
        valid: false,
        code: "INCOMPLETE_TABLATURE_BLOCK",
        message: `A tablature string-line run contains ${run.length} lines; complete ${profile.label} blocks require ${profile.stringCount} lines.`,
        ...collected,
      };
    }

    const runBlocks = [];
    for (let index = 0; index < run.length; index += profile.stringCount) {
      const segment = run.slice(index, index + profile.stringCount);
      const validation = validateTuningSegment(segment, profile);

      if (!validation.valid) {
        return {
          ...validation,
          ...collected,
        };
      }

      runBlocks.push(segment);
      confidences.push(validation.confidence);
      warnings.push(...validation.warnings);
    }

    if (runBlocks.length > 1) {
      const signatures = new Set(runBlocks.map(tuningSignature));
      if (signatures.size !== 1) {
        return {
          valid: false,
          code: "AMBIGUOUS_BLOCK_BOUNDARIES",
          message:
            "A continuous string-line run could be divided into multiple blocks only by assuming inconsistent tuning sequences. Separate the blocks with a heading or blank line.",
          ...collected,
        };
      }
    }

    blocks.push(...runBlocks);
  }

  return {
    valid: true,
    blocks,
    warnings: [...new Set(warnings)],
    confidence: Math.min(...confidences),
    ...collected,
  };
}

export function containsPlayableAsciiNotation(content) {
  const text = String(content ?? "");
  return /\d/.test(text) || /(?:^|[^A-Za-z])x(?:$|[^A-Za-z])/i.test(text);
}

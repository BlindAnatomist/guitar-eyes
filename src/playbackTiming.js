export const DEFAULT_PLAYBACK_TEMPO_BPM = 120;
export const MIN_PLAYBACK_TEMPO_BPM = 20;
export const MAX_PLAYBACK_TEMPO_BPM = 300;

export class PlaybackTimingError extends Error {
  constructor(message, code = "PLAYBACK_TIMING_ERROR") {
    super(message);
    this.name = "PlaybackTimingError";
    this.code = code;
  }
}

function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a || 1;
}

function reduceFraction(numerator, denominator, context) {
  if (
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    denominator <= 0
  ) {
    throw new PlaybackTimingError(
      `${context} could not be represented as a safe integer fraction.`,
      "UNREPRESENTABLE_PLAYBACK_DURATION"
    );
  }

  if (numerator <= 0) {
    throw new PlaybackTimingError(
      `${context} must be greater than zero.`,
      "INVALID_PLAYBACK_DURATION"
    );
  }

  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function addFractions(left, right, context = "Playback timing") {
  const numerator =
    left.numerator * right.denominator + right.numerator * left.denominator;
  const denominator = left.denominator * right.denominator;

  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
    throw new PlaybackTimingError(
      `${context} exceeded safe exact fraction limits.`,
      "UNREPRESENTABLE_PLAYBACK_DURATION"
    );
  }

  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function decimalNumberToFraction(value, context) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new PlaybackTimingError(
      `${context} must be a positive finite duration.`,
      "INVALID_PLAYBACK_DURATION"
    );
  }

  const text = String(value).toLowerCase();
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/.exec(text);

  if (!match) {
    throw new PlaybackTimingError(
      `${context} could not be converted to an exact decimal fraction.`,
      "UNREPRESENTABLE_PLAYBACK_DURATION"
    );
  }

  const whole = match[1];
  const fractional = match[2] || "";
  const exponent = Number.parseInt(match[3] || "0", 10);
  const digits = `${whole}${fractional}`.replace(/^0+(?=\d)/, "") || "0";

  let numerator = Number(digits);
  let denominator = 10 ** fractional.length;

  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
    throw new PlaybackTimingError(
      `${context} exceeds safe exact decimal limits.`,
      "UNREPRESENTABLE_PLAYBACK_DURATION"
    );
  }

  if (exponent > 0) {
    const factor = 10 ** exponent;
    if (!Number.isSafeInteger(factor) || !Number.isSafeInteger(numerator * factor)) {
      throw new PlaybackTimingError(
        `${context} exceeds safe exact decimal limits.`,
        "UNREPRESENTABLE_PLAYBACK_DURATION"
      );
    }
    numerator *= factor;
  } else if (exponent < 0) {
    const factor = 10 ** Math.abs(exponent);
    if (!Number.isSafeInteger(factor) || !Number.isSafeInteger(denominator * factor)) {
      throw new PlaybackTimingError(
        `${context} exceeds safe exact decimal limits.`,
        "UNREPRESENTABLE_PLAYBACK_DURATION"
      );
    }
    denominator *= factor;
  }

  return reduceFraction(numerator, denominator, context);
}

function durationFraction(position, index) {
  const context = `Position ${index + 1} duration`;
  const duration = position?.duration;

  if (!duration || typeof duration !== "object") {
    throw new PlaybackTimingError(
      `${context} is missing. Playback timing does not guess durations.`,
      "PLAYBACK_TIMING_INCOMPLETE"
    );
  }

  if (Object.prototype.hasOwnProperty.call(duration, "quarterNoteFraction")) {
    const fraction = duration.quarterNoteFraction;
    if (!fraction || typeof fraction !== "object") {
      throw new PlaybackTimingError(
        `${context} contains a malformed exact fraction.`,
        "INVALID_PLAYBACK_DURATION"
      );
    }
    return reduceFraction(fraction.numerator, fraction.denominator, context);
  }

  const hasDivisions = Object.prototype.hasOwnProperty.call(
    duration,
    "durationDivisions"
  );
  const hasDivisionsPerQuarter = Object.prototype.hasOwnProperty.call(
    duration,
    "divisionsPerQuarter"
  );

  if (hasDivisions || hasDivisionsPerQuarter) {
    if (
      !Number.isSafeInteger(duration.durationDivisions) ||
      !Number.isSafeInteger(duration.divisionsPerQuarter)
    ) {
      throw new PlaybackTimingError(
        `${context} contains invalid MusicXML division values.`,
        "INVALID_PLAYBACK_DURATION"
      );
    }
    return reduceFraction(
      duration.durationDivisions,
      duration.divisionsPerQuarter,
      context
    );
  }

  if (!Object.prototype.hasOwnProperty.call(duration, "quarterNoteUnits")) {
    throw new PlaybackTimingError(
      `${context} has no supported duration evidence. Playback timing does not guess.`,
      "PLAYBACK_TIMING_INCOMPLETE"
    );
  }

  return decimalNumberToFraction(duration.quarterNoteUnits, context);
}

function fractionToUnits(fraction) {
  return fraction.numerator / fraction.denominator;
}

function millisecondsForFraction(fraction, beatsPerMinute) {
  return fractionToUnits(fraction) * (60000 / beatsPerMinute);
}

function validateTempo(options) {
  const hasExplicitTempo =
    options !== null &&
    typeof options === "object" &&
    Object.prototype.hasOwnProperty.call(options, "beatsPerMinute");
  const beatsPerMinute = hasExplicitTempo
    ? options.beatsPerMinute
    : DEFAULT_PLAYBACK_TEMPO_BPM;

  if (
    !Number.isInteger(beatsPerMinute) ||
    beatsPerMinute < MIN_PLAYBACK_TEMPO_BPM ||
    beatsPerMinute > MAX_PLAYBACK_TEMPO_BPM
  ) {
    throw new PlaybackTimingError(
      `Playback tempo must be an integer from ${MIN_PLAYBACK_TEMPO_BPM} through ${MAX_PLAYBACK_TEMPO_BPM} beats per minute.`,
      "INVALID_PLAYBACK_TEMPO"
    );
  }

  return {
    beatsPerMinute,
    source: hasExplicitTempo ? "explicit" : "checkpoint-default",
    millisecondsPerQuarterNote: 60000 / beatsPerMinute,
  };
}

function isPlayedState(state) {
  return (
    state?.type === "fret" ||
    state?.type === "open" ||
    (state?.type === "technique" && state?.name === "muted note")
  );
}

function positionIdentity(position, index) {
  const playedStateCount = Array.isArray(position?.strings)
    ? position.strings.filter(isPlayedState).length
    : 0;

  return {
    id: String(position?.id || `position-${index + 1}`),
    sourcePositionIndex: index,
    positionNumber: Number.isInteger(position?.number) ? position.number : index + 1,
    blockNumber: Number.isInteger(position?.blockNumber)
      ? position.blockNumber
      : null,
    positionInBlock: Number.isInteger(position?.positionInBlock)
      ? position.positionInBlock
      : null,
    measureNumber: Number.isInteger(position?.measureNumber)
      ? position.measureNumber
      : null,
    positionInMeasure: Number.isInteger(position?.positionInMeasure)
      ? position.positionInMeasure
      : null,
    isRest: Boolean(position?.isRest),
    isChord: !position?.isRest && playedStateCount > 1,
    playedStateCount,
  };
}

function measureMetadata(document) {
  const byKey = new Map();

  if (!Array.isArray(document?.measures)) return byKey;

  document.measures.forEach((measure) => {
    if (!Number.isInteger(measure?.blockNumber) || !Number.isInteger(measure?.number)) {
      return;
    }

    byKey.set(`${measure.blockNumber}:${measure.number}`, {
      id: String(measure.id || `block-${measure.blockNumber}-measure-${measure.number}`),
      sourceNumber:
        measure.sourceNumber === undefined || measure.sourceNumber === null
          ? null
          : String(measure.sourceNumber),
      documentNumber: Number.isInteger(measure.documentNumber)
        ? measure.documentNumber
        : null,
      timeSignatureNumerator: Number.isInteger(measure.timeSignatureNumerator)
        ? measure.timeSignatureNumerator
        : null,
      timeSignatureDenominator: Number.isInteger(measure.timeSignatureDenominator)
        ? measure.timeSignatureDenominator
        : null,
    });
  });

  return byKey;
}

function buildMeasureSummaries(document, timelinePositions, beatsPerMinute) {
  const metadata = measureMetadata(document);
  const summaries = [];

  timelinePositions.forEach((position) => {
    if (!Number.isInteger(position.blockNumber) || !Number.isInteger(position.measureNumber)) {
      return;
    }

    const key = `${position.blockNumber}:${position.measureNumber}`;
    const current = summaries.at(-1);

    if (current?.key === key) {
      current.lastTimelineIndex = position.timelineIndex;
      current.positionCount += 1;
      current.endQuarterNoteFraction = { ...position.endQuarterNoteFraction };
      current.endQuarterNoteUnits = position.endQuarterNoteUnits;
      current.endMilliseconds = position.endMilliseconds;
      current.durationQuarterNoteFraction = addFractions(
        current.durationQuarterNoteFraction,
        position.durationQuarterNoteFraction,
        `Measure ${position.measureNumber} duration`
      );
      current.durationQuarterNoteUnits = fractionToUnits(
        current.durationQuarterNoteFraction
      );
      current.durationMilliseconds = millisecondsForFraction(
        current.durationQuarterNoteFraction,
        beatsPerMinute
      );
      return;
    }

    const source = metadata.get(key) || {};
    summaries.push({
      key,
      id: source.id || `block-${position.blockNumber}-measure-${position.measureNumber}`,
      blockNumber: position.blockNumber,
      measureNumber: position.measureNumber,
      sourceNumber: source.sourceNumber ?? null,
      documentNumber: source.documentNumber ?? null,
      timeSignatureNumerator: source.timeSignatureNumerator ?? null,
      timeSignatureDenominator: source.timeSignatureDenominator ?? null,
      firstTimelineIndex: position.timelineIndex,
      lastTimelineIndex: position.timelineIndex,
      positionCount: 1,
      startQuarterNoteFraction: { ...position.startQuarterNoteFraction },
      durationQuarterNoteFraction: { ...position.durationQuarterNoteFraction },
      endQuarterNoteFraction: { ...position.endQuarterNoteFraction },
      startQuarterNoteUnits: position.startQuarterNoteUnits,
      durationQuarterNoteUnits: position.durationQuarterNoteUnits,
      endQuarterNoteUnits: position.endQuarterNoteUnits,
      startMilliseconds: position.startMilliseconds,
      durationMilliseconds: position.durationMilliseconds,
      endMilliseconds: position.endMilliseconds,
    });
  });

  return summaries.map(({ key, ...summary }) => summary);
}

export function buildPlaybackTimeline(semanticDocument, options = {}) {
  if (!semanticDocument || typeof semanticDocument !== "object") {
    throw new PlaybackTimingError(
      "Playback timing requires a semantic tablature document.",
      "INVALID_PLAYBACK_DOCUMENT"
    );
  }

  if (!Array.isArray(semanticDocument.positions)) {
    throw new PlaybackTimingError(
      "The semantic tablature document does not contain a position list.",
      "INVALID_PLAYBACK_DOCUMENT"
    );
  }

  if (semanticDocument.positions.length === 0) {
    throw new PlaybackTimingError(
      "The semantic tablature document contains no positions to time.",
      "EMPTY_PLAYBACK_DOCUMENT"
    );
  }

  const tempo = validateTempo(options);
  let currentOffset = { numerator: 0, denominator: 1 };

  const positions = semanticDocument.positions.map((position, index) => {
    const exactDuration = durationFraction(position, index);
    const start = { ...currentOffset };
    const end = addFractions(start, exactDuration, `Position ${index + 1} end`);
    const identity = positionIdentity(position, index);

    const timelinePosition = {
      type: "playback-timeline-position",
      timelineIndex: index,
      ...identity,
      startQuarterNoteFraction: start,
      durationQuarterNoteFraction: { ...exactDuration },
      endQuarterNoteFraction: end,
      startQuarterNoteUnits: fractionToUnits(start),
      durationQuarterNoteUnits: fractionToUnits(exactDuration),
      endQuarterNoteUnits: fractionToUnits(end),
      startMilliseconds: millisecondsForFraction(start, tempo.beatsPerMinute),
      durationMilliseconds: millisecondsForFraction(
        exactDuration,
        tempo.beatsPerMinute
      ),
      endMilliseconds: millisecondsForFraction(end, tempo.beatsPerMinute),
    };

    currentOffset = end;
    return timelinePosition;
  });

  const totalQuarterNoteFraction = { ...currentOffset };
  const measures = buildMeasureSummaries(
    semanticDocument,
    positions,
    tempo.beatsPerMinute
  );

  return {
    schemaVersion: 1,
    type: "playback-timeline",
    sourceDocumentFormat: String(
      semanticDocument.sourceFormat || "ascii-text"
    ),
    sourceDocumentTitle:
      semanticDocument.title === undefined || semanticDocument.title === null
        ? null
        : String(semanticDocument.title),
    playbackOrder: "source-order",
    repeatExpansion: "not-applied",
    tempo,
    positions,
    measures,
    totalPositionCount: positions.length,
    totalMeasureCount: measures.length,
    totalQuarterNoteFraction,
    totalQuarterNoteUnits: fractionToUnits(totalQuarterNoteFraction),
    totalDurationMilliseconds: millisecondsForFraction(
      totalQuarterNoteFraction,
      tempo.beatsPerMinute
    ),
  };
}

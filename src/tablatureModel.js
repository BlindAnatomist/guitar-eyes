const TECHNIQUE_NAMES = {
  h: "hammer-on",
  H: "hammer-on",
  p: "pull-off",
  P: "pull-off",
  "/": "ascending slide",
  "\\": "descending slide",
  b: "bend",
  B: "bend",
  r: "bend release",
  R: "bend release",
  "~": "vibrato",
  x: "muted note",
  X: "muted note",
  t: "tap",
  T: "tap",
  s: "slide",
  S: "slide",
};

const INSTRUMENT_CONFIG = {
  guitar: {
    name: "guitar",
    stringCount: 6,
    standardTuning: ["E", "B", "G", "D", "A", "E"],
  },
  bass: {
    name: "bass",
    stringCount: 4,
    standardTuning: ["G", "D", "A", "E"],
  },
};

export class TabParseError extends Error {
  constructor(message, code = "TAB_PARSE_ERROR") {
    super(message);
    this.name = "TabParseError";
    this.code = code;
  }
}

export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new TabParseError("Choose a plain-text tablature file first.", "NO_FILE"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result ?? ""));
    reader.onerror = () =>
      reject(new TabParseError("The selected file could not be read.", "FILE_READ_ERROR"));
    reader.readAsText(file);
  });
}

function getInstrumentConfig(instrument) {
  const config = INSTRUMENT_CONFIG[instrument];
  if (!config) {
    throw new TabParseError(
      `The instrument ${instrument} is not supported. Choose guitar or bass.`,
      "UNSUPPORTED_INSTRUMENT"
    );
  }
  return config;
}

function normalizePitch(rawPitch) {
  const letter = rawPitch.charAt(0).toUpperCase();
  const accidental = rawPitch.slice(1);
  return `${letter}${accidental}`;
}

function pitchForSpeech(pitch) {
  if (pitch.endsWith("#")) return `${pitch.charAt(0)} sharp`;
  if (pitch.endsWith("b")) return `${pitch.charAt(0)} flat`;
  return pitch;
}

function makeStringIdentity(index, tuning, config) {
  const isStandard = tuning === config.standardTuning[index];

  if (config.name === "guitar" && isStandard && index === 0) {
    return { shortName: "high E", spokenName: "High E string" };
  }

  if (config.name === "guitar" && isStandard && index === 5) {
    return { shortName: "low E", spokenName: "Low E string" };
  }

  if (isStandard) {
    return { shortName: tuning, spokenName: `${tuning} string` };
  }

  return {
    shortName: `string ${index + 1}`,
    spokenName: `String ${index + 1}, tuned ${pitchForSpeech(tuning)}`,
  };
}

function tokenizeContent(content) {
  const tokens = [];

  for (let column = 0; column < content.length; column += 1) {
    const char = content[column];

    if (/\d/.test(char)) {
      let end = column + 1;
      while (end < content.length && /\d/.test(content[end])) end += 1;

      const raw = content.slice(column, end);
      tokens.push({
        type: "fret",
        raw,
        value: Number.parseInt(raw, 10),
        startColumn: column,
        endColumn: end,
      });
      column = end - 1;
      continue;
    }

    if (char === "-" || char === " " || char === "\t") continue;

    if (char === "|") {
      tokens.push({
        type: "barline",
        raw: char,
        startColumn: column,
        endColumn: column + 1,
      });
      continue;
    }

    if (TECHNIQUE_NAMES[char]) {
      tokens.push({
        type: "technique",
        raw: char,
        name: TECHNIQUE_NAMES[char],
        startColumn: column,
        endColumn: column + 1,
      });
      continue;
    }

    tokens.push({
      type: "unsupported",
      raw: char,
      startColumn: column,
      endColumn: column + 1,
    });
  }

  return tokens;
}

function parseStringLine(entry, index, blockIndex, config) {
  const match = entry.text.match(/^\s*([A-Ga-g](?:#|b)?)\s*\|(.*)$/);

  if (!match) {
    throw new TabParseError(
      `Source line ${entry.lineNumber} is not a supported tablature string. Each string line must begin with a tuning label followed by a vertical bar, such as E|----0----|.`,
      "INVALID_STRING_LINE"
    );
  }

  const tuning = normalizePitch(match[1]);
  const content = match[2].replace(/\r$/, "");
  const identity = makeStringIdentity(index, tuning, config);

  return {
    id: `block-${blockIndex + 1}-string-${index + 1}`,
    index,
    tuning,
    sourceLineNumber: entry.lineNumber,
    sourceLine: entry.text,
    content,
    tokens: tokenizeContent(content),
    ...identity,
  };
}

function stateAtColumn(string, column) {
  const startingToken = string.tokens.find(
    (token) => token.type !== "barline" && token.startColumn === column
  );

  if (startingToken) {
    if (startingToken.type === "fret") {
      return startingToken.value === 0
        ? { type: "open", token: startingToken }
        : { type: "fret", token: startingToken, fret: startingToken.value };
    }

    if (startingToken.type === "technique") {
      return {
        type: "technique",
        token: startingToken,
        name: startingToken.name,
      };
    }

    return {
      type: "unsupported",
      token: startingToken,
      raw: startingToken.raw,
    };
  }

  const spanningFret = string.tokens.find(
    (token) =>
      token.type === "fret" &&
      token.startColumn < column &&
      token.endColumn > column
  );

  if (spanningFret) {
    return {
      type: "continuation",
      token: spanningFret,
      fret: spanningFret.value,
    };
  }

  return { type: "silent" };
}

function buildPositions(strings) {
  const eventColumns = new Set();
  const barlineColumns = new Set();

  strings.forEach((string) => {
    string.tokens.forEach((token) => {
      if (token.type === "barline") barlineColumns.add(token.startColumn);
      else eventColumns.add(token.startColumn);
    });
  });

  const sortedBarlines = [...barlineColumns].sort((left, right) => left - right);
  const positions = [...eventColumns]
    .sort((left, right) => left - right)
    .map((sourceColumn) => ({
      sourceColumn,
      measureNumber:
        1 + sortedBarlines.filter((barlineColumn) => barlineColumn < sourceColumn).length,
      strings: strings.map((string) => ({
        stringId: string.id,
        ...stateAtColumn(string, sourceColumn),
      })),
    }));

  const measureTotals = new Map();
  positions.forEach((position) => {
    measureTotals.set(
      position.measureNumber,
      (measureTotals.get(position.measureNumber) ?? 0) + 1
    );
  });

  const measureIndexes = new Map();
  return positions.map((position, index) => {
    const nextMeasureIndex = (measureIndexes.get(position.measureNumber) ?? 0) + 1;
    measureIndexes.set(position.measureNumber, nextMeasureIndex);

    return {
      ...position,
      blockPositionIndex: index,
      blockPositionNumber: index + 1,
      blockPositionTotal: positions.length,
      measurePositionNumber: nextMeasureIndex,
      measurePositionTotal: measureTotals.get(position.measureNumber),
    };
  });
}

function isTabStringLine(line) {
  return /^\s*[A-Ga-g](?:#|b)?\s*\|/.test(line);
}

function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function blockWarnings(block, blockNumber) {
  const warnings = [];
  const lineLengths = block.strings.map((string) => string.content.length);
  const maxLineLength = Math.max(...lineLengths);

  if (lineLengths.some((length) => length !== maxLineLength)) {
    warnings.push(
      `Tablature block ${blockNumber} has unequal string-line lengths. Original columns were preserved, and missing trailing columns are treated as silent.`
    );
  }

  const unsupportedCount = block.strings.reduce(
    (count, string) =>
      count + string.tokens.filter((token) => token.type === "unsupported").length,
    0
  );

  if (unsupportedCount > 0) {
    warnings.push(
      `Tablature block ${blockNumber} contains ${unsupportedCount} notation ${
        unsupportedCount === 1 ? "symbol" : "symbols"
      } that were preserved but cannot yet be interpreted.`
    );
  }

  return { warnings, maxLineLength };
}

export function parseTabText(sourceText, instrument = "guitar") {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    throw new TabParseError("The file is empty.", "EMPTY_FILE");
  }

  const config = getInstrumentConfig(instrument);
  const sourceLines = sourceText.replace(/\r\n/g, "\n").split("\n");
  const runs = [];
  const ignoredLines = [];
  let currentRun = [];

  const flushRun = () => {
    if (currentRun.length > 0) runs.push(currentRun);
    currentRun = [];
  };

  sourceLines.forEach((text, index) => {
    if (isTabStringLine(text)) {
      currentRun.push({ text, lineNumber: index + 1 });
      return;
    }

    flushRun();
    if (text.trim().length > 0) {
      ignoredLines.push({ text, lineNumber: index + 1 });
    }
  });
  flushRun();

  const warnings = [];
  const blockGroups = [];

  runs.forEach((run) => {
    const fullBlockCount = Math.floor(run.length / config.stringCount);
    for (let groupIndex = 0; groupIndex < fullBlockCount; groupIndex += 1) {
      const start = groupIndex * config.stringCount;
      blockGroups.push(run.slice(start, start + config.stringCount));
    }

    const remainder = run.length % config.stringCount;
    if (remainder > 0) {
      const firstLine = run[run.length - remainder].lineNumber;
      warnings.push(
        `Ignored an incomplete ${config.name} tablature block beginning at source line ${firstLine}; it contained ${remainder} of the required ${config.stringCount} string lines.`
      );
    }
  });

  if (blockGroups.length === 0) {
    throw new TabParseError(
      `No complete ${config.stringCount}-string ${config.name} tablature block was found. Each string line must begin with a tuning label followed by a vertical bar.`,
      "NO_COMPLETE_TAB_BLOCK"
    );
  }

  const blocks = [];

  blockGroups.forEach((group, blockIndex) => {
    const strings = group.map((entry, stringIndex) =>
      parseStringLine(entry, stringIndex, blockIndex, config)
    );
    const positions = buildPositions(strings);

    if (positions.length === 0) {
      warnings.push(
        `Tablature block ${blockIndex + 1} contained no frets or recognizable notation and was not included.`
      );
      return;
    }

    const baseBlock = {
      type: "tablature-block",
      index: blocks.length,
      sourceBlockIndex: blockIndex,
      sourceStartLine: group[0].lineNumber,
      sourceEndLine: group[group.length - 1].lineNumber,
      strings,
      positions,
    };
    const warningResult = blockWarnings(baseBlock, blocks.length + 1);
    warnings.push(...warningResult.warnings);
    blocks.push({ ...baseBlock, maxLineLength: warningResult.maxLineLength });
  });

  if (blocks.length === 0) {
    throw new TabParseError(
      "Complete tablature string groups were found, but none contained frets or recognizable notation.",
      "NO_MUSICAL_POSITIONS"
    );
  }

  if (ignoredLines.length > 0) {
    warnings.push(
      `${ignoredLines.length} non-tablature source ${
        ignoredLines.length === 1 ? "line was" : "lines were"
      } preserved outside the semantic blocks and ignored by the reader.`
    );
  }

  const positions = [];
  blocks.forEach((block) => {
    block.positions = block.positions.map((position) => {
      const globalPosition = {
        ...position,
        index: positions.length,
        number: positions.length + 1,
        blockIndex: block.index,
      };
      positions.push(globalPosition);
      return globalPosition;
    });
  });
  positions.forEach((position) => {
    position.total = positions.length;
  });

  return {
    type: "tablature-document",
    instrument: config.name,
    stringCount: config.stringCount,
    sourceText,
    ignoredLines,
    blocks,
    positions,
    warnings,
    strings: blocks[0].strings,
  };
}

export function parseSixStringTabText(sourceText) {
  return parseTabText(sourceText, "guitar");
}

export function describeStringState(string, state) {
  if (!string || !state) return "Unknown string state.";

  switch (state.type) {
    case "fret":
      return `${string.spokenName}, fret ${state.fret}.`;
    case "open":
      return `${string.spokenName}, open.`;
    case "technique":
      return `${string.spokenName}, ${state.name} notation preserved but not yet interpreted.`;
    case "unsupported":
      return `${string.spokenName}, notation ${state.raw} cannot yet be interpreted.`;
    case "continuation":
      return `${string.spokenName}, continuation of fret ${state.fret}.`;
    default:
      return `${string.spokenName}, silent.`;
  }
}

export function compactStringState(state) {
  if (!state) return "Silent";
  switch (state.type) {
    case "fret":
      return String(state.fret);
    case "open":
      return "Open";
    case "technique":
      return state.name;
    case "unsupported":
      return state.raw || "Unsupported";
    case "continuation":
      return `Continue ${state.fret}`;
    default:
      return "Silent";
  }
}

export function describePosition(document, positionIndex) {
  const position = document?.positions?.[positionIndex];
  if (!position) return "No tablature position is available.";

  const block = document.blocks[position.blockIndex];
  const stringById = new Map(block.strings.map((string) => [string.id, string]));
  const playedDescriptions = [];
  const silentStrings = [];

  [...position.strings].reverse().forEach((state) => {
    const string = stringById.get(state.stringId);
    if (!string) return;

    if (state.type === "silent") silentStrings.push(string.shortName);
    else playedDescriptions.push(describeStringState(string, state));
  });

  const parts = [];
  if (document.blocks.length > 1) {
    parts.push(`Tablature block ${position.blockIndex + 1} of ${document.blocks.length}.`);
  }
  parts.push(
    `Measure ${position.measureNumber}, position ${position.measurePositionNumber} of ${position.measurePositionTotal}.`
  );
  parts.push(...playedDescriptions);

  if (silentStrings.length > 0) {
    const subject = formatList(silentStrings);
    parts.push(
      `${subject} ${silentStrings.length === 1 ? "string is" : "strings are"} silent.`
    );
  }

  return parts.join(" ");
}

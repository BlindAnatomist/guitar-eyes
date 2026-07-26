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

const INSTRUMENTS = {
  guitar: {
    id: "guitar",
    label: "six-string guitar",
    stringCount: 6,
    standardTuning: ["E", "B", "G", "D", "A", "E"],
  },
  bass: {
    id: "bass",
    label: "four-string bass",
    stringCount: 4,
    standardTuning: ["G", "D", "A", "E"],
  },
};

const STRING_LINE_PATTERN = /^\s*([A-Ga-g](?:#|b)?)\s*\|(.*)$/;

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

function getInstrumentConfig(selectedInstrument) {
  const config = INSTRUMENTS[selectedInstrument];

  if (!config) {
    throw new TabParseError(
      `The instrument "${selectedInstrument}" is not supported.`,
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
  if (pitch.endsWith("#")) {
    return `${pitch.charAt(0)} sharp`;
  }
  if (pitch.endsWith("b")) {
    return `${pitch.charAt(0)} flat`;
  }
  return pitch;
}

function makeStringIdentity(index, tuning, config) {
  const isStandard = tuning === config.standardTuning[index];

  if (config.id === "guitar" && isStandard && index === 0) {
    return {
      shortName: "high E",
      spokenName: "High E string",
    };
  }

  if (config.id === "guitar" && isStandard && index === config.stringCount - 1) {
    return {
      shortName: "low E",
      spokenName: "Low E string",
    };
  }

  if (isStandard) {
    return {
      shortName: tuning,
      spokenName: `${tuning} string`,
    };
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
      while (end < content.length && /\d/.test(content[end])) {
        end += 1;
      }

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

    if (char === "-" || char === " " || char === "\t") {
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

    if (char === "|" && column === content.length - 1) {
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
  const line = typeof entry === "string" ? entry : entry.line;
  const lineNumber = typeof entry === "string" ? index + 1 : entry.lineNumber;
  const match = line.match(STRING_LINE_PATTERN);

  if (!match) {
    throw new TabParseError(
      `Line ${lineNumber} is not a supported tablature string. Each string line must begin with a tuning label followed by a vertical bar, such as E|----0----|.`,
      "INVALID_STRING_LINE"
    );
  }

  const tuning = normalizePitch(match[1]);
  const content = match[2].replace(/\r$/, "");
  const identity = makeStringIdentity(index, tuning, config);

  return {
    id: `block-${blockIndex + 1}-string-${index + 1}`,
    index,
    blockIndex,
    tuning,
    sourceLine: line,
    sourceLineNumber: lineNumber,
    content,
    tokens: tokenizeContent(content),
    ...identity,
  };
}

function stateAtColumn(string, column) {
  const startingToken = string.tokens.find((token) => token.startColumn === column);

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

function buildBlockPositions(strings, blockIndex) {
  const eventColumns = new Set();

  strings.forEach((string) => {
    string.tokens.forEach((token) => eventColumns.add(token.startColumn));
  });

  const columns = [...eventColumns].sort((left, right) => left - right);

  return columns.map((sourceColumn, positionIndex) => ({
    blockIndex,
    blockNumber: blockIndex + 1,
    positionInBlock: positionIndex + 1,
    positionsInBlock: columns.length,
    sourceColumn,
    strings: strings.map((string) => ({
      stringId: string.id,
      ...stateAtColumn(string, sourceColumn),
    })),
  }));
}

function formatList(items) {
  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function collectBlockWarnings(strings, blockNumber) {
  const warnings = [];
  const lineLengths = strings.map((string) => string.content.length);
  const maxLineLength = Math.max(...lineLengths);

  if (lineLengths.some((length) => length !== maxLineLength)) {
    warnings.push(
      `Block ${blockNumber} has string lines of unequal lengths. Their original columns were preserved, and missing trailing columns are treated as silent.`
    );
  }

  const unsupportedCount = strings.reduce(
    (count, string) =>
      count + string.tokens.filter((token) => token.type === "unsupported").length,
    0
  );

  if (unsupportedCount > 0) {
    warnings.push(
      `Block ${blockNumber} contains ${unsupportedCount} notation ${
        unsupportedCount === 1 ? "symbol that was" : "symbols that were"
      } preserved but cannot yet be interpreted.`
    );
  }

  return { warnings, maxLineLength };
}

function locateTabBlocks(sourceText, config, { allowNonTabText }) {
  const normalizedLines = sourceText.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  const ignoredNonTabLines = [];
  let pending = [];

  normalizedLines.forEach((line, lineIndex) => {
    if (STRING_LINE_PATTERN.test(line)) {
      pending.push({ line, lineNumber: lineIndex + 1 });

      if (pending.length === config.stringCount) {
        blocks.push(pending);
        pending = [];
      }
      return;
    }

    if (line.trim().length > 0) {
      if (!allowNonTabText) {
        throw new TabParseError(
          `Line ${lineIndex + 1} is not part of the required clean ${config.label} tablature block.`,
          "NON_TAB_TEXT_NOT_ALLOWED"
        );
      }
      ignoredNonTabLines.push(lineIndex + 1);
    }
  });

  if (pending.length > 0) {
    throw new TabParseError(
      `The final ${config.label} tablature block contains ${pending.length} string ${
        pending.length === 1 ? "line" : "lines"
      }; ${config.stringCount} are required.`,
      "INCOMPLETE_TABLATURE_BLOCK"
    );
  }

  if (blocks.length === 0) {
    throw new TabParseError(
      `No complete ${config.label} tablature block was found.`,
      "NO_TABLATURE_BLOCKS"
    );
  }

  return { blocks, ignoredNonTabLines };
}

function parseDocument(sourceText, selectedInstrument, options = {}) {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    throw new TabParseError("The file is empty.", "EMPTY_FILE");
  }

  const config = getInstrumentConfig(selectedInstrument);
  const allowNonTabText = options.allowNonTabText !== false;
  const requireBlockCount = options.requireBlockCount ?? null;
  const located = locateTabBlocks(sourceText, config, { allowNonTabText });

  if (requireBlockCount !== null && located.blocks.length !== requireBlockCount) {
    throw new TabParseError(
      `This parser accepts exactly ${requireBlockCount} ${config.label} tablature ${
        requireBlockCount === 1 ? "block" : "blocks"
      }. The file contains ${located.blocks.length}.`,
      "WRONG_BLOCK_COUNT"
    );
  }

  const warnings = [];

  if (located.ignoredNonTabLines.length > 0) {
    warnings.push(
      `${located.ignoredNonTabLines.length} non-tablature ${
        located.ignoredNonTabLines.length === 1 ? "line was" : "lines were"
      } ignored while locating tablature blocks.`
    );
  }

  const blocks = located.blocks.map((entries, blockIndex) => {
    const strings = entries.map((entry, stringIndex) =>
      parseStringLine(entry, stringIndex, blockIndex, config)
    );
    const positions = buildBlockPositions(strings, blockIndex);

    if (positions.length === 0) {
      throw new TabParseError(
        `Block ${blockIndex + 1} contains no frets or recognizable tablature notation.`,
        "NO_MUSICAL_POSITIONS"
      );
    }

    const blockDetails = collectBlockWarnings(strings, blockIndex + 1);
    warnings.push(...blockDetails.warnings);

    return {
      type: "tablature-block",
      index: blockIndex,
      number: blockIndex + 1,
      strings,
      positions,
      maxLineLength: blockDetails.maxLineLength,
    };
  });

  const positions = blocks
    .flatMap((block) => block.positions)
    .map((position, index, allPositions) => ({
      ...position,
      index,
      number: index + 1,
      total: allPositions.length,
    }));

  const strings = blocks.flatMap((block) => block.strings);

  return {
    type: "tablature-document",
    sourceText,
    instrument: config.id,
    instrumentLabel: config.label,
    stringCount: config.stringCount,
    blocks,
    strings,
    positions,
    warnings,
  };
}

export function parseTabDocumentText(sourceText, selectedInstrument = "guitar") {
  return parseDocument(sourceText, selectedInstrument, {
    allowNonTabText: true,
  });
}

export function parseSixStringTabText(sourceText) {
  return parseDocument(sourceText, "guitar", {
    allowNonTabText: false,
    requireBlockCount: 1,
  });
}

export function parseFourStringBassTabText(sourceText) {
  return parseDocument(sourceText, "bass", {
    allowNonTabText: false,
    requireBlockCount: 1,
  });
}

export function describePosition(document, positionIndex) {
  const position = document?.positions?.[positionIndex];

  if (!position) {
    return "No tablature position is available.";
  }

  const stringById = new Map(document.strings.map((string) => [string.id, string]));
  const playedDescriptions = [];
  const silentStrings = [];

  [...position.strings].reverse().forEach((state) => {
    const string = stringById.get(state.stringId);

    if (!string) {
      return;
    }

    switch (state.type) {
      case "fret":
        playedDescriptions.push(`${string.spokenName}, fret ${state.fret}.`);
        break;
      case "open":
        playedDescriptions.push(`${string.spokenName}, open.`);
        break;
      case "technique":
        playedDescriptions.push(
          `${string.spokenName}, ${state.name} notation preserved but not yet interpreted.`
        );
        break;
      case "unsupported":
        playedDescriptions.push(
          `${string.spokenName}, notation at this position cannot yet be interpreted.`
        );
        break;
      case "continuation":
        playedDescriptions.push(
          `${string.spokenName}, continuation of fret ${state.fret}.`
        );
        break;
      default:
        silentStrings.push(string.shortName);
    }
  });

  const parts =
    document.blocks.length > 1
      ? [
          `Block ${position.blockNumber} of ${document.blocks.length}.`,
          `Position ${position.positionInBlock} of ${position.positionsInBlock} in this block.`,
        ]
      : [`Position ${position.number} of ${position.total}.`];

  parts.push(...playedDescriptions);

  if (silentStrings.length > 0) {
    const subject = formatList(silentStrings);
    parts.push(
      `${subject} ${silentStrings.length === 1 ? "string is" : "strings are"} silent.`
    );
  }

  return parts.join(" ");
}

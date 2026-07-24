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

const STANDARD_TUNING = ["E", "B", "G", "D", "A", "E"];
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

function normalizePitch(rawPitch) {
  return `${rawPitch.charAt(0).toUpperCase()}${rawPitch.slice(1)}`;
}

function pitchForSpeech(pitch) {
  if (pitch.endsWith("#")) return `${pitch.charAt(0)} sharp`;
  if (pitch.endsWith("b")) return `${pitch.charAt(0)} flat`;
  return pitch;
}

function makeStringIdentity(index, tuning) {
  const isStandard = tuning === STANDARD_TUNING[index];
  if (isStandard && index === 0) return { shortName: "high E", spokenName: "High E string" };
  if (isStandard && index === 5) return { shortName: "low E", spokenName: "Low E string" };
  if (isStandard) return { shortName: tuning, spokenName: `${tuning} string` };
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
    if (char === "-" || char === " " || char === "\t" || char === "|") continue;
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

function parseStringLine(line, index, blockIndex) {
  const match = line.match(STRING_LINE_PATTERN);
  if (!match) {
    throw new TabParseError(
      `A tablature block contains an invalid string line. Each line must begin with a tuning label followed by a vertical bar, such as E|----0----|.`,
      "INVALID_STRING_LINE"
    );
  }
  const tuning = normalizePitch(match[1]);
  const content = match[2].replace(/\r$/, "");
  return {
    id: `block-${blockIndex + 1}-string-${index + 1}`,
    index,
    tuning,
    sourceLine: line,
    content,
    tokens: tokenizeContent(content),
    ...makeStringIdentity(index, tuning),
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
      return { type: "technique", token: startingToken, name: startingToken.name };
    }
    return { type: "unsupported", token: startingToken, raw: startingToken.raw };
  }
  const spanningFret = string.tokens.find(
    (token) =>
      token.type === "fret" && token.startColumn < column && token.endColumn > column
  );
  return spanningFret
    ? { type: "continuation", token: spanningFret, fret: spanningFret.value }
    : { type: "silent" };
}

function collectTabBlocks(lines) {
  const blocks = [];
  const ignoredLines = [];
  let current = [];

  const flush = () => {
    if (current.length === 0) return;
    if (current.length !== 6) {
      throw new TabParseError(
        `A tablature block contains ${current.length} string lines. Each block must contain exactly six consecutive string lines.`,
        "INCOMPLETE_STRING_BLOCK"
      );
    }
    blocks.push(current);
    current = [];
  };

  lines.forEach((line) => {
    if (STRING_LINE_PATTERN.test(line)) {
      current.push(line);
      if (current.length === 6) flush();
      return;
    }
    if (current.length > 0) flush();
    if (line.trim().length > 0) ignoredLines.push(line.trim());
  });
  flush();

  if (blocks.length === 0) {
    throw new TabParseError(
      "No complete six-string tablature block was found.",
      "NO_STRING_BLOCK"
    );
  }

  return { blocks, ignoredLines };
}

function buildBlock(strings, blockIndex) {
  const lineLengths = strings.map((string) => string.content.length);
  const maxLineLength = Math.max(...lineLengths);
  const boundaryColumns = new Set([0, maxLineLength]);
  strings.forEach((string) => {
    [...string.content].forEach((char, column) => {
      if (char === "|") boundaryColumns.add(column);
    });
  });

  const sortedBoundaries = [...boundaryColumns].sort((left, right) => left - right);
  const rawMeasures = [];
  for (let index = 0; index < sortedBoundaries.length - 1; index += 1) {
    const startColumn = sortedBoundaries[index];
    const endColumn = sortedBoundaries[index + 1];
    const eventColumns = new Set();
    strings.forEach((string) => {
      string.tokens.forEach((token) => {
        if (token.startColumn >= startColumn && token.startColumn < endColumn) {
          eventColumns.add(token.startColumn);
        }
      });
    });
    const columns = [...eventColumns].sort((left, right) => left - right);
    if (columns.length > 0) rawMeasures.push({ startColumn, endColumn, columns });
  }

  if (rawMeasures.length === 0) {
    throw new TabParseError(
      "No frets or recognizable tablature notation were found in the six string lines.",
      "NO_MUSICAL_POSITIONS"
    );
  }

  const positions = [];
  const measures = rawMeasures.map((measure, measureIndex) => {
    const measurePositions = measure.columns.map((sourceColumn, positionIndex) => {
      const position = {
        blockIndex,
        measureIndex,
        measureNumberInBlock: measureIndex + 1,
        positionInMeasure: positionIndex + 1,
        positionsInMeasure: measure.columns.length,
        sourceColumn,
        strings: strings.map((string) => ({
          stringId: string.id,
          ...stateAtColumn(string, sourceColumn),
        })),
      };
      positions.push(position);
      return position;
    });
    return {
      type: "tablature-measure",
      blockIndex,
      index: measureIndex,
      numberInBlock: measureIndex + 1,
      startColumn: measure.startColumn,
      endColumn: measure.endColumn,
      positions: measurePositions,
    };
  });

  return {
    type: "tablature-block",
    index: blockIndex,
    strings,
    positions,
    measures,
    maxLineLength,
    unequalLineLengths: lineLengths.some((length) => length !== maxLineLength),
  };
}

function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function parseSixStringTabText(sourceText) {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    throw new TabParseError("The file is empty.", "EMPTY_FILE");
  }

  const lines = sourceText.replace(/\r\n/g, "\n").split("\n");
  const { blocks: sourceBlocks, ignoredLines } = collectTabBlocks(lines);
  const blocks = sourceBlocks.map((blockLines, blockIndex) =>
    buildBlock(blockLines.map((line, stringIndex) => parseStringLine(line, stringIndex, blockIndex)), blockIndex)
  );

  const strings = blocks.flatMap((block) => block.strings);
  const measures = blocks.flatMap((block) => block.measures);
  const positions = blocks.flatMap((block) => block.positions);

  measures.forEach((measure, measureIndex) => {
    measure.index = measureIndex;
    measure.number = measureIndex + 1;
    measure.total = measures.length;
    measure.positions.forEach((position) => {
      position.measureIndex = measureIndex;
      position.measureNumber = measureIndex + 1;
      position.totalMeasures = measures.length;
    });
  });

  positions.forEach((position, positionIndex) => {
    position.index = positionIndex;
    position.number = positionIndex + 1;
    position.total = positions.length;
  });

  const warnings = [];
  if (ignoredLines.length > 0) {
    warnings.push(
      `${ignoredLines.length} non-tablature ${ignoredLines.length === 1 ? "line was" : "lines were"} ignored, such as headings or notes.`
    );
  }
  if (blocks.some((block) => block.unequalLineLengths)) {
    warnings.push(
      "One or more string blocks have unequal line lengths. Original columns were preserved, and missing trailing columns are treated as silent."
    );
  }
  const unsupportedCount = strings.reduce(
    (count, string) => count + string.tokens.filter((token) => token.type === "unsupported").length,
    0
  );
  if (unsupportedCount > 0) {
    warnings.push(
      `${unsupportedCount} notation ${unsupportedCount === 1 ? "symbol was" : "symbols were"} preserved but cannot yet be interpreted.`
    );
  }

  return {
    type: "tablature-document",
    sourceText,
    blocks,
    strings,
    measures,
    positions,
    warnings,
  };
}

export function describePosition(document, positionIndex) {
  const position = document?.positions?.[positionIndex];
  if (!position) return "No tablature position is available.";

  const stringById = new Map(document.strings.map((string) => [string.id, string]));
  const playedDescriptions = [];
  const silentStrings = [];

  [...position.strings].reverse().forEach((state) => {
    const string = stringById.get(state.stringId);
    if (!string) return;
    switch (state.type) {
      case "fret":
        playedDescriptions.push(`${string.spokenName}, fret ${state.fret}.`);
        break;
      case "open":
        playedDescriptions.push(`${string.spokenName}, open.`);
        break;
      case "technique":
        playedDescriptions.push(`${string.spokenName}, ${state.name} notation preserved but not yet interpreted.`);
        break;
      case "unsupported":
        playedDescriptions.push(`${string.spokenName}, notation at this position cannot yet be interpreted.`);
        break;
      case "continuation":
        playedDescriptions.push(`${string.spokenName}, continuation of fret ${state.fret}.`);
        break;
      default:
        silentStrings.push(string.shortName);
    }
  });

  const parts = [
    `Measure ${position.measureNumber} of ${position.totalMeasures}, position ${position.positionInMeasure} of ${position.positionsInMeasure}.`,
  ];
  parts.push(...playedDescriptions);
  if (silentStrings.length > 0) {
    const subject = formatList(silentStrings);
    parts.push(`${subject} ${silentStrings.length === 1 ? "string is" : "strings are"} silent.`);
  }
  return parts.join(" ");
}

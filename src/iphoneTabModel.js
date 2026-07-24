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

function makeStringIdentity(index, tuning) {
  const isStandard = tuning === STANDARD_TUNING[index];

  if (isStandard && index === 0) {
    return {
      shortName: "high E",
      spokenName: "High E string",
    };
  }

  if (isStandard && index === 5) {
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

function parseStringLine(line, index) {
  const match = line.match(/^\s*([A-Ga-g](?:#|b)?)\s*\|(.*)$/);

  if (!match) {
    throw new TabParseError(
      `Line ${index + 1} is not a supported tablature string. Each line must begin with a tuning label followed by a vertical bar, such as E|----0----|.`,
      "INVALID_STRING_LINE"
    );
  }

  const tuning = normalizePitch(match[1]);
  const content = match[2].replace(/\r$/, "");
  const identity = makeStringIdentity(index, tuning);

  return {
    id: `string-${index + 1}`,
    index,
    tuning,
    sourceLine: line,
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

function buildPositions(strings) {
  const eventColumns = new Set();

  strings.forEach((string) => {
    string.tokens.forEach((token) => eventColumns.add(token.startColumn));
  });

  return [...eventColumns]
    .sort((left, right) => left - right)
    .map((sourceColumn, index, columns) => ({
      index,
      number: index + 1,
      total: columns.length,
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

export function parseSixStringTabText(sourceText) {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    throw new TabParseError("The file is empty.", "EMPTY_FILE");
  }

  const nonEmptyLines = sourceText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length !== 6) {
    throw new TabParseError(
      `This iPhone proof accepts exactly one six-string tablature block. The file contains ${nonEmptyLines.length} nonempty lines.`,
      "WRONG_LINE_COUNT"
    );
  }

  const strings = nonEmptyLines.map(parseStringLine);
  const positions = buildPositions(strings);

  if (positions.length === 0) {
    throw new TabParseError(
      "No frets or recognizable tablature notation were found in the six string lines.",
      "NO_MUSICAL_POSITIONS"
    );
  }

  const lineLengths = strings.map((string) => string.content.length);
  const maxLineLength = Math.max(...lineLengths);
  const warnings = [];

  if (lineLengths.some((length) => length !== maxLineLength)) {
    warnings.push(
      "The string lines have unequal lengths. Their original columns were preserved, and missing trailing columns are treated as silent."
    );
  }

  const unsupportedCount = strings.reduce(
    (count, string) =>
      count + string.tokens.filter((token) => token.type === "unsupported").length,
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
    blocks: [
      {
        type: "tablature-block",
        index: 0,
        strings,
        positions,
        maxLineLength,
      },
    ],
    strings,
    positions,
    warnings,
  };
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

  const parts = [`Position ${position.number} of ${position.total}.`];
  parts.push(...playedDescriptions);

  if (silentStrings.length > 0) {
    const subject = formatList(silentStrings);
    parts.push(
      `${subject} ${silentStrings.length === 1 ? "string is" : "strings are"} silent.`
    );
  }

  return parts.join(" ");
}

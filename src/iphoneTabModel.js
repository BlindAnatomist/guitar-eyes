import {
  analyzeTabRunsForProfile,
  ASCII_INSTRUMENT_PROFILES,
  classifyTabStringLine,
} from "./tabStringLine";

const TECHNIQUE_DEFINITIONS = {
  h: { name: "hammer-on", attachment: "next" },
  H: { name: "hammer-on", attachment: "next" },
  p: { name: "pull-off", attachment: "next" },
  P: { name: "pull-off", attachment: "next" },
  "/": { name: "ascending slide", attachment: "next" },
  "\\": { name: "descending slide", attachment: "next" },
  s: { name: "slide", attachment: "next" },
  S: { name: "slide", attachment: "next" },
  t: { name: "tap", attachment: "next" },
  T: { name: "tap", attachment: "next" },
  b: { name: "bend", attachment: "previous" },
  B: { name: "bend", attachment: "previous" },
  r: { name: "bend release", attachment: "previous" },
  R: { name: "bend release", attachment: "previous" },
  "~": { name: "vibrato", attachment: "previous" },
  x: { name: "muted note", createsPosition: true },
  X: { name: "muted note", createsPosition: true },
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

function getInstrumentConfig(selectedInstrument) {
  const config = ASCII_INSTRUMENT_PROFILES[selectedInstrument];

  if (!config) {
    throw new TabParseError(
      `The instrument "${selectedInstrument}" is not supported.`,
      "UNSUPPORTED_INSTRUMENT"
    );
  }

  return config;
}

function pitchForSpeech(pitch, octave = null) {
  let spoken = pitch;
  if (pitch.endsWith("#")) spoken = `${pitch.charAt(0)} sharp`;
  if (pitch.endsWith("b")) spoken = `${pitch.charAt(0)} flat`;
  return octave === null ? spoken : `${spoken} ${octave}`;
}

function makeStringIdentity(index, tuning, octave, config) {
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
    spokenName: `String ${index + 1}, tuned ${pitchForSpeech(tuning, octave)}`,
  };
}

function isPlayableToken(token) {
  return token.type === "fret" || token.createsPosition === true;
}

function attachTechniqueTokens(tokens) {
  const playableTokens = tokens.filter(isPlayableToken);

  tokens
    .filter((token) => token.type === "technique" && !token.createsPosition)
    .forEach((technique) => {
      const target =
        technique.attachment === "next"
          ? playableTokens.find((token) => token.startColumn > technique.startColumn)
          : [...playableTokens]
              .reverse()
              .find((token) => token.endColumn <= technique.startColumn);

      if (!target) return;
      target.techniques = [
        ...(target.techniques || []),
        {
          name: technique.name,
          raw: technique.raw,
          attachment: technique.attachment,
          sourceColumn: technique.startColumn,
        },
      ];
      technique.attachedToColumn = target.startColumn;
    });

  return tokens;
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
        createsPosition: true,
        techniques: [],
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
        createsPosition: false,
      });
      continue;
    }

    const technique = TECHNIQUE_DEFINITIONS[char];
    if (technique) {
      tokens.push({
        type: "technique",
        raw: char,
        name: technique.name,
        attachment: technique.attachment || null,
        startColumn: column,
        endColumn: column + 1,
        createsPosition: technique.createsPosition === true,
      });
      continue;
    }

    tokens.push({
      type: "unsupported",
      raw: char,
      startColumn: column,
      endColumn: column + 1,
      createsPosition: false,
    });
  }

  return attachTechniqueTokens(tokens);
}

function parseStringLine(entry, index, blockIndex, config) {
  const classified =
    entry?.kind === "string-line"
      ? entry
      : classifyTabStringLine(
          typeof entry === "string" ? entry : entry?.line,
          typeof entry === "string" ? index + 1 : entry?.lineNumber
        );

  if (classified.kind !== "string-line") {
    const lineNumber = classified.lineNumber ?? index + 1;
    throw new TabParseError(
      `Line ${lineNumber} is not a supported tablature string. Each string line must begin with a tuning label followed by a vertical bar, such as E|----0----|.`,
      "INVALID_STRING_LINE"
    );
  }

  const identity = makeStringIdentity(
    index,
    classified.tuning,
    classified.octave,
    config
  );

  return {
    id: `block-${blockIndex + 1}-string-${index + 1}`,
    index,
    blockIndex,
    tuning: classified.tuning,
    octave: classified.octave,
    rawLabel: classified.rawLabel,
    sourceLine: classified.sourceLine,
    sourceLineNumber: classified.lineNumber,
    content: classified.content,
    tokens: tokenizeContent(classified.content),
    ...identity,
  };
}

function stateAtColumn(string, column) {
  const startingToken = string.tokens.find(
    (token) => token.startColumn === column && isPlayableToken(token)
  );

  if (startingToken) {
    if (startingToken.type === "fret") {
      const base =
        startingToken.value === 0
          ? { type: "open", token: startingToken }
          : { type: "fret", token: startingToken, fret: startingToken.value };
      return {
        ...base,
        techniques: startingToken.techniques || [],
      };
    }

    return {
      type: "technique",
      token: startingToken,
      name: startingToken.name,
      techniques: [],
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
      techniques: [],
    };
  }

  return { type: "silent", techniques: [] };
}

function buildBlockPositions(strings, blockIndex) {
  const eventColumns = new Set();

  strings.forEach((string) => {
    string.tokens
      .filter(isPlayableToken)
      .forEach((token) => eventColumns.add(token.startColumn));
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
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
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
      } preserved but cannot yet be interpreted. Unsupported symbols did not create musical positions.`
    );
  }

  const unattachedTechniqueCount = strings.reduce(
    (count, string) =>
      count +
      string.tokens.filter(
        (token) =>
          token.type === "technique" &&
          !token.createsPosition &&
          token.attachedToColumn === undefined
      ).length,
    0
  );

  if (unattachedTechniqueCount > 0) {
    warnings.push(
      `Block ${blockNumber} contains ${unattachedTechniqueCount} technique ${
        unattachedTechniqueCount === 1 ? "symbol that could" : "symbols that could"
      } not be attached to a note without guessing.`
    );
  }

  return { warnings, maxLineLength };
}

function parseDocument(sourceText, selectedInstrument, options = {}) {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    throw new TabParseError("The file is empty.", "EMPTY_FILE");
  }

  const config = getInstrumentConfig(selectedInstrument);
  const allowNonTabText = options.allowNonTabText !== false;
  const requireBlockCount = options.requireBlockCount ?? null;
  const analyzed = analyzeTabRunsForProfile(sourceText, config);

  if (!analyzed.valid) {
    throw new TabParseError(analyzed.message, analyzed.code);
  }

  if (!allowNonTabText && analyzed.nonTabLineNumbers.length > 0) {
    throw new TabParseError(
      `Line ${analyzed.nonTabLineNumbers[0]} is not part of the required clean ${config.label} tablature block.`,
      "NON_TAB_TEXT_NOT_ALLOWED"
    );
  }

  if (requireBlockCount !== null && analyzed.blocks.length !== requireBlockCount) {
    throw new TabParseError(
      `This parser accepts exactly ${requireBlockCount} ${config.label} tablature ${
        requireBlockCount === 1 ? "block" : "blocks"
      }. The file contains ${analyzed.blocks.length}.`,
      "WRONG_BLOCK_COUNT"
    );
  }

  const warnings = [...analyzed.warnings];

  if (analyzed.nonTabLineNumbers.length > 0) {
    warnings.push(
      `${analyzed.nonTabLineNumbers.length} non-tablature ${
        analyzed.nonTabLineNumbers.length === 1 ? "line was" : "lines were"
      } ignored while locating tablature blocks.`
    );
  }

  const blocks = analyzed.blocks.map((entries, blockIndex) => {
    const strings = entries.map((entry, stringIndex) =>
      parseStringLine(entry, stringIndex, blockIndex, config)
    );
    const positions = buildBlockPositions(strings, blockIndex);

    if (positions.length === 0) {
      throw new TabParseError(
        `Block ${blockIndex + 1} contains no frets, open strings, or explicit muted notes.`,
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

  const allPositions = blocks.flatMap((block) => block.positions);
  const positions = allPositions.map((position, index) => ({
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
    warnings: [...new Set(warnings)],
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

function techniquePhrase(techniques) {
  if (!techniques || techniques.length === 0) return "";
  const names = techniques.map((technique) => technique.name);
  return `, with ${formatList(names)} notation preserved but not yet interpreted`;
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
        playedDescriptions.push(
          `${string.spokenName}, fret ${state.fret}${techniquePhrase(state.techniques)}.`
        );
        break;
      case "open":
        playedDescriptions.push(
          `${string.spokenName}, open${techniquePhrase(state.techniques)}.`
        );
        break;
      case "technique":
        playedDescriptions.push(
          `${string.spokenName}, ${state.name} notation preserved but not yet interpreted.`
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

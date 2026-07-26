const DURATION_DEFINITIONS = {
  W: { symbol: "W", name: "whole note", quarterNoteUnits: 4 },
  H: { symbol: "H", name: "half note", quarterNoteUnits: 2 },
  Q: { symbol: "Q", name: "quarter note", quarterNoteUnits: 1 },
  E: { symbol: "E", name: "eighth note", quarterNoteUnits: 0.5 },
  S: { symbol: "S", name: "sixteenth note", quarterNoteUnits: 0.25 },
};

const RHYTHM_LINE_PATTERN = /^\s*(?:rhythm|rhythms|duration|durations)\s*:?(.*)$/i;

function normalizeLines(sourceText) {
  return String(sourceText).replace(/\r\n?/g, "\n").split("\n");
}

export function parseAsciiRhythmLine(line, lineNumber = null) {
  const match = String(line).match(RHYTHM_LINE_PATTERN);

  if (!match) {
    return null;
  }

  const content = match[1] ?? "";
  const symbols = [];
  const symbolPattern = /[WHQES]/gi;
  let symbolMatch;

  while ((symbolMatch = symbolPattern.exec(content)) !== null) {
    const definition = DURATION_DEFINITIONS[symbolMatch[0].toUpperCase()];
    symbols.push({
      ...definition,
      sourceColumn: symbolMatch.index,
    });
  }

  return {
    type: "ascii-rhythm-line",
    sourceLine: String(line),
    sourceLineNumber: lineNumber,
    content,
    symbols,
  };
}

function isDurationBearingPosition(position) {
  return position.strings.some(
    (state) =>
      state.type === "fret" ||
      state.type === "open" ||
      (state.type === "technique" && state.name === "muted note")
  );
}

function findRhythmLineForBlock(rhythmLines, block, previousBlockEndLine) {
  const firstStringLine = Math.min(
    ...block.strings.map((string) => string.sourceLineNumber)
  );

  const candidates = rhythmLines.filter(
    (line) =>
      line.sourceLineNumber > previousBlockEndLine &&
      line.sourceLineNumber < firstStringLine
  );

  return candidates.at(-1) ?? null;
}

function durationForSymbol(symbol, rhythmLine, alignment) {
  return {
    symbol: symbol.symbol,
    name: symbol.name,
    quarterNoteUnits: symbol.quarterNoteUnits,
    source: "ascii-rhythm-line",
    sourceLineNumber: rhythmLine.sourceLineNumber,
    alignment,
  };
}

function applyRhythmToBlock(block, rhythmLine) {
  if (!rhythmLine) {
    return {
      block,
      warning: null,
    };
  }

  const playablePositions = block.positions.filter(isDurationBearingPosition);
  const symbols = rhythmLine.symbols;

  if (symbols.length !== playablePositions.length || symbols.length === 0) {
    return {
      block: {
        ...block,
        rhythm: {
          ...rhythmLine,
          alignment: "unmapped",
          mappedCount: 0,
          playablePositionCount: playablePositions.length,
        },
      },
      warning: `Block ${block.number} rhythm line contains ${symbols.length} duration ${
        symbols.length === 1 ? "symbol" : "symbols"
      } for ${playablePositions.length} playable ${
        playablePositions.length === 1 ? "position" : "positions"
      }; durations were preserved but not assigned.`,
    };
  }

  const isColumnAligned = symbols.every(
    (symbol, index) => symbol.sourceColumn === playablePositions[index].sourceColumn
  );
  const alignment = isColumnAligned ? "column" : "sequential";
  const durationBySourceColumn = new Map(
    playablePositions.map((position, index) => [
      position.sourceColumn,
      durationForSymbol(symbols[index], rhythmLine, alignment),
    ])
  );

  const positions = block.positions.map((position) => {
    const duration = durationBySourceColumn.get(position.sourceColumn);
    return duration ? { ...position, duration } : { ...position };
  });

  return {
    block: {
      ...block,
      positions,
      rhythm: {
        ...rhythmLine,
        alignment,
        mappedCount: symbols.length,
        playablePositionCount: playablePositions.length,
      },
    },
    warning: null,
  };
}

export function applyAsciiRhythmToDocument(sourceText, document) {
  if (!document || !Array.isArray(document.blocks)) {
    return document;
  }

  const rhythmLines = normalizeLines(sourceText)
    .map((line, index) => parseAsciiRhythmLine(line, index + 1))
    .filter(Boolean);
  const warnings = [...(document.warnings ?? [])];
  let previousBlockEndLine = 0;

  const blocks = document.blocks.map((block) => {
    const rhythmLine = findRhythmLineForBlock(
      rhythmLines,
      block,
      previousBlockEndLine
    );
    const result = applyRhythmToBlock(block, rhythmLine);

    previousBlockEndLine = Math.max(
      ...block.strings.map((string) => string.sourceLineNumber)
    );

    if (result.warning) {
      warnings.push(result.warning);
    }

    return result.block;
  });

  const positions = blocks
    .flatMap((block) => block.positions)
    .map((position, index, allPositions) => ({
      ...position,
      index,
      number: index + 1,
      total: allPositions.length,
    }));

  return {
    ...document,
    blocks,
    positions,
    rhythmLines: blocks
      .filter((block) => block.rhythm)
      .map((block) => ({ blockNumber: block.number, ...block.rhythm })),
    warnings,
  };
}

export { DURATION_DEFINITIONS };

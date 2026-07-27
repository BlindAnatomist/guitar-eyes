function isDurationBearingPosition(position) {
  return position.strings.some(
    (state) =>
      state.type === "fret" ||
      state.type === "open" ||
      (state.type === "technique" && state.name === "muted note")
  );
}

function collectSharedBarlineColumns(strings) {
  if (!Array.isArray(strings) || strings.length === 0) {
    return [];
  }

  const maxLength = Math.max(...strings.map((string) => string.content.length));
  const columns = [];

  for (let column = 0; column < maxLength; column += 1) {
    if (strings.every((string) => string.content[column] === "|")) {
      columns.push(column);
    }
  }

  return columns;
}

function removeSharedBarlineTokens(strings, sharedBarlineColumns) {
  const shared = new Set(sharedBarlineColumns);

  return strings.map((string) => ({
    ...string,
    tokens: string.tokens.filter(
      (token) =>
        !(
          shared.has(token.startColumn) &&
          (token.type === "barline" ||
            (token.type === "unsupported" && token.raw === "|"))
        )
    ),
  }));
}

function correctedUnsupportedWarning(strings, blockNumber) {
  const count = strings.reduce(
    (total, string) =>
      total + string.tokens.filter((token) => token.type === "unsupported").length,
    0
  );

  if (count === 0) {
    return null;
  }

  return `Block ${blockNumber} contains ${count} notation ${
    count === 1 ? "symbol that was" : "symbols that were"
  } preserved but cannot yet be interpreted. Unsupported symbols did not create musical positions.`;
}

function buildMeasures(block, positions, sharedBarlineColumns) {
  if (sharedBarlineColumns.length === 0 || positions.length === 0) {
    return {
      positions,
      measures: [],
      boundaryColumns: [],
      terminalBarlineColumn: null,
    };
  }

  const minimumPositionColumn = Math.min(...positions.map((position) => position.sourceColumn));
  const maximumPositionColumn = Math.max(...positions.map((position) => position.sourceColumn));
  const boundaryColumns = sharedBarlineColumns.filter(
    (column) => column > minimumPositionColumn && column < maximumPositionColumn
  );
  const terminalBarlineColumn =
    [...sharedBarlineColumns].reverse().find((column) => column > maximumPositionColumn) ??
    null;
  const measureCount = boundaryColumns.length + 1;
  const grouped = Array.from({ length: measureCount }, () => []);

  positions.forEach((position) => {
    const measureIndex = boundaryColumns.filter(
      (column) => column < position.sourceColumn
    ).length;
    grouped[measureIndex].push(position);
  });

  const measures = grouped.map((measurePositions, measureIndex) => {
    const number = measureIndex + 1;
    const durationBearingPositions = measurePositions.filter(isDurationBearingPosition);
    const durationComplete =
      durationBearingPositions.length > 0 &&
      durationBearingPositions.every(
        (position) => typeof position.duration?.quarterNoteUnits === "number"
      );
    const totalQuarterNoteUnits = durationComplete
      ? durationBearingPositions.reduce(
          (total, position) => total + position.duration.quarterNoteUnits,
          0
        )
      : null;
    const positionsWithMeasure = measurePositions.map((position, positionIndex) => ({
      ...position,
      measureNumber: number,
      measureCountInBlock: measureCount,
      positionInMeasure: positionIndex + 1,
      positionsInMeasure: measurePositions.length,
    }));

    return {
      id: `block-${block.number}-measure-${number}`,
      type: "measure",
      blockIndex: block.index,
      blockNumber: block.number,
      number,
      totalInBlock: measureCount,
      startSourceColumn: positionsWithMeasure[0]?.sourceColumn ?? null,
      endSourceColumn:
        positionsWithMeasure[positionsWithMeasure.length - 1]?.sourceColumn ?? null,
      barlineAfterColumn:
        boundaryColumns[measureIndex] ?? terminalBarlineColumn ?? null,
      positions: positionsWithMeasure,
      durationComplete,
      totalQuarterNoteUnits,
    };
  });

  return {
    positions: measures.flatMap((measure) => measure.positions),
    measures,
    boundaryColumns,
    terminalBarlineColumn,
  };
}

export function applyExplicitMeasuresToDocument(document) {
  if (!document || !Array.isArray(document.blocks)) {
    return document;
  }

  const warnings = (document.warnings ?? []).filter(
    (warning) => !/^Block \d+ contains \d+ notation symbols? that/.test(warning)
  );

  const blocks = document.blocks.map((block) => {
    const sharedBarlineColumns = collectSharedBarlineColumns(block.strings);
    const shared = new Set(sharedBarlineColumns);
    const strings = removeSharedBarlineTokens(block.strings, sharedBarlineColumns);
    const positionsWithoutBarlines = block.positions.filter(
      (position) => !shared.has(position.sourceColumn)
    );
    const measureResult = buildMeasures(
      block,
      positionsWithoutBarlines,
      sharedBarlineColumns
    );
    const unsupportedWarning = correctedUnsupportedWarning(strings, block.number);

    if (unsupportedWarning) {
      warnings.push(unsupportedWarning);
    }

    const rawBarlineCount = block.strings.reduce(
      (count, string) => count + [...string.content].filter((char) => char === "|").length,
      0
    );

    if (rawBarlineCount > 0 && sharedBarlineColumns.length === 0) {
      warnings.push(
        `Block ${block.number} contains barline characters that do not align across every string; measures were not assigned.`
      );
    }

    return {
      ...block,
      strings,
      positions: measureResult.positions,
      measures: measureResult.measures,
      sharedBarlineColumns,
      measureBoundaryColumns: measureResult.boundaryColumns,
      terminalBarlineColumn: measureResult.terminalBarlineColumn,
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
  const measures = blocks.flatMap((block) => block.measures);
  const measuresWithDocumentNumbers = measures.map((measure, index) => ({
    ...measure,
    documentNumber: index + 1,
    documentTotal: measures.length,
  }));

  return {
    ...document,
    blocks,
    strings: blocks.flatMap((block) => block.strings),
    positions,
    measures: measuresWithDocumentNumbers,
    warnings,
  };
}

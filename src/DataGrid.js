import React, { useEffect, useMemo, useRef, useState } from "react";
import { Table, Tbody, Tr, Td } from "@chakra-ui/react";

function combineAdjacentDigits(line) {
  const characters = Array.isArray(line) ? line : [...String(line ?? "")];
  const combined = [];

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];

    if (!/[0-9]/.test(character)) {
      combined.push(character);
      continue;
    }

    let digits = character;
    while (index + 1 < characters.length && /[0-9]/.test(characters[index + 1])) {
      index += 1;
      digits += characters[index];
    }
    combined.push(digits);
  }

  return combined;
}

function buildGridData(data, selectedInstrument, isMultiColumnNav, numColumns, groupIndex) {
  const numRows = selectedInstrument === "bass" ? 4 : 6;
  const rows = data.slice(0, numRows).map((line) => combineAdjacentDigits(line));

  if (!isMultiColumnNav || rows.length === 0) {
    return rows;
  }

  const width = Math.max(1, Number(numColumns) || 1);
  const start = groupIndex * width;
  const end = start + width;
  return rows.map((row) => row.slice(start, end));
}

function DataGrid({ data, numColumns, isMultiColumnNav, setNumColumns, selectedInstrument }) {
  const tableRef = useRef(null);
  const cells = useRef([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  const fullWidth = useMemo(() => {
    const rows = data.slice(0, selectedInstrument === "bass" ? 4 : 6);
    return Math.max(1, ...rows.map((line) => combineAdjacentDigits(line).length));
  }, [data, selectedInstrument]);

  const width = Math.max(1, Math.min(Number(numColumns) || 1, fullWidth));
  const groupCount = Math.max(1, Math.ceil(fullWidth / width));
  const gridData = buildGridData(
    data,
    selectedInstrument,
    isMultiColumnNav,
    width,
    currentGroupIndex
  );
  const renderedColumnCount = Math.max(1, ...gridData.map((row) => row.length));

  useEffect(() => {
    cells.current = Array.from(tableRef.current?.querySelectorAll("td") ?? []);
  }, [gridData]);

  useEffect(() => {
    setCurrentGroupIndex((current) => Math.min(current, groupCount - 1));
  }, [groupCount]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const focusCell = (row, column) => {
    const target = cells.current[row * renderedColumnCount + column];
    target?.focus();
  };

  const moveWithinGrid = (event, rowDelta, columnDelta) => {
    if (cells.current.length === 0 || gridData.length === 0) {
      return;
    }

    event.preventDefault();
    const currentIndex = Math.max(0, cells.current.indexOf(document.activeElement));
    const currentRow = Math.floor(currentIndex / renderedColumnCount);
    const currentColumn = currentIndex % renderedColumnCount;
    const nextRow = (currentRow + rowDelta + gridData.length) % gridData.length;
    const nextColumn =
      (currentColumn + columnDelta + renderedColumnCount) % renderedColumnCount;
    focusCell(nextRow, nextColumn);
  };

  const readCurrentGroup = () => {
    if (!window.speechSynthesis || gridData.length === 0) {
      return;
    }

    const contents = [];
    for (let column = 0; column < renderedColumnCount; column += 1) {
      contents.push(`Column ${column + 1}`);
      for (let row = 0; row < gridData.length; row += 1) {
        contents.push(String(gridData[row][column] ?? "blank"));
      }
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(contents.join(". ")));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      window.speechSynthesis?.cancel();
      return;
    }

    if (event.ctrlKey && event.metaKey && event.shiftKey) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        setCurrentGroupIndex(
          (current) => (current + direction + groupCount) % groupCount
        );
        return;
      }

      if (event.key === "=" || event.key === "+") {
        event.preventDefault();
        setNumColumns(Math.min(fullWidth, width + 1));
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        setNumColumns(Math.max(1, width - 1));
        return;
      }
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        moveWithinGrid(event, -1, 0);
        break;
      case "ArrowDown":
        moveWithinGrid(event, 1, 0);
        break;
      case "ArrowLeft":
        moveWithinGrid(event, 0, -1);
        break;
      case "ArrowRight":
        moveWithinGrid(event, 0, 1);
        break;
      case "Enter":
        if (isMultiColumnNav) {
          event.preventDefault();
          readCurrentGroup();
        }
        break;
      default:
        break;
    }
  };

  return (
    <Table
      variant="striped"
      colorScheme="teal"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={tableRef}
      role="grid"
      aria-label="Legacy tablature grid"
    >
      <Tbody>
        {gridData.map((gridRow, rowIndex) => (
          <Tr key={rowIndex} role="row">
            {Array.from({ length: renderedColumnCount }, (_, columnIndex) => (
              <Td
                key={columnIndex}
                tabIndex={-1}
                role="gridcell"
                aria-label={String(gridRow[columnIndex] ?? "blank")}
              >
                <span>{gridRow[columnIndex] ?? ""}</span>
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default DataGrid;

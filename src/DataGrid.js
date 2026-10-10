import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { Table, Tbody, Tr, Td } from "@chakra-ui/react";
import {
  createTablatureModel, createColumnGroups, tokensInGroup, tokenAtColumn,
  moveGridPosition, clampGroupWidth, describeToken, groupSpeech,
} from "./tablatureModel.js";
import { createSpeechPlayer } from "./speechPlayer.js";

function DataGrid({ data, numColumns, isMultiColumnNav, setNumColumns, maxGroupWidth, gridLabel = "Tablature" }) {
  const tableRef = useRef(null);
  const positionRef = useRef({ row: 0, column: 0 });
  const pendingFocus = useRef(false);
  const focusedWithin = useRef(false);
  const [speechStatus, setSpeechStatus] = useState("");
  const model = useMemo(() => createTablatureModel(data), [data]);
  const groups = useMemo(() => isMultiColumnNav
    ? createColumnGroups(model, numColumns)
    : [{ start: 0, end: model.width }], [model, numColumns, isMultiColumnNav]);
  const [groupSelection, setGroupSelection] = useState({ groups, index: 0 });
  const previousGroups = useRef(groups);
  // A new width, model, or navigation mode renders its first group immediately.
  // Never apply an old group index to the new groups, even for one commit.
  const groupIndex = groupSelection.groups === groups
    ? Math.min(groupSelection.index, groups.length - 1) : 0;
  const group = groups[groupIndex];
  const gridRows = tokensInGroup(model, group);
  const player = useMemo(() => createSpeechPlayer(
    window.speechSynthesis, window.SpeechSynthesisUtterance, setSpeechStatus
  ), []);

  const focusPosition = useCallback((position) => {
    const token = tokenAtColumn(model, position.row, position.column);
    const cell = token && tableRef.current?.querySelector(
      `[data-row="${position.row}"][data-column="${token.start}"]`
    );
    if (!cell) return false;
    cell.focus();
    if (document.activeElement !== cell) return false;
    // Preserve a vertical source-column anchor even inside a two-digit fret.
    positionRef.current = position;
    return true;
  }, [model]);

  useLayoutEffect(() => {
    player.stop();
    setSpeechStatus("");
    const position = previousGroups.current === groups
      ? positionRef.current : { row: 0, column: 0 };
    previousGroups.current = groups;
    positionRef.current = {
      row: Math.min(position.row, model.rows.length - 1),
      column: Math.max(group.start, Math.min(position.column, group.end - 1)),
    };
    if (pendingFocus.current || focusedWithin.current) {
      // Keep the request until the intended visible cell has actually focused.
      pendingFocus.current = !focusPosition(positionRef.current);
    }
  }, [model, groups, group, player, focusPosition]);

  useEffect(() => {
    const stopOnEscape = (event) => {
      if (event.key === "Escape") {
        player.stop();
        setSpeechStatus("");
      }
    };
    document.addEventListener("keydown", stopOnEscape);
    return () => {
      document.removeEventListener("keydown", stopOnEscape);
      player.stop();
    };
  }, [player]);

  const handleKeyDown = (event) => {
    const direction = ({ ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" })[event.key];
    if (direction && event.ctrlKey && event.altKey) {
      event.preventDefault();
      if (event.target === tableRef.current) {
        focusPosition({ row: 0, column: group.start });
      } else {
        focusPosition(moveGridPosition(model, group, positionRef.current, direction));
      }
    } else if (isMultiColumnNav && event.ctrlKey && event.metaKey && event.shiftKey) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const offset = event.key === "ArrowLeft" ? -1 : 1;
        const nextIndex = (groupIndex + offset + groups.length) % groups.length;
        positionRef.current = { row: positionRef.current.row, column: groups[nextIndex].start };
        if (nextIndex === groupIndex) focusPosition(positionRef.current);
        else {
          pendingFocus.current = true;
          setGroupSelection({ groups, index: nextIndex });
        }
      } else if (event.key === "=" || event.key === "+" || event.key === "-" || event.key === "_") {
        event.preventDefault();
        const offset = event.key === "-" || event.key === "_" ? -1 : 1;
        const updatedWidth = clampGroupWidth(Number(numColumns) + offset, maxGroupWidth || model.width);
        if (updatedWidth !== numColumns) {
          pendingFocus.current = true;
          setNumColumns(updatedWidth);
        }
      }
    } else if (isMultiColumnNav && event.key === "Enter") {
      event.preventDefault();
      player.read(groupSpeech(model, group));
    }
    // Native Tab/Shift+Tab move between grids and back to the controls. Cells
    // are programmatically focusable, without trapping Tab inside a grid.
  };

  return (
    <>
      <Table variant="striped" colorScheme="teal" onKeyDown={handleKeyDown}
        tabIndex={0} ref={tableRef} role="grid" aria-label={gridLabel}
        onFocusCapture={() => { focusedWithin.current = true; }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            focusedWithin.current = false;
            pendingFocus.current = false;
            player.stop();
            setSpeechStatus("");
          }
        }}
        aria-rowcount={model.rows.length} aria-colcount={model.width}>
        <Tbody>
          {gridRows.map((row, rowIndex) => (
            <Tr key={rowIndex} role="row" aria-rowindex={rowIndex + 1}>
              {row.map(token => (
                <Td key={token.start} tabIndex={-1} role="gridcell"
                  colSpan={token.end - token.start} aria-colspan={token.end - token.start}
                  aria-colindex={token.start + 1} data-row={rowIndex} data-column={token.start}
                  aria-label={`String ${rowIndex + 1}, column ${token.start + 1}, ${describeToken(token)}`}
                  onFocus={() => { positionRef.current = { row: rowIndex, column: token.start }; }}>
                  <span>{token.text}</span>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      <p role="status" aria-live="polite">{speechStatus}</p>
    </>
  );
}

export default DataGrid;

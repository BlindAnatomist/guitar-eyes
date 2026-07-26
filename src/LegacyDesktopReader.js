import React, { forwardRef, useEffect, useRef, useState } from "react";
import ColumnDropdown from "./ColumnDropdown";
import DataGrid from "./DataGrid";

const LegacyDesktopReader = forwardRef(function LegacyDesktopReader(
  { tablature, selectedInstrument },
  headingRef
) {
  const [numColumns, setNumColumns] = useState(1);
  const [isMultiColumnNav, setIsMultiColumnNav] = useState(false);
  const gridRefs = useRef([]);

  useEffect(() => {
    gridRefs.current = gridRefs.current.slice(0, tablature.length);
  }, [tablature]);

  const handleKeyDown = (event, gridIndex) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    const nextIndex = event.shiftKey
      ? (gridIndex - 1 + gridRefs.current.length) % gridRefs.current.length
      : (gridIndex + 1) % gridRefs.current.length;
    gridRefs.current[nextIndex]?.focus();
  };

  const numOptions = tablature.length > 0 && tablature[0]?.[0]?.length
    ? tablature[0][0].length
    : 1;

  return (
    <section className="legacy-desktop-reader" aria-labelledby="legacy-desktop-reader-heading">
      <h2 id="legacy-desktop-reader-heading" ref={headingRef} tabIndex="-1">
        Desktop compatibility grid
      </h2>
      <p>
        This file could not be represented safely by the shared semantic document. The
        original Guitar Eyes grid remains available as a compatibility fallback.
      </p>

      <div>
        <input
          id="multi-column"
          type="checkbox"
          checked={isMultiColumnNav}
          onChange={() => setIsMultiColumnNav((current) => !current)}
        />
        <label htmlFor="multi-column">Multi-Column Navigation</label>
      </div>

      <ColumnDropdown
        value={numColumns}
        numOptions={numOptions}
        onChange={setNumColumns}
      />

      {tablature.map((subarray, index) => (
        <div
          key={index}
          ref={(element) => {
            gridRefs.current[index] = element;
          }}
          tabIndex={index === 0 ? 0 : -1}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <h3>Tablature {index + 1}</h3>
          <DataGrid
            data={subarray}
            numColumns={numColumns}
            isMultiColumnNav={isMultiColumnNav}
            setNumColumns={setNumColumns}
            selectedInstrument={selectedInstrument}
          />
        </div>
      ))}
    </section>
  );
});

export default LegacyDesktopReader;

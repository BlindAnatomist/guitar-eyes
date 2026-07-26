import React, { forwardRef, useState } from "react";
import ColumnDropdown from "./ColumnDropdown";
import DataGrid from "./DataGrid";

const LegacyDesktopReader = forwardRef(function LegacyDesktopReader(
  { tablature, selectedInstrument },
  headingRef
) {
  const [numColumns, setNumColumns] = useState(1);
  const [isMultiColumnNav, setIsMultiColumnNav] = useState(false);
  const hasTablature = tablature.length > 0;
  const numOptions = hasTablature && tablature[0]?.[0]?.length
    ? tablature[0][0].length
    : 1;

  return (
    <section className="legacy-desktop-reader" aria-labelledby="legacy-desktop-reader-heading">
      <h2 id="legacy-desktop-reader-heading" ref={headingRef} tabIndex="-1">
        Desktop grid reader
      </h2>
      <p>
        {hasTablature
          ? "This file could not be represented safely by the shared semantic document. The original Guitar Eyes grid remains available as a compatibility fallback."
          : "Upload a tablature file to open the shared semantic desktop reader. Files that cannot yet be interpreted safely remain available through the original compatibility grid."}
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
        <section key={index} aria-labelledby={`legacy-tablature-${index + 1}-heading`}>
          <h3 id={`legacy-tablature-${index + 1}-heading`}>Tablature {index + 1}</h3>
          <DataGrid
            data={subarray}
            numColumns={numColumns}
            isMultiColumnNav={isMultiColumnNav}
            setNumColumns={setNumColumns}
            selectedInstrument={selectedInstrument}
          />
        </section>
      ))}
    </section>
  );
});

export default LegacyDesktopReader;

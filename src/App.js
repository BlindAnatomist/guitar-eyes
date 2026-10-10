import React, { useState, useRef, useEffect } from "react";
import Upload from "./Upload";
import { parseFile } from "./parseFile";
import DataGrid from "./DataGrid";
import ColumnDropdown from "./ColumnDropdown";
import InfoSection from "./InfoSection";
import InstrumentDropdown from "./InstrumentDropdown";

function App() {
  const [tablature, setTablature] = useState([]);
  const [numColumns, setNumColumns] = useState(1);
  const [isMultiColumnNav, setIsMultiColumnNav] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState("guitar");
  const [uploadError, setUploadError] = useState("");
  const gridContainerRef = useRef(null);
  const uploadRequest = useRef(0);

  useEffect(() => {
    gridContainerRef.current?.querySelector('[role="grid"]')?.focus();
  }, [tablature]);

  const handleFileUpload = async (file) => {
    const request = ++uploadRequest.current;
    const numStrings = selectedInstrument === "guitar" ? 6 : 4;
    setUploadError("");
    setTablature([]);
    try {
      const tablatureArray = await parseFile(file, numStrings);
      if (request !== uploadRequest.current) return;
      setNumColumns(1);
      setTablature(tablatureArray);
    } catch (error) {
      if (request === uploadRequest.current) setUploadError(error.message);
    }
  };

  const handleInstrumentChange = (instrument) => {
    uploadRequest.current++;
    setSelectedInstrument(instrument);
    setTablature([]);
    setNumColumns(1);
    setUploadError("");
  };

  const maxGroupWidth = Math.max(1, ...tablature.map(block => block[0].length));

  return (
    <div>
      <h1><strong>Guitar Eyes for Mac - The Guitar Tablature reader for the Visually Impaired Guitarist</strong></h1>
      <section>
        <button onClick={() => setIsInfoOpen(!isInfoOpen)} aria-label={isInfoOpen ? "Close info section" : "Open info section"}>
          {isInfoOpen ? "Close info section" : "Open info section"}
        </button>
        {isInfoOpen && <InfoSection />}
      </section>
      <Upload key={selectedInstrument} onFileUpload={handleFileUpload} />
      {uploadError && <p role="alert">Unable to load tablature: {uploadError}</p>}
      <InstrumentDropdown selectedInstrument={selectedInstrument} onSelectInstrument={handleInstrumentChange} />
      <p>Choose your instrument before uploading. Changing instruments clears the current tablature.</p>
      <div>
        <input id="multi-column" type="checkbox" checked={isMultiColumnNav} onChange={() => setIsMultiColumnNav(!isMultiColumnNav)} />
        <label htmlFor="multi-column">Multi-Column Navigation</label>
      </div>
      <ColumnDropdown
        value={numColumns}
        numOptions={maxGroupWidth}
        onChange={setNumColumns}
      />
      <div ref={gridContainerRef}>
        {tablature.map((subarray, index) => (
          <div key={index}>
            <h2>Tablature {index + 1}</h2>
            <DataGrid data={subarray} numColumns={numColumns} isMultiColumnNav={isMultiColumnNav}
              setNumColumns={setNumColumns} maxGroupWidth={maxGroupWidth} gridLabel={`Tablature ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

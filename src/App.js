import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import Upload from "./Upload";
import { parseFile } from "./parseFile";
import DataGrid from "./DataGrid";
import ColumnDropdown from "./ColumnDropdown";
import InfoSection from "./InfoSection";
import InstrumentDropdown from "./InstrumentDropdown";
import IPhoneTabReader from "./IPhoneTabReader";
import {
  parseSixStringTabText,
  readTextFile,
  TabParseError,
} from "./iphoneTabModel";
import "./App.css";

function getInitialReadingMode() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop";
  }

  return window.matchMedia("(pointer: coarse)").matches ? "iphone" : "desktop";
}

function messageFromError(error, fallback) {
  if (error instanceof TabParseError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function App() {
  const [tablature, setTablature] = useState([]);
  const [iphoneDocument, setIphoneDocument] = useState(null);
  const [numColumns, setNumColumns] = useState(1);
  const [isMultiColumnNav, setIsMultiColumnNav] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(
    () => getInitialReadingMode() === "desktop"
  );
  const [selectedInstrument, setSelectedInstrument] = useState("guitar");
  const [readingMode, setReadingMode] = useState(getInitialReadingMode);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [iphoneError, setIphoneError] = useState("");
  const [desktopError, setDesktopError] = useState("");
  const [iphoneFocusRequest, setIphoneFocusRequest] = useState(0);
  const gridRefs = useRef([]);
  const iphoneHeadingRef = useRef(null);
  const errorHeadingRef = useRef(null);
  const desktopFocusPendingRef = useRef(false);
  const iphoneFocusPendingRef = useRef(false);
  const iphoneFocusFrameRef = useRef(null);

  const focusIphoneReaderWhenBrowserReturns = useCallback(() => {
    if (
      !iphoneFocusPendingRef.current ||
      readingMode !== "iphone" ||
      document.visibilityState === "hidden"
    ) {
      return;
    }

    if (iphoneFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(iphoneFocusFrameRef.current);
    }

    iphoneFocusFrameRef.current = window.requestAnimationFrame(() => {
      iphoneFocusFrameRef.current = window.requestAnimationFrame(() => {
        const heading = iphoneHeadingRef.current;
        if (!heading) return;

        heading.focus({ preventScroll: true });
        if (document.activeElement === heading) {
          iphoneFocusPendingRef.current = false;
        }
      });
    });
  }, [readingMode]);

  useEffect(() => {
    if (
      readingMode === "desktop" &&
      desktopFocusPendingRef.current &&
      gridRefs.current.length > 0
    ) {
      gridRefs.current[0]?.focus();
      desktopFocusPendingRef.current = false;
    }
  }, [tablature, readingMode]);

  useLayoutEffect(() => {
    if (iphoneFocusRequest === 0 || readingMode !== "iphone") return;
    iphoneFocusPendingRef.current = true;
    focusIphoneReaderWhenBrowserReturns();
  }, [focusIphoneReaderWhenBrowserReturns, iphoneFocusRequest, readingMode]);

  useEffect(() => {
    const recoverPendingIphoneFocus = () => {
      if (document.visibilityState === "visible") {
        focusIphoneReaderWhenBrowserReturns();
      }
    };

    window.addEventListener("focus", recoverPendingIphoneFocus);
    window.addEventListener("pageshow", recoverPendingIphoneFocus);
    document.addEventListener("visibilitychange", recoverPendingIphoneFocus);

    return () => {
      window.removeEventListener("focus", recoverPendingIphoneFocus);
      window.removeEventListener("pageshow", recoverPendingIphoneFocus);
      document.removeEventListener("visibilitychange", recoverPendingIphoneFocus);
      if (iphoneFocusFrameRef.current !== null) {
        window.cancelAnimationFrame(iphoneFocusFrameRef.current);
      }
    };
  }, [focusIphoneReaderWhenBrowserReturns]);

  const focusSoon = (ref) => {
    window.setTimeout(() => ref.current?.focus(), 0);
  };

  const handleFileUpload = async (file) => {
    setIsReadingFile(true);
    setStatusMessage("Reading the selected tablature file.");
    setIphoneError("");
    setDesktopError("");
    setIphoneDocument(null);

    if (!file?.name?.toLowerCase().endsWith(".txt")) {
      const message = "Choose a plain-text file whose name ends in .txt.";
      setIphoneError(message);
      setDesktopError(message);
      setStatusMessage("The selected file was not accepted.");
      setIsReadingFile(false);
      focusSoon(errorHeadingRef);
      return;
    }

    const numStrings = selectedInstrument === "guitar" ? 6 : 4;
    let desktopResult = null;
    let mobileResult = null;

    try {
      desktopResult = await parseFile(file, numStrings);
      setTablature(desktopResult);
    } catch (error) {
      setTablature([]);
      setDesktopError(
        messageFromError(error, "The file could not be opened in desktop grid mode.")
      );
    }

    if (selectedInstrument !== "guitar") {
      setIphoneError(
        "The iPhone proof currently supports one six-string guitar block. Jason's existing four-string bass reader remains available in Desktop grid mode."
      );
    } else {
      try {
        const sourceText = await readTextFile(file);
        mobileResult = parseSixStringTabText(sourceText);
      } catch (error) {
        setIphoneError(
          messageFromError(error, "The file could not be parsed for iPhone reading mode.")
        );
      }
    }

    if (readingMode === "iphone" && mobileResult) {
      iphoneFocusPendingRef.current = true;
      flushSync(() => {
        setIphoneDocument(mobileResult);
        setIsReadingFile(false);
        setStatusMessage(
          `Loaded ${mobileResult.positions.length} synchronized positions in iPhone reading mode.`
        );
        setIphoneFocusRequest((current) => current + 1);
      });
      return;
    }

    setIphoneDocument(mobileResult);
    setIsReadingFile(false);

    if (readingMode === "iphone") {
      setStatusMessage("The file could not be loaded in iPhone reading mode.");
      focusSoon(errorHeadingRef);
      return;
    }

    if (desktopResult?.length > 0) {
      setStatusMessage(
        `Loaded ${desktopResult.length} tablature ${
          desktopResult.length === 1 ? "block" : "blocks"
        } in desktop grid mode.`
      );
      desktopFocusPendingRef.current = true;
      window.setTimeout(() => gridRefs.current[0]?.focus(), 0);
    } else {
      setStatusMessage("The file could not be loaded in desktop grid mode.");
      focusSoon(errorHeadingRef);
    }
  };

  const handleReadingModeChange = (event) => {
    const nextMode = event.target.value;
    setReadingMode(nextMode);

    if (nextMode === "iphone") {
      if (iphoneDocument) {
        iphoneFocusPendingRef.current = true;
        setIphoneFocusRequest((current) => current + 1);
      } else if (iphoneError) focusSoon(errorHeadingRef);
      return;
    }

    iphoneFocusPendingRef.current = false;
    if (tablature.length > 0) {
      window.setTimeout(() => gridRefs.current[0]?.focus(), 0);
    } else if (desktopError) {
      focusSoon(errorHeadingRef);
    }
  };

  const handleDropdownChange = (value) => setNumColumns(value);
  const handleCheckboxChange = () => setIsMultiColumnNav(!isMultiColumnNav);
  const toggleInfoSection = () => setIsInfoOpen(!isInfoOpen);
  const handleInstrumentChange = (instrument) => setSelectedInstrument(instrument);

  const handleKeyDown = (event, gridIndex) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const nextIndex = event.shiftKey
        ? (gridIndex - 1 + gridRefs.current.length) % gridRefs.current.length
        : (gridIndex + 1) % gridRefs.current.length;
      gridRefs.current[nextIndex]?.focus();
    }
  };

  const currentError = readingMode === "iphone" ? iphoneError : desktopError;

  return (
    <main className="app-shell">
      <h1>
        Guitar Eyes for Mac - The Guitar Tablature reader for the Visually Impaired
        Guitarist
      </h1>
      <p className="extension-note">
        This branch preserves Jason Washburn's desktop reader and adds a bounded iPhone
        Safari and VoiceOver proof.
      </p>

      <fieldset className="mode-selector">
        <legend>Reading mode</legend>
        <label>
          <input type="radio" name="reading-mode" value="iphone" checked={readingMode === "iphone"} onChange={handleReadingModeChange} />
          iPhone semantic reader
        </label>
        <label>
          <input type="radio" name="reading-mode" value="desktop" checked={readingMode === "desktop"} onChange={handleReadingModeChange} />
          Desktop grid reader
        </label>
      </fieldset>

      <Upload onFileUpload={handleFileUpload} disabled={isReadingFile} />
      <InstrumentDropdown selectedInstrument={selectedInstrument} onSelectInstrument={handleInstrumentChange} />

      <div className="status-message" aria-live="polite" aria-atomic="true">{statusMessage}</div>

      {currentError && (
        <section className="error-message" role="alert" aria-labelledby="upload-error-heading">
          <h2 id="upload-error-heading" ref={errorHeadingRef} tabIndex="-1">Tablature could not be loaded</h2>
          <p>{currentError}</p>
        </section>
      )}

      <div hidden={readingMode !== "iphone"}>
        <IPhoneTabReader document={iphoneDocument} ref={iphoneHeadingRef} />
      </div>

      <section className="desktop-instructions-control">
        <button type="button" onClick={toggleInfoSection} aria-expanded={isInfoOpen} aria-controls="desktop-instructions">
          {isInfoOpen ? "Close Mac keyboard instructions" : "Open Mac keyboard instructions"}
        </button>
        {isInfoOpen && <div id="desktop-instructions"><InfoSection /></div>}
      </section>

      <section hidden={readingMode !== "desktop"} aria-label="Desktop grid reader">
        <div>
          <input id="multi-column" type="checkbox" checked={isMultiColumnNav} onChange={handleCheckboxChange} />
          <label htmlFor="multi-column">Multi-Column Navigation</label>
        </div>
        <ColumnDropdown value={numColumns} numOptions={tablature.length > 0 ? tablature[0][0].length : 1} onChange={handleDropdownChange} />
        {tablature.map((subarray, index) => (
          <div key={index} ref={(element) => (gridRefs.current[index] = element)} tabIndex={index === 0 ? 0 : -1} onKeyDown={(event) => handleKeyDown(event, index)}>
            <h2>Tablature {index + 1}</h2>
            <DataGrid data={subarray} numColumns={numColumns} isMultiColumnNav={isMultiColumnNav} setNumColumns={setNumColumns} selectedInstrument={selectedInstrument} />
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;

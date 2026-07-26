import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import Upload from "./Upload";
import DataGrid from "./DataGrid";
import ColumnDropdown from "./ColumnDropdown";
import InfoSection from "./InfoSection";
import InstrumentDropdown from "./InstrumentDropdown";
import IPhoneTabReader from "./IPhoneTabReader";
import { readTextFile, TabParseError } from "./iphoneTabModel";
import { buildReaderDocuments } from "./tabImportCoordinator";
import "./App.css";

const TEST_BUILD_LABEL = "Shared semantic core repair 1";

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
  const pendingIphoneFocusTargetRef = useRef(null);
  const iphoneFocusFrameRef = useRef(null);

  const focusPendingIphoneTargetWhenBrowserReturns = useCallback(() => {
    if (
      !pendingIphoneFocusTargetRef.current ||
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
        const target =
          pendingIphoneFocusTargetRef.current === "reader"
            ? iphoneHeadingRef.current
            : errorHeadingRef.current;

        if (!target) return;

        target.focus({ preventScroll: true });
        if (document.activeElement === target) {
          pendingIphoneFocusTargetRef.current = null;
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
    focusPendingIphoneTargetWhenBrowserReturns();
  }, [focusPendingIphoneTargetWhenBrowserReturns, iphoneFocusRequest, readingMode]);

  useEffect(() => {
    const recoverPendingIphoneFocus = () => {
      if (document.visibilityState === "visible") {
        focusPendingIphoneTargetWhenBrowserReturns();
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
  }, [focusPendingIphoneTargetWhenBrowserReturns]);

  const focusSoon = (ref) => {
    window.setTimeout(() => ref.current?.focus(), 0);
  };

  const commitIphoneOutcome = ({
    target,
    semanticDocument = null,
    iphoneErrorMessage = "",
    desktopErrorMessage = "",
    desktopBlocks = [],
    status,
    resolvedInstrument = null,
  }) => {
    pendingIphoneFocusTargetRef.current = target;

    flushSync(() => {
      setTablature(desktopBlocks);
      setIphoneDocument(semanticDocument);
      setIphoneError(iphoneErrorMessage);
      setDesktopError(desktopErrorMessage);
      if (resolvedInstrument) {
        setSelectedInstrument(resolvedInstrument);
      }
      setIsReadingFile(false);
      setStatusMessage(status);
      setIphoneFocusRequest((current) => current + 1);
    });
  };

  const finishUnreadableUpload = (message, status) => {
    if (readingMode === "iphone") {
      commitIphoneOutcome({
        target: "error",
        iphoneErrorMessage: message,
        desktopErrorMessage: message,
        status,
      });
      return;
    }

    setTablature([]);
    setIphoneDocument(null);
    setIphoneError(message);
    setDesktopError(message);
    setStatusMessage(status);
    setIsReadingFile(false);
    focusSoon(errorHeadingRef);
  };

  const handleFileUpload = async (file) => {
    pendingIphoneFocusTargetRef.current = null;
    setIsReadingFile(true);
    setStatusMessage("Reading the selected tablature file.");
    setIphoneError("");
    setDesktopError("");
    setIphoneDocument(null);
    setTablature([]);

    if (!file?.name?.toLowerCase().endsWith(".txt")) {
      finishUnreadableUpload(
        "Choose a plain-text file whose name ends in .txt.",
        "The selected file was not accepted."
      );
      return;
    }

    let sourceText;

    try {
      sourceText = await readTextFile(file);
    } catch (error) {
      finishUnreadableUpload(
        messageFromError(error, "The selected file could not be read."),
        "The selected file could not be read."
      );
      return;
    }

    let readerDocuments;

    try {
      readerDocuments = buildReaderDocuments(sourceText, selectedInstrument);
    } catch (error) {
      finishUnreadableUpload(
        messageFromError(
          error,
          "The file could not be prepared for the Guitar Eyes readers."
        ),
        "The selected file could not be prepared."
      );
      return;
    }

    const {
      desktopBlocks,
      semanticDocument,
      semanticError,
      resolvedInstrument,
      instrumentWasDetected,
    } = readerDocuments;

    const detectedPrefix = instrumentWasDetected
      ? `Detected ${semanticDocument?.instrumentLabel ?? resolvedInstrument}. `
      : "";

    if (semanticDocument) {
      const successStatus = `${detectedPrefix}Loaded ${semanticDocument.positions.length} synchronized positions in iPhone reading mode.`;

      if (readingMode === "iphone") {
        commitIphoneOutcome({
          target: "reader",
          semanticDocument,
          desktopBlocks,
          status: successStatus,
          resolvedInstrument,
        });
        return;
      }

      setTablature(desktopBlocks);
      setIphoneDocument(semanticDocument);
      setIphoneError("");
      setDesktopError("");
      setSelectedInstrument(resolvedInstrument);
      setIsReadingFile(false);
      setStatusMessage(
        `${detectedPrefix}Loaded ${desktopBlocks.length} tablature ${
          desktopBlocks.length === 1 ? "block" : "blocks"
        } in desktop grid mode.`
      );
      desktopFocusPendingRef.current = true;
      window.setTimeout(() => gridRefs.current[0]?.focus(), 0);
      return;
    }

    const semanticMessage = messageFromError(
      semanticError,
      "The file could not be parsed for iPhone reading mode."
    );

    if (readingMode === "iphone") {
      commitIphoneOutcome({
        target: "error",
        iphoneErrorMessage: semanticMessage,
        desktopBlocks,
        status: "The file could not be loaded in iPhone reading mode.",
      });
      return;
    }

    setTablature(desktopBlocks);
    setIphoneDocument(null);
    setIphoneError(semanticMessage);
    setDesktopError("");
    setIsReadingFile(false);

    if (desktopBlocks?.length > 0) {
      setStatusMessage(
        `Loaded ${desktopBlocks.length} tablature ${
          desktopBlocks.length === 1 ? "block" : "blocks"
        } in desktop grid mode using the compatibility parser.`
      );
      desktopFocusPendingRef.current = true;
      window.setTimeout(() => gridRefs.current[0]?.focus(), 0);
    } else {
      setDesktopError("No tablature blocks could be prepared for desktop grid mode.");
      setStatusMessage("The file could not be loaded in desktop grid mode.");
      focusSoon(errorHeadingRef);
    }
  };

  const handleReadingModeChange = (event) => {
    const nextMode = event.target.value;
    setReadingMode(nextMode);

    if (nextMode === "iphone") {
      if (iphoneDocument) {
        pendingIphoneFocusTargetRef.current = "reader";
        setIphoneFocusRequest((current) => current + 1);
      } else if (iphoneError) {
        pendingIphoneFocusTargetRef.current = "error";
        setIphoneFocusRequest((current) => current + 1);
      }
      return;
    }

    pendingIphoneFocusTargetRef.current = null;
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
        This branch preserves Jason Washburn&apos;s desktop reader and uses one semantic
        foundation for desktop and iPhone access.
      </p>
      <p className="test-build-label">Test build: {TEST_BUILD_LABEL}.</p>

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

      <InstrumentDropdown selectedInstrument={selectedInstrument} onSelectInstrument={handleInstrumentChange} />
      <Upload onFileUpload={handleFileUpload} disabled={isReadingFile} />

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

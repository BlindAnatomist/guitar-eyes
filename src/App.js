import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import Upload from "./Upload";
import InfoSection from "./InfoSection";
import InstrumentDropdown from "./InstrumentDropdown";
import IPhoneTabReader from "./IPhoneTabReader";
import DesktopTabReader from "./DesktopTabReader";
import {
  parseTabText,
  readTextFile,
  TabParseError,
} from "./tablatureModel";
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

function loadedStatus(document) {
  const positionWord = document.positions.length === 1 ? "position" : "positions";
  const blockWord = document.blocks.length === 1 ? "block" : "blocks";
  return `Loaded ${document.positions.length} synchronized ${positionWord} across ${document.blocks.length} tablature ${blockWord}. The same semantic document is available in both reading modes.`;
}

function App() {
  const [tabDocument, setTabDocument] = useState(null);
  const [sourceText, setSourceText] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(
    () => getInitialReadingMode() === "desktop"
  );
  const [selectedInstrument, setSelectedInstrument] = useState("guitar");
  const [readingMode, setReadingMode] = useState(getInitialReadingMode);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [iphoneFocusRequest, setIphoneFocusRequest] = useState(0);

  const iphoneHeadingRef = useRef(null);
  const desktopHeadingRef = useRef(null);
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
      tabDocument &&
      desktopHeadingRef.current
    ) {
      desktopHeadingRef.current.focus({ preventScroll: true });
      desktopFocusPendingRef.current = false;
    }
  }, [tabDocument, readingMode]);

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
    window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 0);
  };

  const commitParsedDocument = (parsedDocument, mode = readingMode) => {
    setErrorMessage("");

    if (mode === "iphone") {
      iphoneFocusPendingRef.current = true;
      flushSync(() => {
        setTabDocument(parsedDocument);
        setStatusMessage(loadedStatus(parsedDocument));
        setIphoneFocusRequest((current) => current + 1);
      });
      return;
    }

    desktopFocusPendingRef.current = true;
    setTabDocument(parsedDocument);
    setStatusMessage(loadedStatus(parsedDocument));
  };

  const handleFileUpload = async (file) => {
    setIsReadingFile(true);
    setStatusMessage("Reading the selected tablature file.");
    setErrorMessage("");
    setTabDocument(null);

    if (!file?.name?.toLowerCase().endsWith(".txt")) {
      setSourceText("");
      setSourceFileName("");
      setErrorMessage("Choose a plain-text file whose name ends in .txt.");
      setStatusMessage("The selected file was not accepted.");
      setIsReadingFile(false);
      focusSoon(errorHeadingRef);
      return;
    }

    try {
      const text = await readTextFile(file);
      const parsedDocument = parseTabText(text, selectedInstrument);
      setSourceText(text);
      setSourceFileName(file.name);
      commitParsedDocument(parsedDocument);
    } catch (error) {
      setSourceText("");
      setSourceFileName("");
      setTabDocument(null);
      setErrorMessage(
        messageFromError(error, "The tablature file could not be read or parsed.")
      );
      setStatusMessage("The file could not be loaded.");
      focusSoon(errorHeadingRef);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleReadingModeChange = (event) => {
    const nextMode = event.target.value;
    setReadingMode(nextMode);

    if (!tabDocument) {
      if (errorMessage) focusSoon(errorHeadingRef);
      return;
    }

    if (nextMode === "iphone") {
      iphoneFocusPendingRef.current = true;
      setIphoneFocusRequest((current) => current + 1);
      return;
    }

    iphoneFocusPendingRef.current = false;
    desktopFocusPendingRef.current = true;
    focusSoon(desktopHeadingRef);
  };

  const handleInstrumentChange = (instrument) => {
    setSelectedInstrument(instrument);
    if (!sourceText) return;

    try {
      const parsedDocument = parseTabText(sourceText, instrument);
      commitParsedDocument(parsedDocument);
    } catch (error) {
      setTabDocument(null);
      setErrorMessage(
        messageFromError(
          error,
          `The uploaded file could not be parsed as ${instrument} tablature.`
        )
      );
      setStatusMessage(
        `${sourceFileName || "The uploaded file"} could not be loaded as ${instrument} tablature.`
      );
      focusSoon(errorHeadingRef);
    }
  };

  const toggleInfoSection = () => setIsInfoOpen((current) => !current);

  return (
    <main className="app-shell">
      <h1>
        Guitar Eyes for Mac and iPhone - Accessible Guitar and Bass Tablature Reader
      </h1>
      <p className="extension-note">
        Jason Washburn&apos;s desktop concept and the iPhone semantic reader now use one
        synchronized tablature model. Phone and desktop are two ways of navigating the
        same parsed music, not separate applications.
      </p>

      <fieldset className="mode-selector">
        <legend>Reading mode</legend>
        <label>
          <input
            type="radio"
            name="reading-mode"
            value="iphone"
            checked={readingMode === "iphone"}
            onChange={handleReadingModeChange}
          />
          iPhone semantic reader
        </label>
        <label>
          <input
            type="radio"
            name="reading-mode"
            value="desktop"
            checked={readingMode === "desktop"}
            onChange={handleReadingModeChange}
          />
          Desktop semantic reader
        </label>
      </fieldset>

      <Upload onFileUpload={handleFileUpload} disabled={isReadingFile} />
      <InstrumentDropdown
        selectedInstrument={selectedInstrument}
        onSelectInstrument={handleInstrumentChange}
      />

      <div className="status-message" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {errorMessage && (
        <section
          className="error-message"
          role="alert"
          aria-labelledby="upload-error-heading"
        >
          <h2 id="upload-error-heading" ref={errorHeadingRef} tabIndex="-1">
            Tablature could not be loaded
          </h2>
          <p>{errorMessage}</p>
        </section>
      )}

      <div hidden={readingMode !== "iphone"}>
        <IPhoneTabReader document={tabDocument} ref={iphoneHeadingRef} />
      </div>

      <div hidden={readingMode !== "desktop"}>
        <DesktopTabReader document={tabDocument} ref={desktopHeadingRef} />
      </div>

      <section className="desktop-instructions-control">
        <button
          type="button"
          onClick={toggleInfoSection}
          aria-expanded={isInfoOpen}
          aria-controls="desktop-instructions"
        >
          {isInfoOpen ? "Close Mac keyboard instructions" : "Open Mac keyboard instructions"}
        </button>
        {isInfoOpen && (
          <div id="desktop-instructions">
            <InfoSection />
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { readCompressedMusicXmlFile } from "./compressedMusicXmlImporter";
import DesktopSemanticReader from "./DesktopSemanticReader";
import GuitarProTrackSelector from "./GuitarProTrackSelector";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";
import InfoSection from "./InfoSection";
import InstrumentDropdown from "./InstrumentDropdown";
import IPhoneTabReader from "./IPhoneTabReader";
import LegacyDesktopReader from "./LegacyDesktopReader";
import Upload from "./Upload";
import { readTextFile, TabParseError } from "./iphoneTabModel";
import {
  buildMusicXmlReaderDocuments,
  buildReaderDocuments,
} from "./tabImportCoordinator";
import {
  detectTabFileFormat,
  shouldReadTabFileAsText,
  unsupportedTabFormatMessage,
} from "./tabFormatDetector";
import "./App.css";

const TEST_BUILD_LABEL = "PowerTab 2 version 11 source checkpoint";

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
  const [desktopBlocks, setDesktopBlocks] = useState([]);
  const [semanticDocument, setSemanticDocument] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(
    () => getInitialReadingMode() === "desktop"
  );
  const [selectedInstrument, setSelectedInstrument] = useState("guitar");
  const [readingMode, setReadingMode] = useState(getInitialReadingMode);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [iphoneError, setIphoneError] = useState("");
  const [desktopError, setDesktopError] = useState("");
  const [structuredSelectionSession, setStructuredSelectionSession] = useState(null);
  const [iphoneFocusRequest, setIphoneFocusRequest] = useState(0);

  const iphoneHeadingRef = useRef(null);
  const desktopHeadingRef = useRef(null);
  const legacyDesktopHeadingRef = useRef(null);
  const errorHeadingRef = useRef(null);
  const trackSelectionHeadingRef = useRef(null);
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
            : pendingIphoneFocusTargetRef.current === "track-selection"
              ? trackSelectionHeadingRef.current
              : errorHeadingRef.current;

        if (!target) return;

        target.focus({ preventScroll: true });
        if (document.activeElement === target) {
          pendingIphoneFocusTargetRef.current = null;
        }
      });
    });
  }, [readingMode]);

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

  useEffect(() => {
    if (readingMode !== "desktop" || !desktopFocusPendingRef.current) {
      return;
    }

    const target = semanticDocument
      ? desktopHeadingRef.current
      : legacyDesktopHeadingRef.current;

    if (target) {
      target.focus({ preventScroll: true });
      desktopFocusPendingRef.current = false;
    }
  }, [desktopBlocks, readingMode, semanticDocument]);

  const focusSoon = (ref) => {
    window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 0);
  };

  const commitIphoneOutcome = ({
    target,
    semanticDocument: nextDocument = null,
    iphoneErrorMessage = "",
    desktopErrorMessage = "",
    desktopBlocks: nextDesktopBlocks = [],
    status,
    resolvedInstrument = null,
  }) => {
    pendingIphoneFocusTargetRef.current = target;

    flushSync(() => {
      setDesktopBlocks(nextDesktopBlocks);
      setSemanticDocument(nextDocument);
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

  const showStructuredTrackSelection = (file, readerDocuments) => {
    const sourceFormatLabel =
      readerDocuments.sourceFormatLabel || "Guitar Pro tablature";
    const session = {
      file,
      intermediate: readerDocuments.selectionIntermediate,
      inventory: readerDocuments.trackInventory,
      sourceFormatLabel,
    };
    const pluralLabel =
      readerDocuments.trackInventory.selectorLabels?.plural || "tracks";
    const status = `${sourceFormatLabel} contains ${readerDocuments.trackInventory.supportedCount} supported tablature ${pluralLabel}. Choose one to continue.`;

    if (readingMode === "iphone") {
      pendingIphoneFocusTargetRef.current = "track-selection";
      flushSync(() => {
        setDesktopBlocks([]);
        setSemanticDocument(null);
        setIphoneError("");
        setDesktopError("");
        setStructuredSelectionSession(session);
        setIsReadingFile(false);
        setStatusMessage(status);
        setIphoneFocusRequest((current) => current + 1);
      });
      return;
    }

    setDesktopBlocks([]);
    setSemanticDocument(null);
    setIphoneError("");
    setDesktopError("");
    setStructuredSelectionSession(session);
    setIsReadingFile(false);
    setStatusMessage(status);
    focusSoon(trackSelectionHeadingRef);
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

    setDesktopBlocks([]);
    setSemanticDocument(null);
    setIphoneError(message);
    setDesktopError(message);
    setStatusMessage(status);
    setIsReadingFile(false);
    focusSoon(errorHeadingRef);
  };

  const finishRecognizedUnsupportedFormat = (format) => {
    finishUnreadableUpload(
      unsupportedTabFormatMessage(format),
      `Recognized ${format.label}, but import support is not available yet.`
    );
  };

  const handleFileUpload = async (file) => {
    pendingIphoneFocusTargetRef.current = null;
    desktopFocusPendingRef.current = false;
    setIsReadingFile(true);
    setStatusMessage("Reading the selected tablature file.");
    setIphoneError("");
    setDesktopError("");
    setSemanticDocument(null);
    setDesktopBlocks([]);
    setStructuredSelectionSession(null);

    if (!file) {
      finishUnreadableUpload(
        "Choose a tablature file first.",
        "No tablature file was selected."
      );
      return;
    }

    const initialFormat = detectTabFileFormat(file.name);
    let detectedFormat = initialFormat;
    let readerDocuments;

    if (["guitar-pro-proof", "powertab-pt2"].includes(initialFormat.id)) {
      const formatName =
        initialFormat.id === "powertab-pt2"
          ? "PowerTab 2"
          : "Guitar Pro";
      try {
        readerDocuments = await buildStructuredTabReaderDocuments(file);
        if (readerDocuments.requiresTrackSelection) {
          showStructuredTrackSelection(file, readerDocuments);
          return;
        }
      } catch (error) {
        finishUnreadableUpload(
          messageFromError(
            error,
            `The ${formatName} file could not be prepared for the Guitar Eyes readers.`
          ),
          `The selected ${formatName} file could not be imported.`
        );
        return;
      }
    } else if (initialFormat.id === "compressed-musicxml") {
      try {
        const sourceText = await readCompressedMusicXmlFile(file);
        readerDocuments = buildMusicXmlReaderDocuments(sourceText, {
          sourceFormat: "compressed-musicxml",
          sourceFormatLabel: "compressed MusicXML tablature",
        });
      } catch (error) {
        finishUnreadableUpload(
          messageFromError(
            error,
            "The compressed MusicXML tablature could not be prepared for the Guitar Eyes readers."
          ),
          "The selected compressed MusicXML tablature could not be imported."
        );
        return;
      }
    } else {
      if (!shouldReadTabFileAsText(initialFormat)) {
        finishRecognizedUnsupportedFormat(initialFormat);
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

      detectedFormat = detectTabFileFormat(file.name, sourceText);

      if (!["ascii-text", "musicxml"].includes(detectedFormat.id)) {
        if (detectedFormat.support === "planned") {
          finishRecognizedUnsupportedFormat(detectedFormat);
        } else {
          finishUnreadableUpload(
            unsupportedTabFormatMessage(detectedFormat),
            "The selected file format could not be identified."
          );
        }
        return;
      }

      try {
        readerDocuments =
          detectedFormat.id === "musicxml"
            ? buildMusicXmlReaderDocuments(sourceText)
            : buildReaderDocuments(sourceText, selectedInstrument);
      } catch (error) {
        const formatLabel =
          detectedFormat.id === "musicxml" ? "MusicXML tablature" : "tablature";
        finishUnreadableUpload(
          messageFromError(
            error,
            `The ${formatLabel} could not be prepared for the Guitar Eyes readers.`
          ),
          `The selected ${formatLabel} could not be imported.`
        );
        return;
      }
    }

    const {
      desktopBlocks: nextDesktopBlocks,
      semanticDocument: nextDocument,
      semanticError,
      resolvedInstrument,
      instrumentWasDetected,
      supportOutcome,
      sourceFormat,
      sourceFormatLabel,
    } = readerDocuments;

    const detectedPrefix = instrumentWasDetected
      ? `Detected ${nextDocument?.instrumentLabel ?? resolvedInstrument}. `
      : "";
    const formatPrefix =
      sourceFormat === "ascii-text" ? "" : `Imported ${sourceFormatLabel}. `;

    if (nextDocument) {
      const iphoneSuccessStatus = `${formatPrefix}${detectedPrefix}Loaded ${nextDocument.positions.length} synchronized positions in iPhone reading mode.`;

      if (readingMode === "iphone") {
        commitIphoneOutcome({
          target: "reader",
          semanticDocument: nextDocument,
          desktopBlocks: nextDesktopBlocks,
          status: iphoneSuccessStatus,
          resolvedInstrument,
        });
        return;
      }

      setDesktopBlocks(nextDesktopBlocks);
      setSemanticDocument(nextDocument);
      setIphoneError("");
      setDesktopError("");
      setSelectedInstrument(resolvedInstrument);
      setIsReadingFile(false);
      setStatusMessage(
        `${formatPrefix}${detectedPrefix}Loaded ${nextDocument.positions.length} synchronized positions in desktop semantic reader mode.`
      );
      desktopFocusPendingRef.current = true;
      return;
    }

    const semanticMessage = messageFromError(
      semanticError,
      "The file could not be parsed for semantic reading."
    );

    if (supportOutcome === "recognized-unsupported") {
      finishUnreadableUpload(
        semanticMessage,
        "Recognized ASCII tablature with a string count that is not yet supported."
      );
      return;
    }

    if (readingMode === "iphone") {
      commitIphoneOutcome({
        target: "error",
        iphoneErrorMessage: semanticMessage,
        desktopBlocks: nextDesktopBlocks,
        status: "The file could not be loaded in iPhone reading mode.",
      });
      return;
    }

    setDesktopBlocks(nextDesktopBlocks);
    setSemanticDocument(null);
    setIphoneError(semanticMessage);
    setDesktopError("");
    setIsReadingFile(false);

    if (nextDesktopBlocks?.length > 0) {
      setStatusMessage(
        `Loaded ${nextDesktopBlocks.length} tablature ${
          nextDesktopBlocks.length === 1 ? "block" : "blocks"
        } in desktop compatibility grid mode.`
      );
      desktopFocusPendingRef.current = true;
    } else {
      setDesktopError("No tablature blocks could be prepared for desktop grid mode.");
      setStatusMessage("The file could not be loaded in desktop grid mode.");
      focusSoon(errorHeadingRef);
    }
  };

  const handleStructuredTrackSelection = async (selection) => {
    const session = structuredSelectionSession;
    if (!session) return;

    const labels = session.inventory?.selectorLabels || {};
    const formatName = labels.formatName || "Guitar Pro";
    const selectionName = labels.singular || "track";

    setIsReadingFile(true);
    setStatusMessage(`Preparing the selected ${formatName} ${selectionName}.`);
    setIphoneError("");
    setDesktopError("");

    let readerDocuments;
    try {
      readerDocuments = await buildStructuredTabReaderDocuments(session.file, {
        intermediate: session.intermediate,
        selection,
      });
    } catch (error) {
      setStructuredSelectionSession(null);
      finishUnreadableUpload(
        messageFromError(
          error,
          `The selected ${formatName} ${selectionName} could not be prepared for the Guitar Eyes readers.`
        ),
        `The selected ${formatName} ${selectionName} could not be imported.`
      );
      return;
    }

    const nextDocument = readerDocuments.semanticDocument;
    const nextDesktopBlocks = readerDocuments.desktopBlocks;
    const resolvedInstrument = readerDocuments.resolvedInstrument;
    setStructuredSelectionSession(null);

    if (!nextDocument) {
      finishUnreadableUpload(
        `The selected ${formatName} ${selectionName} did not produce a semantic reader document.`,
        `The selected ${formatName} ${selectionName} could not be imported.`
      );
      return;
    }

    const sourceFormatLabel =
      readerDocuments.sourceFormatLabel ||
      session.sourceFormatLabel ||
      `${formatName} tablature`;
    const status = `Imported ${sourceFormatLabel}. Loaded ${nextDocument.positions.length} synchronized positions`;
    if (readingMode === "iphone") {
      commitIphoneOutcome({
        target: "reader",
        semanticDocument: nextDocument,
        desktopBlocks: nextDesktopBlocks,
        status: `${status} in iPhone reading mode.`,
        resolvedInstrument,
      });
      return;
    }

    setDesktopBlocks(nextDesktopBlocks);
    setSemanticDocument(nextDocument);
    setIphoneError("");
    setDesktopError("");
    setSelectedInstrument(resolvedInstrument);
    setIsReadingFile(false);
    setStatusMessage(`${status} in desktop semantic reader mode.`);
    desktopFocusPendingRef.current = true;
  };

  const handleReadingModeChange = (event) => {
    const nextMode = event.target.value;
    setReadingMode(nextMode);

    if (nextMode === "iphone") {
      if (structuredSelectionSession) {
        pendingIphoneFocusTargetRef.current = "track-selection";
        setIphoneFocusRequest((current) => current + 1);
      } else if (semanticDocument) {
        pendingIphoneFocusTargetRef.current = "reader";
        setIphoneFocusRequest((current) => current + 1);
      } else if (iphoneError) {
        pendingIphoneFocusTargetRef.current = "error";
        setIphoneFocusRequest((current) => current + 1);
      }
      return;
    }

    pendingIphoneFocusTargetRef.current = null;
    if (structuredSelectionSession) {
      focusSoon(trackSelectionHeadingRef);
    } else if (semanticDocument || desktopBlocks.length > 0) {
      desktopFocusPendingRef.current = true;
    } else if (desktopError) {
      focusSoon(errorHeadingRef);
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
        This branch preserves Jason Washburn&apos;s desktop reader and uses one accepted
        semantic foundation for desktop and iPhone access.
      </p>
      <p className="test-build-label">Test build: {TEST_BUILD_LABEL}.</p>

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
          Desktop grid reader
        </label>
      </fieldset>

      <InstrumentDropdown
        selectedInstrument={selectedInstrument}
        onSelectInstrument={setSelectedInstrument}
      />
      <Upload onFileUpload={handleFileUpload} disabled={isReadingFile} />

      <div className="status-message" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {structuredSelectionSession && (
        <GuitarProTrackSelector
          ref={trackSelectionHeadingRef}
          inventory={structuredSelectionSession.inventory}
          onSubmit={handleStructuredTrackSelection}
          disabled={isReadingFile}
        />
      )}

      {currentError && (
        <section
          className="error-message"
          role="alert"
          aria-labelledby="upload-error-heading"
        >
          <h2 id="upload-error-heading" ref={errorHeadingRef} tabIndex="-1">
            Tablature could not be loaded
          </h2>
          <p>{currentError}</p>
        </section>
      )}

      {readingMode === "iphone" && (
        <IPhoneTabReader document={semanticDocument} ref={iphoneHeadingRef} />
      )}

      <section className="desktop-instructions-control">
        <button
          type="button"
          onClick={() => setIsInfoOpen((current) => !current)}
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

      {readingMode === "desktop" &&
        (semanticDocument ? (
          <DesktopSemanticReader document={semanticDocument} ref={desktopHeadingRef} />
        ) : (
          <LegacyDesktopReader
            tablature={desktopBlocks}
            selectedInstrument={selectedInstrument}
            ref={legacyDesktopHeadingRef}
          />
        ))}
    </main>
  );
}

export default App;

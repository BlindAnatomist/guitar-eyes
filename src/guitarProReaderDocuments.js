import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { normalizeVerifiedGuitarProIntermediate } from "./guitarProSourceNormalizer";
import { buildGuitarProTrackInventory } from "./guitarProTrackInventory";
import { decodeGuitarProArchiveProofFile } from "./guitarProWorkerClient";

async function loadBrowserWorkerFactory() {
  const module = await import("./guitarProBrowserWorkerFactory");
  return module.createGuitarProBrowserWorker;
}

async function buildPowerTabDocuments(file, options) {
  const module = await import("./powerTabReaderDocuments");
  return module.buildPowerTabReaderDocuments(file, options);
}

function isPowerTabRequest(file, options) {
  return (
    /\.pt2$/iu.test(String(file?.name || "")) ||
    options?.intermediate?.sourceVersion === "PT2_V11"
  );
}

function sourceLabel(intermediate) {
  switch (intermediate?.sourceVersion) {
    case "GP3":
      return "Guitar Pro 3 tablature";
    case "GP4":
      return "Guitar Pro 4 tablature";
    case "GP5":
      return "Guitar Pro 5 tablature";
    case "GP6":
      return "Guitar Pro 6 tablature";
    case "GP7":
      return "Guitar Pro 7 tablature";
    case "GP8":
      return "Guitar Pro 8 tablature";
    default:
      return "Guitar Pro tablature";
  }
}

export async function buildGuitarProReaderDocuments(file, options = {}) {
  if (isPowerTabRequest(file, options)) {
    return buildPowerTabDocuments(file, options);
  }

  const {
    workerFactory = null,
    decode = decodeGuitarProArchiveProofFile,
    normalize = normalizeVerifiedGuitarProIntermediate,
    inventory = buildGuitarProTrackInventory,
    intermediate = null,
    selection = null,
  } = options;

  let resolvedIntermediate = intermediate;
  if (!resolvedIntermediate) {
    const resolvedWorkerFactory =
      workerFactory || (await loadBrowserWorkerFactory());
    resolvedIntermediate = await decode(file, {
      workerFactory: resolvedWorkerFactory,
    });
  }

  const sourceFormatLabel = sourceLabel(resolvedIntermediate);
  const trackInventory = inventory(resolvedIntermediate);
  if (trackInventory.requiresSelection && !selection) {
    return {
      desktopBlocks: [],
      desktopSource: "semantic",
      semanticDocument: null,
      semanticError: null,
      requestedInstrument: null,
      resolvedInstrument: null,
      instrumentWasDetected: false,
      supportOutcome: "track-selection-required",
      sourceFormat: "guitar-pro",
      sourceFormatLabel,
      requiresTrackSelection: true,
      trackInventory,
      guitarProIntermediate: resolvedIntermediate,
    };
  }

  const resolvedSelection = selection || trackInventory.autoSelection;
  const semanticDocument = normalize(resolvedIntermediate, {
    selection: resolvedSelection,
  });
  const desktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

  return {
    desktopBlocks,
    desktopSource: "semantic",
    semanticDocument,
    semanticError: null,
    requestedInstrument: semanticDocument.instrument,
    resolvedInstrument: semanticDocument.instrument,
    instrumentWasDetected: false,
    supportOutcome: "checkpoint-foundation",
    sourceFormat: "guitar-pro",
    sourceFormatLabel,
    requiresTrackSelection: false,
    trackInventory,
    guitarProIntermediate: null,
  };
}

export const buildGuitarProArchiveProofReaderDocuments =
  buildGuitarProReaderDocuments;

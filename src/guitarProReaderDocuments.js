import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";
import { buildGuitarProTrackInventory } from "./guitarProTrackInventory";
import { decodeGuitarProArchiveProofFile } from "./guitarProWorkerClient";

async function loadBrowserWorkerFactory() {
  const module = await import("./guitarProBrowserWorkerFactory");
  return module.createGuitarProBrowserWorker;
}

export async function buildGuitarProArchiveProofReaderDocuments(
  file,
  {
    workerFactory = null,
    decode = decodeGuitarProArchiveProofFile,
    normalize = normalizeGuitarProIntermediate,
    inventory = buildGuitarProTrackInventory,
    intermediate = null,
    selection = null,
  } = {}
) {
  let resolvedIntermediate = intermediate;
  if (!resolvedIntermediate) {
    const resolvedWorkerFactory = workerFactory || (await loadBrowserWorkerFactory());
    resolvedIntermediate = await decode(file, {
      workerFactory: resolvedWorkerFactory,
    });
  }

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
      sourceFormat: "guitar-pro-archive",
      sourceFormatLabel: "Guitar Pro archive tablature",
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
    supportOutcome: "checkpoint-proof",
    sourceFormat: "guitar-pro-archive",
    sourceFormatLabel: "Guitar Pro archive tablature",
    requiresTrackSelection: false,
    trackInventory,
    guitarProIntermediate: null,
  };
}

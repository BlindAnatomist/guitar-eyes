import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";
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
  } = {}
) {
  const resolvedWorkerFactory = workerFactory || (await loadBrowserWorkerFactory());
  const intermediate = await decode(file, {
    workerFactory: resolvedWorkerFactory,
  });
  const semanticDocument = normalize(intermediate);
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
  };
}

import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";
import { decodeGuitarPro7ProofFile } from "./guitarProWorkerClient";

async function loadBrowserWorkerFactory() {
  const module = await import("./guitarProBrowserWorkerFactory");
  return module.createGuitarProBrowserWorker;
}

export async function buildGuitarPro7ProofReaderDocuments(
  file,
  {
    workerFactory = null,
    decode = decodeGuitarPro7ProofFile,
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
    sourceFormat: "guitar-pro-7",
    sourceFormatLabel: "Guitar Pro 7 tablature",
  };
}

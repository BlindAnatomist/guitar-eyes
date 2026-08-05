import { buildGuitarProSpecificReaderDocuments } from "./guitarProSpecificReaderDocuments";

function isPowerTabRequest(file, options) {
  return (
    /\.pt2$/iu.test(String(file?.name || "")) ||
    options?.intermediate?.sourceVersion === "PT2_V11"
  );
}

async function buildPowerTabCompatibilityReaderDocuments(file, options) {
  const module = await import("./powerTabReaderDocuments");
  try {
    const result = await module.buildPowerTabReaderDocuments(file, options);
    if (!result?.requiresTrackSelection) return result;

    return {
      ...result,
      guitarProIntermediate: result.powerTabIntermediate,
    };
  } catch (error) {
    return {
      desktopBlocks: [],
      desktopSource: "semantic",
      semanticDocument: null,
      semanticError: error,
      requestedInstrument: null,
      resolvedInstrument: null,
      instrumentWasDetected: false,
      supportOutcome: "powertab-import-error",
      sourceFormat: "powertab-pt2",
      sourceFormatLabel: "PowerTab 2 version 11 tablature",
      requiresTrackSelection: false,
      trackInventory: null,
      guitarProIntermediate: null,
    };
  }
}

export async function buildGuitarProReaderDocuments(file, options = {}) {
  if (isPowerTabRequest(file, options)) {
    return buildPowerTabCompatibilityReaderDocuments(file, options);
  }

  return buildGuitarProSpecificReaderDocuments(file, options);
}

export const buildGuitarProArchiveProofReaderDocuments =
  buildGuitarProReaderDocuments;

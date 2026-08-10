import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { PowerTabImportError } from "./powerTabErrors";
import { decodePowerTabPt2File } from "./powerTabPt2Decoder";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";

function sourceFormatLabel(intermediate) {
  const version = intermediate?.versionEvidence?.internalVersion;
  return Number.isInteger(version)
    ? `PowerTab 2 version ${version} tablature`
    : "PowerTab 2 tablature";
}

export async function buildPowerTabReaderDocuments(
  file,
  {
    decode = decodePowerTabPt2File,
    normalize = normalizeVerifiedPowerTabIntermediate,
    inventory = buildPowerTabTrackInventory,
    intermediate = null,
    selection = null,
  } = {}
) {
  const resolvedIntermediate = intermediate || (await decode(file));
  const trackInventory = inventory(resolvedIntermediate);
  const resolvedSourceFormatLabel = sourceFormatLabel(resolvedIntermediate);

  if (trackInventory.supportedCount === 0) {
    const reasons = trackInventory.items
      .map((item) => `${item.trackName}: ${item.reason}`)
      .join(" ");
    throw new PowerTabImportError(
      reasons ||
        "The PowerTab file contains no supported six-string guitar player in the fixture-proven profile.",
      "NO_SUPPORTED_POWERTAB_PLAYER"
    );
  }

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
      sourceFormat: "powertab-pt2",
      sourceFormatLabel: resolvedSourceFormatLabel,
      requiresTrackSelection: true,
      trackInventory,
      powerTabIntermediate: resolvedIntermediate,
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
    supportOutcome: "source-checkpoint-provisional",
    sourceFormat: "powertab-pt2",
    sourceFormatLabel: resolvedSourceFormatLabel,
    requiresTrackSelection: false,
    trackInventory,
    powerTabIntermediate: null,
  };
}

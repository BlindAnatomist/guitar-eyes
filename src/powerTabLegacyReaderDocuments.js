import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { decodePowerTabLegacyV17File } from "./powerTabLegacyV17Decoder";
import { PowerTabImportError } from "./powerTabErrors";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";
import { normalizeVerifiedPowerTabLegacyIntermediate } from "./powerTabLegacySourceNormalizer";

export async function buildPowerTabLegacyReaderDocuments(file, options = {}) {
  const decode = options.decode || decodePowerTabLegacyV17File;
  const inventoryBuilder = options.inventory || buildPowerTabTrackInventory;
  const normalize =
    options.normalize || normalizeVerifiedPowerTabLegacyIntermediate;
  const intermediate = options.intermediate || (await decode(file, options));
  const trackInventory = inventoryBuilder(intermediate, options);

  if (trackInventory.supportedCount === 0) {
    const reasons = trackInventory.items
      .map((item) => item.reason)
      .filter(Boolean)
      .join(" ");
    throw new PowerTabImportError(
      reasons ||
        "The legacy PowerTab 1.7 file contains no player within the bounded six-string guitar profile.",
      "NO_SUPPORTED_POWERTAB_LEGACY_PLAYER"
    );
  }

  const sourceFormat = "powertab-legacy";
  const sourceFormatLabel = "PowerTab 1.7 tablature";

  if (trackInventory.requiresSelection && !options.selection) {
    return {
      desktopBlocks: [],
      desktopSource: "semantic",
      semanticDocument: null,
      semanticError: null,
      requestedInstrument: "guitar",
      resolvedInstrument: null,
      instrumentWasDetected: false,
      supportOutcome: "track-selection-required",
      sourceFormat,
      sourceFormatLabel,
      requiresTrackSelection: true,
      trackInventory,
      powerTabIntermediate: intermediate,
    };
  }

  const selection = options.selection || trackInventory.autoSelection;
  const semanticDocument = normalize(intermediate, {
    ...options,
    selection,
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
    sourceFormat,
    sourceFormatLabel,
    requiresTrackSelection: false,
    trackInventory,
    powerTabIntermediate: null,
  };
}

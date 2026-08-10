import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { decodePowerTabLegacyFile } from "./powerTabLegacyDecoder";
import { PowerTabImportError } from "./powerTabErrors";
import { buildPowerTabTrackInventory } from "./powerTabTrackInventory";
import { normalizeVerifiedPowerTabLegacyFamilyIntermediate } from "./powerTabLegacyFamilySourceNormalizer";

const LEGACY_VERSION_LABELS = new Map([
  ["PTB_V10", "1.0"],
  ["PTB_V102", "1.0.2"],
  ["PTB_V15", "1.5"],
  ["PTB_V17", "1.7"],
]);

function powerTabVersionLabel(intermediate) {
  return String(
    intermediate?.versionEvidence?.powerTabVersion ||
      LEGACY_VERSION_LABELS.get(intermediate?.sourceVersion) ||
      "legacy"
  );
}

export async function buildPowerTabLegacyReaderDocuments(file, options = {}) {
  const decode = options.decode || decodePowerTabLegacyFile;
  const inventoryBuilder = options.inventory || buildPowerTabTrackInventory;
  const normalize =
    options.normalize || normalizeVerifiedPowerTabLegacyFamilyIntermediate;
  const intermediate = options.intermediate || (await decode(file, options));
  const trackInventory = inventoryBuilder(intermediate, options);
  const powerTabVersion = powerTabVersionLabel(intermediate);

  if (trackInventory.supportedCount === 0) {
    const reasons = trackInventory.items
      .map((item) => item.reason)
      .filter(Boolean)
      .join(" ");
    throw new PowerTabImportError(
      reasons ||
        `The PowerTab ${powerTabVersion} file contains no player within the bounded six-string guitar profile.`,
      "NO_SUPPORTED_POWERTAB_LEGACY_PLAYER"
    );
  }

  const sourceFormat = "powertab-legacy";
  const sourceFormatLabel = `PowerTab ${powerTabVersion} tablature`;

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

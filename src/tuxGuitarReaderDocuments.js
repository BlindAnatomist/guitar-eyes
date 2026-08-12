import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { TuxGuitarImportError } from "./tuxGuitarDecoder";
import { decodeTuxGuitarProfileFile } from "./tuxGuitarProfileDecoder";
import { normalizeVerifiedTuxGuitarIntermediate } from "./tuxGuitarSourceNormalizer";
import { buildTuxGuitarTrackInventory } from "./tuxGuitarTrackInventory";

const VERSION_LABELS = Object.freeze({
  TG_1_0: "1.0",
  TG_1_1: "1.1",
  TG_1_2: "1.2",
  TG_1_3: "1.3",
  TG_1_5: "1.5",
  TG_2_0: "2.0",
});

function sourceFormatLabel(intermediate) {
  const version = VERSION_LABELS[intermediate?.sourceVersion];
  return version ? `TuxGuitar ${version} tablature` : "TuxGuitar tablature";
}

export async function buildTuxGuitarReaderDocuments(
  file,
  {
    decode = decodeTuxGuitarProfileFile,
    normalize = normalizeVerifiedTuxGuitarIntermediate,
    inventory = buildTuxGuitarTrackInventory,
    intermediate = null,
    selection = null,
  } = {}
) {
  const resolved = intermediate || (await decode(file));
  const trackInventory = inventory(resolved);
  const formatLabel = sourceFormatLabel(resolved);

  if (trackInventory.supportedCount === 0) {
    const reasons = trackInventory.items
      .map((item) => `${item.trackName}: ${item.reason}`)
      .join(" ");
    throw new TuxGuitarImportError(
      reasons ||
        "The TuxGuitar file contains no supported standard four-string bass or six-string guitar track in the proven profile.",
      "NO_SUPPORTED_TUXGUITAR_TRACK"
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
      sourceFormat: "tuxguitar",
      sourceFormatLabel: formatLabel,
      requiresTrackSelection: true,
      trackInventory,
      tuxGuitarIntermediate: resolved,
    };
  }

  const semanticDocument = normalize(resolved, {
    selection: selection || trackInventory.autoSelection,
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
    sourceFormat: "tuxguitar",
    sourceFormatLabel: formatLabel,
    requiresTrackSelection: false,
    trackInventory,
    tuxGuitarIntermediate: null,
  };
}

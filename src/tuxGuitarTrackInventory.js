import {
  buildGuitarProTrackInventory,
  GuitarProTrackInventoryError,
} from "./guitarProTrackInventory";
import { TuxGuitarImportError } from "./tuxGuitarDecoder";

function rename(value) {
  return String(value || "").replace(/Guitar Pro/gu, "TuxGuitar");
}

const SELECTOR_LABELS = Object.freeze({
  formatName: "TuxGuitar",
  singular: "track",
  plural: "tracks",
  heading: "Choose a TuxGuitar track",
  loadAction: "Load selected track",
  selectedPrefix: "Selected track details",
  noneSelected: "No track selected.",
  unavailableHeading: "Other tracks not available",
  controlNote:
    "The separate Guitar or Bass control does not filter TuxGuitar tracks.",
});

function relabelItem(item) {
  return {
    ...item,
    id: item.id.replace(/^guitar-pro-/u, "tuxguitar-"),
    reason: rename(item.reason),
  };
}

export function buildTuxGuitarTrackInventory(intermediate) {
  try {
    const inventory = buildGuitarProTrackInventory(intermediate);
    return {
      ...inventory,
      title: String(intermediate?.title || "TuxGuitar tablature").trim(),
      selectorLabels: SELECTOR_LABELS,
      items: inventory.items.map(relabelItem),
      supportedItems: inventory.supportedItems.map(relabelItem),
    };
  } catch (error) {
    if (!(error instanceof GuitarProTrackInventoryError)) throw error;
    throw new TuxGuitarImportError(
      rename(error.message),
      String(error.code || "TUXGUITAR_TRACK_INVENTORY_ERROR").replace(
        /GUITAR_PRO/gu,
        "TUXGUITAR"
      )
    );
  }
}

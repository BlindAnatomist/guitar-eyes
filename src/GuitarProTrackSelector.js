import React, { forwardRef, useEffect, useMemo, useState } from "react";

const DEFAULT_LABELS = Object.freeze({
  formatName: "Guitar Pro",
  singular: "track",
  plural: "tracks",
  heading: "Choose a Guitar Pro track",
  loadAction: "Load selected track",
  selectedPrefix: "Selected track details",
  noneSelected: "No track selected.",
  unavailableHeading: "Other tracks not available",
  controlNote:
    "The separate Guitar or Bass control does not filter Guitar Pro tracks.",
});

const GuitarProTrackSelector = forwardRef(function GuitarProTrackSelector(
  { inventory, onSubmit, disabled = false },
  headingRef
) {
  const supportedItems = useMemo(
    () =>
      Array.isArray(inventory?.supportedItems)
        ? inventory.supportedItems
        : [],
    [inventory]
  );
  const [selectedId, setSelectedId] = useState("");
  const labels = { ...DEFAULT_LABELS, ...(inventory?.selectorLabels || {}) };
  const selectorId = `${String(labels.formatName || "tablature")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}-track-selector`;

  useEffect(() => {
    setSelectedId("");
  }, [supportedItems]);

  const selectedItem =
    supportedItems.find((item) => item.id === selectedId) || null;
  const unsupportedItems = Array.isArray(inventory?.items)
    ? inventory.items.filter((item) => !item.supported)
    : [];
  const selectedTrackSummary = selectedItem
    ? `${labels.selectedPrefix}: ${selectedItem.selectionLabel}`
    : labels.noneSelected;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedItem || disabled) return;
    onSubmit?.({
      trackIndex: selectedItem.trackIndex,
      staffIndex: selectedItem.staffIndex,
    });
  };

  return (
    <section className="guitar-pro-track-selector" aria-labelledby={selectorId}>
      <h2 id={selectorId} ref={headingRef} tabIndex="-1">
        {labels.heading}
      </h2>
      <p>
        This file contains {supportedItems.length} supported tablature{" "}
        {supportedItems.length === 1 ? labels.singular : labels.plural}. No{" "}
        {labels.singular} is selected. Choose one explicitly before loading it.{" "}
        {labels.controlNote}
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={disabled}>
          <legend>
            Available tablature {labels.plural}, {supportedItems.length} choices
          </legend>
          <div className="guitar-pro-track-options">
            {supportedItems.map((item) => (
              <label key={item.id} htmlFor={item.id}>
                <input
                  id={item.id}
                  type="radio"
                  name={`${selectorId}-choice`}
                  value={item.id}
                  checked={selectedId === item.id}
                  onChange={() => setSelectedId(item.id)}
                />
                <span>{item.selectionLabel}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p
          id={`${selectorId}-selected-summary`}
          className="guitar-pro-selected-track-summary"
        >
          {selectedTrackSummary}
        </p>
        <button type="submit" disabled={disabled || !selectedItem}>
          {labels.loadAction}
        </button>
      </form>

      {unsupportedItems.length > 0 && (
        <section aria-labelledby={`${selectorId}-unavailable`}>
          <h3 id={`${selectorId}-unavailable`}>
            {labels.unavailableHeading}
          </h3>
          <ul>
            {unsupportedItems.map((item) => (
              <li key={item.id}>
                {item.trackName}, staff {item.staffNumber}: {item.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
});

export default GuitarProTrackSelector;

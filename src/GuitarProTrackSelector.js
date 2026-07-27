import React, { forwardRef, useEffect, useMemo, useState } from "react";

const GuitarProTrackSelector = forwardRef(function GuitarProTrackSelector(
  { inventory, onSubmit, disabled = false },
  headingRef
) {
  const supportedItems = useMemo(
    () => (Array.isArray(inventory?.supportedItems) ? inventory.supportedItems : []),
    [inventory]
  );
  const [selectedId, setSelectedId] = useState(supportedItems[0]?.id || "");

  useEffect(() => {
    setSelectedId(supportedItems[0]?.id || "");
  }, [supportedItems]);

  const selectedItem = supportedItems.find((item) => item.id === selectedId) || null;
  const unsupportedItems = Array.isArray(inventory?.items)
    ? inventory.items.filter((item) => !item.supported)
    : [];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedItem || disabled) return;
    onSubmit?.({
      trackIndex: selectedItem.trackIndex,
      staffIndex: selectedItem.staffIndex,
    });
  };

  return (
    <section
      className="guitar-pro-track-selector"
      aria-labelledby="guitar-pro-track-selector-heading"
    >
      <h2 id="guitar-pro-track-selector-heading" ref={headingRef} tabIndex="-1">
        Choose a Guitar Pro track
      </h2>
      <p>
        This file contains {supportedItems.length} supported tablature {supportedItems.length === 1 ? "track" : "tracks"}. Choose the one to open in Guitar Eyes.
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={disabled}>
          <legend>Available tablature tracks</legend>
          <div className="guitar-pro-track-options">
            {supportedItems.map((item) => (
              <label key={item.id} htmlFor={item.id}>
                <input
                  id={item.id}
                  type="radio"
                  name="guitar-pro-track"
                  value={item.id}
                  checked={selectedId === item.id}
                  onChange={() => setSelectedId(item.id)}
                />
                <span>{item.selectionLabel}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={disabled || !selectedItem}>
          Load selected track
        </button>
      </form>

      {unsupportedItems.length > 0 && (
        <section aria-labelledby="unavailable-guitar-pro-tracks-heading">
          <h3 id="unavailable-guitar-pro-tracks-heading">Other tracks not available</h3>
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

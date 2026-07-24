import React, { forwardRef, useEffect, useState } from "react";
import { describePosition } from "./iphoneTabModel";

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
  }, [document]);

  if (!document || document.positions.length === 0) return null;

  const currentPosition = document.positions[currentIndex];
  const currentMeasure = document.measures[currentPosition.measureIndex];
  const currentDescription = describePosition(document, currentIndex);
  const isFirstPosition = currentIndex === 0;
  const isLastPosition = currentIndex === document.positions.length - 1;
  const isFirstMeasure = currentPosition.measureIndex === 0;
  const isLastMeasure = currentPosition.measureIndex === document.measures.length - 1;

  const announce = (text) => {
    setAnnouncement((current) => ({ text, sequence: current.sequence + 1 }));
  };

  const moveTo = (nextIndex) => {
    setCurrentIndex(nextIndex);
    announce(describePosition(document, nextIndex));
  };

  const moveToMeasure = (measureIndex) => {
    const target = document.measures[measureIndex]?.positions?.[0];
    if (target) moveTo(target.index);
  };

  return (
    <section className="iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>

      <p>
        Navigate synchronized musical positions or jump by measure without placing every
        dash, separator, and source character in the VoiceOver swipe order.
      </p>

      <p className="position-description" id="current-position-description">
        {currentDescription}
      </p>

      <div className="position-controls" aria-describedby="current-position-description">
        <button type="button" onClick={() => moveTo(0)} disabled={isFirstPosition}>
          Start of tablature
        </button>
        <button
          type="button"
          onClick={() => moveToMeasure(currentPosition.measureIndex - 1)}
          disabled={isFirstMeasure}
        >
          Previous measure
        </button>
        <button
          type="button"
          onClick={() => moveTo(currentIndex - 1)}
          disabled={isFirstPosition}
        >
          Previous position
        </button>
        <button
          type="button"
          onClick={() => moveTo(currentIndex + 1)}
          disabled={isLastPosition}
        >
          Next position
        </button>
        <button
          type="button"
          onClick={() => moveToMeasure(currentPosition.measureIndex + 1)}
          disabled={isLastMeasure}
        >
          Next measure
        </button>
        <button type="button" onClick={() => announce(currentDescription)}>
          Read current position
        </button>
      </div>

      <p className="position-count">
        Measure {currentMeasure.number} of {document.measures.length}; position {currentPosition.positionInMeasure} of {currentPosition.positionsInMeasure} in this measure; position {currentIndex + 1} of {document.positions.length} overall.
      </p>

      {document.warnings.length > 0 && (
        <div className="reader-warning" aria-labelledby="reader-warning-heading">
          <h3 id="reader-warning-heading">Parsing notes</h3>
          <ul>
            {document.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement.text && <span key={announcement.sequence}>{announcement.text}</span>}
      </div>
    </section>
  );
});

export default IPhoneTabReader;

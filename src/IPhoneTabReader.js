import React, { forwardRef, useEffect, useState } from "react";
import { describePlayablePosition } from "./positionDescription";

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
  }, [document]);

  if (!document || document.positions.length === 0) {
    return null;
  }

  const currentPosition = document.positions[currentIndex];
  const currentDescription = describePlayablePosition(document, currentIndex);
  const isFirstPosition = currentIndex === 0;
  const isLastPosition = currentIndex === document.positions.length - 1;
  const hasMultipleBlocks = document.blocks.length > 1;
  const isFirstBlock = currentPosition.blockIndex === 0;
  const isLastBlock = currentPosition.blockIndex === document.blocks.length - 1;

  const announce = (text) => {
    setAnnouncement((current) => ({
      text,
      sequence: current.sequence + 1,
    }));
  };

  const moveTo = (nextIndex) => {
    setCurrentIndex(nextIndex);
  };

  const moveToBlock = (nextBlockIndex) => {
    const nextIndex = document.positions.findIndex(
      (position) => position.blockIndex === nextBlockIndex
    );

    if (nextIndex >= 0) {
      moveTo(nextIndex);
    }
  };

  const positionCount = currentPosition.measureNumber
    ? `${
        hasMultipleBlocks
          ? `Block ${currentPosition.blockNumber} of ${document.blocks.length}. `
          : ""
      }Measure ${currentPosition.measureNumber} of ${
        currentPosition.measureCountInBlock
      }${hasMultipleBlocks ? " in this block" : ""}. Position ${
        currentPosition.positionInMeasure
      } of ${currentPosition.positionsInMeasure} in this measure. Overall position ${
        currentIndex + 1
      } of ${document.positions.length}.`
    : hasMultipleBlocks
    ? `Block ${currentPosition.blockNumber} of ${document.blocks.length}. Position ${currentPosition.positionInBlock} of ${currentPosition.positionsInBlock} in this block. Overall position ${currentIndex + 1} of ${document.positions.length}.`
    : `Position ${currentIndex + 1} of ${document.positions.length}`;

  return (
    <section className="iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>

      <p>
        This reader presents synchronized musical positions without placing every dash,
        separator, and source character in the VoiceOver swipe order.
      </p>

      {hasMultipleBlocks && (
        <div className="block-controls">
          <button
            type="button"
            onClick={() => moveToBlock(currentPosition.blockIndex - 1)}
            disabled={isFirstBlock}
          >
            Previous tablature block
          </button>
          <button
            type="button"
            onClick={() => moveToBlock(currentPosition.blockIndex + 1)}
            disabled={isLastBlock}
          >
            Next tablature block
          </button>
        </div>
      )}

      <div className="position-controls">
        <button
          type="button"
          onClick={() => moveTo(currentIndex - 1)}
          disabled={isFirstPosition}
        >
          Previous position
        </button>
        <button type="button" onClick={() => announce(currentDescription)}>
          Read current position
        </button>
        <button
          type="button"
          onClick={() => moveTo(currentIndex + 1)}
          disabled={isLastPosition}
        >
          Next position
        </button>
      </div>

      <p className="position-count">{positionCount}</p>

      <section className="current-position" aria-labelledby="current-position-heading">
        <h3 id="current-position-heading">Current position</h3>
        <p className="position-description" id="current-position-description">
          {currentDescription}
        </p>
      </section>

      {document.warnings.length > 0 && (
        <div className="reader-warning" aria-labelledby="reader-warning-heading">
          <h3 id="reader-warning-heading">Parsing notes</h3>
          <ul>
            {document.warnings.map((warning, index) => (
              <li key={`${index}-${warning}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement.text && (
          <span key={announcement.sequence}>{announcement.text}</span>
        )}
      </div>
    </section>
  );
});

export default IPhoneTabReader;

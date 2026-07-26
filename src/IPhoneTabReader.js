import React, { forwardRef, useEffect, useState } from "react";
import { describePosition } from "./tablatureModel";

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
  }, [document]);

  if (!document || document.positions.length === 0) return null;

  const currentPosition = document.positions[currentIndex] ?? document.positions[0];
  const activeIndex = currentPosition.index;
  const currentDescription = describePosition(document, activeIndex);
  const isFirstPosition = activeIndex === 0;
  const isLastPosition = activeIndex === document.positions.length - 1;
  const isFirstBlock = currentPosition.blockIndex === 0;
  const isLastBlock = currentPosition.blockIndex === document.blocks.length - 1;

  const announce = (text) => {
    setAnnouncement((current) => ({
      text,
      sequence: current.sequence + 1,
    }));
  };

  const moveTo = (nextIndex) => {
    const boundedIndex = Math.max(
      0,
      Math.min(nextIndex, document.positions.length - 1)
    );
    setCurrentIndex(boundedIndex);
    announce(describePosition(document, boundedIndex));
  };

  const moveToBlock = (direction) => {
    const targetBlock = document.blocks[currentPosition.blockIndex + direction];
    const targetPosition = targetBlock?.positions?.[0];
    if (targetPosition) moveTo(targetPosition.index);
  };

  return (
    <section className="semantic-reader iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>

      <p>
        This reader presents the same synchronized musical model used by the desktop
        reader, without placing every dash and source character in the VoiceOver swipe
        order.
      </p>

      <p className="position-description" id="iphone-current-position-description">
        {currentDescription}
      </p>

      <div
        className="position-controls"
        role="group"
        aria-label="Position navigation"
        aria-describedby="iphone-current-position-description"
      >
        <button
          type="button"
          onClick={() => moveTo(activeIndex - 1)}
          disabled={isFirstPosition}
        >
          Previous position
        </button>
        <button type="button" onClick={() => announce(currentDescription)}>
          Read current position
        </button>
        <button
          type="button"
          onClick={() => moveTo(activeIndex + 1)}
          disabled={isLastPosition}
        >
          Next position
        </button>
      </div>

      <p className="position-count">
        Overall position {activeIndex + 1} of {document.positions.length}
      </p>

      {document.blocks.length > 1 && (
        <div
          className="position-controls block-controls"
          role="group"
          aria-label="Tablature block navigation"
          aria-describedby="iphone-current-position-description"
        >
          <button
            type="button"
            onClick={() => moveToBlock(-1)}
            disabled={isFirstBlock}
          >
            Previous tablature block
          </button>
          <button
            type="button"
            onClick={() => moveToBlock(1)}
            disabled={isLastBlock}
          >
            Next tablature block
          </button>
        </div>
      )}

      {document.warnings.length > 0 && (
        <div className="reader-warning" aria-labelledby="iphone-reader-warning-heading">
          <h3 id="iphone-reader-warning-heading">Parsing notes</h3>
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

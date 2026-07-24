import React, { forwardRef, useEffect, useRef, useState } from "react";
import { describePosition } from "./iphoneTabModel";

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const announcementTimerRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement("");
  }, [document]);

  useEffect(
    () => () => {
      if (announcementTimerRef.current) {
        window.clearTimeout(announcementTimerRef.current);
      }
    },
    []
  );

  if (!document || document.positions.length === 0) {
    return null;
  }

  const currentDescription = describePosition(document, currentIndex);
  const isFirstPosition = currentIndex === 0;
  const isLastPosition = currentIndex === document.positions.length - 1;

  const announce = (text) => {
    if (announcementTimerRef.current) {
      window.clearTimeout(announcementTimerRef.current);
    }

    setAnnouncement("");
    announcementTimerRef.current = window.setTimeout(() => {
      setAnnouncement(text);
    }, 30);
  };

  const moveTo = (nextIndex) => {
    setCurrentIndex(nextIndex);
    announce(describePosition(document, nextIndex));
  };

  return (
    <section className="iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>

      <p>
        This proof presents synchronized musical positions without placing every dash,
        separator, and source character in the VoiceOver swipe order.
      </p>

      <p className="position-description" id="current-position-description">
        {currentDescription}
      </p>

      <div className="position-controls" aria-describedby="current-position-description">
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
        <button type="button" onClick={() => announce(currentDescription)}>
          Read current position
        </button>
      </div>

      <p className="position-count">
        Position {currentIndex + 1} of {document.positions.length}
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
        {announcement}
      </div>
    </section>
  );
});

export default IPhoneTabReader;

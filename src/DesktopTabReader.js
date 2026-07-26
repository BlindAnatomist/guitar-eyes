import React, { forwardRef, useEffect, useState } from "react";
import {
  compactStringState,
  describePosition,
  describeStringState,
} from "./tablatureModel";
import { describeNavigationLocation } from "./navigationAnnouncements";

const DesktopTabReader = forwardRef(function DesktopTabReader({ document }, headingRef) {
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
    announce(describeNavigationLocation(document, boundedIndex));
  };

  const moveToBlock = (direction) => {
    const targetBlock = document.blocks[currentPosition.blockIndex + direction];
    const targetPosition = targetBlock?.positions?.[0];
    if (targetPosition) moveTo(targetPosition.index);
  };

  const handleNavigatorKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (!isFirstPosition) moveTo(activeIndex - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (!isLastPosition) moveTo(activeIndex + 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(document.positions.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        announce(currentDescription);
        break;
      default:
        break;
    }
  };

  return (
    <section className="semantic-reader desktop-reader" aria-labelledby="desktop-reader-heading">
      <h2 id="desktop-reader-heading" ref={headingRef} tabIndex="-1">
        Desktop tablature reader
      </h2>

      <p>
        The desktop reader now uses the same synchronized semantic model as the iPhone
        reader. Its tables contain one column per musical position rather than one
        focusable cell per dash or source character.
      </p>

      <p className="position-description" id="desktop-current-position-description">
        {currentDescription}
      </p>

      <div
        className="desktop-keyboard-navigator"
        role="group"
        tabIndex="0"
        aria-label="Position keyboard navigator"
        aria-describedby="desktop-keyboard-help"
        onKeyDown={handleNavigatorKeyDown}
      >
        <p id="desktop-keyboard-help">
          With this navigator focused, use Left and Right Arrow to move, Home and End
          to jump, and Enter to read the current position. Modifier-key combinations
          remain available to VoiceOver and are not intercepted.
        </p>
      </div>

      <div
        className="position-controls"
        role="group"
        aria-label="Position navigation"
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

      <div className="desktop-overview">
        <h3>Semantic tablature overview</h3>
        <p>
          Use standard VoiceOver table navigation to examine strings vertically and
          synchronized positions horizontally.
        </p>

        {document.blocks.map((block) => (
          <section
            className="semantic-block"
            aria-labelledby={`desktop-block-${block.index + 1}-heading`}
            key={`block-${block.index + 1}`}
          >
            <h4 id={`desktop-block-${block.index + 1}-heading`}>
              Tablature block {block.index + 1} of {document.blocks.length}
            </h4>
            <div
              className="semantic-table-scroll"
              role="region"
              aria-label={`Tablature block ${block.index + 1} table`}
              tabIndex="0"
            >
              <table className="semantic-table">
                <caption>
                  Block {block.index + 1}: rows are strings and columns are synchronized
                  musical positions.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">String</th>
                    {block.positions.map((position) => {
                      const isCurrent = position.index === activeIndex;
                      return (
                        <th
                          scope="col"
                          key={`heading-${position.index}`}
                          className={isCurrent ? "current-position-column" : undefined}
                          aria-current={isCurrent ? "true" : undefined}
                        >
                          Measure {position.measureNumber}, position {position.measurePositionNumber}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {block.strings.map((string) => (
                    <tr key={string.id}>
                      <th scope="row">{string.spokenName}</th>
                      {block.positions.map((position) => {
                        const state = position.strings.find(
                          (candidate) => candidate.stringId === string.id
                        );
                        const isCurrent = position.index === activeIndex;
                        return (
                          <td
                            key={`${string.id}-${position.index}`}
                            className={isCurrent ? "current-position-column" : undefined}
                            aria-current={isCurrent ? "true" : undefined}
                            aria-label={`Measure ${position.measureNumber}, position ${position.measurePositionNumber}. ${describeStringState(
                              string,
                              state
                            )}`}
                          >
                            {compactStringState(state)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {document.warnings.length > 0 && (
        <div className="reader-warning" aria-labelledby="desktop-reader-warning-heading">
          <h3 id="desktop-reader-warning-heading">Parsing notes</h3>
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

export default DesktopTabReader;

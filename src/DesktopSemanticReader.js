import React, { forwardRef, useEffect, useState } from "react";
import { describePlayablePosition } from "./positionDescription";

function positionLocation(position, document) {
  const parts = [];

  if (document.blocks.length > 1) {
    parts.push(`Block ${position.blockNumber} of ${document.blocks.length}`);
  }

  if (position.measureNumber) {
    parts.push(`Measure ${position.measureNumber} of ${position.measureCountInBlock}`);
    parts.push(
      `Position ${position.positionInMeasure} of ${position.positionsInMeasure} in this measure`
    );
  } else if (document.blocks.length > 1) {
    parts.push(
      `Position ${position.positionInBlock} of ${position.positionsInBlock} in this block`
    );
  } else {
    parts.push(`Position ${position.number} of ${position.total}`);
  }

  return `${parts.join(". ")}.`;
}

function positionColumnLabel(position) {
  const parts = [];

  if (position.measureNumber) {
    parts.push(`Measure ${position.measureNumber}`);
    parts.push(`position ${position.positionInMeasure}`);
  } else {
    parts.push(`Position ${position.positionInBlock}`);
  }

  if (position.duration?.name) {
    parts.push(position.duration.name);
  }

  return parts.join(", ");
}

function stringStateText(state) {
  if (!state || state.type === "silent") {
    return "Not played";
  }

  switch (state.type) {
    case "fret":
      return `Fret ${state.fret}`;
    case "open":
      return "Open";
    case "continuation":
      return `Continuation of fret ${state.fret}`;
    case "technique":
      return state.name === "muted note" ? "Muted note" : state.name;
    case "unsupported":
      return "Unsupported notation";
    default:
      return "Not played";
  }
}

function sourceLayoutForBlock(block) {
  return block.strings.map((string) => string.sourceLine).join("\n");
}

const DesktopSemanticReader = forwardRef(function DesktopSemanticReader(
  { document },
  headingRef
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
  }, [document]);

  if (!document || document.positions.length === 0) {
    return null;
  }

  const currentPosition = document.positions[currentIndex] ?? document.positions[0];
  const activeIndex = currentPosition.index;
  const currentDescription = describePlayablePosition(document, activeIndex);
  const hasMultipleBlocks = document.blocks.length > 1;
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
  };

  const moveToBlock = (nextBlockIndex) => {
    const nextIndex = document.positions.findIndex(
      (position) => position.blockIndex === nextBlockIndex
    );

    if (nextIndex >= 0) {
      moveTo(nextIndex);
    }
  };

  const handleNavigatorKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

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
    <section
      className="desktop-semantic-reader"
      aria-labelledby="desktop-semantic-reader-heading"
    >
      <h2 id="desktop-semantic-reader-heading" ref={headingRef} tabIndex="-1">
        Desktop tablature reader
      </h2>

      <p>
        This desktop view preserves the spatial string-by-position structure while using
        the same accepted instrument, rhythm, measure, and fingering document as the
        iPhone reader.
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
          With this navigator focused, use Left and Right Arrow to move one synchronized
          position, Home and End to jump, and Enter to read the current position. Guitar
          Eyes does not intercept VoiceOver modifier-key commands here.
        </p>
      </div>

      {hasMultipleBlocks && (
        <div className="block-controls" role="group" aria-label="Tablature block navigation">
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

      <div className="position-controls" role="group" aria-label="Position navigation">
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
        {positionLocation(currentPosition, document)} Overall position {activeIndex + 1} of{" "}
        {document.positions.length}.
      </p>

      <section className="current-position" aria-labelledby="desktop-current-position-heading">
        <h3 id="desktop-current-position-heading">Current position</h3>
        <p className="position-description">{currentDescription}</p>
      </section>

      <div className="desktop-semantic-overview">
        <h3>Semantic tablature overview</h3>
        <p>
          Each row is a string and each column is a synchronized musical position. Use
          standard VoiceOver table navigation to move vertically among strings and
          horizontally among positions.
        </p>

        {document.blocks.map((block) => (
          <section
            className="desktop-semantic-block"
            aria-labelledby={`desktop-block-${block.number}-heading`}
            key={block.number}
          >
            <h4 id={`desktop-block-${block.number}-heading`}>
              Tablature block {block.number} of {document.blocks.length}
            </h4>

            <details className="source-layout-disclosure">
              <summary>Original spatial source layout</summary>
              <pre className="source-layout">{sourceLayoutForBlock(block)}</pre>
            </details>

            <div
              className="semantic-table-scroll"
              role="region"
              aria-label={`Tablature block ${block.number} semantic table`}
              tabIndex="0"
            >
              <table className="semantic-table">
                <caption>
                  Block {block.number}: rows are strings and columns are synchronized
                  musical positions.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">String</th>
                    {block.positions.map((position) => (
                      <th
                        scope="col"
                        key={`position-${position.index}`}
                        className={
                          position.index === activeIndex ? "current-position-column" : undefined
                        }
                        aria-current={position.index === activeIndex ? "true" : undefined}
                      >
                        {positionColumnLabel(position)}
                      </th>
                    ))}
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
                          >
                            {stringStateText(state)}
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

export default DesktopSemanticReader;

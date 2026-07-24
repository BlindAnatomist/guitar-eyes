import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";

export function describeWhatToPlay(document, position) {
  const stringById = new Map(document.strings.map((string) => [string.id, string]));
  const instructions = [];

  [...position.strings].reverse().forEach((state) => {
    const string = stringById.get(state.stringId);
    if (!string) return;

    switch (state.type) {
      case "fret":
        instructions.push(`${string.spokenName}, fret ${state.fret}`);
        break;
      case "open":
        instructions.push(`${string.spokenName}, open`);
        break;
      case "technique":
        instructions.push(`${string.spokenName}, ${state.name} symbol`);
        break;
      case "unsupported":
        instructions.push(`${string.spokenName}, unrecognized symbol`);
        break;
      case "continuation":
        instructions.push(`${string.spokenName}, hold fret ${state.fret}`);
        break;
      default:
        break;
    }
  });

  if (instructions.length === 0) return "Rest. Play nothing.";
  if (instructions.length === 1) return `Play ${instructions[0]}.`;
  return `Play together: ${instructions.join("; ")}.`;
}

export function describeLocation(document, position) {
  return `Measure ${position.measureNumber} of ${document.measures.length}. Step ${position.positionInMeasure} of ${position.positionsInMeasure}.`;
}

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });
  const instructionHeadingRef = useRef(null);
  const pendingInstructionFocusRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
    pendingInstructionFocusRef.current = false;
  }, [document]);

  useLayoutEffect(() => {
    if (!pendingInstructionFocusRef.current) return;
    instructionHeadingRef.current?.focus({ preventScroll: true });
    pendingInstructionFocusRef.current = false;
  }, [currentIndex]);

  if (!document || document.positions.length === 0) return null;

  const currentPosition = document.positions[currentIndex];
  const locationText = describeLocation(document, currentPosition);
  const playingText = describeWhatToPlay(document, currentPosition);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === document.positions.length - 1;

  const announce = (text) => {
    setAnnouncement((current) => ({ text, sequence: current.sequence + 1 }));
  };

  const moveTo = (nextIndex) => {
    pendingInstructionFocusRef.current = true;
    setCurrentIndex(nextIndex);
  };

  return (
    <section className="iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>

      <p>
        Each instruction is one complete musical event. Use Next to move forward, Back to return,
        or Repeat instruction without changing your place.
      </p>

      <section aria-labelledby="current-instruction-heading">
        <h3 id="current-instruction-heading" ref={instructionHeadingRef} tabIndex="-1">
          What to play now
        </h3>
        <p className="position-location">{locationText}</p>
        <p className="position-description">{playingText}</p>
      </section>

      <fieldset className="position-controls">
        <legend>Reading controls</legend>
        <button type="button" onClick={() => moveTo(currentIndex - 1)} disabled={isFirstStep}>
          Back
        </button>
        <button type="button" onClick={() => moveTo(currentIndex + 1)} disabled={isLastStep}>
          Next
        </button>
        <button type="button" onClick={() => announce(`${locationText} ${playingText}`)}>
          Repeat instruction
        </button>
      </fieldset>

      {document.warnings.length > 0 && (
        <details className="reader-warning">
          <summary>Parsing notes</summary>
          <ul>
            {document.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement.text && <span key={announcement.sequence}>{announcement.text}</span>}
      </div>
    </section>
  );
});

export default IPhoneTabReader;

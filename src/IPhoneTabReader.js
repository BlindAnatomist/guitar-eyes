import React, { forwardRef, useEffect, useMemo, useState } from "react";

function describeWhatToPlay(document, position) {
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

  if (instructions.length === 0) return "Rest. Play nothing at this step.";
  return `Play ${instructions.join("; ")}.`;
}

function describeLocation(document, position) {
  return `Measure ${position.measureNumber} of ${document.measures.length}. Step ${position.positionInMeasure} of ${position.positionsInMeasure}.`;
}

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });

  useEffect(() => {
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
  }, [document]);

  if (!document || document.positions.length === 0) return null;

  const currentPosition = document.positions[currentIndex];
  const locationText = describeLocation(document, currentPosition);
  const playingText = useMemo(
    () => describeWhatToPlay(document, currentPosition),
    [document, currentPosition]
  );
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === document.positions.length - 1;
  const isFirstMeasure = currentPosition.measureIndex === 0;
  const isLastMeasure = currentPosition.measureIndex === document.measures.length - 1;

  const announce = (text) => {
    setAnnouncement((current) => ({ text, sequence: current.sequence + 1 }));
  };

  const moveTo = (nextIndex) => {
    const nextPosition = document.positions[nextIndex];
    setCurrentIndex(nextIndex);
    announce(`${describeLocation(document, nextPosition)} ${describeWhatToPlay(document, nextPosition)}`);
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
        The reader first tells you where you are, then what to play. Use step controls for the
        next playable event. Use measure controls to jump to the beginning of another measure.
      </p>

      <section aria-labelledby="current-step-heading">
        <h3 id="current-step-heading">Current step</h3>
        <p className="position-location">{locationText}</p>
        <p className="position-description" id="current-position-description">
          {playingText}
        </p>
      </section>

      <fieldset className="position-controls" aria-describedby="current-position-description">
        <legend>Move one step</legend>
        <button type="button" onClick={() => moveTo(currentIndex - 1)} disabled={isFirstStep}>
          Previous step
        </button>
        <button type="button" onClick={() => moveTo(currentIndex + 1)} disabled={isLastStep}>
          Next step
        </button>
        <button type="button" onClick={() => announce(`${locationText} ${playingText}`)}>
          Repeat current step
        </button>
      </fieldset>

      <fieldset className="measure-controls">
        <legend>Jump by measure</legend>
        <button
          type="button"
          onClick={() => moveToMeasure(currentPosition.measureIndex - 1)}
          disabled={isFirstMeasure}
        >
          Previous measure start
        </button>
        <button
          type="button"
          onClick={() => moveToMeasure(currentPosition.measureIndex + 1)}
          disabled={isLastMeasure}
        >
          Next measure start
        </button>
        <button type="button" onClick={() => moveTo(0)} disabled={isFirstStep}>
          Beginning of tablature
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

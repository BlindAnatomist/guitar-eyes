import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import GuidedPractice from "./GuidedPractice";
import { describeLocation, describeWhatToPlay } from "./tabInstructionSpeech";

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [activity, setActivity] = useState("read");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });
  const instructionHeadingRef = useRef(null);
  const practiceHeadingRef = useRef(null);
  const pendingInstructionFocusRef = useRef(false);

  useEffect(() => {
    setActivity("read");
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

  const announce = (text) => setAnnouncement((current) => ({ text, sequence: current.sequence + 1 }));

  const moveTo = (nextIndex) => {
    pendingInstructionFocusRef.current = true;
    setCurrentIndex(nextIndex);
  };

  const changeActivity = (event) => {
    const nextActivity = event.target.value;
    setActivity(nextActivity);
    window.setTimeout(() => {
      if (nextActivity === "practice") practiceHeadingRef.current?.focus({ preventScroll: true });
      else instructionHeadingRef.current?.focus({ preventScroll: true });
    }, 0);
  };

  return (
    <section className="iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">iPhone tablature reader</h2>

      <fieldset className="iphone-activity-selector">
        <legend>Choose an activity</legend>
        <label>
          <input type="radio" name="iphone-activity" value="read" checked={activity === "read"} onChange={changeActivity} />
          Read tablature
        </label>
        <label>
          <input type="radio" name="iphone-activity" value="practice" checked={activity === "practice"} onChange={changeActivity} />
          Guided practice
        </label>
      </fieldset>

      {activity === "practice" ? (
        <GuidedPractice document={document} ref={practiceHeadingRef} />
      ) : (
        <>
          <p>Each instruction is one complete musical event. Use Next to move forward, Back to return, or Repeat instruction without changing your place.</p>
          <section aria-labelledby="current-instruction-heading">
            <h3 id="current-instruction-heading" ref={instructionHeadingRef} tabIndex="-1">What to play now</h3>
            <p className="position-location">{locationText}</p>
            <p className="position-description">{playingText}</p>
          </section>
          <fieldset className="position-controls">
            <legend>Reading controls</legend>
            <button type="button" onClick={() => moveTo(currentIndex - 1)} disabled={isFirstStep}>Back</button>
            <button type="button" onClick={() => moveTo(currentIndex + 1)} disabled={isLastStep}>Next</button>
            <button type="button" onClick={() => announce(`${locationText} ${playingText}`)}>Repeat instruction</button>
          </fieldset>
          {document.warnings.length > 0 && (
            <details className="reader-warning">
              <summary>Parsing notes</summary>
              <ul>{document.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            </details>
          )}
          <div className="visually-hidden" aria-live="polite" aria-atomic="true">
            {announcement.text && <span key={announcement.sequence}>{announcement.text}</span>}
          </div>
        </>
      )}
    </section>
  );
});

export default IPhoneTabReader;

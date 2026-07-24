import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { describeLocation, describeWhatToPlay } from "./tabInstructionSpeech";

const GuidedPractice = forwardRef(function GuidedPractice({ document }, headingRef) {
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });
  const instructionHeadingRef = useRef(null);
  const completionHeadingRef = useRef(null);
  const pendingFocusRef = useRef(null);

  useEffect(() => {
    setStarted(false);
    setComplete(false);
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
    pendingFocusRef.current = null;
  }, [document]);

  useLayoutEffect(() => {
    if (pendingFocusRef.current === "instruction") instructionHeadingRef.current?.focus({ preventScroll: true });
    if (pendingFocusRef.current === "complete") completionHeadingRef.current?.focus({ preventScroll: true });
    pendingFocusRef.current = null;
  }, [started, complete, currentIndex]);

  if (!document || document.positions.length === 0) return null;

  const currentPosition = document.positions[currentIndex];
  const locationText = describeLocation(document, currentPosition);
  const playingText = describeWhatToPlay(document, currentPosition);

  const announce = (text) => setAnnouncement((current) => ({ text, sequence: current.sequence + 1 }));

  const startPractice = () => {
    pendingFocusRef.current = "instruction";
    setCurrentIndex(0);
    setComplete(false);
    setStarted(true);
  };

  const moveBack = () => {
    pendingFocusRef.current = "instruction";
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const confirmPlayed = () => {
    if (currentIndex === document.positions.length - 1) {
      pendingFocusRef.current = "complete";
      setComplete(true);
      return;
    }
    pendingFocusRef.current = "instruction";
    setCurrentIndex((index) => index + 1);
  };

  const restartPractice = () => {
    pendingFocusRef.current = "instruction";
    setCurrentIndex(0);
    setComplete(false);
  };

  return (
    <section className="guided-practice" aria-labelledby="guided-practice-heading">
      <h3 id="guided-practice-heading" ref={headingRef} tabIndex="-1">Guided practice</h3>

      {!started ? (
        <>
          <p>Practice one complete musical event at a time. After playing it, choose Played it to receive the next instruction.</p>
          <button type="button" onClick={startPractice}>Begin guided practice</button>
        </>
      ) : complete ? (
        <section aria-labelledby="practice-complete-heading">
          <h4 id="practice-complete-heading" ref={completionHeadingRef} tabIndex="-1">Practice complete</h4>
          <p>You completed all {document.positions.length} instructions.</p>
          <button type="button" onClick={restartPractice}>Practice again from the beginning</button>
        </section>
      ) : (
        <>
          <section aria-labelledby="practice-instruction-heading">
            <h4 id="practice-instruction-heading" ref={instructionHeadingRef} tabIndex="-1">Practice instruction</h4>
            <p className="practice-progress">{currentIndex} of {document.positions.length} instructions completed.</p>
            <p className="position-location">{locationText}</p>
            <p className="position-description">{playingText}</p>
          </section>
          <fieldset className="practice-controls">
            <legend>Practice controls</legend>
            <button type="button" onClick={moveBack} disabled={currentIndex === 0}>Back one instruction</button>
            <button type="button" onClick={confirmPlayed}>{currentIndex === document.positions.length - 1 ? "Played it — finish practice" : "Played it — next instruction"}</button>
            <button type="button" onClick={() => announce(`${locationText} ${playingText}`)}>Repeat instruction</button>
            <button type="button" onClick={restartPractice} disabled={currentIndex === 0}>Restart from the beginning</button>
          </fieldset>
        </>
      )}

      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement.text && <span key={announcement.sequence}>{announcement.text}</span>}
      </div>
    </section>
  );
});

export default GuidedPractice;

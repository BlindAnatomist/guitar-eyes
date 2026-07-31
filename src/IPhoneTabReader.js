import React, { forwardRef, useEffect, useRef, useState } from "react";
import { installFirstAuditionFocusGuard } from "./firstAuditionFocusGuard";
import { describePlayablePosition } from "./positionDescription";
import { buildPositionSoundEvents } from "./positionSoundEvents";
import { createPositionAuditioner } from "./proceduralPluckedString";

export const AUDIBLE_PROOF_LABEL =
  "Guitar Eyes procedural timbre quality proof 1H";

export function resolveReaderPositionIndex(activeDocument, nextDocument, currentIndex) {
  if (!nextDocument || nextDocument.positions.length === 0) {
    return 0;
  }

  if (activeDocument !== nextDocument) {
    return 0;
  }

  return Math.min(
    Math.max(0, currentIndex),
    nextDocument.positions.length - 1
  );
}

const IPhoneTabReader = forwardRef(function IPhoneTabReader({ document }, headingRef) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcement, setAnnouncement] = useState({ text: "", sequence: 0 });
  const [auditionStatus, setAuditionStatus] = useState("");
  const [auditionDelaySeconds, setAuditionDelaySeconds] = useState(2);
  const auditionerRef = useRef(null);
  const auditionButtonRef = useRef(null);
  const firstAuditionFocusGuardCleanupRef = useRef(null);
  const activeDocumentRef = useRef(document);

  const clearFirstAuditionFocusGuard = () => {
    const cleanup = firstAuditionFocusGuardCleanupRef.current;
    firstAuditionFocusGuardCleanupRef.current = null;
    cleanup?.();
  };

  useEffect(() => {
    activeDocumentRef.current = document;
    setCurrentIndex(0);
    setAnnouncement({ text: "", sequence: 0 });
    setAuditionStatus("");
    clearFirstAuditionFocusGuard();
    const priorAuditioner = auditionerRef.current;
    auditionerRef.current = null;
    void priorAuditioner?.dispose();
  }, [document]);

  useEffect(
    () => () => {
      clearFirstAuditionFocusGuard();
      const priorAuditioner = auditionerRef.current;
      auditionerRef.current = null;
      void priorAuditioner?.dispose();
    },
    []
  );

  if (!document || document.positions.length === 0) {
    return null;
  }

  const resolvedCurrentIndex = resolveReaderPositionIndex(
    activeDocumentRef.current,
    document,
    currentIndex
  );
  const currentPosition = document.positions[resolvedCurrentIndex];
  const currentDescription = describePlayablePosition(document, resolvedCurrentIndex);
  const isFirstPosition = resolvedCurrentIndex === 0;
  const isLastPosition = resolvedCurrentIndex === document.positions.length - 1;
  const hasMultipleBlocks = document.blocks.length > 1;
  const isFirstBlock = currentPosition.blockIndex === 0;
  const isLastBlock = currentPosition.blockIndex === document.blocks.length - 1;

  const announce = (text) => {
    setAnnouncement((current) => ({
      text,
      sequence: current.sequence + 1,
    }));
  };

  const clearAnnouncement = () => {
    setAnnouncement((current) => ({ text: "", sequence: current.sequence }));
  };

  const stopAuditionQuietly = () => {
    auditionerRef.current?.stop();
    setAuditionStatus("");
  };

  const moveTo = (nextIndex) => {
    stopAuditionQuietly();
    clearAnnouncement();
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

  const changeAuditionDelay = (event) => {
    const nextDelay = Number(event.target.value);
    clearFirstAuditionFocusGuard();
    const priorAuditioner = auditionerRef.current;
    auditionerRef.current = null;
    void priorAuditioner?.dispose();
    setAuditionStatus("");
    setAuditionDelaySeconds(nextDelay);
  };

  const auditionCurrentPosition = async () => {
    clearAnnouncement();

    try {
      const soundEvents = buildPositionSoundEvents(document, resolvedCurrentIndex);
      const isFirstAudition = !auditionerRef.current;
      if (isFirstAudition) {
        auditionerRef.current = createPositionAuditioner({
          startDelaySeconds: auditionDelaySeconds,
        });

        clearFirstAuditionFocusGuard();
        const readerHeading =
          headingRef && typeof headingRef === "object" ? headingRef.current : null;
        firstAuditionFocusGuardCleanupRef.current = installFirstAuditionFocusGuard({
          button: auditionButtonRef.current,
          readerHeading,
        });
      }
      const result = await auditionerRef.current.audition(soundEvents);

      if (result.outcome === "rest") {
        const message = "Current position is a rest. No pitched sound was played.";
        setAuditionStatus(message);
        announce(message);
        return;
      }

      const pitched = result.pitchedEventCount;
      const muted = result.mutedEventCount;
      const parts = [];
      if (pitched > 0) {
        parts.push(`${pitched} pitched ${pitched === 1 ? "string" : "strings"}`);
      }
      if (muted > 0) {
        parts.push(`${muted} muted ${muted === 1 ? "string" : "strings"}`);
      }
      setAuditionStatus(
        `Auditioned current position with ${parts.join(" and ")}.`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The current position could not be auditioned.";
      setAuditionStatus(message);
      announce(message);
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
        resolvedCurrentIndex + 1
      } of ${document.positions.length}.`
    : hasMultipleBlocks
    ? `Block ${currentPosition.blockNumber} of ${document.blocks.length}. Position ${currentPosition.positionInBlock} of ${currentPosition.positionsInBlock} in this block. Overall position ${resolvedCurrentIndex + 1} of ${document.positions.length}.`
    : `Position ${resolvedCurrentIndex + 1} of ${document.positions.length}`;

  return (
    <section className="iphone-reader" aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>

      <p className="audible-proof-label">Test build: {AUDIBLE_PROOF_LABEL}.</p>

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

      <div className="audition-delay-control">
        <label htmlFor="audition-delay">Sound delay</label>
        <select
          id="audition-delay"
          value={auditionDelaySeconds}
          onChange={changeAuditionDelay}
        >
          <option value="1">1 second</option>
          <option value="2">2 seconds</option>
          <option value="3">3 seconds</option>
          <option value="4">4 seconds</option>
        </select>
        <p>
          Choose enough time for VoiceOver to finish repeating the button name before the
          guitar sound begins.
        </p>
      </div>

      <div
        className="position-controls"
        role="group"
        aria-label="Position navigation"
      >
        <button
          type="button"
          onClick={() => moveTo(resolvedCurrentIndex - 1)}
          disabled={isFirstPosition}
        >
          Previous position
        </button>
        <button type="button" onClick={() => announce(currentDescription)}>
          Read current position
        </button>
        <button
          type="button"
          onClick={() => moveTo(resolvedCurrentIndex + 1)}
          disabled={isLastPosition}
        >
          Next position
        </button>
      </div>

      <div
        className="audition-controls"
        role="group"
        aria-label="Position audio"
      >
        <button
          ref={auditionButtonRef}
          type="button"
          onClick={auditionCurrentPosition}
        >
          Audition current position
        </button>
      </div>

      <p className="audition-status" id="audition-status">
        {auditionStatus}
      </p>

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

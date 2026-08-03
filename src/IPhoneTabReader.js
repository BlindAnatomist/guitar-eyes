import React, { forwardRef, useEffect, useRef, useState } from "react";
import { installFirstAuditionFocusGuard } from "./firstAuditionFocusGuard";
import { describePlayablePosition } from "./positionDescription";
import { buildPositionSoundEvents } from "./positionSoundEvents";
import { createPositionAuditioner } from "./sampleAwarePositionAuditioner";

export const AUDIBLE_PROOF_LABEL =
  "Guitar Eyes Iowa sample integrity and focus proof 1K";

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

  const currentPosition = document.positions[currentIndex];
  const atFirstPosition = currentIndex === 0;
  const atLastPosition = currentIndex === document.positions.length - 1;

  const moveToPosition = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= document.positions.length) {
      return;
    }
    clearFirstAuditionFocusGuard();
    setCurrentIndex(nextIndex);
    setAuditionStatus("");
  };

  const announceCurrentPosition = () => {
    clearFirstAuditionFocusGuard();
    setAnnouncement((current) => ({
      text: describePlayablePosition(currentPosition),
      sequence: current.sequence + 1,
    }));
  };

  const auditionCurrentPosition = async () => {
    clearFirstAuditionFocusGuard();
    firstAuditionFocusGuardCleanupRef.current = installFirstAuditionFocusGuard({
      button: auditionButtonRef.current,
      readerHeading: headingRef?.current,
    });

    try {
      if (!auditionerRef.current) {
        auditionerRef.current = createPositionAuditioner();
      }
      const soundEvents = buildPositionSoundEvents(currentPosition);
      const result = await auditionerRef.current.audition(soundEvents, {
        delaySeconds: auditionDelaySeconds,
      });
      const pitched = result.pitchedPlayed || 0;
      const muted = result.mutedPlayed || 0;
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
      if (error?.code === "POSITION_REST") {
        setAuditionStatus("Current position is a rest. No pitched sound was played.");
      } else {
        setAuditionStatus(
          error instanceof Error
            ? `Could not audition current position. ${error.message}`
            : "Could not audition current position."
        );
      }
    }
  };

  return (
    <section aria-labelledby="iphone-reader-heading">
      <h2 id="iphone-reader-heading" ref={headingRef} tabIndex="-1">
        iPhone tablature reader
      </h2>
      <p className="test-build-label">{AUDIBLE_PROOF_LABEL}</p>
      <p aria-live="polite" aria-atomic="true">
        {announcement.text}
      </p>
      <p aria-live="polite" aria-atomic="true">
        {auditionStatus}
      </p>
      <p>
        Position {currentIndex + 1} of {document.positions.length}
      </p>
      <p>{describePlayablePosition(currentPosition)}</p>
      <div role="group" aria-label="Position navigation">
        <button
          type="button"
          onClick={() => moveToPosition(currentIndex - 1)}
          disabled={atFirstPosition}
        >
          Previous position
        </button>
        <button type="button" onClick={announceCurrentPosition}>
          Read current position
        </button>
        <button
          type="button"
          onClick={() => moveToPosition(currentIndex + 1)}
          disabled={atLastPosition}
        >
          Next position
        </button>
      </div>
      <div role="group" aria-label="Current position sound">
        <label htmlFor="audition-delay-seconds">Sound delay</label>
        <select
          id="audition-delay-seconds"
          value={auditionDelaySeconds}
          onChange={(event) => setAuditionDelaySeconds(Number(event.target.value))}
        >
          <option value={0}>No delay</option>
          <option value={1}>1 second</option>
          <option value={2}>2 seconds</option>
          <option value={3}>3 seconds</option>
        </select>
        <p>
          Waits after activation so VoiceOver can finish repeating the button name.
        </p>
        <button
          ref={auditionButtonRef}
          id="audition-current-position"
          type="button"
          onClick={auditionCurrentPosition}
        >
          Audition current position
        </button>
      </div>
    </section>
  );
});

export default IPhoneTabReader;

import React from "react";
import { createSessionPassageMark, resolveSessionPassageMark, useSessionPassageMark } from "./sessionPassageMark";

export default function PassageControls({ document, currentIndex, passageMark, onMove, onQuietAction }) {
  // App supplies one controller across modes; standalone readers stay session-local.
  const localPassageMark = useSessionPassageMark(document);
  const controller = passageMark || localPassageMark;
  const currentTarget = createSessionPassageMark(document, currentIndex);
  const markedIndex = resolveSessionPassageMark(document, controller.mark);

  const returnToMark = () => {
    const target = resolveSessionPassageMark(document, controller.mark);
    if (target === null) return;
    onQuietAction();
    onMove(target);
  };

  return (
    <>
      <div className="position-controls" role="group" aria-label="Passage navigation">
        <button type="button" disabled={!currentTarget} onClick={() => {
          onQuietAction();
          controller.markPosition(currentIndex);
        }}>
          Mark current position
        </button>
        <button type="button" disabled={markedIndex === null} onClick={returnToMark}>
          Return to mark
        </button>
        <button type="button" onClick={() => {
          onQuietAction();
          onMove(0);
        }}>
          Go to beginning
        </button>
      </div>
      <p className="passage-mark-status">
        {markedIndex === null
          ? "No position marked."
          : `Marked overall position ${markedIndex + 1} of ${document.positions.length}.`}
      </p>
      <p>One mark for the loaded file. Loading a file again clears it.</p>
    </>
  );
}

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createTeacherLesson, resolveTeacherEvidence } from "./teacherPatterns";

export default function TeacherLesson({ document, onInspect, onQuietAction }) {
  const lesson = useMemo(() => createTeacherLesson(document), [document]);
  const [location, setLocation] = useState({ document, view: "closed", evidenceId: null });
  const current = location.document === document ? location : { document, view: "closed", evidenceId: null };
  const openRef = useRef(null);
  const headingRef = useRef(null);
  const evidenceButtons = useRef({});
  const focusTarget = useRef(null);
  useLayoutEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target?.document !== document) return;
    if (target.kind === "heading") headingRef.current?.focus();
    else if (target.kind === "open") openRef.current?.focus();
    else evidenceButtons.current[target.kind]?.focus();
  });
  const move = (view, evidenceId, focus) => {
    onQuietAction();
    focusTarget.current = focus ? { document, kind: focus } : null;
    setLocation({ document, view, evidenceId });
  };
  return (
    <section className="teacher-lesson" aria-label="Pattern teacher prototype">
      {current.view === "closed" && <button type="button" ref={openRef} onClick={() => move("lesson", null, "heading")}>Open pattern lesson</button>}
      {current.view === "inspect" && (
        <>
          <p>Lesson evidence: {lesson.evidence?.find((item) => item.id === current.evidenceId)?.label}. Navigation is quiet. Use Read current position for the playing details.</p>
          <button type="button" onClick={() => move("lesson", current.evidenceId, current.evidenceId)}>Return to pattern lesson</button>
        </>
      )}
      {current.view === "lesson" && (
        <>
          <h3 tabIndex="-1" ref={headingRef}>Pattern and changed ending</h3>
          {lesson.status === "available" ? (
            <>
              <p>This original example has three explicit measures. A measure is a written unit, not an inferred phrase.</p>
              {lesson.claims.map((claim, index) => <p key={index}>{claim.text}</p>)}
              <h4>Shared opening</h4>
              <p>Learn these positions once for all three measures. Notes within one position are played together.</p>
              <ol>{lesson.opening.map((position, index) => <li key={index}>{position.text}</li>)}</ol>
              <h4>The two endings</h4>
              {lesson.endings.map((ending, index) => <p key={index}>{ending.text}</p>)}
              <h4>Suggested rehearsal order</h4>
              <ol>{lesson.practice.map((step) => <li key={step}>{step}</li>)}</ol>
              <p>This is a practice suggestion. Guitar Eyes does not listen to or assess your playing.</p>
              <div className="teacher-evidence-controls" role="group" aria-label="Inspect lesson evidence">
                {lesson.evidence.map((item) => <button type="button" key={item.id} ref={(node) => { evidenceButtons.current[item.id] = node; }} onClick={() => {
                  const index = resolveTeacherEvidence(document, item.references[0]);
                  if (index === null) return;
                  move("inspect", item.id, null);
                  onInspect(index);
                }}>{item.label}</button>)}
              </div>
              <p>Teaching is limited to this reviewed example. The existing reader remains the source for playing instructions.</p>
            </>
          ) : <p>{lesson.reason}</p>}
          <button type="button" onClick={() => move("closed", null, "open")}>Close pattern lesson</button>
        </>
      )}
    </section>
  );
}

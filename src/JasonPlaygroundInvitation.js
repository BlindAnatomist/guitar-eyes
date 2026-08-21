import React from "react";

function JasonPlaygroundInvitation({ onStart }) {
  return (
    <section
      className="jason-playground"
      aria-labelledby="jason-playground-heading"
    >
      <h2 id="jason-playground-heading">Jason&apos;s Guitar Eyes playground</h2>
      <p>
        A short original C, G, A minor, F chord passage is already inside Guitar
        Eyes. No download, file picker, or setup is required.
      </p>
      <button type="button" onClick={onStart}>
        Start the Guitar Eyes demo
      </button>
    </section>
  );
}

export default JasonPlaygroundInvitation;

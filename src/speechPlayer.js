// Only one sequence may speak at a time. Invalidate callbacks before cancel(),
// since browsers can deliver a late end/error event after cancellation.
export function createSpeechPlayer(synth, Utterance, onStatus = () => {}) {
  let generation = 0;
  let active = false;
  let currentUtterance = null;
  const stop = () => {
    generation++;
    if (active) synth?.cancel();
    active = false;
    currentUtterance = null;
  };
  const read = (contents) => {
    stop();
    if (!synth || !Utterance) {
      onStatus("Read-aloud is not available in this browser.");
      return;
    }
    if (!contents.length) return;
    const sequence = generation;
    active = true;
    onStatus("Reading the selected group. Press Escape to stop.");
    const speakNext = (index) => {
      if (!active || sequence !== generation) return;
      if (index >= contents.length) {
        active = false;
        currentUtterance = null;
        onStatus("Finished reading the selected group.");
        return;
      }
      currentUtterance = new Utterance(contents[index]);
      currentUtterance.onend = () => speakNext(index + 1);
      currentUtterance.onerror = () => {
        if (sequence !== generation) return;
        stop();
        onStatus("Read-aloud was interrupted. Press Enter to try again.");
      };
      try {
        synth.speak(currentUtterance);
      } catch (error) {
        stop();
        onStatus("Read-aloud could not start. Press Enter to try again.");
      }
    };
    speakNext(0);
  };
  return { read, stop };
}

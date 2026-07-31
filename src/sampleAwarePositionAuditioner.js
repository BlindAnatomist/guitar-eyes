import { canUseIowaSamples, createIowaSampleAuditioner } from "./iowaSampleAuditioner";
import { createPositionAuditioner as createProceduralAuditioner } from "./proceduralPluckedString";

export function createPositionAuditioner(options = {}) {
  const procedural = createProceduralAuditioner(options);
  let sampled;
  let activeEngine = "none";

  function sampledAuditioner() {
    if (!sampled) {
      sampled = createIowaSampleAuditioner(options);
    }
    return sampled;
  }

  async function audition(soundEvents) {
    if (canUseIowaSamples(soundEvents)) {
      procedural.stop();
      activeEngine = "iowa-sampled";
      return sampledAuditioner().audition(soundEvents);
    }

    if (sampled) sampled.stop();
    activeEngine = "procedural-fallback";
    const result = await procedural.audition(soundEvents);
    const fallbackCount = Array.isArray(soundEvents && soundEvents.events)
      ? soundEvents.events.filter((event) => event && event.type === "pitched-string").length
      : 0;
    return Object.assign({}, result, {
      sampledEventCount: 0,
      proceduralFallbackCount: fallbackCount,
    });
  }

  function stop() {
    if (sampled) sampled.stop();
    procedural.stop();
    activeEngine = "none";
  }

  async function dispose() {
    if (sampled) await sampled.dispose();
    await procedural.dispose();
    sampled = undefined;
    activeEngine = "disposed";
  }

  function state() {
    return {
      activeEngine,
      sampled: sampled ? sampled.state() : null,
      procedural: procedural.state ? procedural.state() : null,
    };
  }

  return { audition, stop, dispose, state };
}

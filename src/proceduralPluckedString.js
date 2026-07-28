export class AudiblePlaybackError extends Error {
  constructor(message, code = "AUDIBLE_PLAYBACK_ERROR") {
    super(message);
    this.name = "AudiblePlaybackError";
    this.code = code;
  }
}

const MIN_SOUND_SECONDS = 0.08;
const MAX_SOUND_SECONDS = 2.5;
const START_DELAY_SECONDS = 0.01;

function defaultAudioContextFactory() {
  const AudioContextConstructor =
    globalThis.AudioContext || globalThis.webkitAudioContext;
  if (typeof AudioContextConstructor !== "function") {
    throw new AudiblePlaybackError(
      "This browser does not provide the Web Audio API required for the sound proof.",
      "WEB_AUDIO_UNAVAILABLE"
    );
  }
  return new AudioContextConstructor();
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function safeDisconnect(node) {
  try {
    node?.disconnect?.();
  } catch {
    // A node may already be disconnected after its source ends.
  }
}

function validateSoundEvents(soundEvents) {
  if (
    !soundEvents ||
    soundEvents.type !== "position-sound-events" ||
    !Array.isArray(soundEvents.events) ||
    !Number.isFinite(soundEvents.durationMilliseconds) ||
    soundEvents.durationMilliseconds <= 0
  ) {
    throw new AudiblePlaybackError(
      "The current position does not contain a valid sound-event description.",
      "INVALID_AUDITION_EVENTS"
    );
  }

  soundEvents.events.forEach((event) => {
    if (event?.type === "pitched-string") {
      if (
        !Number.isFinite(event.frequencyHz) ||
        event.frequencyHz <= 0 ||
        !Number.isInteger(event.midi) ||
        event.midi < 0 ||
        event.midi > 127
      ) {
        throw new AudiblePlaybackError(
          "A pitched-string event contains an invalid frequency or MIDI pitch.",
          "INVALID_AUDITION_PITCH"
        );
      }
      return;
    }

    if (event?.type !== "muted-string") {
      throw new AudiblePlaybackError(
        "The sound proof received an unsupported event type.",
        "UNSUPPORTED_AUDITION_EVENT"
      );
    }
  });
}

function createPluckedBuffer(context, event, random) {
  const sampleRate = context.sampleRate;
  const durationSeconds = clamp(
    event.durationMilliseconds / 1000,
    MIN_SOUND_SECONDS,
    MAX_SOUND_SECONDS
  );
  const sampleCount = Math.max(2, Math.ceil(sampleRate * durationSeconds));
  const delaySamples = Math.max(2, Math.round(sampleRate / event.frequencyHz));
  const buffer = context.createBuffer(1, sampleCount, sampleRate);
  const samples = buffer.getChannelData(0);
  const excitationLength = Math.min(delaySamples, sampleCount);

  for (let index = 0; index < excitationLength; index += 1) {
    samples[index] = (random() * 2 - 1) * 0.6;
  }

  const damping = event.midi < 45 ? 0.997 : event.midi > 76 ? 0.992 : 0.995;
  for (let index = delaySamples; index < sampleCount; index += 1) {
    const first = samples[index - delaySamples];
    const second = samples[Math.max(0, index - delaySamples - 1)];
    samples[index] = (first + second) * 0.5 * damping;
  }

  return buffer;
}

function createMutedBuffer(context, random) {
  const sampleRate = context.sampleRate;
  const sampleCount = Math.max(2, Math.ceil(sampleRate * 0.045));
  const buffer = context.createBuffer(1, sampleCount, sampleRate);
  const samples = buffer.getChannelData(0);

  for (let index = 0; index < sampleCount; index += 1) {
    const envelope = 1 - index / sampleCount;
    samples[index] = (random() * 2 - 1) * envelope * envelope * 0.35;
  }

  return buffer;
}

function configureMaster(context) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.72, context.currentTime);

  if (typeof context.createDynamicsCompressor !== "function") {
    gain.connect(context.destination);
    return { input: gain, gain, compressor: null };
  }

  const compressor = context.createDynamicsCompressor();
  compressor.threshold?.setValueAtTime?.(-18, context.currentTime);
  compressor.knee?.setValueAtTime?.(12, context.currentTime);
  compressor.ratio?.setValueAtTime?.(6, context.currentTime);
  compressor.attack?.setValueAtTime?.(0.003, context.currentTime);
  compressor.release?.setValueAtTime?.(0.18, context.currentTime);
  gain.connect(compressor);
  compressor.connect(context.destination);
  return { input: gain, gain, compressor };
}

export function createPositionAuditioner({
  audioContextFactory = defaultAudioContextFactory,
  random = Math.random,
} = {}) {
  let context = null;
  let master = null;
  let disposed = false;
  const activeVoices = new Set();

  function releaseVoice(voice) {
    activeVoices.delete(voice);
    safeDisconnect(voice.source);
    safeDisconnect(voice.gain);
  }

  function stop() {
    activeVoices.forEach((voice) => {
      try {
        voice.source.stop(0);
      } catch {
        // A source can be stopped only once.
      }
      releaseVoice(voice);
    });
    activeVoices.clear();
  }

  async function ensureContext() {
    if (disposed) {
      throw new AudiblePlaybackError(
        "The sound proof has already been disposed.",
        "AUDITIONER_DISPOSED"
      );
    }

    if (!context) {
      context = audioContextFactory();
      if (!context || typeof context.createBufferSource !== "function") {
        throw new AudiblePlaybackError(
          "The browser returned an incomplete Web Audio context.",
          "WEB_AUDIO_UNAVAILABLE"
        );
      }
      master = configureMaster(context);
    }

    if (context.state === "suspended" && typeof context.resume === "function") {
      await context.resume();
    }

    if (context.state === "closed") {
      throw new AudiblePlaybackError(
        "The browser audio context is closed.",
        "WEB_AUDIO_CONTEXT_CLOSED"
      );
    }

    return context;
  }

  function scheduleVoice(buffer, when, gainValue) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(gainValue, when + 0.004);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      when + Math.max(MIN_SOUND_SECONDS, buffer.duration)
    );
    source.connect(gain);
    gain.connect(master.input);

    const voice = { source, gain };
    activeVoices.add(voice);
    source.onended = () => releaseVoice(voice);
    source.start(when);
    source.stop(when + Math.max(MIN_SOUND_SECONDS, buffer.duration) + 0.02);
  }

  async function audition(soundEvents) {
    validateSoundEvents(soundEvents);
    stop();

    if (soundEvents.isRest) {
      return {
        outcome: "rest",
        pitchedEventCount: 0,
        mutedEventCount: 0,
        activeVoiceCount: 0,
        contextState: context?.state || "uninitialized",
      };
    }

    await ensureContext();
    const pitchedEvents = soundEvents.events.filter(
      (event) => event.type === "pitched-string"
    );
    const mutedEvents = soundEvents.events.filter(
      (event) => event.type === "muted-string"
    );
    const onset = context.currentTime + START_DELAY_SECONDS;
    const pitchedGain = clamp(
      0.42 / Math.sqrt(Math.max(1, pitchedEvents.length)),
      0.12,
      0.42
    );

    pitchedEvents.forEach((event) => {
      scheduleVoice(createPluckedBuffer(context, event, random), onset, pitchedGain);
    });
    mutedEvents.forEach(() => {
      scheduleVoice(createMutedBuffer(context, random), onset, 0.2);
    });

    return {
      outcome: "auditioned",
      pitchedEventCount: pitchedEvents.length,
      mutedEventCount: mutedEvents.length,
      activeVoiceCount: activeVoices.size,
      contextState: context.state,
    };
  }

  async function dispose() {
    if (disposed) return;
    stop();
    safeDisconnect(master?.gain);
    safeDisconnect(master?.compressor);
    if (context && context.state !== "closed" && typeof context.close === "function") {
      await context.close();
    }
    master = null;
    context = null;
    disposed = true;
  }

  function state() {
    return {
      disposed,
      contextState: context?.state || "uninitialized",
      activeVoiceCount: activeVoices.size,
    };
  }

  return { audition, stop, dispose, state };
}

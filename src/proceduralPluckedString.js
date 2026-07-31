export class AudiblePlaybackError extends Error {
  constructor(message, code = "AUDIBLE_PLAYBACK_ERROR") {
    super(message);
    this.name = "AudiblePlaybackError";
    this.code = code;
  }
}

const MIN_SOUND_SECONDS = 0.08;
const MAX_SOUND_SECONDS = 2.5;
const DEFAULT_START_DELAY_SECONDS = 0.65;
const MIN_START_DELAY_SECONDS = 0.5;
const MAX_START_DELAY_SECONDS = 5;
const BODY_FILTER_SPECS = [
  { type: "highpass", frequencyHz: 42, q: 0.7 },
  { type: "peaking", frequencyHz: 110, q: 1.05, gainDb: 2.4 },
  { type: "peaking", frequencyHz: 220, q: 1.35, gainDb: 1.6 },
  { type: "lowpass", frequencyHz: 5200, q: 0.65 },
];

function defaultAudioContextFactory() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
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

function validateStartDelaySeconds(value) {
  if (
    !Number.isFinite(value) ||
    value < MIN_START_DELAY_SECONDS ||
    value > MAX_START_DELAY_SECONDS
  ) {
    throw new AudiblePlaybackError(
      "The sound delay must be between one half second and five seconds.",
      "INVALID_AUDITION_DELAY"
    );
  }

  return value;
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

export function buildProceduralStringProfile(event) {
  if (
    !event ||
    event.type !== "pitched-string" ||
    !Number.isFinite(event.frequencyHz) ||
    event.frequencyHz <= 0 ||
    !Number.isInteger(event.midi)
  ) {
    throw new AudiblePlaybackError(
      "A procedural string profile requires one valid pitched-string event.",
      "INVALID_TIMBRE_EVENT"
    );
  }

  const stringIndex = Number.isInteger(event.stringIndex)
    ? clamp(event.stringIndex, 0, 7)
    : 3;
  const stringDepth = clamp(stringIndex / 5, 0, 1);
  const pitchDepth = clamp((64 - event.midi) / 36, 0, 1);
  const warmth = clamp(stringDepth * 0.48 + pitchDepth * 0.52, 0, 1);
  const brightness = 1 - warmth;

  return {
    warmth,
    excitationSmoothing: clamp(0.48 + warmth * 0.28, 0.48, 0.76),
    pickPosition: clamp(0.18 + stringDepth * 0.07, 0.18, 0.25),
    pickTransientGain: clamp(0.105 - warmth * 0.032, 0.073, 0.105),
    loopBlend: clamp(0.43 + warmth * 0.1, 0.43, 0.53),
    loopDamping: clamp(0.992 + warmth * 0.0042, 0.992, 0.9962),
    toneCutoffHz: clamp(
      2100 + brightness * 2100 + event.frequencyHz * 1.8,
      1900,
      5600
    ),
  };
}

function createPluckedBuffer(context, event, random, profile) {
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
  const excitation = new Float32Array(excitationLength);
  const pickDelay = Math.max(
    1,
    Math.min(excitationLength - 1, Math.round(delaySamples * profile.pickPosition))
  );
  let smoothedNoise = 0;

  for (let index = 0; index < excitationLength; index += 1) {
    const rawNoise = random() * 2 - 1;
    smoothedNoise =
      smoothedNoise * profile.excitationSmoothing +
      rawNoise * (1 - profile.excitationSmoothing);
    excitation[index] = smoothedNoise;
    const combed =
      smoothedNoise -
      (index >= pickDelay ? excitation[index - pickDelay] * 0.72 : 0);
    const roundedPluckEnvelope = Math.sin(
      (Math.PI * (index + 0.5)) / excitationLength
    );
    samples[index] = combed * roundedPluckEnvelope * 0.72;
  }

  const transientLength = Math.min(
    sampleCount,
    Math.max(2, Math.ceil(sampleRate * 0.007))
  );
  let priorTransientNoise = 0;
  for (let index = 0; index < transientLength; index += 1) {
    const rawNoise = random() * 2 - 1;
    const brightNoise = rawNoise - priorTransientNoise * 0.7;
    priorTransientNoise = rawNoise;
    const envelope = 1 - index / transientLength;
    samples[index] +=
      brightNoise * envelope * envelope * profile.pickTransientGain;
  }

  for (let index = delaySamples; index < sampleCount; index += 1) {
    const first = samples[index - delaySamples];
    const second = samples[Math.max(0, index - delaySamples - 1)];
    samples[index] =
      (first * (1 - profile.loopBlend) + second * profile.loopBlend) *
      profile.loopDamping;
  }

  return buffer;
}

function createMutedBuffer(context, random) {
  const sampleRate = context.sampleRate;
  const sampleCount = Math.max(2, Math.ceil(sampleRate * 0.045));
  const buffer = context.createBuffer(1, sampleCount, sampleRate);
  const samples = buffer.getChannelData(0);
  let smoothedNoise = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const rawNoise = random() * 2 - 1;
    smoothedNoise = smoothedNoise * 0.58 + rawNoise * 0.42;
    const envelope = 1 - index / sampleCount;
    samples[index] = smoothedNoise * envelope * envelope * envelope * 0.3;
  }

  return buffer;
}

function setAudioParam(param, value, time) {
  param?.setValueAtTime?.(value, time);
}

function createBodyFilter(context, specification) {
  const filter = context.createBiquadFilter();
  filter.type = specification.type;
  setAudioParam(filter.frequency, specification.frequencyHz, context.currentTime);
  setAudioParam(filter.Q, specification.q, context.currentTime);
  if (Number.isFinite(specification.gainDb)) {
    setAudioParam(filter.gain, specification.gainDb, context.currentTime);
  }
  return filter;
}

function configureMaster(context) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.64, context.currentTime);
  const bodyFilters = [];

  let output = gain;
  if (typeof context.createBiquadFilter === "function") {
    BODY_FILTER_SPECS.forEach((specification) => {
      const filter = createBodyFilter(context, specification);
      output.connect(filter);
      output = filter;
      bodyFilters.push(filter);
    });
  }

  if (typeof context.createDynamicsCompressor !== "function") {
    output.connect(context.destination);
    return { input: gain, gain, compressor: null, bodyFilters };
  }

  const compressor = context.createDynamicsCompressor();
  compressor.threshold?.setValueAtTime?.(-20, context.currentTime);
  compressor.knee?.setValueAtTime?.(16, context.currentTime);
  compressor.ratio?.setValueAtTime?.(4.5, context.currentTime);
  compressor.attack?.setValueAtTime?.(0.006, context.currentTime);
  compressor.release?.setValueAtTime?.(0.22, context.currentTime);
  output.connect(compressor);
  compressor.connect(context.destination);
  return { input: gain, gain, compressor, bodyFilters };
}

export function createPositionAuditioner({
  audioContextFactory = defaultAudioContextFactory,
  random = Math.random,
  startDelaySeconds = DEFAULT_START_DELAY_SECONDS,
} = {}) {
  const resolvedStartDelaySeconds = validateStartDelaySeconds(startDelaySeconds);
  let context = null;
  let master = null;
  let disposed = false;
  const activeVoices = new Set();

  function releaseVoice(voice) {
    activeVoices.delete(voice);
    safeDisconnect(voice.source);
    safeDisconnect(voice.tone);
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

  function scheduleVoice(buffer, when, gainValue, toneCutoffHz = null) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    const tone =
      Number.isFinite(toneCutoffHz) &&
      typeof context.createBiquadFilter === "function"
        ? context.createBiquadFilter()
        : null;

    source.buffer = buffer;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(gainValue, when + 0.006);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      when + Math.max(MIN_SOUND_SECONDS, buffer.duration)
    );

    if (tone) {
      tone.type = "lowpass";
      setAudioParam(tone.frequency, toneCutoffHz, when);
      setAudioParam(tone.Q, 0.62, when);
      source.connect(tone);
      tone.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(master.input);

    const voice = { source, tone, gain };
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
    const onset = context.currentTime + resolvedStartDelaySeconds;
    const pitchedGain = clamp(
      0.34 / Math.sqrt(Math.max(1, pitchedEvents.length)),
      0.1,
      0.34
    );

    pitchedEvents.forEach((event) => {
      const profile = buildProceduralStringProfile(event);
      scheduleVoice(
        createPluckedBuffer(context, event, random, profile),
        onset,
        pitchedGain,
        profile.toneCutoffHz
      );
    });
    mutedEvents.forEach(() => {
      scheduleVoice(createMutedBuffer(context, random), onset, 0.2, 2600);
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
    master?.bodyFilters?.forEach((filter) => safeDisconnect(filter));
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

import { selectIowaGuitarSample } from "./iowaGuitarSampleManifest";

const DEFAULT_START_DELAY_SECONDS = 0.65;
const MIN_START_DELAY_SECONDS = 0.5;
const MAX_START_DELAY_SECONDS = 5;
const MIN_VOICE_SECONDS = 0.32;
const MAX_VOICE_SECONDS = 2.8;
export const IOWA_MASTER_INPUT_GAIN = 1.05;
const BASE_PITCHED_GAIN = 0.6;
const MIN_PITCHED_GAIN = 0.19;
const MAX_PITCHED_GAIN = 0.84;
const STRING_GAIN_MULTIPLIERS = Object.freeze([1, 1, 1.04, 1.1, 1.22, 1.4]);

export class IowaSampleAuditionError extends Error {
  constructor(message, code = "IOWA_SAMPLE_AUDITION_ERROR") {
    super(message);
    this.name = "IowaSampleAuditionError";
    this.code = code;
  }
}

function defaultAudioContextFactory() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (typeof AudioContextConstructor !== "function") {
    throw new IowaSampleAuditionError(
      "This browser does not provide the Web Audio API required for sampled guitar sound.",
      "WEB_AUDIO_UNAVAILABLE"
    );
  }
  return new AudioContextConstructor();
}

function defaultFetch(input, init) {
  if (typeof window.fetch !== "function") {
    throw new IowaSampleAuditionError(
      "This browser cannot load the local guitar samples.",
      "SAMPLE_FETCH_UNAVAILABLE"
    );
  }
  return window.fetch(input, init);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function resolveIowaPitchedGain(event, pitchedEventCount) {
  const voiceCount =
    Number.isInteger(pitchedEventCount) && pitchedEventCount > 0
      ? pitchedEventCount
      : 1;
  const stringMultiplier = Number.isInteger(event?.stringIndex)
    ? STRING_GAIN_MULTIPLIERS[event.stringIndex] ?? 1
    : 1;

  return clamp(
    (BASE_PITCHED_GAIN * stringMultiplier) / Math.sqrt(voiceCount),
    MIN_PITCHED_GAIN,
    MAX_PITCHED_GAIN
  );
}

function validateStartDelaySeconds(value) {
  if (
    !Number.isFinite(value) ||
    value < MIN_START_DELAY_SECONDS ||
    value > MAX_START_DELAY_SECONDS
  ) {
    throw new IowaSampleAuditionError(
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
    // Audio nodes can already be disconnected after ending or stopping.
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
    throw new IowaSampleAuditionError(
      "The current position does not contain a valid sampled-sound description.",
      "INVALID_SAMPLE_AUDITION_EVENTS"
    );
  }

  soundEvents.events.forEach((event) => {
    if (event?.type === "muted-string") return;
    if (event?.type !== "pitched-string" || !selectIowaGuitarSample(event)) {
      throw new IowaSampleAuditionError(
        "The current guitar position is outside the verified Iowa sample range.",
        "IOWA_SAMPLE_RANGE_UNSUPPORTED"
      );
    }
  });
}

function setAudioParam(parameter, value, time) {
  parameter?.setValueAtTime?.(value, time);
}

function configureMaster(context) {
  const input = context.createGain();
  setAudioParam(input.gain, IOWA_MASTER_INPUT_GAIN, context.currentTime);

  let output = input;
  const filters = [];
  if (typeof context.createBiquadFilter === "function") {
    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    setAudioParam(highpass.frequency, 38, context.currentTime);
    setAudioParam(highpass.Q, 0.62, context.currentTime);
    input.connect(highpass);
    output = highpass;
    filters.push(highpass);

    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    setAudioParam(lowpass.frequency, 11_500, context.currentTime);
    setAudioParam(lowpass.Q, 0.55, context.currentTime);
    output.connect(lowpass);
    output = lowpass;
    filters.push(lowpass);
  }

  let compressor = null;
  if (typeof context.createDynamicsCompressor === "function") {
    compressor = context.createDynamicsCompressor();
    setAudioParam(compressor.threshold, -15, context.currentTime);
    setAudioParam(compressor.knee, 12, context.currentTime);
    setAudioParam(compressor.ratio, 3.2, context.currentTime);
    setAudioParam(compressor.attack, 0.004, context.currentTime);
    setAudioParam(compressor.release, 0.24, context.currentTime);
    output.connect(compressor);
    output = compressor;
  }

  output.connect(context.destination);
  return { input, filters, compressor };
}

function createMutedBuffer(context, random) {
  const sampleCount = Math.max(2, Math.ceil(context.sampleRate * 0.055));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let smoothed = 0;
  for (let index = 0; index < samples.length; index += 1) {
    smoothed = smoothed * 0.62 + (random() * 2 - 1) * 0.38;
    const envelope = 1 - index / samples.length;
    samples[index] = smoothed * envelope * envelope * envelope * 0.34;
  }
  return buffer;
}

async function decodeAudioData(context, bytes) {
  try {
    const result = context.decodeAudioData(bytes.slice(0));
    if (result && typeof result.then === "function") return await result;
    return await new Promise((resolve, reject) => {
      context.decodeAudioData(bytes.slice(0), resolve, reject);
    });
  } catch (error) {
    throw new IowaSampleAuditionError(
      `A local Iowa guitar sample could not be decoded: ${error?.message || error}`,
      "IOWA_SAMPLE_DECODE_FAILED"
    );
  }
}

export function canUseIowaSamples(soundEvents) {
  if (!soundEvents || !Array.isArray(soundEvents.events)) return false;
  const pitched = soundEvents.events.filter((event) => event?.type === "pitched-string");
  return pitched.length > 0 && pitched.every((event) => selectIowaGuitarSample(event));
}

export function createIowaSampleAuditioner({
  audioContextFactory = defaultAudioContextFactory,
  fetchImpl = defaultFetch,
  random = Math.random,
  startDelaySeconds = DEFAULT_START_DELAY_SECONDS,
} = {}) {
  const resolvedStartDelaySeconds = validateStartDelaySeconds(startDelaySeconds);
  let context = null;
  let master = null;
  let disposed = false;
  const decodedBuffers = new Map();
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
        // Buffer sources can be stopped only once.
      }
      releaseVoice(voice);
    });
    activeVoices.clear();
  }

  async function ensureContext() {
    if (disposed) {
      throw new IowaSampleAuditionError(
        "The sampled guitar auditioner has already been disposed.",
        "AUDITIONER_DISPOSED"
      );
    }
    if (!context) {
      context = audioContextFactory();
      if (
        !context ||
        typeof context.createBufferSource !== "function" ||
        typeof context.decodeAudioData !== "function"
      ) {
        throw new IowaSampleAuditionError(
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
      throw new IowaSampleAuditionError(
        "The browser audio context is closed.",
        "WEB_AUDIO_CONTEXT_CLOSED"
      );
    }
    return context;
  }

  async function loadSample(selection) {
    if (decodedBuffers.has(selection.url)) return decodedBuffers.get(selection.url);
    let response;
    try {
      response = await fetchImpl(selection.url, {
        cache: "force-cache",
        credentials: "same-origin",
      });
    } catch (error) {
      throw new IowaSampleAuditionError(
        `The local Iowa guitar sample could not be loaded: ${error?.message || error}`,
        "IOWA_SAMPLE_FETCH_FAILED"
      );
    }
    if (!response?.ok || typeof response.arrayBuffer !== "function") {
      throw new IowaSampleAuditionError(
        `The local Iowa guitar sample returned ${response?.status || "an invalid response"}.`,
        "IOWA_SAMPLE_FETCH_FAILED"
      );
    }
    const buffer = await decodeAudioData(context, await response.arrayBuffer());
    decodedBuffers.set(selection.url, buffer);
    return buffer;
  }

  function scheduleBuffer(buffer, when, gainValue, playbackRate, requestedDurationSeconds) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const availableDuration = buffer.duration / playbackRate;
    const voiceDuration = clamp(
      Math.min(availableDuration, requestedDurationSeconds + 0.32),
      MIN_VOICE_SECONDS,
      MAX_VOICE_SECONDS
    );
    const releaseStart = Math.max(when + 0.08, when + voiceDuration - 0.075);

    setAudioParam(gain.gain, 0.0001, when);
    gain.gain.linearRampToValueAtTime(gainValue, when + 0.004);
    setAudioParam(gain.gain, gainValue, releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + voiceDuration);

    source.connect(gain);
    gain.connect(master.input);
    const voice = { source, gain };
    activeVoices.add(voice);
    source.onended = () => releaseVoice(voice);
    source.start(when);
    source.stop(when + voiceDuration + 0.02);
  }

  async function audition(soundEvents) {
    validateSoundEvents(soundEvents);
    stop();

    if (soundEvents.isRest) {
      return {
        outcome: "rest",
        pitchedEventCount: 0,
        mutedEventCount: 0,
        sampledEventCount: 0,
        proceduralFallbackCount: 0,
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
    const selections = pitchedEvents.map((event) => selectIowaGuitarSample(event));
    const buffers = await Promise.all(selections.map((selection) => loadSample(selection)));
    const onset = context.currentTime + resolvedStartDelaySeconds;
    const requestedDurationSeconds = clamp(
      soundEvents.durationMilliseconds / 1000,
      MIN_VOICE_SECONDS,
      MAX_VOICE_SECONDS
    );

    buffers.forEach((buffer, index) => {
      scheduleBuffer(
        buffer,
        onset,
        resolveIowaPitchedGain(pitchedEvents[index], pitchedEvents.length),
        selections[index].playbackRate,
        requestedDurationSeconds
      );
    });
    mutedEvents.forEach(() => {
      scheduleBuffer(
        createMutedBuffer(context, random),
        onset,
        0.19,
        1,
        0.055
      );
    });

    return {
      outcome: "auditioned",
      pitchedEventCount: pitchedEvents.length,
      mutedEventCount: mutedEvents.length,
      sampledEventCount: pitchedEvents.length,
      proceduralFallbackCount: 0,
      activeVoiceCount: activeVoices.size,
      contextState: context.state,
    };
  }

  async function dispose() {
    if (disposed) return;
    stop();
    decodedBuffers.clear();
    safeDisconnect(master?.input);
    master?.filters?.forEach((filter) => safeDisconnect(filter));
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
      decodedSampleCount: decodedBuffers.size,
    };
  }

  return { audition, stop, dispose, state };
}

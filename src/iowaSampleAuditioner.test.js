import {
  canUseIowaSamples,
  createIowaSampleAuditioner,
  IowaSampleAuditionError,
} from "./iowaSampleAuditioner";

class FakeAudioParam {
  constructor(value = 1) {
    this.value = value;
    this.calls = [];
  }

  setValueAtTime(value, time) {
    this.value = value;
    this.calls.push(["set", value, time]);
  }

  linearRampToValueAtTime(value, time) {
    this.value = value;
    this.calls.push(["linear", value, time]);
  }

  exponentialRampToValueAtTime(value, time) {
    this.value = value;
    this.calls.push(["exponential", value, time]);
  }
}

class FakeNode {
  constructor() {
    this.connections = [];
    this.disconnected = false;
  }

  connect(target) {
    this.connections.push(target);
    return target;
  }

  disconnect() {
    this.disconnected = true;
  }
}

class FakeBuffer {
  constructor(duration = 2.4, sampleRate = 44100) {
    this.duration = duration;
    this.sampleRate = sampleRate;
  }
}

class FakeGeneratedBuffer extends FakeBuffer {
  constructor(channels, length, sampleRate) {
    super(length / sampleRate, sampleRate);
    this.numberOfChannels = channels;
    this.length = length;
    this.channels = Array.from({ length: channels }, () => new Float32Array(length));
  }

  getChannelData(index) {
    return this.channels[index];
  }
}

class FakeBufferSource extends FakeNode {
  constructor() {
    super();
    this.buffer = null;
    this.playbackRate = new FakeAudioParam(1);
    this.startCalls = [];
    this.stopCalls = [];
    this.onended = null;
  }

  start(time) {
    this.startCalls.push(time);
  }

  stop(time) {
    this.stopCalls.push(time);
  }
}

class FakeGain extends FakeNode {
  constructor() {
    super();
    this.gain = new FakeAudioParam();
  }
}

class FakeFilter extends FakeNode {
  constructor() {
    super();
    this.type = "lowpass";
    this.frequency = new FakeAudioParam();
    this.Q = new FakeAudioParam();
  }
}

class FakeCompressor extends FakeNode {
  constructor() {
    super();
    this.threshold = new FakeAudioParam();
    this.knee = new FakeAudioParam();
    this.ratio = new FakeAudioParam();
    this.attack = new FakeAudioParam();
    this.release = new FakeAudioParam();
  }
}

class FakeAudioContext {
  constructor({ state = "suspended" } = {}) {
    this.state = state;
    this.sampleRate = 44100;
    this.currentTime = 7;
    this.destination = new FakeNode();
    this.sources = [];
    this.gains = [];
    this.filters = [];
    this.compressors = [];
    this.generatedBuffers = [];
    this.decodeCalls = [];
    this.resumeCalls = 0;
    this.closeCalls = 0;
  }

  createBufferSource() {
    const source = new FakeBufferSource();
    this.sources.push(source);
    return source;
  }

  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }

  createBiquadFilter() {
    const filter = new FakeFilter();
    this.filters.push(filter);
    return filter;
  }

  createDynamicsCompressor() {
    const compressor = new FakeCompressor();
    this.compressors.push(compressor);
    return compressor;
  }

  createBuffer(channels, length, sampleRate) {
    const buffer = new FakeGeneratedBuffer(channels, length, sampleRate);
    this.generatedBuffers.push(buffer);
    return buffer;
  }

  async decodeAudioData(bytes) {
    this.decodeCalls.push(bytes.byteLength);
    return new FakeBuffer();
  }

  async resume() {
    this.resumeCalls += 1;
    this.state = "running";
  }

  async close() {
    this.closeCalls += 1;
    this.state = "closed";
  }
}

function pitched(stringIndex, midi) {
  return {
    type: "pitched-string",
    stringId: `string-${stringIndex + 1}`,
    stringIndex,
    midi,
    frequencyHz: 440 * 2 ** ((midi - 69) / 12),
    durationMilliseconds: 500,
    onsetMilliseconds: 0,
  };
}

function soundEvents(events, { rest = false, durationMilliseconds = 500 } = {}) {
  return {
    schemaVersion: 1,
    type: "position-sound-events",
    isRest: rest,
    durationMilliseconds,
    events,
  };
}

function response(bytes = 64) {
  return {
    ok: true,
    status: 200,
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(bytes)),
  };
}

function expectCode(run, code) {
  return run().catch((error) => {
    expect(error).toBeInstanceOf(IowaSampleAuditionError);
    expect(error.code).toBe(code);
  });
}

describe("Iowa guitar sample auditioner", () => {
  test("recognizes only complete same-string sample coverage", () => {
    expect(canUseIowaSamples(soundEvents([pitched(5, 40), pitched(0, 64)]))).toBe(true);
    expect(canUseIowaSamples(soundEvents([pitched(0, 68)]))).toBe(false);
    expect(canUseIowaSamples(soundEvents([], { rest: true }))).toBe(false);
  });

  test("returns a rest without creating audio or fetching assets", async () => {
    const factory = jest.fn(() => new FakeAudioContext());
    const fetchImpl = jest.fn();
    const auditioner = createIowaSampleAuditioner({
      audioContextFactory: factory,
      fetchImpl,
    });

    const result = await auditioner.audition(soundEvents([], { rest: true }));

    expect(result).toMatchObject({
      outcome: "rest",
      sampledEventCount: 0,
      proceduralFallbackCount: 0,
      contextState: "uninitialized",
    });
    expect(factory).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("loads exact local string assets and schedules chord voices at one onset", async () => {
    const context = new FakeAudioContext();
    const fetchImpl = jest.fn().mockImplementation(async () => response());
    const auditioner = createIowaSampleAuditioner({
      audioContextFactory: () => context,
      fetchImpl,
      startDelaySeconds: 2,
    });
    const events = soundEvents([
      pitched(5, 40),
      pitched(4, 47),
      pitched(3, 52),
      pitched(2, 56),
      pitched(1, 59),
      pitched(0, 64),
    ]);

    const result = await auditioner.audition(events);

    expect(context.resumeCalls).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(6);
    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      "/samples/iowa-guitar/string-6-e2.wav",
      "/samples/iowa-guitar/string-5-b2.wav",
      "/samples/iowa-guitar/string-4-e3.wav",
      "/samples/iowa-guitar/string-3-g-sharp3.wav",
      "/samples/iowa-guitar/string-2-b3.wav",
      "/samples/iowa-guitar/string-1-e4.wav",
    ]);
    expect(context.sources).toHaveLength(6);
    expect(context.sources.map((source) => source.startCalls[0])).toEqual([
      9,
      9,
      9,
      9,
      9,
      9,
    ]);
    expect(context.sources.map((source) => source.playbackRate.value)).toEqual([
      1,
      1,
      1,
      1,
      1,
      1,
    ]);
    expect(result).toMatchObject({
      outcome: "auditioned",
      pitchedEventCount: 6,
      sampledEventCount: 6,
      proceduralFallbackCount: 0,
      activeVoiceCount: 6,
      contextState: "running",
    });
  });

  test("uses bounded playback-rate shifts and caches decoded samples", async () => {
    const context = new FakeAudioContext({ state: "running" });
    const fetchImpl = jest.fn().mockResolvedValue(response());
    const auditioner = createIowaSampleAuditioner({
      audioContextFactory: () => context,
      fetchImpl,
      startDelaySeconds: 1,
    });
    const events = soundEvents([pitched(0, 67)]);

    await auditioner.audition(events);
    await auditioner.audition(events);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(context.decodeCalls).toHaveLength(1);
    expect(context.sources[0].playbackRate.value).toBeCloseTo(2 ** (3 / 12), 8);
    expect(context.sources[1].playbackRate.value).toBeCloseTo(2 ** (3 / 12), 8);
    expect(context.sources[0].stopCalls).toContain(0);
  });

  test("rejects an unsupported sampled pitch instead of silently substituting", async () => {
    const auditioner = createIowaSampleAuditioner({
      audioContextFactory: () => new FakeAudioContext({ state: "running" }),
      fetchImpl: jest.fn(),
    });

    await expectCode(
      () => auditioner.audition(soundEvents([pitched(0, 68)])),
      "IOWA_SAMPLE_RANGE_UNSUPPORTED"
    );
  });

  test("reports local asset failures and disposes its context", async () => {
    const context = new FakeAudioContext({ state: "running" });
    const auditioner = createIowaSampleAuditioner({
      audioContextFactory: () => context,
      fetchImpl: jest.fn().mockResolvedValue({ ok: false, status: 404 }),
    });

    await expectCode(
      () => auditioner.audition(soundEvents([pitched(5, 40)])),
      "IOWA_SAMPLE_FETCH_FAILED"
    );
    await auditioner.dispose();

    expect(context.closeCalls).toBe(1);
    expect(auditioner.state()).toMatchObject({
      disposed: true,
      contextState: "uninitialized",
      activeVoiceCount: 0,
      decodedSampleCount: 0,
    });
  });
});

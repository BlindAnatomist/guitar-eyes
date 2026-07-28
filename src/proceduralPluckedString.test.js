import {
  AudiblePlaybackError,
  createPositionAuditioner,
} from "./proceduralPluckedString";

class FakeAudioParam {
  constructor() {
    this.calls = [];
  }

  setValueAtTime(value, time) {
    this.calls.push(["set", value, time]);
  }

  linearRampToValueAtTime(value, time) {
    this.calls.push(["linear", value, time]);
  }

  exponentialRampToValueAtTime(value, time) {
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
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
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
    this.sampleRate = 8000;
    this.currentTime = 10;
    this.destination = new FakeNode();
    this.sources = [];
    this.gains = [];
    this.compressors = [];
    this.buffers = [];
    this.resumeCalls = 0;
    this.closeCalls = 0;
  }

  createBuffer(channels, length, sampleRate) {
    const buffer = new FakeBuffer(channels, length, sampleRate);
    this.buffers.push(buffer);
    return buffer;
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

  createDynamicsCompressor() {
    const compressor = new FakeCompressor();
    this.compressors.push(compressor);
    return compressor;
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

function pitchedEvents(count = 1) {
  return {
    schemaVersion: 1,
    type: "position-sound-events",
    isRest: false,
    durationMilliseconds: 500,
    events: Array.from({ length: count }, (_, index) => ({
      type: "pitched-string",
      stringId: `s${index + 1}`,
      midi: 64 - index * 4,
      frequencyHz: 329.627 / 2 ** (index / 3),
      onsetMilliseconds: 0,
      durationMilliseconds: 500,
    })),
  };
}

function restEvents() {
  return {
    schemaVersion: 1,
    type: "position-sound-events",
    isRest: true,
    durationMilliseconds: 500,
    events: [],
  };
}

function expectCode(run, code) {
  return run().catch((error) => {
    expect(error).toBeInstanceOf(AudiblePlaybackError);
    expect(error.code).toBe(code);
  });
}

describe("createPositionAuditioner", () => {
  test("does not create an audio context until an audible user action", () => {
    const factory = jest.fn(() => new FakeAudioContext());
    const auditioner = createPositionAuditioner({ audioContextFactory: factory });

    expect(factory).not.toHaveBeenCalled();
    expect(auditioner.state()).toEqual({
      disposed: false,
      contextState: "uninitialized",
      activeVoiceCount: 0,
    });
  });

  test("returns a rest outcome without creating an audio context", async () => {
    const factory = jest.fn(() => new FakeAudioContext());
    const auditioner = createPositionAuditioner({ audioContextFactory: factory });

    const result = await auditioner.audition(restEvents());

    expect(result).toEqual({
      outcome: "rest",
      pitchedEventCount: 0,
      mutedEventCount: 0,
      activeVoiceCount: 0,
      contextState: "uninitialized",
    });
    expect(factory).not.toHaveBeenCalled();
  });

  test("resumes Web Audio and schedules every chord voice after one shared clearance pause", async () => {
    const context = new FakeAudioContext();
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.75,
    });

    const result = await auditioner.audition(pitchedEvents(3));

    expect(context.resumeCalls).toBe(1);
    expect(context.state).toBe("running");
    expect(context.sources).toHaveLength(3);
    expect(context.buffers).toHaveLength(3);
    expect(context.compressors).toHaveLength(1);
    expect(context.sources.map((source) => source.startCalls[0])).toEqual([
      10.65,
      10.65,
      10.65,
    ]);
    expect(result).toMatchObject({
      outcome: "auditioned",
      pitchedEventCount: 3,
      mutedEventCount: 0,
      activeVoiceCount: 3,
      contextState: "running",
    });
  });

  test("creates a short non-pitched sound for an explicit muted string", async () => {
    const context = new FakeAudioContext({ state: "running" });
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.25,
    });
    const events = {
      type: "position-sound-events",
      isRest: false,
      durationMilliseconds: 1000,
      events: [{ type: "muted-string", stringId: "s1" }],
    };

    const result = await auditioner.audition(events);

    expect(result.mutedEventCount).toBe(1);
    expect(result.pitchedEventCount).toBe(0);
    expect(context.buffers[0].duration).toBeCloseTo(0.045, 3);
    expect(context.sources).toHaveLength(1);
  });

  test("stops and disconnects prior voices before repeated audition", async () => {
    const context = new FakeAudioContext({ state: "running" });
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.6,
    });

    await auditioner.audition(pitchedEvents(2));
    const firstSources = [...context.sources];
    const firstVoiceGains = context.gains.slice(1);

    await auditioner.audition(pitchedEvents(1));

    firstSources.forEach((source) => {
      expect(source.stopCalls).toContain(0);
      expect(source.disconnected).toBe(true);
    });
    firstVoiceGains.forEach((gain) => expect(gain.disconnected).toBe(true));
    expect(auditioner.state().activeVoiceCount).toBe(1);
  });

  test("disposes active nodes and closes the audio context", async () => {
    const context = new FakeAudioContext({ state: "running" });
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
    });

    await auditioner.audition(pitchedEvents(1));
    await auditioner.dispose();

    expect(context.closeCalls).toBe(1);
    expect(auditioner.state()).toEqual({
      disposed: true,
      contextState: "uninitialized",
      activeVoiceCount: 0,
    });
    await auditioner.dispose();
    expect(context.closeCalls).toBe(1);
  });

  test("rejects malformed events and an audition after disposal", async () => {
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => new FakeAudioContext({ state: "running" }),
    });

    await expectCode(
      () => auditioner.audition({ type: "position-sound-events", events: [] }),
      "INVALID_AUDITION_EVENTS"
    );

    await auditioner.dispose();
    await expectCode(
      () => auditioner.audition(pitchedEvents(1)),
      "AUDITIONER_DISPOSED"
    );
  });
});

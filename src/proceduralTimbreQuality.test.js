import {
  AudiblePlaybackError,
  buildProceduralStringProfile,
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
    this.duration = length / sampleRate;
    this.channels = Array.from({ length: channels }, () => new Float32Array(length));
  }

  getChannelData(index) {
    return this.channels[index];
  }
}

class FakeSource extends FakeNode {
  constructor() {
    super();
    this.startCalls = [];
    this.stopCalls = [];
    this.buffer = null;
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

class FakeBiquad extends FakeNode {
  constructor() {
    super();
    this.type = "lowpass";
    this.frequency = new FakeAudioParam();
    this.Q = new FakeAudioParam();
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
  constructor() {
    this.state = "running";
    this.sampleRate = 8000;
    this.currentTime = 10;
    this.destination = new FakeNode();
    this.buffers = [];
    this.sources = [];
    this.gains = [];
    this.filters = [];
    this.compressors = [];
    this.closeCalls = 0;
  }

  createBuffer(channels, length, sampleRate) {
    const buffer = new FakeBuffer(channels, length, sampleRate);
    this.buffers.push(buffer);
    return buffer;
  }

  createBufferSource() {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }

  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }

  createBiquadFilter() {
    const filter = new FakeBiquad();
    this.filters.push(filter);
    return filter;
  }

  createDynamicsCompressor() {
    const compressor = new FakeCompressor();
    this.compressors.push(compressor);
    return compressor;
  }

  async close() {
    this.closeCalls += 1;
    this.state = "closed";
  }
}

function soundEvents(count = 1) {
  return {
    type: "position-sound-events",
    isRest: false,
    durationMilliseconds: 500,
    events: Array.from({ length: count }, (_, index) => ({
      type: "pitched-string",
      stringId: `s${index + 1}`,
      stringIndex: index,
      midi: 64 - index * 5,
      frequencyHz: 329.628 / 2 ** (index * 5 / 12),
      durationMilliseconds: 500,
    })),
  };
}

function linearGainValue(gain) {
  return gain.gain.calls.find(([kind]) => kind === "linear")?.[1];
}

describe("procedural timbre quality foundation", () => {
  test("makes lower strings darker and more persistent than higher strings", () => {
    const high = buildProceduralStringProfile({
      type: "pitched-string",
      stringIndex: 0,
      midi: 76,
      frequencyHz: 659.255,
    });
    const low = buildProceduralStringProfile({
      type: "pitched-string",
      stringIndex: 5,
      midi: 40,
      frequencyHz: 82.407,
    });

    expect(low.warmth).toBeGreaterThan(high.warmth);
    expect(low.excitationSmoothing).toBeGreaterThan(high.excitationSmoothing);
    expect(low.loopDamping).toBeGreaterThan(high.loopDamping);
    expect(low.toneCutoffHz).toBeLessThan(high.toneCutoffHz);
    expect(low.pickTransientGain).toBeLessThan(high.pickTransientGain);
  });

  test("rejects an invalid direct timbre request", () => {
    try {
      buildProceduralStringProfile({ type: "muted-string" });
      throw new Error("Expected invalid timbre request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(AudiblePlaybackError);
      expect(error.code).toBe("INVALID_TIMBRE_EVENT");
    }
  });

  test("adds restrained body resonance and one pitch-sensitive tone filter per voice", async () => {
    const context = new FakeAudioContext();
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.6,
    });

    await auditioner.audition(soundEvents(2));

    expect(context.filters.map((filter) => filter.type)).toEqual([
      "highpass",
      "peaking",
      "peaking",
      "lowpass",
      "lowpass",
      "lowpass",
    ]);
    expect(context.filters[0].frequency.calls[0]).toEqual(["set", 42, 10]);
    expect(context.filters[1].gain.calls[0]).toEqual(["set", 2.4, 10]);
    expect(context.filters[2].gain.calls[0]).toEqual(["set", 1.6, 10]);
    expect(context.filters[4].frequency.calls[0][1]).not.toBe(
      context.filters[5].frequency.calls[0][1]
    );
  });

  test("keeps a no-biquad browser fallback audible", async () => {
    const context = new FakeAudioContext();
    context.createBiquadFilter = undefined;
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.6,
    });

    const result = await auditioner.audition(soundEvents(1));

    expect(result.outcome).toBe("auditioned");
    expect(context.sources).toHaveLength(1);
    expect(context.compressors).toHaveLength(1);
    expect(context.gains).toHaveLength(2);
  });

  test("preserves one chord onset while reducing gain as voices accumulate", async () => {
    const singleContext = new FakeAudioContext();
    const chordContext = new FakeAudioContext();
    const single = createPositionAuditioner({
      audioContextFactory: () => singleContext,
      random: () => 0.55,
    });
    const chord = createPositionAuditioner({
      audioContextFactory: () => chordContext,
      random: () => 0.55,
    });

    await single.audition(soundEvents(1));
    await chord.audition(soundEvents(3));

    expect(chordContext.sources.map((source) => source.startCalls[0])).toEqual([
      10.65,
      10.65,
      10.65,
    ]);
    expect(linearGainValue(singleContext.gains[1])).toBeCloseTo(0.34, 5);
    expect(linearGainValue(chordContext.gains[1])).toBeLessThan(
      linearGainValue(singleContext.gains[1])
    );
    chordContext.gains.slice(1).forEach((gain) => {
      expect(linearGainValue(gain)).toBeCloseTo(
        linearGainValue(chordContext.gains[1]),
        8
      );
    });
  });

  test("generates a bounded shaped pluck instead of a full-scale white-noise block", async () => {
    const context = new FakeAudioContext();
    let call = 0;
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => {
        call += 1;
        return call % 2 === 0 ? 0.2 : 0.8;
      },
    });

    await auditioner.audition(soundEvents(1));

    const samples = context.buffers[0].getChannelData(0);
    let maximum = 0;
    let minimum = 0;
    let absoluteMaximum = 0;
    let nonzero = 0;
    samples.forEach((sample) => {
      maximum = Math.max(maximum, sample);
      minimum = Math.min(minimum, sample);
      absoluteMaximum = Math.max(absoluteMaximum, Math.abs(sample));
      if (Math.abs(sample) > 0.001) nonzero += 1;
    });

    expect(maximum).toBeGreaterThan(0);
    expect(minimum).toBeLessThan(0);
    expect(absoluteMaximum).toBeLessThan(1);
    expect(nonzero).toBeGreaterThan(10);
  });

  test("disconnects body and voice filters during disposal", async () => {
    const context = new FakeAudioContext();
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.6,
    });

    await auditioner.audition(soundEvents(1));
    await auditioner.dispose();

    context.filters.forEach((filter) => expect(filter.disconnected).toBe(true));
    expect(context.closeCalls).toBe(1);
  });
});

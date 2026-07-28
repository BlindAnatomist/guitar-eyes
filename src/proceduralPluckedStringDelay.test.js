import {
  AudiblePlaybackError,
  createPositionAuditioner,
} from "./proceduralPluckedString";

class FakeAudioParam {
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class FakeNode {
  connect(target) {
    return target;
  }

  disconnect() {}
}

class FakeBuffer {
  constructor(length, sampleRate) {
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this.samples = new Float32Array(length);
  }

  getChannelData() {
    return this.samples;
  }
}

class FakeSource extends FakeNode {
  constructor() {
    super();
    this.startCalls = [];
    this.stopCalls = [];
    this.onended = null;
    this.buffer = null;
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
  constructor() {
    this.state = "running";
    this.sampleRate = 8000;
    this.currentTime = 7;
    this.destination = new FakeNode();
    this.sources = [];
  }

  createBuffer(_channels, length, sampleRate) {
    return new FakeBuffer(length, sampleRate);
  }

  createBufferSource() {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }

  createGain() {
    return new FakeGain();
  }

  createDynamicsCompressor() {
    return new FakeCompressor();
  }
}

function chordEvents() {
  return {
    type: "position-sound-events",
    isRest: false,
    durationMilliseconds: 500,
    events: [
      {
        type: "pitched-string",
        stringId: "s1",
        midi: 64,
        frequencyHz: 329.627,
        durationMilliseconds: 500,
      },
      {
        type: "pitched-string",
        stringId: "s2",
        midi: 60,
        frequencyHz: 261.626,
        durationMilliseconds: 500,
      },
    ],
  };
}

describe("configurable audition onset delay", () => {
  test("starts every chord voice after the supplied clearance interval", async () => {
    const context = new FakeAudioContext();
    const auditioner = createPositionAuditioner({
      audioContextFactory: () => context,
      random: () => 0.75,
      startDelaySeconds: 4,
    });

    await auditioner.audition(chordEvents());

    expect(context.sources).toHaveLength(2);
    expect(context.sources.map((source) => source.startCalls[0])).toEqual([11, 11]);
  });

  test("rejects a delay outside the bounded accessible control range", () => {
    expect(() =>
      createPositionAuditioner({
        audioContextFactory: () => new FakeAudioContext(),
        startDelaySeconds: 0.25,
      })
    ).toThrow(AudiblePlaybackError);

    try {
      createPositionAuditioner({
        audioContextFactory: () => new FakeAudioContext(),
        startDelaySeconds: 6,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AudiblePlaybackError);
      expect(error.code).toBe("INVALID_AUDITION_DELAY");
    }
  });
});

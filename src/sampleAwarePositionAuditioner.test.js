import { createPositionAuditioner } from "./sampleAwarePositionAuditioner";
import { createIowaSampleAuditioner } from "./iowaSampleAuditioner";
import { createPositionAuditioner as createProceduralAuditioner } from "./proceduralPluckedString";

jest.mock("./iowaSampleAuditioner", () => {
  const actual = jest.requireActual("./iowaSampleAuditioner");
  return {
    ...actual,
    createIowaSampleAuditioner: jest.fn(),
  };
});

jest.mock("./proceduralPluckedString", () => ({
  createPositionAuditioner: jest.fn(),
}));

function pitched(stringIndex, midi) {
  return {
    type: "pitched-string",
    stringIndex,
    stringId: `s${stringIndex + 1}`,
    midi,
    frequencyHz: 440,
  };
}

function soundEvents(events) {
  return {
    type: "position-sound-events",
    isRest: false,
    durationMilliseconds: 500,
    events,
  };
}

describe("sample-aware auditioner facade", () => {
  let sampled;
  let procedural;

  beforeEach(() => {
    sampled = {
      audition: jest.fn().mockResolvedValue({
        outcome: "auditioned",
        sampledEventCount: 1,
        proceduralFallbackCount: 0,
      }),
      stop: jest.fn(),
      dispose: jest.fn().mockResolvedValue(undefined),
      state: jest.fn().mockReturnValue({ contextState: "running" }),
    };
    procedural = {
      audition: jest.fn().mockResolvedValue({
        outcome: "auditioned",
        pitchedEventCount: 1,
      }),
      stop: jest.fn(),
      dispose: jest.fn().mockResolvedValue(undefined),
      state: jest.fn().mockReturnValue({ contextState: "running" }),
    };
    createIowaSampleAuditioner.mockReturnValue(sampled);
    createProceduralAuditioner.mockReturnValue(procedural);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("routes eligible same-string events to the Iowa engine", async () => {
    const auditioner = createPositionAuditioner({ startDelaySeconds: 2 });
    const events = soundEvents([pitched(5, 40)]);

    const result = await auditioner.audition(events);

    expect(createProceduralAuditioner).toHaveBeenCalledWith({ startDelaySeconds: 2 });
    expect(createIowaSampleAuditioner).toHaveBeenCalledWith({ startDelaySeconds: 2 });
    expect(procedural.stop).toHaveBeenCalledTimes(1);
    expect(sampled.audition).toHaveBeenCalledWith(events);
    expect(procedural.audition).not.toHaveBeenCalled();
    expect(result.sampledEventCount).toBe(1);
    expect(auditioner.state().activeEngine).toBe("iowa-sampled");
  });

  test("uses the explicit procedural fallback outside the bounded sample range", async () => {
    const auditioner = createPositionAuditioner();
    const events = soundEvents([pitched(0, 69)]);

    const result = await auditioner.audition(events);

    expect(createIowaSampleAuditioner).not.toHaveBeenCalled();
    expect(procedural.audition).toHaveBeenCalledWith(events);
    expect(result).toMatchObject({
      sampledEventCount: 0,
      proceduralFallbackCount: 1,
    });
    expect(auditioner.state().activeEngine).toBe("procedural-fallback");
  });

  test("does not hide an eligible Iowa sample failure behind the procedural engine", async () => {
    sampled.audition.mockRejectedValue(new Error("sample unavailable"));
    const auditioner = createPositionAuditioner();

    await expect(
      auditioner.audition(soundEvents([pitched(0, 64)]))
    ).rejects.toThrow("sample unavailable");
    expect(procedural.audition).not.toHaveBeenCalled();
  });

  test("stops and disposes both engines", async () => {
    const auditioner = createPositionAuditioner();
    await auditioner.audition(soundEvents([pitched(5, 40)]));

    auditioner.stop();
    await auditioner.dispose();

    expect(sampled.stop).toHaveBeenCalled();
    expect(procedural.stop).toHaveBeenCalled();
    expect(sampled.dispose).toHaveBeenCalled();
    expect(procedural.dispose).toHaveBeenCalled();
    expect(auditioner.state()).toMatchObject({ activeEngine: "disposed", sampled: null });
  });
});

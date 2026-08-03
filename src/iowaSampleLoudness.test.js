import {
  IOWA_MASTER_INPUT_GAIN,
  resolveIowaPitchedGain,
} from "./iowaSampleAuditioner";

function pitched(stringIndex) {
  return { type: "pitched-string", stringIndex };
}

describe("Iowa sample loudness balance", () => {
  test("raises the sampled master level without an excessive master boost", () => {
    expect(IOWA_MASTER_INPUT_GAIN).toBeGreaterThan(1);
    expect(IOWA_MASTER_INPUT_GAIN).toBeLessThanOrEqual(1.1);
  });

  test("gives the low E and A strings deliberate audibility compensation", () => {
    const highE = resolveIowaPitchedGain(pitched(0), 1);
    const dString = resolveIowaPitchedGain(pitched(3), 1);
    const aString = resolveIowaPitchedGain(pitched(4), 1);
    const lowE = resolveIowaPitchedGain(pitched(5), 1);

    expect(highE).toBeCloseTo(0.6, 8);
    expect(dString).toBeGreaterThan(highE);
    expect(aString).toBeGreaterThan(dString);
    expect(lowE).toBeGreaterThan(aString);
    expect(lowE).toBeCloseTo(0.84, 8);
  });

  test("retains per-voice chord headroom while preserving low-string balance", () => {
    const highE = resolveIowaPitchedGain(pitched(0), 6);
    const lowE = resolveIowaPitchedGain(pitched(5), 6);

    expect(highE).toBeLessThan(0.25);
    expect(lowE).toBeGreaterThan(highE);
    expect(lowE).toBeLessThan(0.35);
  });

  test("uses a neutral string multiplier for malformed or unknown string identity", () => {
    expect(resolveIowaPitchedGain({}, 1)).toBeCloseTo(0.6, 8);
    expect(resolveIowaPitchedGain(pitched(99), 1)).toBeCloseTo(0.6, 8);
  });
});

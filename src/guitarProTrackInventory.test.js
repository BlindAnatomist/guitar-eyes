import { GUITAR_PRO_LIMITS } from "./guitarProLimits";
import {
  buildGuitarProTrackInventory,
  GuitarProTrackInventoryError,
} from "./guitarProTrackInventory";

const GP8_VERSION_EVIDENCE = Object.freeze({
  schemaVersion: 1,
  archiveFamily: "GUITAR_PRO_SHARED_ZIP",
  rootVersion: "7.0",
  gpVersion: "8.1.3",
  encodingDescription: "GP8",
  sourceVersion: "GP8",
  entryCount: 6,
});

function staff(tuningMidiHighToLow, measureCount = 2) {
  return {
    tuningMidiHighToLow,
    bars: Array.from({ length: measureCount }, (_, index) => ({ sourceNumber: index + 1 })),
  };
}

function track(name, staves, extra = {}) {
  return {
    name,
    shortName: name,
    isPercussion: false,
    staves,
    ...extra,
  };
}

function intermediate(tracks) {
  return {
    schemaVersion: 1,
    sourceVersion: "GP8",
    versionEvidence: GP8_VERSION_EVIDENCE,
    title: "Inventory proof",
    tracks,
  };
}

function expectCode(callback, code) {
  try {
    callback();
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(GuitarProTrackInventoryError);
    expect(error.code).toBe(code);
  }
}

describe("buildGuitarProTrackInventory", () => {
  test("returns a serializable inventory and auto-selects one supported staff", () => {
    const inventory = buildGuitarProTrackInventory(
      intermediate([
        track("Vocal", [staff([], 2)]),
        track("Proof Guitar", [staff([64, 59, 55, 50, 45, 40], 3)]),
      ])
    );

    expect(inventory).toMatchObject({
      schemaVersion: 1,
      sourceVersion: "GP8",
      supportedCount: 1,
      requiresSelection: false,
      autoSelection: { trackIndex: 1, staffIndex: 0 },
    });
    expect(inventory.items).toHaveLength(2);
    expect(inventory.supportedItems[0]).toMatchObject({
      trackName: "Proof Guitar",
      instrument: "guitar",
      instrumentLabel: "six-string guitar",
      stringCount: 6,
      tuningLabel: "E4, B3, G3, D3, A2, E2",
      measureCount: 3,
      supported: true,
    });
    expect(inventory.items[0]).toMatchObject({
      supported: false,
      reasonCode: "NO_FRETTED_TUNING",
    });
    expect(() => JSON.stringify(inventory)).not.toThrow();
  });

  test("requires selection when guitar and bass are both supported", () => {
    const inventory = buildGuitarProTrackInventory(
      intermediate([
        track("Guitar", [staff([64, 59, 55, 50, 45, 40])]),
        track("Bass", [staff([43, 38, 33, 28])]),
      ])
    );

    expect(inventory.supportedCount).toBe(2);
    expect(inventory.requiresSelection).toBe(true);
    expect(inventory.autoSelection).toBeNull();
    expect(inventory.supportedItems.map((item) => item.selectionLabel)).toEqual([
      "Guitar. six-string guitar. Tuning high to low: E4, B3, G3, D3, A2, E2. 2 measures.",
      "Bass. four-string bass. Tuning high to low: G2, D2, A1, E1. 2 measures.",
    ]);
  });

  test("reports percussion, unsupported strings, and empty measures without hiding them", () => {
    const inventory = buildGuitarProTrackInventory(
      intermediate([
        track("Drums", [staff([], 4)], { isPercussion: true }),
        track("Seven", [staff([64, 59, 55, 50, 45, 40, 35])]),
        track("Empty Guitar", [staff([64, 59, 55, 50, 45, 40], 0)]),
      ])
    );

    expect(inventory.supportedCount).toBe(0);
    expect(inventory.items.map((item) => item.reasonCode)).toEqual([
      "PERCUSSION_TRACK",
      "UNSUPPORTED_STRING_COUNT",
      "NO_MEASURES",
    ]);
  });

  test("enforces track and staff limits before a selector is created", () => {
    expectCode(
      () =>
        buildGuitarProTrackInventory(
          intermediate(Array.from({ length: GUITAR_PRO_LIMITS.maxTracks + 1 }, (_, index) => track(`Track ${index}`, [])))
        ),
      "GUITAR_PRO_TRACK_LIMIT"
    );

    expectCode(
      () =>
        buildGuitarProTrackInventory(
          intermediate([
            track(
              "Many staves",
              Array.from(
                { length: GUITAR_PRO_LIMITS.maxStaves + 1 },
                () => staff([64, 59, 55, 50, 45, 40])
              )
            ),
          ])
        ),
      "GUITAR_PRO_STAFF_LIMIT"
    );
  });
});

import { GUITAR_PRO_LIMITS } from "./guitarProLimits";
import {
  GuitarProImportError,
  normalizeGuitarProIntermediate,
} from "./guitarProNormalizer";
import { describePlayablePosition } from "./positionDescription";

const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];
const STANDARD_BASS = [43, 38, 33, 28];

function note(stringNumberLowToHigh, fret, extra = {}) {
  return {
    stringNumberLowToHigh,
    fret,
    visible: true,
    isDead: false,
    techniques: [],
    ...extra,
  };
}

function beat(startTicks, options = {}) {
  return {
    startTicks,
    durationDenominator: 4,
    dots: 0,
    tupletNumerator: -1,
    tupletDenominator: -1,
    graceType: "none",
    isRest: false,
    techniques: [],
    notes: [note(1, 3)],
    ...options,
  };
}

function bar(sourceNumber, beats, extra = {}) {
  return {
    sourceNumber,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    repeatStart: false,
    repeatCount: 0,
    alternateEndings: 0,
    voices: [{ index: 0, beats }],
    ...extra,
  };
}

function staff(tuningMidiHighToLow = STANDARD_GUITAR, bars = null) {
  return {
    tuningMidiHighToLow,
    bars:
      bars ||
      [
        bar(1, [
          beat(0),
          beat(960, {
            durationDenominator: 8,
            notes: [note(2, 0)],
          }),
          beat(1440, {
            durationDenominator: 8,
            notes: [note(2, 2)],
          }),
          beat(1920, {
            durationDenominator: 2,
            notes: [note(3, 0)],
          }),
        ]),
      ],
  };
}

function track(name = "Proof guitar", staffValue = staff(), extra = {}) {
  return {
    name,
    shortName: name,
    isPercussion: false,
    staves: [staffValue],
    ...extra,
  };
}

function intermediate(tracks = [track()], extra = {}) {
  return {
    schemaVersion: 1,
    sourceVersion: "GP7",
    title: "Guitar Eyes GP7 Proof",
    tracks,
    ...extra,
  };
}

function expectErrorCode(callback, code) {
  try {
    callback();
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(GuitarProImportError);
    expect(error.code).toBe(code);
  }
}

describe("normalizeGuitarProIntermediate", () => {
  test("normalizes a standard six-string GP7 track into the accepted reader document", () => {
    const document = normalizeGuitarProIntermediate(intermediate());

    expect(document).toMatchObject({
      type: "tablature-document",
      sourceFormat: "guitar-pro-7",
      sourceVersion: "GP7",
      title: "Guitar Eyes GP7 Proof",
      instrument: "guitar",
      instrumentLabel: "six-string guitar",
      stringCount: 6,
      sourceTrackName: "Proof guitar",
    });
    expect(document.strings.map((string) => string.spokenName)).toEqual([
      "High E string",
      "B string",
      "G string",
      "D string",
      "A string",
      "Low E string",
    ]);
    expect(document.positions).toHaveLength(4);
    expect(document.positions[0].strings[5]).toMatchObject({ type: "fret", fret: 3 });
    expect(document.positions[1].strings[4]).toMatchObject({ type: "open" });
    expect(document.positions[2].strings[4]).toMatchObject({ type: "fret", fret: 2 });
    expect(document.positions[3].strings[3]).toMatchObject({ type: "open" });
    expect(document.measures[0].totalQuarterNoteUnits).toBe(4);
    expect(document.blocks[0].sourceLayoutLabel).toBe(
      "Normalized Guitar Pro spatial layout"
    );
    expect(document.strings[0].sourceLine).toMatch(/^E4\|/);
    expect(describePlayablePosition(document, 0)).toBe(
      "Measure 1 of 1. Position 1 of 4 in this measure. Duration, quarter note. Low E string, fret 3."
    );
  });

  test("preserves chord onsets, timed rests, dead notes, and supported techniques", () => {
    const proofBars = [
      bar(1, [
        beat(0, {
          notes: [note(6, 0), note(5, 1)],
        }),
        beat(960, {
          isRest: true,
          notes: [],
        }),
        beat(1920, {
          notes: [
            note(4, 0, {
              isDead: true,
              techniques: ["palm mute"],
            }),
          ],
        }),
        beat(2880, {
          notes: [note(3, 2, { techniques: ["hammer-on"] })],
        }),
      ]),
    ];
    const document = normalizeGuitarProIntermediate(
      intermediate([track("Chord proof", staff(STANDARD_GUITAR, proofBars))])
    );

    expect(document.positions[0].strings[0]).toMatchObject({ type: "open" });
    expect(document.positions[0].strings[1]).toMatchObject({ type: "fret", fret: 1 });
    expect(document.positions[1].isRest).toBe(true);
    expect(document.positions[2].strings[2]).toMatchObject({
      type: "technique",
      name: "muted note",
    });
    expect(document.positions[3].strings[3].techniques).toEqual([
      expect.objectContaining({ name: "hammer-on" }),
    ]);
    expect(describePlayablePosition(document, 0)).toContain("High E string, open.");
    expect(describePlayablePosition(document, 0)).toContain("B string, fret 1.");
    expect(describePlayablePosition(document, 1)).toContain("Rest.");
  });

  test("normalizes standard four-string bass orientation", () => {
    const bassBars = [bar(1, [beat(0, { notes: [note(1, 3)] })])];
    const document = normalizeGuitarProIntermediate(
      intermediate([track("Bass", staff(STANDARD_BASS, bassBars))])
    );

    expect(document.instrument).toBe("bass");
    expect(document.strings.map((string) => string.spokenName)).toEqual([
      "G string",
      "D string",
      "A string",
      "E string",
    ]);
    expect(document.positions[0].strings[3]).toMatchObject({ type: "fret", fret: 3 });
  });

  test("computes dotted and tuplet duration fractions without guessing", () => {
    const durationBars = [
      bar(1, [
        beat(0, {
          durationDenominator: 4,
          dots: 1,
        }),
        beat(1440, {
          durationDenominator: 8,
          tupletNumerator: 3,
          tupletDenominator: 2,
        }),
      ]),
    ];
    const document = normalizeGuitarProIntermediate(
      intermediate([track("Duration proof", staff(STANDARD_GUITAR, durationBars))])
    );

    expect(document.positions[0].duration).toMatchObject({
      name: "dotted quarter note",
      quarterNoteFraction: { numerator: 3, denominator: 2 },
      quarterNoteUnits: 1.5,
    });
    expect(document.positions[1].duration).toMatchObject({
      name: "eighth note tuplet, 3 in the time of 2",
      quarterNoteFraction: { numerator: 1, denominator: 3 },
    });
    expect(document.measures[0].totalQuarterNoteFraction).toEqual({
      numerator: 11,
      denominator: 6,
    });
  });

  test("preserves repeat metadata as a warning without expanding source order", () => {
    const document = normalizeGuitarProIntermediate(
      intermediate([
        track(
          "Repeat proof",
          staff(STANDARD_GUITAR, [
            bar(1, [beat(0)], { repeatStart: true, repeatCount: 2 }),
            bar(2, [beat(960)], { alternateEndings: 1 }),
          ])
        ),
      ])
    );

    expect(document.measures).toHaveLength(2);
    expect(document.positions).toHaveLength(2);
    expect(document.warnings.join(" ")).toMatch(/without expanding playback order/i);
  });

  test("warns about unsupported techniques without making extra positions", () => {
    const document = normalizeGuitarProIntermediate(
      intermediate([
        track(
          "Technique proof",
          staff(STANDARD_GUITAR, [
            bar(1, [
              beat(0, {
                notes: [note(1, 3, { techniques: ["pick scrape"] })],
              }),
            ]),
          ])
        ),
      ])
    );

    expect(document.positions).toHaveLength(1);
    expect(document.warnings.join(" ")).toMatch(/pick scrape/i);
  });

  test("allows one supported staff alongside ignored non-fretted tracks and reports them", () => {
    const vocal = track("Vocal", { tuningMidiHighToLow: [], bars: [] });
    const document = normalizeGuitarProIntermediate(intermediate([vocal, track()]));

    expect(document.sourceTrackName).toBe("Proof guitar");
    expect(document.warnings.join(" ")).toMatch(/1 non-selected Guitar Pro track was ignored/i);
  });

  test("rejects more than one supported tablature track", () => {
    expectErrorCode(
      () => normalizeGuitarProIntermediate(intermediate([track("Guitar 1"), track("Guitar 2")])),
      "MULTIPLE_SUPPORTED_GUITAR_PRO_TRACKS"
    );
  });

  test("rejects unsupported string counts and percussion-only scores", () => {
    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([track("Seven string", staff([64, 59, 55, 50, 45, 40, 35]))])
        ),
      "UNSUPPORTED_GUITAR_PRO_STRING_COUNT"
    );

    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([track("Drums", staff(), { isPercussion: true })])
        ),
      "NO_SUPPORTED_GUITAR_PRO_TRACK"
    );
  });

  test("rejects untested Guitar Pro versions", () => {
    expectErrorCode(
      () => normalizeGuitarProIntermediate(intermediate([track()], { sourceVersion: "GP8" })),
      "UNTESTED_GUITAR_PRO_VERSION"
    );
  });

  test("rejects multiple active voices instead of selecting the first", () => {
    const conflictingBar = bar(1, [beat(0)]);
    conflictingBar.voices.push({ index: 1, beats: [beat(480)] });

    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([track("Voices", staff(STANDARD_GUITAR, [conflictingBar]))])
        ),
      "CONFLICTING_GUITAR_PRO_VOICES"
    );
  });

  test("rejects grace timing and non-increasing onsets", () => {
    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track(
              "Grace",
              staff(STANDARD_GUITAR, [
                bar(1, [beat(0, { graceType: "before-beat" })]),
              ])
            ),
          ])
        ),
      "UNSUPPORTED_GUITAR_PRO_GRACE_TIMING"
    );

    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track(
              "Timeline",
              staff(STANDARD_GUITAR, [bar(1, [beat(0), beat(0)])])
            ),
          ])
        ),
      "AMBIGUOUS_GUITAR_PRO_TIMING"
    );
  });

  test("rejects missing, duplicate, and out-of-range note coordinates", () => {
    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track(
              "Missing",
              staff(STANDARD_GUITAR, [
                bar(1, [beat(0, { notes: [{ visible: false }] })]),
              ])
            ),
          ])
        ),
      "MISSING_GUITAR_PRO_NOTE_COORDINATES"
    );

    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track(
              "Duplicate",
              staff(STANDARD_GUITAR, [
                bar(1, [beat(0, { notes: [note(1, 3), note(1, 5)] })]),
              ])
            ),
          ])
        ),
      "DUPLICATE_GUITAR_PRO_STRING_AT_ONSET"
    );

    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track(
              "Range",
              staff(STANDARD_GUITAR, [
                bar(1, [beat(0, { notes: [note(7, 3)] })]),
              ])
            ),
          ])
        ),
      "GUITAR_PRO_STRING_OUT_OF_RANGE"
    );
  });

  test("enforces resource limits over the entire decoded file", () => {
    const limits = { ...GUITAR_PRO_LIMITS, maxTracks: 1 };
    expectErrorCode(
      () => normalizeGuitarProIntermediate(intermediate([track(), track()]), { limits }),
      "GUITAR_PRO_TRACK_LIMIT"
    );

    const beatLimits = { ...GUITAR_PRO_LIMITS, maxBeats: 1 };
    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track("Too many beats", staff(STANDARD_GUITAR, [bar(1, [beat(0), beat(960)])])),
          ]),
          { limits: beatLimits }
        ),
      "GUITAR_PRO_BEAT_LIMIT"
    );
  });

  test("rejects invalid intermediate schemas and unsupported durations", () => {
    expectErrorCode(
      () => normalizeGuitarProIntermediate({ schemaVersion: 2, tracks: [] }),
      "INVALID_GUITAR_PRO_INTERMEDIATE"
    );

    expectErrorCode(
      () =>
        normalizeGuitarProIntermediate(
          intermediate([
            track(
              "Duration",
              staff(STANDARD_GUITAR, [
                bar(1, [beat(0, { durationDenominator: 3 })]),
              ])
            ),
          ])
        ),
      "UNSUPPORTED_GUITAR_PRO_DURATION"
    );
  });
});

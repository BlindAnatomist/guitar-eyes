import fs from "fs";
import path from "path";
import {
  buildPlaybackTimeline,
  DEFAULT_PLAYBACK_TEMPO_BPM,
  MAX_PLAYBACK_TEMPO_BPM,
  MIN_PLAYBACK_TEMPO_BPM,
  PlaybackTimingError,
} from "./playbackTiming";

function silentStrings(count = 6) {
  return Array.from({ length: count }, (_, index) => ({
    stringId: `string-${index + 1}`,
    type: "silent",
    techniques: [],
  }));
}

function playedPosition(duration, overrides = {}) {
  const strings = silentStrings();
  strings[0] = {
    stringId: "string-1",
    type: "fret",
    fret: 3,
    techniques: [],
  };

  return {
    id: overrides.id || "position",
    number: overrides.number || 1,
    blockNumber: overrides.blockNumber || 1,
    positionInBlock: overrides.positionInBlock || 1,
    strings,
    duration,
    ...overrides,
  };
}

function documentWithPositions(positions, overrides = {}) {
  return {
    type: "tablature-document",
    sourceFormat: "test-format",
    positions,
    measures: [],
    ...overrides,
  };
}

function expectTimingError(callback, code) {
  expect(callback).toThrow(PlaybackTimingError);
  try {
    callback();
  } catch (error) {
    expect(error.code).toBe(code);
  }
}

describe("buildPlaybackTimeline", () => {
  test("uses the explicit checkpoint default of 120 BPM", () => {
    const document = documentWithPositions([
      playedPosition({ quarterNoteUnits: 1 }),
      playedPosition(
        { quarterNoteUnits: 0.5 },
        { id: "position-2", number: 2, positionInBlock: 2 }
      ),
    ]);

    const timeline = buildPlaybackTimeline(document);

    expect(DEFAULT_PLAYBACK_TEMPO_BPM).toBe(120);
    expect(timeline.tempo).toEqual({
      beatsPerMinute: 120,
      source: "checkpoint-default",
      millisecondsPerQuarterNote: 500,
    });
    expect(timeline.positions[0]).toMatchObject({
      startMilliseconds: 0,
      durationMilliseconds: 500,
      endMilliseconds: 500,
    });
    expect(timeline.positions[1]).toMatchObject({
      startMilliseconds: 500,
      durationMilliseconds: 250,
      endMilliseconds: 750,
    });
    expect(timeline.totalDurationMilliseconds).toBe(750);
  });

  test("uses an explicit tempo without changing musical fractions", () => {
    const document = documentWithPositions([
      playedPosition({ quarterNoteUnits: 1 }),
    ]);

    const timeline = buildPlaybackTimeline(document, { beatsPerMinute: 60 });

    expect(timeline.tempo).toEqual({
      beatsPerMinute: 60,
      source: "explicit",
      millisecondsPerQuarterNote: 1000,
    });
    expect(timeline.positions[0].durationQuarterNoteFraction).toEqual({
      numerator: 1,
      denominator: 1,
    });
    expect(timeline.totalDurationMilliseconds).toBe(1000);
  });

  test.each([
    MIN_PLAYBACK_TEMPO_BPM - 1,
    MAX_PLAYBACK_TEMPO_BPM + 1,
    120.5,
    Infinity,
    "120",
  ])("rejects invalid tempo %p", (beatsPerMinute) => {
    const document = documentWithPositions([
      playedPosition({ quarterNoteUnits: 1 }),
    ]);

    expectTimingError(
      () => buildPlaybackTimeline(document, { beatsPerMinute }),
      "INVALID_PLAYBACK_TEMPO"
    );
  });

  test("keeps exact cumulative arithmetic for W, H, Q, E, and S durations", () => {
    const durations = [4, 2, 1, 0.5, 0.25];
    const document = documentWithPositions(
      durations.map((quarterNoteUnits, index) =>
        playedPosition(
          { quarterNoteUnits },
          {
            id: `position-${index + 1}`,
            number: index + 1,
            positionInBlock: index + 1,
          }
        )
      )
    );

    const timeline = buildPlaybackTimeline(document);

    expect(timeline.positions.map((position) => position.startQuarterNoteFraction)).toEqual([
      { numerator: 0, denominator: 1 },
      { numerator: 4, denominator: 1 },
      { numerator: 6, denominator: 1 },
      { numerator: 7, denominator: 1 },
      { numerator: 15, denominator: 2 },
    ]);
    expect(timeline.totalQuarterNoteFraction).toEqual({
      numerator: 31,
      denominator: 4,
    });
    expect(timeline.totalQuarterNoteUnits).toBe(7.75);
    expect(timeline.totalDurationMilliseconds).toBe(3875);
  });

  test("reconstructs exact MusicXML duration fractions from divisions", () => {
    const document = documentWithPositions([
      playedPosition({ durationDivisions: 1, divisionsPerQuarter: 3 }),
      playedPosition(
        { durationDivisions: 2, divisionsPerQuarter: 3 },
        { id: "position-2", number: 2, positionInBlock: 2 }
      ),
    ]);

    const timeline = buildPlaybackTimeline(document);

    expect(timeline.positions[0].durationQuarterNoteFraction).toEqual({
      numerator: 1,
      denominator: 3,
    });
    expect(timeline.positions[1].durationQuarterNoteFraction).toEqual({
      numerator: 2,
      denominator: 3,
    });
    expect(timeline.totalQuarterNoteFraction).toEqual({
      numerator: 1,
      denominator: 1,
    });
  });

  test("preserves exact Guitar Pro tuplet fractions", () => {
    const document = documentWithPositions([
      playedPosition({
        quarterNoteFraction: { numerator: 1, denominator: 3 },
        quarterNoteUnits: 1 / 3,
      }),
      playedPosition(
        {
          quarterNoteFraction: { numerator: 2, denominator: 3 },
          quarterNoteUnits: 2 / 3,
        },
        { id: "position-2", number: 2, positionInBlock: 2 }
      ),
    ]);

    const timeline = buildPlaybackTimeline(document);

    expect(timeline.positions[0].durationQuarterNoteFraction).toEqual({
      numerator: 1,
      denominator: 3,
    });
    expect(timeline.positions[1].startQuarterNoteFraction).toEqual({
      numerator: 1,
      denominator: 3,
    });
    expect(timeline.totalQuarterNoteFraction).toEqual({
      numerator: 1,
      denominator: 1,
    });
  });

  test("treats a chord as one timed onset", () => {
    const strings = silentStrings();
    strings[0] = { stringId: "string-1", type: "open", techniques: [] };
    strings[1] = {
      stringId: "string-2",
      type: "fret",
      fret: 1,
      techniques: [],
    };
    const document = documentWithPositions([
      playedPosition({ quarterNoteUnits: 1 }, { strings }),
    ]);

    const timeline = buildPlaybackTimeline(document);

    expect(timeline.positions).toHaveLength(1);
    expect(timeline.positions[0]).toMatchObject({
      isChord: true,
      isRest: false,
      playedStateCount: 2,
      durationQuarterNoteUnits: 1,
    });
  });

  test("treats a rest as a timed position", () => {
    const rest = {
      id: "rest-1",
      number: 1,
      blockNumber: 1,
      positionInBlock: 1,
      isRest: true,
      strings: silentStrings(),
      duration: { quarterNoteUnits: 2 },
    };
    const timeline = buildPlaybackTimeline(documentWithPositions([rest]));

    expect(timeline.positions[0]).toMatchObject({
      isRest: true,
      isChord: false,
      playedStateCount: 0,
      durationQuarterNoteUnits: 2,
      durationMilliseconds: 1000,
    });
  });

  test("preserves multi-block source order", () => {
    const document = documentWithPositions([
      playedPosition(
        { quarterNoteUnits: 1 },
        { id: "block-1", blockNumber: 1, positionInBlock: 1 }
      ),
      playedPosition(
        { quarterNoteUnits: 1 },
        {
          id: "block-2",
          number: 2,
          blockNumber: 2,
          positionInBlock: 1,
        }
      ),
    ]);

    const timeline = buildPlaybackTimeline(document);

    expect(timeline.playbackOrder).toBe("source-order");
    expect(timeline.positions.map((position) => position.id)).toEqual([
      "block-1",
      "block-2",
    ]);
    expect(timeline.positions.map((position) => position.blockNumber)).toEqual([1, 2]);
  });

  test("builds measure summaries at the correct offsets", () => {
    const positions = [
      playedPosition(
        { quarterNoteUnits: 1 },
        {
          id: "m1p1",
          measureNumber: 1,
          positionInMeasure: 1,
        }
      ),
      playedPosition(
        { quarterNoteUnits: 0.5 },
        {
          id: "m1p2",
          number: 2,
          positionInBlock: 2,
          measureNumber: 1,
          positionInMeasure: 2,
        }
      ),
      playedPosition(
        { quarterNoteUnits: 2 },
        {
          id: "m2p1",
          number: 3,
          positionInBlock: 3,
          measureNumber: 2,
          positionInMeasure: 1,
        }
      ),
    ];
    const measures = [
      {
        id: "measure-1",
        blockNumber: 1,
        number: 1,
        documentNumber: 1,
        sourceNumber: "A",
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
      },
      {
        id: "measure-2",
        blockNumber: 1,
        number: 2,
        documentNumber: 2,
        sourceNumber: "B",
        timeSignatureNumerator: 3,
        timeSignatureDenominator: 4,
      },
    ];

    const timeline = buildPlaybackTimeline(
      documentWithPositions(positions, { measures })
    );

    expect(timeline.measures).toHaveLength(2);
    expect(timeline.measures[0]).toMatchObject({
      id: "measure-1",
      sourceNumber: "A",
      documentNumber: 1,
      positionCount: 2,
      firstTimelineIndex: 0,
      lastTimelineIndex: 1,
      startQuarterNoteUnits: 0,
      durationQuarterNoteUnits: 1.5,
      endQuarterNoteUnits: 1.5,
      durationMilliseconds: 750,
    });
    expect(timeline.measures[1]).toMatchObject({
      id: "measure-2",
      sourceNumber: "B",
      documentNumber: 2,
      positionCount: 1,
      firstTimelineIndex: 2,
      startQuarterNoteUnits: 1.5,
      durationQuarterNoteUnits: 2,
      endQuarterNoteUnits: 3.5,
    });
  });

  test("does not expand repeat or alternate-ending metadata", () => {
    const document = documentWithPositions(
      [
        playedPosition({ quarterNoteUnits: 1 }),
        playedPosition(
          { quarterNoteUnits: 1 },
          { id: "position-2", number: 2, positionInBlock: 2 }
        ),
      ],
      {
        warnings: [
          "Measure 1 contains repeat or alternate-ending metadata. Source-order measures were preserved without expanding playback order.",
        ],
      }
    );

    const timeline = buildPlaybackTimeline(document);

    expect(timeline.repeatExpansion).toBe("not-applied");
    expect(timeline.positions).toHaveLength(2);
    expect(timeline.totalQuarterNoteUnits).toBe(2);
  });

  test("rejects a missing duration instead of guessing", () => {
    const position = playedPosition({ quarterNoteUnits: 1 });
    delete position.duration;

    expectTimingError(
      () => buildPlaybackTimeline(documentWithPositions([position])),
      "PLAYBACK_TIMING_INCOMPLETE"
    );
  });

  test.each([
    [{ quarterNoteUnits: 0 }, "INVALID_PLAYBACK_DURATION"],
    [{ quarterNoteUnits: -1 }, "INVALID_PLAYBACK_DURATION"],
    [{ quarterNoteUnits: NaN }, "INVALID_PLAYBACK_DURATION"],
    [
      { quarterNoteFraction: { numerator: 1, denominator: 0 } },
      "UNREPRESENTABLE_PLAYBACK_DURATION",
    ],
    [
      { quarterNoteFraction: { numerator: 0, denominator: 1 } },
      "INVALID_PLAYBACK_DURATION",
    ],
    [
      { durationDivisions: 1, divisionsPerQuarter: 0 },
      "UNREPRESENTABLE_PLAYBACK_DURATION",
    ],
  ])("rejects unsafe duration evidence %#", (duration, code) => {
    expectTimingError(
      () =>
        buildPlaybackTimeline(
          documentWithPositions([playedPosition(duration)])
        ),
      code
    );
  });

  test("rejects invalid or empty semantic documents", () => {
    expectTimingError(
      () => buildPlaybackTimeline(null),
      "INVALID_PLAYBACK_DOCUMENT"
    );
    expectTimingError(
      () => buildPlaybackTimeline({ positions: "not-an-array" }),
      "INVALID_PLAYBACK_DOCUMENT"
    );
    expectTimingError(
      () => buildPlaybackTimeline({ positions: [] }),
      "EMPTY_PLAYBACK_DOCUMENT"
    );
  });

  test("does not mutate the semantic document", () => {
    const document = documentWithPositions([
      playedPosition({ quarterNoteUnits: 1 }),
    ]);
    const before = JSON.stringify(document);

    buildPlaybackTimeline(document);

    expect(JSON.stringify(document)).toBe(before);
  });

  test("keeps browser, React, worker, renderer, and audio dependencies out of the module", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src", "playbackTiming.js"),
      "utf8"
    );

    expect(source).not.toMatch(/from\s+["']react["']/i);
    expect(source).not.toMatch(
      /window\.(requestAnimationFrame|setTimeout)|document\.(querySelector|getElementById)|new\s+Worker|AudioContext|webkitAudioContext/
    );
    expect(source).not.toMatch(/alphaSynth|soundfont|renderer|play\s*\(/i);
  });
});

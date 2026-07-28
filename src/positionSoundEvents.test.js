import {
  buildPositionSoundEvents,
  PositionSoundEventError,
} from "./positionSoundEvents";

function string(id, tuning, octave = null, tuningMidi = null) {
  return {
    id,
    tuning,
    ...(octave === null ? {} : { octave }),
    ...(tuningMidi === null ? {} : { tuningMidi }),
  };
}

function silent(stringId) {
  return { stringId, type: "silent", techniques: [] };
}

function documentFixture({
  instrument = "guitar",
  strings = [
    string("s1", "E"),
    string("s2", "B"),
    string("s3", "G"),
    string("s4", "D"),
    string("s5", "A"),
    string("s6", "E"),
  ],
  positions,
} = {}) {
  const resolvedPositions = positions || [
    {
      id: "p1",
      number: 1,
      blockNumber: 1,
      positionInBlock: 1,
      measureNumber: 1,
      positionInMeasure: 1,
      duration: { quarterNoteUnits: 1 },
      strings: [
        { stringId: strings[0].id, type: "open", techniques: [] },
        ...strings.slice(1).map((entry) => silent(entry.id)),
      ],
    },
  ];

  return {
    type: "tablature-document",
    sourceFormat: "test",
    instrument,
    instrumentLabel: instrument,
    stringCount: strings.length,
    strings,
    positions: resolvedPositions,
    blocks: [{ index: 0, number: 1, positions: resolvedPositions, strings }],
    measures: [],
    warnings: [],
  };
}

function expectCode(run, code) {
  expect(run).toThrow(PositionSoundEventError);
  try {
    run();
  } catch (error) {
    expect(error.code).toBe(code);
  }
}

describe("buildPositionSoundEvents", () => {
  test("derives accepted standard six-string guitar pitches without guessing custom tuning", () => {
    const result = buildPositionSoundEvents(documentFixture(), 0);

    expect(result.pitchedEventCount).toBe(1);
    expect(result.events[0]).toMatchObject({
      type: "pitched-string",
      stringId: "s1",
      fret: 0,
      midi: 64,
      onsetMilliseconds: 0,
      durationMilliseconds: 500,
    });
    expect(result.events[0].frequencyHz).toBeCloseTo(329.627, 2);
  });

  test("derives accepted standard four-string bass pitches", () => {
    const strings = [
      string("g", "G"),
      string("d", "D"),
      string("a", "A"),
      string("e", "E"),
    ];
    const positions = [
      {
        id: "bass-open-e",
        duration: { quarterNoteUnits: 2 },
        strings: [silent("g"), silent("d"), silent("a"), {
          stringId: "e",
          type: "open",
          techniques: [],
        }],
      },
    ];

    const result = buildPositionSoundEvents(
      documentFixture({ instrument: "bass", strings, positions }),
      0
    );

    expect(result.events[0].midi).toBe(28);
    expect(result.durationMilliseconds).toBe(1000);
  });

  test("uses explicit octave evidence for custom tuning", () => {
    const strings = [
      string("custom", "D", 4),
      string("s2", "B", 3),
      string("s3", "G", 3),
      string("s4", "D", 3),
      string("s5", "A", 2),
      string("s6", "D", 2),
    ];
    const positions = [
      {
        id: "custom-fret",
        duration: { quarterNoteUnits: 0.5 },
        strings: [
          { stringId: "custom", type: "fret", fret: 2, techniques: [] },
          ...strings.slice(1).map((entry) => silent(entry.id)),
        ],
      },
    ];

    const result = buildPositionSoundEvents(
      documentFixture({ strings, positions }),
      0
    );

    expect(result.events[0].midi).toBe(64);
    expect(result.durationMilliseconds).toBe(250);
  });

  test("rejects custom tuning without octave evidence", () => {
    const strings = [
      string("custom", "D"),
      string("s2", "B"),
      string("s3", "G"),
      string("s4", "D"),
      string("s5", "A"),
      string("s6", "D"),
    ];
    const positions = [
      {
        duration: { quarterNoteUnits: 1 },
        strings: [
          { stringId: "custom", type: "open", techniques: [] },
          ...strings.slice(1).map((entry) => silent(entry.id)),
        ],
      },
    ];

    expectCode(
      () => buildPositionSoundEvents(documentFixture({ strings, positions }), 0),
      "PLAYBACK_PITCH_INCOMPLETE"
    );
  });

  test("preserves a chord as one onset with one event per played string", () => {
    const base = documentFixture();
    base.positions[0] = {
      ...base.positions[0],
      duration: { quarterNoteFraction: { numerator: 1, denominator: 3 } },
      strings: [
        { stringId: "s1", type: "open", techniques: [] },
        { stringId: "s2", type: "fret", fret: 1, techniques: [] },
        ...base.strings.slice(2).map((entry) => silent(entry.id)),
      ],
    };

    const result = buildPositionSoundEvents(base, 0, { beatsPerMinute: 60 });

    expect(result.isChord).toBe(true);
    expect(result.pitchedEventCount).toBe(2);
    expect(result.events.map((event) => event.onsetMilliseconds)).toEqual([0, 0]);
    expect(result.events.map((event) => event.midi)).toEqual([64, 60]);
    expect(result.durationQuarterNoteFraction).toEqual({ numerator: 1, denominator: 3 });
  });

  test("returns a timed rest without pitched events", () => {
    const base = documentFixture();
    base.positions[0] = {
      ...base.positions[0],
      isRest: true,
      duration: { quarterNoteUnits: 2 },
      strings: base.strings.map((entry) => silent(entry.id)),
    };

    const result = buildPositionSoundEvents(base, 0);

    expect(result.isRest).toBe(true);
    expect(result.events).toEqual([]);
    expect(result.durationMilliseconds).toBe(1000);
  });

  test("represents explicit mute notation without inventing a pitch", () => {
    const base = documentFixture();
    base.positions[0] = {
      ...base.positions[0],
      strings: [
        {
          stringId: "s1",
          type: "technique",
          name: "muted note",
          techniques: [],
        },
        ...base.strings.slice(1).map((entry) => silent(entry.id)),
      ],
    };

    const result = buildPositionSoundEvents(base, 0);

    expect(result.pitchedEventCount).toBe(0);
    expect(result.mutedEventCount).toBe(1);
    expect(result.events[0]).toMatchObject({
      type: "muted-string",
      stringId: "s1",
      onsetMilliseconds: 0,
    });
    expect(result.events[0]).not.toHaveProperty("midi");
  });

  test("rejects malformed pitch, fret, timeline, and string identity", () => {
    const outOfRange = documentFixture({
      strings: [
        string("s1", "E", null, 127),
        string("s2", "B", null, 59),
        string("s3", "G", null, 55),
        string("s4", "D", null, 50),
        string("s5", "A", null, 45),
        string("s6", "E", null, 40),
      ],
    });
    outOfRange.positions[0].strings[0] = {
      stringId: "s1",
      type: "fret",
      fret: 1,
      techniques: [],
    };
    expectCode(
      () => buildPositionSoundEvents(outOfRange, 0),
      "INVALID_POSITION_SOUND_PITCH"
    );

    const badFret = documentFixture();
    badFret.positions[0].strings[0] = {
      stringId: "s1",
      type: "fret",
      fret: -1,
      techniques: [],
    };
    expectCode(
      () => buildPositionSoundEvents(badFret, 0),
      "INVALID_POSITION_SOUND_FRET"
    );

    expectCode(
      () =>
        buildPositionSoundEvents(documentFixture(), 0, {
          timeline: { type: "playback-timeline", positions: [] },
        }),
      "INVALID_POSITION_SOUND_TIMELINE"
    );

    const duplicate = documentFixture();
    duplicate.positions[0].strings[1] = {
      stringId: "s1",
      type: "open",
      techniques: [],
    };
    expectCode(
      () => buildPositionSoundEvents(duplicate, 0),
      "INVALID_POSITION_SOUND_STRING_IDENTITY"
    );
  });

  test("does not mutate the semantic document", () => {
    const document = documentFixture();
    const before = JSON.stringify(document);

    buildPositionSoundEvents(document, 0);

    expect(JSON.stringify(document)).toBe(before);
  });
});

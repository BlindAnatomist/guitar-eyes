import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";

function makeBeat(overrides = {}) {
  return {
    absoluteDisplayStart: 0,
    displayDuration: 960,
    duration: 4,
    dots: 0,
    tupletNumerator: -1,
    tupletDenominator: -1,
    graceType: 0,
    isRest: false,
    tap: false,
    slap: false,
    pop: false,
    notes: [],
    ...overrides,
  };
}

function makeNote(overrides = {}) {
  return {
    string: 1,
    fret: 3,
    isVisible: true,
    isDead: false,
    isHammerPullOrigin: false,
    hammerPullDestination: null,
    slideInType: 0,
    slideOutType: 0,
    hasBend: false,
    vibrato: 0,
    isLetRing: false,
    isPalmMute: false,
    isLeftHandTapped: false,
    isHarmonic: false,
    ...overrides,
  };
}

function makeScore(beat = makeBeat({ notes: [makeNote()] })) {
  const masterBar = {
    index: 0,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    isRepeatStart: false,
    repeatCount: 0,
    alternateEndings: 0,
  };
  return {
    title: "Original GP7 proof",
    tracks: [
      {
        name: "Guitar",
        shortName: "Gtr",
        isPercussion: false,
        staves: [
          {
            tuning: [64, 59, 55, 50, 45, 40],
            bars: [
              {
                masterBar,
                voices: [{ index: 0, beats: [beat] }],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("alphaTabScoreToGuitarProIntermediate", () => {
  test("extracts only serializable score, track, staff, bar, voice, beat, and note fields", () => {
    const result = alphaTabScoreToGuitarProIntermediate(makeScore());

    expect(result).toEqual({
      schemaVersion: 1,
      sourceVersion: "GP7",
      title: "Original GP7 proof",
      tracks: [
        {
          name: "Guitar",
          shortName: "Gtr",
          isPercussion: false,
          staves: [
            {
              tuningMidiHighToLow: [64, 59, 55, 50, 45, 40],
              bars: [
                {
                  sourceNumber: 1,
                  timeSignatureNumerator: 4,
                  timeSignatureDenominator: 4,
                  repeatStart: false,
                  repeatCount: 0,
                  alternateEndings: 0,
                  voices: [
                    {
                      index: 0,
                      beats: [
                        {
                          startTicks: 0,
                          displayDurationTicks: 960,
                          durationDenominator: 4,
                          dots: 0,
                          tupletNumerator: -1,
                          tupletDenominator: -1,
                          graceType: "none",
                          isRest: false,
                          techniques: [],
                          notes: [
                            {
                              stringNumberLowToHigh: 1,
                              fret: 3,
                              visible: true,
                              isDead: false,
                              techniques: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  test("maps deterministic note and beat effects into names owned by Guitar Eyes", () => {
    const destination = makeNote({ fret: 5 });
    const beat = makeBeat({
      tap: true,
      slap: true,
      pop: true,
      notes: [
        makeNote({
          isHammerPullOrigin: true,
          hammerPullDestination: destination,
          slideOutType: 1,
          hasBend: true,
          vibrato: 1,
          isLetRing: true,
          isPalmMute: true,
          isLeftHandTapped: true,
          isHarmonic: true,
        }),
      ],
    });

    const result = alphaTabScoreToGuitarProIntermediate(makeScore(beat));
    const extractedBeat = result.tracks[0].staves[0].bars[0].voices[0].beats[0];

    expect(extractedBeat.techniques).toEqual(["tap", "slap", "pop"]);
    expect(extractedBeat.notes[0].techniques).toEqual([
      "hammer-on",
      "slide",
      "bend",
      "vibrato",
      "let ring",
      "palm mute",
      "tap",
      "harmonic",
    ]);
  });

  test("distinguishes pull-off direction and unsupported grace timing", () => {
    const beat = makeBeat({
      graceType: 1,
      notes: [
        makeNote({
          fret: 7,
          isHammerPullOrigin: true,
          hammerPullDestination: makeNote({ fret: 5 }),
        }),
      ],
    });

    const result = alphaTabScoreToGuitarProIntermediate(makeScore(beat));
    const extractedBeat = result.tracks[0].staves[0].bars[0].voices[0].beats[0];

    expect(extractedBeat.graceType).toBe("unsupported");
    expect(extractedBeat.notes[0].techniques).toContain("pull-off");
  });

  test("does not preserve object references from the alphaTab graph", () => {
    const score = makeScore();
    score.tracks[0].score = score;
    score.tracks[0].staves[0].track = score.tracks[0];
    score.tracks[0].staves[0].bars[0].staff = score.tracks[0].staves[0];

    const result = alphaTabScoreToGuitarProIntermediate(score);

    expect(result.tracks[0]).not.toHaveProperty("score");
    expect(result.tracks[0].staves[0]).not.toHaveProperty("track");
    expect(result.tracks[0].staves[0].bars[0]).not.toHaveProperty("staff");
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});

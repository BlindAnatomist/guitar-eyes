import {
  canonicalizeHistoricalPowerTabDocument,
  decodeHistoricalFlagString,
  HISTORICAL_NOTE_PROPERTIES,
  HISTORICAL_POSITION_PROPERTIES,
} from "./powerTabHistoricalPt2Compatibility";

const EMPTY_NOTE_FLAGS = "00000000000000000";
const REST_FLAGS = "00000000000000000100";
const PALM_MUTE_FLAGS = "00000010000000000000";

function historicalV1Document() {
  return {
    version: 1,
    score: {
      systems: [
        {
          barlines: [
            {
              bar_type: 0,
              key_signature: { key_type: 0 },
              time_signature: { meter_type: 0 },
            },
          ],
          staves: [
            {
              view_type: 0,
              clef_type: 0,
              voices: {
                0: {
                  positions: [
                    {
                      duration: 4,
                      properties: PALM_MUTE_FLAGS,
                      notes: [
                        {
                          properties: EMPTY_NOTE_FLAGS,
                          trill: -1,
                          tapped_harmonic: -1,
                        },
                      ],
                    },
                    {
                      duration: 2,
                      properties: REST_FLAGS,
                      notes: null,
                    },
                  ],
                },
                1: { positions: null },
              },
            },
          ],
        },
      ],
    },
  };
}

describe("historical PowerTab .pt2 canonicalization", () => {
  test("decodes historical bitset ordering exactly", () => {
    expect(
      decodeHistoricalFlagString(
        REST_FLAGS,
        HISTORICAL_POSITION_PROPERTIES
      )
    ).toEqual(["Rest"]);
    expect(
      decodeHistoricalFlagString(
        PALM_MUTE_FLAGS,
        HISTORICAL_POSITION_PROPERTIES
      )
    ).toEqual(["PalmMuting"]);
    expect(
      decodeHistoricalFlagString(EMPTY_NOTE_FLAGS, HISTORICAL_NOTE_PROPERTIES)
    ).toEqual([]);
  });

  test("canonicalizes the version-1 integer and bitset representation", () => {
    const source = historicalV1Document();
    const value = canonicalizeHistoricalPowerTabDocument(source);
    const staff = value.score.systems[0].staves[0];
    const positions = staff.voices[0].positions;
    const barline = value.score.systems[0].barlines[0];

    expect(source.score.systems[0].staves[0].view_type).toBe(0);
    expect(staff.view_type).toBeUndefined();
    expect(staff.clef_type).toBe("Treble");
    expect(barline.bar_type).toBe("SingleBar");
    expect(barline.key_signature.key_type).toBe("Major");
    expect(barline.time_signature.meter_type).toBe("Normal");
    expect(positions[0].duration).toBe("Quarter");
    expect(positions[0].properties).toEqual(["PalmMuting"]);
    expect(positions[0].notes[0].properties).toEqual([]);
    expect(positions[0].notes[0].trill).toBeNull();
    expect(positions[0].notes[0].tapped_harmonic).toBeNull();
    expect(positions[1].duration).toBe("Half");
    expect(positions[1].properties).toEqual(["Rest"]);
  });

  test("rejects a non-guitar legacy staff view instead of guessing", () => {
    const value = historicalV1Document();
    value.score.systems[0].staves[0].view_type = 1;

    expect(() => canonicalizeHistoricalPowerTabDocument(value)).toThrow(
      /accepts GuitarView only/i
    );
  });

  test("rejects malformed historical property evidence", () => {
    const value = historicalV1Document();
    value.score.systems[0].staves[0].voices[0].positions[0].properties = "100";

    expect(() => canonicalizeHistoricalPowerTabDocument(value)).toThrow(
      /exact 20-bit string/i
    );
  });
});

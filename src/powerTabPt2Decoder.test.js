import fs from "fs";
import path from "path";
import {
  HISTORICAL_NOTE_PROPERTIES,
  HISTORICAL_POSITION_PROPERTIES,
} from "./powerTabHistoricalPt2Compatibility";
import { decodePowerTabPt2Document } from "./powerTabPt2Decoder";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";

const BAR_TYPES = {
  SingleBar: 0,
  DoubleBar: 1,
  FreeTimeBar: 2,
  RepeatStart: 3,
  RepeatEnd: 4,
  DoubleBarFine: 5,
};
const KEY_TYPES = { Major: 0, Minor: 1 };
const METER_TYPES = { Normal: 0, CutTime: 1, CommonTime: 2 };
const CLEF_TYPES = { Treble: 0, Bass: 1 };
const DURATIONS = {
  Whole: 1,
  Half: 2,
  Quarter: 4,
  Eighth: 8,
  Sixteenth: 16,
  ThirtySecond: 32,
  SixtyFourth: 64,
};

function source() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-v11",
        "powertab-v11-original-six-position.source.json"
      ),
      "utf8"
    )
  );
}

function bitString(active, names) {
  const set = new Set(Array.isArray(active) ? active : []);
  return names
    .map((name) => (set.has(name) ? "1" : "0"))
    .reverse()
    .join("");
}

function historicalSource(version) {
  const value = source();
  value.version = version;
  if (version < 3) delete value.score.view_filters;
  if (version < 9) delete value.score.chord_diagrams;
  if (version < 6 && value.score.score_info.song_data) {
    delete value.score.score_info.song_data.subtitle;
  }

  value.score.systems.forEach((system) => {
    if (version < 2) delete system.text_items;
    system.barlines.forEach((barline) => {
      if (version < 10) {
        barline.bar_type = BAR_TYPES[barline.bar_type];
        barline.key_signature.key_type = KEY_TYPES[barline.key_signature.key_type];
        barline.time_signature.meter_type =
          METER_TYPES[barline.time_signature.meter_type];
      }
    });
    system.staves.forEach((staff) => {
      if (version < 3) staff.view_type = 0;
      if (version < 10) staff.clef_type = CLEF_TYPES[staff.clef_type];
      Object.values(staff.voices).forEach((voice) => {
        if (!Array.isArray(voice.positions)) return;
        voice.positions.forEach((position) => {
          if (version < 7) delete position.volume_swell;
          if (version < 8) delete position.tremolo_bar;
          if (version < 10) {
            position.duration = DURATIONS[position.duration];
            position.properties = bitString(
              position.properties,
              HISTORICAL_POSITION_PROPERTIES
            );
          }
          if (!Array.isArray(position.notes)) return;
          position.notes.forEach((note) => {
            if (version < 4) delete note.finger_hint;
            if (version < 10) {
              note.properties = bitString(
                note.properties,
                HISTORICAL_NOTE_PROPERTIES
              );
              if (note.trill == null) note.trill = -1;
              if (note.tapped_harmonic == null) note.tapped_harmonic = -1;
            }
          });
        });
      });
    });
  });
  return value;
}

function expectSixPositionProof(intermediate, version) {
  expect(intermediate).toMatchObject({
    sourceVersion: `PT2_V${version}`,
    versionEvidence: {
      internalVersion: version,
      containerFamily: "POWERTAB_PT2_GZIP_JSON",
    },
  });
  expect(intermediate.tracks).toHaveLength(1);
  const bars = intermediate.tracks[0].staves[0].bars;
  expect(bars).toHaveLength(2);
  expect(bars.flatMap((bar) => bar.voices[0].beats)).toHaveLength(6);
}

describe("PowerTab .pt2 version-family decoder", () => {
  test.each([1, 2, 3, 4, 5, 6, 7, 8, 9])(
    "canonicalizes internal version %i into the bounded six-position model",
    (version) => {
      const intermediate = decodePowerTabPt2Document(historicalSource(version));
      expectSixPositionProof(intermediate, version);
      expect(intermediate.versionEvidence.historicalSerialization).toBe(
        "integer-enums-bitset-flags"
      );

      const document = normalizeVerifiedPowerTabIntermediate(intermediate);
      expect(document.sourceVersion).toBe(`PT2_V${version}`);
      expect(document.positions).toHaveLength(6);
      expect(document.positions[4].isRest).toBe(true);
      expect(document.positions[3].strings[3].techniques).toEqual([
        expect.objectContaining({ name: "palm mute", source: "powertab-pt2" }),
      ]);
    }
  );

  test("accepts internal version 10 with named enum and flag serialization", () => {
    const value = source();
    value.version = 10;
    const intermediate = decodePowerTabPt2Document(value);

    expectSixPositionProof(intermediate, 10);
    expect(intermediate.versionEvidence).toMatchObject({
      historicalSerialization: "named-enums-named-flags",
      sourceMilestoneCommit: "ad7e051e1f1bb784c54b1ee564ef19682258dff8",
    });
    expect(normalizeVerifiedPowerTabIntermediate(intermediate).positions).toHaveLength(6);
  });

  test("delegates internal version 11 to the already accepted exact decoder", () => {
    const value = source();
    expect(decodePowerTabPt2Document(value)).toEqual(
      decodePowerTabV11Document(value)
    );
  });

  test("rejects internal versions outside the investigated family", () => {
    const value = source();
    value.version = 12;
    expect(() => decodePowerTabPt2Document(value)).toThrow(
      /accepts exact versions 1 through 11 only/i
    );
  });
});

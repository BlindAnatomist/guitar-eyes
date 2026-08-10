import crypto from "crypto";
import fs from "fs";
import path from "path";
import { gzipSync } from "zlib";

const ROOT = process.cwd();
const SOURCE_PATH = path.join(
  ROOT,
  "fixtures",
  "powertab-v11",
  "powertab-v11-original-six-position.source.json"
);
const OUT_DIR = path.join(ROOT, "fixtures", "powertab-pt2-historical");

const MILESTONE_COMMITS = {
  1: "8f780d0f36157e9209662908994c6c27ced184ff",
  2: "84236e64c72a6d933ef3ca3b358e28fef3786f07",
  3: "044c1d30ee6a0374e02154d47f7ebcc4b80296e8",
  4: "17a2e1bf49a417f2dc5244f7a9868d24edc839ce",
  5: "42d2f00195efd4bb7c5aae65b2d6e36a5b7db935",
  6: "0152c3320e48368e93752382d16fd4e1d71ef538",
  7: "17219c446434f6ec0c6cb52e14770759219015de",
  8: "bca17cbb1b2ddfbd1f273bb9eda427044ed7a446",
  9: "228836ac7c18a59873d1c0231580c854d262e872",
  10: "ad7e051e1f1bb784c54b1ee564ef19682258dff8",
};

const ENUM_VALUES = {
  clef_type: { Treble: 0, Bass: 1 },
  bar_type: {
    SingleBar: 0,
    DoubleBar: 1,
    FreeTimeBar: 2,
    RepeatStart: 3,
    RepeatEnd: 4,
    DoubleBarFine: 5,
  },
  key_type: { Major: 0, Minor: 1 },
  meter_type: { Normal: 0, CutTime: 1, CommonTime: 2 },
  duration: {
    Whole: 1,
    Half: 2,
    Quarter: 4,
    Eighth: 8,
    Sixteenth: 16,
    ThirtySecond: 32,
    SixtyFourth: 64,
  },
};

const POSITION_PROPERTIES = [
  "Dotted",
  "DoubleDotted",
  "Rest",
  "Vibrato",
  "WideVibrato",
  "ArpeggioUp",
  "ArpeggioDown",
  "PickStrokeUp",
  "PickStrokeDown",
  "Staccato",
  "Marcato",
  "Sforzando",
  "TremoloPicking",
  "PalmMuting",
  "Tap",
  "Acciaccatura",
  "TripletFeelFirst",
  "TripletFeelSecond",
  "LetRing",
  "Fermata",
];

const NOTE_PROPERTIES = [
  "Tied",
  "Muted",
  "HammerOnOrPullOff",
  "HammerOnFromNowhere",
  "PullOffToNowhere",
  "NaturalHarmonic",
  "GhostNote",
  "Octave8va",
  "Octave15ma",
  "Octave8vb",
  "Octave15mb",
  "SlideIntoFromBelow",
  "SlideIntoFromAbove",
  "ShiftSlide",
  "LegatoSlide",
  "SlideOutOfDownwards",
  "SlideOutOfUpwards",
];

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function bitString(active, names) {
  const activeSet = new Set(Array.isArray(active) ? active : []);
  return names
    .map((name) => (activeSet.has(name) ? "1" : "0"))
    .reverse()
    .join("");
}

function enumValue(value, table, label) {
  const resolved = table[value];
  if (!Number.isInteger(resolved)) {
    throw new Error(`Unsupported ${label}: ${String(value)}`);
  }
  return resolved;
}

function historicalDocument(source, version) {
  const document = clone(source);
  document.version = version;
  const score = document.score;
  const songData = score.score_info?.song_data;

  if (songData) {
    songData.title = `Guitar Eyes PowerTab internal version ${version} Proof`;
    if (version < 6) delete songData.subtitle;
    else songData.subtitle = `Project-authored internal-version-${version} six-position proof`;
  }

  if (version < 3) delete score.view_filters;
  if (version < 9) delete score.chord_diagrams;

  score.systems.forEach((system) => {
    if (version < 2) delete system.text_items;

    system.barlines.forEach((barline) => {
      if (version < 10) {
        barline.bar_type = enumValue(
          barline.bar_type,
          ENUM_VALUES.bar_type,
          "bar type"
        );
        barline.key_signature.key_type = enumValue(
          barline.key_signature.key_type,
          ENUM_VALUES.key_type,
          "key type"
        );
        barline.time_signature.meter_type = enumValue(
          barline.time_signature.meter_type,
          ENUM_VALUES.meter_type,
          "meter type"
        );
      }
    });

    system.staves.forEach((staff) => {
      if (version < 3) staff.view_type = 0;
      else delete staff.view_type;

      if (version < 10) {
        staff.clef_type = enumValue(
          staff.clef_type,
          ENUM_VALUES.clef_type,
          "clef type"
        );
      }

      Object.values(staff.voices).forEach((voice) => {
        if (!Array.isArray(voice.positions)) return;
        voice.positions.forEach((position) => {
          if (version < 7) delete position.volume_swell;
          if (version < 8) delete position.tremolo_bar;

          if (version < 10) {
            position.duration = enumValue(
              position.duration,
              ENUM_VALUES.duration,
              "duration"
            );
            position.properties = bitString(
              position.properties,
              POSITION_PROPERTIES
            );
          }

          if (!Array.isArray(position.notes)) return;
          position.notes.forEach((note) => {
            if (version < 4) delete note.finger_hint;
            if (version < 10) {
              note.properties = bitString(note.properties, NOTE_PROPERTIES);
              if (note.trill == null) note.trill = -1;
              if (note.tapped_harmonic == null) note.tapped_harmonic = -1;
            }
          });
        });
      });
    });
  });

  return document;
}

const source = JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
fs.mkdirSync(OUT_DIR, { recursive: true });

const manifest = {
  schemaVersion: 1,
  fixtureFamily: "POWERTAB_PT2_HISTORICAL_SOURCE_DERIVED",
  sourceLicense: "CC0-1.0",
  sourcePath: path.relative(ROOT, SOURCE_PATH),
  upstreamRepository: "powertab/powertabeditor",
  upstreamRelease: "2.0.22",
  upstreamCommit: "13cab27c7127d301f2747671071e53eb203dc940",
  gzip: { level: 9, mtime: 0 },
  fixtures: [],
};

for (let version = 1; version <= 10; version += 1) {
  const document = historicalDocument(source, version);
  const json = `${JSON.stringify(document)}\n`;
  const compressed = gzipSync(Buffer.from(json, "utf8"), { level: 9, mtime: 0 });
  const stem = `powertab-pt2-v${version}-six-position`;
  const jsonName = `${stem}.json`;
  const binaryName = `${stem}.pt2`;
  const base64Name = `${binaryName}.base64`;
  const base64 = `${compressed.toString("base64")}\n`;

  fs.writeFileSync(path.join(OUT_DIR, jsonName), json);
  fs.writeFileSync(path.join(OUT_DIR, binaryName), compressed);
  fs.writeFileSync(path.join(OUT_DIR, base64Name), base64);

  manifest.fixtures.push({
    internalVersion: version,
    sourceVersion: `PT2_V${version}`,
    sourceMilestoneCommit: MILESTONE_COMMITS[version],
    historicalSerialization:
      version < 10
        ? "integer-enums-bitset-flags"
        : "named-enums-named-flags",
    json: {
      path: jsonName,
      bytes: Buffer.byteLength(json),
      sha256: sha256(Buffer.from(json)),
    },
    binary: {
      path: binaryName,
      bytes: compressed.length,
      sha256: sha256(compressed),
    },
    base64: {
      path: base64Name,
      bytes: Buffer.byteLength(base64),
      sha256: sha256(Buffer.from(base64)),
    },
  });
}

fs.writeFileSync(
  path.join(OUT_DIR, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log(`Generated ${manifest.fixtures.length} historical .pt2 proofs.`);

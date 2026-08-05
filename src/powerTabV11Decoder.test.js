import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { TextDecoder as NodeTextDecoder } from "util";
import { gunzipSync } from "zlib";
import {
  decodePowerTabV11Bytes,
  decodePowerTabV11Document,
} from "./powerTabV11Decoder";
import { PowerTabImportError } from "./powerTabErrors";

if (typeof globalThis.TextDecoder !== "function") {
  globalThis.TextDecoder = NodeTextDecoder;
}

function fixturePath(filename) {
  return path.join(
    process.cwd(),
    "fixtures",
    "powertab-v11",
    filename
  );
}

function fixtureSource() {
  return JSON.parse(
    fs.readFileSync(
      fixturePath("powertab-v11-original-six-position.source.json"),
      "utf8"
    )
  );
}

function editorFixtureSource() {
  return JSON.parse(
    fs.readFileSync(
      fixturePath("powertab-v11-editor-export-six-position.json"),
      "utf8"
    )
  );
}

function fixtureBytes() {
  return Buffer.from(
    fs
      .readFileSync(
        fixturePath("powertab-v11-original-six-position.pt2.base64"),
        "utf8"
      )
      .trim(),
    "base64"
  );
}

function editorFixtureBytes() {
  return fs.readFileSync(
    fixturePath("powertab-v11-editor-export-six-position.pt2")
  );
}

function editorFixtureMirrorBytes() {
  return Buffer.from(
    fs
      .readFileSync(
        fixturePath("powertab-v11-editor-export-six-position.pt2.base64"),
        "utf8"
      )
      .trim(),
    "base64"
  );
}

function fixtureManifest() {
  return JSON.parse(
    fs.readFileSync(fixturePath("manifest.json"), "utf8")
  );
}

function fixtureComparison() {
  return JSON.parse(
    fs.readFileSync(
      fixturePath("powertab-v11-editor-export-six-position.comparison.json"),
      "utf8"
    )
  );
}

function expectCode(callback, code) {
  try {
    callback();
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(PowerTabImportError);
    expect(error.code).toBe(code);
  }
}

function expectSixPositionIntermediate(intermediate) {
  expect(intermediate).toMatchObject({
    schemaVersion: 1,
    sourceVersion: "PT2_V11",
    title: "Guitar Eyes PowerTab v11 Proof",
    versionEvidence: {
      containerFamily: "POWERTAB_PT2_GZIP_JSON",
      internalVersion: 11,
      upstreamRelease: "2.0.22",
      upstreamCommit: "13cab27c7127d301f2747671071e53eb203dc940",
      declaredPlayerCount: 1,
      decodedTrackCount: 1,
    },
  });
  expect(intermediate.tracks[0]).toMatchObject({
    name: "Proof Guitar",
    isPercussion: false,
  });
  expect(intermediate.tracks[0].staves[0].tuningMidiHighToLow).toEqual([
    64, 59, 55, 50, 45, 40,
  ]);
  expect(intermediate.tracks[0].staves[0].bars).toHaveLength(2);
  expect(
    intermediate.tracks[0].staves[0].bars.map(
      (bar) => bar.voices[0].beats.length
    )
  ).toEqual([4, 2]);
  expect(
    intermediate.tracks[0].staves[0].bars[0].voices[0].beats.map(
      (beat) => beat.startTicks
    )
  ).toEqual([0, 960, 1440, 1920]);
  expect(
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats.map(
      (beat) => beat.startTicks
    )
  ).toEqual([3840, 5760]);
  expect(
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats[0].isRest
  ).toBe(true);
  expect(
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats[1].notes
  ).toHaveLength(2);
}

describe("PowerTab v11 decoder", () => {
  test("decodes the lawful six-position source into a bounded intermediate", () => {
    expectSixPositionIntermediate(
      decodePowerTabV11Document(fixtureSource())
    );
  });

  test("decodes the exact editor-resaved document with lawful null empty collections", () => {
    const source = editorFixtureSource();

    expect(
      source.score.systems[0].staves[0].voices["0"].positions[4].notes
    ).toBeNull();
    expect(
      source.score.systems[0].staves[0].voices["1"].positions
    ).toBeNull();
    expectSixPositionIntermediate(decodePowerTabV11Document(source));
  });

  test("validates and decompresses the source-derived and exact editor containers", async () => {
    const decompress = async (bytes) =>
      Uint8Array.from(gunzipSync(Buffer.from(bytes)));

    const sourceIntermediate = await decodePowerTabV11Bytes(fixtureBytes(), {
      decompress,
    });
    const editorIntermediate = await decodePowerTabV11Bytes(
      editorFixtureBytes(),
      { decompress }
    );

    expectSixPositionIntermediate(sourceIntermediate);
    expectSixPositionIntermediate(editorIntermediate);
  });

  test("verifies source and editor fixture hashes, mirrors, and provenance", () => {
    const source = fixtureSource();
    const manifest = fixtureManifest();
    const comparison = fixtureComparison();
    const canonical = `${JSON.stringify(source)}\n`;
    const binary = fixtureBytes();
    const editorBinary = editorFixtureBytes();
    const editorMirror = editorFixtureMirrorBytes();
    const editorJson = fs.readFileSync(
      fixturePath("powertab-v11-editor-export-six-position.json")
    );

    expect(manifest).toMatchObject({
      schemaVersion: 2,
      supportState: "editor-export-parity-verified",
      provenance: {
        musicalContent: "Project-authored original six-position guitar specimen",
        sourceDerived: { editorExported: false },
        editorExport: {
          editorExported: true,
          workflowRun: 31037072445,
          triggeringCommit: "407070c33b66a045d69205bdcad6f40baf8738ab",
          installerSha256:
            "523f12b26b457afa1ea8b15cf0daa2dfd1d82106da723150f662d8bee6a48037",
          installedExecutableSha256:
            "d6bc20f65edbbb509d15cf5e8e10a18ebbf14a48212ea3b417173f9b290046b1",
        },
        parityVerification: {
          workflowRun: 31040496589,
          triggeringCommit: "978b5e364e159fb3113b0986ce24b3f87891db22",
          focusedSuites: 3,
          focusedTests: 23,
          fullSuites: 53,
          fullTests: 328,
          optimizedBuild: "passed",
          bundleFiles: 26,
          bundleBytes: 7021085,
          trackedCheckoutClean: true,
        },
      },
    });
    expect(source.score.score_info.song_data.author_info).toBeNull();
    expect(createHash("sha256").update(canonical).digest("hex")).toBe(
      manifest.files.source.sha256
    );
    expect(Buffer.byteLength(canonical)).toBe(
      manifest.files.source.canonicalJsonBytes
    );
    expect(createHash("sha256").update(binary).digest("hex")).toBe(
      manifest.files.binary.sha256
    );
    expect(binary.byteLength).toBe(manifest.files.binary.bytes);

    expect(editorMirror.equals(editorBinary)).toBe(true);
    expect(createHash("sha256").update(editorBinary).digest("hex")).toBe(
      manifest.files.editorBinary.sha256
    );
    expect(editorBinary.byteLength).toBe(
      manifest.files.editorBinary.bytes
    );
    expect(createHash("sha256").update(editorJson).digest("hex")).toBe(
      manifest.files.editorDecompressedAudit.sha256
    );
    expect(editorJson.byteLength).toBe(
      manifest.files.editorDecompressedAudit.bytes
    );
    expect(gunzipSync(editorBinary).equals(editorJson)).toBe(true);
    expect(comparison).toMatchObject({
      editor: {
        compressedSha256: manifest.files.editorBinary.sha256,
        decompressedSha256:
          manifest.files.editorDecompressedAudit.sha256,
        internalVersion: 11,
      },
      jsonEqual: false,
      differenceCount: 12,
    });
    expect(comparison.differences.map((difference) => difference.path)).toEqual(
      expect.arrayContaining([
        "$.score.systems[0].staves[0].voices.0.positions[4].notes",
        "$.score.systems[0].staves[0].voices.1.positions",
      ])
    );
  });

  test("keeps null-as-empty handling bounded by rest and note contradictions", () => {
    const nonRest = editorFixtureSource();
    nonRest.score.systems[0].staves[0].voices["0"].positions[0].notes =
      null;
    expectCode(
      () => decodePowerTabV11Document(nonRest),
      "EMPTY_POWERTAB_POSITION"
    );

    const restWithNotes = editorFixtureSource();
    restWithNotes.score.systems[0].staves[0].voices["0"].positions[4].notes = [
      {
        ...restWithNotes.score.systems[0].staves[0].voices["0"].positions[0]
          .notes[0],
      },
    ];
    expectCode(
      () => decodePowerTabV11Document(restWithNotes),
      "CONTRADICTORY_POWERTAB_REST"
    );
  });

  test("rejects notation outside the fixture-proven profile", () => {
    const duration = fixtureSource();
    duration.score.systems[0].staves[0].voices["0"].positions[0].duration =
      "Whole";
    expectCode(
      () => decodePowerTabV11Document(duration),
      "UNSUPPORTED_POWERTAB_DURATION"
    );

    const repeat = fixtureSource();
    repeat.score.systems[0].barlines[0].bar_type = "RepeatStart";
    expectCode(
      () => decodePowerTabV11Document(repeat),
      "UNSUPPORTED_POWERTAB_BARLINE"
    );

    const key = fixtureSource();
    key.score.systems[0].barlines[0].key_signature.num_accidentals = 1;
    expectCode(
      () => decodePowerTabV11Document(key),
      "UNSUPPORTED_POWERTAB_KEY_SIGNATURE"
    );

    const score = fixtureSource();
    score.score.chord_diagrams.push({});
    expectCode(
      () => decodePowerTabV11Document(score),
      "UNSUPPORTED_POWERTAB_SCORE_STRUCTURE"
    );
  });

  test("rejects non-v11 documents rather than guessing", () => {
    const source = fixtureSource();
    source.version = 10;
    expectCode(
      () => decodePowerTabV11Document(source),
      "UNTESTED_POWERTAB_VERSION"
    );
  });

  test("rejects array-shaped fixed voices and contradictory tuning", () => {
    const voices = fixtureSource();
    voices.score.systems[0].staves[0].voices = [
      voices.score.systems[0].staves[0].voices["0"],
      voices.score.systems[0].staves[0].voices["1"],
    ];
    expectCode(
      () => decodePowerTabV11Document(voices),
      "INVALID_POWERTAB_FIXED_ARRAY"
    );

    const tuning = fixtureSource();
    tuning.score.players[0].tuning.notes.pop();
    expectCode(
      () => decodePowerTabV11Document(tuning),
      "CONTRADICTORY_POWERTAB_STRING_COUNT"
    );
  });

  test("rejects unsupported properties instead of dropping them", () => {
    const source = fixtureSource();
    source.score.systems[0].staves[0].voices["0"].positions[0].properties = [
      "ArpeggioUp",
    ];
    expectCode(
      () => decodePowerTabV11Document(source),
      "UNSUPPORTED_POWERTAB_POSITION_PROPERTY"
    );

    const noteSource = fixtureSource();
    noteSource.score.systems[0].staves[0].voices["0"].positions[0].notes[0].properties = [
      "GhostNote",
    ];
    expectCode(
      () => decodePowerTabV11Document(noteSource),
      "UNSUPPORTED_POWERTAB_NOTE_TECHNIQUE"
    );
  });

  test("rejects ambiguous player changes and invalid gzip identity", async () => {
    const source = fixtureSource();
    source.score.systems[0].player_changes.push({
      position: 50,
      active_players: { "0": [{ player: 0, instrument: 0 }] },
    });
    expectCode(
      () => decodePowerTabV11Document(source),
      "UNSUPPORTED_POWERTAB_PLAYER_CHANGE"
    );

    await expect(
      decodePowerTabV11Bytes(new Uint8Array([1, 2, 3]), {
        decompress: jest.fn(),
      })
    ).rejects.toMatchObject({
      name: "PowerTabImportError",
      code: "INVALID_POWERTAB_GZIP",
    });
  });
});

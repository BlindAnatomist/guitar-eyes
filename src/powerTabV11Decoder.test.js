import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { gunzipSync } from "zlib";
import {
  decodePowerTabV11Bytes,
  decodePowerTabV11Document,
} from "./powerTabV11Decoder";
import { PowerTabImportError } from "./powerTabErrors";

function fixtureSource() {
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

function fixtureBytes() {
  return Buffer.from(
    fs
      .readFileSync(
        path.join(
          process.cwd(),
          "fixtures",
          "powertab-v11",
          "powertab-v11-original-six-position.pt2.base64"
        ),
        "utf8"
      )
      .trim(),
    "base64"
  );
}

function fixtureManifest() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-v11",
        "manifest.json"
      ),
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

describe("PowerTab v11 decoder", () => {
  test("decodes the lawful six-position source into a bounded intermediate", () => {
    const intermediate = decodePowerTabV11Document(fixtureSource());

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
  });

  test("validates and decompresses the committed base64 container", async () => {
    const intermediate = await decodePowerTabV11Bytes(fixtureBytes(), {
      decompress: async (bytes) => new Uint8Array(gunzipSync(bytes)),
    });

    expect(intermediate.title).toBe("Guitar Eyes PowerTab v11 Proof");
    expect(intermediate.tracks[0].staves[0].bars).toHaveLength(2);
  });

  test("verifies deterministic fixture hashes and provisional provenance", () => {
    const source = fixtureSource();
    const manifest = fixtureManifest();
    const canonical = `${JSON.stringify(source)}\n`;
    const binary = fixtureBytes();

    expect(manifest.provenance).toMatchObject({
      musicalContent: "Project-authored original six-position guitar specimen",
      editorExported: false,
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

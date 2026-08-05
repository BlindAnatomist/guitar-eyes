import fs from "fs";
import path from "path";
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

function editorDocument() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-v11",
        "powertab-v11-editor-export-six-position.json"
      ),
      "utf8"
    )
  );
}

function editorBytes() {
  return Buffer.from(
    fs
      .readFileSync(
        path.join(
          process.cwd(),
          "fixtures",
          "powertab-v11",
          "powertab-v11-editor-export-six-position.pt2.base64"
        ),
        "utf8"
      )
      .trim(),
    "base64"
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

function expectSixPositionProof(intermediate) {
  expect(intermediate).toMatchObject({
    sourceVersion: "PT2_V11",
    title: "Guitar Eyes PowerTab v11 Proof",
    versionEvidence: {
      internalVersion: 11,
      upstreamRelease: "2.0.22",
      upstreamCommit: "13cab27c7127d301f2747671071e53eb203dc940",
      decodedTrackCount: 1,
    },
  });
  expect(intermediate.tracks).toHaveLength(1);
  expect(intermediate.tracks[0]).toMatchObject({ name: "Proof Guitar" });
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
    intermediate.tracks[0].staves[0].bars.flatMap((bar) =>
      bar.voices[0].beats.map((beat) => beat.startTicks)
    )
  ).toEqual([0, 960, 1440, 1920, 3840, 5760]);
  expect(
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats[0]
  ).toMatchObject({ isRest: true, notes: [] });
  expect(
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats[1].notes
  ).toHaveLength(2);
  expect(intermediate.tracks[0].staves[0].bars[0].voices[1].beats).toEqual(
    []
  );
}

describe("PowerTab v11 exact editor export", () => {
  test("normalizes the exact editor JSON and binary into the same six positions", async () => {
    const direct = decodePowerTabV11Document(editorDocument());
    const binary = await decodePowerTabV11Bytes(editorBytes(), {
      decompress: async (value) => new Uint8Array(gunzipSync(value)),
    });

    expectSixPositionProof(direct);
    expectSixPositionProof(binary);
    expect(binary).toEqual(direct);
  });

  test("accepts null only as the editor's empty rest-note and unused-voice collections", () => {
    const source = editorDocument();
    const intermediate = decodePowerTabV11Document(source);

    expect(
      intermediate.tracks[0].staves[0].bars[1].voices[0].beats[0].notes
    ).toEqual([]);
    expect(intermediate.tracks[0].staves[0].bars[0].voices[1].beats).toEqual(
      []
    );
  });

  test("still rejects a rest carrying notes and a playable position without notes", () => {
    const restWithNote = editorDocument();
    restWithNote.score.systems[0].staves[0].voices["0"].positions[4].notes = [
      {
        ...restWithNote.score.systems[0].staves[0].voices["0"].positions[0]
          .notes[0],
      },
    ];
    expectCode(
      () => decodePowerTabV11Document(restWithNote),
      "CONTRADICTORY_POWERTAB_REST"
    );

    const playableWithoutNote = editorDocument();
    playableWithoutNote.score.systems[0].staves[0].voices["0"].positions[0].notes =
      null;
    expectCode(
      () => decodePowerTabV11Document(playableWithoutNote),
      "EMPTY_POWERTAB_POSITION"
    );
  });
});

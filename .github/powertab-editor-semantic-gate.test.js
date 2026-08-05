import fs from "fs";
import { TextDecoder as NodeTextDecoder } from "util";
import { gunzipSync } from "zlib";
import { decodePowerTabV11Bytes } from "../src/powerTabV11Decoder";

if (typeof globalThis.TextDecoder !== "function") {
  globalThis.TextDecoder = NodeTextDecoder;
}

test("exact editor-resaved PowerTab file preserves the six-position semantic proof", async () => {
  const file = process.env.POWERTAB_EDITOR_EVIDENCE_FILE;
  expect(file).toBeTruthy();
  const bytes = fs.readFileSync(file);
  const intermediate = await decodePowerTabV11Bytes(bytes, {
    decompress: async (value) => new Uint8Array(gunzipSync(value)),
  });

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
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats[0].isRest
  ).toBe(true);
  expect(
    intermediate.tracks[0].staves[0].bars[1].voices[0].beats[1].notes
  ).toHaveLength(2);
});

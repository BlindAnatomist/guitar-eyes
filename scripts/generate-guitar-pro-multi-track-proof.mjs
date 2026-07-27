import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as alphaTab from "@coderline/alphatab";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "fixtures",
  "real-world",
  "guitar-pro-multi-track-proof.atex"
);
const outputPath = path.join(
  root,
  "fixtures",
  "real-world",
  "guitar-pro-multi-track-proof.gp"
);
const hashPath = `${outputPath}.sha256`;
const source = fs.readFileSync(sourcePath, "utf8");
const settings = new alphaTab.Settings();
const score = alphaTab.importer.ScoreLoader.loadAlphaTex(source, settings);
const exporter = new alphaTab.exporter.Gp7Exporter();
const first = exporter.export(score, settings);
const second = exporter.export(score, settings);

if (!Buffer.from(first).equals(Buffer.from(second))) {
  throw new Error("alphaTab multi-track shared-archive export was not deterministic within one process.");
}

const reloaded = alphaTab.importer.ScoreLoader.loadScoreFromBytes(first, settings);
if (reloaded.title !== "Guitar Eyes Multi-Track Proof") {
  throw new Error(`Unexpected generated score title: ${reloaded.title}`);
}
if (reloaded.tracks.length !== 2) {
  throw new Error(`The generated multi-track proof must contain exactly two tracks; received ${reloaded.tracks.length}.`);
}
const expected = [
  { name: "Proof Guitar", strings: 6 },
  { name: "Proof Bass", strings: 4 },
];
reloaded.tracks.forEach((track, index) => {
  if (track.name !== expected[index].name) {
    throw new Error(`Unexpected track ${index + 1} name: ${track.name}`);
  }
  if (track.staves.length !== 1) {
    throw new Error(`Track ${index + 1} must contain exactly one staff.`);
  }
  if (track.staves[0].tuning.length !== expected[index].strings) {
    throw new Error(`Track ${index + 1} has an unexpected string count.`);
  }
  if (track.staves[0].bars.length !== 2) {
    throw new Error(`Track ${index + 1} must contain exactly two measures.`);
  }
});

const hash = crypto.createHash("sha256").update(first).digest("hex");
fs.writeFileSync(outputPath, first);
fs.writeFileSync(hashPath, `${hash}  guitar-pro-multi-track-proof.gp\n`, "utf8");

const summary = reloaded.tracks.map((track) => ({
  name: track.name,
  tuning: track.staves[0].tuning,
  measures: track.staves[0].bars.length,
  beats: track.staves[0].bars.flatMap((bar) =>
    bar.voices.flatMap((voice) =>
      voice.beats.map((beat) => ({
        start: beat.absoluteDisplayStart,
        duration: beat.duration,
        rest: beat.isRest,
        notes: beat.notes.map((note) => ({ string: note.string, fret: note.fret })),
      }))
    )
  ),
}));

console.log(
  JSON.stringify(
    {
      outputPath: path.relative(root, outputPath),
      bytes: first.byteLength,
      sha256: hash,
      tracks: summary,
    },
    null,
    2
  )
);

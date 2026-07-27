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
  "guitar-pro-shared-archive-proof.atex"
);
const outputPath = path.join(
  root,
  "fixtures",
  "real-world",
  "guitar-pro-shared-archive-proof.gp"
);
const hashPath = `${outputPath}.sha256`;
const source = fs.readFileSync(sourcePath, "utf8");
const settings = new alphaTab.Settings();
const score = alphaTab.importer.ScoreLoader.loadAlphaTex(source, settings);
const exporter = new alphaTab.exporter.Gp7Exporter();
const first = exporter.export(score, settings);
const second = exporter.export(score, settings);

if (!Buffer.from(first).equals(Buffer.from(second))) {
  throw new Error("alphaTab shared-archive export was not deterministic within one process.");
}

const reloaded = alphaTab.importer.ScoreLoader.loadScoreFromBytes(first, settings);
if (reloaded.title !== "Guitar Eyes Shared Archive Proof") {
  throw new Error(`Unexpected generated score title: ${reloaded.title}`);
}
if (reloaded.tracks.length !== 1 || reloaded.tracks[0].staves.length !== 1) {
  throw new Error("The generated shared-archive proof must contain exactly one track and one staff.");
}
if (reloaded.tracks[0].staves[0].bars.length !== 2) {
  throw new Error("The generated shared-archive proof must contain exactly two measures.");
}

const hash = crypto.createHash("sha256").update(first).digest("hex");
fs.writeFileSync(outputPath, first);
fs.writeFileSync(hashPath, `${hash}  guitar-pro-shared-archive-proof.gp\n`, "utf8");

const beats = reloaded.tracks[0].staves[0].bars.flatMap((bar) =>
  bar.voices.flatMap((voice) => voice.beats)
);
const summary = beats.map((beat) => ({
  start: beat.absoluteDisplayStart,
  duration: beat.duration,
  rest: beat.isRest,
  notes: beat.notes.map((note) => ({ string: note.string, fret: note.fret })),
}));

console.log(
  JSON.stringify(
    {
      outputPath: path.relative(root, outputPath),
      bytes: first.byteLength,
      sha256: hash,
      tuning: reloaded.tracks[0].staves[0].tuning,
      measures: reloaded.tracks[0].staves[0].bars.length,
      beats: summary,
    },
    null,
    2
  )
);

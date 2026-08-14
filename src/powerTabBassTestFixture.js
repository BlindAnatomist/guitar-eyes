import fs from "fs";
import path from "path";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";

export function makePowerTabBassIntermediate() {
  const value = decodePowerTabV11Document(JSON.parse(fs.readFileSync(
    path.join(process.cwd(), "fixtures", "powertab-v11", "powertab-v11-original-six-position.source.json"),
    "utf8"
  )));
  value.tracks[0].name = "Proof Bass";
  value.tracks[0].shortName = "Proof Bass";
  value.tracks[0].staves[0].tuningMidiHighToLow = [43, 38, 33, 28];
  const remap = new Map([[1, 1], [2, 2], [3, 3], [5, 3], [6, 4]]);
  value.tracks[0].staves[0].bars.forEach((bar) => bar.voices.forEach((voice) =>
    voice.beats.forEach((beat) => beat.notes.forEach((note) => {
      note.stringNumberLowToHigh = remap.get(note.stringNumberLowToHigh);
    }))
  ));
  return value;
}

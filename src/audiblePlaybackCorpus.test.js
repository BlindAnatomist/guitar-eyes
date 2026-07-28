import fs from "fs";
import path from "path";
import { buildMusicXmlReaderDocuments } from "./tabImportCoordinator";
import { buildPositionSoundEvents } from "./positionSoundEvents";

function readFixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

describe("audible playback accepted corpus", () => {
  test("maps the accepted MusicXML chord and rest through the semantic timeline", () => {
    const source = readFixture("musicxml-chord-rest-two-measures.musicxml");
    const document = buildMusicXmlReaderDocuments(source).semanticDocument;

    const chord = buildPositionSoundEvents(document, 0);
    expect(chord.isChord).toBe(true);
    expect(chord.isRest).toBe(false);
    expect(chord.pitchedEventCount).toBe(2);
    expect(chord.events.map((event) => event.midi)).toEqual([64, 60]);
    expect(chord.events.map((event) => event.onsetMilliseconds)).toEqual([0, 0]);
    expect(chord.durationMilliseconds).toBe(500);

    const rest = buildPositionSoundEvents(document, 1);
    expect(rest.isRest).toBe(true);
    expect(rest.events).toEqual([]);
    expect(rest.durationMilliseconds).toBe(500);
  });
});

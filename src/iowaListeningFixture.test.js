import fs from "fs";
import path from "path";
import { parseMusicXmlTablature } from "./musicXmlImporter";

function playableStrings(position) {
  return position.strings.filter((entry) => entry.type !== "silent");
}

test("the Iowa listening fixture covers all six open strings, one chord, and one rest", () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "fixtures",
      "real-world",
      "iowa-all-six-strings-chord-rest.musicxml"
    ),
    "utf8"
  );
  const document = parseMusicXmlTablature(source);

  expect(document.title).toBe("Guitar Eyes Iowa Six-String Listening Test");
  expect(document.positions).toHaveLength(8);
  expect(document.measures).toHaveLength(2);

  const expectedOpenStringIndexes = [5, 4, 3, 2, 1, 0];
  expectedOpenStringIndexes.forEach((stringIndex, positionIndex) => {
    expect(document.positions[positionIndex].strings[stringIndex]).toMatchObject({
      type: "open",
    });
    expect(playableStrings(document.positions[positionIndex])).toHaveLength(1);
  });

  expect(playableStrings(document.positions[6])).toHaveLength(6);
  expect(document.positions[6].strings.map((entry) => entry.type)).toEqual([
    "open",
    "open",
    "fret",
    "fret",
    "fret",
    "open",
  ]);
  expect(playableStrings(document.positions[7])).toHaveLength(0);
  expect(document.positions[7]).toMatchObject({ isRest: true });
});

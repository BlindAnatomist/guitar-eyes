import { parseFourStringBassTabText, parseSixStringTabText } from "./iphoneTabModel";
import { describePlayablePosition } from "./positionDescription";
import { buildReaderDocuments } from "./tabImportCoordinator";

const makeTab = (lines) => lines.join("\n");

describe("describePlayablePosition", () => {
  test("announces only actionable notes in the four-string bass acceptance fixture", () => {
    const document = parseFourStringBassTabText(
      makeTab([
        "G|--0--2--4--2--|",
        "D|--0--0--2--0--|",
        "A|--2--------2---|",
        "E|--3------------|",
      ])
    );

    expect(describePlayablePosition(document, 0)).toBe(
      "Position 1 of 4. E string, fret 3. A string, fret 2. D string, open. G string, open."
    );
    expect(describePlayablePosition(document, 1)).toBe(
      "Position 2 of 4. D string, open. G string, fret 2."
    );
    expect(describePlayablePosition(document, 2)).toBe(
      "Position 3 of 4. D string, fret 2. G string, fret 4."
    );
    expect(describePlayablePosition(document, 3)).toBe(
      "Position 4 of 4. A string, fret 2. D string, open. G string, fret 2."
    );

    document.positions.forEach((_, index) => {
      expect(describePlayablePosition(document, index)).not.toMatch(/silent/i);
    });
  });

  test("distinguishes an open string without enumerating unplayed strings", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--0--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
      ])
    );

    expect(describePlayablePosition(document, 0)).toBe(
      "Position 1 of 1. High E string, open."
    );
  });

  test("retains explicit muted-note notation because it is an instruction", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--x--|",
        "B|-----|",
        "G|-----|",
        "D|-----|",
        "A|-----|",
        "E|-----|",
      ])
    );

    expect(describePlayablePosition(document, 0)).toContain(
      "High E string, muted note notation preserved but not yet interpreted."
    );
  });

  test("announces deterministic technique relationships on the target note", () => {
    const document = parseSixStringTabText(
      makeTab([
        "e|--5h7p5--|",
        "B|---------|",
        "G|---------|",
        "D|---------|",
        "A|---------|",
        "E|---------|",
      ])
    );

    expect(document.positions).toHaveLength(3);
    expect(describePlayablePosition(document, 1)).toContain(
      "High E string, fret 7, with hammer-on."
    );
    expect(describePlayablePosition(document, 2)).toContain(
      "High E string, fret 5, with pull-off."
    );
  });

  const recognizedAttachedNames = [
    "hammer-on", "pull-off", "slide", "ascending slide", "descending slide",
    "bend", "bend release", "vibrato", "let ring", "palm mute", "tap",
    "slap", "pop", "harmonic", "open-string", "fingernails", "pluck",
  ];

  function documentWithTechniques(names, fret = 3) {
    const document = parseSixStringTabText(makeTab([
      `e|--${fret}--|`, "B|-----|", "G|-----|", "D|-----|", "A|-----|", "E|-----|",
    ]));
    document.positions[0].strings[0].techniques = names.map((name) => ({ name }));
    return document;
  }

  test.each(recognizedAttachedNames)("speaks the exact recognized attached category %s", (name) => {
    const fret = name === "open-string" ? 0 : 3;
    expect(describePlayablePosition(documentWithTechniques([name], fret), 0)).toBe(
      `Position 1 of 1. High E string, ${fret === 0 ? "open" : "fret 3"}, with ${name}.`
    );
  });

  test("lists recognized techniques on an open note in source order", () => {
    expect(describePlayablePosition(documentWithTechniques(["palm mute", "let ring", "vibrato"], 0), 0)).toBe(
      "Position 1 of 1. High E string, open, with palm mute, let ring, and vibrato."
    );
  });

  test.each(["rasgueado", "PalmMuting", "Palm Mute", "palm mute variation", "muted note"])(
    "retains disclosure for an unrecognized attached name %s without guessing aliases",
    (name) => {
      expect(describePlayablePosition(documentWithTechniques([name]), 0)).toBe(
        `Position 1 of 1. High E string, fret 3, with ${name} notation preserved but not yet interpreted.`
      );
    }
  );

  test("retains separate disclosures for multiple unknown attached techniques", () => {
    expect(describePlayablePosition(documentWithTechniques(["rasgueado", "unknown effect"]), 0)).toBe(
      "Position 1 of 1. High E string, fret 3, with rasgueado notation preserved but not yet interpreted; unknown effect notation preserved but not yet interpreted."
    );
  });

  test.each([
    [["palm mute", "unknown effect"], "palm mute; unknown effect notation preserved but not yet interpreted"],
    [["unknown effect", "hammer-on"], "unknown effect notation preserved but not yet interpreted; with hammer-on"],
    [["hammer-on", "unknown effect", "vibrato"], "hammer-on; unknown effect notation preserved but not yet interpreted; with vibrato"],
    [["hammer-on", "pull-off", "unknown effect", "vibrato", "palm mute"], "hammer-on and pull-off; unknown effect notation preserved but not yet interpreted; with vibrato and palm mute"],
  ])("discloses only unknown items in mixed list %s", (names, phrase) => {
    expect(describePlayablePosition(documentWithTechniques(names), 0)).toBe(
      `Position 1 of 1. High E string, fret 3, with ${phrase}.`
    );
  });

  test("does not rewrite raw technique evidence, warnings or semantic losses while describing it", () => {
    const document = documentWithTechniques(["bend", "unknown effect"]);
    document.positions[0].strings[0].techniques[0] = {
      name: "bend", raw: "b", attachment: "previous", sourceColumn: 3,
      parameters: { amount: null, targetPitch: null },
    };
    document.warnings = ["Unsupported effect parameters remain unknown."];
    document.semanticLosses = [{ element: "unknown effect", disposition: "preserved-not-interpreted" }];
    const snapshot = JSON.stringify(document);

    expect(describePlayablePosition(document, 0)).toBe(
      "Position 1 of 1. High E string, fret 3, with bend; unknown effect notation preserved but not yet interpreted."
    );
    expect(JSON.stringify(document)).toBe(snapshot);
  });

  test("keeps an unattached recognized symbol as source evidence without inventing an instruction", () => {
    const document = parseSixStringTabText(makeTab([
      "e|--0--h|", "B|------|", "G|------|", "D|------|", "A|------|", "E|------|",
    ]));
    expect(document.positions).toHaveLength(1);
    expect(describePlayablePosition(document, 0)).toBe("Position 1 of 1. High E string, open.");
    expect(document.warnings.join(" ")).toMatch(/could not be attached/i);
    expect(document.strings[0].tokens).toContainEqual(expect.objectContaining({ name: "hammer-on", raw: "h" }));
  });

  test("announces a mapped duration through the existing current-position action", () => {
    const source = makeTab([
      "Rhythm: Q",
      "e|--0--|",
      "B|-----|",
      "G|-----|",
      "D|-----|",
      "A|-----|",
      "E|-----|",
    ]);
    const document = buildReaderDocuments(source, "guitar").semanticDocument;

    expect(describePlayablePosition(document, 0)).toBe(
      "Measure 1 of 1. Position 1 of 1 in this measure. Duration, quarter note. High E string, open."
    );
  });
});

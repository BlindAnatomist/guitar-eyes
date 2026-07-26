import {
  describePosition,
  parseFourStringBassTabText,
  parseTabDocumentText,
  TabParseError,
} from "./iphoneTabModel";

const guitarBlock = [
  "e|--0--2--|",
  "B|--1--3--|",
  "G|--0--2--|",
  "D|--2--0--|",
  "A|--3-----|",
  "E|--------|",
];

const bassBlock = [
  "G|--0--2--|",
  "D|--0--0--|",
  "A|--2-----|",
  "E|--3-----|",
];

describe("shared semantic tablature document", () => {
  test("parses four-string bass into synchronized semantic positions", () => {
    const document = parseFourStringBassTabText(bassBlock.join("\n"));

    expect(document.instrument).toBe("bass");
    expect(document.stringCount).toBe(4);
    expect(document.blocks).toHaveLength(1);
    expect(document.strings).toHaveLength(4);
    expect(describePosition(document, 0)).toContain("E string, fret 3.");
    expect(describePosition(document, 0)).toContain("A string, fret 2.");
  });

  test("locates multiple guitar blocks around headings and preserves their boundaries", () => {
    const document = parseTabDocumentText(
      ["Intro", ...guitarBlock, "Verse", ...guitarBlock].join("\n"),
      "guitar"
    );

    expect(document.blocks).toHaveLength(2);
    expect(document.blocks[0].strings).toHaveLength(6);
    expect(document.blocks[1].strings).toHaveLength(6);
    expect(document.blocks[0].strings[0].id).not.toBe(
      document.blocks[1].strings[0].id
    );
    expect(document.warnings).toContain(
      "2 non-tablature lines were ignored while locating tablature blocks."
    );

    const secondBlockIndex = document.positions.findIndex(
      (position) => position.blockIndex === 1
    );
    expect(describePosition(document, secondBlockIndex)).toMatch(
      /^Block 2 of 2\. Position 1 of 2 in this block\./
    );
  });

  test("parses multiple bass blocks through the same document contract", () => {
    const document = parseTabDocumentText(
      [...bassBlock, "Break", ...bassBlock].join("\n"),
      "bass"
    );

    expect(document.instrument).toBe("bass");
    expect(document.blocks).toHaveLength(2);
    expect(document.positions.every((position) => position.strings.length === 4)).toBe(
      true
    );
  });

  test("rejects an incomplete final block instead of inventing missing strings", () => {
    expect(() =>
      parseTabDocumentText(guitarBlock.slice(0, 5).join("\n"), "guitar")
    ).toThrow(TabParseError);

    try {
      parseTabDocumentText(guitarBlock.slice(0, 5).join("\n"), "guitar");
    } catch (error) {
      expect(error.code).toBe("INCOMPLETE_TABLATURE_BLOCK");
    }
  });
});

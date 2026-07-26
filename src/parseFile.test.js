import { parseTabText } from "./parseFile";

describe("parseTabText", () => {
  test("preserves Jason's six-string desktop block shape from already-read source text", () => {
    const source = [
      "e|--10--|",
      "B|---3---|",
      "G|-------|",
      "D|-------|",
      "A|-------|",
      "E|-------|",
    ].join("\n");

    expect(parseTabText(source, 6)).toEqual([
      [
        "e|--10--|",
        "B|---3---|",
        "G|-------|",
        "D|-------|",
        "A|-------|",
        "E|-------|",
      ],
    ]);
  });

  test("continues to group four-string bass blocks for the compatibility fallback", () => {
    const source = [
      "G|--0--|",
      "D|--0--|",
      "A|--2--|",
      "E|--3--|",
    ].join("\n");

    expect(parseTabText(source, 4)).toHaveLength(1);
    expect(parseTabText(source, 4)[0]).toHaveLength(4);
  });
});

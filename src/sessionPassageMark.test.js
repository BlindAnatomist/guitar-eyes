import { createSessionPassageMark, resolveSessionPassageMark } from "./sessionPassageMark";
import { buildReaderDocuments } from "./tabImportCoordinator";

function accepted() {
  return buildReaderDocuments("e|--0--2--|\nB|--------|\nG|--------|\nD|--------|\nA|--------|\nE|--------|").semanticDocument;
}

test.each([0, 1])("mark uses exact document, canonical reference and index %i without persistent IDs", (index) => {
  const document = accepted();
  expect(document.positions[index].id).toBeUndefined();
  const before = JSON.stringify(document);
  const mark = createSessionPassageMark(document, index);
  expect(mark.document).toBe(document);
  expect(mark.position).toBe(document.positions[index]);
  expect(mark.index).toBe(index);
  expect(resolveSessionPassageMark(document, mark)).toBe(index);
  expect(JSON.stringify(document)).toBe(before);
});

test.each([-1, 2, 1.1, NaN, Infinity, "1", undefined, null])("invalid index %s does not get clamped or guessed", (index) => {
  const document = accepted();
  expect(createSessionPassageMark(document, index)).toBeNull();
  expect(resolveSessionPassageMark(document, { document, index, position: document.positions[0] })).toBeNull();
});

test("equal content, a JSON restoration and a shallow document copy are distinct sessions", () => {
  const document = accepted();
  const mark = createSessionPassageMark(document, 1);
  [accepted(), JSON.parse(JSON.stringify(document)), { ...document }, null].forEach((other) => {
    expect(resolveSessionPassageMark(other, mark)).toBeNull();
  });
});

test("stale canonical reference, shifted membership and mismatched index fail closed", () => {
  const document = accepted();
  const mark = createSessionPassageMark(document, 1);
  expect(resolveSessionPassageMark(document, { ...mark, index: 0 })).toBeNull();
  document.positions[1] = { ...mark.position };
  expect(resolveSessionPassageMark(document, mark)).toBeNull();
  document.positions[1] = mark.position;
  document.positions.reverse();
  expect(resolveSessionPassageMark(document, mark)).toBeNull();
});

test.each([null, {}, { positions: [{ index: 0 }] }, { type: "tablature-document", positions: [] }])("raw or absent content is not a canonical return target", (document) => {
  expect(createSessionPassageMark(document, 0)).toBeNull();
  expect(resolveSessionPassageMark(document, null)).toBeNull();
});

import fs from "fs";
import { TextDecoder, TextEncoder } from "util";
import { parseMusicXmlTablature } from "./musicXmlImporter";
import { buildMusicXmlReaderDocuments, buildReaderDocuments } from "./tabImportCoordinator";
import { finalizeSemanticDocument, validateSemanticDocument } from "./semanticDocumentValidation";
import { describePlayablePosition } from "./positionDescription";
import { extractCompressedMusicXml } from "./compressedMusicXmlImporter";
import { zipStored } from "./tuxGuitarStandardBassZip";

Object.assign(global, { TextDecoder, TextEncoder });

// Mutations of the existing project-authored fixture, not new producer evidence.
const xml = fs.readFileSync("fixtures/real-world/musicxml-chord-rest-two-measures.musicxml", "utf8");
const repeat = '<barline location="right"><repeat direction="backward" times="3"/><ending number="1,2" type="stop"/></barline>';
const withLosses = xml.replaceAll("</technical>", "<unknown-effect/></technical>")
  .replaceAll("</measure>", `${repeat}</measure>`);
const valid = (source = withLosses) => buildMusicXmlReaderDocuments(source).semanticDocument;
const technical = (document) => document.semanticLosses.find((loss) => loss.kind === "unsupported-technical" && loss.noteIndex === 1);
const sourceOrder = (document) => document.semanticLosses.find((loss) => loss.kind === "source-order-only");
const genericLoss = (location) => ({ kind: "unmapped-notation", sourceFormat: "example", disposition: "preserved", location });
const clone = (value) => JSON.parse(JSON.stringify(value));
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

test("MusicXML losses bind to the canonical position, including chord members and notes after rests", () => {
  const document = valid();
  const losses = document.semanticLosses.filter((loss) => loss.kind === "unsupported-technical");
  expect(losses.map((loss) => [loss.sourceMeasureIndex, loss.noteIndex, loss.location])).toEqual([
    [0, 0, { scope: "position", positionId: document.positions[0].id }],
    [0, 1, { scope: "position", positionId: document.positions[0].id }],
    [0, 3, { scope: "position", positionId: document.positions[2].id }],
    [0, 4, { scope: "position", positionId: document.positions[3].id }],
    [1, 0, { scope: "position", positionId: document.positions[4].id }],
    [1, 1, { scope: "position", positionId: document.positions[5].id }],
  ]);
  expect(document.positions[1].isRest).toBe(true);
  expect(losses.some((loss) => loss.location.positionId === document.positions[1].id)).toBe(false);
});

test.each(["same", "pickup", "0", "-4", "𝄞", "", null])("source measure ordinal disambiguates repeat/ending labels %s", (label) => {
  const source = withLosses.replaceAll(/<measure number="\d+">/g, label === null ? "<measure>" : `<measure number="${label}">`);
  const document = valid(source);
  const losses = document.semanticLosses.filter((loss) => loss.kind === "source-order-only");
  expect(losses.map((loss) => [loss.sourceMeasureIndex, loss.location])).toEqual([
    [0, { scope: "measure", measureId: document.measures[0].id }],
    [0, { scope: "measure", measureId: document.measures[0].id }],
    [1, { scope: "measure", measureId: document.measures[1].id }],
    [1, { scope: "measure", measureId: document.measures[1].id }],
  ]);
  expect(losses[0]).toMatchObject({ element: "repeat", attributes: { direction: "backward", times: "3" }, disposition: "not-expanded" });
  expect(losses[1]).toMatchObject({ element: "ending", attributes: { number: "1,2", type: "stop" }, disposition: "not-expanded" });
  expect(losses.map((loss) => loss.measureNumber)).toEqual(label ? [label, label, label, label] : ["1", "1", "2", "2"]);
});

test.each(["first", "middle", "last"])("repeat/ending on an empty %s measure attaches only to the measure", (place) => {
  const attributes = xml.match(/<attributes>[\s\S]*?<\/attributes>/)[0];
  const empty = `<measure number="empty">${place === "first" ? attributes : ""}${repeat}</measure>`;
  const source = place === "first" ? withLosses.replace('<measure number="1">', `${empty}<measure number="1">`)
    : place === "middle" ? withLosses.replace('<measure number="2">', `${empty}<measure number="2">`)
      : withLosses.replace("</part>", `${empty}</part>`);
  const document = valid(source);
  const index = { first: 0, middle: 1, last: 2 }[place];
  expect(document.measures[index].positions).toEqual([]);
  expect(document.positions).toHaveLength(6);
  const losses = document.semanticLosses.filter((loss) => loss.measureNumber === "empty");
  expect(losses).toHaveLength(2);
  losses.forEach((loss) => expect(loss).toMatchObject({
    sourceMeasureIndex: index, location: { scope: "measure", measureId: document.measures[index].id },
  }));
});

test.each([
  null, false, [], "position", {}, { scope: "unknown" },
  { scope: "position" }, { scope: "position", positionId: "" },
  { scope: "position", positionId: 1 }, { scope: "position", positionId: "missing" },
  { scope: "measure" }, { scope: "measure", measureId: "" },
  { scope: "measure", measureId: "missing" },
  { scope: "position", positionId: "musicxml-measure-1-position-1", measureId: "block-1-measure-1" },
  { scope: "unlocalized" }, { scope: "unlocalized", reason: "" },
  { scope: "unlocalized", reason: "   " }, { scope: "unlocalized", reason: 1 },
  { scope: "unlocalized", reason: "unknown", positionId: "musicxml-measure-1-position-1" },
])("supplied dangling or malformed loss reference %j rejects", (location) => {
  const document = valid();
  document.semanticLosses = [genericLoss(location)];
  expect(() => validateSemanticDocument(document)).toThrow(/semantic loss/);
});

test.each([
  ["chord member moved to rest", (d) => { technical(d).location.positionId = d.positions[1].id; }],
  ["chord member moved to later note", (d) => { technical(d).location.positionId = d.positions[2].id; }],
  ["chord member moved across duplicate labels", (d) => { technical(d).location.positionId = d.positions[5].id; }],
  ["repeat moved across duplicate labels", (d) => { sourceOrder(d).location.measureId = d.measures[1].id; }],
  ["technical changed to measure scope", (d) => { technical(d).location = { scope: "measure", measureId: d.measures[0].id }; }],
  ["repeat changed to position scope", (d) => { sourceOrder(d).location = { scope: "position", positionId: d.positions[0].id }; }],
  ["wrong source label", (d) => { technical(d).measureNumber = "other"; }],
  ["wrong note source index", (d) => { technical(d).noteIndex = 2; }],
  ["missing note source index", (d) => { delete technical(d).noteIndex; }],
  ["missing source measure index", (d) => { delete technical(d).sourceMeasureIndex; }],
  ["wrong source document format", (d) => { d.sourceFormat = "example"; }],
])("contradictory source locality rejects: %s", (_name, mutate) => {
  const document = valid(withLosses.replaceAll(/<measure number="\d+">/g, '<measure number="same">'));
  mutate(document);
  expect(() => validateSemanticDocument(document)).toThrow(/semantic loss/);
});

test.each([null, undefined, -1, 0.5, NaN, Infinity, "0", false, 2, Number.MAX_SAFE_INTEGER + 1])(
  "MusicXML localized source ordinal %s cannot be coerced or guessed", (sourceMeasureIndex) => {
    const document = valid();
    technical(document).sourceMeasureIndex = sourceMeasureIndex;
    expect(() => validateSemanticDocument(document)).toThrow(/semantic loss/);
  }
);

test("generic common references can describe a canonical rest or an empty measure", () => {
  const document = valid(withLosses.replace('<measure number="2">', '<measure number="empty"/><measure number="2">'));
  document.semanticLosses = [
    genericLoss({ scope: "position", positionId: document.positions[1].id }),
    genericLoss({ scope: "measure", measureId: document.measures[1].id }),
  ];
  expect(validateSemanticDocument(document)).toBe(document);
});

test("unlocalized evidence and legacy loss records stay unchanged without inferred attachment", () => {
  const document = valid();
  document.semanticLosses = [
    { kind: "unsupported-technical", sourceFormat: "musicxml", disposition: "not-interpreted", measureNumber: "unknown", noteIndex: 99,
      location: { scope: "unlocalized", reason: "No verified canonical target" } },
    { kind: "legacy", sourceFormat: "other", disposition: "preserved", opaqueSource: { part: "raw" } },
    genericLoss(undefined),
  ];
  const before = clone(document);
  const losses = document.semanticLosses;
  expect(finalizeSemanticDocument(freeze(document)).semanticLosses).toBe(losses);
  expect(clone(document)).toEqual(before);
  expect(document.semanticLosses[0].location).toEqual({ scope: "unlocalized", reason: "No verified canonical target" });
});

test("legacy MusicXML records without new locality fields remain compatible", () => {
  const document = valid();
  document.semanticLosses = document.semanticLosses.map(({ location, sourceMeasureIndex, ...loss }) => loss);
  const before = clone(document.semanticLosses);
  expect(finalizeSemanticDocument(document).semanticLosses).toEqual(before);
});

test("a rejected reference is not repaired or cached across later valid admission", () => {
  const bad = valid();
  technical(bad).location.positionId = "missing";
  const before = JSON.stringify(bad);
  expect(() => finalizeSemanticDocument(freeze(bad))).toThrow(/semantic loss/);
  expect(JSON.stringify(bad)).toBe(before);
  const good = valid();
  expect(finalizeSemanticDocument(good)).toEqual(good);
});

test("loss references survive JSON restoration and repeated pure finalization", () => {
  const input = freeze(clone(valid()));
  const before = JSON.stringify(input);
  const first = finalizeSemanticDocument(input);
  const second = finalizeSemanticDocument(first);
  [first, second].forEach((document) => {
    expect(document.semanticLosses).toBe(input.semanticLosses);
    expect(document).toEqual(input);
    document.measures.forEach((measure) => measure.positions.forEach((position) => {
      expect(position).toBe(document.positions[position.index]);
    }));
  });
  expect(JSON.stringify(input)).toBe(before);
});

test("no-loss documents and unmeasured ASCII remain compatible", () => {
  const document = valid(xml);
  expect(document.semanticLosses).toEqual([]);
  delete document.semanticLosses;
  expect(validateSemanticDocument(document)).toBe(document);
  const ascii = buildReaderDocuments('e|0-2\nB|---\nG|---\nD|---\nA|---\nE|---').semanticDocument;
  expect(ascii.measures).toEqual([]);
  expect(validateSemanticDocument(ascii)).toBe(ascii);
  // ASCII positions do not yet supply IDs; this exercises the optional-ID contract.
  ascii.positions[0].id = "test-local-position";
  ascii.semanticLosses = [genericLoss({ scope: "position", positionId: ascii.positions[0].id })];
  expect(validateSemanticDocument(ascii)).toBe(ascii);
});

test("loss metadata does not change musical values, desktop output or explicit Read", () => {
  const a = buildMusicXmlReaderDocuments(xml);
  const b = buildMusicXmlReaderDocuments(withLosses);
  expect(b.semanticDocument.positions).toEqual(a.semanticDocument.positions);
  expect(b.semanticDocument.measures).toEqual(a.semanticDocument.measures);
  expect(b.desktopBlocks).toEqual(a.desktopBlocks);
  expect(b.semanticDocument.warnings).toContain("Measure 1 contains repeat or ending notation. Positions are read in source order; repeats are not expanded.");
  b.semanticDocument.positions.forEach((_position, index) => {
    expect(describePlayablePosition(b.semanticDocument, index)).toBe(describePlayablePosition(a.semanticDocument, index));
  });
  expect(parseMusicXmlTablature(withLosses).semanticLosses).toEqual(b.semanticDocument.semanticLosses);
});

test("compressed MusicXML preserves the same verified local references", async () => {
  const bytes = zipStored([
    ["META-INF/container.xml", new TextEncoder().encode('<container><rootfiles><rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>')],
    ["score.musicxml", new TextEncoder().encode(withLosses)],
  ]);
  const extracted = await extractCompressedMusicXml(bytes.buffer);
  const document = valid(extracted.sourceText);
  expect(document).toEqual(valid());
  expect(validateSemanticDocument(document)).toBe(document);
});

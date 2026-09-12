import fs from "fs";
import { validateSemanticDocument } from "./semanticDocumentValidation";
import { buildMusicXmlReaderDocuments, buildReaderDocuments } from "./tabImportCoordinator";
import { describePlayablePosition } from "./positionDescription";
import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";

const xml = fs.readFileSync("fixtures/real-world/musicxml-minimal-guitar-tab.musicxml", "utf8");
const ascii = 'Rhythm: Q E E H\ne|---------|\nB|---------|\nG|---------|\nD|-------0-|\nA|---0-2---|\nE|-3-------|';
const valid = () => buildMusicXmlReaderDocuments(xml).semanticDocument;

test("ASCII and MusicXML preserve the same playing projection through common validation", () => {
  const a = buildReaderDocuments(ascii).semanticDocument;
  const b = valid();
  [a,b].forEach((document) => expect(validateSemanticDocument(document)).toBe(document));
  const project = (document) => document.positions.map((position) => ({
    units: position.duration.quarterNoteUnits,
    states: position.strings.map(({type, fret}) => ({type, fret})),
  }));
  expect(project(a)).toEqual(project(b));
  for (let index = 0; index < 4; index += 1) {
    expect(describePlayablePosition(a,index).split('Duration,')[1]).toEqual(describePlayablePosition(b,index).split('Duration,')[1]);
  }
});
test.each([
  ['identity', (d) => { d.type = 'score'; }],
  ['schema', (d) => { d.schemaVersion = 2; }],
  ['instrument', (d) => { d.instrument = 'ukulele'; }],
  ['string count', (d) => { d.stringCount = 4; }],
  ['string reference', (d) => { d.positions[0].strings[0].stringId = 'missing'; }],
  ['missing fret', (d) => { delete d.positions[0].strings[5].fret; }],
  ['null fret', (d) => { d.positions[0].strings[5].fret = null; }],
  ['absent zero', (d) => { d.positions[1].strings[4].fret = null; }],
  ['wrong zero', (d) => { d.positions[1].strings[4].fret = 3; }],
  ['missing structured duration', (d) => { delete d.positions[0].duration; }],
  ['elapsed contradiction', (d) => { d.positions[0].duration.quarterNoteUnits = 2; }],
  ['notation contradiction', (d) => { d.positions[0].duration.notated.type = 'half'; }],
  ['loss record', (d) => { d.semanticLosses = [{}]; }],
])("shared validation blocks %s", (_name, mutate) => {
  const document = valid(); mutate(document);
  expect(() => validateSemanticDocument(document)).toThrow(/musical evidence/);
});
test("untimed ASCII remains untimed, including unknown octave", () => {
  const document = buildReaderDocuments(ascii.replace('Rhythm: Q E E H\n','')).semanticDocument;
  expect(validateSemanticDocument(document)).toBe(document);
  expect(document.positions.every((position) => !position.duration)).toBe(true);
});
test("a decoder/normalizer success object is still checked at the reader boundary", async () => {
  const document = valid(); delete document.positions[0].strings[5].fret;
  await expect(buildGuitarProReaderDocuments(null, {
    intermediate: {}, inventory: () => ({requiresSelection:false}), normalize: () => document,
  })).rejects.toMatchObject({code:'INVALID_SEMANTIC_DOCUMENT'});
});

test("shared validator blocks false duration wording even when numbers are valid", () => {
  const document = valid(); document.positions[0].duration.name = 'half note';
  expect(() => validateSemanticDocument(document)).toThrow(/wording/);
});
test("shared validator preserves supported structured tuplets and rejects contradictory ratios", () => {
  const document = valid();
  const duration = { source:'guitar-pro', denominator:8, dots:0, tupletNumerator:3, tupletDenominator:2,
    quarterNoteFraction:{numerator:1,denominator:3}, quarterNoteUnits:1/3, name:'eighth note tuplet, 3 in the time of 2' };
  document.positions[0].duration = duration;
  expect(validateSemanticDocument(document)).toBe(document);
  duration.tupletNumerator = 5;
  expect(() => validateSemanticDocument(document)).toThrow();
});

test("two reader projections cannot carry different tuning or spoken string facts", () => {
  const document = valid();
  document.strings = document.strings.map((string, index) => index === 0 ? {...string, tuning:'A', spokenName:'A string'} : string);
  expect(() => validateSemanticDocument(document)).toThrow(/string evidence disagree/);
});

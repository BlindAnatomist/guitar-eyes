import fs from "fs";
import path from "path";
import { TEACHER_EXAMPLE_XML, buildTeacherExampleDocuments, isTeacherExampleSource, hasReviewedTeacherSource } from "./teacherExample";
import { compareTeacherMeasures, createTeacherLesson, resolveTeacherEvidence, TEACHER_LIMITS } from "./teacherPatterns";
import { buildMusicXmlReaderDocuments } from "./tabImportCoordinator";
import { describePlayablePosition } from "./positionDescription";

const example = () => buildTeacherExampleDocuments().semanticDocument;
function freeze(value) {
  Object.freeze(value);
  Object.values(value).forEach((item) => { if (item && typeof item === "object" && !Object.isFrozen(item)) freeze(item); });
  return value;
}

test("original fixture is byte-exact, canonical, and produces real pattern teaching", () => {
  expect(TEACHER_EXAMPLE_XML).toBe(fs.readFileSync(path.join(process.cwd(), "fixtures/teacher/pattern-and-ending.musicxml"), "utf8"));
  const document = example();
  const result = compareTeacherMeasures(document);
  expect(result.status).toBe("available");
  expect(result.recurrence.map((fact) => fact.measure.documentNumber)).toEqual([1, 2]);
  expect(result.variation.measure.documentNumber).toBe(3);
  expect(result.changedPosition).toBe(3);
  expect(document.positions).toHaveLength(12);
  expect(document.positions[0].strings.filter((state) => state.type !== "silent")).toHaveLength(2);
  expect(document.positions[2].isRest).toBe(true);
  const lesson = createTeacherLesson(document);
  expect(lesson.claims.map((claim) => claim.text).join(" ")).toMatch(/same imported.*first 3 positions.*position 4/);
  expect(lesson.endings.map((ending) => ending.text)).toEqual([describePlayablePosition(document, 3), describePlayablePosition(document, 11)]);
  expect(lesson.endings[0].text).toContain("High E string, fret 3");
  expect(lesson.endings[1].text).toContain("High E string, fret 5");
  expect(lesson.practice).toHaveLength(3);
  [...lesson.claims, ...lesson.opening, ...lesson.endings, ...lesson.evidence].forEach((item) => {
    expect(item.references.length).toBeGreaterThan(0);
    item.references.forEach((ref) => {
      expect(resolveTeacherEvidence(document, ref)).toBe(ref.index);
      expect(ref.position).toBe(document.positions[ref.index]);
    });
  });
});

test("source coverage is exact and document-scoped, not inferred from no warnings", () => {
  const document = example();
  expect(hasReviewedTeacherSource(document)).toBe(true);
  expect(createTeacherLesson(buildMusicXmlReaderDocuments(TEACHER_EXAMPLE_XML).semanticDocument).status).toBe("unavailable");
  expect(isTeacherExampleSource(TEACHER_EXAMPLE_XML + "\n")).toBe(false);
  expect(() => buildTeacherExampleDocuments(TEACHER_EXAMPLE_XML + "\n")).toThrow(/not been reviewed/);
  const altered = TEACHER_EXAMPLE_XML.replace("<voice>1</voice>", "<voice>1</voice><tie type=\"start\"/>");
  expect(isTeacherExampleSource(altered)).toBe(false);
  expect(createTeacherLesson(buildMusicXmlReaderDocuments(altered).semanticDocument).status).toBe("unavailable");
  document.positions[3].strings[0].fret = 9;
  expect(hasReviewedTeacherSource(document)).toBe(false);
  expect(createTeacherLesson(document).status).toBe("unavailable");
});

test("analysis ignores incidental IDs, titles and source labels", () => {
  const document = example();
  document.title = "Same musical facts";
  document.measures.forEach((measure, index) => { measure.id = `new-measure-${index}`; measure.sourceNumber = `label ${index}`; });
  document.positions.forEach((position, index) => { position.id = `new-position-${index}`; position.sourceMeasureNumber = "incidental label"; });
  expect(compareTeacherMeasures(document).status).toBe("available");
});

test.each([
  ["fret", (doc) => { doc.positions[7].strings[0].fret = 8; }],
  ["physical string", (doc) => { doc.positions[7].strings[0].type = "silent"; doc.positions[7].strings[1].type = "fret"; doc.positions[7].strings[1].fret = 3; }],
  ["rest", (doc) => { doc.positions[7].isRest = true; doc.positions[7].strings[0].type = "silent"; }],
  ["chord grouping", (doc) => { doc.positions[4].strings[1].type = "silent"; }],
  ["duration", (doc) => { const duration = doc.positions[7].duration; duration.quarterNoteUnits = 2; }],
])("a different %s never becomes an exact recurrence", (name, change) => {
  const document = example(); change(document);
  expect(compareTeacherMeasures(document).status).toBe("unavailable");
});

test.each([
  ["unknown duration", (doc) => { doc.positions[0].duration = null; }],
  ["unknown octave", (doc) => { delete doc.strings[0].octave; }],
  ["different tuning", (doc) => { doc.strings[5].tuning = "D"; }],
  ["incomplete measure rhythm", (doc) => { doc.measures[0].durationComplete = false; }],
  ["contradictory total", (doc) => { doc.measures[0].totalQuarterNoteUnits = 5; }],
  ["technique", (doc) => { doc.positions[0].strings[0].techniques = [{ name: "bend" }]; }],
  ["malformed technique", (doc) => { doc.positions[0].strings[0].techniques = { name: "bend" }; }],
  ["null technique", (doc) => { doc.positions[0].strings[0].techniques = null; }],
  ["false technique", (doc) => { doc.positions[0].strings[0].techniques = 0; }],
  ["unknown rest flag", (doc) => { doc.positions[2].isRest = "yes"; }],
  ["unknown duration completeness", (doc) => { doc.measures[0].durationComplete = "yes"; }],
  ["position technique", (doc) => { doc.positions[0].techniques = [{ name: "slur" }]; }],
  ["tie continuation", (doc) => { doc.positions[1].strings[2].type = "continuation"; doc.positions[1].strings[2].fret = 0; }],
  ["unknown note", (doc) => { doc.positions[1].strings[2].type = "unsupported"; }],
  ["source-order-only loss", (doc) => { doc.semanticLosses = [{ kind: "source-order-only", sourceFormat: "other", disposition: "preserved" }]; }],
  ["unlocalized loss", (doc) => { doc.semanticLosses = [{ kind: "unsupported-notation", sourceFormat: "musicxml", disposition: "preserved", location: { scope: "unlocalized", reason: "unknown scope" } }]; }],
  ["warning", (doc) => { doc.warnings.push("Source marking not understood"); }],
  ["incompatible instrument", (doc) => { doc.instrument = "bass"; }],
  ["noncanonical reference", (doc) => { doc.measures[0].positions[0] = { ...doc.positions[0] }; }],
  ["ambiguous grouping", (doc) => { doc.positions[0].strings.forEach((state) => { state.type = "silent"; }); }],
])("fails closed for %s", (name, change) => {
  const document = example(); change(document);
  expect(compareTeacherMeasures(document).status).toBe("unavailable");
});

test("two changed positions and a changed opening do not become a simple changed ending", () => {
  const document = example();
  document.positions[9].strings[2].type = "fret";
  document.positions[9].strings[2].fret = 2;
  expect(compareTeacherMeasures(document).status).toBe("unavailable");
});

test("a different measure length does not align by guessed omission", () => {
  const changed = TEACHER_EXAMPLE_XML.replace(/(<measure number="3">[\s\S]*?)( {6}<note><rest\/>[^\n]*\n)/, "$1");
  expect(compareTeacherMeasures(buildMusicXmlReaderDocuments(changed).semanticDocument).status).toBe("unavailable");
});

test("analysis is deterministic and leaves frozen canonical facts unchanged", () => {
  const document = freeze(example());
  const before = JSON.stringify(document);
  expect(createTeacherLesson(document)).toEqual(createTeacherLesson(document));
  expect(JSON.stringify(document)).toBe(before);
});

test("new documents and copied or replaced positions invalidate lesson evidence", () => {
  const document = example();
  const lesson = createTeacherLesson(document);
  const ref = lesson.evidence[3].references[0];
  expect(resolveTeacherEvidence(example(), ref)).toBeNull();
  expect(resolveTeacherEvidence(document, { ...ref, position: { ...ref.position } })).toBeNull();
  document.positions[ref.index] = { ...ref.position };
  expect(resolveTeacherEvidence(document, ref)).toBeNull();
});

test("oversized and malformed documents fail before comparison", () => {
  expect(compareTeacherMeasures(null).status).toBe("unavailable");
  expect(compareTeacherMeasures({ measures: Array(TEACHER_LIMITS.measures + 1), positions: [] }).reason).toMatch(/at most/);
  expect(compareTeacherMeasures({ measures: [], positions: Array(TEACHER_LIMITS.positions + 1) }).reason).toMatch(/at most/);
});


test("valid changed duration is not an exact recurrence", () => {
  const changed = TEACHER_EXAMPLE_XML.replace(/(<measure number="2">[\s\S]*?)(<duration>1<\/duration><voice>1<\/voice><type>quarter<\/type>)/, "$1<duration>2</duration><voice>1</voice><type>half</type>");
  // The first position is a chord, so update its simultaneous partner too.
  const withChord = changed.replace(/(<measure number="2">[\s\S]*?<chord\/>[\s\S]*?)(<duration>1<\/duration><voice>1<\/voice><type>quarter<\/type>)/, "$1<duration>2</duration><voice>1</voice><type>half</type>");
  const document = buildMusicXmlReaderDocuments(withChord).semanticDocument;
  expect(document.positions[4].duration.quarterNoteUnits).toBe(2);
  expect(document.measures[1].totalQuarterNoteUnits).toBe(5);
  expect(compareTeacherMeasures(document).status).toBe("unavailable");
});

test("equivalent elapsed divisions and labels still compare equal", () => {
  const document = example();
  for (const position of document.measures[1].positions) {
    position.duration.durationDivisions *= 2;
    position.duration.divisionsPerQuarter *= 2;
    position.duration.elapsed.durationDivisions *= 2;
    position.duration.elapsed.divisionsPerQuarter *= 2;
  }
  expect(compareTeacherMeasures(document).status).toBe("available");
});

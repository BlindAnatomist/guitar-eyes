import fs from "fs";
import path from "path";
import { TEACHER_EXAMPLE_XML, TEACHER_REPETITION_XML, buildTeacherExampleDocuments, buildTeacherRepetitionDocuments, isTeacherExampleSource, hasReviewedTeacherSource, reviewedTeacherLessonKind } from "./teacherExample";
import { findTeacherRecurrence, compareTeacherMeasures, createTeacherLesson, resolveTeacherEvidence, teacherPracticeSelection, TEACHER_LIMITS } from "./teacherPatterns";
import { buildMusicXmlReaderDocuments } from "./tabImportCoordinator";

const study = () => buildTeacherRepetitionDocuments().semanticDocument;
const measures = [...TEACHER_EXAMPLE_XML.matchAll(/<measure number="\d+">[\s\S]*?<\/measure>/g)].map((match) => match[0]);
const attributes = measures[0].match(/<attributes>[\s\S]*?<\/attributes>/)[0];
const bodies = measures.map((text) => text.replace(/\s*<attributes>[\s\S]*?<\/attributes>/, ""));
function sourceOrder(order) {
  return TEACHER_EXAMPLE_XML.slice(0, TEACHER_EXAMPLE_XML.indexOf("<measure")) + order.map((item, index) => bodies[item].replace(/<measure number="\d+">/, `<measure number="${index + 1}">${index === 0 ? attributes : ""}`)).join("\n") + "\n</part>\n</score-partwise>\n";
}
const importOrder = (order) => buildMusicXmlReaderDocuments(sourceOrder(order)).semanticDocument;

test("the new original fixture is mirrored exactly and admitted only to repetition teaching", () => {
  expect(TEACHER_REPETITION_XML).toBe(fs.readFileSync(path.join(process.cwd(), "fixtures/teacher/exact-repetition.musicxml"), "utf8"));
  expect(isTeacherExampleSource(TEACHER_REPETITION_XML)).toBe(true);
  const document = study();
  expect(reviewedTeacherLessonKind(document)).toBe("repetition");
  expect(document.measures).toHaveLength(3);
  expect(document.positions).toHaveLength(12);
  expect(document.measures.every((measure) => measure.positions.length === 4 && measure.totalQuarterNoteUnits === 4)).toBe(true);
  expect(document.positions.filter((position) => position.isRest)).toHaveLength(3);
  expect(document.positions[0].strings.filter((state) => state.type !== "silent")).toHaveLength(2);
  expect(document.positions[11].strings[0].fret).toBe(3);
  expect(findTeacherRecurrence(document).status).toBe("available");
  expect(compareTeacherMeasures(document).status).toBe("unavailable");
});

test("repetition teaches reuse and a bounded practice order, with every occurrence inspectable", () => {
  const document = study();
  const lesson = createTeacherLesson(document);
  expect(lesson.status).toBe("available");
  expect(lesson.kind).toBe("repetition");
  expect(lesson.title).toBe("Recognize exact repetition");
  expect(lesson.claims).toHaveLength(1);
  expect(lesson.claims[0].text).toContain("Measures 1, 2 and 3 have the same imported");
  expect(lesson.reusableText).toMatch(/whole measure.*simultaneous notes, rest and rhythm/);
  expect(lesson.opening).toBeUndefined();
  expect(lesson.endings).toBeUndefined();
  expect(lesson.practice).toHaveLength(3);
  expect(lesson.practice[1]).toMatch(/Compare measures 2 and 3 with measure 1/);
  expect(lesson.practice[2]).toContain("written order: 1, 2 and 3");
  expect(lesson.practice[2]).toContain("only those measures");
  expect(lesson.selectedMeasures).toEqual([1, 2, 3]);
  expect(lesson.evidence.map((item) => item.id)).toEqual(["first", "recurrence", "recurrence-3"]);
  expect(lesson.evidence.map((item) => item.references[0].index)).toEqual([0, 4, 8]);
  [...lesson.claims, ...lesson.evidence].forEach((item) => item.references.forEach((reference) => {
    expect(resolveTeacherEvidence(document, reference)).toBe(reference.index);
    expect(reference.position).toBe(document.positions[reference.index]);
  }));
});

test.each([
  ["A A", [0, 0], [1, 2]],
  ["A A A", [0, 0, 0], [1, 2, 3]],
  ["A B A", [0, 2, 0], [1, 3]],
  ["B A A", [2, 0, 0], [2, 3]],
  ["A A A B", [0, 0, 0, 2], [1, 2, 3]],
  ["A B A B", [0, 2, 0, 2], [1, 3]],
])("pure recurrence query selects all exact occurrences deterministically: %s", (name, order, expected) => {
  const document = importOrder(order);
  const comparison = findTeacherRecurrence(document);
  expect(comparison.status).toBe("available");
  expect(comparison.recurrence.map((fact) => fact.measure.documentNumber)).toEqual(expected);
  expect(teacherPracticeSelection(comparison).map((fact) => fact.measure.documentNumber)).toEqual(expected);
  expect(comparison.variation).toBeUndefined();
  expect(findTeacherRecurrence(document)).toEqual(comparison);
  expect(hasReviewedTeacherSource(document)).toBe(false);
  expect(createTeacherLesson(document).status).toBe("unavailable");
});

test.each([
  ["four measures", [0, 0, 0, 2], [1, 2, 3, 4]],
  ["variation first", [2, 0, 0], [1, 2, 3]],
  ["two recurrent groups", [0, 2, 0, 2], [1, 2, 3]],
])("changed-ending selection names only the covered measures in written order: %s", (name, order, expected) => {
  const comparison = compareTeacherMeasures(importOrder(order));
  expect(comparison.status).toBe("available");
  expect(teacherPracticeSelection(comparison).map((fact) => fact.measure.documentNumber)).toEqual(expected);
});

test("the original changed-ending lesson still contains the exact ending comparison", () => {
  const document = buildTeacherExampleDocuments().semanticDocument;
  const lesson = createTeacherLesson(document);
  expect(reviewedTeacherLessonKind(document)).toBe("changed-ending");
  expect(lesson.kind).toBe("changed-ending");
  expect(lesson.title).toBe("Pattern and changed ending");
  expect(lesson.claims).toHaveLength(2);
  expect(lesson.endings[0].text).toContain("fret 3");
  expect(lesson.endings[1].text).toContain("fret 5");
  expect(lesson.selectedMeasures).toEqual([1, 2, 3]);
  expect(lesson.practice[2]).toContain("written order: 1, 2 and 3");
  expect(lesson.practice[2]).not.toContain("the three measures");
});

test.each([
  ["whitespace", (text) => text + "\n"],
  ["title", (text) => text.replace("original exact", "different exact")],
  ["fret", (text) => text.replace("<fret>3</fret>", "<fret>5</fret>")],
  ["repeat sign", (text) => text.replace("</measure>", '<barline location="right"><repeat direction="backward"/></barline></measure>')],
])("a %s change does not inherit reviewed recurrence admission", (name, alter) => {
  const source = alter(TEACHER_REPETITION_XML);
  expect(isTeacherExampleSource(source)).toBe(false);
  expect(() => buildTeacherExampleDocuments(source)).toThrow(/not been reviewed/);
  expect(() => buildTeacherRepetitionDocuments(source)).toThrow(/not been reviewed/);
  expect(createTeacherLesson(buildMusicXmlReaderDocuments(source).semanticDocument).status).toBe("unavailable");
});

test("identical ordinary imports, clones and changed canonical documents have no reviewed proof", () => {
  expect(createTeacherLesson(buildMusicXmlReaderDocuments(TEACHER_REPETITION_XML).semanticDocument).status).toBe("unavailable");
  const document = study();
  expect(hasReviewedTeacherSource({ ...document })).toBe(false);
  document.positions[0].strings[1].fret = 2;
  expect(reviewedTeacherLessonKind(document)).toBeNull();
  expect(createTeacherLesson(document).status).toBe("unavailable");
  expect(() => buildTeacherRepetitionDocuments(TEACHER_EXAMPLE_XML)).toThrow(/not been reviewed/);
});

test.each([
  ["warning", (document) => { document.warnings.push("unknown marking"); }],
  ["source-order loss", (document) => { document.semanticLosses = [{ kind: "source-order-only", sourceFormat: "other", disposition: "preserved" }]; }],
  ["technique", (document) => { document.positions[0].strings[0].techniques = [{ name: "bend" }]; }],
  ["unknown rhythm", (document) => { document.positions[0].duration = null; }],
  ["incomplete rhythm", (document) => { document.measures[0].durationComplete = false; }],
  ["wrong tuning", (document) => { document.strings[5].tuning = "D"; }],
  ["noncanonical reference", (document) => { document.measures[0].positions[0] = { ...document.positions[0] }; }],
  ["invalid rest", (document) => { document.positions[0].isRest = true; }],
])("recurrence reuses the fail-closed canonical validation: %s", (name, mutate) => {
  const document = study(); mutate(document);
  expect(findTeacherRecurrence(document).status).toBe("unavailable");
});

test("no repetition, one measure and resource bounds cannot form recurrence advice", () => {
  expect(findTeacherRecurrence(importOrder([0, 2])).status).toBe("unavailable");
  expect(findTeacherRecurrence(importOrder([0])).status).toBe("unavailable");
  expect(findTeacherRecurrence(null).status).toBe("unavailable");
  expect(findTeacherRecurrence({ measures: Array(TEACHER_LIMITS.measures + 1), positions: [] }).reason).toMatch(/at most/);
  expect(findTeacherRecurrence({ measures: [], positions: Array(TEACHER_LIMITS.positions + 1) }).reason).toMatch(/at most/);
  expect(teacherPracticeSelection({ status: "unavailable" })).toEqual([]);
});

test("frozen recurrence facts are unchanged and stale inspection targets fail closed", () => {
  const document = study();
  const freeze = (value) => { Object.freeze(value); Object.values(value).forEach((item) => { if (item && typeof item === "object" && !Object.isFrozen(item)) freeze(item); }); };
  freeze(document);
  const before = JSON.stringify(document);
  const lesson = createTeacherLesson(document);
  expect(createTeacherLesson(document)).toEqual(lesson);
  expect(JSON.stringify(document)).toBe(before);
  lesson.evidence.forEach((item) => {
    expect(resolveTeacherEvidence(study(), item.references[0])).toBeNull();
    expect(resolveTeacherEvidence(document, { ...item.references[0], position: { ...item.references[0].position } })).toBeNull();
  });
});

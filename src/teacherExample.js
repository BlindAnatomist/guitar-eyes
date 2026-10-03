import { buildMusicXmlReaderDocuments } from "./tabImportCoordinator";

// Project-authored CC0 example, exactly mirrored in fixtures/teacher.
// This is source coverage evidence, never an alternate musical model.
export const TEACHER_EXAMPLE_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<score-partwise version=\"4.0\">\n  <work><work-title>Guitar Eyes original pattern and changed ending</work-title></work>\n  <identification><creator type=\"composer\">Guitar Eyes project</creator><rights>CC0 1.0 Universal</rights></identification>\n  <part-list><score-part id=\"P1\"><part-name>Guitar</part-name></score-part></part-list>\n  <part id=\"P1\">\n    <measure number=\"1\">\n      <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time>\n        <staff-details><staff-lines>6</staff-lines>\n          <staff-tuning line=\"1\"><tuning-step>E</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>\n          <staff-tuning line=\"2\"><tuning-step>A</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>\n          <staff-tuning line=\"3\"><tuning-step>D</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>\n          <staff-tuning line=\"4\"><tuning-step>G</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>\n          <staff-tuning line=\"5\"><tuning-step>B</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>\n          <staff-tuning line=\"6\"><tuning-step>E</tuning-step><tuning-octave>4</tuning-octave></staff-tuning>\n        </staff-details>\n      </attributes>\n      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>0</fret></technical></notations></note>\n      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>2</string><fret>1</fret></technical></notations></note>\n      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>3</string><fret>0</fret></technical></notations></note>\n      <note><rest/><duration>1</duration><voice>1</voice><type>quarter</type></note>\n      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>3</fret></technical></notations></note>\n    </measure>\n    <measure number=\"2\">\n      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>0</fret></technical></notations></note>\n      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>2</string><fret>1</fret></technical></notations></note>\n      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>3</string><fret>0</fret></technical></notations></note>\n      <note><rest/><duration>1</duration><voice>1</voice><type>quarter</type></note>\n      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>3</fret></technical></notations></note>\n    </measure>\n    <measure number=\"3\">\n      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>0</fret></technical></notations></note>\n      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>2</string><fret>1</fret></technical></notations></note>\n      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>3</string><fret>0</fret></technical></notations></note>\n      <note><rest/><duration>1</duration><voice>1</voice><type>quarter</type></note>\n      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><notations><technical><string>1</string><fret>5</fret></technical></notations></note>\n    </measure>\n  </part>\n</score-partwise>\n";

const reviewedDocuments = new WeakMap();

export function isTeacherExampleSource(sourceText) {
  return sourceText === TEACHER_EXAMPLE_XML;
}

export function buildTeacherExampleDocuments(sourceText = TEACHER_EXAMPLE_XML) {
  if (!isTeacherExampleSource(sourceText)) {
    throw new Error("This source has not been reviewed for the teacher prototype.");
  }
  const result = buildMusicXmlReaderDocuments(sourceText);
  // Bind source coverage to the exact imported document, including its contents.
  // Re-imports and altered documents cannot inherit the source proof.
  reviewedDocuments.set(result.semanticDocument, JSON.stringify(result.semanticDocument));
  return result;
}

export function hasReviewedTeacherSource(document) {
  return reviewedDocuments.has(document) &&
    reviewedDocuments.get(document) === JSON.stringify(document);
}

import fs from "fs";
import { createHash } from "crypto";
import { TextDecoder, TextEncoder } from "util";
import { gunzipSync, inflateRawSync } from "zlib";
import * as alphaTab from "@coderline/alphatab";
import { inspectGuitarProSource } from "./guitarProSourceVersion";
import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";
import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";
import { normalizeVerifiedGuitarProIntermediate } from "./guitarProSourceNormalizer";
import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";
import { buildMusicXmlReaderDocuments } from "./tabImportCoordinator";
import { finalizeSemanticDocument, validateSemanticDocument } from "./semanticDocumentValidation";
import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
import { describePlayablePosition } from "./positionDescription";
import { decodePowerTabPt2Document } from "./powerTabPt2Decoder";
import { decodeTuxGuitarFile } from "./tuxGuitarDecoder";
import { readModernEntries, zipStored } from "./tuxGuitarStandardBassZip";

Object.assign(global, { TextDecoder, TextEncoder });
const clone = (value) => JSON.parse(JSON.stringify(value));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const fields = ({ repeatStart, repeatCount, alternateEndings }) => ({ repeatStart, repeatCount, alternateEndings });
const bars = (source) => source.tracks[0].staves[0].bars;
const normalize = (source, options) => finalizeSemanticDocument(normalizeVerifiedGuitarProIntermediate(source, options));
const asFile = (name, bytes) => ({ name, size: bytes.byteLength,
  arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
const zero = { repeatStart: false, repeatCount: 0, alternateEndings: 0 };
const corpus = (extension) => fs.readFileSync(`fixtures/real-world/guitar-pro/cross-format/guitar-eyes-cross-format.${extension}`);
const instructions = (document) => document.positions.map((_, index) => describePlayablePosition(document, index));
const withoutLosses = ({ semanticLosses, ...document }) => document;
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
async function decodeGp(bytes, fileName = "diagnostic.gp") {
  const versionEvidence = await inspectGuitarProSource(bytes, {
    fileName,
    inspectSharedArchive: (input) => inspectGuitarProArchiveVersion(input, {
      inflateRaw: async (packed) => new Uint8Array(inflateRawSync(packed)),
    }),
  });
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(bytes), new alphaTab.Settings());
  return alphaTabScoreToGuitarProIntermediate(score, { versionEvidence });
}
function expectedLoss(document, sourceMeasureIndex, sourceMetadata) {
  const measure = document.measures[sourceMeasureIndex];
  return { kind: "source-order-only", sourceFormat: "guitar-pro", disposition: "not-expanded",
    sourceMeasureIndex, measureNumber: measure.sourceNumber,
    location: { scope: "measure", measureId: measure.id }, sourceMetadata };
}
let baseline;
let repeated;
let diagnosticBytes;
beforeAll(async () => {
  const bytes = corpus("gp");
  expect(sha256(bytes)).toBe("b0d61d613c7bbdd338a087bb3adc25ca3f14716bc780f4f6eb09ed7267c8c965");
  baseline = await decodeGp(bytes);
  // Test-only mutation of the locked original CC0 phrase. This is not a new
  // producer-export or broader GP3–7 repeat-compatibility claim.
  expect(bytes.readUInt32LE(0)).toBe(0x04034b50);
  expect(bytes.readUInt16LE(8)).toBe(8);
  const start = 30 + bytes.readUInt16LE(26) + bytes.readUInt16LE(28);
  expect(bytes.subarray(30, 30 + bytes.readUInt16LE(26)).toString()).toBe("Content/score.gpif");
  const gpif = inflateRawSync(bytes.subarray(start, start + bytes.readUInt32LE(18))).toString();
  expect(sha256(gpif)).toBe("ef7d53ddf17975046716d9994123649504013666d25025a7c9dbc433f87f3dfa");
  let ordinal = 0;
  const changed = gpif.replace(/<MasterBar>/g, () => "<MasterBar>" + (ordinal++ === 0
    ? '<Repeat start="true" end="false" count="0"/>'
    : '<Repeat start="false" end="true" count="3"/><AlternateEndings>1 2</AlternateEndings>'));
  expect(ordinal).toBe(2);
  diagnosticBytes = zipStored([["Content/score.gpif", new TextEncoder().encode(changed)]]);
  expect(sha256(diagnosticBytes)).toBe("1f33ebe5caeb4b23708b7667b31187c8d003189c4fbacaf1ed08c17d8f01d9f0");
  repeated = await decodeGp(diagnosticBytes);
});

test("encoded GP7 retains exact repeat facts in the loaded document after the intermediate is discarded", async () => {
  const expected = [{ ...zero, repeatStart: true }, { ...zero, repeatCount: 3, alternateEndings: 3 }];
  expect(bars(repeated).map(fields)).toEqual(expected);
  const result = await buildGuitarProReaderDocuments(asFile("diagnostic.gp", diagnosticBytes), {
    workerFactory: jest.fn(), decode: jest.fn(async () => repeated),
  });
  const document = result.semanticDocument;
  expect(result.guitarProIntermediate).toBeNull();
  expect(document.semanticLosses).toEqual(expected.map((values, index) => expectedLoss(document, index, values)));
  expect(document.warnings).toEqual([1, 2].map((number) =>
    `Measure ${number} contains repeat or alternate-ending metadata. Source-order measures were preserved without expanding playback order.`));
  const original = normalize(baseline);
  expect(withoutLosses(document)).toEqual({ ...original, warnings: document.warnings });
  expect(result.desktopBlocks).toEqual(semanticDocumentToDesktopBlocks(original));
  expect(instructions(document)).toEqual(instructions(original));
  expect(document.positions).toHaveLength(6);
});

test.each([["repeatStart", true], ["repeatCount", 3], ["alternateEndings", 5]])(
  "isolated decoded %s retains false/zero companions without translating the ending mask", (field, value) => {
    const source = clone(baseline);
    bars(source)[1][field] = value;
    const document = normalize(source);
    expect(document.semanticLosses).toEqual([expectedLoss(document, 1, { ...zero, [field]: value })]);
    expect(document.warnings).toEqual([
      "Measure 2 contains repeat or alternate-ending metadata. Source-order measures were preserved without expanding playback order.",
    ]);
  }
);

test.each(["gp3", "gp4", "gp5", "gpx", "gp"])("zero-repeat %s corpus does not acquire a loss field", async (extension) => {
  const source = await decodeGp(corpus(extension), `control.${extension}`);
  expect(bars(source).map(fields)).toEqual([zero, zero]);
  expect(normalize(source)).not.toHaveProperty("semanticLosses");
});

test.each(["same", "pickup", "0", "-4", "𝄞", "", null])("GP repeat locality uses ordinals rather than duplicate label %s", (label) => {
  const source = clone(repeated);
  bars(source).forEach((bar) => { bar.sourceNumber = label; });
  const document = normalize(source);
  expect(document.semanticLosses.map((loss) => [loss.sourceMeasureIndex, loss.location, loss.measureNumber])).toEqual([
    [0, { scope: "measure", measureId: document.measures[0].id }, label === null ? "1" : label],
    [1, { scope: "measure", measureId: document.measures[1].id }, label === null ? "2" : label],
  ]);
});

test.each([[0, 1], [1, 0], [1, 1]])("repeat metadata comes from selected track %s staff %s", async (trackIndex, staffIndex) => {
  const source = clone(baseline);
  source.tracks.push(clone(source.tracks[0]));
  source.versionEvidence.declaredTrackCount = 2;
  source.tracks.forEach((track, ti) => {
    track.staves.push(clone(track.staves[0]));
    track.staves.forEach((staff, si) => { staff.bars[0].repeatCount = 2 + ti * 2 + si; });
  });
  const pending = await buildGuitarProReaderDocuments(null, { intermediate: source });
  expect(pending.requiresTrackSelection).toBe(true);
  expect(pending.semanticDocument).toBeNull();
  const result = await buildGuitarProReaderDocuments(null, { intermediate: source, selection: { trackIndex, staffIndex } });
  const document = result.semanticDocument;
  expect(document).toMatchObject({ sourceTrackIndex: trackIndex, sourceStaffIndex: staffIndex });
  expect(document.semanticLosses).toEqual([expectedLoss(document, 0, { ...zero, repeatCount: 2 + trackIndex * 2 + staffIndex })]);
});

test("automatic sole-staff selection does not take repeat facts from an ignored track", async () => {
  const source = clone(repeated);
  const percussion = clone(source.tracks[0]);
  percussion.isPercussion = true;
  percussion.staves[0].bars[0].repeatCount = 99;
  source.tracks.unshift(percussion);
  source.versionEvidence.declaredTrackCount = 2;
  const { semanticDocument: document } = await buildGuitarProReaderDocuments(null, { intermediate: source });
  expect(document.sourceTrackIndex).toBe(1);
  expect(document.semanticLosses[0]).toEqual(expectedLoss(document, 0, { ...zero, repeatStart: true }));
});

test("repeat metadata survives frozen-input normalization, JSON restoration and repeated canonical finalization", () => {
  const source = freeze(clone(repeated));
  const before = JSON.stringify(source);
  const input = freeze(clone(normalize(source)));
  const first = finalizeSemanticDocument(input);
  const second = finalizeSemanticDocument(first);
  [first, second].forEach((document) => {
    expect(document).toEqual(input);
    expect(document.semanticLosses).toBe(input.semanticLosses);
    document.measures.forEach((measure, index) => {
      expect(document.blocks[0].measures[index]).toBe(measure);
      measure.positions.forEach((position) => expect(position).toBe(document.positions[position.index]));
    });
  });
  expect(JSON.stringify(source)).toBe(before);
});

function duplicateLabelsDocument() {
  const source = clone(repeated);
  bars(source).forEach((bar) => { bar.sourceNumber = "same"; });
  return normalize(source);
}

test("a supplied GP repeat record cannot target a wrong existing measure", () => {
  const document = normalize(baseline);
  document.semanticLosses = [expectedLoss(document, 0, { ...zero, repeatStart: true })];
  document.semanticLosses[0].location.measureId = document.measures[1].id;
  expect(() => validateSemanticDocument(document)).toThrow(/semantic loss/);
});

test.each([
  ["wrong existing measure", (d) => { d.semanticLosses[0].location.measureId = d.measures[1].id; }],
  ["dangling measure", (d) => { d.semanticLosses[0].location.measureId = "missing"; }],
  ["position in the same measure", (d) => { d.semanticLosses[0].location = { scope: "position", positionId: d.positions[0].id }; }],
  ["wrong label", (d) => { d.semanticLosses[0].measureNumber = "other"; }],
  ["wrong document format", (d) => { d.sourceFormat = "example"; }],
])("contradictory GP repeat attachment rejects: %s", (_name, mutate) => {
  const document = duplicateLabelsDocument();
  mutate(document);
  const before = JSON.stringify(document);
  expect(() => validateSemanticDocument(freeze(document))).toThrow(/semantic loss/);
  expect(JSON.stringify(document)).toBe(before);
  expect(() => normalize(repeated)).not.toThrow();
});

test.each([null, undefined, -1, 0.5, NaN, Infinity, "0", false, 2, Number.MAX_SAFE_INTEGER + 1])(
  "GP source ordinal %s must identify the referenced measure without coercion", (sourceMeasureIndex) => {
    const document = normalize(repeated);
    document.semanticLosses[0].sourceMeasureIndex = sourceMeasureIndex;
    expect(() => finalizeSemanticDocument(document)).toThrow(/semantic loss/);
  }
);

test("existing legacy and explicit-unlocalized loss compatibility is unchanged", () => {
  const document = normalize(repeated);
  delete document.semanticLosses[0].location;
  document.semanticLosses[1].location = { scope: "unlocalized", reason: "No verified source target" };
  document.semanticLosses[1].sourceMeasureIndex = 99;
  const before = clone(document.semanticLosses);
  expect(finalizeSemanticDocument(freeze(document)).semanticLosses).toEqual(before);
});

test("GP empty measures remain rejected rather than inheriting MusicXML empty-measure support", () => {
  const source = clone(repeated);
  bars(source)[0].voices = [{ index: 0, beats: [] }];
  expect(() => normalize(source)).toThrow(expect.objectContaining({ code: "EMPTY_GUITAR_PRO_MEASURE" }));
});

test("GP and MusicXML retain native repeat evidence under the same measure-local not-expanded contract", () => {
  const xml = fs.readFileSync("fixtures/real-world/musicxml-chord-rest-two-measures.musicxml", "utf8");
  let ordinal = 0;
  const changed = xml.replace(/<measure number="[^"]*"/g, '<measure number="same"').replaceAll("</measure>", () => ++ordinal === 1
    ? '<barline location="left"><repeat direction="forward"/></barline></measure>'
    : '<barline location="right"><repeat direction="backward" times="3"/><ending number="1,2" type="stop"/></barline></measure>');
  expect(sha256(changed)).toBe("6a4343f2a59764b021100fbed1b3f2688f4faa98ca8b108880702ba2e965aac5");
  const musicXml = buildMusicXmlReaderDocuments(changed).semanticDocument;
  const guitarPro = duplicateLabelsDocument();
  const projection = (document) => document.semanticLosses.map(({ sourceMeasureIndex, measureNumber, kind, disposition, location }) =>
    ({ sourceMeasureIndex, measureNumber, kind, disposition, location }));
  expect(projection(musicXml)).toEqual([projection(guitarPro)[0], projection(guitarPro)[1], projection(guitarPro)[1]]);
  expect(musicXml.semanticLosses.map((loss) => loss.attributes)).toEqual([
    { direction: "forward" }, { direction: "backward", times: "3" }, { number: "1,2", type: "stop" },
  ]);
  expect(guitarPro.semanticLosses[1].sourceMetadata).toEqual({ repeatStart: false, repeatCount: 3, alternateEndings: 3 });
  // The existing XML specimen has a hammer-on absent from the GP export.
  // Repeat retention must preserve each format's own established instructions.
  const originalXml = buildMusicXmlReaderDocuments(xml).semanticDocument;
  expect(instructions(guitarPro)).toEqual(instructions(normalize(baseline)));
  expect(instructions(musicXml)).toEqual(instructions(originalXml));
  expect(semanticDocumentToDesktopBlocks(musicXml)).toEqual(semanticDocumentToDesktopBlocks(originalXml));
  expect(finalizeSemanticDocument(clone(musicXml)).semanticLosses).toEqual(musicXml.semanticLosses);
  const wrong = clone(musicXml);
  wrong.semanticLosses[0].location.measureId = wrong.measures[1].id;
  expect(() => validateSemanticDocument(wrong)).toThrow(/semantic loss/);
});

describe.each([1, 10, 11])("PowerTab PT2 v%s retains its rejection boundary", (version) => {
  function source() {
    const path = version === 11 ? "fixtures/powertab-v11/powertab-v11-editor-export-six-position.pt2"
      : `fixtures/powertab-pt2-historical/powertab-pt2-v${version}-six-position.pt2`;
    return JSON.parse(gunzipSync(fs.readFileSync(path)));
  }
  test("unchanged control still decodes", () => {
    expect(bars(decodePowerTabPt2Document(source())).map(fields)).toEqual([zero, zero]);
  });
  test.each(["repeat-start", "repeat-end", "repeat-count", "alternate-ending"])("rejects %s", (field) => {
    const input = source();
    const system = input.score.systems[0];
    if (field === "repeat-start") system.barlines[0].bar_type = version < 10 ? 3 : "RepeatStart";
    if (field === "repeat-end") system.barlines[1].bar_type = version < 10 ? 4 : "RepeatEnd";
    if (field === "repeat-count") system.barlines[1].num_repeats = 3;
    if (field === "alternate-ending") system.alternate_endings = [{}];
    const code = field === "alternate-ending" ? "UNSUPPORTED_POWERTAB_SYSTEM_STRUCTURE" : "UNSUPPORTED_POWERTAB_BARLINE";
    expect(() => decodePowerTabPt2Document(input)).toThrow(expect.objectContaining({ code }));
  });
});

test("unchanged modern TuxGuitar control still decodes", async () => {
  const bytes = fs.readFileSync("fixtures/tuxguitar-tg/tuxguitar-20-six-position.tg");
  const source = await decodeTuxGuitarFile(asFile("control.tg", bytes));
  expect(bars(source).map(fields)).toEqual([zero, zero]);
});

test.each(["repeatOpen", "repeatClose", "repeatAlternative"])("modern TuxGuitar still rejects %s", async (field) => {
  const bytes = fs.readFileSync("fixtures/tuxguitar-tg/tuxguitar-20-six-position.tg");
  const entries = await readModernEntries(bytes);
  const xml = new TextDecoder().decode(entries.get("content.xml"));
  const changed = xml.replace("</TGMeasureHeader>", `<${field}>3</${field}></TGMeasureHeader>`);
  const diagnostic = zipStored([["version.txt", entries.get("version.txt")], ["content.xml", new TextEncoder().encode(changed)]]);
  await expect(decodeTuxGuitarFile(asFile("diagnostic.tg", diagnostic))).rejects.toMatchObject({ code: "UNSUPPORTED_TUXGUITAR_MEASURE_STRUCTURE" });
});

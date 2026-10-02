import fs from "fs";
import { TextDecoder, TextEncoder } from "util";
import { gunzipSync } from "zlib";
import { decodePowerTabPt2Bytes } from "./powerTabPt2Decoder";
import { buildPowerTabReaderDocuments } from "./powerTabReaderDocuments";
import { buildPowerTabLegacyReaderDocuments } from "./powerTabLegacyReaderDocuments";
import { decodePowerTabLegacyHistoricalBytes } from "./powerTabLegacyHistoricalDecoder";
import { decodePowerTabLegacyV17Bytes } from "./powerTabLegacyV17Decoder";
import { buildTuxGuitarReaderDocuments } from "./tuxGuitarReaderDocuments";
import { extractCompressedMusicXml } from "./compressedMusicXmlImporter";
import { zipStored } from "./tuxGuitarStandardBassZip";
import { parseMusicXmlTablature } from "./musicXmlImporter";
import { describePlayablePosition } from "./positionDescription";

import { finalizeSemanticDocument, validateSemanticDocument } from "./semanticDocumentValidation";
import { buildMusicXmlReaderDocuments, buildReaderDocuments } from "./tabImportCoordinator";

Object.assign(global, { TextDecoder, TextEncoder });

const xml = fs.readFileSync("fixtures/real-world/musicxml-chord-rest-two-measures.musicxml", "utf8");
const valid = () => buildMusicXmlReaderDocuments(xml).semanticDocument;
const clone = (value) => JSON.parse(JSON.stringify(value));

function expectCanonical(document) {
  expect(document).not.toBeNull();
  let positionIndex = 0;
  let measureIndex = 0;
  document.blocks.forEach((block) => {
    block.positions.forEach((position) => {
      expect(position).toBe(document.positions[positionIndex++]);
    });
    (block.measures || []).forEach((measure) => {
      expect(measure).toBe(document.measures[measureIndex++]);
      measure.positions.forEach((position) => {
        expect(position).toBe(document.positions[position.index]);
      });
    });
  });
  expect(positionIndex).toBe(document.positions.length);
  expect(measureIndex).toBe(document.measures.length);
}

test.each([
  "ascii-two-measures-rhythm.txt", "ascii-seven-string-guitar.txt",
  "ascii-eight-string-guitar.txt", "ascii-five-string-bass.txt", "ascii-six-string-bass.txt",
])("%s uses canonical nested positions", (filename) => {
  expectCanonical(buildReaderDocuments(fs.readFileSync(`fixtures/real-world/${filename}`, "utf8")).semanticDocument);
});
test("multiple ASCII blocks use canonical nested positions", () => {
  expectCanonical(buildReaderDocuments(fs.readFileSync("fixtures/shared-core-two-block-guitar.txt", "utf8")).semanticDocument);
});
test("MusicXML shares one position and measure object in every view", () => {
  expectCanonical(valid());
});

test.each([
  ["missing block position", (d) => d.blocks[0].positions.pop()],
  ["duplicate block position", (d) => { d.blocks[0].positions[1] = d.blocks[0].positions[0]; }],
  ["reordered block positions", (d) => d.blocks[0].positions.reverse()],
  ["wrong nested fret", (d) => { d.measures[0].positions[0].strings[5].fret = 8; }],
  ["wrong nested duration", (d) => { d.measures[0].positions[0].duration.name = "half note"; }],
  ["wrong nested technique", (d) => { d.measures[0].positions[0].strings[5].techniques = [{name:"bend"}]; }],
  ["missing measure position", (d) => d.measures[0].positions.pop()],
  ["duplicate measure position", (d) => { d.measures[0].positions[1] = d.measures[0].positions[0]; }],
  ["reordered measure positions", (d) => d.measures[0].positions.reverse()],
  ["missing block measure", (d) => d.blocks[0].measures.pop()],
  ["reordered block measures", (d) => d.blocks[0].measures.reverse()],
  ["duplicate measure ID", (d) => { d.measures[1].id = d.measures[0].id; d.blocks[0].measures[1].id = d.measures[0].id; }],
  ["wrong nested index", (d) => { d.measures[0].positions[0].index = 99; }],
  ["wrong block membership", (d) => { d.positions[0].blockIndex = 1; }],
  ["missing nested musical evidence", (d) => { delete d.measures[0].positions[0].duration; }],
  ["extra nested musical evidence", (d) => { d.measures[0].positions[0].unproved = "new evidence"; }],
])("reader admission rejects %s instead of picking a copy", (_name, mutate) => {
  const document = clone(valid());
  mutate(document);
  expect(() => validateSemanticDocument(document)).toThrow(/musical evidence/);
});

function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

test("finalization is non-mutating, repeatable, and preserves the canonical musical projection", () => {
  const input = freeze(clone(valid()));
  const before = JSON.stringify(input);
  const first = finalizeSemanticDocument(input);
  const second = finalizeSemanticDocument(first);
  [first, second].forEach((document) => {
    expectCanonical(document);
    expect(document.positions).toBe(input.positions);
    expect(document.strings).toBe(input.strings);
    expect(document.warnings).toBe(input.warnings);
    expect(document.semanticLosses).toBe(input.semanticLosses);
    expect(document).toEqual(input);
  });
  expect(JSON.stringify(input)).toBe(before);
});

test("only missing derived global fields are tolerated on inherited nested copies", () => {
  const input = clone(valid());
  input.blocks[0].positions.forEach((position) => {
    delete position.index; delete position.number; delete position.total;
  });
  [...input.measures, ...input.blocks[0].measures].forEach((measure) => {
    measure.positions.forEach((position) => {
      delete position.index; delete position.number; delete position.total;
    });
  });
  input.blocks[0].measures.forEach((measure) => {
    delete measure.documentNumber; delete measure.documentTotal;
  });
  expectCanonical(finalizeSemanticDocument(input));
});

test.each([
  ["duplicate document position ID", (d) => {
    d.positions[1].id = d.positions[0].id;
    d.blocks[0].positions[1].id = d.positions[0].id;
    d.blocks[0].measures[0].positions[1].id = d.positions[0].id;
    d.measures[0].positions[1].id = d.positions[0].id;
  }],
  ["wrong block number", (d) => { d.blocks[0].number = 2; }],
  ["missing document position", (d) => { d.positions.pop(); }],
  ["extra document measure", (d) => { d.measures.push(clone(d.measures[0])); }],
  ["missing nested rest flag", (d) => { delete d.measures[0].positions[1].isRest; }],
  ["different nested provenance", (d) => { d.measures[0].sourceNumber = "other"; }],
])("finalization rejects %s without mutating its source", (_name, mutate) => {
  const input = clone(valid());
  mutate(input);
  const before = JSON.stringify(input);
  expect(() => finalizeSemanticDocument(input)).toThrow(/musical evidence/);
  expect(JSON.stringify(input)).toBe(before);
});

test("empty interior ASCII measures retain their source order and do not become rests", () => {
  const source = ["e|0-||-2|", ...["B", "G", "D", "A", "E"].map((name) => `${name}|--||--|`)].join("\n");
  const document = buildReaderDocuments(source).semanticDocument;
  expectCanonical(document);
  expect(document.measures.map((measure) => measure.positions.length)).toEqual([1, 0, 1]);
  expect(document.positions.map((position) => position.measureNumber)).toEqual([1, 3]);
  expect(document.positions.some((position) => position.isRest)).toBe(false);
});

test.each(["blockNumber", "positionInBlock", "positionsInBlock"])(
  "canonical %s must match block order even when all views share it", (field) => {
    const document = valid();
    document.positions[0][field] = 99;
    expect(() => finalizeSemanticDocument(document)).toThrow(/navigation identity/);
  }
);
test("removing all measure collections cannot leave invented measure membership", () => {
  const document = valid();
  document.measures = [];
  document.blocks[0].measures = [];
  expect(() => finalizeSemanticDocument(document)).toThrow(/measure absent/);
});

test("the pre-admission MusicXML document keeps exact music, speech and source evidence", () => {
  const raw = freeze(parseMusicXmlTablature(xml));
  const before = JSON.stringify(raw);
  const finalized = finalizeSemanticDocument(raw);
  expectCanonical(finalized);
  expect(finalized.positions).toBe(raw.positions);
  raw.positions.forEach((_position, index) => {
    expect(describePlayablePosition(finalized, index)).toBe(describePlayablePosition(raw, index));
  });
  const navigationFree = ({blocks, measures, ...remaining}) => remaining;
  expect(navigationFree(finalized)).toEqual(navigationFree(raw));
  expect(JSON.stringify(raw)).toBe(before);
});

test("compressed MusicXML uses the same canonical boundary", async () => {
  const bytes = zipStored([
    ["META-INF/container.xml", new TextEncoder().encode('<container><rootfiles><rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>')],
    ["score.musicxml", new TextEncoder().encode(xml)],
  ]);
  const extracted = await extractCompressedMusicXml(bytes.buffer);
  expectCanonical(buildMusicXmlReaderDocuments(extracted.sourceText).semanticDocument);
});

test.each(Array.from({length: 11}, (_, index) => index + 1))(
  "accepted PowerTab PT2 v%s has canonical positions and measures", async (version) => {
    const filename = version === 11
      ? "fixtures/powertab-v11/powertab-v11-editor-export-six-position.pt2"
      : `fixtures/powertab-pt2-historical/powertab-pt2-v${version}-six-position.pt2`;
    const intermediate = await decodePowerTabPt2Bytes(fs.readFileSync(filename), {
      decompress: async (bytes) => new Uint8Array(gunzipSync(bytes)),
    });
    const result = await buildPowerTabReaderDocuments(null, {intermediate});
    expectCanonical(result.semanticDocument);
  }
);
test.each(["10", "102", "15", "17"])(
  "accepted legacy PowerTab %s has canonical positions and measures", async (version) => {
    const directory = version === "17" ? "powertab-ptb-v17" : "powertab-ptb-historical";
    const decode = version === "17" ? decodePowerTabLegacyV17Bytes : decodePowerTabLegacyHistoricalBytes;
    const intermediate = decode(fs.readFileSync(`fixtures/${directory}/powertab-v${version}-original-six-position.ptb`));
    const result = await buildPowerTabLegacyReaderDocuments(null, {intermediate});
    expectCanonical(result.semanticDocument);
  }
);
test.each(["10", "11", "12", "13", "15", "20"].flatMap((version) =>
  ["guitar", "bass"].map((instrument) => [version, instrument]))) (
  "accepted TuxGuitar %s %s has canonical positions and measures", async (version, instrument) => {
    const filename = instrument === "bass"
      ? `fixtures/tuxguitar-tg-bass/tuxguitar-${version}-standard-bass.tg`
      : `fixtures/tuxguitar-tg/tuxguitar-${version}-six-position.tg`;
    const bytes = fs.readFileSync(filename);
    const result = await buildTuxGuitarReaderDocuments({
      name: "existing-proof.tg",
      arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    });
    expectCanonical(result.semanticDocument);
  }
);

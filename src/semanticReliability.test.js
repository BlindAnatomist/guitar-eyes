import fs from "fs";
import { TextEncoder, TextDecoder } from "util";
import { zipStored } from "./tuxGuitarStandardBassZip";
import { decodeTuxGuitarFile } from "./tuxGuitarDecoder";
import { normalizeVerifiedTuxGuitarIntermediate } from "./tuxGuitarSourceNormalizer";
import { parseMusicXmlTablature } from "./musicXmlImporter";
import { buildGuitarProTrackInventory } from "./guitarProTrackInventory";
import { normalizeVerifiedGuitarProIntermediate } from "./guitarProSourceNormalizer";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
const xml = fs.readFileSync("fixtures/real-world/musicxml-minimal-guitar-tab.musicxml", "utf8");
const tgXml = fs.readFileSync("fixtures/tuxguitar-tg/tuxguitar-20-content.xml", "utf8");
function tgFile(source) {
  const bytes = zipStored([
    ["version.txt", new TextEncoder().encode("TuxGuitar_file_format 2.0.0")],
    ["content.xml", new TextEncoder().encode(source)],
  ]);
  return { name: "semantic-regression.tg", arrayBuffer: async () => bytes.buffer };
}
function gp(tuning = [64, 59, 55, 50, 45, 40]) {
  return {
    schemaVersion: 1, sourceVersion: "GP5",
    versionEvidence: { sourceVersion: "GP5", sourceFamily: "GUITAR_PRO_LEGACY_BINARY", extensionFamily: ".gp5", signature: "FICHIER GUITAR PRO", major: 5, versionText: "FICHIER GUITAR PRO v5.10" },
    tracks: [{ name: "Untrusted name", isPercussion: false, staves: [{ tuningMidiHighToLow: tuning, bars: [{ voices: [{ beats: [{ startTicks: 0, durationDenominator: 4, notes: [{ stringNumberLowToHigh: 1, fret: 0 }] }] }] }] }] }],
  };
}

test("missing TuxGuitar fret is rejected instead of manufacturing an open string", async () => {
  const source = tgXml.replace('<note value="3" string="6"', '<note string="6"');
  expect(source).not.toBe(tgXml);
  await expect(decodeTuxGuitarFile(tgFile(source))).rejects.toMatchObject({ code: "INVALID_TUXGUITAR_NOTE" });
});
test("MusicXML contradictory type and elapsed duration is rejected", () => {
  expect(() => parseMusicXmlTablature(xml.replace('<type>quarter</type>', '<type>half</type>'))).toThrow(/duration/i);
});
test("four-string evidence alone cannot classify or admit a GP staff as bass", () => {
  const source = gp([69, 64, 60, 67]);
  const item = buildGuitarProTrackInventory(source).items[0];
  expect(item.instrument).toBeNull();
  expect(item.supported).toBe(false);
  expect(() => normalizeVerifiedGuitarProIntermediate(source)).toThrow();
});
test("explicit TuxGuitar zero and accepted fretted control retain their facts", async () => {
  const control = normalizeVerifiedTuxGuitarIntermediate(await decodeTuxGuitarFile(tgFile(tgXml)));
  expect(control.positions[0].strings[5]).toMatchObject({ type: "fret", fret: 3 });
  const zero = normalizeVerifiedTuxGuitarIntermediate(await decodeTuxGuitarFile(tgFile(tgXml.replace('<note value="3"', '<note value="0"'))));
  expect(zero.positions[0].strings[5].type).toBe("open");
});

test.each([null, "", " ", "0x0", "1e0", "1.5", "9007199254740992"])("invalid TG numeric fret %s never becomes a note", async (value) => {
  const replacement = value === null ? "<note" : `<note value="${value}"`;
  await expect(decodeTuxGuitarFile(tgFile(tgXml.replace('<note value="3"', replacement)))).rejects.toMatchObject({ code: "INVALID_TUXGUITAR_NOTE" });
});
test("missing string, numeric duration and tuning evidence reject", async () => {
  await expect(decodeTuxGuitarFile(tgFile(tgXml.replace(' string="6"', '')))).rejects.toMatchObject({ code: "INVALID_TUXGUITAR_NOTE" });
  for (const fragment of ['<duration>4</duration>', '<fret>3</fret>', '<string>6</string>']) {
    expect(xml).toContain(fragment);
    expect(() => parseMusicXmlTablature(xml.replace(fragment, ''))).toThrow();
  }
  const source = gp();
  source.tracks[0].staves[0].tuningMidiHighToLow[0] = null;
  expect(buildGuitarProTrackInventory(source).supportedCount).toBe(0);
  expect(() => normalizeVerifiedGuitarProIntermediate(source)).toThrow();
});
test.each([["guitar", [64, 59, 55, 50, 45, 40]], ["bass", [43, 38, 33, 28]]])("exact %s profile is evidence even with an unrelated name", (instrument, tuning) => {
  expect(buildGuitarProTrackInventory(gp(tuning)).items[0]).toMatchObject({ instrument, supported: true });
  expect(normalizeVerifiedGuitarProIntermediate(gp(tuning)).instrument).toBe(instrument);
});
test("a six-string non-profile and a misleading Bass name provide insufficient identity evidence", () => {
  const source = gp([69, 64, 60, 55, 50, 45]);
  source.tracks[0].name = "Bass";
  expect(buildGuitarProTrackInventory(source).items[0]).toMatchObject({ instrument: null, supported: false });
  expect(() => normalizeVerifiedGuitarProIntermediate(source)).toThrow();
});
test("ordinary dotted durations preserve notation separately from elapsed evidence", () => {
  const dotted = xml.replace('<duration>4</duration>', '<duration>6</duration>').replace('<type>quarter</type>', '<type>quarter</type><dot/>');
  expect(parseMusicXmlTablature(dotted).positions[0].duration).toMatchObject({
    name: "dotted quarter note", quarterNoteUnits: 1.5, relationship: "ordinary",
    notated: { type: "quarter", dots: 1 }, elapsed: { durationDivisions: 6, divisionsPerQuarter: 4 },
  });
});
test("elapsed-only evidence never claims a source notated type", () => {
  expect(parseMusicXmlTablature(xml.replace('<type>quarter</type>', '')).positions[0].duration).toMatchObject({
    name: "1 quarter-note units", notated: null, relationship: "elapsed-only", quarterNoteUnits: 1,
  });
});
test("valid MusicXML tuplets remain explicitly unsupported, not silently collapsed", () => {
  const source = xml.replace('<duration>4</duration>', '<duration>2</duration>').replace('<divisions>4</divisions>', '<divisions>3</divisions>').replace('<type>quarter</type>', '<type>quarter</type><time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>');
  expect(() => parseMusicXmlTablature(source)).toThrow(/tuplet duration relationship.*not yet support/);
});
test("repeat structure becomes localized structured loss and disclosure", () => {
  const source = xml.replace('</measure>', '<barline location="right"><repeat direction="backward"/></barline></measure>');
  const document = parseMusicXmlTablature(source);
  expect(document.positions).toEqual(parseMusicXmlTablature(xml).positions);
  expect(document.semanticLosses).toEqual([expect.objectContaining({ kind: "source-order-only", element: "repeat", attributes: { direction: "backward" }, disposition: "not-expanded" })]);
  expect(document.warnings.join(" ")).toMatch(/source order; repeats are not expanded/);
});

test("unequal chord-member durations block the single-duration semantic path", () => {
  const source = xml.replace('</note>', '</note><note><chord/><duration>8</duration><type>half</type><notations><technical><string>1</string><fret>0</fret></technical></notations></note>');
  expect(() => parseMusicXmlTablature(source)).toThrow(/chord members with different duration evidence/);
});

import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "util";
import { gunzipSync } from "zlib";
import { fireEvent, render, screen, within } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import DesktopSemanticReader from "./DesktopSemanticReader";
import { describePlayablePosition } from "./positionDescription";
import { buildMusicXmlReaderDocuments, buildReaderDocuments } from "./tabImportCoordinator";
import { extractCompressedMusicXml } from "./compressedMusicXmlImporter";
import { normalizeVerifiedGuitarProIntermediate } from "./guitarProSourceNormalizer";
import { decodePowerTabPt2Bytes } from "./powerTabPt2Decoder";
import { buildPowerTabReaderDocuments } from "./powerTabReaderDocuments";
import { buildTuxGuitarReaderDocuments } from "./tuxGuitarReaderDocuments";
import { zipStored } from "./tuxGuitarStandardBassZip";

Object.assign(global, { TextDecoder, TextEncoder });

function fixture(...parts) {
  return fs.readFileSync(path.join(process.cwd(), "fixtures", ...parts));
}

function musicXmlDocument(source = fixture("real-world", "musicxml-chord-rest-two-measures.musicxml").toString()) {
  return buildMusicXmlReaderDocuments(source).semanticDocument;
}

async function powerTabDocument(version) {
  const bytes = version === 11
    ? fixture("powertab-v11", "powertab-v11-editor-export-six-position.pt2")
    : fixture("powertab-pt2-historical", `powertab-pt2-v${version}-six-position.pt2`);
  const intermediate = await decodePowerTabPt2Bytes(bytes, {
    decompress: async (input) => new Uint8Array(gunzipSync(input)),
  });
  return (await buildPowerTabReaderDocuments(null, { intermediate })).semanticDocument;
}

async function tuxGuitarDocument(code, instrument = "guitar") {
  const bytes = instrument === "bass"
    ? fixture("tuxguitar-tg-bass", `tuxguitar-${code}-standard-bass.tg`)
    : fixture("tuxguitar-tg", `tuxguitar-${code}-six-position.tg`);
  return (await buildTuxGuitarReaderDocuments({
    name: "existing-proof.tg",
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  })).semanticDocument;
}

// Project-authored adapter-boundary evidence, not a producer-exported GP binary.
function guitarProDocument(techniques) {
  return normalizeVerifiedGuitarProIntermediate({
    schemaVersion: 1,
    sourceVersion: "GP5",
    versionEvidence: {
      sourceVersion: "GP5", sourceFamily: "GUITAR_PRO_LEGACY_BINARY",
      extensionFamily: ".gp5", signature: "FICHIER GUITAR PRO",
      major: 5, versionText: "FICHIER GUITAR PRO v5.10",
    },
    tracks: [{
      name: "Technique speech proof", isPercussion: false,
      staves: [{
        tuningMidiHighToLow: [64, 59, 55, 50, 45, 40],
        bars: [{ voices: [{ beats: [{
          startTicks: 0, durationDenominator: 4,
          notes: [
            { stringNumberLowToHigh: 1, fret: 3, techniques },
            { stringNumberLowToHigh: 6, fret: 0, techniques: [] },
          ],
        }] }] }],
      }],
    }],
  });
}

function expectAttached(document, index, spokenName, stateEvidence, name) {
  const string = document.strings.find((item) => item.spokenName === spokenName);
  const state = document.positions[index].strings.find((item) => item.stringId === string.id);
  expect(state).toMatchObject({ ...stateEvidence, techniques: [expect.objectContaining({ name })] });
  const snapshot = JSON.stringify(document);
  const note = stateEvidence.type === "open" ? "open" : `fret ${stateEvidence.fret}`;
  expect(describePlayablePosition(document, index)).toContain(`${spokenName}, ${note}, with ${name}.`);
  const { unmount } = render(<DesktopSemanticReader document={document} />);
  const position = document.positions[index];
  const table = screen.getAllByRole("table")[position.blockIndex];
  const stringIndex = document.blocks[position.blockIndex].strings.findIndex((item) => item.id === string.id);
  const row = within(table).getAllByRole("row")[stringIndex + 1];
  const cell = within(row).getAllByRole("cell")[position.positionInBlock - 1];
  expect(cell).toHaveAccessibleName(`${note[0].toUpperCase()}${note.slice(1)}, with ${name}`);
  unmount();
  expect(JSON.stringify(document)).toBe(snapshot);
}

/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Verify the exact live-region content, announcement-node replacement and control order. */
function expectReaderParity(document, targetIndex) {
  const snapshot = JSON.stringify(document);
  const expected = describePlayablePosition(document, targetIndex);
  for (const Reader of [IPhoneTabReader, DesktopSemanticReader]) {
    const { container, unmount } = render(<Reader document={document} />);
    const live = container.querySelector('[aria-live="polite"]');
    const buttons = screen.getByRole("group", { name: "Position navigation" }).querySelectorAll("button");
    expect([...buttons].map((button) => button.textContent)).toEqual([
      "Previous position", "Read current position", "Next position",
    ]);
    document.warnings.forEach((warning) => {
      expect(screen.getByText(warning)).toBeInTheDocument();
    });
    for (let index = 0; index < targetIndex; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Next position" }));
      expect(live).toBeEmptyDOMElement();
    }
    expect(container.querySelector(".position-description").textContent).toBe(expected);
    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));
    expect(live.textContent).toBe(expected);
    const firstAnnouncement = live.firstChild;
    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));
    expect(live.textContent).toBe(expected);
    expect(live.childNodes).toHaveLength(1);
    expect(live.firstChild).not.toBe(firstAnnouncement);
    expect(screen.queryByRole("button", { name: /audition|play/i })).not.toBeInTheDocument();
    unmount();
  }
  expect(JSON.stringify(document)).toBe(snapshot);
}
/* eslint-enable testing-library/no-container, testing-library/no-node-access */

describe("shared attached-technique speech across existing format evidence", () => {
  const priorFormatOnly = window.GUITAR_EYES_FORMAT_ONLY;
  beforeAll(() => { window.GUITAR_EYES_FORMAT_ONLY = true; });
  afterAll(() => {
    if (priorFormatOnly === undefined) delete window.GUITAR_EYES_FORMAT_ONLY;
    else window.GUITAR_EYES_FORMAT_ONLY = priorFormatOnly;
  });

  test("ASCII keeps hammer-on and pull-off on their original target frets in both readers", () => {
    const document = buildReaderDocuments(fixture("real-world", "ascii-ghost-harmonic-repeat-techniques.txt").toString(), "guitar").semanticDocument;
    expectAttached(document, 3, "High E string", { type: "fret", fret: 7 }, "hammer-on");
    expectAttached(document, 4, "High E string", { type: "fret", fret: 5 }, "pull-off");
    expect(document.warnings.join(" ")).toMatch(/Unsupported symbols did not create musical positions/i);
    expectReaderParity(document, 3);
    expectReaderParity(document, 4);
  });

  test("MusicXML and its compressed wrapper preserve the same attached hammer-on and speech", async () => {
    const source = fixture("real-world", "musicxml-chord-rest-two-measures.musicxml").toString();
    const document = musicXmlDocument(source);
    const bytes = zipStored([
      ["META-INF/container.xml", new TextEncoder().encode('<container><rootfiles><rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>')],
      ["score.musicxml", new TextEncoder().encode(source)],
    ]);
    const extracted = await extractCompressedMusicXml(bytes.buffer);
    const compressedDocument = musicXmlDocument(extracted.sourceText);
    expect(compressedDocument).toEqual(document);
    expectAttached(document, 3, "D string", { type: "fret", fret: 2 }, "hammer-on");
    expectReaderParity(document, 3);
    expectReaderParity(compressedDocument, 3);
  });

  test.each(Array.from({ length: 11 }, (_, index) => index + 1))(
    "PowerTab PT2 version %s retains palm mute solely on its accepted open D note",
    async (version) => {
      const document = await powerTabDocument(version);
      expectAttached(document, 3, "D string", { type: "open" }, "palm mute");
      expect(document.positions.flatMap((position) => position.strings.flatMap((state) => state.techniques || []))).toEqual([
        expect.objectContaining({ name: "palm mute", source: "powertab-pt2" }),
      ]);
      if (version === 11) expectReaderParity(document, 3);
    }
  );

  test.each(["10", "11", "12", "13", "15", "20"].flatMap((code) => [[code, "guitar"], [code, "bass"]]))(
    "TuxGuitar %s %s retains palm mute solely on its accepted open D note",
    async (code, instrument) => {
      const document = await tuxGuitarDocument(code, instrument);
      expectAttached(document, 3, "D string", { type: "open" }, "palm mute");
      expect(document.positions.flatMap((position) => position.strings.flatMap((state) => state.techniques || []))).toEqual([
        expect.objectContaining({ name: "palm mute", source: "tuxguitar" }),
      ]);
      if (code === "20") expectReaderParity(document, 3);
    }
  );

  test("GP category recognition retains the unknown warning and does not leak effects to another chord member", () => {
    const names = ["hammer-on", "pull-off", "slide", "bend", "vibrato", "let ring", "palm mute", "tap", "slap", "pop", "harmonic"];
    const document = guitarProDocument([...names, "unknown effect"]);
    expect(document.positions[0].strings[5].techniques.map(({ name }) => name)).toEqual(names);
    expect(document.positions[0].strings[0].techniques).toEqual([]);
    expect(document.warnings.join(" ")).toMatch(/unsupported Guitar Pro technique unknown effect without interpreting it/);
    expect(describePlayablePosition(document, 0)).toContain("Low E string, fret 3, with hammer-on, pull-off, slide, bend, vibrato, let ring, palm mute, tap, slap, pop, and harmonic. High E string, open.");
    expectReaderParity(document, 0);
  });

  test("recognized MusicXML category parameters remain unclaimed and unknown technical losses survive both readers", () => {
    const source = fixture("real-world", "musicxml-chord-rest-two-measures.musicxml").toString();
    const decorated = source.replace('<hammer-on type="start">H</hammer-on>', '<hammer-on type="start">H</hammer-on><bend><bend-alter>2</bend-alter></bend><unknown-effect detail="preserve"/>');
    expect(decorated).not.toBe(source);
    const document = musicXmlDocument(decorated);
    expect(document.positions[3].strings[3].techniques).toEqual([
      { name: "hammer-on", source: "musicxml" }, { name: "bend", source: "musicxml" },
    ]);
    expect(document.semanticLosses).toContainEqual(expect.objectContaining({ element: "unknown-effect", disposition: "not-interpreted" }));
    expect(document.warnings.join(" ")).toMatch(/unsupported MusicXML technical element unknown-effect without interpreting it/);
    expect(describePlayablePosition(document, 3)).toContain("D string, fret 2, with hammer-on and bend.");
    expectReaderParity(document, 3);
  });

  test("both readers preserve an unknown attached item's disclosure beside a recognized item", () => {
    const document = musicXmlDocument();
    document.positions[3].strings[3].techniques.push({ name: "unknown effect", raw: "?" });
    expect(describePlayablePosition(document, 3)).toContain("D string, fret 2, with hammer-on; unknown effect notation preserved but not yet interpreted.");
    expectReaderParity(document, 3);
  });
});

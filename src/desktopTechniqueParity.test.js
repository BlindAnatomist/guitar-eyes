import fs from "fs";
import path from "path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import DesktopSemanticReader from "./DesktopSemanticReader";
import { parseTabDocumentText } from "./iphoneTabModel";
import { describePlayablePosition } from "./positionDescription";
import { buildMusicXmlReaderDocuments } from "./tabImportCoordinator";

/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Inspect native table relationships, passive cell attributes, focus and exact live-region node identity. */

function noteDocument(fret = 3) {
  return parseTabDocumentText([
    `e|--${fret}--|`, "B|-----|", "G|-----|", "D|-----|", "A|-----|", "E|-----|",
  ].join("\n"), "guitar");
}

function cellFor(document, positionIndex, stringIndex) {
  const position = document.positions[positionIndex];
  const table = screen.getAllByRole("table")[position.blockIndex];
  const row = within(table).getAllByRole("row")[stringIndex + 1];
  return within(row).getAllByRole("cell")[position.positionInBlock - 1];
}

function frozenSnapshot(document) {
  const snapshot = JSON.stringify(document);
  const freeze = (value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
  };
  freeze(document);
  return snapshot;
}

const recognizedNames = [
  "hammer-on", "pull-off", "slide", "ascending slide", "descending slide",
  "bend", "bend release", "vibrato", "let ring", "palm mute", "tap",
  "slap", "pop", "harmonic", "open-string", "fingernails", "pluck",
];

describe.each([[0, "Open", "open"], [3, "Fret 3", "fret 3"]])(
  "desktop attached-technique cells at fret %s",
  (fret, cellPrefix, spokenNote) => {
    test.each(recognizedNames)("preserves the exact category %s in the cell and explicit Read", (name) => {
      const document = noteDocument(fret);
      document.positions[0].strings[0].techniques = [{ name }];
      const snapshot = frozenSnapshot(document);
      const expectedSpeech = `Position 1 of 1. High E string, ${spokenNote}, with ${name}.`;
      const { container } = render(<DesktopSemanticReader document={document} />);

      expect(cellFor(document, 0, 0).textContent).toBe(`${cellPrefix}, with ${name}`);
      expect(describePlayablePosition(document, 0)).toBe(expectedSpeech);
      expect(container.querySelector(".position-description").textContent).toBe(expectedSpeech);
      const live = container.querySelector('[aria-live="polite"]');
      expect(live).toBeEmptyDOMElement();
      fireEvent.click(screen.getByRole("button", { name: "Read current position" }));
      expect(live.textContent).toBe(expectedSpeech);
      expect(JSON.stringify(document)).toBe(snapshot);
    });

    test.each([undefined, null, []])("keeps the original short label for absent techniques %s", (techniques) => {
      const document = noteDocument(fret);
      document.positions[0].strings[0].techniques = techniques;
      render(<DesktopSemanticReader document={document} />);
      expect(cellFor(document, 0, 0).textContent).toBe(cellPrefix);
      expect(describePlayablePosition(document, 0)).toBe(`Position 1 of 1. High E string, ${spokenNote}.`);
    });

    test.each([
      [["palm mute", "let ring", "vibrato"], "with palm mute, let ring, and vibrato"],
      [["PalmMuting"], "with PalmMuting notation preserved but not yet interpreted"],
      [["palm mute variation"], "with palm mute variation notation preserved but not yet interpreted"],
      [["unknown effect", "rasgueado"], "with unknown effect notation preserved but not yet interpreted; rasgueado notation preserved but not yet interpreted"],
      [["palm mute", "unknown effect"], "with palm mute; unknown effect notation preserved but not yet interpreted"],
      [["unknown effect", "hammer-on"], "with unknown effect notation preserved but not yet interpreted; with hammer-on"],
      [["hammer-on", "pull-off", "unknown effect", "vibrato", "palm mute"], "with hammer-on and pull-off; unknown effect notation preserved but not yet interpreted; with vibrato and palm mute"],
    ])("shares exact ordered recognized/unknown wording for %s", (names, phrase) => {
      const document = noteDocument(fret);
      document.positions[0].strings[0].techniques = names.map((name) => ({ name }));
      const snapshot = frozenSnapshot(document);
      render(<DesktopSemanticReader document={document} />);
      expect(cellFor(document, 0, 0).textContent).toBe(`${cellPrefix}, ${phrase}`);
      expect(describePlayablePosition(document, 0)).toBe(`Position 1 of 1. High E string, ${spokenNote}, ${phrase}.`);
      expect(JSON.stringify(document)).toBe(snapshot);
    });
  }
);

function multiBlockDocument() {
  const document = parseTabDocumentText([
    "Intro", "e|--0--2--|", "B|--3-----|", "G|--------|", "D|--------|", "A|--------|", "E|-----5--|",
    "Verse", "e|--7--5--|", "B|--------|", "G|--------|", "D|--------|", "A|--------|", "E|--2-----|",
  ].join("\n"), "guitar");
  document.positions[0].strings[0].techniques = [{ name: "palm mute", raw: "P.M." }];
  document.positions[0].strings[1].techniques = [{ name: "bend" }, { name: "unknown effect", raw: "?" }];
  document.positions[1].strings[5].techniques = [{ name: "vibrato" }];
  document.positions[2].strings[0].techniques = [{ name: "hammer-on" }];
  document.positions[2].strings[5].techniques = [{ name: "slide" }];
  document.warnings = ["Unknown effect parameters remain uninterpreted."];
  return document;
}

test("preserves native table context and individual chord attachments across strings and blocks", () => {
  const document = multiBlockDocument();
  const snapshot = frozenSnapshot(document);
  const { container } = render(<DesktopSemanticReader document={document} />);
  const tables = screen.getAllByRole("table");
  expect(tables).toHaveLength(2);
  tables.forEach((table, index) => {
    expect(table).toHaveAccessibleName(`Block ${index + 1}: rows are strings and columns are synchronized musical positions.`);
    expect(within(table).getAllByRole("rowheader").map((header) => header.textContent)).toEqual([
      "High E string", "B string", "G string", "D string", "A string", "Low E string",
    ]);
    within(table).getAllByRole("rowheader").forEach((header) => expect(header).toHaveAttribute("scope", "row"));
    expect(within(table).getAllByRole("columnheader").map((header) => header.textContent)).toEqual(["String", "Position 1", "Position 2"]);
    within(table).getAllByRole("columnheader").forEach((header) => expect(header).toHaveAttribute("scope", "col"));
  });
  expect(cellFor(document, 0, 0).textContent).toBe("Open, with palm mute");
  expect(cellFor(document, 0, 1).textContent).toBe("Fret 3, with bend; unknown effect notation preserved but not yet interpreted");
  expect(cellFor(document, 1, 0).textContent).toBe("Fret 2");
  expect(cellFor(document, 1, 1).textContent).toBe("Not played");
  expect(cellFor(document, 1, 5).textContent).toBe("Fret 5, with vibrato");
  expect(cellFor(document, 2, 0).textContent).toBe("Fret 7, with hammer-on");
  expect(cellFor(document, 2, 5).textContent).toBe("Fret 2, with slide");
  expect(cellFor(document, 3, 0).textContent).toBe("Fret 5");
  screen.getAllByRole("cell").forEach((cell) => {
    expect(cell).not.toHaveAttribute("tabindex");
    expect(cell).not.toHaveAttribute("aria-describedby");
    expect(cell).not.toHaveAttribute("aria-label");
    expect(cell.closest("[aria-live]")).toBeNull();
  });
  expect(screen.getByText(document.warnings[0])).toBeInTheDocument();
  expect(container.querySelectorAll("[aria-live]")).toHaveLength(1);
  expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement();
  expect(JSON.stringify(document)).toBe(snapshot);
});

test("keeps movement quiet, focus stable, modifier keys native and repeated explicit Read separate", () => {
  const document = multiBlockDocument();
  const { container, rerender } = render(<DesktopSemanticReader document={document} />);
  const live = container.querySelector('[aria-live="polite"]');
  const navigator = screen.getByRole("group", { name: "Position keyboard navigator" });
  const controls = within(screen.getByRole("group", { name: "Position navigation" })).getAllByRole("button");
  expect(controls.map((button) => button.textContent)).toEqual(["Previous position", "Read current position", "Next position"]);
  controls.forEach((button) => expect(button).not.toHaveAttribute("aria-describedby"));
  navigator.focus();
  fireEvent.keyDown(navigator, { key: "ArrowRight", ctrlKey: true, altKey: true });
  expect(cellFor(document, 0, 0)).toHaveAttribute("aria-current", "true");
  fireEvent.keyDown(navigator, { key: "ArrowRight" });
  expect(cellFor(document, 1, 5)).toHaveAttribute("aria-current", "true");
  expect(cellFor(document, 0, 0)).not.toHaveAttribute("aria-current");
  expect(navigator).toHaveFocus();
  expect(live).toBeEmptyDOMElement();
  fireEvent.click(screen.getByRole("button", { name: "Next tablature block" }));
  expect(cellFor(document, 2, 0)).toHaveAttribute("aria-current", "true");
  expect(live).toBeEmptyDOMElement();
  const read = screen.getByRole("button", { name: "Read current position" });
  read.focus();
  fireEvent.click(read);
  expect(live.textContent).toBe("Block 2 of 2. Position 1 of 2 in this block. Low E string, fret 2, with slide. High E string, fret 7, with hammer-on.");
  const firstRead = live.firstChild;
  fireEvent.click(read);
  expect(live.firstChild).not.toBe(firstRead);
  expect(live.childNodes).toHaveLength(1);
  expect(read).toHaveFocus();
  const secondRead = live.firstChild;
  fireEvent.click(screen.getByRole("button", { name: "Previous position" }));
  fireEvent.click(screen.getByRole("button", { name: "Previous tablature block" }));
  fireEvent.keyDown(navigator, { key: "End" });
  expect(live.firstChild).toBe(secondRead);
  expect(cellFor(document, 3, 0)).toHaveAttribute("aria-current", "true");
  rerender(<DesktopSemanticReader document={noteDocument(0)} />);
  expect(live).toBeEmptyDOMElement();
  expect(screen.getByRole("cell", { name: "Open" })).toHaveAttribute("aria-current", "true");
  expect(read).toHaveFocus();
});

test("does not change continuation or standalone technique cells and their explicit speech", () => {
  const document = parseTabDocumentText([
    "e|--12--x--|", "B|---3-----|", "G|---------|", "D|---------|", "A|---------|", "E|---------|",
  ].join("\n"), "guitar");
  document.positions[1].strings[0].techniques = [{ name: "palm mute" }];
  document.positions[2].strings[0].techniques = [{ name: "palm mute" }];
  const snapshot = frozenSnapshot(document);
  render(<DesktopSemanticReader document={document} />);
  expect(cellFor(document, 1, 0).textContent).toBe("Continuation of fret 12");
  expect(cellFor(document, 2, 0).textContent).toBe("Muted note");
  expect(describePlayablePosition(document, 1)).toBe("Position 2 of 3. B string, fret 3. High E string, continuation of fret 12.");
  expect(describePlayablePosition(document, 2)).toBe("Position 3 of 3. High E string, muted note notation preserved but not yet interpreted.");
  expect(JSON.stringify(document)).toBe(snapshot);
});

test("keeps MusicXML rests and normalized source rows unchanged beside a technique cell", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "fixtures", "real-world", "musicxml-chord-rest-two-measures.musicxml"), "utf8");
  const document = buildMusicXmlReaderDocuments(source).semanticDocument;
  const snapshot = frozenSnapshot(document);
  const { container } = render(<DesktopSemanticReader document={document} />);
  expect(screen.getByRole("columnheader", { name: "Measure 1, position 2, quarter note, rest" })).toHaveAttribute("scope", "col");
  document.strings.forEach((_, stringIndex) => expect(cellFor(document, 1, stringIndex).textContent).toBe("Not played"));
  expect(cellFor(document, 3, 3).textContent).toBe("Fret 2, with hammer-on");
  expect(container.querySelector("pre.source-layout").textContent).toBe(document.blocks[0].strings.map((string) => string.sourceLine).join("\n"));
  expect(describePlayablePosition(document, 1)).toBe("Measure 1 of 2. Position 2 of 4 in this measure. Duration, quarter note. Rest.");
  expect(JSON.stringify(document)).toBe(snapshot);
});

test("preserves defensive missing and unsupported cells without applying attached-note wording", () => {
  const document = noteDocument();
  document.positions[0].strings[1] = { stringId: document.strings[1].id, type: "unsupported", techniques: [{ name: "bend" }] };
  document.positions[0].strings[2] = { stringId: document.strings[2].id, type: "silent", techniques: [{ name: "palm mute" }] };
  document.positions[0].strings.splice(3, 1);
  render(<DesktopSemanticReader document={document} />);
  expect(cellFor(document, 0, 1).textContent).toBe("Unsupported notation");
  expect(cellFor(document, 0, 2).textContent).toBe("Not played");
  expect(cellFor(document, 0, 3).textContent).toBe("Not played");
  expect(describePlayablePosition(document, 0)).toBe("Position 1 of 1. High E string, fret 3.");
});

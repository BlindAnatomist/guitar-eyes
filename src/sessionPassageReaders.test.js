import fs from "fs";
import path from "path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import DesktopSemanticReader from "./DesktopSemanticReader";
import { buildMusicXmlReaderDocuments, buildReaderDocuments } from "./tabImportCoordinator";
import { describePlayablePosition } from "./positionDescription";

/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Verify exact passive descriptions, live-region node replacement, control order and focus without adding accessibility roles solely for tests. */

const block = ["e|--0--2--|", "B|--------|", "G|--------|", "D|--------|", "A|--------|", "E|--------|"];
const multi = buildReaderDocuments([...block, "Verse", ...block].join("\n")).semanticDocument;
const music = buildMusicXmlReaderDocuments(fs.readFileSync(path.join(process.cwd(), "fixtures/real-world/musicxml-chord-rest-two-measures.musicxml"), "utf8")).semanticDocument;
const originalFlag = window.GUITAR_EYES_FORMAT_ONLY;
const button = (name) => screen.getByRole("button", { name });
const click = (name) => fireEvent.click(button(name));
const live = (container) => container.querySelector('.visually-hidden[aria-live="polite"]');
const description = (container) => container.querySelector(".position-description");
function go(index) {
  click("Go to beginning");
  for (let i = 0; i < index; i += 1) click("Next position");
}

beforeEach(() => { window.GUITAR_EYES_FORMAT_ONLY = true; });
afterEach(() => {
  if (originalFlag === undefined) delete window.GUITAR_EYES_FORMAT_ONLY;
  else window.GUITAR_EYES_FORMAT_ONLY = originalFlag;
});

describe.each([["phone", IPhoneTabReader], ["desktop", DesktopSemanticReader]])("%s passage controls", (_, Reader) => {
  test("keeps the original group and adds three clear controls with a passive session limit", () => {
    const { container } = render(<Reader document={multi} />);
    expect(within(screen.getByRole("group", { name: "Position navigation" })).getAllByRole("button").map((node) => node.textContent)).toEqual(["Previous position", "Read current position", "Next position"]);
    const controls = screen.getByRole("group", { name: "Passage navigation" });
    expect(within(controls).getAllByRole("button").map((node) => node.textContent)).toEqual(["Mark current position", "Return to mark", "Go to beginning"]);
    expect(button("Return to mark")).toBeDisabled();
    expect(button("Go to beginning")).toBeEnabled();
    expect(screen.getByText("One mark for the loaded file. Loading a file again clears it.")).toBeInTheDocument();
    expect(screen.getByText("No position marked.")).not.toHaveAttribute("aria-live");
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(1);
    within(controls).getAllByRole("button").forEach((node) => {
      expect(node).not.toHaveAttribute("aria-describedby");
    });
    expect(button("Next position").compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test.each([0, 1, 2, 3])("marks canonical multiblock index %i and returns quietly without moving focus", (index) => {
    const before = JSON.stringify(multi);
    const { container } = render(<Reader document={multi} />);
    go(index);
    click("Read current position");
    button("Mark current position").focus();
    click("Mark current position");
    expect(button("Mark current position")).toHaveFocus();
    expect(live(container)).toBeEmptyDOMElement();
    expect(screen.getByText(`Marked overall position ${index + 1} of ${multi.positions.length}.`)).toBeInTheDocument();
    go(index === 0 ? multi.positions.length - 1 : 0);
    click("Read current position");
    button("Return to mark").focus();
    click("Return to mark");
    expect(button("Return to mark")).toHaveFocus();
    expect(description(container).textContent).toBe(describePlayablePosition(multi, index));
    expect(live(container)).toBeEmptyDOMElement();
    click("Read current position");
    expect(live(container).textContent).toBe(describePlayablePosition(multi, index));
    const oldSpan = live(container).firstChild;
    click("Read current position");
    expect(live(container).firstChild).not.toBe(oldSpan);
    expect(JSON.stringify(multi)).toBe(before);
  });

  test.each(music.positions.map((position, index) => [index, position.isRest ? "rest" : "notes"]))("returns to structured index %i (%s) with exact explicit speech", (index) => {
    const { container } = render(<Reader document={music} />);
    go(index);
    click("Mark current position");
    go(index === 0 ? music.positions.length - 1 : 0);
    click("Return to mark");
    expect(description(container).textContent).toBe(describePlayablePosition(music, index));
    expect(live(container)).toBeEmptyDOMElement();
    click("Read current position");
    expect(live(container).textContent).toBe(describePlayablePosition(music, index));
  });

  test("repeated mark/return/beginning is stable and a new mark replaces the only target", () => {
    const { container } = render(<Reader document={multi} />);
    for (let i = 0; i < 3; i += 1) click("Mark current position");
    go(3);
    for (let i = 0; i < 3; i += 1) click("Return to mark");
    expect(description(container).textContent).toBe(describePlayablePosition(multi, 0));
    go(2);
    click("Mark current position");
    go(3);
    click("Return to mark");
    expect(description(container).textContent).toBe(describePlayablePosition(multi, 2));
    for (let i = 0; i < 3; i += 1) {
      click("Read current position");
      button("Go to beginning").focus();
      click("Go to beginning");
      expect(button("Go to beginning")).toHaveFocus();
      expect(live(container)).toBeEmptyDOMElement();
    }
    expect(button("Return to mark")).toBeEnabled();
    click("Return to mark");
    expect(description(container).textContent).toBe(describePlayablePosition(multi, 2));
  });

  test("replacement, empty document and a restored prior object cannot revive a mark", () => {
    const { container, rerender } = render(<Reader document={multi} />);
    go(3);
    click("Mark current position");
    rerender(<Reader document={music} />);
    expect(button("Return to mark")).toBeDisabled();
    expect(description(container).textContent).toBe(describePlayablePosition(music, 0));
    click("Mark current position");
    rerender(<Reader document={null} />);
    expect(screen.queryByRole("group", { name: "Passage navigation" })).not.toBeInTheDocument();
    rerender(<Reader document={multi} />);
    expect(button("Return to mark")).toBeDisabled();
  });
});

import fs from "fs";
import path from "path";
import { fireEvent, render, screen } from "@testing-library/react";
import DesktopSemanticReader from "./DesktopSemanticReader";
import { parseTabDocumentText } from "./iphoneTabModel";
import {
  buildMusicXmlReaderDocuments,
  buildReaderDocuments,
} from "./tabImportCoordinator";

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name),
    "utf8"
  );
}

const measureDocument = buildReaderDocuments(
  [
    "Rhythm: Q Q H Q Q H",
    "e|--0--2--3--|--5--3--2--|",
    "B|-----------|-----------|",
    "G|-----------|-----------|",
    "D|-----------|-----------|",
    "A|-----------|-----------|",
    "E|-----------|-----------|",
  ].join("\n"),
  "guitar"
).semanticDocument;

const multiBlockDocument = parseTabDocumentText(
  [
    "Intro",
    "e|--0--2--|",
    "B|---------|",
    "G|---------|",
    "D|---------|",
    "A|---------|",
    "E|---------|",
    "Verse",
    "e|--3--5--|",
    "B|---------|",
    "G|---------|",
    "D|---------|",
    "A|---------|",
    "E|---------|",
  ].join("\n"),
  "guitar"
);

const musicXmlDocument = buildMusicXmlReaderDocuments(
  fixture("musicxml-chord-rest-two-measures.musicxml")
).semanticDocument;

describe("DesktopSemanticReader", () => {
  test("uses the accepted actionable description without speaking ordinary unplayed strings", () => {
    const { container } = render(<DesktopSemanticReader document={measureDocument} />);
    const description = container.querySelector(".position-description");

    expect(description).toHaveTextContent("Duration, quarter note");
    expect(description).toHaveTextContent("High E string, open");
    expect(description).not.toHaveTextContent(/silent/i);
    expect(description).not.toHaveTextContent(/not played/i);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Tablature block 1 semantic table" })
    ).toBeInTheDocument();
  });

  test("moves quietly and reserves complete speech for Read current position", () => {
    const { container } = render(<DesktopSemanticReader document={measureDocument} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Position 2 of 3 in this measure. Duration, quarter note. High E string, fret 2."
    );
    expect(liveRegion).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    expect(liveRegion).toHaveTextContent("Duration, quarter note");
    expect(liveRegion).toHaveTextContent("High E string, fret 2");
    expect(liveRegion).not.toHaveTextContent(/silent/i);
  });

  test("keeps the accepted Previous, Read current, Next order", () => {
    render(<DesktopSemanticReader document={measureDocument} />);
    const group = screen.getByRole("group", { name: "Position navigation" });
    const buttons = [...group.querySelectorAll("button")];

    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous position",
      "Read current position",
      "Next position",
    ]);
    buttons.forEach((button) => {
      expect(button).not.toHaveAttribute("aria-describedby");
    });
  });

  test("does not intercept VoiceOver modifier commands or speak from the navigator", () => {
    const { container } = render(<DesktopSemanticReader document={measureDocument} />);
    const navigator = screen.getByRole("group", { name: "Position keyboard navigator" });
    const description = container.querySelector(".position-description");
    const liveRegion = container.querySelector('[aria-live="polite"]');

    fireEvent.keyDown(navigator, {
      key: "ArrowRight",
      ctrlKey: true,
      altKey: true,
    });
    expect(description).toHaveTextContent("Position 1 of 3 in this measure");
    expect(liveRegion).toBeEmptyDOMElement();

    fireEvent.keyDown(navigator, { key: "ArrowRight" });
    expect(description).toHaveTextContent("Position 2 of 3 in this measure");
    expect(liveRegion).toBeEmptyDOMElement();

    fireEvent.keyDown(navigator, { key: "Enter" });
    expect(liveRegion).toBeEmptyDOMElement();
  });

  test("jumps between blocks quietly and preserves the original spatial rows on demand", () => {
    const { container } = render(<DesktopSemanticReader document={multiBlockDocument} />);
    const nextBlock = screen.getByRole("button", { name: "Next tablature block" });
    const liveRegion = container.querySelector('[aria-live="polite"]');

    expect(screen.getAllByText("Original spatial source layout")).toHaveLength(2);
    expect(container.querySelectorAll("pre.source-layout")[0]).toHaveTextContent(
      "e|--0--2--|"
    );

    fireEvent.click(nextBlock);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Block 2 of 2. Position 1 of 2 in this block. High E string, fret 3."
    );
    expect(liveRegion).toBeEmptyDOMElement();
    expect(screen.getByRole("button", { name: "Previous tablature block" })).toBeEnabled();
    expect(nextBlock).toBeDisabled();
  });

  test("labels normalized MusicXML rows honestly and marks rest columns", () => {
    const { container } = render(<DesktopSemanticReader document={musicXmlDocument} />);

    expect(screen.getByText("Normalized MusicXML spatial layout")).toBeInTheDocument();
    expect(container.querySelector("pre.source-layout")).toHaveTextContent(/^E4\|/);
    expect(
      screen.getByRole("columnheader", {
        name: "Measure 1, position 2, quarter note, rest",
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Duration, quarter note. Rest."
    );
    expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement();
  });
});

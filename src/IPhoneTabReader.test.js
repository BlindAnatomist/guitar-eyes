import { fireEvent, render, screen } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText, parseTabDocumentText } from "./iphoneTabModel";

const blockLines = [
  "e|--0---3--|",
  "B|---------|",
  "G|---------|",
  "D|---------|",
  "A|---------|",
  "E|---------|",
];

const document = parseSixStringTabText(blockLines.join("\n"));
const multiBlockDocument = parseTabDocumentText(
  ["Intro", ...blockLines, "Verse", ...blockLines].join("\n"),
  "guitar"
);

describe("IPhoneTabReader", () => {
  test("centers the current-position action between quiet navigation controls", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    const read = screen.getByRole("button", { name: "Read current position" });
    const previous = screen.getByRole("button", { name: "Previous position" });
    const next = screen.getByRole("button", { name: "Next position" });
    const description = container.querySelector(".position-description");

    expect(read).toBeEnabled();
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(read).not.toHaveAttribute("aria-describedby");
    expect(previous).not.toHaveAttribute("aria-describedby");
    expect(next).not.toHaveAttribute("aria-describedby");
    expect(
      screen.queryByRole("button", { name: "Next tablature block" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Current position" })).toBeInTheDocument();
    expect(description).toHaveTextContent("Position 1 of 2. High E string, open.");
    expect(
      previous.compareDocumentPosition(read) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      read.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      next.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test("moves predictably without speaking the musical description automatically", () => {
    const { container } = render(<IPhoneTabReader document={document} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Position 2 of 2. High E string, fret 3."
    );
    expect(liveRegion).toBeEmptyDOMElement();
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();
  });

  test("reads the current semantic description only through the dedicated control", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent("Position 1 of 2. High E string, open.");
  });

  test("jumps between blocks quietly and keeps block controls independent of the description", () => {
    const { container } = render(<IPhoneTabReader document={multiBlockDocument} />);

    const previousBlock = screen.getByRole("button", {
      name: "Previous tablature block",
    });
    const nextBlock = screen.getByRole("button", { name: "Next tablature block" });
    const liveRegion = container.querySelector('[aria-live="polite"]');

    expect(previousBlock).toBeDisabled();
    expect(nextBlock).toBeEnabled();
    expect(previousBlock).not.toHaveAttribute("aria-describedby");
    expect(nextBlock).not.toHaveAttribute("aria-describedby");

    fireEvent.click(nextBlock);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Block 2 of 2. Position 1 of 2 in this block."
    );
    expect(screen.getByText(/Overall position 3 of 4/)).toBeInTheDocument();
    expect(liveRegion).toBeEmptyDOMElement();
    expect(previousBlock).toBeEnabled();
    expect(nextBlock).toBeDisabled();
  });
});

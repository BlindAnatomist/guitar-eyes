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
  test("exposes the three position controls for one block", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("button", { name: "Previous position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next position" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Read current position" })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Next tablature block" })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Position 1 of 2\. High E string, open\./)).toBeInTheDocument();
  });

  test("moves predictably between synchronized positions", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Position 2 of 2. High E string, fret 3."
    );
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();
  });

  test("reads the current semantic description through a restrained live region", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent("Position 1 of 2. High E string, open.");
  });

  test("jumps between semantic tablature blocks without changing reader modes", () => {
    const { container } = render(<IPhoneTabReader document={multiBlockDocument} />);

    const previousBlock = screen.getByRole("button", {
      name: "Previous tablature block",
    });
    const nextBlock = screen.getByRole("button", { name: "Next tablature block" });

    expect(previousBlock).toBeDisabled();
    expect(nextBlock).toBeEnabled();

    fireEvent.click(nextBlock);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Block 2 of 2. Position 1 of 2 in this block."
    );
    expect(screen.getByText(/Overall position 3 of 4/)).toBeInTheDocument();
    expect(previousBlock).toBeEnabled();
    expect(nextBlock).toBeDisabled();
  });
});

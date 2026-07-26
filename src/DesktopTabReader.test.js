import { fireEvent, render, screen } from "@testing-library/react";
import DesktopTabReader from "./DesktopTabReader";
import { parseSixStringTabText } from "./tablatureModel";

const document = parseSixStringTabText(
  [
    "e|--0---3--|",
    "B|---------|",
    "G|---------|",
    "D|---------|",
    "A|---------|",
    "E|---------|",
  ].join("\n")
);

const multiBlockDocument = parseSixStringTabText(
  [
    "e|--0--|",
    "B|-----|",
    "G|-----|",
    "D|-----|",
    "A|-----|",
    "E|-----|",
    "",
    "e|--3--|",
    "B|-----|",
    "G|-----|",
    "D|-----|",
    "A|-----|",
    "E|-----|",
  ].join("\n")
);

describe("DesktopTabReader", () => {
  test("renders a semantic table rather than focusable source-character cells", () => {
    const { container } = render(<DesktopTabReader document={document} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Tablature block 1 table" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /High E string, open/i })).toBeInTheDocument();
    expect(container.querySelectorAll("td[tabindex]")).toHaveLength(0);
    expect(screen.queryByLabelText("Multi-Column Navigation")).not.toBeInTheDocument();
  });

  test("uses the same Previous, Read current, Next controls as the iPhone reader", () => {
    render(<DesktopTabReader document={document} />);
    const positionGroup = screen.getByRole("group", { name: "Position navigation" });
    const buttons = [...positionGroup.querySelectorAll("button")];

    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous position",
      "Read current position",
      "Next position",
    ]);
    expect(positionGroup).not.toHaveAttribute("aria-describedby");
  });

  test("moves with location-only announcements", () => {
    const { container } = render(<DesktopTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 1, position 2 of 2. High E string, fret 3."
    );
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1, position 2 of 2. Overall position 2 of 2."
    );
    expect(liveRegion).not.toHaveTextContent(/string|fret|open/i);
  });

  test("supports plain-key position navigation without stealing VoiceOver modifier commands", () => {
    const { container } = render(<DesktopTabReader document={document} />);
    const navigator = screen.getByRole("group", { name: "Position keyboard navigator" });
    const description = container.querySelector(".position-description");

    expect(navigator).toHaveAttribute("aria-describedby", "desktop-keyboard-help");

    fireEvent.keyDown(navigator, { key: "ArrowRight", ctrlKey: true, altKey: true });
    expect(description).toHaveTextContent("position 1 of 2");

    fireEvent.keyDown(navigator, { key: "ArrowRight" });
    expect(description).toHaveTextContent("position 2 of 2");

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1, position 2 of 2. Overall position 2 of 2."
    );
    expect(liveRegion).not.toHaveTextContent(/string|fret|open/i);

    fireEvent.keyDown(navigator, { key: "Home" });
    expect(description).toHaveTextContent("position 1 of 2");
  });

  test("moves between blocks with location-only announcements", () => {
    const { container } = render(<DesktopTabReader document={multiBlockDocument} />);
    const blockGroup = screen.getByRole("group", { name: "Tablature block navigation" });
    const nextBlock = screen.getByRole("button", { name: "Next tablature block" });

    expect(blockGroup).not.toHaveAttribute("aria-describedby");
    fireEvent.click(nextBlock);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Tablature block 2 of 2. Measure 1, position 1 of 1. High E string, fret 3."
    );
    expect(screen.getByRole("button", { name: "Previous tablature block" })).toBeEnabled();
    expect(nextBlock).toBeDisabled();

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Tablature block 2 of 2. Measure 1, position 1 of 1. Overall position 2 of 2."
    );
    expect(liveRegion).not.toHaveTextContent(/string|fret|open/i);
  });

  test("reserves full playing instructions for Read current position", () => {
    const { container } = render(<DesktopTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1, position 1 of 2. High E string, open."
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
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

describe("IPhoneTabReader", () => {
  test("exposes the shared controls in Previous, Read current, Next order", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    const positionGroup = screen.getByRole("group", { name: "Position navigation" });
    const buttons = [...positionGroup.querySelectorAll("button")];
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous position",
      "Read current position",
      "Next position",
    ]);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[2]).toBeEnabled();
    expect(positionGroup).not.toHaveAttribute("aria-describedby");
    expect(screen.getByText(/Measure 1, position 1 of 2\. High E string, open\./)).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Tablature block navigation"]')).not.toBeInTheDocument();
  });

  test("moves between positions with location-only announcements", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 1, position 2 of 2. High E string, fret 3."
    );
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1, position 2 of 2. Overall position 2 of 2."
    );
    expect(liveRegion).not.toHaveTextContent(/string|fret|open/i);
  });

  test("moves between complete blocks with location-only announcements", () => {
    const { container } = render(<IPhoneTabReader document={multiBlockDocument} />);
    const blockGroup = screen.getByRole("group", { name: "Tablature block navigation" });
    const buttons = [...blockGroup.querySelectorAll("button")];

    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous tablature block",
      "Next tablature block",
    ]);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeEnabled();
    expect(blockGroup).not.toHaveAttribute("aria-describedby");

    fireEvent.click(buttons[1]);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Tablature block 2 of 2. Measure 1, position 1 of 1. High E string, fret 3."
    );
    expect(screen.getByText("Overall position 2 of 2")).toBeInTheDocument();
    expect(buttons[0]).toBeEnabled();
    expect(buttons[1]).toBeDisabled();

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Tablature block 2 of 2. Measure 1, position 1 of 1. Overall position 2 of 2."
    );
    expect(liveRegion).not.toHaveTextContent(/string|fret|open/i);
  });

  test("reserves full playing instructions for Read current position", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1, position 1 of 2. High E string, open."
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText } from "./iphoneTabModel";

const document = parseSixStringTabText(
  [
    "e|--0---|--3---|",
    "B|------|------|",
    "G|------|------|",
    "D|------|------|",
    "A|------|------|",
    "E|------|------|",
  ].join("\n")
);

const chordDocument = parseSixStringTabText(
  [
    "e|------|",
    "B|------|",
    "G|--5---|",
    "D|--5---|",
    "A|--5---|",
    "E|--3---|",
  ].join("\n")
);

describe("IPhoneTabReader", () => {
  test("separates the current instruction from navigation controls", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("heading", { name: "Current step" })).toBeInTheDocument();
    expect(screen.getByText("Measure 1 of 2. Step 1 of 1.")).toBeInTheDocument();
    expect(screen.getByText("One note. Play High E string, open.")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: "Next step" });
    expect(nextButton).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("group", { name: "Move one musical step" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Jump to a measure beginning" })).toBeInTheDocument();
  });

  test("moves focus to the new current step instead of repeating the old instruction on the button", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next step" }));

    expect(screen.getByRole("heading", { name: "Current step" })).toHaveFocus();
    expect(container.querySelector(".position-location")).toHaveTextContent(
      "Measure 2 of 2. Step 1 of 1."
    );
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "One note. Play High E string, fret 3."
    );
  });

  test("states explicitly when several strings are played together", () => {
    render(<IPhoneTabReader document={chordDocument} />);

    expect(
      screen.getByText(
        "Play these 4 strings together: Low E string, fret 3; A string, fret 5; D string, fret 5; G string, fret 5."
      )
    ).toBeInTheDocument();
  });

  test("jumps to measure beginnings and focuses the resulting current step", () => {
    render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next measure beginning" }));

    expect(screen.getByRole("heading", { name: "Current step" })).toHaveFocus();
    expect(screen.getByText("Measure 2 of 2. Step 1 of 1.")).toBeInTheDocument();
  });

  test("repeats only the current location and playing instruction on request", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Repeat current step" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1 of 2. Step 1 of 1. One note. Play High E string, open."
    );
    expect(liveRegion).not.toHaveTextContent(/silent/i);
  });
});

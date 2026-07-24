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

describe("IPhoneTabReader", () => {
  test("separates location, playing instruction, step controls, and measure controls", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("heading", { name: "Current step" })).toBeInTheDocument();
    expect(screen.getByText("Measure 1 of 2. Step 1 of 1.")).toBeInTheDocument();
    expect(screen.getByText("Play High E string, open.")).toBeInTheDocument();

    expect(screen.getByRole("group", { name: "Move one step" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next step" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Repeat current step" })).toBeEnabled();

    expect(screen.getByRole("group", { name: "Jump by measure" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous measure start" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next measure start" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Beginning of tablature" })).toBeDisabled();
  });

  test("moves one musical step and announces only location plus what to play", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next step" }));

    expect(container.querySelector(".position-location")).toHaveTextContent(
      "Measure 2 of 2. Step 1 of 1."
    );
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Play High E string, fret 3."
    );
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Measure 2 of 2. Step 1 of 1. Play High E string, fret 3."
    );
  });

  test("jumps explicitly to measure starts and returns to the beginning", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next measure start" }));
    expect(container.querySelector(".position-location")).toHaveTextContent("Measure 2 of 2");

    fireEvent.click(screen.getByRole("button", { name: "Beginning of tablature" }));
    expect(container.querySelector(".position-location")).toHaveTextContent("Measure 1 of 2");
  });

  test("repeats the current step without adding silent-string inventory", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Repeat current step" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1 of 2. Step 1 of 1. Play High E string, open."
    );
    expect(liveRegion).not.toHaveTextContent(/silent/i);
  });
});

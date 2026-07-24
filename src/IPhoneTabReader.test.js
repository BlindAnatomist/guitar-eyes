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
  test("presents one instruction and one simple navigation group", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("heading", { name: "What to play now" })).toBeInTheDocument();
    expect(screen.getByText("Play High E string, open.")).toBeInTheDocument();
    expect(screen.getByText("Measure 1 of 2, step 1 of 1.")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Move through the tablature" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Repeat instruction" })).toBeEnabled();
    expect(screen.queryByText(/measure beginning/i)).not.toBeInTheDocument();
  });

  test("moves to the next complete musical instruction and focuses it", () => {
    render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("heading", { name: "What to play now" })).toHaveFocus();
    expect(screen.getByText("Play High E string, fret 3.")).toBeInTheDocument();
    expect(screen.getByText("Measure 2 of 2, step 1 of 1.")).toBeInTheDocument();
  });

  test("states clearly when strings are played together", () => {
    render(<IPhoneTabReader document={chordDocument} />);

    expect(
      screen.getByText(
        "Play together: Low E string, fret 3; A string, fret 5; D string, fret 5; G string, fret 5."
      )
    ).toBeInTheDocument();
  });

  test("repeats only the current instruction and location on request", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Repeat instruction" }));

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Play High E string, open. Measure 1 of 2, step 1 of 1."
    );
  });
});

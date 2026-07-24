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
  test("exposes position and measure navigation controls", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("button", { name: "Start of tablature" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous measure" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next position" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next measure" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Read current position" })).toBeEnabled();
    expect(screen.getByText(/Measure 1 of 2, position 1 of 1\. High E string, open\./)).toBeInTheDocument();
  });

  test("moves predictably between synchronized positions", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 2 of 2, position 1 of 1. High E string, fret 3."
    );
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();
  });

  test("jumps by measure and returns to the beginning", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next measure" }));
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 2 of 2"
    );
    expect(screen.getByRole("button", { name: "Next measure" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Start of tablature" }));
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 1 of 2"
    );
  });

  test("reads the current semantic description through a restrained live region", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1 of 2, position 1 of 1. High E string, open."
    );
  });
});

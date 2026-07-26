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

describe("IPhoneTabReader", () => {
  test("exposes the shared controls in Previous, Read current, Next order", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    const buttons = [...container.querySelectorAll(".position-controls button")];
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous position",
      "Read current position",
      "Next position",
    ]);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[2]).toBeEnabled();
    expect(screen.getByText(/Measure 1, position 1 of 2\. High E string, open\./)).toBeInTheDocument();
  });

  test("moves predictably between synchronized positions", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 1, position 2 of 2. High E string, fret 3."
    );
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();
  });

  test("reads the current semantic description through a restrained live region", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent(
      "Measure 1, position 1 of 2. High E string, open."
    );
  });
});

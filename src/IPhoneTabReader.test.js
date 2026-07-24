import { act, fireEvent, render, screen } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText } from "./iphoneTabModel";

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
  afterEach(() => {
    jest.useRealTimers();
  });

  test("exposes the three bounded iPhone controls", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("button", { name: "Previous position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next position" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Read current position" })).toBeEnabled();
    expect(screen.getByText(/Position 1 of 2\. High E string, open\./)).toBeInTheDocument();
  });

  test("moves predictably between synchronized positions", () => {
    render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(screen.getByText(/Position 2 of 2\. High E string, fret 3\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();
  });

  test("reads the current semantic description through a restrained live region", () => {
    jest.useFakeTimers();
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));
    act(() => {
      jest.advanceTimersByTime(30);
    });

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent("Position 1 of 2. High E string, open.");
  });
});

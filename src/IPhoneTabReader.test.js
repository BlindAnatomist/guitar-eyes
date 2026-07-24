import React, { createRef } from "react";
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
  test("exposes the three bounded iPhone controls", () => {
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("button", { name: "Previous position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next position" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Read current position" })).toBeEnabled();
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

  test("retries focus on the reader heading after a document loads", () => {
    jest.useFakeTimers();
    const headingRef = createRef();

    render(<IPhoneTabReader document={document} ref={headingRef} />);
    const focusSpy = jest.spyOn(headingRef.current, "focus");

    act(() => {
      jest.runAllTimers();
    });

    expect(focusSpy).toHaveBeenCalledTimes(3);
    expect(document.activeElement).toBe(headingRef.current);

    focusSpy.mockRestore();
    jest.useRealTimers();
  });
});

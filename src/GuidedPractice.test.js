import { fireEvent, render, screen } from "@testing-library/react";
import GuidedPractice from "./GuidedPractice";
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

describe("GuidedPractice", () => {
  test("starts with a single explicit entry action", () => {
    render(<GuidedPractice document={document} />);
    expect(screen.getByRole("button", { name: "Begin guided practice" })).toBeEnabled();
    expect(screen.queryByRole("group", { name: "Practice controls" })).not.toBeInTheDocument();
  });

  test("advances after the player confirms the current instruction", () => {
    render(<GuidedPractice document={document} />);
    fireEvent.click(screen.getByRole("button", { name: "Begin guided practice" }));
    expect(screen.getByText("0 of 2 instructions completed.")).toBeInTheDocument();
    expect(screen.getByText("Play High E string, open.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Played it — next instruction" }));
    expect(screen.getByRole("heading", { name: "Practice instruction" })).toHaveFocus();
    expect(screen.getByText("1 of 2 instructions completed.")).toBeInTheDocument();
    expect(screen.getByText("Play High E string, fret 3.")).toBeInTheDocument();
  });

  test("finishes only after the final instruction is confirmed", () => {
    render(<GuidedPractice document={document} />);
    fireEvent.click(screen.getByRole("button", { name: "Begin guided practice" }));
    fireEvent.click(screen.getByRole("button", { name: "Played it — next instruction" }));
    fireEvent.click(screen.getByRole("button", { name: "Played it — finish practice" }));

    expect(screen.getByRole("heading", { name: "Practice complete" })).toHaveFocus();
    expect(screen.getByText("You completed all 2 instructions.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Practice again from the beginning" })).toBeEnabled();
  });
});

import { render, screen } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText } from "./iphoneTabModel";

const document = parseSixStringTabText(
  [
    "e|--0--|",
    "B|-----|",
    "G|-----|",
    "D|-----|",
    "A|-----|",
    "E|-----|",
  ].join("\n")
);

describe("format-only reader surface", () => {
  const originalFormatOnly = window.GUITAR_EYES_FORMAT_ONLY;

  afterEach(() => {
    if (originalFormatOnly === undefined) {
      delete window.GUITAR_EYES_FORMAT_ONLY;
    } else {
      window.GUITAR_EYES_FORMAT_ONLY = originalFormatOnly;
    }
  });

  test("keeps semantic navigation while omitting every playback control and label", () => {
    window.GUITAR_EYES_FORMAT_ONLY = true;
    render(<IPhoneTabReader document={document} />);

    expect(screen.getByRole("group", { name: "Position navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Read current position" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();

    expect(screen.queryByLabelText("Sound delay")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Audition current position" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Position audio" })).not.toBeInTheDocument();
    expect(screen.queryByText(/guitar sound begins/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/first audition focus repair proof/i)).not.toBeInTheDocument();
  });
});
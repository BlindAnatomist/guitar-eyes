import { fireEvent, render, screen } from "@testing-library/react";
import Upload from "./Upload";

describe("Upload", () => {
  test("keeps the picker unrestricted and its adjacent help out of the control name", () => {
    render(<Upload onFileUpload={jest.fn()} />);

    const input = screen.getByLabelText("Upload tablature file:");
    const help = screen.getByText(/checks the selected file after selection/i);

    expect(input).toHaveAttribute("type", "file");
    expect(input).not.toHaveAttribute("accept");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(
      input.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getAllByText(/checks the selected file after selection/i)).toHaveLength(1);
  });

  test("passes the selected file to the existing application validation path", () => {
    const onFileUpload = jest.fn();
    render(<Upload onFileUpload={onFileUpload} />);

    const file = new File(["<score-partwise />"], "test.musicxml", {
      type: "application/xml",
    });

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [file] },
    });

    expect(onFileUpload).toHaveBeenCalledTimes(1);
    expect(onFileUpload).toHaveBeenCalledWith(file);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import Upload from "./Upload";

describe("Upload", () => {
  test("does not apply an accept filter that can dim MusicXML in the iPhone Files picker", () => {
    render(<Upload onFileUpload={jest.fn()} />);

    const input = screen.getByLabelText("Upload tablature file:");

    expect(input).toHaveAttribute("type", "file");
    expect(input).not.toHaveAttribute("accept");
    expect(input).toHaveAttribute("aria-describedby", "file-upload-help");
    expect(
      screen.getByText(/checks the selected file after selection/i)
    ).toBeInTheDocument();
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

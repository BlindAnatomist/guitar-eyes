import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("Guitar Eyes application shell", () => {
  test("preserves the desktop reader and exposes the iPhone mode", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Guitar Eyes for Mac - The Guitar Tablature reader/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("radio", { name: "Desktop grid reader" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "iPhone semantic reader" })).not.toBeChecked();
    expect(screen.getByLabelText("Upload .txt file:")).toBeInTheDocument();
    expect(screen.getByLabelText("Choose Instrument:")).toBeInTheDocument();
    expect(screen.getByLabelText("Multi-Column Navigation")).toBeInTheDocument();
  });

  test("allows the reader mode to change without removing desktop controls", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("radio", { name: "iPhone semantic reader" }));

    expect(screen.getByRole("radio", { name: "iPhone semantic reader" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Desktop grid reader" })).not.toBeChecked();
    expect(screen.getByLabelText("Upload .txt file:")).toBeInTheDocument();
  });
});

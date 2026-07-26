import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

function makeRhythmMeasureFile() {
  return new File(
    [
      "Rhythm: Q Q H Q Q H\n",
      "e|--0--2--3--|--5--3--2--|\n",
      "B|-----------|-----------|\n",
      "G|-----------|-----------|\n",
      "D|-----------|-----------|\n",
      "A|-----------|-----------|\n",
      "E|-----------|-----------|\n",
    ],
    "convergence-rhythm-measures.txt",
    { type: "text/plain" }
  );
}

describe("desktop and iPhone convergence from the accepted semantic core", () => {
  test("loads the accepted rhythm and measure document into the desktop semantic reader", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [makeRhythmMeasureFile()] },
    });

    const desktopHeading = await screen.findByRole("heading", {
      level: 2,
      name: "Desktop tablature reader",
    });
    const desktopReader = desktopHeading.closest("section");

    expect(screen.getByText(/desktop semantic reader mode/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Multi-Column Navigation")).not.toBeInTheDocument();
    expect(within(desktopReader).getByText(/Duration, quarter note/)).toBeInTheDocument();
    expect(within(desktopReader).getAllByText(/Measure 1 of 2/).length).toBeGreaterThan(0);
    expect(
      within(desktopReader).getByRole("region", {
        name: "Tablature block 1 semantic table",
      })
    ).toBeInTheDocument();
    expect(within(desktopReader).getByText("Original spatial source layout")).toBeInTheDocument();
  });

  test("switches interfaces without replacing the parsed music or weakening iPhone speech", async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
      target: { files: [makeRhythmMeasureFile()] },
    });

    await screen.findByRole("heading", {
      level: 2,
      name: "Desktop tablature reader",
    });

    fireEvent.click(screen.getByRole("radio", { name: "iPhone semantic reader" }));

    const iphoneHeading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });
    const iphoneReader = iphoneHeading.closest("section");
    const positionGroup = within(iphoneReader).getByRole("group", {
      name: "Position navigation",
    });
    const buttons = [...positionGroup.querySelectorAll("button")];

    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous position",
      "Read current position",
      "Next position",
    ]);
    expect(within(iphoneReader).getByText(/Duration, quarter note/)).toBeInTheDocument();
    expect(within(iphoneReader).getByText(/High E string, open/)).toBeInTheDocument();
    expect(within(iphoneReader).queryByText(/silent/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Desktop tablature reader" })
    ).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import DataGrid from "./DataGrid";

const data = [
  "e|--0--|",
  "B|-----|",
  "G|-----|",
  "D|-----|",
  "A|-----|",
  "E|-----|",
];

describe("DataGrid compatibility fallback", () => {
  test("keeps raw cells out of the ordinary Tab sequence", () => {
    render(
      <DataGrid
        data={data}
        numColumns={1}
        isMultiColumnNav={false}
        setNumColumns={jest.fn()}
        selectedInstrument="guitar"
      />
    );

    const grid = screen.getByRole("grid", { name: "Legacy tablature grid" });
    const cells = screen.getAllByRole("gridcell");

    expect(grid).toHaveAttribute("tabindex", "0");
    cells.forEach((cell) => expect(cell).toHaveAttribute("tabindex", "-1"));
  });

  test("leaves Control+Option arrows available to VoiceOver", () => {
    render(
      <DataGrid
        data={data}
        numColumns={1}
        isMultiColumnNav={false}
        setNumColumns={jest.fn()}
        selectedInstrument="guitar"
      />
    );

    const grid = screen.getByRole("grid", { name: "Legacy tablature grid" });
    grid.focus();

    fireEvent.keyDown(grid, {
      key: "ArrowRight",
      ctrlKey: true,
      altKey: true,
    });

    expect(document.activeElement).toBe(grid);
  });

  test("uses plain arrows for optional keyboard movement inside the focused grid", () => {
    render(
      <DataGrid
        data={data}
        numColumns={1}
        isMultiColumnNav={false}
        setNumColumns={jest.fn()}
        selectedInstrument="guitar"
      />
    );

    const grid = screen.getByRole("grid", { name: "Legacy tablature grid" });
    const cells = screen.getAllByRole("gridcell");
    grid.focus();

    fireEvent.keyDown(grid, { key: "ArrowRight" });

    expect(document.activeElement).toBe(cells[1]);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import DesktopTabReader from "./DesktopTabReader";
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

describe("DesktopTabReader", () => {
  test("renders a semantic table rather than focusable source-character cells", () => {
    const { container } = render(<DesktopTabReader document={document} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /High E string, open/i })).toBeInTheDocument();
    expect(container.querySelectorAll("td[tabindex]")).toHaveLength(0);
    expect(screen.queryByLabelText("Multi-Column Navigation")).not.toBeInTheDocument();
  });

  test("uses the same Previous, Read current, Next controls as the iPhone reader", () => {
    const { container } = render(<DesktopTabReader document={document} />);
    const buttons = [...container.querySelectorAll(".position-controls button")];

    expect(buttons.map((button) => button.textContent)).toEqual([
      "Previous position",
      "Read current position",
      "Next position",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 1, position 2 of 2. High E string, fret 3."
    );
  });

  test("supports plain-key position navigation without stealing VoiceOver modifier commands", () => {
    const { container } = render(<DesktopTabReader document={document} />);
    const navigator = screen.getByRole("group", { name: "Position keyboard navigator" });
    const description = container.querySelector(".position-description");

    fireEvent.keyDown(navigator, { key: "ArrowRight", ctrlKey: true, altKey: true });
    expect(description).toHaveTextContent("position 1 of 2");

    fireEvent.keyDown(navigator, { key: "ArrowRight" });
    expect(description).toHaveTextContent("position 2 of 2");

    fireEvent.keyDown(navigator, { key: "Home" });
    expect(description).toHaveTextContent("position 1 of 2");
  });
});

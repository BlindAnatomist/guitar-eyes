import { render, screen } from "@testing-library/react";
import InfoSection from "./InfoSection";

describe("bounded format support help", () => {
  test("includes PowerTab and TuxGuitar among the supported profiles", () => {
    render(<InfoSection />);
    expect(screen.getByText(/Welcome to Guitar Eyes for Mac\./)).toHaveTextContent(
      "Guitar Pro, PowerTab, and TuxGuitar profiles"
    );
    expect(screen.getByRole("heading", { name: "PowerTab profiles" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "TuxGuitar profiles" })).toBeVisible();
  });

  test("keeps the PT2 historical guitar and version-11 bass limits explicit", () => {
    render(<InfoSection />);
    const help = screen.getByText(/PowerTab \.pt2 supports/);
    expect(help).toHaveTextContent("internal versions 1 through 11");
    expect(help).toHaveTextContent("six-string guitar profiles");
    expect(help).toHaveTextContent("G2, D2, A1, E1");
    expect(help).toHaveTextContent("supported only for internal version 11");
    expect(help).toHaveTextContent("Internal versions 1 through 10 do not support bass");
  });

  test("names every legacy PTB version and its exact standard-bass boundary", () => {
    render(<InfoSection />);
    const help = screen.getByText(/Legacy PowerTab \.ptb supports/);
    ["1 (PowerTab 1.0)", "2 (PowerTab 1.0.2)", "3 (PowerTab 1.5)", "4 (PowerTab 1.7)"].forEach(
      (version) => expect(help).toHaveTextContent(`file version ${version}`)
    );
    expect(help).toHaveTextContent("bounded six-string guitar and exact standard four-string bass profiles");
    expect(help).toHaveTextContent("G2, D2, A1, E1 from highest to lowest");
  });

  test("separates TuxGuitar native generations from producer version and deferred generations", () => {
    render(<InfoSection />);
    const help = screen.getByText(/TuxGuitar \.tg supports/);
    expect(help).toHaveTextContent("1.0, 1.1, 1.2, 1.3, and 1.5");
    expect(help).toHaveTextContent("modern native file format 2.0.0");
    expect(help).toHaveTextContent("TuxGuitar 2.1.0 producer evidence");
    expect(help).toHaveTextContent("bounded six-string guitar and exact standard four-string bass profiles");
    expect(help).toHaveTextContent("G2, D2, A1, E1 from highest to lowest");
    expect(help).toHaveTextContent("Native 0.7, 0.8, and 0.9 remain unsupported");
    expect(help).toHaveTextContent("no native 1.4 route is inferred");
  });

  test("bounds Guitar Pro acceptance without promoting the GP8-style project proofs", () => {
    render(<InfoSection />);
    const help = screen.getByText(/Guitar Pro support is bounded/);
    expect(help).toHaveTextContent("GP3, GP4, GP5, GP6 GPX, and GP7 shared .gp corpus and profiles");
    expect(help).toHaveTextContent("require internal version evidence");
    expect(help).toHaveTextContent("GP8-style project proofs do not establish general GP8 compatibility");
  });

  test("distinguishes unsupported structures and recognized filenames from whole supported families", () => {
    render(<InfoSection />);
    const help = screen.getByText(/When an ASCII text file cannot/);
    expect(help).toHaveTextContent("Guitar Pro 2 .gtp, TablEdit .tef, and unsupported structures within Guitar Pro, PowerTab, or TuxGuitar");
    expect(help).toHaveTextContent("Recognition by filename does not establish reading support");
    expect(help).toHaveTextContent("alternate or extended bass tunings");
    expect(help).not.toHaveTextContent("PowerTab, TuxGuitar, and TablEdit produce explicit messages");
  });
});

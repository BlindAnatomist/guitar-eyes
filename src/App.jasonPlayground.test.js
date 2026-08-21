import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

const originalMatchMedia = window.matchMedia;
const originalFormatOnly = window.GUITAR_EYES_FORMAT_ONLY;

function useTouchDevice() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: jest.fn().mockReturnValue({
      matches: true,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

beforeEach(() => {
  useTouchDevice();
  window.GUITAR_EYES_FORMAT_ONLY = true;
  window.history.replaceState({}, "", "/?demo=jason");
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  }
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
  if (originalMatchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  } else {
    delete window.matchMedia;
  }
  if (originalFormatOnly === undefined) {
    delete window.GUITAR_EYES_FORMAT_ONLY;
  } else {
    window.GUITAR_EYES_FORMAT_ONLY = originalFormatOnly;
  }
});

describe("one-link Jason playground", () => {
  test("opens the built-in cadence with one action and focuses the iPhone reader", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Jason's Guitar Eyes playground",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "iPhone tablature reader" })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Start the Guitar Eyes demo" })
    );

    const iphoneHeading = await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });
    const reader = iphoneHeading.closest("section");

    await waitFor(() => expect(document.activeElement).toBe(iphoneHeading));
    expect(
      screen.getByText(
        /Loaded the built-in original chord passage with 7 synchronized positions in iPhone reading mode/i
      )
    ).toBeInTheDocument();
    expect(within(reader).getAllByText(/Measure 1 of 2/)).toHaveLength(2);
    expect(within(reader).getByText(/Duration, quarter note/)).toBeInTheDocument();
    expect(within(reader).getByText(/High E string, open/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /audition current position/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Start the Guitar Eyes demo" })
    ).not.toBeInTheDocument();
  });

  test("keeps the same parsed passage when switching to Jason's spatial desktop reader", async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Start the Guitar Eyes demo" })
    );
    await screen.findByRole("heading", {
      level: 2,
      name: "iPhone tablature reader",
    });

    fireEvent.click(screen.getByRole("radio", { name: "Desktop grid reader" }));

    const desktopHeading = await screen.findByRole("heading", {
      level: 2,
      name: "Desktop tablature reader",
    });
    const reader = desktopHeading.closest("section");

    await waitFor(() => expect(document.activeElement).toBe(desktopHeading));
    expect(within(reader).getAllByText(/Measure 1 of 2/)).toHaveLength(2);
    expect(
      within(reader).getByRole("region", {
        name: "Tablature block 1 semantic table",
      })
    ).toBeInTheDocument();
    expect(within(reader).getByText("Original spatial source layout")).toBeInTheDocument();
  });

  test("does not expose the playground on an ordinary application URL", () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "Start the Guitar Eyes demo" })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Upload tablature file:")).toBeInTheDocument();
  });
});

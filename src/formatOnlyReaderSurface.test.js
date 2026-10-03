import { fireEvent, render, screen, within } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText } from "./iphoneTabModel";
import { describePlayablePosition } from "./positionDescription";
import { buildPositionSoundEvents } from "./positionSoundEvents";
import { createPositionAuditioner } from "./proceduralPluckedString";
import { installFirstAuditionFocusGuard } from "./firstAuditionFocusGuard";

/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Verify quiet movement, repeated Read node identity, and absent historical labels. */

jest.mock("./positionSoundEvents", () => ({ buildPositionSoundEvents: jest.fn() }));
jest.mock("./proceduralPluckedString", () => ({ createPositionAuditioner: jest.fn() }));
jest.mock("./firstAuditionFocusGuard", () => ({ installFirstAuditionFocusGuard: jest.fn() }));

const document = parseSixStringTabText(
  [
    "e|--0--2--|",
    "B|--------|",
    "G|--------|",
    "D|--------|",
    "A|--------|",
    "E|--------|",
  ].join("\n")
);

describe("format-only reader surface", () => {
  const originalFormatOnly = window.GUITAR_EYES_FORMAT_ONLY;

  afterEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByRole("button", { name: "Next position" })).toBeEnabled();

    expect(screen.queryByLabelText("Sound delay")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Audition current position" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Position audio" })).not.toBeInTheDocument();
    expect(screen.queryByText(/guitar sound begins/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/first audition focus repair proof/i)).not.toBeInTheDocument();
  });
});

const closedConfigurations = [
  ["absent", undefined, true],
  ["undefined", undefined],
  ["null", null],
  ["true", true],
  ["string true", "true"],
  ["string false", "false"],
  ["empty string", ""],
  ["zero", 0],
  ["one", 1],
  ["NaN", NaN],
  ["boxed false", Object(false)],
  ["empty array", []],
  ["false array", [false]],
  ["empty object", {}],
  ["false-coercing object", { valueOf: () => false }],
];

describe("default-closed format-only configuration", () => {
  const originalFlag = Object.getOwnPropertyDescriptor(window, "GUITAR_EYES_FORMAT_ONLY");
  afterEach(() => {
    jest.clearAllMocks();
    if (originalFlag) Object.defineProperty(window, "GUITAR_EYES_FORMAT_ONLY", originalFlag);
    else delete window.GUITAR_EYES_FORMAT_ONLY;
  });

  test.each(closedConfigurations.map(([name, value, absent = false]) => [name, value, absent]))("%s keeps navigation and passage actions quiet without invoking audio", (_, value, absent) => {
    if (absent) delete window.GUITAR_EYES_FORMAT_ONLY;
    else window.GUITAR_EYES_FORMAT_ONLY = value;
    const before = JSON.stringify(document);
    const { container, unmount } = render(<IPhoneTabReader document={document} />);
    const button = (name) => screen.getByRole("button", { name });
    const live = container.querySelector('.visually-hidden[aria-live="polite"]');
    expect(within(screen.getByRole("group", { name: "Position navigation" })).getAllByRole("button").map((node) => node.textContent)).toEqual(["Previous position", "Read current position", "Next position"]);
    expect(screen.queryByLabelText("Sound delay")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Audition current position" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Position audio" })).not.toBeInTheDocument();
    expect(container.querySelector(".audible-proof-label, .audition-status, .audition-delay-control")).toBeNull();
    expect(screen.queryByText(/guitar sound begins/i)).not.toBeInTheDocument();

    button("Next position").focus();
    fireEvent.click(button("Next position"));
    expect(button("Next position")).toHaveFocus();
    expect(live).toBeEmptyDOMElement();
    fireEvent.click(button("Mark current position"));
    fireEvent.click(button("Go to beginning"));
    button("Return to mark").focus();
    fireEvent.click(button("Return to mark"));
    expect(button("Return to mark")).toHaveFocus();
    expect(live).toBeEmptyDOMElement();
    fireEvent.click(button("Read current position"));
    expect(live.textContent).toBe(describePlayablePosition(document, 1));
    const firstRead = live.firstChild;
    fireEvent.click(button("Read current position"));
    expect(live.textContent).toBe(describePlayablePosition(document, 1));
    expect(live.firstChild).not.toBe(firstRead);
    fireEvent.click(button("Previous position"));
    expect(live).toBeEmptyDOMElement();
    expect(JSON.stringify(document)).toBe(before);
    unmount();
    expect(buildPositionSoundEvents).not.toHaveBeenCalled();
    expect(createPositionAuditioner).not.toHaveBeenCalled();
    expect(installFirstAuditionFocusGuard).not.toHaveBeenCalled();
  });

  test("explicit boolean false preserves the historical opt-in surface without starting sound", () => {
    window.GUITAR_EYES_FORMAT_ONLY = false;
    render(<IPhoneTabReader document={document} />);
    expect(screen.getByRole("group", { name: "Position audio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Audition current position" })).toBeEnabled();
    expect(screen.getByLabelText("Sound delay")).toHaveValue("2");
    expect(createPositionAuditioner).not.toHaveBeenCalled();
  });
});

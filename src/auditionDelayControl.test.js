import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText } from "./iphoneTabModel";
import { buildPositionSoundEvents } from "./positionSoundEvents";
import { createPositionAuditioner } from "./proceduralPluckedString";

jest.mock("./positionSoundEvents", () => ({
  buildPositionSoundEvents: jest.fn(),
}));

jest.mock("./proceduralPluckedString", () => ({
  createPositionAuditioner: jest.fn(),
}));

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

function soundEvents() {
  return {
    type: "position-sound-events",
    isRest: false,
    durationMilliseconds: 500,
    events: [
      {
        type: "pitched-string",
        stringId: "block-1-string-1",
        midi: 64,
        frequencyHz: 329.627,
      },
    ],
  };
}

describe("audition VoiceOver-clearance control", () => {
  let auditioner;

  beforeEach(() => {
    auditioner = {
      audition: jest.fn().mockResolvedValue({
        outcome: "auditioned",
        pitchedEventCount: 1,
        mutedEventCount: 0,
        activeVoiceCount: 1,
        contextState: "running",
      }),
      stop: jest.fn(),
      dispose: jest.fn().mockResolvedValue(undefined),
      state: jest.fn(),
    };
    buildPositionSoundEvents.mockReturnValue(soundEvents());
    createPositionAuditioner.mockReturnValue(auditioner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("keeps the selector name concise and the explanation as one separate reading item", () => {
    render(<IPhoneTabReader document={document} />);

    const delay = screen.getByLabelText("Sound delay");
    const help = screen.getByText(/VoiceOver to finish repeating the button name/i);

    expect(delay).toHaveValue("2");
    expect(delay).not.toHaveAttribute("aria-describedby");
    expect(delay).toHaveAccessibleName("Sound delay");
    expect(help).toBeInTheDocument();
    expect(
      delay.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test("defaults to two seconds and applies a changed delay to the next audition", async () => {
    const { container } = render(<IPhoneTabReader document={document} />);
    const delay = screen.getByLabelText("Sound delay");

    expect(delay).toHaveValue("2");

    fireEvent.change(delay, { target: { value: "4" } });
    expect(delay).toHaveValue("4");

    const audition = screen.getByRole("button", {
      name: "Audition current position",
    });
    audition.focus();
    fireEvent.click(audition);

    await waitFor(() => expect(auditioner.audition).toHaveBeenCalledTimes(1));
    expect(createPositionAuditioner).toHaveBeenCalledWith({
      startDelaySeconds: 4,
    });
    expect(global.document.activeElement).toBe(audition);
    expect(
      container.querySelector('.visually-hidden[aria-live="polite"]')
    ).toBeEmptyDOMElement();
  });

  test("changing the delay disposes the prior auditioner before reuse", async () => {
    render(<IPhoneTabReader document={document} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Audition current position" })
    );
    await waitFor(() => expect(auditioner.audition).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Sound delay"), {
      target: { value: "3" },
    });

    expect(auditioner.dispose).toHaveBeenCalledTimes(1);
    expect(createPositionAuditioner).toHaveBeenCalledTimes(1);
  });
});

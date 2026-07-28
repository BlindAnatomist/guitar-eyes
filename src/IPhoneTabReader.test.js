import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import IPhoneTabReader, {
  resolveReaderPositionIndex,
} from "./IPhoneTabReader";
import { parseSixStringTabText, parseTabDocumentText } from "./iphoneTabModel";
import { buildPositionSoundEvents } from "./positionSoundEvents";
import { createPositionAuditioner } from "./proceduralPluckedString";
import { buildReaderDocuments } from "./tabImportCoordinator";

jest.mock("./positionSoundEvents", () => ({
  buildPositionSoundEvents: jest.fn(),
}));

jest.mock("./proceduralPluckedString", () => ({
  createPositionAuditioner: jest.fn(),
}));

const blockLines = [
  "e|--0---3--|",
  "B|---------|",
  "G|---------|",
  "D|---------|",
  "A|---------|",
  "E|---------|",
];

const document = parseSixStringTabText(blockLines.join("\n"));
const multiBlockDocument = parseTabDocumentText(
  ["Intro", ...blockLines, "Verse", ...blockLines].join("\n"),
  "guitar"
);
const measureDocument = buildReaderDocuments(
  [
    "Rhythm: Q Q H Q Q H",
    "e|--0--2--3--|--5--3--2--|",
    "B|-----------|-----------|",
    "G|-----------|-----------|",
    "D|-----------|-----------|",
    "A|-----------|-----------|",
    "E|-----------|-----------|",
  ].join("\n"),
  "guitar"
).semanticDocument;

function soundEvents({ rest = false } = {}) {
  return {
    type: "position-sound-events",
    isRest: rest,
    durationMilliseconds: 500,
    events: rest
      ? []
      : [
          {
            type: "pitched-string",
            stringId: "block-1-string-1",
            midi: 64,
            frequencyHz: 329.627,
          },
        ],
  };
}

function liveRegion(container) {
  return container.querySelector('.visually-hidden[aria-live="polite"]');
}

describe("IPhoneTabReader", () => {
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

  test("keeps read and audition actions between quiet navigation controls", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    const read = screen.getByRole("button", { name: "Read current position" });
    const audition = screen.getByRole("button", {
      name: "Audition current position",
    });
    const previous = screen.getByRole("button", { name: "Previous position" });
    const next = screen.getByRole("button", { name: "Next position" });
    const status = container.querySelector(".audition-status");
    const description = container.querySelector(".position-description");

    expect(read).toBeEnabled();
    expect(audition).toBeEnabled();
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(read).not.toHaveAttribute("aria-describedby");
    expect(audition).not.toHaveAttribute("aria-describedby");
    expect(previous).not.toHaveAttribute("aria-describedby");
    expect(next).not.toHaveAttribute("aria-describedby");
    expect(status).not.toHaveAttribute("role");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next tablature block" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Current position" })).toBeInTheDocument();
    expect(description).toHaveTextContent("Position 1 of 2. High E string, open.");
    expect(
      previous.compareDocumentPosition(read) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      read.compareDocumentPosition(audition) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      audition.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      next.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      status.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test("resolves a newly loaded document to position one before reset effects settle", () => {
    expect(resolveReaderPositionIndex(measureDocument, document, 1)).toBe(0);
    expect(resolveReaderPositionIndex(document, document, 1)).toBe(1);
    expect(resolveReaderPositionIndex(document, document, 99)).toBe(1);
  });

  test("moves predictably without speaking the musical description automatically", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Position 2 of 2. High E string, fret 3."
    );
    expect(liveRegion(container)).toBeEmptyDOMElement();
    expect(screen.getByRole("button", { name: "Next position" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous position" })).toBeEnabled();
  });

  test("reads the current semantic description only through the dedicated control", () => {
    const { container } = render(<IPhoneTabReader document={document} />);

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));

    expect(liveRegion(container)).toHaveTextContent(
      "Position 1 of 2. High E string, open."
    );
  });

  test("auditions the current position without moving focus or creating competing speech", async () => {
    const { container } = render(<IPhoneTabReader document={measureDocument} />);
    const audition = screen.getByRole("button", {
      name: "Audition current position",
    });
    audition.focus();

    fireEvent.click(audition);

    await waitFor(() =>
      expect(container.querySelector(".audition-status")).toHaveTextContent(
        "Auditioned current position with 1 pitched string."
      )
    );
    expect(buildPositionSoundEvents).toHaveBeenCalledWith(measureDocument, 0);
    expect(createPositionAuditioner).toHaveBeenCalledTimes(1);
    expect(global.document.activeElement).toBe(audition);
    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 1 of 2. Position 1 of 3 in this measure."
    );
    expect(liveRegion(container)).toBeEmptyDOMElement();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("announces a rest because no guitar sound competes with the message", async () => {
    buildPositionSoundEvents.mockReturnValue(soundEvents({ rest: true }));
    auditioner.audition.mockResolvedValue({
      outcome: "rest",
      pitchedEventCount: 0,
      mutedEventCount: 0,
      activeVoiceCount: 0,
      contextState: "uninitialized",
    });
    const restDocument = {
      ...measureDocument,
      positions: [
        {
          ...measureDocument.positions[0],
          isRest: true,
        },
      ],
    };
    const { container } = render(<IPhoneTabReader document={restDocument} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Audition current position" })
    );

    await waitFor(() =>
      expect(liveRegion(container)).toHaveTextContent(
        "Current position is a rest. No pitched sound was played."
      )
    );
    expect(container.querySelector(".audition-status")).toHaveTextContent(
      "Current position is a rest. No pitched sound was played."
    );
  });

  test("stops the prior audition quietly when moving to another position", async () => {
    const { container } = render(<IPhoneTabReader document={measureDocument} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Audition current position" })
    );
    await waitFor(() => expect(auditioner.audition).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Next position" }));

    expect(auditioner.stop).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".audition-status")).toBeEmptyDOMElement();
    expect(screen.getByText(/Overall position 2 of 6/)).toBeInTheDocument();
    expect(liveRegion(container)).toBeEmptyDOMElement();
  });

  test("renders explicit measure context and moves across the shared barline quietly", () => {
    const { container } = render(<IPhoneTabReader document={measureDocument} />);
    const next = screen.getByRole("button", { name: "Next position" });

    expect(container.querySelector(".position-count")).toHaveTextContent(
      "Measure 1 of 2. Position 1 of 3 in this measure. Overall position 1 of 6."
    );

    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Measure 2 of 2. Position 1 of 3 in this measure. Duration, quarter note. High E string, fret 5."
    );
    expect(liveRegion(container)).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: "Read current position" }));
    expect(liveRegion(container)).toHaveTextContent("Measure 2 of 2.");
  });

  test("jumps between blocks quietly and keeps block controls independent of the description", () => {
    const { container } = render(<IPhoneTabReader document={multiBlockDocument} />);

    const previousBlock = screen.getByRole("button", {
      name: "Previous tablature block",
    });
    const nextBlock = screen.getByRole("button", { name: "Next tablature block" });

    expect(previousBlock).toBeDisabled();
    expect(nextBlock).toBeEnabled();
    expect(previousBlock).not.toHaveAttribute("aria-describedby");
    expect(nextBlock).not.toHaveAttribute("aria-describedby");

    fireEvent.click(nextBlock);

    expect(container.querySelector(".position-description")).toHaveTextContent(
      "Block 2 of 2. Position 1 of 2 in this block."
    );
    expect(screen.getByText(/Overall position 3 of 4/)).toBeInTheDocument();
    expect(liveRegion(container)).toBeEmptyDOMElement();
    expect(previousBlock).toBeEnabled();
    expect(nextBlock).toBeDisabled();
  });
});

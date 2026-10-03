import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import { readTextFile } from "./iphoneTabModel";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";
import { TEACHER_EXAMPLE_XML } from "./teacherExample";
import { buildReaderDocuments } from "./tabImportCoordinator";

jest.mock("./iphoneTabModel", () => ({ ...jest.requireActual("./iphoneTabModel"), readTextFile: jest.fn() }));
jest.mock("./structuredTabReaderDocuments", () => ({ buildStructuredTabReaderDocuments: jest.fn() }));
/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Inspect passive descriptions, existing live regions and exact focus/order without inventing accessibility roles. */

const originalMedia = window.matchMedia;
const originalFlag = window.GUITAR_EYES_FORMAT_ONLY;
const button = (name) => screen.getByRole("button", { name });
const click = (name) => fireEvent.click(button(name));
const changedEnding = "Inspect changed ending: measure 3, position 4";
const recurrence = "Inspect recurrence: measure 2";
const source = "e|--0--2--3--|\nB|-----------|\nG|-----------|\nD|-----------|\nA|-----------|\nE|-----------|";
function start(mode) {
  window.matchMedia = jest.fn().mockReturnValue({ matches: mode === "phone", addListener() {}, removeListener() {} });
  return render(<App />);
}
function settleFocus() { fireEvent.focus(window); act(() => { jest.runAllTimers(); }); }
function loadExample() { click("Load original teacher example"); settleFocus(); }
function selectFile(name = "example.musicxml", files) {
  fireEvent.change(screen.getByLabelText("Upload tablature file:"), { target: { files: files || [new File(["x"], name)] } });
}
async function upload(text, name) {
  readTextFile.mockResolvedValueOnce(text); selectFile(name);
  await act(async () => { await Promise.resolve(); }); settleFocus();
}
function description(container) { return container.querySelector(".position-description"); }
function liveRegion(container) { return container.querySelector('.visually-hidden[aria-live]'); }

beforeEach(() => {
  jest.useFakeTimers();
  window.GUITAR_EYES_FORMAT_ONLY = true;
  readTextFile.mockReset(); buildStructuredTabReaderDocuments.mockReset();
});
afterEach(() => {
  jest.clearAllTimers(); jest.useRealTimers(); jest.restoreAllMocks();
  window.matchMedia = originalMedia;
  if (originalFlag === undefined) delete window.GUITAR_EYES_FORMAT_ONLY;
  else window.GUITAR_EYES_FORMAT_ONLY = originalFlag;
});

describe.each(["phone", "desktop"])("%s teacher interaction", (mode) => {
  test("lesson explains relationships and rehearsal, then evidence returns to its exact control", () => {
    const { container } = start(mode); loadExample();
    click("Open pattern lesson");
    expect(screen.getByRole("heading", { name: "Pattern and changed ending" })).toHaveFocus();
    expect(screen.getByText(/Measures 1 and 2 have the same imported/)).toBeInTheDocument();
    expect(screen.getByText(/Measure 3 shares the first 3 positions/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Suggested rehearsal order" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /played it|audition|playback/i })).not.toBeInTheDocument();
    click(changedEnding);
    expect(button("Read current position")).toHaveFocus();
    expect(description(container)).toHaveTextContent("Measure 3 of 3. Position 4 of 4");
    expect(description(container)).toHaveTextContent("High E string, fret 5.");
    expect(liveRegion(container)).toBeEmptyDOMElement();
    click("Read current position");
    expect(liveRegion(container)).toHaveTextContent(description(container).textContent);
    click("Return to pattern lesson");
    expect(button(changedEnding)).toHaveFocus();
    expect(liveRegion(container)).toBeEmptyDOMElement();
    click(recurrence);
    expect(description(container)).toHaveTextContent("Measure 2 of 3. Position 1 of 4");
    expect(description(container)).toHaveTextContent("B string, fret 1. High E string, open.");
    click("Return to pattern lesson");
    expect(button(recurrence)).toHaveFocus();
    click("Close pattern lesson");
    expect(button("Open pattern lesson")).toHaveFocus();
    expect(screen.queryByRole("heading", { name: "Suggested rehearsal order" })).not.toBeInTheDocument();
  });

  test("inspection keeps the existing reader order, quiet navigation and independent session mark", () => {
    const { container } = start(mode); loadExample();
    click("Next position"); click("Mark current position");
    const marked = description(container).textContent;
    click("Open pattern lesson"); click(changedEnding);
    expect(within(screen.getByRole("group", { name: "Position navigation" })).getAllByRole("button").map((node) => node.textContent)).toEqual(["Previous position", "Read current position", "Next position"]);
    click("Return to mark"); expect(description(container)).toHaveTextContent(marked);
    click("Go to beginning"); click("Next position");
    expect(liveRegion(container)).toBeEmptyDOMElement();
    click("Return to pattern lesson"); expect(button(changedEnding)).toHaveFocus();
    click(changedEnding); click("Mark current position");
    click("Go to beginning"); click("Return to mark");
    expect(description(container)).toHaveTextContent("Measure 3 of 3. Position 4 of 4");
  });

  test("repeated open, inspect, return and close never grades or writes storage", () => {
    const storage = jest.spyOn(Storage.prototype, "setItem");
    const { container } = start(mode); loadExample();
    for (let i = 0; i < 3; i += 1) {
      click("Open pattern lesson"); click(changedEnding); click("Return to pattern lesson"); click("Close pattern lesson");
    }
    expect(storage).not.toHaveBeenCalled();
    expect(liveRegion(container)).toBeEmptyDOMElement();
    expect(screen.queryByText(/mastered|completed lesson|score:|correctly played/i)).not.toBeInTheDocument();
  });

  test.each(["lesson", "inspect"])("picker cancellation preserves %s orientation and mark", (view) => {
    const { container } = start(mode); loadExample(); click("Mark current position"); click("Open pattern lesson");
    if (view === "inspect") click(changedEnding);
    const text = description(container).textContent;
    selectFile("", []);
    expect(button("Return to mark")).toBeEnabled();
    expect(description(container)).toHaveTextContent(text);
    expect(button(view === "inspect" ? "Return to pattern lesson" : changedEnding)).toBeInTheDocument();
    expect(readTextFile).not.toHaveBeenCalled();
  });

  test("mode changes discard inspection references, preserve source eligibility and existing mark", () => {
    const { container } = start(mode); loadExample(); click("Open pattern lesson"); click(changedEnding); click("Mark current position");
    fireEvent.click(screen.getByRole("radio", { name: mode === "phone" ? "Desktop grid reader" : "iPhone semantic reader" })); settleFocus();
    expect(screen.queryByRole("button", { name: "Return to pattern lesson" })).not.toBeInTheDocument();
    expect(button("Open pattern lesson")).toBeInTheDocument();
    expect(description(container)).toHaveTextContent("Measure 1 of 3. Position 1 of 4");
    click("Return to mark"); expect(description(container)).toHaveTextContent("Measure 3 of 3. Position 4 of 4");
    click("Open pattern lesson"); expect(button(changedEnding)).toBeInTheDocument();
  });

  test("a successful different import invalidates the lesson and offers an honest limitation", async () => {
    start(mode); loadExample(); click("Open pattern lesson"); click(changedEnding);
    await upload(source, "practice.tab"); click("Open pattern lesson");
    expect(screen.getByText(/Teaching is available only for the reviewed original example/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: changedEnding })).not.toBeInTheDocument();
    expect(button("Return to mark")).toBeDisabled();
  });

  test("exact example uploads are eligible; whitespace or added notation is not proof", async () => {
    start(mode); await upload(TEACHER_EXAMPLE_XML);
    click("Open pattern lesson"); expect(button(changedEnding)).toBeInTheDocument();
    await upload(TEACHER_EXAMPLE_XML + "\n");
    click("Open pattern lesson"); expect(screen.getByText(/Teaching is available only/)).toBeInTheDocument();
  });

  test("failed import removes stale lesson and preserves existing error focus recovery", async () => {
    start(mode); loadExample(); click("Open pattern lesson"); click(changedEnding);
    await upload("invalid", "broken.musicxml");
    expect(screen.queryByRole("button", { name: "Return to pattern lesson" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tablature could not be loaded" })).toHaveFocus();
    loadExample(); expect(button("Open pattern lesson")).toBeInTheDocument();
    expect(button("Return to mark")).toBeDisabled();
  });

  test("structured track selection cannot inherit teaching eligibility", async () => {
    const items = [0, 1].map((index) => ({ id: `track-${index}`, trackIndex: index, staffIndex: 0, supported: true, selectionLabel: `Guitar ${index + 1}` }));
    buildStructuredTabReaderDocuments.mockResolvedValueOnce({ requiresTrackSelection: true, sourceFormatLabel: "Guitar Pro 5 tablature", selectionIntermediate: {}, trackInventory: { supportedCount: 2, supportedItems: items, items } })
      .mockResolvedValueOnce(buildReaderDocuments(source));
    start(mode); loadExample(); click("Open pattern lesson"); click(changedEnding);
    selectFile("tracks.gp5"); await act(async () => { await Promise.resolve(); }); settleFocus();
    expect(screen.queryByRole("button", { name: "Return to pattern lesson" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Guitar 2" })); click("Load selected track");
    await act(async () => { await Promise.resolve(); }); settleFocus(); click("Open pattern lesson");
    expect(screen.getByText(/Teaching is available only/)).toBeInTheDocument();
  });
});

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";
import { readTextFile } from "./iphoneTabModel";
import { buildReaderDocuments } from "./tabImportCoordinator";
import { describePlayablePosition } from "./positionDescription";

jest.mock("./structuredTabReaderDocuments", () => ({ buildStructuredTabReaderDocuments: jest.fn() }));
jest.mock("./iphoneTabModel", () => ({ ...jest.requireActual("./iphoneTabModel"), readTextFile: jest.fn() }));

/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Verify exact passive descriptions, live-region node replacement, control order and focus without adding accessibility roles solely for tests. */

const source = "e|--0--2--3--|\nB|-----------|\nG|-----------|\nD|-----------|\nA|-----------|\nE|-----------|";
const originalMedia = window.matchMedia;
const originalFlag = window.GUITAR_EYES_FORMAT_ONLY;
const modes = { phone: "iPhone semantic reader", desktop: "Desktop grid reader" };
const button = (name) => screen.getByRole("button", { name });
const click = (name) => fireEvent.click(button(name));
const description = (container) => container.querySelector(".position-description");
function start(mode) {
  window.matchMedia = jest.fn().mockReturnValue({ matches: mode === "phone", addListener() {}, removeListener() {} });
  return render(<App />);
}
function selectFile(name = "practice.tab", files) {
  fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
    target: { files: files || [new File(["x"], name)] },
  });
}
async function uploadText(text = source, name) {
  readTextFile.mockResolvedValueOnce(text);
  selectFile(name);
  await act(async () => { await Promise.resolve(); });
}
function settleFocus() {
  fireEvent.focus(window);
  act(() => { jest.runAllTimers(); });
}
function markLast() {
  click("Next position"); click("Next position"); click("Mark current position");
  expect(button("Return to mark")).toBeEnabled();
}
function changeMode(mode) {
  fireEvent.click(screen.getByRole("radio", { name: modes[mode] }));
  settleFocus();
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function inventory() {
  const items = [0, 1].map((index) => ({ id: `track-${index}`, trackIndex: index, staffIndex: 0, supported: true, selectionLabel: `Guitar ${index + 1}` }));
  return { requiresTrackSelection: true, sourceFormatLabel: "Guitar Pro 5 tablature", selectionIntermediate: {}, trackInventory: { supportedCount: 2, supportedItems: items, items } };
}
async function choose(index) {
  fireEvent.click(screen.getByRole("radio", { name: `Guitar ${index + 1}` }));
  click("Load selected track");
  await act(async () => { await Promise.resolve(); });
  settleFocus();
}

beforeEach(() => {
  jest.useFakeTimers();
  window.GUITAR_EYES_FORMAT_ONLY = true;
  readTextFile.mockReset();
  buildStructuredTabReaderDocuments.mockReset();
});
afterEach(() => {
  jest.clearAllTimers(); jest.useRealTimers(); jest.restoreAllMocks();
  window.matchMedia = originalMedia;
  if (originalFlag === undefined) delete window.GUITAR_EYES_FORMAT_ONLY;
  else window.GUITAR_EYES_FORMAT_ONLY = originalFlag;
});

describe.each(["phone", "desktop"])("%s session lifecycle", (mode) => {
  test("same-document mode changes share the mark while cursors still reset", async () => {
    const { container } = start(mode);
    await uploadText(); settleFocus(); markLast();
    const last = description(container).textContent;
    const alternate = mode === "phone" ? "desktop" : "phone";
    changeMode(alternate);
    expect(description(container).textContent).toBe(describePlayablePosition(buildReaderDocuments(source).semanticDocument, 0));
    expect(button("Return to mark")).toBeEnabled();
    click("Return to mark");
    expect(description(container).textContent).toBe(last);
    click("Previous position"); click("Mark current position");
    const replaced = description(container).textContent;
    changeMode(mode); click("Return to mark");
    expect(description(container).textContent).toBe(replaced);
    expect(container.querySelector('.visually-hidden[aria-live]')).toBeEmptyDOMElement();
  });

  test.each(["practice.tab", "new-file.tab"])("accepted upload %s clears the previous mark", async (name) => {
    const { container } = start(mode);
    await uploadText(); settleFocus(); markLast();
    await uploadText(source, name); settleFocus();
    expect(button("Return to mark")).toBeDisabled();
    expect(description(container).textContent).toBe(describePlayablePosition(buildReaderDocuments(source).semanticDocument, 0));
    expect(screen.getByRole("heading", { name: mode === "phone" ? "iPhone tablature reader" : "Desktop tablature reader" })).toHaveFocus();
  });

  test("a cancelled picker leaves the current document and mark intact", async () => {
    const { container } = start(mode);
    await uploadText(); settleFocus(); markLast();
    const last = description(container).textContent;
    selectFile("", []);
    expect(button("Return to mark")).toBeEnabled();
    click("Go to beginning"); click("Return to mark");
    expect(description(container).textContent).toBe(last);
    expect(readTextFile).toHaveBeenCalledTimes(1);
  });

  test.each(["empty", "read-error"])("a selected rejected file (%s) clears the mark without changing error recovery", async (kind) => {
    start(mode); await uploadText(); settleFocus(); markLast();
    if (kind === "empty") await uploadText("", "invalid.tab");
    else {
      readTextFile.mockRejectedValueOnce(new Error("The selected file could not be read."));
      selectFile("invalid.tab");
      await act(async () => { await Promise.resolve(); });
    }
    settleFocus();
    expect(screen.queryByRole("button", { name: "Return to mark" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tablature could not be loaded" })).toHaveFocus();
    await uploadText(); settleFocus();
    expect(button("Return to mark")).toBeDisabled();
  });

  test("legacy raw-grid fallback never receives a semantic mark", async () => {
    start(mode); await uploadText(); settleFocus(); markLast();
    await uploadText("e|--3--|\nB|-----|", "raw.tab"); settleFocus();
    expect(screen.queryByRole("button", { name: "Return to mark" })).not.toBeInTheDocument();
    changeMode(mode === "phone" ? "desktop" : "phone");
    expect(screen.queryByRole("group", { name: "Passage navigation" })).not.toBeInTheDocument();
    await uploadText(); settleFocus();
    expect(button("Return to mark")).toBeDisabled();
  });

  test("reimport and explicit different-track selection clear the former track mark", async () => {
    const first = buildReaderDocuments(source);
    const second = buildReaderDocuments(source.replace("--0--2--3--", "--5--7--9--"));
    buildStructuredTabReaderDocuments.mockResolvedValueOnce(inventory()).mockResolvedValueOnce(first)
      .mockResolvedValueOnce(inventory()).mockResolvedValueOnce(second);
    const { container } = start(mode);
    selectFile("tracks.gp5"); await act(async () => { await Promise.resolve(); });
    await choose(0); markLast();
    selectFile("tracks.gp5"); await act(async () => { await Promise.resolve(); });
    expect(screen.queryByRole("button", { name: "Return to mark" })).not.toBeInTheDocument();
    await choose(1);
    expect(button("Return to mark")).toBeDisabled();
    expect(description(container).textContent).toBe(describePlayablePosition(second.semanticDocument, 0));
    markLast(); click("Go to beginning"); click("Return to mark");
    expect(description(container).textContent).toBe(describePlayablePosition(second.semanticDocument, 2));
  });

  test.each(["success", "rejection"])("obsolete %s cannot erase or reattach a newer document mark", async (outcome) => {
    const pending = deferred();
    buildStructuredTabReaderDocuments.mockReturnValueOnce(pending.promise);
    const { container } = start(mode);
    await uploadText(); settleFocus(); markLast();
    selectFile("pending.gp5");
    expect(screen.queryByRole("button", { name: "Return to mark" })).not.toBeInTheDocument();
    await uploadText(source.replace("--0--2--3--", "--5--7--9--"), "new.tab"); settleFocus(); markLast();
    const expected = description(container).textContent;
    await act(async () => {
      if (outcome === "success") pending.resolve(buildReaderDocuments(source));
      else pending.reject(new Error("Old rejection"));
    });
    settleFocus();
    click("Go to beginning"); click("Return to mark");
    expect(description(container).textContent).toBe(expected);
  });

  test("marking and mode changes do not write browser storage", async () => {
    const write = jest.spyOn(Storage.prototype, "setItem");
    start(mode); await uploadText(); settleFocus(); markLast();
    changeMode(mode === "phone" ? "desktop" : "phone");
    click("Return to mark"); click("Go to beginning");
    expect(write).not.toHaveBeenCalled();
  });
});

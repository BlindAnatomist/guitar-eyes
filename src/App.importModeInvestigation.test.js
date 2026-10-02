import React from "react";
import * as ReactDOM from "react-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";
import { readCompressedMusicXmlFile } from "./compressedMusicXmlImporter";
import { readTextFile } from "./iphoneTabModel";
import { buildReaderDocuments } from "./tabImportCoordinator";

jest.mock("./structuredTabReaderDocuments", () => ({
  buildStructuredTabReaderDocuments: jest.fn(),
}));
jest.mock("./compressedMusicXmlImporter", () => ({
  readCompressedMusicXmlFile: jest.fn(),
}));
jest.mock("./iphoneTabModel", () => ({
  ...jest.requireActual("./iphoneTabModel"),
  readTextFile: jest.fn(),
}));

const originalMedia = window.matchMedia;
const originalFormatOnly = window.GUITAR_EYES_FORMAT_ONLY;
const originalVisibility = Object.getOwnPropertyDescriptor(document, "visibilityState");
const source = "e|--3--|\nB|-----|\nG|-----|\nD|-----|\nA|-----|\nE|-----|";
const modeLabels = {
  iphone: "iPhone semantic reader",
  desktop: "Desktop grid reader",
};
const directions = [["iphone", "desktop"], ["desktop", "iphone"]];
const modes = ["iphone", "desktop"];

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((finish, fail) => {
    resolve = finish;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function start(mode) {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: mode === "iphone",
    addListener() {},
    removeListener() {},
  });
  return render(<App />);
}

function changeMode(mode) {
  const control = screen.getByRole("radio", { name: modeLabels[mode] });
  control.focus();
  fireEvent.click(control);
}

function upload(name = "delayed.gp5") {
  const input = screen.getByLabelText("Upload tablature file:");
  fireEvent.change(input, { target: { files: [new File(["x"], name)] } });
  return input;
}

function readerDocuments(fret = 3) {
  return buildReaderDocuments(source.replace("--3--", `--${fret}--`));
}

function inventoryResult() {
  const items = [0, 1].map((index) => ({
    id: `track-${index}`,
    trackIndex: index,
    staffIndex: 0,
    supported: true,
    selectionLabel: `Guitar ${index + 1}`,
  }));
  return {
    requiresTrackSelection: true,
    sourceFormatLabel: "Guitar Pro 5 tablature",
    sourceFormat: "guitar-pro",
    selectionIntermediate: {},
    trackInventory: { supportedCount: 2, supportedItems: items, items },
  };
}

function chooseTrack(index = 0) {
  fireEvent.click(screen.getByRole("radio", { name: `Guitar ${index + 1}` }));
  fireEvent.click(screen.getByRole("button", { name: "Load selected track" }));
}

async function finish(request, result) {
  await act(async () => { request.resolve(result); });
}

async function flushMicrotasks() {
  await act(async () => { await Promise.resolve(); });
}

async function fail(request, message = "Controlled import rejection.") {
  await act(async () => { request.reject(new Error(message)); });
}

function settleFocus() {
  fireEvent.focus(window);
  act(() => { jest.runAllTimers(); });
}

function expectReader(mode, fret = 3) {
  const heading = screen.getByRole("heading", {
    name: mode === "iphone" ? "iPhone tablature reader" : "Desktop tablature reader",
  });
  expect(heading).toHaveFocus();
  expect(screen.getByText(new RegExp(
    `Loaded 1 synchronized positions in ${mode === "iphone" ? "iPhone reading" : "desktop semantic reader"} mode`
  ))).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`High E string, fret ${fret}\\.`))).toBeInTheDocument();
  expect(screen.getByLabelText("Upload tablature file:")).toBeEnabled();
}

beforeEach(() => {
  jest.useFakeTimers();
  window.GUITAR_EYES_FORMAT_ONLY = true;
  buildStructuredTabReaderDocuments.mockReset();
  readTextFile.mockReset();
  readCompressedMusicXmlFile.mockReset();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
  window.matchMedia = originalMedia;
  if (originalFormatOnly === undefined) delete window.GUITAR_EYES_FORMAT_ONLY;
  else window.GUITAR_EYES_FORMAT_ONLY = originalFormatOnly;
  if (originalVisibility) Object.defineProperty(document, "visibilityState", originalVisibility);
  else delete document.visibilityState;
});

describe("pending import and mode-switch status/focus", () => {
  test.each(directions)("settles successful import into the current reader: %s to %s", async (from, to) => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    start(from);
    upload();
    changeMode(to);
    await finish(request, readerDocuments());
    settleFocus();
    expectReader(to);
  });

  test.each(directions)("recovers rejected import in the current presentation: %s to %s", async (from, to) => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    start(from);
    upload();
    changeMode(to);
    await fail(request);
    settleFocus();
    expect(screen.getByRole("heading", { name: "Tablature could not be loaded" })).toHaveFocus();
    expect(screen.getByText("Controlled import rejection.")).toBeInTheDocument();
    expect(screen.getByText("The selected Guitar Pro file could not be imported.")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload tablature file:")).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Read current position" })).not.toBeInTheDocument();
  });

  test.each(directions)("settles delayed inventory and selected-track success in current mode: %s to %s", async (from, to) => {
    const inventory = deferred();
    const selection = deferred();
    buildStructuredTabReaderDocuments.mockReturnValueOnce(inventory.promise).mockReturnValueOnce(selection.promise);
    start(from);
    upload();
    changeMode(to);
    await finish(inventory, inventoryResult());
    settleFocus();
    expect(screen.getByRole("heading", { name: "Choose a Guitar Pro track" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Load selected track" })).toBeDisabled();
    chooseTrack(1);
    changeMode(from);
    await finish(selection, readerDocuments());
    settleFocus();
    expectReader(from);
    expect(screen.queryByRole("heading", { name: "Choose a Guitar Pro track" })).not.toBeInTheDocument();
    expect(buildStructuredTabReaderDocuments).toHaveBeenLastCalledWith(expect.any(File), {
      intermediate: {}, selection: { trackIndex: 1, staffIndex: 0 },
    });
  });

  test.each(directions)("recovers selected-track rejection after switching mode: %s to %s", async (from, to) => {
    const selection = deferred();
    buildStructuredTabReaderDocuments.mockResolvedValueOnce(inventoryResult()).mockReturnValueOnce(selection.promise);
    start(from);
    upload();
    await flushMicrotasks();
    settleFocus();
    chooseTrack();
    changeMode(to);
    await fail(selection, "Controlled selection rejection.");
    settleFocus();
    expect(screen.getByRole("heading", { name: "Tablature could not be loaded" })).toHaveFocus();
    expect(screen.getByText("Controlled selection rejection.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Choose a Guitar Pro track" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Upload tablature file:")).toBeEnabled();
  });

  test.each(directions)("recovers selected-track missing-document outcome after switching mode: %s to %s", async (from, to) => {
    const selection = deferred();
    buildStructuredTabReaderDocuments.mockResolvedValueOnce(inventoryResult()).mockReturnValueOnce(selection.promise);
    start(from);
    upload();
    await flushMicrotasks();
    chooseTrack();
    changeMode(to);
    await finish(selection, { semanticDocument: null });
    settleFocus();
    expect(screen.getByRole("heading", { name: "Tablature could not be loaded" })).toHaveFocus();
    expect(screen.getByText(/did not produce a semantic reader document/)).toBeInTheDocument();
    expect(screen.getByLabelText("Upload tablature file:")).toBeEnabled();
  });

  test.each(directions)("uses current-mode rejection or inherited compatibility fallback: %s to %s", async (from, to) => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    start(from);
    upload();
    changeMode(to);
    await finish(request, {
      semanticDocument: null,
      semanticError: new Error("Controlled semantic rejection."),
      desktopBlocks: [["e|--3--|", "B|-----|", "G|-----|", "D|-----|", "A|-----|", "E|-----|"]],
      sourceFormat: "ascii-text",
    });
    settleFocus();
    const expected = {
      iphone: { heading: "Tablature could not be loaded", status: "The file could not be loaded in iPhone reading mode." },
      desktop: { heading: "Desktop grid reader", status: "Loaded 1 tablature block in desktop compatibility grid mode." },
    }[to];
    expect(screen.getByRole("heading", { name: expected.heading })).toHaveFocus();
    expect(screen.getByText(expected.status)).toBeInTheDocument();
  });

  test("uses the final mode after repeated switches while import is pending", async () => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    start("iphone");
    upload();
    changeMode("desktop");
    changeMode("iphone");
    changeMode("desktop");
    await finish(request, readerDocuments());
    settleFocus();
    expectReader("desktop");
  });
});

describe("request identity and interruption", () => {
  test.each(modes)("older success, rejection and inventory cannot replace newer %s import", async (mode) => {
    for (const oldOutcome of ["success", "rejection", "inventory"]) {
      const older = deferred();
      const newer = deferred();
      buildStructuredTabReaderDocuments.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
      const view = start(mode);
      upload("older.gp5");
      // Model an already-delivered file event superseding pending work. The native control stays disabled.
      upload("newer.gp5");
      if (oldOutcome === "rejection") await fail(older, "Obsolete rejection.");
      else await finish(older, oldOutcome === "inventory" ? inventoryResult() : readerDocuments());
      expect(screen.getByText("Reading the selected tablature file.")).toBeInTheDocument();
      expect(screen.getByLabelText("Upload tablature file:")).toBeDisabled();
      expect(screen.queryByRole("heading", { name: "Choose a Guitar Pro track" })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Tablature could not be loaded" })).not.toBeInTheDocument();
      await finish(newer, readerDocuments(7));
      settleFocus();
      expectReader(mode, 7);
      view.unmount();
    }
  });

  test.each(modes)("older import cannot replace newer %s explicit selection", async (mode) => {
    const older = deferred();
    const selection = deferred();
    buildStructuredTabReaderDocuments.mockReturnValueOnce(older.promise).mockResolvedValueOnce(inventoryResult()).mockReturnValueOnce(selection.promise);
    start(mode);
    upload("older.gp5");
    upload("newer.gp5");
    await flushMicrotasks();
    chooseTrack(1);
    await finish(selection, readerDocuments(7));
    settleFocus();
    await finish(older, inventoryResult());
    settleFocus();
    expectReader(mode, 7);
    expect(screen.queryByRole("heading", { name: "Choose a Guitar Pro track" })).not.toBeInTheDocument();
  });

  test.each(modes)("older selection success/rejection cannot replace newer %s selection", async (mode) => {
    for (const oldOutcome of ["success", "rejection"]) {
      const older = deferred();
      const newer = deferred();
      buildStructuredTabReaderDocuments.mockResolvedValueOnce(inventoryResult()).mockReturnValueOnce(older.promise).mockResolvedValueOnce(inventoryResult()).mockReturnValueOnce(newer.promise);
      const view = start(mode);
      upload("older.gp5");
      await flushMicrotasks();
      chooseTrack();
      upload("newer.gp5");
      await flushMicrotasks();
      chooseTrack(1);
      if (oldOutcome === "rejection") await fail(older, "Obsolete selection rejection.");
      else await finish(older, readerDocuments());
      expect(screen.getByText("Preparing the selected Guitar Pro track.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Load selected track" })).toBeDisabled();
      await finish(newer, readerDocuments(7));
      settleFocus();
      expectReader(mode, 7);
      view.unmount();
    }
  });

  test.each(["success", "rejection"])("unmount cancels pending import %s before committed outcome", async (outcome) => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    const view = start("iphone");
    upload();
    const commit = jest.spyOn(ReactDOM, "flushSync");
    view.unmount();
    if (outcome === "rejection") await fail(request);
    else await finish(request, readerDocuments());
    expect(commit).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each(["success", "rejection"])("unmount cancels pending selection %s before committed outcome", async (outcome) => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockResolvedValueOnce(inventoryResult()).mockReturnValueOnce(request.promise);
    const view = start("iphone");
    upload();
    await flushMicrotasks();
    chooseTrack();
    const commit = jest.spyOn(ReactDOM, "flushSync");
    view.unmount();
    if (outcome === "rejection") await fail(request);
    else await finish(request, readerDocuments());
    expect(commit).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  test("newer work cancels an iPhone focus request between picker-return frames", async () => {
    const newer = deferred();
    buildStructuredTabReaderDocuments.mockResolvedValueOnce(readerDocuments()).mockReturnValueOnce(newer.promise);
    start("iphone");
    upload("first.gp5");
    await flushMicrotasks();
    act(() => { jest.advanceTimersByTime(16); });
    const input = upload("next.gp5");
    changeMode("desktop");
    fireEvent(window, new Event("pageshow"));
    act(() => { jest.runAllTimers(); });
    expect(screen.getByRole("radio", { name: modeLabels.desktop })).toHaveFocus();
    expect(input).toBeDisabled();
    await finish(newer, readerDocuments(7));
    settleFocus();
    expectReader("desktop", 7);
  });

  test("newer work cancels desktop error focus before its queued timer", async () => {
    const newer = deferred();
    buildStructuredTabReaderDocuments.mockRejectedValueOnce(new Error("First rejection.")).mockReturnValueOnce(newer.promise);
    start("desktop");
    upload("first.gp5");
    await flushMicrotasks();
    const input = upload("next.gp5");
    changeMode("iphone");
    act(() => { jest.runAllTimers(); });
    expect(screen.getByRole("radio", { name: modeLabels.iphone })).toHaveFocus();
    expect(input).toBeDisabled();
    await finish(newer, readerDocuments(7));
    settleFocus();
    expectReader("iphone", 7);
  });

  test("retains picker-return recovery when the committed iPhone target is hidden", async () => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    start("desktop");
    upload();
    changeMode("iphone");
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    await finish(request, readerDocuments());
    settleFocus();
    expect(screen.getByRole("radio", { name: modeLabels.iphone })).toHaveFocus();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    fireEvent(document, new Event("visibilitychange"));
    act(() => { jest.runAllTimers(); });
    expectReader("iphone");
  });

  test("empty native-picker selection preserves the completed document", async () => {
    buildStructuredTabReaderDocuments.mockResolvedValueOnce(readerDocuments());
    start("iphone");
    const input = upload();
    await flushMicrotasks();
    settleFocus();
    input.focus();
    fireEvent.change(input, { target: { files: [] } });
    fireEvent(input, new Event("cancel"));
    settleFocus();
    expect(buildStructuredTabReaderDocuments).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Loaded 1 synchronized positions in iPhone reading mode/)).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  test("preserves current-mode settlement under StrictMode mount cleanup", async () => {
    const request = deferred();
    buildStructuredTabReaderDocuments.mockReturnValue(request.promise);
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    render(<React.StrictMode><App /></React.StrictMode>);
    upload();
    changeMode("desktop");
    await finish(request, readerDocuments());
    settleFocus();
    expectReader("desktop");
  });

  test.each(["text", "compressed"])("obsolete %s rejection cannot replace a newer import", async (route) => {
    const older = deferred();
    const newer = deferred();
    if (route === "text") readTextFile.mockReturnValue(older.promise);
    else readCompressedMusicXmlFile.mockReturnValue(older.promise);
    buildStructuredTabReaderDocuments.mockReturnValue(newer.promise);
    start("iphone");
    upload(route === "text" ? "older.txt" : "older.mxl");
    upload("newer.gp5");
    await finish(newer, readerDocuments(7));
    settleFocus();
    await fail(older, "Obsolete read rejection.");
    settleFocus();
    expectReader("iphone", 7);
    expect(screen.queryByRole("heading", { name: "Tablature could not be loaded" })).not.toBeInTheDocument();
  });

  test.each(["text", "compressed"])("obsolete %s read cannot commit after a newer import", async (route) => {
    const older = deferred();
    const newer = deferred();
    if (route === "text") readTextFile.mockReturnValue(older.promise);
    else readCompressedMusicXmlFile.mockReturnValue(older.promise);
    buildStructuredTabReaderDocuments.mockReturnValue(newer.promise);
    start("iphone");
    upload(route === "text" ? "older.txt" : "older.mxl");
    upload("newer.gp5");
    await finish(newer, readerDocuments(7));
    settleFocus();
    await finish(older, source);
    settleFocus();
    expectReader("iphone", 7);
    expect(screen.queryByRole("heading", { name: "Tablature could not be loaded" })).not.toBeInTheDocument();
  });
});

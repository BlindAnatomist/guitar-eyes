import fs from "fs";
import path from "path";
import vm from "vm";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { buildReaderDocuments } from "./tabImportCoordinator";
import { describePlayablePosition } from "./positionDescription";
import { CANDIDATE_BUILD_LABEL } from "./buildIdentity";

/* eslint-disable testing-library/no-node-access, testing-library/no-container -- Inspect hidden identity and unchanged live-region/focus contracts. */

const originalMedia = window.matchMedia;
const originalFlag = Object.getOwnPropertyDescriptor(window, "GUITAR_EYES_FORMAT_ONLY");
const source = "e|--0--2--|\nB|--------|\nG|--------|\nD|--------|\nA|--------|\nE|--------|";

afterEach(() => {
  window.matchMedia = originalMedia;
  if (originalFlag) Object.defineProperty(window, "GUITAR_EYES_FORMAT_ONLY", originalFlag);
  else delete window.GUITAR_EYES_FORMAT_ONLY;
});

test.each([["phone", true], ["desktop", false]])("shipped entry point and %s App retain the same candidate identity and closed reader", async (_, coarse) => {
  const html = fs.readFileSync(path.join(process.cwd(), "public", "index.html"), "utf8");
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const entryPoint = { window: {} };
  vm.runInNewContext(script, entryPoint);
  expect(entryPoint.window.GUITAR_EYES_FORMAT_ONLY).toBe(true);
  window.GUITAR_EYES_FORMAT_ONLY = entryPoint.window.GUITAR_EYES_FORMAT_ONLY;
  window.matchMedia = jest.fn().mockReturnValue({ matches: coarse });
  const { container } = render(<App />);

  expect(container.querySelectorAll(".test-build-label")).toHaveLength(1);
  expect(container.querySelector(".test-build-label").textContent).toBe(CANDIDATE_BUILD_LABEL);
  expect(screen.queryByText(/PowerTab 2 version 11 source checkpoint/)).not.toBeInTheDocument();
  const upload = screen.getByLabelText("Upload tablature file:");
  expect(upload).not.toHaveAttribute("accept");
  fireEvent.change(upload, { target: { files: [new File([source], "candidate.tab", { type: "text/plain" })] } });
  const heading = await screen.findByRole("heading", { name: coarse ? "iPhone tablature reader" : "Desktop tablature reader" });
  fireEvent.focus(window);
  await waitFor(() => expect(heading).toHaveFocus());
  expect(screen.queryByRole("group", { name: "Position audio" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Sound delay")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Mark current position" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Next position" }));
  expect(container.querySelector('.visually-hidden[aria-live="polite"]')).toBeEmptyDOMElement();
  fireEvent.click(screen.getByRole("button", { name: "Read current position" }));
  expect(container.querySelector('.visually-hidden[aria-live="polite"]').textContent).toBe(describePlayablePosition(buildReaderDocuments(source).semanticDocument, 1));
});

import fs from "fs";
import path from "path";
import { CANDIDATE_BUILD_LABEL } from "./buildIdentity";

/* eslint-disable testing-library/no-node-access -- Inspect the static entry point before React mounts. */

describe("source entry-point identity", () => {
  test("uses one concise candidate title and first heading before the React root", () => {
    const html = fs.readFileSync(path.join(process.cwd(), "public", "index.html"), "utf8");
    const page = new DOMParser().parseFromString(html, "text/html");
    const heading = page.getElementById("test-build-heading");
    const root = page.getElementById("root");

    expect(CANDIDATE_BUILD_LABEL).toBe("Guitar Eyes format-only candidate");
    expect(page.title).toBe(CANDIDATE_BUILD_LABEL);
    expect(heading.textContent).toBe(CANDIDATE_BUILD_LABEL);
    expect(page.querySelector("h1")).toBe(heading);
    expect(page.querySelectorAll("#test-build-heading")).toHaveLength(1);
    expect(heading.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(html).toContain("window.GUITAR_EYES_FORMAT_ONLY = true;");
    expect(html).toMatch(/\.test-build-label,\s*\.audible-proof-label\s*\{\s*display:\s*none;/);
    expect(page.querySelector('meta[name="description"]').content).toBe("Format-only Guitar Eyes reader candidate.");
    expect(html).not.toMatch(/TuxGuitar standard|PowerTab.*checkpoint|private passage mark checkpoint/);
  });
});

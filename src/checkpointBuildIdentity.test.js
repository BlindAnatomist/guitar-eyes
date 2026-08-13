import fs from "fs";
import path from "path";

describe("checkpoint build identity", () => {
  test("places one PowerTab standard four-string bass identity before the React root", () => {
    const html = fs.readFileSync(
      path.join(process.cwd(), "public", "index.html"),
      "utf8"
    );
    const title =
      "<title>Test build Guitar Eyes PowerTab standard four-string bass proof</title>";
    const heading =
      '<h1 id="test-build-heading">Test build: Guitar Eyes PowerTab standard four-string bass 1.0, 1.0.2, 1.5, 1.7, and v11 proof.</h1>';
    const root = '<div id="root"></div>';

    expect(html).toContain(title);
    expect(html).toContain(heading);
    expect(html).toContain("window.GUITAR_EYES_FORMAT_ONLY = true;");
    expect(html.indexOf(heading)).toBeLessThan(html.indexOf(root));
    expect(html.match(/id="test-build-heading"/g)).toHaveLength(1);
    expect(html).toMatch(/\.test-build-label,\s*\.audible-proof-label\s*\{\s*display:\s*none;/);
  });
});

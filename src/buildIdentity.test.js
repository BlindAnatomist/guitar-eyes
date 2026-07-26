import fs from "fs";
import path from "path";

describe("acceptance build identity", () => {
  test("places the unique convergence recovery identity before the React root", () => {
    const html = fs.readFileSync(
      path.join(process.cwd(), "public", "index.html"),
      "utf8"
    );
    const title = "<title>Test build Convergence recovery checkpoint 1</title>";
    const heading =
      '<h1 id="test-build-heading">Test build: Convergence recovery checkpoint 1.</h1>';
    const root = '<div id="root"></div>';

    expect(html).toContain(title);
    expect(html).toContain(heading);
    expect(html.indexOf(heading)).toBeLessThan(html.indexOf(root));
    expect(html.match(/id="test-build-heading"/g)).toHaveLength(1);
  });
});

import fs from "fs";
import path from "path";

describe("checkpoint build identity", () => {
  test("places the unique Guitar Pro proof identity before the React root", () => {
    const html = fs.readFileSync(
      path.join(process.cwd(), "public", "index.html"),
      "utf8"
    );
    const title = "<title>Test build Guitar Pro multi-track binary proof 3D</title>";
    const heading =
      '<h1 id="test-build-heading">Test build: Guitar Pro multi-track binary proof 3D.</h1>';
    const root = '<div id="root"></div>';

    expect(html).toContain(title);
    expect(html).toContain(heading);
    expect(html.indexOf(heading)).toBeLessThan(html.indexOf(root));
    expect(html.match(/id="test-build-heading"/g)).toHaveLength(1);
  });
});

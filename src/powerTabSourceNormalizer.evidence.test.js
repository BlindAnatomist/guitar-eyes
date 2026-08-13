import fs from "fs";
import path from "path";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";
import { normalizeVerifiedPowerTabIntermediate } from "./powerTabSourceNormalizer";

test("PowerTab v11 preserves exact source evidence", () => {
  const value = decodePowerTabV11Document(JSON.parse(fs.readFileSync(
    path.join(process.cwd(), "fixtures", "powertab-v11", "powertab-v11-original-six-position.source.json"), "utf8"
  )));
  const document = normalizeVerifiedPowerTabIntermediate(value);
  expect(document.versionEvidence).toMatchObject({
    containerFamily: "POWERTAB_PT2_GZIP_JSON",
    internalVersion: 11,
    upstreamRelease: "2.0.22",
  });
  expect(JSON.stringify(document)).not.toMatch(/guitar-pro/iu);
});

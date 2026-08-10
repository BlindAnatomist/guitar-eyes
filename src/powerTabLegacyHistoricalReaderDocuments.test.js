import fs from "fs";
import path from "path";
import { buildPowerTabLegacyReaderDocuments } from "./powerTabLegacyReaderDocuments";
import { decodePowerTabLegacyHistoricalBytes } from "./powerTabLegacyHistoricalDecoder";

const FIXTURES = [
  ["powertab-v10-original-six-position.ptb", "PTB_V10", "PowerTab 1.0 tablature"],
  ["powertab-v102-original-six-position.ptb", "PTB_V102", "PowerTab 1.0.2 tablature"],
  ["powertab-v15-original-six-position.ptb", "PTB_V15", "PowerTab 1.5 tablature"],
];

function decoded(filename) {
  return decodePowerTabLegacyHistoricalBytes(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-ptb-historical",
        filename
      )
    )
  );
}

describe("historical PowerTab reader documents", () => {
  test.each(FIXTURES)(
    "builds one semantic desktop/iPhone document for %s",
    async (filename, sourceVersion, sourceFormatLabel) => {
      const result = await buildPowerTabLegacyReaderDocuments(null, {
        intermediate: decoded(filename),
      });
      expect(result).toMatchObject({
        desktopSource: "semantic",
        supportOutcome: "source-checkpoint-provisional",
        sourceFormat: "powertab-legacy",
        sourceFormatLabel,
        requiresTrackSelection: false,
        resolvedInstrument: "guitar",
        semanticDocument: {
          sourceVersion,
        },
      });
      expect(result.semanticDocument.positions).toHaveLength(6);
      expect(result.semanticDocument.measures).toHaveLength(2);
      expect(result.desktopBlocks).toHaveLength(1);
    }
  );
});

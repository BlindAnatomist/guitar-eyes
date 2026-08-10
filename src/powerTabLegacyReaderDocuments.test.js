import fs from "fs";
import path from "path";
import { buildPowerTabLegacyReaderDocuments } from "./powerTabLegacyReaderDocuments";
import { decodePowerTabLegacyV17Bytes } from "./powerTabLegacyV17Decoder";

function decoded() {
  return decodePowerTabLegacyV17Bytes(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "powertab-ptb-v17",
        "powertab-v17-original-six-position.ptb"
      )
    )
  );
}

describe("legacy PowerTab reader documents", () => {
  test("builds desktop and iPhone presentations from one semantic document", async () => {
    const result = await buildPowerTabLegacyReaderDocuments(null, {
      intermediate: decoded(),
    });

    expect(result).toMatchObject({
      desktopSource: "semantic",
      supportOutcome: "source-checkpoint-provisional",
      sourceFormat: "powertab-legacy",
      sourceFormatLabel: "PowerTab 1.7 tablature",
      requiresTrackSelection: false,
      resolvedInstrument: "guitar",
    });
    expect(result.semanticDocument.positions).toHaveLength(6);
    expect(result.semanticDocument.measures).toHaveLength(2);
    expect(result.desktopBlocks).toHaveLength(1);
  });
});

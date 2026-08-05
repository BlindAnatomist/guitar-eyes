import fs from "fs";
import path from "path";
import { buildPowerTabReaderDocuments } from "./powerTabReaderDocuments";
import { decodePowerTabV11Document } from "./powerTabV11Decoder";

function decoded() {
  return decodePowerTabV11Document(
    JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "fixtures",
          "powertab-v11",
          "powertab-v11-original-six-position.source.json"
        ),
        "utf8"
      )
    )
  );
}

describe("PowerTab reader documents", () => {
  test("builds desktop and iPhone presentations from one semantic document", async () => {
    const result = await buildPowerTabReaderDocuments(null, {
      intermediate: decoded(),
    });

    expect(result).toMatchObject({
      desktopSource: "semantic",
      supportOutcome: "checkpoint-foundation",
      sourceFormat: "powertab-pt2",
      sourceFormatLabel: "PowerTab 2 version 11 tablature",
      requiresTrackSelection: false,
      resolvedInstrument: "guitar",
    });
    expect(result.semanticDocument.positions).toHaveLength(6);
    expect(result.desktopBlocks).toHaveLength(1);
  });

  test("retains the decoded intermediate until an explicit selection is made", async () => {
    const value = decoded();
    value.tracks.push({
      ...value.tracks[0],
      name: "Second Guitar",
      shortName: "Second Guitar",
      staves: value.tracks[0].staves.map((staff) => ({
        ...staff,
        bars: staff.bars.map((bar) => ({ ...bar })),
      })),
    });
    value.versionEvidence = {
      ...value.versionEvidence,
      declaredPlayerCount: 2,
      decodedTrackCount: 2,
    };

    const pending = await buildPowerTabReaderDocuments(null, {
      intermediate: value,
    });
    expect(pending).toMatchObject({
      requiresTrackSelection: true,
      supportOutcome: "track-selection-required",
      semanticDocument: null,
      guitarProIntermediate: value,
    });

    const selected = await buildPowerTabReaderDocuments(null, {
      intermediate: value,
      selection: { trackIndex: 1, staffIndex: 0 },
    });
    expect(selected.semanticDocument.sourceTrackName).toBe("Second Guitar");
  });
});

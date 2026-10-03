import { buildPowerTabReaderDocuments } from "./powerTabReaderDocuments";
import { buildPowerTabLegacyReaderDocuments } from "./powerTabLegacyReaderDocuments";

const legacyVersions = [
  ["PTB_V10", "1.0", 1],
  ["PTB_V102", "1.0.2", 2],
  ["PTB_V15", "1.5", 3],
  ["PTB_V17", "1.7", 4],
];

describe("PowerTab empty-inventory fallback wording", () => {
  test.each(legacyVersions)("keeps %s evidence and includes its bounded bass profile", async (sourceVersion, powerTabVersion, fileVersion) => {
    const normalize = jest.fn();
    const result = buildPowerTabLegacyReaderDocuments(null, {
      intermediate: {
        schemaVersion: 1,
        sourceVersion,
        versionEvidence: { fileVersion, powerTabVersion, decodedTrackCount: 0 },
        tracks: [],
      },
      normalize,
    });
    await expect(result).rejects.toMatchObject({
      code: "NO_SUPPORTED_POWERTAB_LEGACY_PLAYER",
      message: `The PowerTab ${powerTabVersion} file contains no player within the bounded six-string guitar or exact standard four-string bass profiles. The bass tuning must be G2, D2, A1, E1 from highest to lowest.`,
    });
    expect(normalize).not.toHaveBeenCalled();
  });

  test.each(Array.from({ length: 11 }, (_, index) => index + 1))(
    "PT2 version %s fallback retains the historical bass exclusion",
    async (internalVersion) => {
      const normalize = jest.fn();
      const result = buildPowerTabReaderDocuments(null, {
        intermediate: {
          schemaVersion: 1,
          sourceVersion: `PT2_V${internalVersion}`,
          versionEvidence: { internalVersion, decodedTrackCount: 0 },
          tracks: [],
        },
        normalize,
      });
      await expect(result).rejects.toMatchObject({
        code: "NO_SUPPORTED_POWERTAB_PLAYER",
        message: "The PowerTab file contains no supported player within its version-specific profile. Internal versions 1 through 11 have bounded six-string guitar profiles; exact standard four-string bass in high-to-low tuning G2, D2, A1, E1 is supported only for internal version 11.",
      });
      expect(normalize).not.toHaveBeenCalled();
    }
  );

  test.each([
    ["PTB", buildPowerTabLegacyReaderDocuments, "Specific profile rejection."],
    ["PT2", buildPowerTabReaderDocuments, "Proof Bass: Specific profile rejection."],
  ])("preserves %s inventory reasons ahead of fallback text", async (family, build, message) => {
    await expect(build(null, {
      intermediate: {},
      inventory: () => ({
        supportedCount: 0,
        items: [{ trackName: "Proof Bass", reason: "Specific profile rejection." }],
      }),
    })).rejects.toMatchObject({ message });
  });
});

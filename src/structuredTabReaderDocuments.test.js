import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";

jest.mock("./guitarProReaderDocuments", () => ({
  buildGuitarProReaderDocuments: jest.fn(),
}));

beforeEach(() => {
  buildGuitarProReaderDocuments.mockReset();
});

describe("buildStructuredTabReaderDocuments", () => {
  test("preserves the existing Guitar Pro route", async () => {
    const expected = { requiresTrackSelection: false, sourceFormat: "guitar-pro" };
    buildGuitarProReaderDocuments.mockResolvedValue(expected);
    const file = new File([new Uint8Array([1])], "proof.gp5");

    await expect(buildStructuredTabReaderDocuments(file)).resolves.toBe(expected);
    expect(buildGuitarProReaderDocuments).toHaveBeenCalledWith(file);
  });

  test("loads modern PowerTab lazily and exposes one generic selection intermediate", async () => {
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "PT2_V11",
      tracks: [{ name: "Guitar", staves: [] }],
    };
    const inventory = {
      supportedCount: 2,
      requiresSelection: true,
      supportedItems: [
        { id: "one", trackIndex: 0, staffIndex: 0, supported: true },
        { id: "two", trackIndex: 1, staffIndex: 0, supported: true },
      ],
      items: [],
    };
    const file = new File([new Uint8Array([0x1f, 0x8b])], "proof.pt2");

    const result = await buildStructuredTabReaderDocuments(file, {
      decode: jest.fn().mockResolvedValue(intermediate),
      inventory: jest.fn().mockReturnValue(inventory),
    });

    expect(result).toMatchObject({
      requiresTrackSelection: true,
      sourceFormat: "powertab-pt2",
      selectionIntermediate: intermediate,
    });
    expect(buildGuitarProReaderDocuments).not.toHaveBeenCalled();
  });

  test("loads legacy PowerTab v1.7 through its separate lazy reader", async () => {
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "PTB_V17",
      tracks: [{ name: "Legacy Guitar", staves: [] }],
    };
    const inventory = {
      supportedCount: 2,
      requiresSelection: true,
      supportedItems: [
        { id: "one", trackIndex: 0, staffIndex: 0, supported: true },
        { id: "two", trackIndex: 1, staffIndex: 0, supported: true },
      ],
      items: [],
    };
    const file = new File([new Uint8Array([0x70, 0x74, 0x61, 0x62])], "proof.ptb");

    const result = await buildStructuredTabReaderDocuments(file, {
      decode: jest.fn().mockResolvedValue(intermediate),
      inventory: jest.fn().mockReturnValue(inventory),
    });

    expect(result).toMatchObject({
      requiresTrackSelection: true,
      sourceFormat: "powertab-legacy",
      sourceFormatLabel: "PowerTab 1.7 tablature",
      selectionIntermediate: intermediate,
    });
    expect(buildGuitarProReaderDocuments).not.toHaveBeenCalled();
  });

  test("loads TuxGuitar lazily and preserves its selection intermediate", async () => {
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "TG_1_5",
      versionEvidence: { formatVersion: "TuxGuitar File Format - 1.5" },
      tracks: [{ name: "Tux Guitar", staves: [] }],
    };
    const inventory = {
      supportedCount: 2,
      requiresSelection: true,
      selectorLabels: { formatName: "TuxGuitar", plural: "tracks" },
      supportedItems: [
        { id: "one", trackIndex: 0, staffIndex: 0, supported: true },
        { id: "two", trackIndex: 1, staffIndex: 0, supported: true },
      ],
      items: [],
    };
    const file = new File([new Uint8Array([1])], "proof.tg");

    const result = await buildStructuredTabReaderDocuments(file, {
      decode: jest.fn().mockResolvedValue(intermediate),
      inventory: jest.fn().mockReturnValue(inventory),
    });

    expect(result).toMatchObject({
      requiresTrackSelection: true,
      sourceFormat: "tuxguitar",
      sourceFormatLabel: "TuxGuitar 1.5 tablature",
      selectionIntermediate: intermediate,
    });
    expect(buildGuitarProReaderDocuments).not.toHaveBeenCalled();
  });

  test.each(["PT2_V11", "PTB_V17", "TG_1_5"])(
    "routes a selection retry by exact %s intermediate version evidence",
    async (sourceVersion) => {
      const intermediate = {
        schemaVersion: 1,
        sourceVersion,
        versionEvidence: sourceVersion.startsWith("TG_")
          ? { formatVersion: "TuxGuitar File Format - 1.5" }
          : undefined,
        tracks: [],
      };
      const inventory = {
        supportedCount: 2,
        requiresSelection: true,
        supportedItems: [],
        items: [],
      };
      const file = new File([new Uint8Array([1])], "picker-return.tmp");

      const result = await buildStructuredTabReaderDocuments(file, {
        intermediate,
        inventory: jest.fn().mockReturnValue(inventory),
      });

      expect(result.selectionIntermediate).toBe(intermediate);
      expect(buildGuitarProReaderDocuments).not.toHaveBeenCalled();
    }
  );
});

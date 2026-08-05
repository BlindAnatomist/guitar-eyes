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

  test("loads PowerTab lazily and exposes one generic selection intermediate", async () => {
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

  test("routes a selection retry by exact intermediate version evidence", async () => {
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "PT2_V11",
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
  });
});

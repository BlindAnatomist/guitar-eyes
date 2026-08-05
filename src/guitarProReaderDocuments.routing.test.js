import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";
import { buildGuitarProSpecificReaderDocuments } from "./guitarProSpecificReaderDocuments";
import { buildPowerTabReaderDocuments } from "./powerTabReaderDocuments";

jest.mock("./guitarProSpecificReaderDocuments", () => ({
  buildGuitarProSpecificReaderDocuments: jest.fn(),
}));

jest.mock("./powerTabReaderDocuments", () => ({
  buildPowerTabReaderDocuments: jest.fn(),
}));

beforeEach(() => {
  buildGuitarProSpecificReaderDocuments.mockReset();
  buildPowerTabReaderDocuments.mockReset();
});

describe("structured binary reader routing", () => {
  test("preserves Guitar Pro delegation and options", async () => {
    const file = new File([new Uint8Array([1])], "proof.gp5");
    const options = { selection: { trackIndex: 0, staffIndex: 0 } };
    const expected = {
      sourceFormat: "guitar-pro",
      requiresTrackSelection: false,
    };
    buildGuitarProSpecificReaderDocuments.mockResolvedValue(expected);

    await expect(buildGuitarProReaderDocuments(file, options)).resolves.toBe(
      expected
    );
    expect(buildGuitarProSpecificReaderDocuments).toHaveBeenCalledWith(
      file,
      options
    );
    expect(buildPowerTabReaderDocuments).not.toHaveBeenCalled();
  });

  test("routes .pt2 lazily and preserves the existing selection-session field", async () => {
    const file = new File([new Uint8Array([0x1f, 0x8b])], "proof.pt2");
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "PT2_V11",
      tracks: [],
    };
    const result = {
      sourceFormat: "powertab-pt2",
      requiresTrackSelection: true,
      powerTabIntermediate: intermediate,
    };
    buildPowerTabReaderDocuments.mockResolvedValue(result);

    await expect(buildGuitarProReaderDocuments(file)).resolves.toMatchObject({
      sourceFormat: "powertab-pt2",
      requiresTrackSelection: true,
      guitarProIntermediate: intermediate,
    });
    expect(buildPowerTabReaderDocuments).toHaveBeenCalledWith(file, {});
    expect(buildGuitarProSpecificReaderDocuments).not.toHaveBeenCalled();
  });

  test("recognizes an exact PowerTab intermediate during selection retry", async () => {
    const file = new File([new Uint8Array([1])], "picker-return.tmp");
    const intermediate = {
      schemaVersion: 1,
      sourceVersion: "PT2_V11",
      tracks: [],
    };
    const options = {
      intermediate,
      selection: { trackIndex: 1, staffIndex: 0 },
    };
    buildPowerTabReaderDocuments.mockResolvedValue({
      sourceFormat: "powertab-pt2",
      requiresTrackSelection: false,
      semanticDocument: { positions: [] },
    });

    await buildGuitarProReaderDocuments(file, options);
    expect(buildPowerTabReaderDocuments).toHaveBeenCalledWith(file, options);
    expect(buildGuitarProSpecificReaderDocuments).not.toHaveBeenCalled();
  });

  test("returns a semantic import error instead of relabeling PowerTab corruption as Guitar Pro", async () => {
    const file = new File([new Uint8Array([0x1f, 0x8b])], "broken.pt2");
    const error = Object.assign(
      new Error("The PowerTab document reports unsupported internal version 10."),
      { code: "UNTESTED_POWERTAB_VERSION" }
    );
    buildPowerTabReaderDocuments.mockRejectedValue(error);

    await expect(buildGuitarProReaderDocuments(file)).resolves.toMatchObject({
      semanticDocument: null,
      semanticError: error,
      supportOutcome: "powertab-import-error",
      sourceFormat: "powertab-pt2",
      sourceFormatLabel: "PowerTab 2 version 11 tablature",
    });
  });
});

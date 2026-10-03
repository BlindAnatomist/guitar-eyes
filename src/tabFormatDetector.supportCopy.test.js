import { detectTabFileFormat, unsupportedTabFormatMessage } from "./tabFormatDetector";

describe("bounded import failure explanations", () => {
  test("PT2 explains the accepted internal versions without granting historical bass support", () => {
    const message = unsupportedTabFormatMessage(detectTabFileFormat("score.pt2"));
    expect(message).toContain("internal versions 1 through 11 have bounded six-string guitar profiles");
    expect(message).toContain("only internal version 11 supports exact standard four-string bass");
    expect(message).toContain("G2, D2, A1, E1");
    expect(message).toContain("other structures remain unsupported");
  });

  test("PTB explains all four version-specific guitar and exact bass profiles", () => {
    const message = unsupportedTabFormatMessage(detectTabFileFormat("score.ptb"));
    expect(message).toContain("file-version values 1 through 4: PowerTab 1.0, 1.0.2, 1.5, and 1.7 respectively");
    expect(message).toContain("bounded six-string guitar and exact standard four-string bass profiles");
    expect(message).toContain("G2, D2, A1, E1 from highest to lowest");
    expect(message).toContain("Recognizing the file does not establish that its musical structures are supported");
  });

  test("TG explains native versions and exact bass without claiming deferred generations", () => {
    const message = unsupportedTabFormatMessage(detectTabFileFormat("score.tg"));
    expect(message).toContain("1.0, 1.1, 1.2, 1.3, and 1.5 plus modern native file format 2.0.0");
    expect(message).toContain("bounded six-string guitar and exact standard four-string bass profiles");
    expect(message).toContain("G2, D2, A1, E1 from highest to lowest");
    expect(message).toContain("Native 0.7, 0.8, and 0.9 remain unsupported");
    expect(message).toContain("no native 1.4 route is inferred");
    expect(message).toContain("Recognizing the file does not establish that its musical structures are supported");
  });
});

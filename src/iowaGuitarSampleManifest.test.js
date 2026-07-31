import {
  IOWA_GUITAR_SAMPLE_MANIFEST,
  MAX_IOWA_SAMPLE_SHIFT_SEMITONES,
  selectIowaGuitarSample,
} from "./iowaGuitarSampleManifest";

describe("Iowa guitar sample manifest", () => {
  test("keeps one licensed anchor on each physical guitar string", () => {
    expect(IOWA_GUITAR_SAMPLE_MANIFEST).toHaveLength(6);
    expect(IOWA_GUITAR_SAMPLE_MANIFEST.map((entry) => entry.stringIndex)).toEqual([
      0,
      1,
      2,
      3,
      4,
      5,
    ]);
    IOWA_GUITAR_SAMPLE_MANIFEST.forEach((entry) => {
      expect(entry.sourceFilename).toMatch(/^Guitar\.mf\./);
      expect(entry.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.derivedFilename).toMatch(/\.wav$/);
    });
  });

  test("selects only from the event's own physical string", () => {
    const selection = selectIowaGuitarSample({
      type: "pitched-string",
      stringIndex: 5,
      midi: 40,
    });

    expect(selection.entry.stringNumber).toBe(6);
    expect(selection.entry.anchorName).toBe("E2");
    expect(selection.semitoneShift).toBe(0);
    expect(selection.playbackRate).toBe(1);
    expect(selection.url).toContain("/samples/iowa-guitar/string-6-e2.wav");
  });

  test("permits only the bounded same-string pitch range", () => {
    expect(MAX_IOWA_SAMPLE_SHIFT_SEMITONES).toBe(3);
    expect(
      selectIowaGuitarSample({
        type: "pitched-string",
        stringIndex: 0,
        midi: 67,
      })
    ).not.toBeNull();
    expect(
      selectIowaGuitarSample({
        type: "pitched-string",
        stringIndex: 0,
        midi: 68,
      })
    ).toBeNull();
  });

  test("does not invent a sample for malformed or non-pitched events", () => {
    expect(selectIowaGuitarSample(null)).toBeNull();
    expect(selectIowaGuitarSample({ type: "muted-string", stringIndex: 1 })).toBeNull();
    expect(
      selectIowaGuitarSample({ type: "pitched-string", stringIndex: 9, midi: 64 })
    ).toBeNull();
  });
});

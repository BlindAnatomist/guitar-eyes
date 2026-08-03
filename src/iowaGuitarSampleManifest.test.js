import fs from "fs";
import path from "path";
import {
  IOWA_GUITAR_SAMPLE_MANIFEST,
  MAX_IOWA_SAMPLE_SHIFT_SEMITONES,
  selectIowaGuitarSample,
} from "./iowaGuitarSampleManifest";

describe("Iowa guitar sample manifest", () => {
  test("keeps one licensed, balanced, and hash-locked anchor on each physical guitar string", () => {
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
      expect(entry.derivedBytes).toBeGreaterThan(20000);
      expect(entry.derivedSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.derivedWindowRms).toBeGreaterThanOrEqual(1450);
      expect(entry.postDerivationDefensiblePitch).toBe(true);
      expect(
        Math.abs(entry.postDerivationEstimatedMidi - entry.anchorMidi)
      ).toBeLessThanOrEqual(1);
    });

    const lowE = IOWA_GUITAR_SAMPLE_MANIFEST.find(
      (entry) => entry.stringNumber === 6
    );
    expect(lowE.sourceEstimatedMidi).toBe(40);
    expect(lowE.usedExactEstimatedMidi).toBe(true);
    expect(lowE.postDerivationEstimatedMidi).toBe(40);
  });

  test("matches the public machine-readable 1K derivation lock", () => {
    const lock = JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "public",
          "samples",
          "iowa-guitar",
          "manifest.json"
        ),
        "utf8"
      )
    );

    expect(lock.proofIdentity).toBe(
      "Guitar Eyes Iowa sample integrity and focus proof 1K"
    );
    expect(lock.selectionMethod).toBe(
      "catalog-group-exact-or-defensible-pitch-then-rms-v2"
    );
    expect(lock.normalizationMethod).toBe(
      "35hz-high-pass-max-100ms-rms-v1"
    );
    expect(lock.samples).toHaveLength(6);
    expect(
      lock.samples.map(
        ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          derivedWindowRms,
          postDerivationEstimatedMidi,
          postDerivationDefensiblePitch,
        }) => ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          derivedWindowRms,
          postDerivationEstimatedMidi,
          postDerivationDefensiblePitch,
        })
      )
    ).toEqual(
      IOWA_GUITAR_SAMPLE_MANIFEST.map(
        ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          derivedWindowRms,
          postDerivationEstimatedMidi,
          postDerivationDefensiblePitch,
        }) => ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          derivedWindowRms,
          postDerivationEstimatedMidi,
          postDerivationDefensiblePitch,
        })
      )
    );
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
    expect(
      selectIowaGuitarSample({ type: "muted-string", stringIndex: 1 })
    ).toBeNull();
    expect(
      selectIowaGuitarSample({
        type: "pitched-string",
        stringIndex: 9,
        midi: 64,
      })
    ).toBeNull();
  });
});

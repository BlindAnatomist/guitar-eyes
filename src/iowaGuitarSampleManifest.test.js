import fs from "fs";
import path from "path";
import {
  IOWA_GUITAR_SAMPLE_MANIFEST,
  IOWA_GUITAR_SAMPLE_NORMALIZATION,
  IOWA_GUITAR_SAMPLE_PROOF_IDENTITY,
  IOWA_GUITAR_SAMPLE_SELECTION_METHOD,
  IOWA_GUITAR_SAMPLE_SET_ACTIVE_LOUDNESS_SPREAD_DB,
  MAX_IOWA_SAMPLE_SHIFT_SEMITONES,
  selectIowaGuitarSample,
} from "./iowaGuitarSampleManifest";

describe("Iowa guitar sample manifest", () => {
  test("keeps one licensed and hash-locked anchor on each physical guitar string", () => {
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
      expect(Math.abs(entry.activeRmsDbfs + 30)).toBeLessThanOrEqual(1.25);
      expect(entry.peakDbfs).toBeLessThan(0);
      expect(entry.targetPitchScore).toBeGreaterThanOrEqual(0.45);
      expect(Math.abs(entry.estimatedMidi - entry.anchorMidi)).toBeLessThanOrEqual(1);
    });
  });

  test("matches the public systemic derivation and normalization lock", () => {
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

    expect(lock.schemaVersion).toBe(2);
    expect(lock.proofIdentity).toBe(IOWA_GUITAR_SAMPLE_PROOF_IDENTITY);
    expect(lock.selectionMethod).toBe(IOWA_GUITAR_SAMPLE_SELECTION_METHOD);
    expect(lock.normalization).toEqual(IOWA_GUITAR_SAMPLE_NORMALIZATION);
    expect(lock.setActiveLoudnessSpreadDb).toBe(
      IOWA_GUITAR_SAMPLE_SET_ACTIVE_LOUDNESS_SPREAD_DB
    );
    expect(lock.setActiveLoudnessSpreadDb).toBeLessThanOrEqual(1.75);
    expect(lock.samples).toHaveLength(6);
    expect(
      lock.samples.map(
        ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          activeRmsDbfs,
          peakDbfs,
          targetPitchScore,
          estimatedMidi,
        }) => ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          activeRmsDbfs,
          peakDbfs,
          targetPitchScore,
          estimatedMidi,
        })
      )
    ).toEqual(
      IOWA_GUITAR_SAMPLE_MANIFEST.map(
        ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          activeRmsDbfs,
          peakDbfs,
          targetPitchScore,
          estimatedMidi,
        }) => ({
          derivedFilename,
          derivedBytes,
          derivedSha256,
          activeRmsDbfs,
          peakDbfs,
          targetPitchScore,
          estimatedMidi,
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
    expect(selectIowaGuitarSample({ type: "muted-string", stringIndex: 1 })).toBeNull();
    expect(
      selectIowaGuitarSample({ type: "pitched-string", stringIndex: 9, midi: 64 })
    ).toBeNull();
  });
});

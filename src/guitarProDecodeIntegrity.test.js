import {
  decodeGuitarProScoreWithIntegrity,
  GuitarProDecodeIntegrityError,
} from "./guitarProDecodeIntegrity";

function alphaTabReturning(...scores) {
  const loadScoreFromBytes = jest.fn();
  scores.forEach((score) => loadScoreFromBytes.mockReturnValueOnce(score));
  return {
    Settings: jest.fn(() => ({ proof: true })),
    importer: { ScoreLoader: { loadScoreFromBytes } },
  };
}

const adapt = (score, { versionEvidence }) => ({
  schemaVersion: 1,
  versionEvidence,
  tracks: score.tracks,
});

const evidence = (declaredTrackCount) => ({ declaredTrackCount });

describe("decodeGuitarProScoreWithIntegrity", () => {
  test("decodes once when the decoder agrees with the archive track declaration", () => {
    const alphaTab = alphaTabReturning({ tracks: [{ name: "Guitar" }, { name: "Bass" }] });

    const result = decodeGuitarProScoreWithIntegrity(alphaTab, new Uint8Array([1]), {
      versionEvidence: evidence(2),
      adapt,
    });

    expect(result.tracks).toHaveLength(2);
    expect(alphaTab.importer.ScoreLoader.loadScoreFromBytes).toHaveBeenCalledTimes(1);
  });

  test("retries once when the first decoder result drops a declared track", () => {
    const alphaTab = alphaTabReturning(
      { tracks: [{ name: "Guitar" }] },
      { tracks: [{ name: "Guitar" }, { name: "Bass" }] }
    );

    const result = decodeGuitarProScoreWithIntegrity(alphaTab, new Uint8Array([1]), {
      versionEvidence: evidence(2),
      adapt,
    });

    expect(result.tracks.map((track) => track.name)).toEqual(["Guitar", "Bass"]);
    expect(alphaTab.importer.ScoreLoader.loadScoreFromBytes).toHaveBeenCalledTimes(2);
  });

  test("rejects a persistent mismatch instead of silently auto-loading one track", () => {
    const alphaTab = alphaTabReturning(
      { tracks: [{ name: "Guitar" }] },
      { tracks: [{ name: "Guitar" }] }
    );

    expect(() =>
      decodeGuitarProScoreWithIntegrity(alphaTab, new Uint8Array([1]), {
        versionEvidence: evidence(2),
        adapt,
      })
    ).toThrow(GuitarProDecodeIntegrityError);

    try {
      decodeGuitarProScoreWithIntegrity(
        alphaTabReturning(
          { tracks: [{ name: "Guitar" }] },
          { tracks: [{ name: "Guitar" }] }
        ),
        new Uint8Array([1]),
        { versionEvidence: evidence(2), adapt }
      );
    } catch (error) {
      expect(error.code).toBe("GUITAR_PRO_TRACK_COUNT_MISMATCH");
      expect(error.message).toMatch(/silently dropping a track is unsafe/i);
    }
  });
});

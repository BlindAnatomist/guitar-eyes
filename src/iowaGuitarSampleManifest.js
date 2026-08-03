const IOWA_GUITAR_SAMPLE_DIRECTORY = "samples/iowa-guitar";

export const IOWA_GUITAR_SAMPLE_USAGE = {
  collectionUrl: "https://theremin.music.uiowa.edu/MIS.html",
  guitarCatalogUrl: "https://theremin.music.uiowa.edu/MISguitar.html",
  statement:
    "University of Iowa Electronic Music Studios Musical Instrument Samples recordings may be downloaded and used for projects without restrictions.",
};

export const IOWA_GUITAR_SAMPLE_MANIFEST = [
  {
    stringIndex: 0,
    stringNumber: 1,
    anchorMidi: 64,
    anchorName: "E4",
    sourceFilename: "Guitar.mf.sul_E.E4B4.mono.aif",
    sourceSha256: "3c04d367aa3cdf9fa4c9cd6ba3591704de6da5917a714057b307699d1ed6128b",
    sourceNoteCount: 8,
    sourceTargetOrdinal: 1,
    sourceEstimatedMidi: 64,
    usedExactEstimatedMidi: true,
    derivedFilename: "string-1-e4.wav",
    derivedBytes: 123192,
    derivedSha256: "d17f86142c4bc4b64148be9ae7d4c33163e048322fa056e8ba3066375686b5f4",
    derivedWindowRms: 1799.997407,
    postDerivationEstimatedMidi: 64,
    postDerivationDefensiblePitch: true,
  },
  {
    stringIndex: 1,
    stringNumber: 2,
    anchorMidi: 59,
    anchorName: "B3",
    sourceFilename: "Guitar.mf.sulB.B3.mono.aif",
    sourceSha256: "5afbcddce7bb8a2135232872984a6d2403ff3da1c1daaf03dacb17f29b454489",
    sourceNoteCount: 1,
    sourceTargetOrdinal: 1,
    sourceEstimatedMidi: 58,
    usedExactEstimatedMidi: false,
    derivedFilename: "string-2-b3.wav",
    derivedBytes: 137528,
    derivedSha256: "f41ad07d608965ac7ada2a5d5d5ab0f6733153f177b04fffd0f828731eebee9b",
    derivedWindowRms: 1788.982285,
    postDerivationEstimatedMidi: 58,
    postDerivationDefensiblePitch: true,
  },
  {
    stringIndex: 2,
    stringNumber: 3,
    anchorMidi: 56,
    anchorName: "G-sharp 3",
    sourceFilename: "Guitar.mf.sulG.G3B3.mono.aif",
    sourceSha256: "6e9bcd0b29470ba131aa43d08e51f94b9daaf00a16fff07f52be95196d48bece",
    sourceNoteCount: 5,
    sourceTargetOrdinal: 2,
    sourceEstimatedMidi: 56,
    usedExactEstimatedMidi: true,
    derivedFilename: "string-3-g-sharp3.wav",
    derivedBytes: 69944,
    derivedSha256: "c712aca3f95f23aa598a3238cab4323e3cee4442cd165eff348e17f634910c57",
    derivedWindowRms: 1762.940815,
    postDerivationEstimatedMidi: 55,
    postDerivationDefensiblePitch: true,
  },
  {
    stringIndex: 3,
    stringNumber: 4,
    anchorMidi: 52,
    anchorName: "E3",
    sourceFilename: "Guitar.mf.sulD.D3B3.mono.aif",
    sourceSha256: "464a66a5fbd4c8f835bcddfeb9c875ee2d75e81e156cfe80a362473681c9ffa7",
    sourceNoteCount: 10,
    sourceTargetOrdinal: 3,
    sourceEstimatedMidi: 52,
    usedExactEstimatedMidi: true,
    derivedFilename: "string-4-e3.wav",
    derivedBytes: 150328,
    derivedSha256: "1799871187eeda0b4988b6b42c1da13ee3066d3828fae3e5fc0b828b89ee9267",
    derivedWindowRms: 1800.001549,
    postDerivationEstimatedMidi: 52,
    postDerivationDefensiblePitch: true,
  },
  {
    stringIndex: 4,
    stringNumber: 5,
    anchorMidi: 47,
    anchorName: "B2",
    sourceFilename: "Guitar.mf.sulA.A2B2.mono.aif",
    sourceSha256: "a298fddd7cc2d5e83eb63852360040dc87b63caa1638cf82589f8614e158525c",
    sourceNoteCount: 3,
    sourceTargetOrdinal: 3,
    sourceEstimatedMidi: 47,
    usedExactEstimatedMidi: true,
    derivedFilename: "string-5-b2.wav",
    derivedBytes: 143160,
    derivedSha256: "9a302fa4bffe8dfc8efdc4eee716e7da9822f80aa8d3ac127f428b0b0fe057a6",
    derivedWindowRms: 1799.99282,
    postDerivationEstimatedMidi: 47,
    postDerivationDefensiblePitch: true,
  },
  {
    stringIndex: 5,
    stringNumber: 6,
    anchorMidi: 40,
    anchorName: "E2",
    sourceFilename: "Guitar.mf.sulE.E2B2.mono.aif",
    sourceSha256: "faef0e44dff6fcf99b2bd1cb50ab1ed519980e6c70951069cdbce38597c58b23",
    sourceNoteCount: 8,
    sourceTargetOrdinal: 1,
    sourceEstimatedMidi: 40,
    usedExactEstimatedMidi: true,
    derivedFilename: "string-6-e2.wav",
    derivedBytes: 126776,
    derivedSha256: "af000d72ef69e712143fa2a073b8af51650a1f089228f48998563938a500d102",
    derivedWindowRms: 1799.995302,
    postDerivationEstimatedMidi: 40,
    postDerivationDefensiblePitch: true,
  },
];

const ENTRIES_BY_STRING_INDEX = new Map(
  IOWA_GUITAR_SAMPLE_MANIFEST.map((entry) => [entry.stringIndex, entry])
);

export const MAX_IOWA_SAMPLE_SHIFT_SEMITONES = 3;

function publicBaseUrl() {
  const value = String(process.env.PUBLIC_URL || "").replace(/\/$/, "");
  return value;
}

export function iowaGuitarSampleUrl(entry) {
  if (!entry || !entry.derivedFilename) {
    throw new Error("An Iowa guitar sample entry is required.");
  }
  return `${publicBaseUrl()}/${IOWA_GUITAR_SAMPLE_DIRECTORY}/${entry.derivedFilename}`;
}

export function selectIowaGuitarSample(event) {
  if (
    !event ||
    event.type !== "pitched-string" ||
    !Number.isInteger(event.stringIndex) ||
    !Number.isInteger(event.midi)
  ) {
    return null;
  }

  const entry = ENTRIES_BY_STRING_INDEX.get(event.stringIndex);
  if (!entry) return null;

  const semitoneShift = event.midi - entry.anchorMidi;
  if (Math.abs(semitoneShift) > MAX_IOWA_SAMPLE_SHIFT_SEMITONES) {
    return null;
  }

  return {
    entry,
    semitoneShift,
    playbackRate: 2 ** (semitoneShift / 12),
    url: iowaGuitarSampleUrl(entry),
  };
}

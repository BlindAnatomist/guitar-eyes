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
    sourceTargetOrdinal: 1,
    derivedFilename: "string-1-e4.wav",
  },
  {
    stringIndex: 1,
    stringNumber: 2,
    anchorMidi: 59,
    anchorName: "B3",
    sourceFilename: "Guitar.mf.sulB.B3.mono.aif",
    sourceSha256: "5afbcddce7bb8a2135232872984a6d2403ff3da1c1daaf03dacb17f29b454489",
    sourceTargetOrdinal: 1,
    derivedFilename: "string-2-b3.wav",
  },
  {
    stringIndex: 2,
    stringNumber: 3,
    anchorMidi: 56,
    anchorName: "G-sharp 3",
    sourceFilename: "Guitar.mf.sulG.G3B3.mono.aif",
    sourceSha256: "6e9bcd0b29470ba131aa43d08e51f94b9daaf00a16fff07f52be95196d48bece",
    sourceTargetOrdinal: 2,
    derivedFilename: "string-3-g-sharp3.wav",
  },
  {
    stringIndex: 3,
    stringNumber: 4,
    anchorMidi: 52,
    anchorName: "E3",
    sourceFilename: "Guitar.mf.sulD.D3B3.mono.aif",
    sourceSha256: "464a66a5fbd4c8f835bcddfeb9c875ee2d75e81e156cfe80a362473681c9ffa7",
    sourceTargetOrdinal: 3,
    derivedFilename: "string-4-e3.wav",
  },
  {
    stringIndex: 4,
    stringNumber: 5,
    anchorMidi: 47,
    anchorName: "B2",
    sourceFilename: "Guitar.mf.sulA.A2B2.mono.aif",
    sourceSha256: "a298fddd7cc2d5e83eb63852360040dc87b63caa1638cf82589f8614e158525c",
    sourceTargetOrdinal: 3,
    derivedFilename: "string-5-b2.wav",
  },
  {
    stringIndex: 5,
    stringNumber: 6,
    anchorMidi: 40,
    anchorName: "E2",
    sourceFilename: "Guitar.mf.sulE.E2B2.mono.aif",
    sourceSha256: "faef0e44dff6fcf99b2bd1cb50ab1ed519980e6c70951069cdbce38597c58b23",
    sourceTargetOrdinal: 1,
    derivedFilename: "string-6-e2.wav",
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

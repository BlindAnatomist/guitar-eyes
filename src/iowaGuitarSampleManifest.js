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
    derivedFilename: "string-1-e4.wav",
    derivedBytes: 123192,
    derivedSha256: "171eb3d47ff0cf66a713ede7ad88adbb2865408d1fbf4d2290bb8b4d7f31807c",
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
    derivedFilename: "string-2-b3.wav",
    derivedBytes: 81720,
    derivedSha256: "c4ebccb75a70f5bae1d7d1f2ff0dd2fa2e138e43a957816e8e9f1f26d4d3dab5",
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
    derivedFilename: "string-3-g-sharp3.wav",
    derivedBytes: 69944,
    derivedSha256: "5edab1d772b1c62729beb2e7bb185d05e4410a3038411bc27acf635f70ef3abf",
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
    derivedFilename: "string-4-e3.wav",
    derivedBytes: 114488,
    derivedSha256: "c083b9438e60c9fb31f99b894985ff50da47e9fef6d5b261d69a10310accdffc",
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
    derivedFilename: "string-5-b2.wav",
    derivedBytes: 143160,
    derivedSha256: "8e1b25ac7bc3902383396119a94ee3ee442ecd54b5052294f8d03d4336f54ec4",
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
    derivedFilename: "string-6-e2.wav",
    derivedBytes: 165176,
    derivedSha256: "3f549ab4210bd5901ccbd43bff34d981cd679450e6dc7d3d734577a0ee27a683",
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

import {
  collectTabStringLineRuns,
  containsPlayableAsciiNotation,
} from "./tabStringLine";

const FORMAT_DEFINITIONS = {
  "ascii-text": {
    id: "ascii-text",
    label: "ASCII text tablature",
    support: "supported",
    isText: true,
  },
  musicxml: {
    id: "musicxml",
    label: "MusicXML tablature",
    support: "supported",
    isText: true,
  },
  "compressed-musicxml": {
    id: "compressed-musicxml",
    label: "compressed MusicXML",
    support: "supported",
    isText: false,
  },
  "guitar-pro-proof": {
    id: "guitar-pro-proof",
    label: "Guitar Pro tablature",
    support: "checkpoint-foundation",
    isText: false,
  },
  "guitar-pro-2": {
    id: "guitar-pro-2",
    label: "Guitar Pro 2 tablature",
    support: "planned",
    isText: false,
  },
  "powertab-pt2": {
    id: "powertab-pt2",
    label: "PowerTab 2 tablature",
    support: "supported",
    isText: false,
  },
  "powertab-legacy": {
    id: "powertab-legacy",
    label: "legacy PowerTab tablature",
    support: "source-checkpoint-provisional",
    isText: false,
  },
  tuxguitar: {
    id: "tuxguitar",
    label: "TuxGuitar tablature",
    support: "source-checkpoint-provisional",
    isText: false,
  },
  tabledit: {
    id: "tabledit",
    label: "TablEdit tablature",
    support: "planned",
    isText: false,
  },
  unknown: {
    id: "unknown",
    label: "unknown tablature format",
    support: "unknown",
    isText: true,
  },
};

const EXTENSION_FORMATS = new Map([
  ["txt", { id: "ascii-text" }],
  ["tab", { id: "ascii-text" }],
  ["musicxml", { id: "musicxml" }],
  ["xml", { id: "musicxml" }],
  ["mxl", { id: "compressed-musicxml" }],
  [
    "gp3",
    {
      id: "guitar-pro-proof",
      label: "Guitar Pro 3 tablature",
      sourceFamily: "GP3",
    },
  ],
  [
    "gp4",
    {
      id: "guitar-pro-proof",
      label: "Guitar Pro 4 tablature",
      sourceFamily: "GP4",
    },
  ],
  [
    "gp5",
    {
      id: "guitar-pro-proof",
      label: "Guitar Pro 5 tablature",
      sourceFamily: "GP5",
    },
  ],
  [
    "gpx",
    {
      id: "guitar-pro-proof",
      label: "Guitar Pro 6 tablature",
      sourceFamily: "GP6",
    },
  ],
  [
    "gp",
    {
      id: "guitar-pro-proof",
      label: "Guitar Pro 7 or 8 tablature",
      sourceFamily: "GP7_OR_GP8",
    },
  ],
  ["gtp", { id: "guitar-pro-2" }],
  [
    "ptb",
    {
      id: "powertab-legacy",
      label: "legacy PowerTab tablature",
      sourceFamily: "PTB_LEGACY",
    },
  ],
  [
    "pt2",
    {
      id: "powertab-pt2",
      label: "PowerTab 2 tablature",
      sourceFamily: "PT2",
    },
  ],
  [
    "tg",
    {
      id: "tuxguitar",
      label: "TuxGuitar tablature",
      sourceFamily: "TG",
    },
  ],
  ["tef", { id: "tabledit" }],
]);

function definition(id, overrides = {}) {
  return { ...FORMAT_DEFINITIONS[id], ...overrides };
}

function extensionFromName(fileName) {
  const normalized = String(fileName || "").trim().toLowerCase();
  const finalDot = normalized.lastIndexOf(".");
  return finalDot >= 0 ? normalized.slice(finalDot + 1) : "";
}

function hasAsciiTabRun(sourceText) {
  const { runs } = collectTabStringLineRuns(sourceText);
  return runs.some(
    (run) =>
      run.length >= 4 &&
      run.some((entry) => containsPlayableAsciiNotation(entry.content))
  );
}

function looksLikeMusicXml(sourceText) {
  const text = String(sourceText || "");
  return (
    /<score-(?:partwise|timewise)\b/i.test(text) &&
    /<(?:fret|string)>/i.test(text)
  );
}

export function detectTabFileFormat(fileName, sourceText = "") {
  if (sourceText) {
    if (looksLikeMusicXml(sourceText)) return definition("musicxml");
    if (hasAsciiTabRun(sourceText)) return definition("ascii-text");
  }

  const extension = extensionFromName(fileName);
  const extensionFormat = EXTENSION_FORMATS.get(extension);
  return extensionFormat
    ? definition(extensionFormat.id, {
        ...extensionFormat,
        extension: extension ? `.${extension}` : "",
      })
    : definition("unknown");
}

export function shouldReadTabFileAsText(format) {
  return format?.isText !== false;
}

export function unsupportedTabFormatMessage(format) {
  switch (format?.id) {
    case "compressed-musicxml":
      return "The compressed MusicXML file could not be imported. Guitar Eyes requires a valid .mxl ZIP container whose META-INF/container.xml identifies a supported MusicXML tablature score.";
    case "guitar-pro-proof":
      return "The Guitar Pro file could not be imported. Guitar Eyes requires valid GP3, GP4, GP5, GP6 GPX, or supported GP7/GP8 internal version evidence plus a tablature track that preserves string, fret, and duration identity.";
    case "guitar-pro-2":
      return "A Guitar Pro 2 .gtp file was recognized. Guitar Eyes does not import GP2 files; support requires a separate lawful fixture and version-specific decoder evidence.";
    case "powertab-pt2":
      return "The PowerTab 2 file could not be imported. Guitar Eyes requires valid supported .pt2 internal-version evidence: internal versions 1 through 11 have bounded six-string guitar profiles, and only internal version 11 supports exact standard four-string bass in high-to-low tuning G2, D2, A1, E1. String, fret, tuning, measure, and duration identity must be preserved; other structures remain unsupported.";
    case "powertab-legacy":
      return "The legacy PowerTab file could not be imported. Guitar Eyes requires exact ptab file-version values 1 through 4: PowerTab 1.0, 1.0.2, 1.5, and 1.7 respectively. Each has bounded six-string guitar and exact standard four-string bass profiles, with bass tuning G2, D2, A1, E1 from highest to lowest. Recognizing the file does not establish that its musical structures are supported; unsupported structures are rejected rather than guessed.";
    case "tuxguitar":
      return "The TuxGuitar file could not be imported. Guitar Eyes supports exact legacy .tg generations 1.0, 1.1, 1.2, 1.3, and 1.5 plus modern native file format 2.0.0 within bounded six-string guitar and exact standard four-string bass profiles, with bass tuning G2, D2, A1, E1 from highest to lowest. Native 0.7, 0.8, and 0.9 remain unsupported, and no native 1.4 route is inferred. Recognizing the file does not establish that its musical structures are supported; unsupported structures are rejected rather than guessed.";
    case "tabledit":
      return "A TablEdit file was recognized. Guitar Eyes does not yet import .tef files; owner-performed conversion remains the current route.";
    default:
      return "Guitar Eyes could not identify this file as a supported tablature format.";
  }
}

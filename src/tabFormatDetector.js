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
    label: "PowerTab 1.7 tablature",
    support: "source-checkpoint-provisional",
    isText: false,
  },
  tuxguitar: {
    id: "tuxguitar",
    label: "TuxGuitar tablature",
    support: "planned",
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
      label: "PowerTab 1.7 tablature",
      sourceFamily: "PTB_V17",
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
  ["tg", { id: "tuxguitar" }],
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
      return "The PowerTab 2 file could not be imported. Guitar Eyes requires a valid gzip-compressed .pt2 document with exact internal version 11, explicit player assignments, and preserved string, fret, tuning, measure, and duration identity.";
    case "powertab-legacy":
      return "The legacy PowerTab file could not be imported. This checkpoint accepts exact PowerTab 1.7 ptab-4 .ptb song files only, within the bounded six-string guitar, standard-tuning, simple 4/4 profile proven by the project fixture.";
    case "tuxguitar":
      return "A TuxGuitar file was recognized. Guitar Eyes does not yet import .tg files; TuxGuitar remains an external conversion route rather than a browser dependency.";
    case "tabledit":
      return "A TablEdit file was recognized. Guitar Eyes does not yet import .tef files; owner-performed conversion remains the current route.";
    default:
      return "Guitar Eyes could not identify this file as supported ASCII tablature, supported MusicXML tablature, an authorized Guitar Pro family, accepted PowerTab 2 version 11, or provisional PowerTab 1.7 legacy input.";
  }
}

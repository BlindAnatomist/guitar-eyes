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
    label: "Guitar Pro .gp checkpoint file",
    support: "checkpoint-proof",
    isText: false,
  },
  "guitar-pro-legacy": {
    id: "guitar-pro-legacy",
    label: "Guitar Pro tablature",
    support: "planned",
    isText: false,
  },
  powertab: {
    id: "powertab",
    label: "PowerTab tablature",
    support: "planned",
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
  ["txt", "ascii-text"],
  ["tab", "ascii-text"],
  ["musicxml", "musicxml"],
  ["xml", "musicxml"],
  ["mxl", "compressed-musicxml"],
  ["gp", "guitar-pro-proof"],
  ["gtp", "guitar-pro-legacy"],
  ["gp3", "guitar-pro-legacy"],
  ["gp4", "guitar-pro-legacy"],
  ["gp5", "guitar-pro-legacy"],
  ["gpx", "guitar-pro-legacy"],
  ["ptb", "powertab"],
  ["pt2", "powertab"],
  ["tg", "tuxguitar"],
  ["tef", "tabledit"],
]);

function definition(id) {
  return { ...FORMAT_DEFINITIONS[id] };
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
  return /<score-(?:partwise|timewise)\b/i.test(text) && /<(?:fret|string)>/i.test(text);
}

export function detectTabFileFormat(fileName, sourceText = "") {
  if (sourceText) {
    if (looksLikeMusicXml(sourceText)) return definition("musicxml");
    if (hasAsciiTabRun(sourceText)) return definition("ascii-text");
  }

  const extension = extensionFromName(fileName);
  const extensionFormat = EXTENSION_FORMATS.get(extension);
  return definition(extensionFormat || "unknown");
}

export function shouldReadTabFileAsText(format) {
  return format?.isText !== false;
}

export function unsupportedTabFormatMessage(format) {
  switch (format?.id) {
    case "compressed-musicxml":
      return "The compressed MusicXML file could not be imported. Guitar Eyes requires a valid .mxl ZIP container whose META-INF/container.xml identifies a supported MusicXML tablature score.";
    case "guitar-pro-proof":
      return "A Guitar Pro .gp archive was recognized. This branch contains an unhosted project-fixture proof only; general Guitar Pro shared-archive support has not yet been accepted.";
    case "guitar-pro-legacy":
      return "A Guitar Pro tablature file was recognized. Guitar Eyes does not yet import this Guitar Pro version; direct support requires an original, public-domain, or clearly licensed fixture and version-specific evidence.";
    case "powertab":
      return "A PowerTab file was recognized. Guitar Eyes does not yet import PowerTab files; support requires a separately verified parser or owner-performed conversion.";
    case "tuxguitar":
      return "A TuxGuitar file was recognized. Guitar Eyes does not yet import .tg files; TuxGuitar remains an external conversion route rather than a browser dependency.";
    case "tabledit":
      return "A TablEdit file was recognized. Guitar Eyes does not yet import .tef files; owner-performed conversion remains the current route.";
    default:
      return "Guitar Eyes could not identify this file as supported ASCII tablature, supported MusicXML tablature, or an authorized checkpoint fixture.";
  }
}

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
    support: "planned",
    isText: true,
  },
  "compressed-musicxml": {
    id: "compressed-musicxml",
    label: "compressed MusicXML",
    support: "planned",
    isText: false,
  },
  "guitar-pro": {
    id: "guitar-pro",
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
  ["gtp", "guitar-pro"],
  ["gp3", "guitar-pro"],
  ["gp4", "guitar-pro"],
  ["gp5", "guitar-pro"],
  ["gpx", "guitar-pro"],
  ["gp", "guitar-pro"],
  ["ptb", "powertab"],
  ["pt2", "powertab"],
  ["tg", "tuxguitar"],
  ["tef", "tabledit"],
]);

const STRING_LINE_PATTERN = /^\s*[A-Ga-g](?:#|b)?\s*\|/;

function definition(id) {
  return { ...FORMAT_DEFINITIONS[id] };
}

function extensionFromName(fileName) {
  const normalized = String(fileName || "").trim().toLowerCase();
  const finalDot = normalized.lastIndexOf(".");
  return finalDot >= 0 ? normalized.slice(finalDot + 1) : "";
}

function hasAsciiTabRun(sourceText) {
  const lines = String(sourceText || "").replace(/\r\n?/g, "\n").split("\n");
  let currentRun = 0;
  let longestRun = 0;

  lines.forEach((line) => {
    if (STRING_LINE_PATTERN.test(line)) {
      currentRun += 1;
      longestRun = Math.max(longestRun, currentRun);
    } else if (line.trim().length === 0) {
      return;
    } else {
      currentRun = 0;
    }
  });

  return longestRun >= 4;
}

function looksLikeMusicXml(sourceText) {
  const text = String(sourceText || "");
  return /<score-(?:partwise|timewise)\b/i.test(text) && /<(?:fret|string)>/i.test(text);
}

export function detectTabFileFormat(fileName, sourceText = "") {
  if (sourceText) {
    if (looksLikeMusicXml(sourceText)) {
      return definition("musicxml");
    }

    if (hasAsciiTabRun(sourceText)) {
      return definition("ascii-text");
    }
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
    case "musicxml":
      return "MusicXML tablature was recognized. Guitar Eyes does not yet import MusicXML, but this structured format is now part of the planned import corpus.";
    case "compressed-musicxml":
      return "Compressed MusicXML was recognized. Guitar Eyes does not yet import .mxl files, but this structured format is now part of the planned import corpus.";
    case "guitar-pro":
      return "A Guitar Pro tablature file was recognized. Guitar Eyes does not yet import Guitar Pro files; support is planned through a verified structured importer.";
    case "powertab":
      return "A PowerTab file was recognized. Guitar Eyes does not yet import PowerTab files; support is planned through a verified structured importer.";
    case "tuxguitar":
      return "A TuxGuitar file was recognized. Guitar Eyes does not yet import .tg files; support is part of the structured-import plan.";
    case "tabledit":
      return "A TablEdit file was recognized. Guitar Eyes does not yet import .tef files; support is part of the structured-import plan.";
    default:
      return "Guitar Eyes could not identify this file as supported ASCII tablature or as a recognized structured tablature format.";
  }
}

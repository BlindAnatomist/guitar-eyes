import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";

const LEGACY_POWERTAB_SOURCE_VERSIONS = new Set([
  "PTB_V10",
  "PTB_V102",
  "PTB_V15",
  "PTB_V17",
]);

function isModernPowerTabSourceVersion(sourceVersion) {
  return /^PT2_V(?:[1-9]|1[01])$/u.test(String(sourceVersion || ""));
}

function powerTabRequestKind(file, options) {
  const fileName = String(file?.name || "");
  const sourceVersion = options?.intermediate?.sourceVersion;
  if (
    /\.ptb$/iu.test(fileName) ||
    LEGACY_POWERTAB_SOURCE_VERSIONS.has(sourceVersion)
  ) {
    return "legacy";
  }
  if (/\.pt2$/iu.test(fileName) || isModernPowerTabSourceVersion(sourceVersion)) {
    return "modern";
  }
  return null;
}

function isTuxGuitarRequest(file, options) {
  const fileName = String(file?.name || "");
  const sourceVersion = String(options?.intermediate?.sourceVersion || "");
  return /\.tg$/iu.test(fileName) || sourceVersion.startsWith("TG_");
}

async function buildPowerTabReaderDocuments(file, options, kind) {
  if (kind === "legacy") {
    const module = await import("./powerTabLegacyReaderDocuments");
    return module.buildPowerTabLegacyReaderDocuments(file, options);
  }
  const module = await import("./powerTabReaderDocuments");
  return module.buildPowerTabReaderDocuments(file, options);
}

async function buildTuxGuitarReaderDocuments(file, options) {
  const module = await import("./tuxGuitarReaderDocuments");
  return Object.keys(options).length === 0
    ? module.buildTuxGuitarReaderDocuments(file)
    : module.buildTuxGuitarReaderDocuments(file, options);
}

function withSelectionIntermediate(readerDocuments) {
  if (!readerDocuments?.requiresTrackSelection) return readerDocuments;

  return {
    ...readerDocuments,
    selectionIntermediate:
      readerDocuments.powerTabIntermediate ||
      readerDocuments.tuxGuitarIntermediate ||
      readerDocuments.guitarProIntermediate ||
      null,
  };
}

export async function buildStructuredTabReaderDocuments(file, options = {}) {
  let readerDocuments;
  const powerTabKind = powerTabRequestKind(file, options);
  if (powerTabKind) {
    readerDocuments = await buildPowerTabReaderDocuments(
      file,
      options,
      powerTabKind
    );
  } else if (isTuxGuitarRequest(file, options)) {
    readerDocuments = await buildTuxGuitarReaderDocuments(file, options);
  } else {
    readerDocuments =
      Object.keys(options).length === 0
        ? await buildGuitarProReaderDocuments(file)
        : await buildGuitarProReaderDocuments(file, options);
  }

  return withSelectionIntermediate(readerDocuments);
}

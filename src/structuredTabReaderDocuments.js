import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";

function powerTabRequestKind(file, options) {
  const fileName = String(file?.name || "");
  const sourceVersion = options?.intermediate?.sourceVersion;
  if (/\.ptb$/iu.test(fileName) || sourceVersion === "PTB_V17") {
    return "legacy";
  }
  if (/\.pt2$/iu.test(fileName) || sourceVersion === "PT2_V11") {
    return "modern";
  }
  return null;
}

async function buildPowerTabReaderDocuments(file, options, kind) {
  if (kind === "legacy") {
    const module = await import("./powerTabLegacyReaderDocuments");
    return module.buildPowerTabLegacyReaderDocuments(file, options);
  }
  const module = await import("./powerTabReaderDocuments");
  return module.buildPowerTabReaderDocuments(file, options);
}

function withSelectionIntermediate(readerDocuments) {
  if (!readerDocuments?.requiresTrackSelection) return readerDocuments;

  return {
    ...readerDocuments,
    selectionIntermediate:
      readerDocuments.powerTabIntermediate ||
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
  } else {
    readerDocuments =
      Object.keys(options).length === 0
        ? await buildGuitarProReaderDocuments(file)
        : await buildGuitarProReaderDocuments(file, options);
  }

  return withSelectionIntermediate(readerDocuments);
}

import { buildGuitarProReaderDocuments } from "./guitarProReaderDocuments";

function isPowerTabRequest(file, options) {
  return (
    /\.pt2$/iu.test(String(file?.name || "")) ||
    options?.intermediate?.sourceVersion === "PT2_V11"
  );
}

async function buildPowerTabReaderDocuments(file, options) {
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
  if (isPowerTabRequest(file, options)) {
    readerDocuments = await buildPowerTabReaderDocuments(file, options);
  } else {
    readerDocuments =
      Object.keys(options).length === 0
        ? await buildGuitarProReaderDocuments(file)
        : await buildGuitarProReaderDocuments(file, options);
  }

  return withSelectionIntermediate(readerDocuments);
}

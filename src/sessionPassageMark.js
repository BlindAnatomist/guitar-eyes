import { useEffect, useState } from "react";

// These references are deliberately valid only for this loaded document.
// Filenames, optional position IDs and display labels are not return identities.
export function createSessionPassageMark(document, index) {
  if (
    document?.type !== "tablature-document" ||
    !Array.isArray(document.positions) ||
    !Number.isSafeInteger(index) || index < 0 ||
    document.positions?.[index]?.index !== index
  ) {
    return null;
  }
  return { document, index, position: document.positions[index] };
}

export function resolveSessionPassageMark(document, mark) {
  if (!mark || mark.document !== document) return null;
  const candidate = createSessionPassageMark(document, mark.index);
  return candidate && candidate.position === mark.position ? mark.index : null;
}

export function useSessionPassageMark(document) {
  const [mark, setMark] = useState(null);
  useEffect(() => { setMark(null); }, [document]);
  return {
    mark,
    markPosition: (index) => setMark(createSessionPassageMark(document, index)),
    clear: () => setMark(null),
  };
}

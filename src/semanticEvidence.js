// Source-boundary numeric parsing: absence is never numeric zero.
export function integerEvidence(value) {
  if (typeof value === "number") return Number.isSafeInteger(value) ? value : null;
  if (typeof value !== "string" || !/^-?\d+$/.test(value.trim())) return null;
  const number = Number(value.trim());
  return Number.isSafeInteger(number) ? number : null;
}

export function verifiedStandardInstrument(tuning) {
  if (!Array.isArray(tuning)) return null;
  const profiles = [
    ["guitar", [64, 59, 55, 50, 45, 40]],
    ["bass", [43, 38, 33, 28]],
  ];
  return profiles.find(([, pitches]) => pitches.length === tuning.length &&
    pitches.every((pitch, index) => tuning[index] === pitch))?.[0] || null;
}

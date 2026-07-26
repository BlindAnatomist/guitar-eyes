export function describeNavigationLocation(document, positionIndex) {
  const position = document?.positions?.[positionIndex];
  if (!position) return "No tablature position is available.";

  const parts = [];
  if (document.blocks.length > 1) {
    parts.push(`Tablature block ${position.blockIndex + 1} of ${document.blocks.length}.`);
  }

  parts.push(
    `Measure ${position.measureNumber}, position ${position.measurePositionNumber} of ${position.measurePositionTotal}.`
  );
  parts.push(`Overall position ${position.index + 1} of ${document.positions.length}.`);

  return parts.join(" ");
}

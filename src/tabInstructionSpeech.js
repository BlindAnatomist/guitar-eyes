export function describeWhatToPlay(document, position) {
  const stringById = new Map(document.strings.map((string) => [string.id, string]));
  const instructions = [];

  [...position.strings].reverse().forEach((state) => {
    const string = stringById.get(state.stringId);
    if (!string) return;

    switch (state.type) {
      case "fret":
        instructions.push(`${string.spokenName}, fret ${state.fret}`);
        break;
      case "open":
        instructions.push(`${string.spokenName}, open`);
        break;
      case "technique":
        instructions.push(`${string.spokenName}, ${state.name} symbol`);
        break;
      case "unsupported":
        instructions.push(`${string.spokenName}, unrecognized symbol`);
        break;
      case "continuation":
        instructions.push(`${string.spokenName}, hold fret ${state.fret}`);
        break;
      default:
        break;
    }
  });

  if (instructions.length === 0) return "Rest. Play nothing.";
  if (instructions.length === 1) return `Play ${instructions[0]}.`;
  return `Play together: ${instructions.join("; ")}.`;
}

export function describeLocation(document, position) {
  return `Measure ${position.measureNumber} of ${document.measures.length}. Step ${position.positionInMeasure} of ${position.positionsInMeasure}.`;
}

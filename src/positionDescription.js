function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function techniquePhrase(techniques) {
  if (!techniques || techniques.length === 0) return "";
  return `, with ${formatList(
    techniques.map((technique) => technique.name)
  )} notation preserved but not yet interpreted`;
}

export function describePlayablePosition(document, positionIndex) {
  const position = document?.positions?.[positionIndex];

  if (!position) {
    return "No tablature position is available.";
  }

  const stringById = new Map(document.strings.map((string) => [string.id, string]));
  const playableDescriptions = [];

  [...position.strings].reverse().forEach((state) => {
    const string = stringById.get(state.stringId);

    if (!string) {
      return;
    }

    switch (state.type) {
      case "fret":
        playableDescriptions.push(
          `${string.spokenName}, fret ${state.fret}${techniquePhrase(state.techniques)}.`
        );
        break;
      case "open":
        playableDescriptions.push(
          `${string.spokenName}, open${techniquePhrase(state.techniques)}.`
        );
        break;
      case "technique":
        playableDescriptions.push(
          `${string.spokenName}, ${state.name} notation preserved but not yet interpreted.`
        );
        break;
      case "continuation":
        playableDescriptions.push(
          `${string.spokenName}, continuation of fret ${state.fret}.`
        );
        break;
      default:
        break;
    }
  });

  const parts = [];

  if (document.blocks.length > 1) {
    parts.push(`Block ${position.blockNumber} of ${document.blocks.length}.`);
  }

  if (position.measureNumber) {
    parts.push(
      document.blocks.length > 1
        ? `Measure ${position.measureNumber} of ${position.measureCountInBlock} in this block.`
        : `Measure ${position.measureNumber} of ${position.measureCountInBlock}.`
    );
    parts.push(
      `Position ${position.positionInMeasure} of ${position.positionsInMeasure} in this measure.`
    );
  } else if (document.blocks.length > 1) {
    parts.push(
      `Position ${position.positionInBlock} of ${position.positionsInBlock} in this block.`
    );
  } else {
    parts.push(`Position ${position.number} of ${position.total}.`);
  }

  if (position.duration?.name) {
    parts.push(`Duration, ${position.duration.name}.`);
  }

  parts.push(...playableDescriptions);
  return parts.join(" ");
}

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
        playableDescriptions.push(`${string.spokenName}, fret ${state.fret}.`);
        break;
      case "open":
        playableDescriptions.push(`${string.spokenName}, open.`);
        break;
      case "technique":
        playableDescriptions.push(
          `${string.spokenName}, ${state.name} notation preserved but not yet interpreted.`
        );
        break;
      case "unsupported":
        playableDescriptions.push(
          `${string.spokenName}, notation at this position cannot yet be interpreted.`
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

  const parts =
    document.blocks.length > 1
      ? [
          `Block ${position.blockNumber} of ${document.blocks.length}.`,
          `Position ${position.positionInBlock} of ${position.positionsInBlock} in this block.`,
        ]
      : [`Position ${position.number} of ${position.total}.`];

  if (position.duration?.name) {
    parts.push(`Duration, ${position.duration.name}.`);
  }

  parts.push(...playableDescriptions);
  return parts.join(" ");
}

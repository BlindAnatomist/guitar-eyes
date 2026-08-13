export function verifyV11Template(v11, source) {
  if (v11.version !== 11 || v11.score?.score_info?.song_data?.title !== source.title) {
    throw new Error("The PowerTab v11 bass template identity contradicts the canonical source.");
  }
  const player = v11.score?.players?.[0];
  const staff = v11.score?.systems?.[0]?.staves?.[0];
  const positions = staff?.voices?.["0"]?.positions;
  if (
    v11.score?.players?.length !== 1 ||
    v11.score?.systems?.length !== 1 ||
    staff?.clef_type !== "Bass" ||
    staff?.string_count !== 4 ||
    JSON.stringify(player?.tuning?.notes) !== JSON.stringify(source.tuningMidiHighToLow) ||
    !Array.isArray(positions) ||
    positions.length !== source.positions.length
  ) {
    throw new Error("The PowerTab v11 bass template structure contradicts the canonical source.");
  }
  source.positions.forEach((expected, index) => {
    const actual = positions[index];
    const expectedDuration = expected.duration === 4 ? "Quarter" : expected.duration === 8 ? "Eighth" : "Half";
    const expectedNotes = expected.notes.map((note) => ({ string: note.stringIndexHighToLow, fret: note.fret }));
    const actualNotes = actual.notes.map((note) => ({ string: note.string, fret: note.fret }));
    const expectedProperties = expected.rest ? ["Rest"] : expected.coordinate === 40 ? ["PalmMuting"] : [];
    if (
      actual.position !== expected.coordinate ||
      actual.duration !== expectedDuration ||
      JSON.stringify(actualNotes) !== JSON.stringify(expectedNotes) ||
      JSON.stringify(actual.properties) !== JSON.stringify(expectedProperties)
    ) {
      throw new Error(`The PowerTab v11 bass template position ${index + 1} contradicts the canonical source.`);
    }
  });
}

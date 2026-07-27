function techniqueNamesForNote(note) {
  const techniques = [];

  if (note?.isHammerPullOrigin) {
    const destination = note.hammerPullDestination;
    techniques.push(
      destination && Number.isFinite(destination.fret) && destination.fret < note.fret
        ? "pull-off"
        : "hammer-on"
    );
  }
  if ((note?.slideInType ?? 0) !== 0 || (note?.slideOutType ?? 0) !== 0) {
    techniques.push("slide");
  }
  if (note?.hasBend) techniques.push("bend");
  if ((note?.vibrato ?? 0) !== 0) techniques.push("vibrato");
  if (note?.isLetRing) techniques.push("let ring");
  if (note?.isPalmMute) techniques.push("palm mute");
  if (note?.isLeftHandTapped) techniques.push("tap");
  if (note?.isHarmonic) techniques.push("harmonic");

  return [...new Set(techniques)];
}

function techniqueNamesForBeat(beat) {
  const techniques = [];
  if (beat?.tap) techniques.push("tap");
  if (beat?.slap) techniques.push("slap");
  if (beat?.pop) techniques.push("pop");
  return techniques;
}

function noteToIntermediate(note) {
  return {
    stringNumberLowToHigh: Number(note?.string),
    fret: Number(note?.fret),
    visible: note?.isVisible !== false,
    isDead: Boolean(note?.isDead),
    techniques: techniqueNamesForNote(note),
  };
}

function beatToIntermediate(beat) {
  return {
    startTicks: Number(beat?.absoluteDisplayStart),
    displayDurationTicks: Number(beat?.displayDuration),
    durationDenominator: Number(beat?.duration),
    dots: Number(beat?.dots ?? 0),
    tupletNumerator: Number(beat?.tupletNumerator ?? -1),
    tupletDenominator: Number(beat?.tupletDenominator ?? -1),
    graceType: (beat?.graceType ?? 0) === 0 ? "none" : "unsupported",
    isRest: Boolean(beat?.isRest),
    techniques: techniqueNamesForBeat(beat),
    notes: Array.from(beat?.notes || [], noteToIntermediate),
  };
}

function voiceToIntermediate(voice) {
  return {
    index: Number(voice?.index ?? 0),
    beats: Array.from(voice?.beats || [], beatToIntermediate),
  };
}

function barToIntermediate(bar, index) {
  const masterBar = bar?.masterBar || {};
  return {
    sourceNumber: Number(masterBar.index ?? index) + 1,
    timeSignatureNumerator: Number(masterBar.timeSignatureNumerator ?? 0),
    timeSignatureDenominator: Number(masterBar.timeSignatureDenominator ?? 0),
    repeatStart: Boolean(masterBar.isRepeatStart),
    repeatCount: Number(masterBar.repeatCount ?? 0),
    alternateEndings: Number(masterBar.alternateEndings ?? 0),
    voices: Array.from(bar?.voices || [], voiceToIntermediate),
  };
}

function staffToIntermediate(staff) {
  return {
    tuningMidiHighToLow: Array.from(staff?.tuning || [], Number),
    bars: Array.from(staff?.bars || [], barToIntermediate),
  };
}

function trackToIntermediate(track) {
  return {
    name: String(track?.name || ""),
    shortName: String(track?.shortName || ""),
    isPercussion: Boolean(track?.isPercussion),
    staves: Array.from(track?.staves || [], staffToIntermediate),
  };
}

function serializeVersionEvidence(versionEvidence) {
  if (!versionEvidence) return null;

  const serialized = {
    schemaVersion: Number(versionEvidence.schemaVersion),
    archiveFamily: String(versionEvidence.archiveFamily),
    rootVersion: String(versionEvidence.rootVersion),
    gpVersion: String(versionEvidence.gpVersion),
    encodingDescription: String(versionEvidence.encodingDescription),
    sourceVersion: String(versionEvidence.sourceVersion),
    entryCount: Number(versionEvidence.entryCount),
  };

  if (Number.isInteger(versionEvidence.declaredTrackCount)) {
    serialized.declaredTrackCount = versionEvidence.declaredTrackCount;
  }

  return serialized;
}

export function alphaTabScoreToGuitarProIntermediate(
  score,
  { versionEvidence } = {}
) {
  return {
    schemaVersion: 1,
    sourceVersion: String(versionEvidence?.sourceVersion || ""),
    versionEvidence: serializeVersionEvidence(versionEvidence),
    title: String(score?.title || score?.subTitle || "Guitar Pro tablature"),
    tracks: Array.from(score?.tracks || [], trackToIntermediate),
  };
}

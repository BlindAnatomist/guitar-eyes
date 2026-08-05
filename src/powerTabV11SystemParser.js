import { parseVoices } from "./powerTabV11PositionParser";
import { assignmentsForSystem, parseBarlines } from "./powerTabV11SystemStructure";
import {
  TICKS_PER_QUARTER,
  fail,
  parsePlayer,
  requireArray,
  requireInteger,
  requireObject,
  requireOptionalArray,
  requireString,
} from "./powerTabV11Schema";

function durationTicks(position) {
  const base = (4 * TICKS_PER_QUARTER) / position.durationDenominator;
  const dotFactor = position.dots === 0 ? 1 : position.dots === 1 ? 1.5 : 1.75;
  const ticks = base * dotFactor;
  if (!Number.isInteger(ticks)) {
    fail(
      "A PowerTab duration could not be represented on the bounded semantic timeline.",
      "UNREPRESENTABLE_POWERTAB_DURATION"
    );
  }
  return ticks;
}

function measureTicks(barline, context, measureIndex) {
  const ticks =
    barline.numerator *
    ((4 * TICKS_PER_QUARTER) / barline.denominator);
  if (!Number.isInteger(ticks) || ticks <= 0) {
    fail(
      `${context}, measure ${measureIndex + 1} has an unrepresentable time signature.`,
      "UNREPRESENTABLE_POWERTAB_TIME_SIGNATURE"
    );
  }
  return ticks;
}

function splitVoiceIntoBars(
  voice,
  barlines,
  context,
  measureStartTicks
) {
  const firstPosition = barlines[0].position;
  const finalPosition = barlines[barlines.length - 1].position;
  const outside = voice.positions.find(
    (position) =>
      position.sourcePosition < firstPosition ||
      position.sourcePosition >= finalPosition
  );
  if (outside) {
    fail(
      `${context}, voice ${voice.index + 1} contains a position outside the bounded barline range.`,
      "POWERTAB_POSITION_OUTSIDE_MEASURE"
    );
  }

  return barlines.slice(0, -1).map((barline, measureIndex) => {
    const next = barlines[measureIndex + 1];
    const positions = voice.positions.filter(
      (position) =>
        position.sourcePosition >= barline.position &&
        position.sourcePosition < next.position
    );
    let relativeTicks = 0;
    const beats = positions.map((position) => {
      const beat = {
        ...position,
        startTicks: measureStartTicks[measureIndex] + relativeTicks,
      };
      relativeTicks += durationTicks(position);
      return beat;
    });
    const availableTicks = measureTicks(barline, context, measureIndex);
    if (relativeTicks > availableTicks) {
      fail(
        `${context}, voice ${voice.index + 1}, measure ${measureIndex + 1} contains durations beyond the declared time signature.`,
        "POWERTAB_MEASURE_DURATION_OVERFLOW"
      );
    }
    return {
      index: voice.index,
      beats,
    };
  });
}

function parseStaff(staff, staffIndex, systemIndex, player) {
  const context = `System ${systemIndex + 1}, staff ${staffIndex + 1}`;
  const value = requireObject(staff, context);
  const stringCount = requireInteger(
    value.string_count,
    `${context} string count`,
    3,
    8
  );
  if (stringCount !== player.tuningMidiHighToLow.length) {
    fail(
      `${context} reports ${stringCount} strings while ${player.description} reports ${player.tuningMidiHighToLow.length} tuning pitches.`,
      "CONTRADICTORY_POWERTAB_STRING_COUNT"
    );
  }
  const clef = requireString(value.clef_type, `${context} clef type`);
  if (!new Set(["Treble", "Bass"]).has(clef)) {
    fail(`${context} contains unsupported clef type ${clef}.`);
  }
  if (requireOptionalArray(value.dynamics, `${context} dynamics`).length > 0) {
    fail(
      `${context} contains dynamics outside the bounded v11 profile.`,
      "UNSUPPORTED_POWERTAB_STAFF_STRUCTURE"
    );
  }
  const voices = parseVoices(value, context, stringCount);
  return { stringCount, voices };
}

function sourceBarsForStaff(
  system,
  voices,
  barlines,
  firstMeasureNumber,
  firstStartTick,
  context
) {
  const unsupportedCollections = [
    ["tempo_markers", "tempo markers"],
    ["alternate_endings", "alternate endings"],
    ["directions", "directions"],
    ["chords", "chord symbols"],
    ["text_items", "text items"],
  ];
  unsupportedCollections.forEach(([key, label]) => {
    if (requireOptionalArray(system[key], `${context} ${label}`).length > 0) {
      fail(
        `${context} contains ${label} outside the bounded v11 profile.`,
        "UNSUPPORTED_POWERTAB_SYSTEM_STRUCTURE"
      );
    }
  });
  const measureStartTicks = [];
  let nextStartTick = firstStartTick;
  barlines.slice(0, -1).forEach((barline, measureIndex) => {
    measureStartTicks.push(nextStartTick);
    nextStartTick += measureTicks(barline, context, measureIndex);
  });
  const voiceBars = voices.map((voice) =>
    splitVoiceIntoBars(voice, barlines, context, measureStartTicks)
  );

  const bars = barlines.slice(0, -1).map((barline, measureIndex) => ({
    sourceNumber: firstMeasureNumber + measureIndex,
    timeSignatureNumerator: barline.numerator,
    timeSignatureDenominator: barline.denominator,
    repeatStart: barline.type === "RepeatStart",
    repeatCount:
      barlines[measureIndex + 1].type === "RepeatEnd"
        ? barlines[measureIndex + 1].repeatCount
        : 0,
    alternateEndings: 0,
    voices: voiceBars.map((voiceMeasures) => voiceMeasures[measureIndex]),
  }));

  return { bars, nextStartTick };
}

export function buildTracks(score, limits) {
  const players = requireArray(score.players, "PowerTab score players");
  const instruments = requireArray(
    score.instruments,
    "PowerTab score instruments"
  );
  const systems = requireArray(score.systems, "PowerTab score systems");

  if (players.length === 0 || players.length > limits.maxPlayers) {
    fail(
      `The PowerTab score contains ${players.length} players; the bounded limit is 1 through ${limits.maxPlayers}.`,
      "POWERTAB_PLAYER_LIMIT"
    );
  }
  if (instruments.length === 0 || instruments.length > limits.maxInstruments) {
    fail(
      `The PowerTab score contains ${instruments.length} instruments; the bounded limit is 1 through ${limits.maxInstruments}.`,
      "POWERTAB_INSTRUMENT_LIMIT"
    );
  }
  if (systems.length === 0 || systems.length > limits.maxSystems) {
    fail(
      `The PowerTab score contains ${systems.length} systems; the bounded limit is 1 through ${limits.maxSystems}.`,
      "POWERTAB_SYSTEM_LIMIT"
    );
  }

  requireInteger(score.line_spacing, "PowerTab score line spacing", 1, 100);
  if (
    requireOptionalArray(score.view_filters, "PowerTab score view filters")
      .length > 0
  ) {
    fail(
      "The PowerTab score contains view filters outside the bounded fixture-proven profile.",
      "UNSUPPORTED_POWERTAB_SCORE_STRUCTURE"
    );
  }
  if (
    requireOptionalArray(score.chord_diagrams, "PowerTab score chord diagrams")
      .length > 0
  ) {
    fail(
      "The PowerTab score contains chord diagrams outside the bounded fixture-proven profile.",
      "UNSUPPORTED_POWERTAB_SCORE_STRUCTURE"
    );
  }
  instruments.forEach((instrument, index) => {
    const value = requireObject(instrument, `Instrument ${index + 1}`);
    requireString(value.description, `Instrument ${index + 1} description`);
    requireInteger(
      value.midi_preset,
      `Instrument ${index + 1} MIDI preset`,
      0,
      127
    );
  });

  const parsedPlayers = players.map(parsePlayer);
  const trackState = parsedPlayers.map((player) => ({
    name: player.description,
    shortName: player.description,
    isPercussion: false,
    staves: [
      {
        tuningMidiHighToLow: player.tuningMidiHighToLow,
        bars: [],
      },
    ],
    nextStartTick: 0,
  }));

  let totalStaves = 0;
  let totalMeasures = 0;
  let totalPositions = 0;
  let totalNotes = 0;

  systems.forEach((systemValue, systemIndex) => {
    const context = `System ${systemIndex + 1}`;
    const system = requireObject(systemValue, context);
    const staves = requireArray(system.staves, `${context} staves`);
    totalStaves += staves.length;
    const assignments = assignmentsForSystem(
      system,
      context,
      players.length,
      instruments.length,
      staves.length
    );
    const barlines = parseBarlines(system, context);
    const measureCount = barlines.length - 1;
    totalMeasures += measureCount;

    staves.forEach((staffValue, staffIndex) => {
      const playerIndex = assignments.get(staffIndex);
      if (playerIndex == null) {
        fail(
          `${context}, staff ${staffIndex + 1} has no explicit player assignment.`,
          "MISSING_POWERTAB_PLAYER_ASSIGNMENT"
        );
      }
      const duplicateForPlayer = [...assignments.entries()].filter(
        ([, assignedPlayer]) => assignedPlayer === playerIndex
      );
      if (duplicateForPlayer.length > 1) {
        fail(
          `${context} assigns ${parsedPlayers[playerIndex].description} to more than one staff.`,
          "UNSUPPORTED_POWERTAB_MULTI_STAFF_PLAYER"
        );
      }

      const parsedStaff = parseStaff(
        staffValue,
        staffIndex,
        systemIndex,
        parsedPlayers[playerIndex]
      );
      parsedStaff.voices.forEach((voice) => {
        totalPositions += voice.positions.length;
        voice.positions.forEach((position) => {
          totalNotes += position.notes.length;
        });
      });

      const track = trackState[playerIndex];
      const firstMeasureNumber = track.staves[0].bars.length + 1;
      const staffBars = sourceBarsForStaff(
        system,
        parsedStaff.voices,
        barlines,
        firstMeasureNumber,
        track.nextStartTick,
        context
      );
      track.staves[0].bars.push(...staffBars.bars);
      track.nextStartTick = staffBars.nextStartTick;
    });
  });

  if (totalStaves > limits.maxStaves) {
    fail(
      `The PowerTab score contains ${totalStaves} staves; the bounded limit is ${limits.maxStaves}.`,
      "POWERTAB_STAFF_LIMIT"
    );
  }
  if (totalMeasures > limits.maxMeasures) {
    fail(
      `The PowerTab score contains ${totalMeasures} measures; the bounded limit is ${limits.maxMeasures}.`,
      "POWERTAB_MEASURE_LIMIT"
    );
  }
  if (totalPositions > limits.maxPositions) {
    fail(
      `The PowerTab score contains ${totalPositions} positions; the bounded limit is ${limits.maxPositions}.`,
      "POWERTAB_POSITION_LIMIT"
    );
  }
  if (totalNotes > limits.maxNotes) {
    fail(
      `The PowerTab score contains ${totalNotes} notes; the bounded limit is ${limits.maxNotes}.`,
      "POWERTAB_NOTE_LIMIT"
    );
  }

  trackState.forEach((track) => {
    delete track.nextStartTick;
  });
  return trackState;
}

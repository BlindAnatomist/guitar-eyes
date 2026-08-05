import {
  ALLOWED_BAR_TYPES,
  ALLOWED_TIME_SIGNATURE_DENOMINATORS,
  TICKS_PER_QUARTER,
  fail,
  fixedArray,
  requireArray,
  requireInteger,
  requireObject,
  requireOptionalArray,
  requireString,
} from "./powerTabV11Shared";
import { parsePlayer, parseVoices } from "./powerTabV11Notation";

function parseBarlines(system, context) {
  const barlines = requireArray(system.barlines, `${context} barlines`).map(
    (barline, index) => {
      const value = requireObject(barline, `${context}, barline ${index + 1}`);
      const time = requireObject(
        value.time_signature,
        `${context}, barline ${index + 1} time signature`
      );
      const type = requireString(
        value.bar_type,
        `${context}, barline ${index + 1} type`
      );
      const meterType = requireString(
        time.meter_type,
        `${context}, barline ${index + 1} meter type`
      );
      if (meterType !== "Normal") {
        fail(
          `${context}, barline ${index + 1} uses unsupported meter type ${meterType}.`,
          "UNSUPPORTED_POWERTAB_TIME_SIGNATURE"
        );
      }
      fixedArray(
        time.pattern,
        4,
        `${context}, barline ${index + 1} beaming pattern`
      ).forEach((entry, patternIndex) =>
        requireInteger(
          entry,
          `${context}, barline ${index + 1} beaming pattern entry ${patternIndex + 1}`,
          0
        )
      );
      requireInteger(
        time.num_pulses,
        `${context}, barline ${index + 1} metronome pulses`,
        1
      );
      if (!ALLOWED_BAR_TYPES.has(type)) {
        fail(
          `${context}, barline ${index + 1} uses unsupported type ${type}.`,
          "UNSUPPORTED_POWERTAB_BARLINE"
        );
      }
      return {
        position: requireInteger(
          value.position,
          `${context}, barline ${index + 1} position`,
          0
        ),
        type,
        repeatCount: requireInteger(
          value.num_repeats ?? 0,
          `${context}, barline ${index + 1} repeat count`,
          0
        ),
        numerator: requireInteger(
          time.num_beats,
          `${context}, barline ${index + 1} time-signature numerator`,
          1,
          32
        ),
        denominator: requireInteger(
          time.beat_value,
          `${context}, barline ${index + 1} time-signature denominator`,
          1,
          64
        ),
      };
    }
  );
  barlines.forEach((barline, index) => {
    if (!ALLOWED_TIME_SIGNATURE_DENOMINATORS.has(barline.denominator)) {
      fail(
        `${context}, barline ${index + 1} uses unsupported time-signature denominator ${barline.denominator}.`,
        "UNSUPPORTED_POWERTAB_TIME_SIGNATURE"
      );
    }
  });
  if (barlines.length < 2) {
    fail(`${context} must contain at least a starting and ending barline.`);
  }
  for (let index = 1; index < barlines.length; index += 1) {
    if (barlines[index].position <= barlines[index - 1].position) {
      fail(
        `${context} barlines are not in strictly increasing source order.`,
        "AMBIGUOUS_POWERTAB_BARLINE_ORDER"
      );
    }
  }
  return barlines;
}

function assignmentsForSystem(
  system,
  context,
  playerCount,
  instrumentCount,
  staffCount
) {
  const changes = requireArray(
    system.player_changes,
    `${context} player changes`
  );
  if (changes.length !== 1) {
    fail(
      `${context} must contain exactly one stable player assignment at position zero.`,
      "UNSUPPORTED_POWERTAB_PLAYER_CHANGE"
    );
  }
  const change = requireObject(changes[0], `${context} player change`);
  if (
    requireInteger(change.position, `${context} player-change position`, 0) !== 0
  ) {
    fail(
      `${context} changes players after the start of the system.`,
      "UNSUPPORTED_POWERTAB_PLAYER_CHANGE"
    );
  }

  const activePlayers = requireObject(
    change.active_players,
    `${context} active players`
  );
  const assignments = new Map();
  Object.entries(activePlayers).forEach(([staffKey, values]) => {
    if (!/^(0|[1-9][0-9]*)$/u.test(staffKey)) {
      fail(`${context} contains an invalid staff assignment key.`);
    }
    const staffIndex = Number(staffKey);
    if (staffIndex >= staffCount) {
      fail(
        `${context} assigns a player to nonexistent staff ${staffIndex + 1}.`,
        "INVALID_POWERTAB_PLAYER_ASSIGNMENT"
      );
    }
    const players = requireArray(
      values,
      `${context}, staff ${staffIndex + 1} active players`
    );
    if (players.length !== 1) {
      fail(
        `${context}, staff ${staffIndex + 1} must have exactly one active player in the bounded v11 profile.`,
        "UNSUPPORTED_POWERTAB_MULTIPLE_ACTIVE_PLAYERS"
      );
    }
    const assignment = requireObject(
      players[0],
      `${context}, staff ${staffIndex + 1} active player`
    );
    const playerIndex = requireInteger(
      assignment.player,
      `${context}, staff ${staffIndex + 1} player index`,
      0,
      playerCount - 1
    );
    requireInteger(
      assignment.instrument,
      `${context}, staff ${staffIndex + 1} instrument index`,
      0,
      instrumentCount - 1
    );
    assignments.set(staffIndex, playerIndex);
  });
  return assignments;
}

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
    const capacity = measureTicks(barline, context, measureIndex);
    if (relativeTicks > capacity) {
      fail(
        `${context}, voice ${voice.index + 1}, measure ${measureIndex + 1} exceeds its written time-signature duration.`,
        "POWERTAB_MEASURE_DURATION_OVERFLOW"
      );
    }
    return { index: voice.index, beats };
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
    totalMeasures += measureCount * staves.length;

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


import {
  ALLOWED_BAR_TYPES,
  ALLOWED_TIME_SIGNATURE_DENOMINATORS,
  fail,
  fixedArray,
  requireArray,
  requireBoolean,
  requireInteger,
  requireObject,
  requireString,
} from "./powerTabV11Schema";

export function parseBarlines(system, context) {
  const barlines = requireArray(system.barlines, `${context} barlines`).map(
    (barline, index) => {
      const value = requireObject(barline, `${context}, barline ${index + 1}`);
      const key = requireObject(
        value.key_signature,
        `${context}, barline ${index + 1} key signature`
      );
      const time = requireObject(
        value.time_signature,
        `${context}, barline ${index + 1} time signature`
      );
      const type = requireString(
        value.bar_type,
        `${context}, barline ${index + 1} type`
      );
      if (!ALLOWED_BAR_TYPES.has(type)) {
        fail(
          `${context}, barline ${index + 1} uses unsupported type ${type}.`,
          "UNSUPPORTED_POWERTAB_BARLINE"
        );
      }

      const repeatCount = requireInteger(
        value.num_repeats ?? 0,
        `${context}, barline ${index + 1} repeat count`,
        0
      );
      if (repeatCount !== 0) {
        fail(
          `${context}, barline ${index + 1} uses repeat metadata outside the bounded fixture-proven profile.`,
          "UNSUPPORTED_POWERTAB_BARLINE"
        );
      }
      if (value.rehearsal_sign != null) {
        fail(
          `${context}, barline ${index + 1} contains a rehearsal sign outside the bounded fixture-proven profile.`,
          "UNSUPPORTED_POWERTAB_BARLINE"
        );
      }

      const keyType = requireString(
        key.key_type,
        `${context}, barline ${index + 1} key type`
      );
      const accidentals = requireInteger(
        key.num_accidentals,
        `${context}, barline ${index + 1} key accidentals`,
        0,
        7
      );
      requireBoolean(
        key.sharps,
        `${context}, barline ${index + 1} key accidental preference`
      );
      requireBoolean(
        key.visible,
        `${context}, barline ${index + 1} key visibility`
      );
      const cancellation = requireBoolean(
        key.cancellation,
        `${context}, barline ${index + 1} key cancellation`
      );
      if (keyType !== "Major" || accidentals !== 0 || cancellation) {
        fail(
          `${context}, barline ${index + 1} uses key-signature semantics outside the bounded fixture-proven profile.`,
          "UNSUPPORTED_POWERTAB_KEY_SIGNATURE"
        );
      }

      const meterType = requireString(
        time.meter_type,
        `${context}, barline ${index + 1} meter type`
      );
      if (meterType !== "Normal") {
        fail(
          `${context}, barline ${index + 1} uses meter type ${meterType} outside the bounded fixture-proven profile.`,
          "UNSUPPORTED_POWERTAB_TIME_SIGNATURE"
        );
      }
      fixedArray(
        time.pattern,
        4,
        `${context}, barline ${index + 1} beaming pattern`
      ).forEach((entry, patternIndex) => {
        requireInteger(
          entry,
          `${context}, barline ${index + 1} beaming pattern ${patternIndex + 1}`,
          0,
          32
        );
      });
      requireInteger(
        time.num_pulses,
        `${context}, barline ${index + 1} metronome pulses`,
        1,
        32
      );
      requireBoolean(
        time.visible,
        `${context}, barline ${index + 1} time-signature visibility`
      );

      return {
        position: requireInteger(
          value.position,
          `${context}, barline ${index + 1} position`,
          0
        ),
        type,
        repeatCount,
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

export function assignmentsForSystem(
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

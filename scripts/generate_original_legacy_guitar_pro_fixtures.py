#!/usr/bin/env python3
"""Generate original Guitar Eyes GP3, GP4, and GP5 fixtures.

This script authors a tiny score directly in the PyGuitarPro model. It does not
read or transform any commercial tablature. The musical content corresponds to
the project-authored CC0 chord/rest MusicXML specimen:

    fixtures/real-world/musicxml-chord-rest-two-measures.musicxml

PyGuitarPro is a fixture-generation dependency only. It is not a Guitar Eyes
runtime dependency or decoder.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import guitarpro
from guitarpro.models import Beat, BeatStatus, Duration, Note, NoteType, Song

QUARTER = Duration.quarterTime


def add_beat(voice, start: int, duration_value: int, notes: list[tuple[int, int]]) -> Beat:
    status = BeatStatus.normal if notes else BeatStatus.rest
    beat = Beat(
        voice,
        duration=Duration(value=duration_value),
        start=start,
        status=status,
    )
    voice.beats.append(beat)

    for string_number, fret in notes:
        beat.notes.append(
            Note(
                beat,
                value=fret,
                string=string_number,
                type=NoteType.normal,
            )
        )

    return beat


def build_original_score() -> Song:
    song = Song(
        title="Guitar Eyes Cross-Format Proof",
        subtitle="Original chord, rest, and duration specimen",
        artist="Guitar Eyes",
        music="Guitar Eyes project",
        copyright="CC0-1.0",
        tab="Guitar Eyes project",
        instructions="Original fixture; no commercial transcription.",
        tempo=96,
    )

    first_header = song.measureHeaders[0]
    first_header.number = 1
    first_header.start = QUARTER

    track = song.tracks[0]
    track.name = "Proof Guitar"
    track.indicateTuning = True
    track.channel.instrument = 25

    first_voice = track.measures[0].voices[0]
    add_beat(first_voice, QUARTER, Duration.quarter, [(1, 0), (2, 1)])
    add_beat(first_voice, QUARTER * 2, Duration.quarter, [])
    add_beat(first_voice, QUARTER * 3, Duration.quarter, [(3, 0)])
    add_beat(first_voice, QUARTER * 4, Duration.quarter, [(4, 2)])

    song.newMeasure()
    second_header = song.measureHeaders[1]
    second_header.number = 2
    second_header.start = first_header.end

    second_voice = track.measures[1].voices[0]
    add_beat(second_voice, second_header.start, Duration.half, [(5, 0)])
    add_beat(second_voice, second_header.start + QUARTER * 2, Duration.half, [(6, 3)])

    return song


def write_outputs(output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    song = build_original_score()

    outputs = (
        ("guitar-eyes-cross-format.gp3", (3, 0, 0)),
        ("guitar-eyes-cross-format.gp4", (4, 0, 0)),
        ("guitar-eyes-cross-format.gp5", (5, 1, 0)),
    )

    for filename, version in outputs:
        destination = output_dir / filename
        guitarpro.write(song, destination, version=version, encoding="cp1252")
        if not destination.is_file() or destination.stat().st_size == 0:
            raise RuntimeError(f"PyGuitarPro did not create {destination}")

        round_trip = guitarpro.parse(destination, encoding="cp1252")
        if len(round_trip.tracks) != 1:
            raise RuntimeError(f"{destination} did not round-trip with one track")
        if len(round_trip.tracks[0].measures) != 2:
            raise RuntimeError(f"{destination} did not round-trip with two measures")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    write_outputs(args.output_dir)


if __name__ == "__main__":
    main()

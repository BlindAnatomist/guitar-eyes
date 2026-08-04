# Guitar Eyes Cross-Format Guitar Pro Fixture Pack

Source music: Guitar Eyes project-authored `Chord Rest MusicXML Specimen`, CC0-1.0.

Generator: `slundi/guitarpro` commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`, MIT license.

Development-only corrections: GP5 page-template and tempo-label strings use int-plus-byte length encoding; legacy equalizers include their gain byte; GP5 measures always contain two voice-count records; GPIF tuning is exported high-to-low while GPIF notes preserve Guitar Eyes low-to-high string identities. The complete external diff is included, and no patched external source ships with Guitar Eyes.

Independent decoder and runtime importer: `@coderline/alphatab` 1.8.4, MPL-2.0.

Every family passed exact tuning, ordered duration, timed-rest, and Guitar Eyes low-to-high note-coordinate assertions. These files contain no commercial song transcription.

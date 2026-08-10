# Historical PowerTab `.ptb` Versions 1–3 Intake Record

Date: 2026-08-10

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-legacy-ptb-v1-v3-intake`

Starting accepted closure: `afbde3bb11d936e6a514b618b837ffd2c0c7a289`

Clean fork `main` authority remains: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Purpose

Evaluate historical PowerTab `.ptb` file-version values 1, 2, and 3 without broadening the already accepted PowerTab 1.7 / file-version-4 claim.

No playback, teacher mode, scoring, bookmarks, PR, merge, upstream modification, or `main` product change is part of this phase.

## Pinned primary source

Power Tab Editor 2.0.22 compatibility reader:

- repository: `powertab/powertabeditor`;
- commit: `13cab27c7127d301f2747671071e53eb203dc940`;
- legacy document reader: `source/formats/powertab_old/powertabdocument`;
- legacy importer: `source/formats/powertab_old/powertaboldimporter.cpp`.

The preserved `PowerTabFileHeader::FileVersion` enum identifies:

1. value 1 = PowerTab 1.0;
2. value 2 = PowerTab 1.0.2;
3. value 3 = PowerTab 1.5;
4. value 4 = PowerTab 1.7.

## Material compatibility boundaries

### Versions 1 and 2

The pinned reader deliberately sends file versions 1.0 and 1.0.2 through the same header deserializer.

For the bounded score profile used by Guitar Eyes, versions 1 and 2 also share the same old system and barline decoding path:

- old song header layout;
- system-level key byte;
- 16-bit end-bar representation;
- no serialized standalone start-bar object;
- old compact internal barline symbol where key information occupies the high byte and barline data occupies the low byte.

### Version 3

PowerTab 1.5 uses a distinct compatibility song-header layout but already uses the later system and barline serialization path that version 4 also uses.

### Version-stable bounded body

For the first historical Guitar Eyes profile, the following structures are version-stable in the pinned reader and can reuse the already proven v1.7 semantic shape:

- score vector ordering;
- guitar/player structure;
- tuning structure;
- staff layout;
- position layout;
- note layout;
- document font settings;
- final document line-spacing / fade fields.

Version-conditioned structures such as dynamics, tempo markers, chord-name compatibility, and other richer notation are intentionally outside the first historical profile; their vectors remain empty in the lawful fixtures.

## Implementation architecture

Do not refactor or replace the accepted PowerTab 1.7 decoder during this checkpoint.

Implement historical versions 1–3 behind a separate bounded compatibility decoder. A small dispatcher may inspect the six-byte `ptab` + version prefix and route:

- value 4 to the unchanged accepted v1.7 decoder;
- values 1–3 to the historical compatibility decoder;
- any other value to explicit safe rejection.

All versions must normalize into the existing shared semantic tablature document. No format-specific reader interpretation is authorized.

## Fixture policy

Create deterministic, project-authored musical fixtures for values 1, 2, and 3 using the same six-position / two-measure semantic score already proven for version 4:

1. low E fret 3, quarter note;
2. A open, eighth note;
3. A fret 2, eighth note;
4. D open, half note;
5. half-note rest in measure 2;
6. high E open + B fret 1 two-note half-note chord.

The musical content remains CC0-1.0 project-authored test material.

Each fixture must preserve its exact version signature and deterministic hash.

## Validation evidence boundary

A maintained independent parser that clearly supports historical values 1–3 was not located during this intake. Current TuxGuitar evidence remains useful for version 4 but must not be cited as parity evidence for versions 1–3.

Therefore the historical checkpoint must use the strongest evidence actually available:

1. deterministic project-authored fixture generation;
2. exact pinned Power Tab Editor compatibility layouts;
3. source-faithful execution of those deserialization paths;
4. semantic parity against the project-authored source description;
5. strict malformed/version/truncation rejection;
6. automated Guitar Eyes source gates;
7. complete inherited suite and production build before hosted publication;
8. bounded real-iPhone Safari/VoiceOver acceptance only after every non-device gate passes.

Do not describe this as independent-parser parity unless genuinely independent evidence is later found.

## Actions policy

GitHub Actions are not an exploratory debugger. No hosted run is authorized until deterministic fixtures, decoder implementation, focused tests, routing tests, and source-level verification are complete and reviewed.

If an Actions checkpoint later fails, diagnose outside Actions before any retry and obey the repository circuit-breaker rules.

## Stopping boundary

This record authorizes bounded source implementation of historical file versions 1–3 on this branch after the evidence above is preserved. It does not authorize arbitrary legacy `.ptb` compatibility, bass profiles, alternate tunings, lessons, richer notation, or unsupported historical structures.

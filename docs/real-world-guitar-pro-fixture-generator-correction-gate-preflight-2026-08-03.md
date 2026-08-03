# Real-World Guitar Pro Fixture Generator Correction Gate Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

## Purpose

Apply three narrowly verified development-time corrections to pinned external fixture-generator commit:

`slundi/guitarpro@2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`

Then generate one coherent original GP3, GP4, GP5, GP6 GPX, and GP7 shared-archive fixture pack and independently decode every family with pinned alphaTab 1.8.4.

The external generator remains outside Guitar Eyes source and runtime dependencies. No patched external source is vendored into the application.

## Evidence from diagnostic v3

Run `30854604430` established:

1. GP3 decoded with correct top-line-first tuning and complete semantic counts;
2. GP4 decoded with the same correct semantics;
3. GP5 failed in alphaTab `Gp3To5Importer.readPageSetup` at byte offset 206;
4. GPX and GP7 decoded, but alphaTab returned tuning `[40, 45, 50, 55, 59, 64]`, which is bottom-line-first and therefore contradicts alphaTab `Staff.stringTuning`'s documented top-line-first contract;
5. the optimized source score contains tuning `[64, 59, 55, 50, 45, 40]` and source string numbers 1 through 6 from high E through low E.

## Exact external corrections

### 1. GP5 page-layout string encoding

File:

`guitarpro/src/model/legacy/page.rs`

Inside `SongPageOps::write_page_setup`, replace exactly ten calls to:

`write_int_size_string`

with:

`write_int_byte_size_string`

Reason: alphaTab's GP5 reader expects `int length + byte length + bytes` for each page-layout template.

### 2. GP5 tempo-label string encoding

File:

`guitarpro/src/model/legacy/song.rs`

Replace exactly one call:

`write_int_size_string(&mut data, &self.tempo_name);`

with:

`write_int_byte_size_string(&mut data, &self.tempo_name);`

Reason: alphaTab reads the GP5 tempo label with the same `int + byte + bytes` contract immediately after page setup.

### 3. GPIF tuning order

File:

`guitarpro/src/io/gpif_export.rs`

Change the tuning pitch iteration from:

`track.strings.iter()`

to:

`track.strings.iter().rev()`

for the `<Property name="Tuning"><Pitches>…</Pitches></Property>` export only.

Reason: the optimized score stores strings high-to-low, while the unpatched legacy reconstruction presents `track.strings` bottom-to-top. alphaTab requires the exported tuning array to represent tablature lines from top to bottom. The existing GPIF note-string export already converts source high-to-low string numbers to zero-based GPIF values and must remain unchanged.

## Patch safety

The gate must:

1. clone the exact pinned commit;
2. verify each original source fragment before editing;
3. verify replacement counts of exactly ten, one, and one;
4. show and preserve the external diff in the artifact;
5. fail if any additional external source line changes;
6. build the patched generator from source;
7. never push or open a pull request against the external repository.

## Original authored source

The fixture pack derives only from:

`fixtures/real-world/musicxml-chord-rest-two-measures.musicxml`

The music is project-authored and CC0-1.0. It contains:

1. standard six-string tuning high-to-low `[64, 59, 55, 50, 45, 40]`;
2. two measures;
3. six timed positions;
4. one two-note chord on high E open and B fret 1;
5. one quarter-note rest;
6. G open;
7. D fret 2;
8. A open as a half note; and
9. low E fret 3 as a half note.

## Independent acceptance assertions

For every generated family, alphaTab 1.8.4 must return exactly:

1. one non-percussion track;
2. one six-string staff;
3. tuning `[64, 59, 55, 50, 45, 40]` in top-line-first order;
4. two bars;
5. six timed beats;
6. one timed rest;
7. duration denominators `[4, 4, 4, 4, 2, 2]` in source order;
8. note coordinates by beat:
   - beat 1: string 6 fret 0 and string 5 fret 1;
   - beat 2: rest;
   - beat 3: string 4 fret 0;
   - beat 4: string 3 fret 2;
   - beat 5: string 2 fret 0;
   - beat 6: string 1 fret 3;
9. no note lacking finite string or fret identity.

The alphaTab string numbers above follow its public model contract: string 1 is the lowest string and bottom tablature line.

## Application verification

The same gate must target an exact Guitar Eyes feature SHA and run:

1. focused Guitar Pro tests;
2. the complete inherited Jest suite;
3. the production build;
4. artifact inspection proving alphaTab remains in a lazy worker chunk and no renderer, notation font, soundfont, synth, or audio-worklet assets are emitted.

## Output

If and only if every assertion passes, upload one one-day artifact containing:

1. original MusicXML source;
2. optimized intermediate source;
3. GP3, GP4, GP5, GPX, and GP7 files;
4. external patch diff and exact generator commit;
5. alphaTab semantic audit;
6. SHA-256 hashes; and
7. licensing/provenance.

## Repository and cost boundaries

1. Standard `ubuntu-24.04` runner only.
2. Thirty-minute timeout.
3. One intentional run against one exact feature source.
4. No Pages, deployment, publication, pull request, merge, paid runner, paid service, or upstream modification.
5. Temporary workflow on fork `main` must be removed immediately after its pending status reveals the run URL.
6. Fork `main` must compare identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3` after restoration.

## Stop condition

Stop after exact source tests, complete regression, production build, artifact inspection, coherent five-family fixture audit, and repository-authority verification. Do not publish or request real-iPhone testing during this gate.
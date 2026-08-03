# Guitar Eyes Implementation Status Addendum — August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake-2`

This addendum supersedes stale current-state statements in `docs/implementation-status.md` concerning the active branch, the current authorized checkpoint, and extended-string ASCII support. Historical checkpoint evidence in that file remains valid unless a later accepted record explicitly supersedes it.

## Current authority

Clean fork `main` authority:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Accepted hosted format-only application source through ASCII Extended-String Intake Checkpoint 2:

`030e1f6af2de23e41ad993ab0292893b072664eb`

Accepted engine source for Checkpoint 2:

`4b3e89ba068db36a364cb824ccd1cc513f3734cf`

Checkpoint record branch:

`work/ascii-extended-string-intake-2`

Documentation-only closure commits do not replace the accepted application source.

## Current checkpoint state

ASCII Extended-String Intake Checkpoint 2 is passed and closed.

Evidence:

1. 42 of 42 automated suites passed;
2. 260 of 260 automated tests passed;
3. production build passed;
4. focused resume verification passed;
5. exact format-only Pages publication passed;
6. hosted HTML and JavaScript read-back passed;
7. fork `main` was restored exactly;
8. real-iPhone Safari, VoiceOver, and Files-picker acceptance passed.

The owner's exact device result is preserved in:

`docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md`

## Actually imported ASCII profiles

The shared semantic importer now accepts:

1. six-string guitar ASCII within the accepted general profile;
2. seven-string guitar ASCII only in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1`;
3. eight-string guitar ASCII only in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1 F#1`;
4. four-string bass ASCII within the accepted general profile;
5. five-string bass ASCII only in exact standard octave-qualified tuning `G2 D2 A1 E1 B0`;
6. six-string bass ASCII only in exact standard octave-qualified tuning `C3 G2 D2 A1 E1 B0`.

The Guitar/Bass selector remains a family selector rather than a fixed string-count selector.

## Other accepted import routes

The accepted format-only lineage also retains:

1. uncompressed `.musicxml` and `.xml` six-string guitar tablature within the accepted bounded profile;
2. compressed MusicXML `.mxl` through the accepted compressed-import route in the format-only lineage;
3. verified project-authored `.gp` shared archives with GP8 semantic evidence and explicit track selection.

No broader compatibility claim is authorized for arbitrary Guitar Pro files or legacy Guitar Pro families.

## Format-only presentation boundary

The accepted hosted proof exposes semantic reading and navigation without playback:

1. Previous position;
2. Read current position;
3. Next position;
4. position description and count;
5. block navigation where applicable;
6. parsing notes;
7. durable Files-picker focus recovery.

The accepted proof does not expose:

1. Sound delay;
2. Audition current position;
3. Position audio;
4. playback instructions;
5. procedural or sampled sound output.

Playback experiments and Iowa sample branches remain historical and are not inherited into this accepted format-only application source.

## Still unsupported or unverified

The following remain unsupported unless a later lawful checkpoint proves them:

1. arbitrary seven-string or eight-string guitar tunings without complete octave evidence;
2. arbitrary five-string or six-string bass tunings without complete octave evidence;
3. missing-octave inference for strict extended-string profiles;
4. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx`;
5. arbitrary or unverified `.gp` files;
6. PowerTab `.ptb` and `.pt2`;
7. TuxGuitar `.tg`;
8. TablEdit `.tef`;
9. full-document playback;
10. teacher mode.

Recognition must never be described as reading support.

## Closure boundary

No pull request, merge, upstream modification, playback reopening, teacher-mode work, or additional format implementation was performed during closure.
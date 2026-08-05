# PowerTab `.pt2` Version 11 Source Checkpoint 1 Result

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-source-checkpoint`

Exact evaluation base: `e53f82476eed45722bff959a5036da3481159ce9`

Exact source commit: `0e862c75faab4f46662286236a6288d4cf89fcf3`

Accepted application source preserved: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`

Status: bounded source checkpoint complete and provisional. This record does not claim accepted public PowerTab support.

## Scope completed

This checkpoint establishes a narrow browser importer for modern Power Tab Editor `.pt2` documents whose decompressed root reports exact internal version 11.

It does not implement legacy `.ptb`, older `.pt2` versions, arbitrary PowerTab compatibility, rendering, playback, notation fonts, teacher mode, bookmarks, analysis, scoring, or AI work.

## Pinned upstream evidence

The format mapping was independently implemented from structural evidence in:

- repository: `powertab/powertabeditor`;
- release: `2.0.22`;
- exact commit: `13cab27c7127d301f2747671071e53eb203dc940`.

The upstream evidence establishes the modern route as:

`gzip container -> UTF-8 JSON -> root version -> score structure`

No Power Tab Editor source file, compiled decoder, Qt interface, renderer, notation font, MIDI engine, playback code, or runtime asset was copied into Guitar Eyes.

## Architecture preserved

The implementation preserves the accepted single-semantic-document architecture.

The route is:

1. detect `.pt2` as the bounded `PT2_V11` source family;
2. lazily load the PowerTab importer through the existing structured binary route;
3. validate and decompress the gzip container;
4. parse strict UTF-8 JSON;
5. require exact internal version 11;
6. produce a project-owned PowerTab intermediate;
7. build an explicit player and staff inventory;
8. require selection when more than one supported player exists;
9. normalize the selected material into the existing Guitar Eyes semantic document;
10. derive both desktop and iPhone presentations from that same document.

No second reader, musical model, or independent desktop interpretation was added.

The existing track selector was generalized through inventory-owned language. Guitar Pro retains its established wording. PowerTab uses player-specific wording without duplicating the selection mechanism or weakening its reading order.

## Bounded source profile

The parser currently accepts only structures it can validate without guessing.

The source boundary includes:

- exact internal version 11;
- `.pt2` extension;
- gzip identity and bounded decompression;
- strict UTF-8 and JSON;
- explicit players and instruments;
- explicit stable player assignment at source position zero;
- one bounded tablature staff for a selected player;
- object-indexed fixed two-voice staff structure;
- four-string bass or six-string guitar inventory profiles;
- complete high-to-low MIDI tuning evidence;
- barline-bounded measures;
- normal time signatures with representable denominators;
- written whole through sixty-fourth durations;
- single and double dots;
- rests, fretted notes, open notes, and chords;
- bounded palm mute, vibrato, tap, let-ring, harmonic, slide, and bend normalization where the exact source structure is preserved.

PowerTab horizontal coordinates establish source order and measure membership only. Semantic onsets are synthesized from written durations at 960 ticks per quarter note. The importer does not reinterpret page spacing as musical time.

## Rejection boundary

The importer rejects rather than silently discarding or guessing when it encounters:

- a non-v11 document;
- invalid gzip, UTF-8, or JSON;
- container or decompressed-size overflow;
- absent or contradictory players, instruments, staves, strings, or tunings;
- unstable or ambiguous player changes;
- more than one active player on a staff;
- one player assigned to multiple staves within the bounded profile;
- unsupported string counts;
- malformed object-indexed fixed arrays;
- non-normal meter types;
- unsupported time-signature denominators;
- ambiguous position or barline ordering;
- duplicated notes on one string at one position;
- contradictory rest-and-note positions;
- unsupported note, position, staff, system, or score structures;
- measure-duration overflow;
- unsupported chord diagrams, dynamics, tempo markers, alternate endings, directions, text items, irregular groupings, multibar rests, volume swells, tremolo bars, or other structures outside the checkpoint profile.

Legacy `.ptb` remains recognized and safely rejected through its separate unsupported route.

## Fixture and provenance

The committed specimen is:

`fixtures/powertab-v11/powertab-v11-original-six-position.pt2`

Its musical material is project-authored, original, and released as CC0-1.0 test evidence.

The score contains:

1. low E fret 3, quarter note;
2. A open, eighth note;
3. A fret 2, eighth note;
4. D open with palm mute, half note;
5. half-note rest;
6. high E open plus B fret 1, half-note chord.

The score uses standard six-string guitar tuning high to low:

`E4 B3 G3 D3 A2 E2`

Recorded deterministic evidence:

- canonical JSON bytes: `3680`;
- canonical JSON SHA-256: `59210a2dc289d6aa25d084cce7aa9c64ba3349ac13b3f1eca155fdcdede3859f`;
- gzip binary bytes: `999`;
- gzip binary SHA-256: `f31bc6343b70f216a6a3c65f1b450a179245f460c1da8786837d184fd995589d`.

The generator reproduces the canonical compact JSON, newline, gzip level 9, deterministic mtime zero, binary, base64 mirror, byte counts, and hashes.

## Critical evidence limitation

The committed `.pt2` is source-derived from the pinned version-11 serializer structure. It is not yet an editor-exported canonical acceptance fixture.

Therefore it may establish parser behavior, rejection behavior, inventory behavior, semantic normalization, deterministic provenance, and repository transport during this source checkpoint. It cannot by itself establish real Power Tab Editor export compatibility or accepted public `.pt2` support.

Before acceptance, the same original score must be created or reproduced through exact Power Tab Editor 2.0.22, exported by the editor, decompressed and compared structurally, decoded through Guitar Eyes, and matched against the same six expected semantic positions. The editor environment and resulting hashes must be recorded.

## Verification completed without Actions

The following local checks completed:

- syntax parsing for every new non-JSX importer, inventory, normalizer, reader-document, test, and generator module;
- direct gzip decoding of the proof container after the parser was split into bounded modules;
- exact recovery of the title, one player, standard six-string tuning, two measures, and the expected four-plus-two position division;
- direct player-inventory execution;
- detector execution proving `.pt2` routes to `PT2_V11` while legacy `.ptb` remains separate and planned;
- deterministic generator execution;
- exact verification of the JSON byte count and hash;
- exact verification of the binary byte count and hash;
- byte-for-byte equality between the binary fixture and its committed base64 mirror;
- repository comparison proving the source commit is exactly one commit ahead of the evaluation base, zero behind, and changes only the intended 27 files.

## Gates not yet run

The following evidence remains deliberately unclaimed:

- locked dependency installation;
- the full inherited Jest suite;
- the optimized production build;
- production bundle and asset-boundary inspection;
- editor-exported fixture compatibility;
- hosted publication and exact asset read-back;
- real-iPhone Safari and VoiceOver acceptance.

No GitHub Actions workflow was dispatched because this checkpoint did not authorize workflow execution. No preview was published.

## Repository transport correction

During atomic tree assembly, one intermediate commit object was created from an incomplete tree because the connector parameter for the base tree was misnamed. Repository comparison exposed the omission immediately.

The work branch was reset to the exact evaluation head before the valid source commit was created. The incomplete commit is not in the branch history. Fork `main`, workflows, upstream, the accepted application source, and every accepted repository record remained untouched.

The valid source commit uses the complete inherited base tree and changes only the intended 27 files.

## Repository state

- source commit: `0e862c75faab4f46662286236a6288d4cf89fcf3`;
- source tree: `ef5518aa995ac4d8e0b598fb57d832d5dc9f5e29`;
- branch relationship to evaluation base: ahead 1, behind 0 before this documentation commit;
- no Actions run;
- no preview published;
- no pull request opened;
- nothing merged;
- fork `main` untouched;
- `Phlypper/guitar-eyes` untouched.

## Next bounded gate

The next checkpoint must not widen parser scope.

It should:

1. obtain an editor-exported version-11 fixture for the same original score from exact Power Tab Editor 2.0.22;
2. audit its decompressed JSON and record its provenance and hashes;
3. reconcile any structural differences without weakening rejection rules;
4. perform locked installation;
5. run focused PowerTab tests and the complete inherited suite;
6. create the optimized production build;
7. inspect the bundle and assets for decoder scope and absence of rendering, notation-font, MIDI, audio, soundfont, and unrelated Power Tab machinery;
8. stop before publication unless a separate zero-dollar hosted checkpoint is explicitly authorized.

John is not required for any of those source, dependency, test, build, or artifact gates. Real-iPhone VoiceOver testing begins only after an exact hosted candidate exists and is separately authorized.

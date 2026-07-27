# Guitar Pro 7 Proof Checkpoint 3A Result

Date: July 27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Status: dependency, deterministic fixture, normalization, automated, build, and artifact-isolation proof passed; not published; not accepted as general Guitar Pro support

## Exact implementation and artifact identities

Passed-test application source before the lint-only worker declaration:

`814c84b7785729ed4a342b0d369e09dede4d2793`

Standards-based worker with Create React App ESLint declaration:

`6ec358c452bc7d2df79f64548757aeba4d55d916`

Deterministic generated-artifact commit:

`c105a0283e9c496308d1908db120b10ffea52dc4`

The artifact commit contains only:

1. `package-lock.json` with exact `@coderline/alphatab` version `1.8.4` and npm integrity;
2. `fixtures/real-world/guitar-pro-7-proof.gp`;
3. `fixtures/real-world/guitar-pro-7-proof.gp.sha256`.

Later commits through the temporary-workflow removal are workflow or documentation records and do not replace the proof source identity.

## Objective

Prove that Guitar Eyes can decode a project-authored Guitar Pro 7 archive in the browser through a lazy third-party decoder, isolate that decoder from the initial application bundle, transfer only plain serializable data across a bounded worker boundary, and normalize the result into the existing semantic document without introducing playback, rendering, commercial tablature, or a second musical model.

## Dependency boundary

Pinned package:

`@coderline/alphatab` `1.8.4`

License:

Mozilla Public License 2.0

Permanent notice:

`THIRD_PARTY_NOTICES.md`

Guitar Eyes uses alphaTab only through its low-level byte importer. The proof does not initialize or ship alphaTab as the reader, renderer, cursor, player, synthesizer, notation editor, teacher interface, or playback architecture.

The alphaTab score graph is not passed into the application. `src/guitarProAlphaTabAdapter.js` extracts a small Guitar Eyes-owned intermediate representation containing only required score, track, staff, measure, voice, beat, note, tuning, duration, string, fret, rest, chord, repeat, and supported-technique data.

## Worker and resource boundary

Guitar Pro decoding occurs in a dedicated named module worker:

`guitar-eyes-gp7-import`

The client enforces:

1. maximum selected file size: 5 MiB;
2. worker deadline: 10 seconds;
3. termination after success;
4. termination after decoder failure;
5. termination after browser-worker failure;
6. termination after timeout;
7. transfer of the selected ArrayBuffer rather than duplication;
8. typed errors routed into the existing durable upload-error path.

The semantic normalizer additionally enforces:

1. maximum tracks: 32;
2. maximum staves: 64;
3. maximum bars: 1,000;
4. maximum voices per bar: 4;
5. maximum beats: 50,000;
6. maximum notes: 150,000.

These are exported tested constants rather than informal assumptions.

## Normalization rules proved

Checkpoint 3A accepts only the project-tested GP7 intermediate profile and exactly one unambiguous non-percussion four-string or six-string staff.

It deliberately preserves or normalizes:

1. high-to-low Guitar Eyes string order from alphaTab's low-to-high string numbering;
2. standard and explicit tuning;
3. source-order measures;
4. whole, half, quarter, eighth, sixteenth, thirty-second, and sixty-fourth durations;
5. dotted and double-dotted duration fractions;
6. exact tuplet fractions;
7. fretted notes and open strings;
8. dead notes;
9. simultaneous chord onsets;
10. timed rests;
11. a bounded supported technique set;
12. repeat and alternate-ending metadata as warnings without playback-order expansion;
13. normalized Guitar Pro spatial rows for the desktop reader;
14. one shared semantic document for desktop and iPhone projections.

It rejects rather than guesses:

1. untested Guitar Pro version identity;
2. more than one supported tablature track;
3. percussion-only or non-fretted scores;
4. unsupported string counts;
5. more than one active voice in a measure;
6. grace timing outside the accepted semantic model;
7. non-increasing or ambiguous onsets;
8. missing, duplicate, or out-of-range string coordinates;
9. rests containing visible notes;
10. unsupported duration denominators;
11. invalid intermediate schemas;
12. every tested resource-limit violation.

No first-track, first-voice, longest-note, nearest-string, or unsupported-string-count fallback is permitted.

## Fixture provenance and determinism

Source fixture:

`fixtures/real-world/guitar-pro-7-proof.atex`

Generated binary:

`fixtures/real-world/guitar-pro-7-proof.gp`

License:

CC0-1.0 project-authored material

Binary size:

2,974 bytes

SHA-256:

`209eb7834a06400b09fde3b2ceafe4a1b4aee3831ef054065fe40d75e690462d`

The generator exports the original alphaTex twice in one process and fails if the bytes differ. It then reloads the generated `.gp`, verifies one track, one staff, two measures, and records the decoded sequence.

The generated proof contains six synchronized positions:

1. quarter-note chord: high E open and B string fret 1;
2. quarter-note rest;
3. quarter-note G string open;
4. quarter-note D string fret 2;
5. half-note A string open;
6. half-note low E string fret 3.

Each of the two measures totals four quarter-note units.

No arbitrary upstream alphaTab tablature fixture was copied. A reviewed upstream GP5 fixture was rejected because it contained a transcription of a commercial song.

## Automated verification

Run:

`30234224820`

Results:

1. deterministic fixture generation: passed;
2. checksum verification: passed;
3. inherited and GP7 proof suites: 26 passed, 26 total;
4. automated tests: 153 passed, 153 total.

The automated coverage includes:

1. pure semantic normalization;
2. alphaTab graph extraction into serializable data;
3. object-cycle exclusion;
4. worker lifecycle and termination;
5. file-size and timeout limits;
6. shared reader-document projection;
7. application success, failure, and iPhone focus paths using injected decoder evidence;
8. direct binary alphaTab reload of the generated `.gp` fixture;
9. all inherited ASCII, MusicXML, desktop, iPhone, speech, measure, rhythm, and focus tests.

## Production build and bundle inspection

Run:

`30234376891`

Results:

1. production build: passed;
2. static GP7 proof identity: passed;
3. initial application bundle contracts: passed;
4. named GP7 worker emission: passed;
5. alphaTab decoder absent from the initial `main.*.js`: passed;
6. lazy alphaTab decoder discovery: passed;
7. lazy decoder size below 5 MiB: passed;
8. forbidden font, soundfont, renderer-worker, audio-worklet, and synthesis assets: absent.

Build report:

- main JavaScript: `static/js/main.4159c9e4.js`;
- uncompressed main size: 286,150 bytes;
- named worker chunk: `static/js/guitar-eyes-gp7-import.1fbdfc93.chunk.js`;
- alphaTab decoder chunk: `static/js/600.ad1fcd35.chunk.js`;
- combined lazy decoder size: 1,237,129 bytes uncompressed;
- gzip-reported alphaTab chunk size: 290.32 kB;
- gzip-reported named worker chunk size: 1.88 kB.

The emitted build contained no Bravura font, other notation font, soundfont, `.sf2`, `.sf3`, alphaTab renderer worker, alphaTab audio worklet, synth worker, or playback asset.

## Diagnostic history

Several bounded runs failed before the final proof, and each was inspected before the next change:

1. `30233598509`: generator succeeded; checksum was verified from the wrong working directory.
2. `30233736792`: generation and checksum passed; 151 of 153 tests passed. Failures were a stale static identity assertion and missing `TextDecoder` in jsdom only.
3. `30233865629`: 26 suites and 153 tests passed; Create React App rejected the worker-global identifier `self` under its lint policy.
4. `30234043121`: build-only diagnostic captured the complete compiler output.
5. `30234224820`: 153 tests passed again; runtime-standard `globalThis` still required an explicit global declaration for the older Create React App ESLint environment.
6. `30234376891`: build and asset inspection passed; only a fragile changed-file shell whitelist failed.
7. `30234490064`: an exact JSON status report showed no unexpected paths and no uncommitted paths because the artifacts had already been committed successfully at `c105a0283e9c496308d1908db120b10ffea52dc4`.

No publication or real-iPhone test occurred during this proof.

## Verdict

Guitar Pro 7 proof checkpoint 3A passes.

The proof establishes that the alphaTab decoder can be contained behind a lazy bounded worker and that a project-authored GP7 archive can be normalized accurately into the accepted Guitar Eyes document without increasing the initial bundle with decoder code or shipping renderer and audio assets.

It does not establish general `.gp` support. Guitar Pro 7 and Guitar Pro 8 share the `.gp` extension, and real files commonly contain multiple supported tracks. The current branch therefore continues to label `.gp` as an internal checkpoint proof rather than an accepted public format.

## Next bounded checkpoint: 3B

Before publication, implement archive-version evidence and accessible track inventory.

Checkpoint 3B must:

1. inspect the `.gp` archive before semantic normalization and distinguish supported GP7 evidence from GP8 or unknown evidence;
2. reject files whose version cannot be proved within the project-tested boundary;
3. decode track and staff inventory without silently selecting a supported track;
4. expose track name, instrument identity, string count, tuning, measure count, and support reason in a serializable inventory;
5. automatically continue only when exactly one supported track exists;
6. present an accessible selector when multiple supported tracks exist;
7. preserve native iPhone focus entering and leaving track selection;
8. retain the same worker deadline and resource limits;
9. add project-authored multi-track GP7 fixtures and adversarial version evidence;
10. inherit all 153 tests and add selector, version, and focus tests;
11. stop before publication and real-iPhone testing.

GP3, GP4, GP5, GP6, GP8, GP2, PowerTab, TuxGuitar, TablEdit, compressed MusicXML, playback, teacher mode, AI, a pull request, and a merge remain outside checkpoint 3B.

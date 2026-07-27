# Guitar Pro and Related Structured Formats Evaluation

Date: July 27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Status: evaluation complete; bounded Guitar Pro 7 proof recommended

## Purpose

Determine whether Guitar Eyes can import Guitar Pro and related binary tablature formats in the browser without paid services, commercial scraping, playback, rendering, a second musical model, or guessed musical meaning.

## Decision

Use stable `@coderline/alphatab` version `1.8.4` as a lazy, low-level Guitar Pro decoder, not as the Guitar Eyes reader, renderer, player, cursor, or teaching system.

The dependency is acceptable for one bounded proof because:

1. alphaTab provides `ScoreLoader.loadScoreFromBytes(Uint8Array, Settings)` as a public low-level API;
2. that API returns a semantic `Score` without requiring `AlphaTabApi`, `ScoreRenderer`, alphaSynth, fonts, soundfonts, or playback controls;
3. the model exposes score, track, staff, bar, voice, beat, note, tuning, fret, string, duration, chord, rest, measure, and effect data;
4. Guitar Eyes can immediately normalize the selected alphaTab track into its existing semantic document and discard the alphaTab model;
5. alphaTab is available under MPL-2.0 with no runtime npm dependencies;
6. the stable package is browser-compatible and zero-dollar.

This decision does not authorize alphaTab rendering, playback, audio assets, notation fonts, UI controls, cursors, or a parallel reader.

## Verified upstream support

Current alphaTab format documentation identifies importers for:

1. Guitar Pro 3, 4, and 5: `.gp3`, `.gp4`, `.gp5`;
2. Guitar Pro 6: `.gpx`;
3. Guitar Pro 7: `.gp`;
4. Guitar Pro 8: `.gp`.

The current documentation describes GP3-5, GP6, and GP7 as mature and well tested. GP8 uses the GP7 archive family with extensions; alphaTab reports high feature coverage but notes maturity through GP7.

Guitar Pro 2 `.gtp` is not part of alphaTab’s listed importer set and remains unsupported by this route.

Primary references:

- `https://www.alphatab.net/docs/category/formats/`
- `https://alphatab.net/docs/formats/guitar-pro-3-5`
- `https://alphatab.net/docs/formats/guitar-pro-6/`
- `https://alphatab.net/docs/formats/guitar-pro-7`
- `https://alphatab.net/docs/formats/guitar-pro-8/`
- `https://alphatab.net/docs/reference/types/importer/scoreloader/`
- `https://alphatab.net/docs/guides/lowlevel-apis`

## Model compatibility with Guitar Eyes

alphaTab’s model hierarchy is:

`Score > Track > Staff > Bar > Voice > Beat > Note`

A beat groups notes played at the same time, which corresponds directly to one Guitar Eyes synchronized position when the timing is unambiguous.

The useful public fields include:

1. `Score.tracks` and `Score.masterBars`;
2. `Track.name`, `Track.shortName`, `Track.staves`, and percussion identity;
3. `Staff.bars`, `Staff.stringTuning`, and `Staff.tuning`;
4. `Bar.voices`, `Bar.masterBar`, and bar order;
5. `Voice.beats`;
6. `Beat.notes`, `Beat.isRest`, `Beat.duration`, `Beat.dots`, tuplet values, `Beat.displayStart`, and `Beat.displayDuration`;
7. `Note.fret`, `Note.string`, visibility, dead-note state, ties, slides, bends, hammer/pull relationships, harmonics, vibrato, let-ring, palm-mute, and other effects;
8. master-bar time signatures, repeats, alternate endings, and section information.

Important orientation rule:

- alphaTab note string `1` is the lowest string and bottom tablature line;
- Guitar Eyes semantic strings are stored from highest string to lowest;
- therefore semantic string index is `stringCount - note.string`.

Primary code reference:

- `https://github.com/CoderLine/alphaTab/blob/develop/packages/alphatab/src/model/Note.ts`

## Dependency and bundle implications

The npm package is broad rather than importer-only:

1. package exports expose the root module, Webpack integration, Vite integration, fonts, and soundfonts;
2. there is no documented importer-only npm subpath;
3. the root package contains rendering and synthesis code even when Guitar Eyes calls only `ScoreLoader`;
4. historical and current package listings show a substantial core bundle;
5. fonts and soundfonts are separate assets and must not be copied into Guitar Eyes;
6. the package has zero runtime npm dependencies.

Required mitigation:

1. use a dynamic import only after Guitar Eyes identifies a Guitar Pro extension;
2. perform parsing in a dedicated Web Worker so a malformed or complex archive cannot freeze the reader interface;
3. measure the generated worker chunk during the proof;
4. reject any build that copies Bravura fonts, soundfonts, audio worklets, or renderer workers;
5. keep the initial Guitar Eyes bundle independent of alphaTab;
6. pin the exact stable version and lockfile integrity rather than use a range.

References:

- `https://www.npmjs.com/package/@coderline/alphatab`
- `https://app.unpkg.com/@coderline/alphatab@1.8.3/files/package.json`
- `https://app.unpkg.com/@coderline/alphatab@1.8.3/files/dist/alphaTab.core.mjs`

## Licensing conclusion

alphaTab is licensed under MPL-2.0.

The license permits alphaTab to be combined with Guitar Eyes as a larger work. Guitar Eyes must:

1. preserve alphaTab’s copyright and license notices;
2. include the MPL-2.0 text or an accessible third-party notice;
3. identify the exact alphaTab version;
4. provide a reasonable route to the corresponding alphaTab source;
5. keep modifications to alphaTab-covered source under MPL-2.0 if any are ever made.

Guitar Eyes should not modify or vendor alphaTab source during the proof. It should consume the published package unchanged and maintain `THIRD_PARTY_NOTICES.md`.

Primary license:

- `https://raw.githubusercontent.com/CoderLine/alphaTab/develop/LICENSE`

## Security and resource boundary

Guitar Pro 6-8 files contain compressed structured data. All Guitar Pro files are untrusted input.

The first checkpoint must enforce:

1. a conservative selected-file byte limit before worker transfer;
2. a worker timeout;
3. cancellation and worker termination on failure;
4. maximum counts for tracks, candidate staves, bars, voices, beats, and notes;
5. rejection of percussion-only and non-fretted tracks;
6. rejection of unsupported string counts;
7. rejection when essential timing or string/fret data is absent;
8. no external network request during import;
9. no renderer, font, soundfont, playback, or audio initialization;
10. a plain error returned to the existing durable upload-error focus path.

Limits must be constants with tests, not informal assumptions.

## Normalization boundary

The first Guitar Pro semantic checkpoint may accept only:

1. GP7 `.gp` files generated from original project-authored material;
2. exactly one unambiguous non-percussion tablature staff with four or six strings;
3. source-order measures;
4. one musically active voice, or multiple voices only when every onset and duration can be merged without conflict;
5. explicit fretted, open, dead, chord, and rest events;
6. durations that can be represented exactly in quarter-note units;
7. deterministic supported techniques;
8. source repeats preserved as metadata or warnings but not expanded into playback order.

The first checkpoint must reject:

1. more than one supported candidate track until an accessible track selector exists;
2. conflicting simultaneous voices with different durations at one onset;
3. grace timing that cannot be represented without changing the semantic model;
4. seven-string guitar, five-string bass, percussion, piano, and other unsupported instruments;
5. notes lacking usable string or fret identity;
6. files exceeding the complexity limits;
7. GP2 `.gtp`;
8. corrupt or unsupported archives.

No longest-note, first-voice, first-track, or nearest-string guessing is permitted.

## Track-selection consequence

Real Guitar Pro files commonly contain multiple guitar, bass, vocal, keyboard, and percussion tracks.

A useful later checkpoint will require an accessible track chooser that:

1. appears only after successful file decoding;
2. lists track name, instrument type, string count, tuning, and measure count;
3. identifies which tracks are supported, unsupported, or ambiguous;
4. allows the owner to choose one supported track;
5. then normalizes only that chosen track into the shared Guitar Eyes document;
6. preserves native iPhone focus after selection.

The first proof may stop at an explicit multiple-supported-tracks error. It may not silently select track zero.

## Fixture policy

Do not copy arbitrary alphaTab test files into Guitar Eyes.

A reviewed upstream GP5 test fixture was found to contain a transcription of a commercial song. It is unsuitable for this repository regardless of the alphaTab source license.

The clean fixture route is:

1. author a tiny original score in alphaTex;
2. load it with alphaTab;
3. export it through alphaTab’s GP7 exporter;
4. commit the resulting `.gp` binary as a Guitar Eyes project-authored CC0 fixture;
5. record the source alphaTex beside it;
6. verify deterministic semantic expectations after re-import.

Older GP3-GP6 fixture coverage must wait for original, public-domain, or clearly licensed specimens. Advertised importer recognition must not be represented as project-tested coverage until such fixtures exist.

## Related formats

### PowerTab `.ptb` and `.pt2`

alphaTab does not list PowerTab import.

Power Tab Editor 2 can read `.ptb`, `.pt2`, and Guitar Pro formats, but it is a desktop C++/Qt application under GPL-3.0. Reusing its parser directly would require a separate WebAssembly and licensing architecture and is not part of the Guitar Pro proof.

PowerTab therefore remains recognized but unsupported. A future route may use:

1. a separately evaluated direct parser;
2. an owner-performed conversion to Guitar Pro or MusicXML;
3. a future service only if the owner separately authorizes infrastructure and cost.

References:

- `https://github.com/powertab/powertabeditor`

### TuxGuitar `.tg`

TuxGuitar is a desktop Java application. Its documentation shows it can load Guitar Pro, PowerTab, TablEdit, and its own `.tg` format and can export selected exchange formats.

That makes TuxGuitar a useful external conversion tool, not a browser dependency for Guitar Eyes.

References:

- `https://www.tuxguitar.app/files/devel/desktop/help/file_formats.html`

### TablEdit `.tef`

TablEdit and TEFview can open Guitar Pro, PowerTab, MusicXML, and TEF material, but the TEF parser is not offered as an open browser library. TablEdit is a proprietary desktop/mobile application.

TablEdit can export ASCII and exchange formats, so owner-performed conversion is possible. Direct `.tef` import remains unsupported until a legally and technically suitable parser exists.

References:

- `https://tabledit.com/help/english/file_menu.shtml`
- `https://tabledit.com/help/english/export_ascii.shtml`

## Recommended checkpoint 3A

Implement a Guitar Pro 7 dependency-and-normalization proof with the following boundaries:

1. pin `@coderline/alphatab` `1.8.4` exactly;
2. create a project-authored alphaTex source and deterministic GP7 fixture;
3. add a dedicated worker that imports alphaTab lazily;
4. decode the GP7 bytes and return a small serializable intermediate representation, not the alphaTab model;
5. normalize exactly one unambiguous four- or six-string staff into the existing semantic document;
6. cover notes, open strings, chords, rests, measures, exact duration, tuning, and a small supported technique set;
7. enforce byte, time, track, bar, beat, and note limits;
8. retain existing unsupported messages for GP3-GP6 and GP8 until clearly licensed fixtures and explicit tests exist, even though alphaTab advertises those importers;
9. add third-party notices and verify that no renderer/audio assets are emitted;
10. run all inherited tests, new importer tests, production build, worker-chunk inspection, and artifact checks;
11. stop before publication and real-iPhone testing.

## Verdict

Proceed with checkpoint 3A.

alphaTab is suitable as a decoder behind a strict adapter. It is not suitable as a replacement interface or second application architecture. The most important risks—bundle weight, synchronous parsing, archive complexity, multi-track ambiguity, and fixture licensing—can be contained by lazy worker isolation, exact normalization rules, hard limits, and original fixtures.

# Legacy PowerTab `.ptb` Intake Evaluation

Date: August 10, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-legacy-ptb-intake-evaluation`

Exact branch base: `b77d65c35a1cb607b39ffc5be5204f9904b2c047`

Accepted runtime source inherited from the PowerTab v11 closure: `c2ada9bbdf118abddc894094734314f9b6048ea6`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Status: read-only format investigation complete enough to select the first bounded legacy target. No `.ptb` importer implementation, dependency, fixture adoption, workflow, hosted run, publication, pull request, merge, or upstream modification is authorized by this record.

## Purpose

The accepted modern PowerTab `.pt2` internal-version-11 checkpoint is closed. This evaluation determines what legacy `.ptb` actually means before Guitar Eyes changes source code.

The governing rule is recognition is not reading support. The `.ptb` extension must not be treated as one homogeneous format if the source format has distinct versions.

## Primary Power Tab Editor evidence

Pinned upstream repository: `powertab/powertabeditor`

Pinned release already used by Guitar Eyes: `2.0.22`

Pinned commit: `13cab27c7127d301f2747671071e53eb203dc940`

### Legacy importer boundary

Power Tab Editor 2.0.22 contains a separate importer at:

`source/formats/powertab_old/powertaboldimporter.cpp`

The importer identifies itself as `Power Tab 1.7 Document` and handles extension `.ptb`.

It loads the legacy binary into the preserved `PowerTabDocument` model, converts the guitar score, converts the bass score, and merges both into the current score model.

The application registers this legacy reader only as an importer. Its exporter list contains the modern PowerTab exporter, GP7 exporter, and MIDI exporter; there is no legacy `.ptb` exporter. Therefore ordinary current-editor save/export cannot be assumed to produce a canonical `.ptb` fixture.

### Legacy version map

The pinned legacy header defines four explicit file-version values:

1. `Version_1_0 = 1`, dated February 6, 2000;
2. `Version_1_0_2 = 2`, dated February 21, 2000;
3. `Version_1_5 = 3`, dated May 22, 2000;
4. `Version_1_7 = 4`, dated August 30, 2000.

The header deserializer does not treat them identically:

- versions 1.0 and 1.0.2 use the v1.0 header path;
- version 1.5 uses its own compatibility path;
- version 1.7 uses the current legacy header path.

Therefore a single `.ptb` specimen cannot establish compatibility with every legacy PowerTab version.

### Binary signature and serialization structure

The pinned source defines the PowerTab marker as `0x62617470`. On the original little-endian file format this corresponds to the four bytes `70 74 61 62`, ASCII `ptab`; this must still be verified against the first lawful fixture before Guitar Eyes codifies detection.

The version follows as a 16-bit value.

Unlike modern `.pt2`, legacy `.ptb` is a direct binary serialization rather than gzip-compressed JSON.

The preserved reader uses Microsoft/MFC-style serialization conventions, including:

- short or extended object counts;
- one-, two-, or four-byte string lengths;
- ISO-8859-1 source strings converted to UTF-8;
- MFC class and object tags;
- nested serialized guitar score and bass score structures;
- font settings, tablature line spacing, fade data, systems, staves, positions, notes, techniques, and related score objects.

This means a legacy implementation must be a bounded binary parser, not an adaptation of the modern `.pt2` gzip/JSON decoder.

## Independent TuxGuitar evidence

Current TuxGuitar contains a separate `TuxGuitar-ptb` module with its own Java parser and format detector.

The current detector defines the accepted signature as:

`ptab-4`

It reads four header bytes and a little-endian 16-bit version and accepts only value `4`, corresponding to PowerTab 1.7.

The TuxGuitar reader independently parses the same broad binary structures: score metadata, two legacy track sections, instruments and tunings, sections, bars, staves, positions, notes, and related notation data.

TuxGuitar is released under the GNU Lesser General Public License. Its source is useful as an independent behavioral and structural oracle; no TuxGuitar runtime code or parser should be copied into Guitar Eyes without a separate licensing and architecture decision.

## Upstream fixture evidence and copyright boundary

Power Tab Editor's own test suite contains many `.ptb` binaries covering headers, guitars, bass, staves, positions, notes, bends, barlines, tempo markers, alternate endings, player changes, and other notation.

Those files are valuable forensic evidence that the upstream importer is exercised extensively. However, the current inspection did not establish sufficiently explicit fixture-level copyright and provenance for Guitar Eyes to redistribute them as its canonical test corpus.

Therefore:

1. do not copy upstream `.ptb` test binaries into Guitar Eyes merely because they live in an open-source repository;
2. use upstream tests to understand structure and edge cases;
3. create project-authored musical content for the Guitar Eyes fixture;
4. preserve the exact generation method and deterministic hash;
5. validate the resulting binary with independent readers before treating it as source evidence.

## First bounded target decision

The first legacy PowerTab target is:

PowerTab `.ptb` version 1.7, exact file-version value `4`.

Reasons:

1. Power Tab Editor 2.0.22 names its old-format importer `Power Tab 1.7 Document`;
2. version 1.7 is the current version of the preserved legacy serializer/deserializer;
3. current TuxGuitar's independent detector accepts only `ptab-4`;
4. both mature independent implementations therefore converge on version 1.7 as the strongest initial compatibility boundary;
5. older 1.0, 1.0.2, and 1.5 files have explicit compatibility branches and must not be silently folded into the v1.7 claim.

## Proposed lawful fixture strategy

Do not depend on an upstream song file whose redistribution rights are unclear.

Create one small Guitar Eyes project-authored version-1.7 guitar fixture with the same semantic intent as the accepted modern PowerTab proof where practical:

1. standard six-string guitar;
2. a small number of explicit positions;
3. supported quarter, eighth, and half durations where the legacy serializer permits them;
4. open and fretted notes;
5. one rest;
6. one two-note chord;
7. one attached technique only if it can be encoded and independently verified without widening the initial parser.

Generation must be based on the documented legacy serialization structure, not copied fixture bytes.

Before any Guitar Eyes importer work, the generated binary must pass two independent evidence gates outside the browser application:

1. Power Tab Editor 2.0.22 legacy importer must open and interpret it as intended;
2. current TuxGuitar's independent `ptab-4` reader must accept it and agree on the bounded semantic facts used by Guitar Eyes.

If those readers disagree, stop and diagnose the serializer or profile. Do not write the Guitar Eyes importer around one reader's accidental behavior.

## Proposed Guitar Eyes architecture

After lawful fixture parity exists, implement a small browser-side `.ptb` v1.7 decoder behind a new importer boundary.

It must:

1. detect exact `ptab` marker and exact version value `4` before parsing;
2. reject versions 1, 2, and 3 explicitly rather than guessing;
3. parse only the binary structures required by the accepted fixture profile;
4. reject unsupported MFC structures, counts, techniques, score layouts, and malformed data safely;
5. normalize directly into the existing shared semantic tablature document;
6. reuse the existing reader, focus, position-description, measure, rest, chord, and selection contracts;
7. avoid importing Power Tab Editor or TuxGuitar renderer, playback, UI, or runtime models;
8. preserve the distinction between guitar and bass score sections and never silently select a player when more than one supported choice exists.

## Deliberately deferred legacy work

Do not include in the first checkpoint:

1. `.ptb` versions 1.0, 1.0.2, or 1.5;
2. arbitrary `.ptb` compatibility;
3. legacy bass acceptance unless the first lawful fixture and player-selection design intentionally include it;
4. extended or alternate tunings beyond the bounded fixture evidence;
5. every notation structure demonstrated by upstream tests;
6. modern `.pt2` changes;
7. TuxGuitar `.tg`;
8. TablEdit `.tef`;
9. playback, teacher mode, scoring, bookmarks, or AI instruction.

## Execution rules for the next step

No GitHub Actions run is justified during serializer, fixture, or parser exploration.

Use repository/source inspection and a capable unmetered/local execution environment for deterministic fixture generation and parity work. Preserve valid fixture evidence immediately. Apply the established circuit-breaker, fail-forward, intact-file transport, stream-recovery, and cross-repository known-solution rules.

Do not involve the owner in implementation or fixture generation. Real-iPhone VoiceOver testing belongs only after source implementation, focused tests, complete inherited tests, production build, artifact inspection, and one intentional hosted candidate have all passed.

## Exact next action

Build and verify one project-authored `.ptb` version-1.7 evidence specimen outside Guitar Eyes runtime code, using the pinned Power Tab Editor 2.0.22 legacy reader and current TuxGuitar `ptab-4` reader as independent semantic oracles. Stop for evidence review before implementing the browser importer.

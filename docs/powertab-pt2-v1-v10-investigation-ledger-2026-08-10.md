# PowerTab `.pt2` Internal Versions 1–10 Investigation Ledger

Date: 2026-08-10

Branch: `work/powertab-pt2-v1-v10-investigation`

Starting authority: `02f130f3c871de39d4c48c45d8c09f35980fba45`, the final documentation-closure head of `work/powertab-legacy-ptb-v1-v3-intake`.

This record is documentation-only. It does not broaden accepted runtime behavior. PowerTab `.pt2` support remains accepted only for internal version 11 until a later bounded implementation, automated proof, hosted proof, and real-iPhone VoiceOver acceptance checkpoint succeeds.

## Investigation boundary

The phase began read-only, as required by `AGENTS.md`. No GitHub Actions run, deployment, pull request, merge, or application-source modification preceded this record.

The investigation was performed against the pinned upstream producer source:

- repository: `powertab/powertabeditor`;
- Power Tab Editor release: `2.0.22`;
- commit: `13cab27c7127d301f2747671071e53eb203dc940`.

Upstream source code is GPLv3-or-later. Guitar Eyes fixture policy remains stricter: upstream binaries are treated as external evidence and are not copied into the project merely because surrounding source is licensed.

## Internal version lineage

The pinned producer defines one evolving `.pt2` gzip-plus-JSON serialization lineage:

1. `INITIAL_VERSION` — initial format;
2. `TEXT_ITEMS` — floating text items;
3. `VIEW_FILTERS` — removed legacy staff view type and added score view filters;
4. `LEFT_HAND_FINGERING` — note left-hand fingering;
5. `LEFT_HAND_FINGERING_THUMB` — thumb fingering value;
6. `SONG_SUBTITLE` — song subtitle;
7. `VOLUME_SWELLS` — position volume swell;
8. `TREMOLO_BAR` — position tremolo bar;
9. `CHORD_DIAGRAMS` — score chord diagrams;
10. `JSON_CLEANUP` — serialization cleanup for external parsers;
11. later chord-diagram description/label support, already accepted separately in Guitar Eyes.

The versions are therefore schema milestones in one lineage, not ten unrelated container formats.

## Historical producer commits

The version milestones are traceable to producer history:

- v1 clean pre-v2 source state: `8f780d0f36157e9209662908994c6c27ced184ff`;
- v2 floating text: `84236e64c72a6d933ef3ca3b358e28fef3786f07`;
- v3 view filters: `044c1d30ee6a0374e02154d47f7ebcc4b80296e8`;
- v4 version increment/check lineage: `17a2e1bf49a417f2dc5244f7a9868d24edc839ce`;
- v5 thumb fingering: `42d2f00195efd4bb7c5aae65b2d6e36a5b7db935`;
- v6 song subtitle: `0152c3320e48368e93752382d16fd4e1d71ef538`;
- v7 volume swell: `17219c446434f6ec0c6cb52e14770759219015de`;
- v8 tremolo bar: `bca17cbb1b2ddfbd1f273bb9eda427044ed7a446`;
- v9 chord diagrams: `228836ac7c18a59873d1c0231580c854d262e872`;
- v10 JSON cleanup: `ad7e051e1f1bb784c54b1ee564ef19682258dff8`.

## Producer-authentic fixture anchors

Direct inspection and decompression established producer-maintained `.pt2` anchors for these internal versions:

### Internal version 2

Path: `test/score/data/test_viewfilter.pt2`

Git blob: `47308dd3c20c3dcdef8a0689e4fa87725f9c9e3b`

Purpose in upstream tests: compatibility behavior around view filters.

### Internal version 3

Path: `test/formats/powertab_old/data/merge_multibar_rests_correct.pt2`

Git blob: `0366cbde357cfbcd4f733f8e4deebc962e8dea3c`

SHA-256: `a27e818576e0f0bf93fd06591d36259383ac1416b7f9da229072b67f37f61bab`

### Internal version 4

Path: `test/score/data/reordered.pt2`

Git blob: `2d19489e289070a550e2dcca36dcb500d702f7c9`

Purpose in upstream tests: prove deserialization does not depend on JSON key order.

### Internal version 6

Path: `test/actions/data/test_shiftstring.pt2`

Git blob: `8abdd8a882c3501f21d50a61e4de8eecb2bb6a64`

SHA-256: `4e8845791675714ba8d9f2f2660d1124e9400320adbda0dc38dfe81a35e257ce`

The upstream historical test manifests show no producer-authentic `.pt2` binaries for internal versions 5, 7, 8, 9, or 10. A repository-wide recursive inspection of the exact pre-v2 source tree found no `.pt2` binary at all for version 1.

Therefore the surviving upstream anchor set is versions 2, 3, 4, and 6. Versions 1, 5, and 7–10 require deterministic project-authored source-faithful specimens if they are to be tested without inventing provenance.

## Serialization boundary discovered

The container mechanism is stable: `.pt2` is gzip-compressed JSON. The important representation boundary is internal version 10.

Before version 10:

- non-`FileVersion` enums are JSON integers using the C++ enum's underlying value;
- enum-flag sets are bit strings produced by `std::bitset::to_string()` and read by the corresponding bitset constructor;
- absent trill and tapped-harmonic values may use the historical `-1` sentinel and are normalized by the producer loader to no value.

Beginning with version 10:

- ordinary enums are written as human-readable strings;
- the loader retains the integer-enum path specifically for older versions.

This supports one bounded historical compatibility/canonicalization layer rather than ten unrelated decoders.

## Exact field gates relevant to the bounded proof

The producer's serializer gates establish these schema transitions:

- version 1 has legacy staff `view_type` and no system `text_items`;
- version 2 adds system `text_items`;
- version 3 removes serialized staff `view_type` and adds score `view_filters`;
- version 4 adds note `finger_hint`;
- version 5 expands the left-hand-fingering enum with `Thumb` but does not add a new container field;
- version 6 adds song `subtitle`;
- version 7 adds position `volume_swell`;
- version 8 adds position `tremolo_bar`;
- version 9 adds score `chord_diagrams`;
- version 10 changes enum representation from integer to string.

The existing Guitar Eyes six-position proof does not need to exercise these later notation features to prove basic semantic parity. Unsupported nonempty structures should continue to fail explicitly rather than silently widening the accepted profile.

## Historical enum and flag evidence needed by the six-position proof

For the project-authored six-position score:

- clef `Treble` is historical enum value `0`;
- bar types `SingleBar` and `DoubleBar` are historical values `0` and `1`;
- key type `Major` is historical value `0`;
- meter type `Normal` is historical value `0`;
- duration values retain their musical numeric values: half `2`, quarter `4`, eighth `8`;
- position property `Rest` is enum-flag bit `2`;
- position property `PalmMuting` is enum-flag bit `13`.

The producer writes historical flag sets with `std::bitset::to_string()`, so the string representation and bit ordering are deterministic rather than heuristic.

## Fixture strategy

Use the already accepted Guitar Eyes fixture architecture rather than create a second mechanism.

The existing v11 fixture precedent contains:

- original project-authored musical source;
- exact source-derived serializer JSON;
- deterministic compact JSON;
- gzip level 9 with `mtime: 0`;
- `.pt2` binary;
- `.pt2.base64` transport copy;
- SHA-256 and byte-count manifest evidence;
- explicit distinction between source-derived proof and later editor-produced acceptance evidence.

For versions 1–10, create one project-authored six-position musical source and generate ten version-specific source-faithful JSON documents from the pinned producer schema. Materialize each deterministically as gzip `.pt2` plus a base64 transport twin and record exact hashes.

The committed project specimens must be described as source-derived structural evidence, not historical editor exports. The real upstream v2, v3, v4, and v6 binaries remain independent compatibility anchors and must not be relabeled as project fixtures or copied into the repository without separate licensing justification.

## Intended implementation boundary after this investigation

A later implementation checkpoint may:

1. preserve the existing v11 path and accepted behavior;
2. recognize exact internal versions 1 through 10 from decompressed source evidence;
3. canonicalize only the historical serialization differences needed by the existing bounded semantic reader;
4. preserve explicit rejection of unsupported musical structures;
5. normalize all ten project-authored specimens to the same six-position semantic contract as the accepted v11 proof;
6. keep exact version evidence in the semantic document and user-facing identification;
7. run focused tests before the complete inherited suite;
8. defer Actions, deployment, and real-iPhone VoiceOver acceptance until source gates pass.

This record does not authorize broader PowerTab bass, alternate tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, TuxGuitar, TablEdit, playback, teacher-mode, bookmark, scoring, or AI work.

# Historical PowerTab `.pt2` Internal Versions 1–10 Real-iPhone Acceptance

Date: August 11, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v1-v10-investigation`

Exact hosted source tested: `930d00831cb71b4fad6f4771f3009be8cb28670e`

Live candidate tested: `https://blindanatomist.github.io/guitar-eyes/`

Tester: John Washburn

Environment: real iPhone, Safari, VoiceOver

## Fixture set

The owner tested the ten deterministic project-authored source-derived `.pt2` fixtures under `fixtures/powertab-pt2-historical/`:

1. `powertab-pt2-v1-six-position.pt2`;
2. `powertab-pt2-v2-six-position.pt2`;
3. `powertab-pt2-v3-six-position.pt2`;
4. `powertab-pt2-v4-six-position.pt2`;
5. `powertab-pt2-v5-six-position.pt2`;
6. `powertab-pt2-v6-six-position.pt2`;
7. `powertab-pt2-v7-six-position.pt2`;
8. `powertab-pt2-v8-six-position.pt2`;
9. `powertab-pt2-v9-six-position.pt2`;
10. `powertab-pt2-v10-six-position.pt2`.

Their exact byte counts and SHA-256 values remain governed by `fixtures/powertab-pt2-historical/manifest.json`.

These are source-derived structural proof fixtures, not historical editor exports. Producer-maintained upstream internal-version 2, 3, 4, and 6 binaries remain independent external compatibility anchors and are not relabeled as project fixtures.

## Prior non-device gates

Before owner testing, the exact candidate had already passed:

1. deterministic generation of all ten historical fixtures;
2. fixture verification against manifest byte counts, hashes, and embedded internal versions;
3. focused PowerTab compatibility tests;
4. the complete inherited automated suite;
5. optimized production build;
6. production artifact inspection;
7. hosted GitHub Pages publication;
8. complete live JavaScript asset read-back, including lazy-loaded chunks;
9. exact historical `.pt2` compatibility marker verification.

The hosted-proof record is `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`.

## Owner observations

The owner reported after testing all ten files:

> “OK, I tested all 10 of those and they all loaded properly and were recognized and voiceover. Focus worked fine. It was good.”

This establishes the observed real-device results required by the bounded acceptance gate:

- every internal-version fixture 1 through 10 loaded successfully;
- the files were recognized correctly;
- VoiceOver behavior was good across the test set;
- post-load VoiceOver focus behaved correctly;
- no owner-observed failure was reported in the bounded six-position profile.

## Acceptance decision

The bounded real-iPhone Safari and VoiceOver gate passes for PowerTab `.pt2` internal versions 1 through 10 using the exact hosted source and fixture set identified above.

Together with the previously accepted internal version 11 checkpoint, Guitar Eyes now has bounded accepted `.pt2` coverage for internal versions 1 through 11.

This acceptance remains evidence-bounded. It does not establish arbitrary PowerTab compatibility or support for untested bass, alternate tuning, multiple players, multiple active voices, broader techniques, repeats, key-signature changes, meter changes, capo behavior, chord-diagram semantics, or other unproven structures.

Unsupported structures must continue to fail explicitly rather than be guessed.

No merge to fork `main`, pull request, upstream modification, playback reopening, teacher-mode work, or broader format claim is authorized by this acceptance record.

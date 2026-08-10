# Historical PowerTab `.ptb` fixture evidence

This directory contains three deterministic project-authored legacy PowerTab fixtures for the bounded historical Guitar Eyes intake.

- `powertab-v10-original-six-position.ptb`: file version 1 / PowerTab 1.0.
- `powertab-v102-original-six-position.ptb`: file version 2 / PowerTab 1.0.2.
- `powertab-v15-original-six-position.ptb`: file version 3 / PowerTab 1.5.

All three encode the same original two-measure, six-position, standard six-string guitar proof described in `powertab-historical-six-position.source.json`. Each binary has a text-safe base64 mirror.

The serializer is `scripts/generate-powertab-ptb-historical-proofs.mjs`. The wire layouts come from the pinned Power Tab Editor 2.0.22 compatibility reader at commit `13cab27c7127d301f2747671071e53eb203dc940`.

Validation boundary: deterministic regeneration and source-faithful execution of the pinned Power Tab Editor historical deserialization paths passed. A maintained independent parser clearly supporting file-version values 1-3 was not located, so this package does not claim independent-parser parity.

The Guitar Eyes implementation subsequently passed the inherited automated regression gate, production build, bounded Pages artifact inspection, hosted publication, live network read-back across all deployed JavaScript chunks, and real-iPhone Safari/VoiceOver acceptance.

Exact hosted and real-device source: `2682928366f587d5afac213e8e195ba0dfb602d8`.

Acceptance record: `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`.

These fixtures now support bounded accepted claims for PowerTab 1.0, 1.0.2, and 1.5 only within the demonstrated six-string guitar profile. They do not establish arbitrary legacy `.ptb` compatibility or independent-parser parity.

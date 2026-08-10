# Historical PowerTab `.ptb` fixture evidence

This directory contains three deterministic project-authored legacy PowerTab fixtures for the first bounded historical Guitar Eyes intake.

- `powertab-v10-original-six-position.ptb`: file version 1 / PowerTab 1.0.
- `powertab-v102-original-six-position.ptb`: file version 2 / PowerTab 1.0.2.
- `powertab-v15-original-six-position.ptb`: file version 3 / PowerTab 1.5.

All three encode the same original two-measure, six-position, standard six-string guitar proof described in `powertab-historical-six-position.source.json`. Each binary has a text-safe base64 mirror.

The serializer is `scripts/generate-powertab-ptb-historical-proofs.mjs`. The wire layouts come from the pinned Power Tab Editor 2.0.22 compatibility reader at commit `13cab27c7127d301f2747671071e53eb203dc940`.

Validation boundary: deterministic regeneration and source-faithful execution of the pinned Power Tab Editor historical deserialization paths passed. A maintained independent parser clearly supporting file-version values 1-3 was not located, so this package does not claim independent-parser parity.

These files are evidence only until the Guitar Eyes decoder, complete inherited suite, production build, hosted checkpoint, and real-iPhone VoiceOver gate pass.

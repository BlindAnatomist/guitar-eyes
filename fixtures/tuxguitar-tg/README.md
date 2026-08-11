# TuxGuitar `.tg` proof fixtures

This directory contains deterministic project-authored source-derived structural proofs for the first TuxGuitar `.tg` intake checkpoint.

The musical source is the existing CC0 six-position Guitar Eyes proof at `fixtures/powertab-v11/powertab-v11-original-six-position.source.json`. The target TuxGuitar generations are legacy 1.0, 1.1, 1.2, 1.3, 1.5, and modern file format 2.0.0.

The serializer rules are derived from stable TuxGuitar 2.0.1 source at pinned commit `533efa74e6a56bdae28bb776358305607c79cbff`.

Each fixture is project-authored source-derived structural evidence. None is a historical or current TuxGuitar application export, and none may be described as one. Each binary has a base64 transport twin and exact byte-count/SHA-256 evidence in `manifest.json`.

The legacy 0.7, 0.8, and 0.9 compatibility readers remain outside this first checkpoint because stable TuxGuitar 2.0.1 reads but does not export those generations.

No support claim follows from these fixtures alone. Focused tests, complete inherited regression, production build and artifact inspection, hosted proof, and bounded real-iPhone Safari/VoiceOver acceptance remain required.

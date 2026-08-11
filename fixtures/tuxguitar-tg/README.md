# TuxGuitar `.tg` proof fixtures

This directory contains deterministic project-authored source-derived structural proofs for the first TuxGuitar `.tg` intake checkpoint.

The musical source is the existing CC0 six-position Guitar Eyes proof at `fixtures/powertab-v11/powertab-v11-original-six-position.source.json`. The target TuxGuitar generations are legacy 1.0, 1.1, 1.2, 1.3, 1.5, and modern native file format 2.0.0.

The serializer and reader rules are derived from TuxGuitar 2.1.0 source at tag commit `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`.

Each fixture is project-authored source-derived structural evidence. None is a historical or current TuxGuitar application export, and none may be described as one. Each binary has a base64 transport twin and exact byte-count/SHA-256 evidence in `manifest.json`.

The modern fixture uses `version.txt` value `TuxGuitar_file_format 2.0.0`, application-version metadata 2.1.0, exactly the two producer-defined ZIP entries `version.txt` and `content.xml`, and the producer-required precise-time starting point. It remains source-derived evidence rather than an application export.

The legacy 0.7, 0.8, and 0.9 compatibility readers remain outside this first checkpoint because TuxGuitar 2.1.0 reads but does not register writers for those generations. No native 1.4 compatibility module is registered in the current compatibility layer.

No support claim follows from these fixtures alone. Focused tests, complete inherited regression, production build and artifact inspection, hosted proof, and bounded real-iPhone Safari/VoiceOver acceptance remain required.

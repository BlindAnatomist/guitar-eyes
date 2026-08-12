# TuxGuitar standard-bass proof corpus

This directory contains project-authored, deterministic evidence for the bounded Guitar Eyes standard four-string bass checkpoint across the already accepted TuxGuitar native generations 1.0, 1.1, 1.2, 1.3, 1.5, and modern file format 2.0.0.

The musical source is `source.json`, licensed CC0-1.0. It describes one standard four-string bass track in G2 D2 A1 E1 tuning, bass clef, two 4/4 measures, six semantic positions, one rest, one palm-muted open D, and a final two-note chord. The corpus does not copy an upstream song or fixture.

The binary serializers are source-derived from the exact TuxGuitar producer implementation already pinned by the accepted guitar checkpoint:

- upstream repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact source commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`.

Producer-source evidence additionally establishes that the compatibility writer permits four through seven strings and that the TuxGuitar model defines bass clef distinctly. The standard four-string tuning is `43,38,33,28` MIDI high to low.

Each `.tg` binary has a `.base64` transport twin. `manifest.json` records byte counts, SHA-256 hashes, producer authority, and the exact bounded profile. The modern 2.0 archive also preserves an audited `content.xml` twin.

These files are source-derived evidence, not application-exported files; `producerExported` therefore remains false. They prove the project decoder against the pinned producer serialization rules and must not be described as arbitrary TuxGuitar bass compatibility.

# Historical PowerTab `.pt2` proof fixtures

This directory is reserved for deterministic, project-authored structural proof fixtures for PowerTab `.pt2` internal versions 1 through 10.

The musical source is the existing CC0 six-position Guitar Eyes PowerTab proof at:

`fixtures/powertab-v11/powertab-v11-original-six-position.source.json`

Generation is performed by:

`node scripts/generate-powertab-pt2-historical-proofs.mjs`

The generator applies only the version-specific serialization changes proven from the pinned Power Tab Editor 2.0.22 source at commit `13cab27c7127d301f2747671071e53eb203dc940`. It then writes, for each internal version 1 through 10:

- the source-derived JSON document;
- a deterministic gzip `.pt2` binary using level 9 and `mtime: 0`;
- a base64 transport twin of that binary;
- deterministic SHA-256 and byte-count evidence in `manifest.json`.

These files are project-authored source-derived structural evidence. They are not historical editor exports and must never be described as such.

Producer-maintained upstream `.pt2` binaries for internal versions 2, 3, 4, and 6 remain independent external compatibility anchors. They are not copied into this directory merely because the surrounding upstream source is GPL-licensed.

No support claim follows from fixture generation alone. Runtime support remains provisional until focused tests, the complete inherited suite, production build and artifact inspection, hosted proof, and bounded real-iPhone VoiceOver acceptance all succeed.

# Third-Party Notices

## alphaTab

Package: `@coderline/alphatab`

Pinned version: `1.8.4`

Copyright: Daniel Kuschny and alphaTab contributors

License: Mozilla Public License 2.0

Project site: `https://www.alphatab.net/`

Source repository: `https://github.com/CoderLine/alphaTab`

Published package: `https://www.npmjs.com/package/@coderline/alphatab/v/1.8.4`

License text: `https://www.mozilla.org/MPL/2.0/`

Guitar Eyes uses the published alphaTab package unchanged as a lazy Guitar Pro decoder. Guitar Eyes does not use alphaTab as its reader interface, renderer, playback engine, cursor, notation editor, or teaching system. No alphaTab font, soundfont, rendering worker, audio worklet, or playback asset is intentionally included in this checkpoint.

The complete corresponding alphaTab source is available through the source repository above. Any future modification of alphaTab-covered files must remain available under MPL-2.0. Guitar Eyes source files that merely call alphaTab through its public APIs remain governed by the Guitar Eyes repository's own applicable terms.

## slundi/guitarpro

Repository: `https://github.com/slundi/guitarpro`

Pinned fixture-generation commit: `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`

License: MIT

Tool used: `score_tool convert`

Guitar Eyes uses this project only in a bounded development-time fixture-generation gate. It converts one Guitar Eyes project-authored, CC0 MusicXML score into original GP3, GP4, GP5, GP6 GPX, and GP7 shared `.gp` specimens. The resulting binary fixtures are independently decoded by pinned alphaTab before they can become repository evidence.

`slundi/guitarpro` is not an npm dependency, browser dependency, worker dependency, runtime parser, application importer, renderer, player, or musical model in Guitar Eyes. Its Rust source, executable, and transitive build dependencies must not enter the production bundle or hosted application.

## Power Tab Editor

Repository: `https://github.com/powertab/powertabeditor`

Pinned release: `2.0.22`

Pinned commit: `13cab27c7127d301f2747671071e53eb203dc940`

License: GNU General Public License 3.0

Guitar Eyes consults the pinned Power Tab Editor source as authoritative evidence for the modern `.pt2` gzip, JSON, version, and score-field structure. The source-checkpoint parser is an independently written, bounded browser implementation that normalizes verified data into the existing Guitar Eyes semantic document.

No Power Tab Editor source file, compiled decoder, Qt interface, renderer, notation font, MIDI engine, playback code, or other runtime asset is copied into or distributed with Guitar Eyes by this checkpoint. The project-authored fixture is CC0 musical content encoded from the documented serializer structure; it remains provisional until reproduced through the pinned editor release.

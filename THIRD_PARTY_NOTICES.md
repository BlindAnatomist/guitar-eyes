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

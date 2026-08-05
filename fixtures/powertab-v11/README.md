# PowerTab v11 Fixture Evidence

This directory contains a project-authored PowerTab 2 version 11 structural specimen for the bounded Guitar Eyes source checkpoint.

The musical content is original test material and is dedicated to the public domain under CC0-1.0. It is not a transcription of a copyrighted composition.

The `.source.json` file records the exact version-11 serializer shape derived from the pinned Power Tab Editor 2.0.22 source at commit `13cab27c7127d301f2747671071e53eb203dc940`. The generator writes canonical compact JSON and gzip-compresses it deterministically.

The resulting `.pt2` is source-derived evidence, not yet an editor-exported canonical acceptance fixture. It may prove decoder, rejection, inventory, and semantic-normalization behavior during the source checkpoint. It must not be used by itself to claim general PowerTab support.

A later acceptance gate must reproduce the same original score through the pinned Power Tab Editor release, compare the decompressed structure and semantic result, record the editor environment, and replace or supplement this provisional specimen with editor-produced evidence.

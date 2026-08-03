# Real-World Tablature Corpus

These fixtures reproduce structural patterns found in actual tablature workflows while using original musical content created for Guitar Eyes.

They are not transcriptions of copyrighted songs.

## Rules

1. Every committed fixture must identify its provenance and license in `corpus-manifest.json`.
2. Commercial-site tabs and user-owned files remain external or private unless explicit repository permission exists.
3. A fixture should be as small as possible while preserving the format feature under test.
4. Current support and future expectations must be recorded separately. A fixture may deliberately expose a feature Guitar Eyes does not yet understand.
5. Binary or archived fixtures require a checksum and file-level licensing review before they are committed.

## Current ASCII coverage

- `ascii-webpage-mixed-content.txt`: common copied-page debris around two guitar blocks.
- `ascii-rhythm-line.txt`: duration symbols above an ASCII block.
- `ascii-techniques-and-annotations.txt`: technique and performance annotation lines.
- `ascii-bass-with-metadata.txt`: four-string bass embedded in metadata.
- `ascii-seven-string-guitar.txt`: exact octave-qualified standard seven-string guitar.
- `ascii-eight-string-guitar.txt`: exact octave-qualified standard eight-string guitar.
- `ascii-five-string-bass.txt`: exact octave-qualified standard five-string bass.
- `ascii-six-string-bass.txt`: exact octave-qualified standard six-string bass.
- Additional fixtures cover explicit measures, custom tuning, Unicode accidentals, unsupported punctuation, unsafe tuning order, and false-positive rejection.

## Structured coverage

- `musicxml-minimal-guitar-tab.musicxml`: minimal structured tablature target.
- `musicxml-chord-rest-two-measures.musicxml`: chord, rest, technique, and measure evidence.
- Project-authored `.gp` fixtures provide the bounded Guitar Pro shared-archive proof recorded in the manifest.

# PowerTab standard four-string bass proof corpus

This directory contains the project-authored, CC0-1.0 canonical source and expected deterministic manifest for the bounded Guitar Eyes PowerTab standard-bass checkpoint.

Run:

`node scripts/generate-powertab-standard-bass-proofs.mjs <output-directory>`

The generator materializes five real PowerTab binary fixtures and their base64 mirrors into the requested output directory. The generated `manifest.json` must match `manifest.expected.json` exactly before the binaries are used as evidence.

The five proven source generations are:

- legacy `.ptb` file version 1 / PowerTab 1.0;
- legacy `.ptb` file version 2 / PowerTab 1.0.2;
- legacy `.ptb` file version 3 / PowerTab 1.5;
- legacy `.ptb` file version 4 / PowerTab 1.7;
- modern `.pt2` internal version 11 using the Power Tab Editor 2.0.22 data model.

All five encode the same two-measure, six-position semantic proof in exact standard four-string bass tuning G2 D2 A1 E1. The proof contains four single-note events, one half-note rest, and one final two-note chord. The modern v11 source also carries the already-supported palm-mute property on the fourth position.

Legacy PowerTab stores guitar and bass as separate score slots. These bass-only fixtures leave the guitar score empty and populate the bass score. The PowerTab 1.7 fixture additionally uses content-type bit `0x02` for bass. Its staff byte is `0x14`: bass clef in the high nibble plus four tablature strings in the low nibble.

This corpus does not establish alternate bass tunings, five- or six-string bass, mixed guitar-and-bass scores, multiple bass players, multiple active voices, or broader PowerTab notation support.

# Legacy PowerTab `.ptb` v1.7 Source-Oracle Evidence Result — 2026-08-10

## Scope

This record closes the bounded evidence phase for the first legacy PowerTab `.ptb` version-1.7 specimen.

It does not implement `.ptb` support, change the accepted `.pt2` baseline, modify `main`, open a pull request, merge, deploy, or dispatch GitHub Actions.

## Recovery authority

A stream interruption occurred during the evidence phase. Before resuming, the repository interruption rule was applied: reconstruct repository, branch, exact head, completed work, active or queued runs, preserved evidence, and the remaining gate from repository state rather than conversational momentum.

Recovered state before repair:

- repository: `BlindAnatomist/guitar-eyes`;
- branch: `work/powertab-legacy-ptb-intake-evaluation`;
- head: `d910f6fa1589330278c70d614cc20d8b5d93e911`;
- fork `main`: `60c2e5de0887b1bcdd426d932632946edd07d3c3`;
- active or queued branch Actions: none;
- accepted PowerTab `.pt2` authority remained untouched.

The applicable interruption doctrine was already present in Guitar Eyes `AGENTS.md`; Music Vault and Hollow & Hoard were consulted as corroborating cross-repository authority. No duplicate governance document was added.

## Evidence defect discovered by recovery

The provisional evidence commit was internally inconsistent.

The committed source JSON, generator, verifier, README, and manifest described the intended 723-byte two-measure specimen with an internal legacy barline at coordinate 50. The committed binary and base64 mirror instead contained an older 698-byte one-measure intermediate.

This was a mixed-generation evidence defect, not a parser failure.

The repair preserves the newer generation and replaces only the stale binary/base64 payload. It does not rewrite current provenance around the older intermediate.

## Canonical specimen after repair

- PowerTab file version: `4` / PowerTab `1.7`;
- signature bytes: `70 74 61 62 04 00` (`ptab-4`);
- bytes: `723`;
- SHA-256: `9cd2e677b8898900822afad4160acc004b5bbea70a57f0b62f412e5a52ce2216`;
- project-authored musical content;
- standard tuning MIDI high-to-low: `64, 59, 55, 50, 45, 40`;
- one internal barline at coordinate `50`;
- six positions;
- one half-note rest;
- six notes total;
- final position is a two-note half-note chord.

The committed generator deterministically reproduces that exact byte count and SHA-256. The committed verifier passes that regenerated specimen.

## Power Tab Editor source oracle

Pinned source authority:

- repository: `powertab/powertabeditor`;
- release: `2.0.22`;
- pinned commit inspected during intake: `13cab27c7127d301f2747671071e53eb203dc940`;
- legacy source family: `source/formats/powertab_old/powertabdocument`.

A compiled local harness used the pinned 2.0.22 v1.7 deserialization order and field layouts for the structures present in this bounded fixture. It parsed the complete 723-byte document and reported:

- version `4`;
- title `Guitar Eyes PTB 1.7 Proof`;
- artist `Guitar Eyes`;
- one guitar, one system, zero bass guitars;
- tuning `64,59,55,50,45,40`;
- one internal barline at position `50`;
- six positions;
- one rest;
- six notes total;
- final chord: high-E open plus B-string fret 1;
- document line spacing `9`.

This is source-faithful compiled deserialization evidence. It is not a claim that the full Power Tab Editor graphical application was launched.

## TuxGuitar independent source oracle

The exact TuxGuitar parser source was executed locally, not translated or reimplemented:

- `PTInputStream.java` Git blob: `163098a3a8c07100ae49ce8179a813ae48da5380`;
- `PTFileFormatDetector.java` Git blob: `1ab1bad2c77e767d99d3b21658e2611b45d70ed0`;
- the same blob identities were verified at TuxGuitar tag `2.0.1` and in the later inspected source;
- detector boundary: exact `ptab-4`.

Only surrounding TuxGuitar model/API classes were stubbed so the unchanged parser source could execute. The parser reported:

- title and artist correct;
- one track-info entry;
- tuning `64,59,55,50,45,40`;
- one section;
- six beats;
- one rest;
- six notes total;
- bar positions `0, 50, 71`, where 0 is the start bar, 50 is the canonical internal measure boundary, and 71 is the reader's synthesized terminal bar position;
- all six event coordinates, durations, strings, and frets matched the project source.

This is execution of the exact independent parser source. It is not a claim that the full TuxGuitar application UI was launched.

## Decision

The canonical v1.7 fixture now has strong dual-source execution parity and the provisional mixed-generation defect is repaired.

Legacy `.ptb` remains unsupported in Guitar Eyes at this point. The evidence phase stops here for owner review before any browser importer implementation begins.

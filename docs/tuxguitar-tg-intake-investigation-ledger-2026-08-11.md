# TuxGuitar `.tg` Intake Investigation Ledger

Date: August 11, 2026

Branch: `work/tuxguitar-tg-intake-investigation`

Starting authority: `10a0d7f40eedf701d55e519b8a311c1816d4e077`, the documentation-closure head of the accepted historical PowerTab `.pt2` internal-version 1–10 checkpoint.

This record is research-only. It does not broaden accepted runtime behavior.

## Preflight and governance

Before implementation, the current Guitar Eyes governance set was reviewed, including `AGENTS.md`, `BRANCH_AUTHORITY.md`, `docs/implementation-status.md`, the canonical known-problems register, all six known-problems addenda, the cross-repository execution-governance reconciliation, the zero-dollar automation policy, the shared-semantic-core plan/checkpoint, accepted convergence records, and lineage-recovery guidance.

The branch was created only after verifying the source authority and confirming there were no active or queued Actions runs. No exploratory Actions run or deployment preceded this record.

The inherited rules remain authoritative: one shared semantic tablature document, recognition is not reading support, exact version evidence, lawful fixtures, explicit safe rejection, no format-specific reader fork, focused proof before complete proof, no exploratory hosted workflow loops, and real-iPhone Safari/VoiceOver acceptance before a support claim.

## Pinned producer authority

Official producer repository: `helge17/tuxguitar`

Stable producer release: TuxGuitar 2.0.1

Pinned tag commit: `533efa74e6a56bdae28bb776358305607c79cbff`

Repository license at that commit: GNU Lesser General Public License 2.1.

The producer's current development line contains unreleased 2.1.0 work, but this checkpoint is deliberately pinned to stable 2.0.1 rather than development source.

## Native `.tg` format families

TuxGuitar 2.0.0 introduced a new native file format that older TuxGuitar versions cannot read. Stable 2.0.1 can still export older `.tg` generations for compatibility.

### Modern 2.0 format

The pinned source defines native format major version 2 with file-format version `2.0.0`.

The container is ZIP-based and contains at least:

- `version.txt`;
- `content.xml`.

`version.txt` uses prefix `TuxGuitar_file_format` followed by the semantic version. The producer detector opens the ZIP, reads `version.txt`, and recognizes major version 2 rather than trusting the `.tg` extension.

The stable reader rejects older major versions from this route, rejects future major versions, and marks a future minor version as newer. Guitar Eyes should initially make a narrower evidence-bounded claim for the exact modern version demonstrated by its fixtures rather than inheriting an open-ended future-2.x claim.

### Legacy binary formats retained by stable 2.0.1

The compatibility module registers readers for eight historical binary families:

1. displayed TuxGuitar 0.7, header `TG_DEVEL-0.01`;
2. TuxGuitar 0.8, header `TG_DEVEL-0.8`;
3. TuxGuitar 0.9, header `TuxGuitar File Format - 0.9`;
4. TuxGuitar 1.0, header `TuxGuitar File Format - 1.0`;
5. TuxGuitar 1.1, header family `TuxGuitar File Format - 1.1`;
6. TuxGuitar 1.2, header family `TuxGuitar File Format - 1.2`;
7. TuxGuitar 1.3, header family `TuxGuitar File Format - 1.3`;
8. TuxGuitar 1.5, header family `TuxGuitar File Format - 1.5`.

There is no stable compatibility reader directory for 1.4 or 1.6.

The legacy detector reads a length-prefixed Java `DataInputStream` string and requires an exact match against the registered version string. Guitar Eyes must likewise identify supported legacy versions from file evidence and reject unknown headers rather than guess.

## Producer export boundary

Stable 2.0.1 registers legacy writers only for:

- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5.

Versions 0.7, 0.8, and 0.9 are read-only compatibility families in stable 2.0.1.

The documented Batch File Converter is GUI-driven. It loads supported input files and saves/exports to an installed destination format, but the documentation does not establish a noninteractive command-line conversion interface.

## Initial implementation boundary

The first implementation checkpoint will target the six producer-writable/native generations most relevant to current users:

1. legacy 1.0;
2. legacy 1.1;
3. legacy 1.2;
4. legacy 1.3;
5. legacy 1.5;
6. modern 2.0.

The retained 0.7–0.9 readers are preserved as a later archaeological compatibility phase rather than silently included in the first claim without producer-writable evidence.

All six target generations must normalize to the existing Guitar Eyes semantic document and preserve the accepted six-position proof contract. Unsupported structures must fail explicitly instead of broadening the profile by accident.

## Fixture/evidence strategy

Use the existing Guitar Eyes project-authored CC0 six-position musical proof as the musical source.

For source-derived fixtures, preserve exact generator source, version-specific serialization evidence, byte counts, hashes, and a clear `producerExported: false` distinction.

Where the pinned producer writer can be executed in a controlled capable environment, producer-written legacy 1.0/1.1/1.2/1.3/1.5 and modern 2.0 outputs should become stronger compatibility anchors. No source-derived fixture may be relabeled as a TuxGuitar application export.

No support claim follows from fixture generation or focused parser tests alone. Acceptance still requires complete inherited regression, production build and artifact inspection, hosted proof/read-back, and bounded real-iPhone VoiceOver testing.

## Deferred within `.tg`

TuxGuitar 0.7, 0.8, and 0.9 remain separately deferred after the primary six-generation checkpoint unless stronger fixture evidence is obtained earlier.

This work does not authorize TablEdit, Guitar Pro 1/2, playback, teacher mode, scoring, bookmarks, AI instruction, or a merge to fork `main`.
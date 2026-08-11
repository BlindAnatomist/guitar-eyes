# TuxGuitar `.tg` Intake Investigation

Date: 2026-08-11

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tuxguitar-tg-intake-investigation`

Accepted base and branch starting point: `10a0d7f40eedf701d55e519b8a311c1816d4e077`

Status: read-only format and provenance investigation complete enough to define the first implementation checkpoint; no `.tg` application support is claimed by this record.

## Governance preflight

This investigation began only after reviewing the active repository authority and known-problems records, including:

- `AGENTS.md`;
- `BRANCH_AUTHORITY.md`;
- `docs/implementation-status.md`;
- `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
- `docs/known-problems-register-addendum-execution-gates.md`;
- `docs/known-problems-register-addendum-semantic-convergence.md`;
- `docs/known-problems-register-addendum-guitar-pro-selection.md`;
- `docs/known-problems-register-addendum-powertab-source-evidence.md`;
- `docs/known-problems-register-addendum-audible-execution.md`;
- `docs/known-problems-register-addendum-duplicate-control-descriptions.md`;
- `docs/cross-repository-execution-governance-reconciliation-2026-08-05.md`;
- `docs/solved-problems-and-reusable-procedures.md`;
- `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
- the accepted shared-semantic-core and convergence records.

The branch was created directly from the final PowerTab documentation-closure head. No GitHub Actions run, deployment, pull request, merge, or upstream modification was performed.

## Governing architecture

`.tg` must follow the existing pipeline:

`source -> version/container validation -> bounded TuxGuitar intermediate -> shared semantic tablature document -> existing reader adapters`

No TuxGuitar-specific iPhone reader, desktop reader, speech system, playback system, or alternate musical model is permitted.

The existing `src/structuredTabReaderDocuments.js` is the correct high-level insertion boundary for `.tg`. The format is already reserved as `tuxguitar` in `src/tabFormatDetector.js`.

## Producer authority

Producer repository inspected: `helge17/tuxguitar`.

Pinned producer release for this investigation: TuxGuitar `2.1.0`.

TuxGuitar 2.0.0 introduced a new native `.tg` format that older TuxGuitar versions cannot read. Current TuxGuitar retains compatibility readers for historical native formats and explicitly permits exporting older `.tg` formats through File -> Export.

TuxGuitar identifies its license as GNU Lesser General Public License 2.1. The preferred Guitar Eyes architecture is therefore an independently written bounded decoder informed by format behavior and source evidence rather than copying the producer's Java implementation into the browser application.

## Modern `.tg` format

The current native writer uses a ZIP container with exactly two files:

1. `version.txt`;
2. `content.xml`.

The current embedded native file-format version is `2.0.0`.

The TuxGuitar 2.1.0 reader:

1. reads internal version evidence from `version.txt`;
2. rejects native major versions below 2 in the modern reader;
3. rejects future major versions above 2;
4. treats a higher minor version as newer-format evidence rather than inferring compatibility from the `.tg` extension;
5. parses `content.xml` only after the version gate.

The producer requires the modern ZIP container to contain exactly those two archive entries. Missing, duplicate-by-count, or extra archive content is not accepted as the modern native container.

The producer's XML path disables DOCTYPE declarations and XInclude. Guitar Eyes must preserve equivalent safe-XML behavior and must not evaluate embedded code, classes, entities, scripts, or executable material.

## Historical native-format matrix in TuxGuitar 2.1.0

Current compatibility readers are registered for:

- 0.7;
- 0.8;
- 0.9;
- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5.

Current compatibility writers/exporters are registered for:

- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5.

No native 1.4 compatibility module is present in the current compatibility registration.

Historical internal signatures are not uniform. Evidence inspected includes:

- 0.7 reader: `TG_DEVEL-0.01`;
- 0.8: `TG_DEVEL-0.8`;
- 0.9: `TuxGuitar File Format - 0.9`;
- 1.0: `TuxGuitar File Format - 1.0`;
- 1.1: `TuxGuitar File Format - 1.1`;
- 1.2: `TuxGuitar File Format - 1.2`;
- 1.3: `TuxGuitar File Format - 1.3`;
- 1.5: `TuxGuitar File Format - 1.5`.

Therefore version detection must use internal evidence before normalization. File extension alone is never support proof.

## First compatibility checkpoint

The recommended first `.tg` implementation corpus is:

1. current native 2.x container, bounded initially to exact major-version-2 evidence and the producer-proven profile;
2. legacy native 1.0;
3. legacy native 1.1;
4. legacy native 1.2;
5. legacy native 1.3;
6. legacy native 1.5.

Versions 0.7, 0.8, and 0.9 are deferred to a separate archival checkpoint because current TuxGuitar can read them but does not register writers for them. They require separate lawful producer or historical-fixture provenance rather than inference from the later writers.

This checkpoint does not create or imply a TuxGuitar 1.4 route.

## Fixture provenance plan

Use one small project-authored musical proof score whose semantics are owned and known by Guitar Eyes.

Produce canonical `.tg` binaries with the pinned TuxGuitar producer path:

- save the proof score in the current native format;
- export the same score through the producer's registered 1.0, 1.1, 1.2, 1.3, and 1.5 native exporters.

For every binary preserve:

- producer release and source authority;
- generation method;
- exact byte count;
- SHA-256 hash;
- internal version/signature evidence;
- a structural audit;
- the expected shared semantic positions;
- any notices required for bundled third-party producer evidence.

Do not call a hand-constructed serializer-shaped file a producer export. Do not adopt an upstream or third-party song fixture without an explicit file-level provenance and redistribution decision.

## Existing Guitar Eyes machinery to reuse

Guitar Eyes already contains a bounded ZIP implementation in `src/compressedMusicXmlImporter.js` with:

- archive-size limits;
- entry-count and central-directory limits;
- ZIP64 rejection;
- encryption rejection;
- compression-method validation;
- local/central filename and size consistency checks;
- extraction-size limits;
- safe relative-path handling;
- entity/DOCTYPE rejection for XML parsing.

Modern `.tg` should reuse or extract the generic safe ZIP primitives from that accepted implementation rather than add a new archive dependency merely for TuxGuitar.

The structured-format route should remain lazy and normalize into the existing semantic document. Existing desktop and iPhone readers should not need TuxGuitar-specific musical interpretation.

## Safe first semantic profile

The first producer-authored proof should remain deliberately small and comparable with prior format checkpoints:

- one supported six-string guitar track;
- standard tuning;
- one active voice;
- a small sequence containing fretted notes, an open string, a simultaneous chord, a rest, and supported durations;
- ordinary 4/4 measure structure;
- no requirement to interpret every TuxGuitar effect or composition feature.

Any additional track, alternate tuning, multiple active voices, unsupported technique, repeat structure, key/meter change, percussion/drum semantics, chord diagram, automation, embedded class/material, or other unproved structure must be rejected or preserved as explicitly unsupported rather than guessed.

If producer-authentic evidence shows that a broader structure is necessary even for this minimal score, the checkpoint must document that structure before implementation widens.

## Security boundary

TuxGuitar 2.1.0 records a `.tg` security fix in its release history. This investigation does not infer an unproved exploit mechanism from that note.

Guitar Eyes must nevertheless use a data-only decoder:

- no Java class loading;
- no object deserialization runtime;
- no dynamic evaluation;
- no script execution;
- no external resource loading;
- bounded archive and text sizes;
- strict internal-version evidence;
- explicit rejection of malformed or unsupported structures.

## Execution boundary

No GitHub Actions work is authorized for exploratory `.tg` diagnosis.

The next work should occur in the least expensive capable environment and should stop before hosted acceptance until:

1. canonical producer-authentic fixtures exist and are hashed/audited;
2. source-version detection is deterministic;
3. the bounded decoder and normalizer pass focused tests;
4. inherited reader contracts remain intact;
5. the complete automated suite and production build pass outside exploratory hosted execution where possible.

Only then is one intentional hosted acceptance checkpoint appropriate. Real-iPhone Safari and VoiceOver acceptance remains required before `.tg` support can be claimed.

## Current verdict

Read-only format-family investigation: sufficient to proceed.

Application implementation: not yet begun by this record.

Recommended next action: materialize the producer-authentic six-file corpus for native 2.x, 1.0, 1.1, 1.2, 1.3, and 1.5, audit the binaries, then implement one version-evidenced TuxGuitar intake path into the existing shared semantic document.

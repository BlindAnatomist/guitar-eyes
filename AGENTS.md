# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

Last reconciled: August 11, 2026.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as the clean upstream-tracking branch at `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Do not open a pull request or merge any work branch without the owner's explicit authorization.
- Preserve failed and superseded branches as evidence; do not resume feature work from them.
- The accepted format-only operational baseline is `work/powertab-pt2-v1-v10-investigation`.
- The accepted exact hosted and real-device source for the latest historical PowerTab checkpoint is `930d00831cb71b4fad6f4771f3009be8cb28670e`.
- The previous accepted historical PowerTab `.ptb` 1.0 / 1.0.2 / 1.5 source is `2682928366f587d5afac213e8e195ba0dfb602d8` on `work/powertab-legacy-ptb-v1-v3-intake`.
- The previous accepted legacy PowerTab 1.7 source is `937cf3892d279e54f98802f1eb649333f4b1935c` on `work/powertab-legacy-ptb-intake-evaluation`.
- The previous accepted PowerTab `.pt2` internal-version-11 source is `c2ada9bbdf118abddc894094734314f9b6048ea6` on `work/powertab-pt2-v11-clean-convergence`.
- Documentation-only closure commits do not silently broaden accepted runtime behavior.
- Future format investigation must begin on a new work branch created from the final documentation-closure head of `work/powertab-pt2-v1-v10-investigation`, not from fork `main`, an earlier accepted branch, a forensic PowerTab branch, or a playback experiment.

## Current product boundary

Guitar Eyes is currently a format-only semantic tablature reader.

The accepted baseline includes:

1. ASCII `.txt` and `.tab`:
   - six-string guitar within the accepted general profile;
   - seven-string guitar in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1`;
   - eight-string guitar in exact standard octave-qualified tuning `E4 B3 G3 D3 A2 E2 B1 F#1`;
   - four-string bass within the accepted general profile;
   - five-string bass in exact standard octave-qualified tuning `G2 D2 A1 E1 B0`;
   - six-string bass in exact standard octave-qualified tuning `C3 G2 D2 A1 E1 B0`.
2. Uncompressed `.musicxml` and `.xml` tablature within the accepted bounded profile.
3. Compressed MusicXML `.mxl` through the accepted compressed-import route.
4. Guitar Pro 3 `.gp3`.
5. Guitar Pro 4 `.gp4`.
6. Guitar Pro 5 `.gp5`.
7. Guitar Pro 6 `.gpx`.
8. Guitar Pro 7 shared `.gp` archives within the verified version-neutral intake boundary.
9. PowerTab `.pt2` internal versions 1 through 11 within the accepted bounded, version-evidenced profiles.
10. Legacy PowerTab `.ptb` file version 1 / PowerTab 1.0 within the accepted bounded historical profile.
11. Legacy PowerTab `.ptb` file version 2 / PowerTab 1.0.2 within the accepted bounded historical profile.
12. Legacy PowerTab `.ptb` file version 3 / PowerTab 1.5 within the accepted bounded historical profile.
13. Legacy PowerTab `.ptb` file version 4 / PowerTab 1.7 within the accepted bounded profile.

The Guitar Pro claim remains bounded by the lawful project-authored five-file corpus and accepted evidence. It is not a claim of arbitrary compatibility with every Guitar Pro file.

The PowerTab claims remain bounded to the exact accepted `.pt2` internal-version 1-through-11 evidence profiles and the version-specific `.ptb` evidence profiles. They are not claims of arbitrary PowerTab compatibility or unaccepted bass, alternate-tuning, multi-player, multi-voice, and notation profiles.

Playback experiments, Iowa samples, procedural sound, playback controls, teacher mode, bookmarks, practice scoring, and AI instruction remain outside this accepted baseline.

## Required continuity reading

Before changing implementation, accessibility, repository administration, deployment, workflows, importers, dependencies, playback, teacher mode, or future AI work, read at minimum:

1. `BRANCH_AUTHORITY.md`;
2. `docs/implementation-status.md`;
3. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
4. `docs/known-problems-register-addendum-guitar-pro-selection.md`;
5. `docs/known-problems-register-addendum-execution-gates.md`;
6. `docs/cross-repository-execution-governance-reconciliation-2026-08-05.md`;
7. `docs/known-problems-register-addendum-semantic-convergence.md`;
8. `docs/solved-problems-and-reusable-procedures.md`;
9. `docs/shared-semantic-core-plan.md`;
10. `docs/shared-semantic-core-checkpoint-2.md`;
11. `docs/convergence-lineage-recovery-2026-07-26.md`;
12. `docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md`;
13. `docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md`;
14. `docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md`;
15. `docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md`;
16. `docs/real-world-guitar-pro-proof-5a-iphone-acceptance-2026-08-04.md`;
17. `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md`;
18. `docs/accepted-format-intake-convergence-5b-real-iphone-acceptance-2026-08-04.md`;
19. `docs/powertab-pt2-v11-completion-audit-and-continuation-ledger-2026-08-05.md`;
20. `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
21. `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`;
22. `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`;
23. `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`;
24. `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
25. `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
26. `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
27. `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`;
28. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Read additional checkpoint records named by those files when the work touches their mechanism.

Do not rely on chat memory alone or rediscover a procedure already preserved in repository evidence.

If a problem resembles a mechanism already solved in Guitar Eyes, Val Music Vault, Hollow & Hoard, or another owner repository, inspect the exact current source and governing record before treating the problem as novel. Search authoritative external documentation, public GitHub repositories, or the wider Internet when local and cross-repository evidence do not already resolve it.

## Accepted reader behavior is authoritative

Every future change must preserve:

- one shared semantic tablature document as the sole musical authority;
- automatic supported guitar and bass detection where evidence is sufficient;
- multiple complete tablature blocks;
- accepted duration mapping and speech;
- aligned explicit measures;
- measure and position-within-measure speech;
- Previous position, Read current position, Next position in that relative order;
- quiet Previous and Next movement;
- quiet tablature-block movement;
- Read current position as the only action that announces full playing instructions;
- omission of ordinary unplayed strings from speech;
- speech for open strings, frets, explicit mute notation, attached techniques, rests, chords, and supported duration;
- durable iPhone Files-picker focus recovery for success and failure;
- no browser-level `accept` restriction that blocks selection before validation;
- Jason Washburn's recognizable desktop spatial concept and non-interception of VoiceOver Control+Option commands;
- explicit inventory and explicit selection for supported multi-track Guitar Pro files;
- no silent Guitar Pro track selection;
- selected-track details immediately before `Load selected track` in VoiceOver reading order;
- format/version identification that is evidence-based and never stronger than the verified source;
- no playback controls or playback language in the accepted format-only reader.

## Single semantic architecture

The semantic tablature document is the sole authority for source format, instrument, blocks, strings, positions, durations, measures, chords, rests, techniques, warnings, and preserved unsupported material.

Desktop and iPhone may present that document differently, but neither may create a second musical interpretation.

Third-party decoders may decode source formats, but their models must remain behind importer boundaries. alphaTab rendering, alphaSynth playback, cursors, notation UI, notation fonts, soundfonts, renderer workers, audio worklets, and third-party playback models remain outside the accepted architecture.

## Shared technique-speech debt

The generic shared-reader suffix `notation preserved but not yet interpreted` is known wording debt when the semantic layer already knows an attached technique by name.

The accepted PowerTab iPhone test demonstrated this with `PalmMuting`: the importer correctly decoded the property to `palm mute` on the correct open D-string note, while the shared speech layer appended the generic suffix afterward.

Do not repair this as a PowerTab-specific exception. Any future wording change must be made once in the shared speech layer and must preserve technique attachment across every supported format.

## New-format rule

Recognition is not reading support.

A new format family requires its own bounded checkpoint with:

1. lawful, original, public-domain, or clearly licensed fixtures;
2. documented provenance and deterministic hashes;
3. source/version detection that does not guess;
4. normalization into the shared semantic document;
5. preservation of all accepted reader and focus contracts;
6. focused importer and semantic-parity tests;
7. the complete inherited suite;
8. a production build and asset-boundary inspection;
9. hosted proof only after source gates pass;
10. bounded real-iPhone VoiceOver acceptance before support is claimed;
11. a clean convergence or closure record before the next format family begins.

Do not mix multiple unproven format families into one implementation checkpoint.

## Next format priority

PowerTab `.pt2` internal versions 1 through 11 and all four known legacy `.ptb` file-version families now have bounded accepted coverage.

Do not reopen PowerTab merely to broaden claims by inference. Any future PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, or broader notation work requires its own independently evidenced checkpoint.

The next new-format family must be selected separately and investigated read-only on a new branch from the final documentation-closure head of `work/powertab-pt2-v1-v10-investigation`. TuxGuitar `.tg` and TablEdit `.tef` remain candidates, not accepted priorities, until that separate selection is made.

## Deferred format families and profiles

Unless a later lawful checkpoint proves otherwise, the following remain unsupported:

- arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, and notation profiles outside accepted evidence;
- arbitrary `.ptb` or `.pt2` files outside the accepted version-specific profiles;
- TuxGuitar `.tg`;
- TablEdit `.tef`;
- arbitrary or unverified Guitar Pro files outside the accepted corpus and profiles;
- other proprietary or container formats not yet separately evaluated.

## Fixture and copyright policy

Use only original, public-domain, or clearly licensed evidence. Preserve fixture source, generation method, license, hashes, and deterministic verification. Do not copy an upstream fixture merely because surrounding source code is licensed.

## Zero-dollar automation

No paid GitHub usage, paid runner, paid service, or overage is authorized.

Standard GitHub-hosted Actions for this public repository do not consume the private-repository allowance, but workflows must still avoid waste and must never introduce a paid runner or paid service.

Use the least expensive capable environment. GitHub-hosted workflows are intentional acceptance checkpoints, not exploratory debugging loops. Before adding or expanding a workflow, follow `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md` and the execution-gate addendum.

Inspect a failed run before acting. Classify only the step that actually ran. Prefer named diagnostic assertions over opaque combined shell guards. Do not use Actions bot commits as ordinary implementation transport.

### Mandatory hosted-run circuit breaker

1. After the first failed hosted run, stop workflow activity and audit the complete affected boundary.
2. Search the canonical known-problems register, every relevant addendum, and the cross-repository execution reconciliation.
3. Batch all known corrections outside Actions.
4. Permit at most one corrective hosted run.
5. If that corrective run exposes another defect of any kind, the circuit is open.
6. Once open, do not add, edit, trigger, rerun, or replace another workflow on that branch unless:
   - the work is moved to a capable unmetered environment; or
   - the owner explicitly authorizes one identified exception after being told the circuit is open, what exact defect remains, what evidence is already preserved, and why the replacement method is materially different.
7. Remove temporary workflows when their bounded purpose ends or the circuit opens.

Owner authorization to finish a feature is not authorization for unlimited hosted corrections.

### Failure-preserving acceptance

Any permitted workflow that generates or transforms lasting source, fixtures, manifests, canonical exports, or evidence must fail forward:

1. run dependency-free authority and structural checks before installation;
2. preserve valid lasting work before later broad tests when technically possible;
3. remove temporary scripts, workflows, and triggers without deleting the lasting work;
4. run focused proof before complete proof;
5. preserve the lasting commit after a later failure;
6. repair forward directly on the branch;
7. never regenerate accepted evidence merely to repair a later source, test, formatter, build, documentation, or publication defect.

The canonical PowerTab editor export is accepted lasting evidence and must not be regenerated merely to repeat downstream testing.

### Transport and formatter rules

- After two failures with one connector or transport method, stop that method and choose a materially different route.
- Move intact files as intact objects; do not reconstruct complete files from overlapping fragments when a deterministic download, attachment, or upload route exists.
- Use the simplest safe route for transport and a capable environment for transformation and proof.
- When a pinned formatter exists, format to a fixed point, inspect the stable diff, then run acceptance.
- Do not invent a formatter command when the repository does not declare one.

### Stream interruption and authority reconstruction

After a stream interruption or broken execution sequence, do not resume from conversational momentum. Reconstruct the exact repository, branch, commit, completed work, active or queued runs, preserved evidence, and remaining gate first.

If source authority genuinely collapses, stop archaeological recovery once a bounded clean reconstruction from verified evidence is cheaper and more verifiable than continuing to untangle ambiguous history.

### Bounded owner action

A narrow owner-operated dashboard or file action is permitted when the exact target and control are known, authorization already exists, assistant tools cannot perform the same exact operation, and the action is VoiceOver-manageable without transferring diagnosis or architectural judgment.

Provide the exact address, exact control, expected confirmation, prohibited alternatives, and stop condition. Independently verify the result afterward.

## Hosted publication read-back

A Pages deployment is not fully verified merely because `deploy-pages` succeeds.

When production code is split into lazy-loaded chunks, live read-back must inspect every deployed JavaScript asset named by the artifact manifest or equivalent complete inventory. Checking only script tags present in `index.html` can falsely report missing code that is present in a lazy chunk.

Every real-device acceptance build must also have a unique static page title and first level-one heading before the React root. Do not reuse an older checkpoint identity on a newly deployed candidate.

## Accessibility and evidence

Automated tests do not replace bounded real-iPhone VoiceOver acceptance when a user-facing mechanism changes. Record the owner's exact observation without strengthening it.

Use the committed-target focus, native-picker return, accessible build identity, speech-separation, ordinary reading-order, source-lineage, version-neutral format, hosted-run circuit-breaker, fail-forward materialization, intact-file transport, stream-recovery, authority-collapse, bounded-owner-action, and complete-hosted-asset-read-back solutions already recorded in repository memory.

Do not bring John into dependency setup, source implementation, automated testing, build verification, artifact inspection, or non-UI engine work. Bring him in only after a stable exact hosted candidate requires real-iPhone VoiceOver judgment.

Jason Washburn's desktop testing remains optional unless he agrees to participate. His absence is not an active blocker.

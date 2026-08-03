# ASCII Extended-String Intake Checkpoint 1 Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Feature branch: `work/ascii-extended-string-intake`

Clean parent branch: `work/clean-semantic-continuation`

Clean parent head: `e665644a3b404691e34e288b210c47624f4c1b6e`

Accepted application source in ancestry: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

## Authority correction

The inherited `AGENTS.md` and `docs/implementation-status.md` were authored before the final accepted 1G focus checkpoint and still contain historical statements naming an older playback branch as current. For this checkpoint, current lineage and scope are governed by:

1. `work/clean-semantic-continuation/BRANCH_AUTHORITY.md`;
2. this preflight;
3. accepted application source `51741c03a9eaa339940c84d53e0f0f00e6413a93`;
4. the accepted semantic, timing, reader, focus, and procedural-audition contracts preserved by that source.

Historical current-branch statements in inherited documents do not authorize returning to playback or sampled audio.

## Objective

Add semantic ASCII intake for two already-recognized extended-string families:

1. standard seven-string guitar, high-to-low `E4 B3 G3 D3 A2 E2 B1`;
2. standard five-string bass, high-to-low `G2 D2 A1 E1 B0`.

Both families must enter the existing semantic tablature document and both readers without creating another parser or musical model.

## Bounded support profile

This checkpoint supports only complete blocks with every string carrying an explicit octave-qualified label matching the exact standard tuning and octave sequence above.

The checkpoint does not support:

1. custom seven-string guitar tuning;
2. custom five-string bass tuning;
3. extended-string blocks without complete octave evidence;
4. eight-string guitar, six-string bass, or other string counts;
5. new binary or structured file formats;
6. teacher mode;
7. sampled playback;
8. full playback or transport controls;
9. a new instrument selector value.

The existing Guitar and Bass selector remains a family preference. A seven-string guitar resolves to the `guitar` family; a five-string bass resolves to the `bass` family.

## Required semantic behavior

1. Preserve the exact string count and the exact instrument label.
2. Preserve every tuning label and octave.
3. Maintain high-to-low semantic string order.
4. Use explicit spoken identities, including High E, Low E, and Low B where appropriate.
5. Preserve positions, frets, open strings, mutes, techniques, rhythm, measures, warnings, and original source rows through the existing architecture.
6. Keep desktop and iPhone projections derived from the same semantic document.
7. Preserve quiet movement, dedicated `Read current position`, Files-picker focus recovery, control order, two-second audition delay, and accepted first-audition focus behavior.
8. Permit the accepted procedural current-position auditioner to derive pitch only from the explicit octave evidence already carried by the strings. Do not add another pitch profile or modify sampled audio.

## Required tests

1. Exact profile analysis for both extended families.
2. Safe rejection when octave evidence is incomplete or does not match the bounded standard sequence.
3. Semantic import for both existing project-authored fixtures.
4. Correct automatic family detection regardless of the current Guitar/Bass selector.
5. Correct instrument label, string count, and spoken string identities.
6. Desktop row count and semantic equivalence.
7. Procedural sound-event pitch derivation from explicit octaves.
8. Preservation of inherited reader, timing, import, focus, and audition tests.
9. Corpus manifest expectations updated from recognized-unsupported to supported within this exact profile.

## Execution discipline

1. Implement and review source changes before any GitHub-hosted execution.
2. Use one named, diagnostic verification gate only after the source boundary is fixed.
3. Do not use Actions as an exploratory loop.
4. Inspect any failed step before correction.
5. Preserve the zero-dollar policy.
6. Do not publish or involve the owner until the complete inherited and new suite and production build pass.
7. If publication becomes necessary, use the proven exact-source temporary-main procedure and restore fork `main` immediately.

## Expected source boundary

The initial expected boundary is limited to:

1. `src/tabStringLine.js`;
2. `src/iphoneTabModel.js`;
3. `src/tabImportCoordinator.js`;
4. focused existing and new tests;
5. `fixtures/real-world/corpus-manifest.json`;
6. this preflight and later checkpoint result documentation.

No sampled-audio file, Iowa branch file, workflow, dependency, binary asset, MusicXML importer, Guitar Pro importer, or reader component is authorized to change.

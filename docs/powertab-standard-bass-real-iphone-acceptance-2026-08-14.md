# PowerTab Standard Four-String Bass Real-iPhone Acceptance

Date: August 14, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-bass-clean`

Status: accepted bounded real-device checkpoint.

## Accepted family

The bounded PowerTab standard four-string bass checkpoint now has source, automated, hosted, and real-iPhone Safari/VoiceOver acceptance for:

- legacy `.ptb` file version 1 / PowerTab 1.0;
- legacy `.ptb` file version 2 / PowerTab 1.0.2;
- legacy `.ptb` file version 3 / PowerTab 1.5;
- legacy `.ptb` file version 4 / PowerTab 1.7;
- modern `.pt2` internal version 11 as represented by the accepted Power Tab Editor 2.0.22 data model.

The accepted instrument profile is standard four-string bass in exact high-to-low MIDI tuning `43, 38, 33, 28`, corresponding to G2, D2, A1, E1.

## Authority and clean convergence

The PowerTab bass work descends from the final accepted PowerTab documentation closure:

`02f130f3c871de39d4c48c45d8c09f35980fba45`

The final clean source candidate is:

`97ed94287d5f0694de807f6b71f2785e9ae2e214`

That commit is one clean convergence commit beyond the accepted PowerTab closure. It was reconstructed from the already-created and already-investigated result rather than by reimplementing the bass work. Earlier forensic branches and failed workflow history remain evidence and are not the product authority.

## Deterministic fixture evidence

The project-authored CC0 proof corpus is defined by:

- `fixtures/powertab-standard-bass/powertab-standard-bass-six-position.source.json`;
- `fixtures/powertab-standard-bass/manifest.expected.json`;
- `scripts/generate-powertab-standard-bass-proofs.mjs` and its supporting deterministic writer modules.

All five fixtures encode the same two-measure, six-position standard-bass proof: four single-note events, one half-note rest, and one final two-note chord. The v11 source also carries the already-supported palm-mute property on the fourth position.

Expected immutable fixture evidence:

- `powertab-v10-standard-bass.ptb`: 640 bytes, SHA-256 `e2f24facd43ba92e016b279021bc21cff4d3de6190e72a2b07e733784d74c39e`;
- `powertab-v102-standard-bass.ptb`: 640 bytes, SHA-256 `d56977c1eb88fd9855fe68f71a6f014f1800401a465d369557448b46beb48617`;
- `powertab-v15-standard-bass.ptb`: 653 bytes, SHA-256 `721dd0337681a1cb285d6b9515ebde068d411ab5e1b0480f7633f43259a06f38`;
- `powertab-v17-standard-bass.ptb`: 739 bytes, SHA-256 `4fd8d714c53b433214369efe04dd32962a6c622617f6e239605a96d1d9cf77cf`;
- `powertab-v11-standard-bass.pt2`: 967 bytes, SHA-256 `36197730d4b37064e825c9ba17f698bd2785d299219b0142a6d9e9e999694a98`.

The canonical six-position source has SHA-256 `cef104b90d113c6e51a6097850d0e0d72950773591c5ead66439338ac7ab7461`. The canonical v11 JSON has SHA-256 `61492b1cc834f575aef71071a9a1156d8c0a447c2f1237f97a56693bf6c988f3`.

Earlier source-gate work independently proved deterministic regeneration and real binary handling. In particular, all four generated legacy `.ptb` generations passed decoding, track inventory, semantic normalization, standard-bass tuning, rest, and final-chord assertions. A later failure was isolated to a stale test assertion expecting a nonexistent top-level semantic field; runtime source did not require a repair. The assertion was corrected to the established shared semantic string contract.

Those earlier passes are preserved evidence and must not be repeated merely because a later gate or verification harness fails.

## Final source gate

Final source-verification workflow run:

`31736476791`

Job:

`94569226051`

The workflow checked out exact source candidate:

`97ed94287d5f0694de807f6b71f2785e9ae2e214`

That run passed:

- exact candidate identity;
- locked dependency installation;
- the complete inherited repository test suite: 65 suites passed, 366 tests passed, with the repository's intentionally skipped tests remaining skipped;
- optimized production build.

No PowerTab runtime source changed after this successful source gate.

## Hosted candidate and publication evidence

The hosted proof branch added only the established unique build identity after the successful source gate.

Hosted candidate:

`aecda4c195afa584082b43f432b152a89da6b245`

Compared with source-gated candidate `97ed94287d5f0694de807f6b71f2785e9ae2e214`, exactly three files changed:

- `public/index.html`;
- `src/buildIdentity.test.js`;
- `src/checkpointBuildIdentity.test.js`.

No decoder, inventory, normalizer, reader, fixture, or other runtime source changed after the final source gate.

Autonomous Pages publication run:

`31737397364`

Build job:

`94572240244`

The build job passed:

- exact hosted-candidate checkout and identity confirmation;
- hosted identity tests;
- Pages production build;
- built HTML identity inspection;
- complete built JavaScript-set inspection for the PowerTab bass markers;
- Pages artifact configuration and upload.

Deploy/read-back job:

`94572528942`

The GitHub Pages deployment itself succeeded. The live page was then fetched successfully and matched both the exact PowerTab bass title and the exact PowerTab bass heading.

The final complete-live-JavaScript read-back script did not finish because its inline Node verifier mixed CommonJS `require()` with top-level `await`, which newer Node classified as ambiguous module syntax (`ERR_AMBIGUOUS_MODULE_SYNTAX`). This was a verification-harness defect after successful deployment, not a build, deployment, or Guitar Eyes runtime failure. The deployment must not be rebuilt or repeated merely to make that already-identified verifier harness green.

The deployed candidate used for human acceptance was:

`https://blindanatomist.github.io/guitar-eyes/?checkpoint=powertab-bass&run=31737397364`

Its unique heading was:

`Test build: Guitar Eyes PowerTab standard four-string bass 1.0, 1.0.2, 1.5, 1.7, and v11 proof.`

## Human acceptance evidence

The owner exercised the exact five deterministic standard-bass fixtures on the deployed candidate using a real iPhone with Safari and VoiceOver:

- `powertab-v10-standard-bass.ptb`;
- `powertab-v102-standard-bass.ptb`;
- `powertab-v15-standard-bass.ptb`;
- `powertab-v17-standard-bass.ptb`;
- `powertab-v11-standard-bass.pt2`.

After completing the requested five-file hosted-device test, the owner reported:

> All of that worked

That report closes the requested real-device gate for the five-version standard four-string PowerTab bass corpus.

## Scope boundary

This acceptance establishes bounded support for the demonstrated standard four-string bass profile across the five listed PowerTab generations.

It does not claim arbitrary compatibility with every PowerTab bass file.

Unless separately proven, this record does not establish support for:

- alternate bass tunings outside exact G2-D2-A1-E1 standard tuning;
- five-string, six-string, or other extended-range bass profiles;
- mixed guitar-and-bass scores;
- multiple bass players;
- arbitrary multi-voice content;
- broader effects, notation, repeats, tempo structures, or other PowerTab features outside the accepted evidence.

Unsupported structures must fail explicitly rather than be guessed.

The previously accepted PowerTab six-string guitar checkpoint remains independently valid and did not require repetition for this bass acceptance.

## Repository boundary

`Phlypper/guitar-eyes` was not modified.

The fork's `main` working tree was restored to the exact upstream tree at `60c2e5de0887b1bcdd426d932632946edd07d3c3` after temporary publication machinery was removed. The fork `main` history retains temporary publication/cleanup commits, but the net file comparison against upstream is empty; no PowerTab bass runtime source was merged to `main` by this checkpoint.

No merge to upstream or to product `main` is authorized by this record.

## Closure

PowerTab 1.0, 1.0.2, 1.5, 1.7, and modern `.pt2` internal version 11 now have bounded source, automated, hosted, and real-iPhone Safari/VoiceOver acceptance for standard four-string bass in exact G2-D2-A1-E1 tuning.

The PowerTab standard four-string bass checkpoint is closed.

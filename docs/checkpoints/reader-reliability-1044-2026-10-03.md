# Bounded support and failure wording: 1044 tests

Date: 2026-10-03. Technical continuation on `work/reader-reliability-checkpoints-2026-10-02`; no accepted-baseline promotion.

## Source identity

- Tested runtime: `33765dbf8aad03f51652911b54b0c4385743749b`.
- Completed source snapshot: `3595d88c473c1f5d4f85251d88c7a6e8926ece0d`.
- Implementation base: `5d3b6f01009348b82a9c5189ea6f1fdf00d3c8d0`.
- Public parent: `4bf4836be1f7688f472827f47ef58be70a2fc6c3`.
- Complete source/test tree: `11f3ee100caae945cf02b0c5f1e074695e7d6b57`.
- Complete public-static tree: `b1c73387c657f97bfec9c1ecad1a108dd44d2c01`.
- Exact blob mapping: `source-identity-2026-10-02.json`.
- Technical evidence: `support-wording-1044-evidence.json`.

Five production files, four new test files and README are copied exactly from the reviewed runtime. These checkpoint notes and the public continuation index are independently authored. Source-snapshot hashes identify tested code without asserting that the historical source commits are public Git objects. All earlier public checkpoint records remain preserved, including the 968-test session-mark and 986-test format-only checkpoints.

## Bounded behavior

Desktop help now names the accepted PowerTab and TuxGuitar profiles instead of omitting or rejecting each entire family. Generic error explanations state the same version and standard-bass limits. Pre-decode legacy PTB failure status says legacy PowerTab without guessing version 1.7; successful version labels and specific decoder details remain unchanged.

PowerTab .pt2 internal versions 1 through 11 retain their bounded six-string guitar profiles. Only internal version 11 supports exact standard four-string bass in high-to-low G2, D2, A1, E1 tuning. Versions 1 through 10 do not inherit bass support. Legacy .ptb file versions 1, 2, 3 and 4 map respectively to PowerTab 1.0, 1.0.2, 1.5 and 1.7. Each retains its bounded guitar and exact standard four-string bass profiles.

TuxGuitar accepts only the bounded native 1.0, 1.1, 1.2, 1.3, 1.5 and modern file-format 2.0.0 profiles. Each retains bounded six-string guitar and exact standard four-string bass in G2, D2, A1, E1. Modern producer version 2.1.0 is distinct from file-format 2.0.0. Native 0.7, 0.8 and 0.9 remain unsupported, and no 1.4 route is inferred. Alternate or extended bass tunings and unproved structures remain unsupported.

Guitar Pro help distinguishes the bounded GP3-7 corpus from existing GP8-style project proofs without claiming general GP8 compatibility. README names the existing technical work branch and fork, the locked-dependency/test/build commands, and repository authority. Its continuation link resolves to the public technical index on this branch.

The internal support and supportOutcome strings remain unchanged historical checkpoint terminology, not a universal capability registry. Decoder-specific guitar-route diagnostics continue to describe their actual route. No parsing, profile, inventory, routing, version inference, rejection code, asynchronous lifecycle, focus, selection, musical semantics, reader/navigation/Read behavior, session mark, file-picker restriction, format-only default or audio behavior changes. No new format, registry, persistence, playback, AI, scoring, framework, fixture or dependency work is included.

## Completed technical gates

- Four new suites / 58 tests pass: rendered help, all legacy version mappings, bounded generic explanations, actual malformed imports in both reading modes, no-version/non-Error fallback, valid retry, evidence-based success labels, retained decoder details, recognized unsupported GP2/TablEdit, and no-supported-player fallbacks across accepted PowerTab versions.
- Complete inherited gate: 89 active suites / 1044 tests pass. The same producer-dependent suite / four tests remain intentionally skipped; no producer evidence was regenerated.
- All five changed production files and four new test files pass ESLint. The same four byte-identical inherited tests retain 35 preexisting lint errors. This is not a blanket clean-lint claim.
- Independent review reports no source correctness, scope or automated-accessibility regression findings, reruns all 1044 tests and 58 focused cases, and verifies nonliteral AST equality in App, the detector and both PowerTab wrappers. All 86 inherited test files and 77 other runtime files match the implementation base. Outside help JSX, production changes are string/template text only.
- Negative control: unchanged 986 baseline with the four new suites gives 44 expected copy failures and 14 preservation passes.
- Production build and isolated sibling-depth rebuild pass. All 30 assets are byte-identical; eight manifest JavaScript assets and 83 embedded application-source entries representing 77 unique source files match the reviewed build/source.
- Main JavaScript and the two PowerTab reader-wrapper chunks change. The remaining five JavaScript chunks and CSS are unchanged. Built HTML changes only its main-script filename hash. Static entry markup, title, first heading and explicit format-only flag remain unchanged; no excluded audio, notation-font, binary-tab or executable assets are emitted.
- Main JavaScript: main.6107a1c8.js; SHA-256 27e29c3927d7782968bcd57f8cf7757ca2fb1b8dcfebdfe05de78758dbac1805.

The first concurrent build exited early with CRA's generic memory/kill diagnostic; its root cause was not independently established. A serial build with NODE_OPTIONS=--max-old-space-size=768 passed without runtime changes. One new-test lint issue was corrected by rendering inside each test. The initial HTML comparison incorrectly expected equality despite the changed main-script hash and was corrected only at that verifier assertion. A nested independent build also passed, but different dependency-relative paths changed webpack identities; the sibling-depth rebuild establishes all-asset equality. Existing non-failing React/CRA/Babel/Browserslist diagnostics remain.

## Limits

Proof was local on Node 24.19.0 and npm 11.9.0 with inherited locked dependencies; it does not certify other runtimes. No actual browser, native picker, iPhone, desktop screen reader or VoiceOver acceptance is claimed. Automated wording proof does not promote the accepted operational baseline. Fixtures, scripts, dependencies, workflows, the static public tree, fork main, accepted branches and upstream remain unchanged. No workflow run, PR, merge or application deployment is part of this technical repository save.

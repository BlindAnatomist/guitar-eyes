# Format-only defaults and candidate identity: 986 tests

Date: 2026-10-03. Technical continuation on `work/reader-reliability-checkpoints-2026-10-02`; no accepted-baseline promotion.

## Source identity

- Tested runtime: `b75d6b839a1bde36479d3aec5b7782e6ed75e2e5`.
- Completed source snapshot: `103e099a50ffa0eb3c09a3370c53158ec1559f82`.
- Implementation base: `08f869fe3e96a8d3c4f7a6ef761a4bb8cd05d4ca`.
- Public parent: `de50bd6200291fce7aa0ef1aee2585e8d70cf9e9`.
- Complete source/test tree: `d2ae64899e52da9f45ae0a34b2e0b505ef37d5dc`.
- Complete public-static tree: `b1c73387c657f97bfec9c1ecad1a108dd44d2c01`.
- Exact blob mapping: `source-identity-2026-10-02.json`.
- Technical evidence: `format-only-defaults-986-evidence.json`.

Eleven source/test files and the HTML entry point are copied exactly. These technical notes are independently authored. Fixtures, scripts, dependencies and workflows remain unchanged. Snapshot hashes identify tested code without asserting their historical commits are public Git objects.

## Bounded behavior

The prior normal HTML entry point already set the format-only flag to exact true and did not expose historical audition. The repaired gap is an alternate entry point with missing, malformed or no-window configuration. The reader now defaults format-only for all these cases; only explicit boolean GUITAR_EYES_FORMAT_ONLY=false preserves the historical opt-in. Strings, numbers, boxed booleans, arrays and objects cannot opt in by coercion.

Configuration is resolved at render as before. This is neither a dynamic configuration/revocation system nor a security boundary. Historical timing, sound-event, procedural-audio and first-audition focus modules remain unchanged and included in source/build. Three retained audio suites now exercise that existing opt-in explicitly and restore prior configuration afterward. No audio capability expansion is introduced.

The static page title, first level-one heading before the React root and hidden App label agree as Guitar Eyes format-only candidate. The description is Format-only Guitar Eyes reader candidate. Existing explicit-true configuration, no-cache metadata and hidden-label CSS remain. The exact candidate identity is verified both statically and through both App reading modes. Prepared publication artifacts must preserve built HTML exactly rather than replacing its identity later.

Both readers retain one shared semantic musical authority, quiet Previous/Next and block movement, the same control order, explicit repeated Read, one session-local mark, import/selection reset, cancellation preservation and focus policy. No importer, supported profile, fixture, source-warning interpretation, raw fallback, desktop cell, session-mark model, dependency, CSS or workflow changed. No new format, registry, playback research, demo, AI, scoring or framework migration belongs to this checkpoint.

## Completed technical gates

- Focused gate: seven suites / 34 tests pass, including fifteen closed configuration rows, explicit false opt-in, no-window SSR, exact static identity and shipped-script/App imports in both modes. Closed cases prove zero sound-event, auditioner and first-audition focus-guard calls through navigation/read/mark actions.
- Complete inherited gate: 85 active suites / 986 tests pass. The same producer-dependent suite / four tests remain intentionally skipped; no producer evidence is regenerated.
- Independent matrix: 40 scenarios / 812 assertions pass. The unchanged 968 runtime fails the expected 37 closure scenarios; exact true and explicit false controls remain compatible.
- Independent retained session harness: all 822 assertions pass. Independent full-suite rerun and exact rebuilt assets also pass.
- All changed production files and new/rewritten tests pass ESLint. Four lightly edited inherited tests retain exactly the baseline 35 lint violations, independently compared by rule/severity/message. This is not a blanket clean-lint claim.
- Build: 30 files, eight manifest JavaScript assets, 83 embedded application-source entries (77 unique source files) matching checkout. Seven non-main JavaScript chunks and CSS are unchanged. The exact candidate labels agree, the shipped entry point is format-only, and excluded audio/font/tab-binary/executable assets are absent.
- Main JavaScript: main.97c59893.js; SHA-256 9cfe66a84c3a00c0e1babd112fa6faa51ebb6b630d2edf7b1964ebca2e27e221.

Initial new-test defects involved uneven test.each row arity and a speech expectation that omitted existing measure context. Both were corrected in tests without changing runtime behavior. Existing React/CRA/Babel/Browserslist maintenance diagnostics remain non-failing. No hosted workflow was run.

## Limits

This is source, DOM, SSR and build proof. No actual browser, native picker, iPhone, desktop screen reader or VoiceOver acceptance is claimed. Candidate labels and successful automated checks do not promote the accepted operational baseline. Fork main, accepted branches, upstream and the public application remain unchanged. No workflow, PR, merge or deployment is part of this technical repository save.

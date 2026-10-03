# MusicXML loss-locality checkpoint: 845 tests

Date: 2026-10-03. Technical continuation of the 556-, 621-, 708- and 786-test checkpoints on `work/reader-reliability-checkpoints-2026-10-02`. This save does not promote the accepted operational baseline.

## Exact runtime identity

- Tested runtime: `6ae462852c938d7f725f619e5eb68cf2703cd5ee`.
- Completed source closure: `8f3ecef9c53f73147ff644c9bd411d990c6ee118`.
- Implementation base: `c92d4c3d952f73686b7e1631a59518ca00e615bd`.
- Public parent: `eb9d498c2c7a62772a52eb4b944f9bb4dbd1cc3c`.
- Complete source/test tree: `ec49c2ebfa81a8b1fc279bd8c78537ed46a84e8f`.
- Source/test blob mapping: `source-identity-2026-10-02.json`.
- Sanitized completed gate evidence: `musicxml-loss-locality-845-evidence.json`.

The complete public `src` tree matches the tested runtime. The two changed runtime files and the new test file are copied without transformation. Technical documentation is independently authored. Fixtures, scripts, dependencies, public assets and workflows remain unchanged. Source snapshot hashes identify tested code; they do not assert that those historical commits are available as public Git objects.

## Locality contract

An existing semantic-loss record may optionally supply one exact two-key document-local location: position scope with a canonical `positionId`, measure scope with a canonical `measureId`, or unlocalized scope with a nonempty reason. Strings must be nonempty after trimming. Unknown or mixed scopes, null, extra location keys and unresolved references reject through the existing `INVALID_SEMANTIC_DOCUMENT` boundary.

Omitted or explicitly undefined locations remain compatible. Explicit unlocalized evidence stays unlocalized. Generic references may attach to a canonical rest or empty measure; this change does not assign IDs to importers that currently omit them. Validation runs after canonical navigation membership checks. Finalization preserves the loss records and does not repair, infer or cache references. Frozen-input repeat finalization and JSON restoration remain supported.

## Bounded MusicXML adoption

Only the existing `unsupported-technical` and `source-order-only` records adopt localized references. Each gains a zero-based `sourceMeasureIndex` from the selected part's direct measure sequence. Existing labels, note indices, elements, retained attributes, dispositions and record order remain unchanged.

Unsupported technical records bind to the current onset's canonical position. Chord members share that onset instead of confusing source note indices with navigation indices. A note after a rest keeps its correct position. Existing treatment of technical elements on rests is unchanged; the importer does not begin collecting that previously uncaptured evidence.

Repeat and ending records bind to their canonical measure, including empty measures. Source ordinals disambiguate duplicate or nonnumeric display labels. Omitted and blank labels retain the existing fallback behavior. No note or rest is manufactured for an empty measure, and repeats remain in source order without expansion.

Admission for these two known MusicXML loss kinds checks document format, a nonnegative safe-integer source measure ordinal, the exact referenced measure and matching retained source label. Technical records additionally require a non-rest position whose existing MusicXML string-state evidence contains the recorded source note index. Repeat and ending records require measure scope. Wrong-but-existing targets therefore reject alongside dangling references. These checks compare retained importer evidence; they do not reparse source XML or recover all ignored notation.

Compressed MusicXML follows the same import/admission path and produces the same document and references. Other importers are not migrated. This is not a universal capability system or a new format-support claim.

## Completed source and build gates

- Before implementation, all 27 selected regression assertions failed against the unchanged baseline: canonical locality was missing and supplied invalid references were accepted. Other baseline assertions were intentionally unselected.
- The permanent new suite adds 59 tests covering note/position indexing, labels, empty measures, strict references, wrong existing targets, source contradictions, legacy and unlocalized compatibility, pure finalization, invalid-to-valid admission, unchanged reader projections and the MXL route.
- Final focused proof: 7 suites / 231 tests, including all 32 import/mode lifecycle regressions.
- Complete inherited proof: 80 active suites / 845 tests passed. The same producer-dependent suite and four tests remain intentionally skipped.
- Changed-file ESLint and diff whitespace checks passed. Inherited non-failing React, CRA/Babel and Browserslist maintenance diagnostics remain.
- Production build passed using installed locked dependencies. All 30 emitted files and eight manifest JavaScript assets were inspected. Both changed runtime files exactly match their source-map bytes. Format-only remains enabled; excluded audio, notation-font, binary-tab and executable assets are absent.
- Main asset: `main.d7a2df1a.js`, SHA-256 `9d22c82e53f8017d4a79e83fe96234d3c1c0722190e02f7d01ca34ed86363f90`.

An early test incorrectly assumed inherited ASCII positions already had IDs; the corrected test preserves the no-ID document and supplies an explicit test-owned ID only for the generic-reference assertion. An early focused command used a nonexistent lifecycle filename; the final seven-suite command uses `App.importModeInvestigation.test.js` and proves its 32 regressions. Neither harness correction changed production behavior or accepted fixtures.

## Independent review

Independent review passed without blockers. Executed checks covered 18 exact-baseline cases (12 accepted sources and six rejection neighbors), 68 adversarial/compatibility assertions, and compressed MusicXML with 18 losses across three measures. Complete accepted documents differed only in the intended additive loss fields. Original record fields, warnings, source text, music, desktop rows, explicit speech, canonical identity and rejection outcomes matched the baseline.

The reviewer inspected all build assets and exact changed-source source-map matches, plus the already-completed full-suite, lint and build logs. Initial comparison-error handling and source-map prefix assumptions were corrected in the verification harness without changing source or build. Repository transport separately verifies tree and blob fidelity; it does not rerun successful source/build gates or regenerate producer evidence.

## Limits and continuation

These references are document-local, not durable bookmark identity across imports, source edits or tracks. Musical interpretation, warning/rejection policy for source notation, reader components, explicit Read speech, quiet navigation, focus recovery and selection behavior are unchanged. No new device-acceptance claim is made for this internal metadata-only change.

The next bounded candidates are remaining desktop cell technique detail, then one useful stable return-to-passage operation. Cross-format loss completeness, capability predicates and durable cross-import identity require separate design and proof. This checkpoint does not begin those changes, playback, AI teaching, scoring, a broad redesign or a new format.

Read `AGENTS.md`, `BRANCH_AUTHORITY.md`, implementation status and the relevant known-problems records before continuing. Preserve fork `main`, upstream, accepted branches and the public app. This technical save creates no deployment, pull request, merge or workflow run.

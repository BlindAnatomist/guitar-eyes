# Guitar Eyes: repository-wide systems assessment

Assessment date: September 11–12, 2026.

Repository: BlindAnatomist/guitar-eyes.

Assessment branch: audit/astra-system-assessment-2026-09.

Authoritative baseline: e1eacbb877c584c34fcacee905ac38c65311ae29, the documentation-closure head of work/accepted-bass-convergence.

Purpose: reconstruct the actual system, test the strength of its guarantees, and identify the highest-leverage next phase. This is an assessment, not authorization to implement its recommendations. The only repository addition made by this assignment is this report.

## 1. Executive assessment

Guitar Eyes is a browser-based, local-file musical interpretation system with two accessible presentations of a largely shared tablature document. Its strongest accomplishment is not the number of file extensions it recognizes. It is the separation of musical position from visual spacing, coupled to a deliberately controlled relationship among navigation, focus, and spoken instruction.

The accepted semantic paths give desktop and iPhone the same notes, strings, positions, measures, and duration data. They do not invoke separate format decoders for each reader. That is a substantial architectural achievement. However, the system does not yet enforce a single complete semantic contract at every boundary. Separate builders produce similar objects; several structured formats pass through a Guitar Pro-shaped normalization bridge; the desktop retains a nonsemantic ASCII fallback; and shared speech can understate or misrepresent the information it receives.

Three answers govern this assessment:

1. What is Guitar Eyes now? A bounded, evidence-heavy tablature compiler and accessible event reader. It has a useful musical intermediate representation, multiple import front ends, two presentation surfaces, and an unusually developed acceptance discipline. It is not an arbitrary-score interpreter, full playback engine, musical teacher, or generally compatible reader for every file in each named family.
2. What is most likely to fail or become expensive? The gap between an importer successfully returning an object and that object being musically complete enough for the next consumer. Missing fields can become plausible notes; notation and timing can disagree; instrument identity can be inferred from string count; unsupported source semantics can disappear before anyone can reject them. Narrow, partly source-derived corpora and duplicated historical tests can make this gap look smaller than it is.
3. What is the highest-leverage next stage? A bounded semantic reliability and navigation phase: repair demonstrable truth failures, formalize the common contract, improve shared technique speech, and let users revisit known musical locations. Preserve the format-only boundary for that phase. Reconsider non-audio practice before full playback; treat AI as a later explanatory consumer of verified facts.

Do not start with TablEdit simply because it is next in an old intake list. Another parser would multiply the current contract debt. TablEdit remains a reasonable dedicated-tab candidate if actual inaccessible user repertoire justifies it, but the repository contains no demand evidence showing that it outranks correctness and useful navigation across the formats already accepted.

The unchanged baseline passed 70 active suites and 424 tests, with one suite and four tests intentionally skipped, and produced a successful optimized build in this audit. Small isolated probes nevertheless reproduced a missing-fret-to-open-string defect in modern TuxGuitar, a MusicXML duration/speech contradiction, and string-count-based Guitar Pro instrument misclassification. A green gate is genuine evidence; it is not exhaustive musical assurance.

## 2. Repository authority and baseline used

Authority was established before implementation review by reading AGENTS.md and all 36 records in its mandatory continuity list, then relevant linked records. BRANCH_AUTHORITY.md, implementation status, accepted convergence records, known problems, execution rules, and real-device closures were reconciled together.

Live remote refs were checked initially and again after the interrupted session on September 12:

- work/accepted-bass-convergence: e1eacbb877c584c34fcacee905ac38c65311ae29.
- Accepted runtime convergence: 67a062085c93d9fb546194d727c808960bbcaea9.
- Fork main: 60c2e5de0887b1bcdd426d932632946edd07d3c3.
- work/jason-playground: 5c0049f0d84530094bec6f2557c6887eb15b0972.

The runtime-to-closure diff contains only AGENTS.md, BRANCH_AUTHORITY.md, docs/implementation-status.md, and the added accepted-bass-convergence result. The closure does not add runtime capabilities.

Jason's later successful isolated experiment does not supersede baseline authority. An existing branch, a newer commit, and a successful hosted test are three different facts; none alone designates the operational baseline.

The assessment used a separate clean checkout. The pre-existing Jason checkout was preserved. Historical trees were inspected by immutable commit or read-only repository API access; none was resumed. No product source, existing documentation, tests, dependencies, fixtures, workflows, or accepted branch was modified. No workflow was triggered, no PR opened, nothing merged or deployed, and Phlypper/guitar-eyes was not written to. Local dependency installation and generated build output were untracked verification material only.

The required cross-repository reconciliation already transfers Val Music Vault's transport, circuit-breaker, formatter, bounded handoff, and fail-forward rules. Current Val Music Vault AGENTS.md and VMV-017 were also inspected read-only to check the continuing procedure. This assessment did not treat those solved execution mechanisms as novel. It did not copy unrelated authentication, storage, or deployment architecture into Guitar Eyes.

## 3. Architecture reconstruction

### The actual flow

Source file → extension routing and, for readable text, content recognition → family-specific decoder and source-evidence checks → optional track inventory/selection → normalization into a tablature document → importer-specific semantic checks → application state → shared position description plus platform presentation → deliberate user navigation/read actions.

The ideal sequence in which validation occurs exactly once after normalization is not the implementation. Validation is distributed before, during, and after decoding. Track selection precedes complete normalization for structured multi-track sources. No single final runtime validator establishes every invariant before either reader receives a document.

### Application and intake

App.js owns reading mode, selected instrument family, loading state, status and errors, the semantic document, desktop blocks, structured selection sessions, and pending focus destinations. A coarse-pointer media query chooses the initial presentation; it is a heuristic, not an iPhone identity test. Users can change the mode.

Upload.js uses a native file input without an accept filter, deliberately preserving the proven iOS Files-picker behavior. App routes known binary extensions to structured importers, .mxl to its container importer, and text through FileReader followed by content recognition. tabFormatDetector.js distinguishes recognition from unsupported/planned families. Its compatibility labels contain some historical checkpoint terminology, so its support field is not a current authoritative acceptance registry.

Content recognition can identify ASCII or MusicXML in text with an unexpected name. It does not provide universal binary sniffing: the initial extension controls whether a binary decoder is attempted. A valid binary renamed to an unrelated extension need not import. Conversely, an extension alone does not validate a supported binary generation.

### ASCII

Tab string-run recognition, profile detection, tokenization, rhythmic annotations, and aligned measure boundaries are implemented across tabStringLine.js, iphoneTabModel.js, asciiRhythm.js, and measureModel.js. The iPhone-named model module now serves both semantic readers; its filename is historical, not proof of a separate iPhone music model.

The parser finds complete runs among surrounding prose, combines multi-digit frets into synchronized positions, represents open notes, silence, explicit technique/mute notation and continuations, and attaches duration and measure evidence when safely recognized. Extended string-count profiles require exact octave-qualified labels. Missing rhythms do not justify invented timing. Aligned bars provide explicit measures; incidental text headings do not establish phrases or formal sections.

If safe semantic parsing fails, tabImportCoordinator.js can still return legacy desktop blocks from parseFile.js. That is an intentional compatibility escape hatch with a semantic error, not a second accepted semantic document. It is nevertheless an exception to an absolute claim that every active musical presentation uses the shared model.

### MusicXML and compressed MusicXML

musicXmlImporter.js uses the browser DOM parser, selects a part with explicit technical string/fret coordinates, requires a bounded six-string tuning description, interprets sequential notes/chords/rests and positive divisions/durations, and builds document positions and measures. It rejects several ambiguous profiles, including relevant voice/ordering structures, rather than trying to be a general notation engine.

compressedMusicXmlImporter.js validates the ZIP container and META-INF/container.xml, identifies the score, bounds extraction, and sends the resulting XML through the same MusicXML importer. The container changes transport, not musical interpretation. The wrapper records compressed-musicxml while the musical document records musicxml. That distinction is reasonable, but transport provenance should eventually be explicit rather than implicit in two separate objects.

### Guitar Pro

Source version/signature/archive checks precede the lazy alphaTab 1.8.4 decoder. guitarProImport.worker.js and the worker client keep third-party decoding behind a serializable intermediate boundary, with request lifecycle and timeout/error handling. guitarProDecodeIntegrity.js and version-evidence checks protect against incomplete or mismatched decoding.

The alphaTab adapter transfers tracks, staves, tuning MIDI values, bars, voices, beats, string/fret coordinates, duration evidence, and selected technique names. It does not transfer the whole alphaTab model. This is good dependency containment, but discarded source fields cannot later be validated or explained.

Track inventory exposes candidate fretted staves and rejection reasons. If multiple supported candidates exist, the user must explicitly choose; the selector has no default selection. Selection is followed by complete normalization. A candidate being selectable is not a promise that its music will pass all later restrictions.

### PowerTab and TuxGuitar

PowerTab dispatches by exact internal file evidence. .pt2 has historical and v11 JSON/schema handling behind gzip decoding; legacy .ptb uses bounded generation-specific binary readers, including a separate standard-bass route. V11 parsing checks ordering, assignments, durations, duplicate strings, contradictory rests, and many explicitly unsupported structures.

TuxGuitar dispatches by exact legacy headers or modern ZIP/XML evidence. Modern 2.0.0 file format is correctly separated from application producer version 2.1.0. Its corrected precise-time conversion uses 3003 units per tick. Exact tuning/profile constraints prevent indiscriminate support claims.

These families use project-owned intermediates and normalizers. However, normalization reuse is implemented through a Guitar Pro compatibility bridge: validated family evidence is temporarily adapted into the older normalizer's expected shape, then family provenance is restored. The output is shared, but the core builder remains coupled to the first structured format.

TuxGuitar bass additionally transforms a four-string source into a six-string-compatible form for the existing decoder and remaps it afterward. It retries only selected guitar-profile errors. This is bounded adaptation, not independent source proof or a clean instrument-neutral decoding core.

### Semantic authority

The de facto contract includes type/schema identity, instrument and string count, ordered strings and tuning evidence, blocks, synchronized positions, string states, optional measures and durations, source metadata, selected track identity, and warnings. Structured inputs additionally carry version evidence and richer provenance.

There are overlapping position representations in the top-level document and block/measure collections. Some nested entries are construction-stage copies without every top-level navigation field. ASCII does not have the same full source metadata as structured documents. Consumers therefore need conventions beyond a nominal schema version.

Neither presentation reparses supported structured source to decide notes. Both call describePlayablePosition in positionDescription.js for explicit instruction. This honors the central architecture for accepted semantic paths. It does not guarantee that all builders preserve identical semantics or that every presentation exposes all retained information.

### Presentation, navigation, and focus

IPhoneTabReader.js provides a linear position reader, block navigation where appropriate, stable Previous / Read current / Next order, passive current-position content, and a polite live region for explicit Read. Movement is deliberately quiet. Ordinary silent strings are omitted from playing instructions. A repeated Read creates a fresh announcement identity rather than relying on unchanged text to be spoken again.

DesktopSemanticReader.js consumes the same positions and shared Read description while providing spatial tables, location/duration labels, a keyboard navigation surface, and optional source layout. Its table cell text is a separate formatter and currently omits techniques attached to fret/open states. Each reader owns its navigation index; changing modes remounts the surface and resets its cursor.

LegacyDesktopReader.js and DataGrid.js retain a raw-character/grid interaction model, including group speech through speechSynthesis. This path has neither the semantic model's guarantees nor the same speech mechanism.

App's iPhone completion mechanism commits outcome state with flushSync and keeps a pending destination until the target is mounted and focus is confirmed. Browser focus/pageshow/visibility return events and animation-frame retries handle Files-picker timing. Desktop uses a pending heading focus path. These are learned interaction contracts, not optional polish. DOM focus remains different from the VoiceOver cursor and speech queue.

### Dependencies, build, and hosting

The runtime is React 18 with Chakra UI components, Create React App/react-scripts 5.0.1, project-owned import/speech logic, and pinned alphaTab 1.8.4. Browser APIs supply FileReader, DOMParser, workers, decompression, and historical Web Audio behavior. There is no accepted server-side musical authority, account model, AI service, microphone assessment, or persistent personal library.

Playback timing, sound-event conversion, procedural audio, and focus-guard modules remain in the source and imports. public/index.html sets GUITAR_EYES_FORMAT_ONLY to true and the iPhone reader hides audition controls. Format-only is presently a delivered runtime policy, not a build that structurally excludes all audio code. There is no evidence that normal accepted HTML exposes audio controls.

Hosting evidence uses exact-source temporary Pages candidates, static and runtime build identity, emitted-asset checks, hosted read-back, and owner real-device results. Historical records describe temporary publisher/main-restoration procedures; they do not authorize publication now. Two inherited dispatch-only workflows remain. They are not a substitute for the later authority and execution-gate rules.

## 4. Accepted capabilities and boundaries

Acceptance means the repository's bounded profile and recorded proof, not arbitrary files sharing an extension.

1. ASCII .txt/.tab: general accepted six-string guitar and four-string bass profiles; exact standard octave-qualified seven/eight-string guitar and five/six-string bass profiles. Explicit rhythm and aligned measures where supported. No inference that arbitrary alternate extended tunings work.
2. MusicXML .musicxml/.xml: bounded explicit six-string tablature coordinates, tuning, positions, chords/rests, and durations. It is not ordinary staff-to-tab conversion or a general multi-part notation reader.
3. Compressed .mxl: accepted ZIP-to-same-MusicXML route. Compression does not broaden score semantics.
4. Guitar Pro: accepted project-authored GP3, GP4, GP5, GP6 GPX, and GP7 corpus and version-neutral intake. GP8/shared archive mechanisms and authored proof tests also remain implemented; the central current accepted list emphasizes GP3–7. Do not turn that implementation into a new general GP8 compatibility claim without explicitly reconciling the evidence and authority.
5. PowerTab .pt2: internal versions 1–11 within exact version-evidenced profiles. Standard four-string bass is separately accepted for v11, not retroactively for versions 1–10.
6. PowerTab .ptb: file versions 1, 2, 3, and 4, corresponding to PowerTab 1.0, 1.0.2, 1.5, and 1.7, with bounded guitar and exact G2-D2-A1-E1 standard bass profiles.
7. TuxGuitar .tg: native 1.0, 1.1, 1.2, 1.3, 1.5, and modern file format 2.0.0, bounded six-string guitar and exact standard four-string bass. Application version 2.1.0 is producer evidence, not a new native format claim. 0.7–0.9 remain deferred.
8. TablEdit .tef and GP2 .gtp: recognized, not imported. Their intentional rejection is not a defect.
9. Playback UI, Iowa samples, teacher mode, bookmarks, scoring, and AI: outside the accepted product boundary, even where historical or retained code exists.

A narrow rejection can be the correct behavior. The problem is accepting a profile with unreported semantic loss or inventing data while appearing to stay inside a bounded contract.

## 5. Structural bug and fragility findings

The classifications below separate reproduced behavior, source-confirmed mechanisms, and unresolved consequences. Priority does not imply frequency in real user files; the repository provides no usage telemetry establishing frequency.

### F1. Missing TuxGuitar fret becomes a real open note

Classification: confirmed defect. Confidence: high.

In tuxGuitarDecoder.js, parseModernXml converts note.getAttribute("value") with Number before checking integer validity. Number(null) is zero. Removing the first note's value="3" attribute from the accepted modern XML fixture, packaging it in a valid stored ZIP with the exact version.txt text, and decoding/normalizing it yields an open low-E string with no warnings. The untouched control yields fret 3.

This is not rejection of an unsupported feature. It manufactures a playable instruction from absent evidence. The deeper class is coercion of missing attributes into valid zeroes. Audit adjacent numeric attributes for presence and lexical validity, not only numeric range. Do not generalize this one probe to every decoder.

### F2. MusicXML duration speech can contradict numeric time

Classification: confirmed defect; wider tuplet/notation handling is architectural risk. Confidence: high for the reproduced contradiction.

musicXmlImporter.js computes quarterNoteUnits from duration/divisions but durationName independently prefers type and dot elements. In the accepted minimal MusicXML fixture, changing only the first type from quarter to half leaves one quarter-note unit but produces "Duration, half note" and no warnings. Shared speech trusts that name; the timing layer trusts numeric evidence.

A malformed or unsupported relationship must not pass as a single coherent musical fact. Valid notated duration can differ from performed duration for reasons such as tuplets; therefore the repair is not a simplistic rule that every type must equal elapsed time. Preserve and validate the relationship, or reject the unsupported relationship explicitly. The current importer has no time-modification handling establishing that distinction.

### F3. Some unsupported source semantics disappear before validation

Classification: confirmed silent omission for the repeat probe; architectural risk for the wider family. Confidence: high on inspected paths, provisional on repertoire impact.

Adding a backward-repeat barline before the closing measure in the minimal MusicXML fixture yields identical positions and no warnings. The importer does not establish repeat, capo, tuning-change, tie, or tempo-map semantics as a comprehensive contract. parseStaffTuning selects one description across the part rather than tracking changes. The Guitar Pro adapter does not serialize ties, capo, instrument program, or detailed bend/harmonic relationships; it reduces several techniques to names. Repeat presence can generate a normalization warning without retaining enough structure to expand it later.

A source-order reader may intentionally avoid repeat expansion. It should still disclose relevant unperformed structure or reject it. Ignored information cannot be recovered by playback or AI downstream. This finding does not allege that all such files should be supported. It calls for an explicit support/loss decision before acceptance, with localized evidence rather than one vague document warning.

### F4. Guitar Pro instrument identity is inferred from string count

Classification: confirmed misclassification at the intermediate/normalizer boundary; compatibility-policy mismatch. Confidence: high; real-file incidence unmeasured.

guitarProTrackInventory.js labels four strings as bass and six as guitar without instrument evidence. The normalizer also accepts four-string MIDI tuning [69,64,60,67] and labels it four-string bass. An isolated intermediate named Ukulele with that tuning, valid GP5 version evidence, and valid positions normalized successfully with no warnings.

This probe does not prove that every ukulele file passes alphaTab or the complete file route. It proves that once such a fretted staff reaches the project's boundary, string count supplies unjustified instrument identity. Preserve explicit tuning and generic fretted-staff identity, or require the bounded instrument profile. Do not guess from the track name either.

### F5. Technique truth is weaker at presentation than at capture

Classification: technical debt and confirmed presentation omission. Confidence: high.

positionDescription.js appends "notation preserved but not yet interpreted" to every named technique, including recognized palm mute, hammer-on, pull-off, and slide. This is the already documented shared technique-speech debt, not a new PowerTab bug. Some captured names support a useful literal action; others lack endpoints, amount, articulation, or context. They should not all receive either generic uncertainty or overconfident instruction.

DesktopSemanticReader's stringStateText returns only Fret N or Open for states with attached techniques. A desktop user inspecting the table does not receive all the information the shared Read action receives. Centralize factual string-state descriptions and distinguish known technique identity from missing parameters. Improve one shared vocabulary, not one exception per format.

### F6. A shared model exists by convention, not a complete enforced boundary

Classification: architectural debt. Confidence: high.

ASCII, MusicXML, and structured normalization build related but nonidentical document shapes. There is no common final validator covering references, source evidence, tuning certainty, duration consistency, position ordering, duplicate strings, and loss declarations for every importer. semanticDocument.test.js primarily exercises ASCII; its name does not make it a universal contract suite.

Overlapping top-level, block, and measure position arrays can carry different construction-stage metadata. Current read-only consumers tolerate these conventions, but edits, bookmarks, playback cursors, or derived analysis could turn them into competing authorities. Establish one canonical position collection and reference/derived views; define identity and provenance before persistence or editing.

### F7. Structured normalization is coupled to Guitar Pro; bass adaptation adds another seam

Classification: architectural debt and risk. Confidence: high.

The source normalizers adapt validated PT/TG/other GP generations through the earlier Guitar Pro normalizer and restore provenance afterward. This reuses working semantics, but synthetic compatibility evidence and recursive restoration are not a neutral constructor API. A future Guitar Pro change can affect other families unexpectedly. The GP restoration routine's broad value/key rewriting also deserves metadata-preservation tests.

TuxGuitar bass rewrites source into a guitar-compatible representation before remapping; its profile decoder discards a failed bass retry's error and rethrows the original guitar error. This can make a malformed bass diagnosis misleading. The old provisional TuxGuitar module is not wholly dead: accepted legacy decoding still depends on it. Deleting it based on its filename would break accepted behavior.

Extract a neutral core incrementally behind current adapters. Do not replace all parsers or replay their historical branches at once.

### F8. Resource limits do not always prevent expensive work

Classification: confirmed ineffective early bound in specific decompression paths; reliability risk. Confidence: high on code, unmeasured on real-device failure threshold.

PowerTab gzip expansion calls Response.arrayBuffer before checking the expanded limit. Guitar Pro archive raw inflation and the TuxGuitar bass ZIP helper similarly materialize output before checking actual size. Declared-size checks help but do not cap dishonest expansion during allocation. Plain text/XML intake has no comparable end-to-end input/node budget. The TuxGuitar profile wrapper also reads/copies the whole file before lower-level checks.

A successful eventual rejection can still freeze or exhaust a phone first. The compressed MusicXML importer already uses incremental reads and cancellation on the actual expansion limit: reuse that proven local mechanism, retaining family-specific container rules. Add aggregate work and cancellation budgets. No destructive stress test or claim of exploitable code execution was made here.

### F9. Async completion can use stale presentation state

Classification: likely defect. Confidence: medium.

App.handleFileUpload captures readingMode and selectedInstrument, awaits file/decoder work, then selects its completion path using the captured values. Upload and instrument controls are disabled while loading, but reading-mode controls remain available. Switching modes during an import can therefore produce an outcome/status/focus request for the previous presentation. The two focus mechanisms do not form one request-keyed transaction.

This source path is credible but was not promoted to a confirmed VoiceOver failure. Reproduce with a deferred file/decoder promise and mode change; then inspect target mounting and focus. Protect pending outcomes with request identity and current destination, reusing the documented committed-target procedure. Do not revert to arbitrary focus delays.

### F10. Track inventory policy needs sharper language

Classification: bounded design choice with documentation risk. Confidence: high.

Multiple supported candidates force selection. One supported candidate among other unsupported tracks can be selected automatically, with normalization warnings about ignored material. "No silent track selection" therefore needs to mean no unexplained choice among viable candidates, not literally no automatic choice in any multi-track file. Candidate support is also preliminary, based on coarse staff properties before full normalization.

The existing explicit selector and selected-track summary are strengths. Preserve them. Decide whether the one-viable-track case needs explicit confirmation or sufficient disclosure. Do not silently broaden support because an inventory row is enabled.

### F11. Desktop compatibility fallback remains outside semantic guarantees

Classification: intentional bounded limitation and architectural risk. Confidence: high.

The ASCII failure path can yield legacy raw blocks with no semantic document. DataGrid groups digits and speaks columns independently. An error/warning distinguishes this path, but a usable-looking grid can still be mistaken for an accepted interpretation. iPhone instead receives the semantic failure.

Keep any source inspection explicitly identified as unvalidated source. Do not allow fallback output to feed practice, analysis, bookmarks that imply musical identity, or playback. Removing it outright requires a product decision and desktop acceptance; it is not an authorized audit cleanup.

### F12. Accepted format-only behavior depends on a mutable runtime flag

Classification: architectural debt, not evidence of currently visible playback. Confidence: high.

The static HTML sets GUITAR_EYES_FORMAT_ONLY=true. IPhoneTabReader hides controls only when that value is exactly true; absent/false exposes historical audition behavior. Audio imports and tests remain. This makes alternate entry points and future shell changes capable of reopening an excluded surface.

Declare the product capability boundary explicitly, default closed, and test the shipped entry point. Later optional audio should load as a deliberately enabled consumer of the semantic model. Do not erase the proven timing engine merely because playback is deferred.

### F13. Test and fixture strength is uneven across claims

Classification: test weakness. Confidence: high.

The five GP generation fixtures, six TG generations, and historical PT2 versions prove important byte/version routes but reuse small musical patterns. Numerous files are source-derived; a manifest hash proves identity, not independent correctness of the generator and parser. TuxGuitar's documented producer correction is a concrete case where a self-consistent fixture/decoder pair was wrong together.

PowerTab standard-bass generated legacy tests are skipped unless POWERTAB_BASS_GENERATED_DIR is supplied. The default full suite therefore does not exercise those four generated binary tests. Their source templates and expected manifest remain in the repository; do not regenerate canonical producer evidence merely to make the summary green.

Some tests protect contracts very well; others assert source strings or copied checkpoint identities. buildIdentity.test.js and checkpointBuildIdentity.test.js duplicate the same identity test. Many historical audio tests run with the format-only flag absent, so total test count mixes current product and retained experimental surfaces. Coverage should be reported by contract and profile, not just count.

### F14. Acceptance provenance and current product identity can drift

Classification: documentation mismatch and operational risk. Confidence: high.

AGENTS and current authority are stronger than the old README, which still describes the upstream-era app and obsolete clone/setup directions. Internal support labels remain checkpoint-foundation or source-checkpoint-provisional for accepted routes. Some fallback messages mention guitar-only PT/TG profiles after bass acceptance. The hidden App build label names a PowerTab checkpoint while static HTML names TuxGuitar bass.

These are not evidence that bass stopped working. They make errors, screenshots, support reports, and future agent decisions harder to interpret. The accepted bass convergence records acceptance inherited from independently tested parents, not a new merged real-device session. That bounded claim is legitimate; do not restate it as a fresh combined-device test.

### F15. Hosted proof and executable workflow policy remain separable

Classification: operational debt. Confidence: high.

The inherited verification workflow has contents:write and writes an existing proof document before enforcing the final result; its name says audit branch but the code does not establish current branch authority. The inherited Pages workflow builds and conditionally deploys main without incorporating the later complete acceptance/read-back process. Both are dispatch-only, so this is not a claim that normal commits automatically deploy Guitar Eyes.

Future workers must use the current governance, not assume an inherited workflow is a complete authorized gate. Preserve exact source/artifact/result linkage and fail-forward evidence. Reconcile the automation boundary in a separate authorized change rather than adding a third workaround here.

### F16. Scale, recovery, and cursor contracts are under-specified

Classification: architectural risk and test gap. Confidence: medium.

Desktop tables repeatedly derive all block positions/cells; large scores can create a heavy DOM and long traversal surface. Format import, normalization, and most non-GP parsing run on the main thread. No measured phone-scale performance envelope was established.

Reader-local cursor state resets across mode switches. File input value is not explicitly reset for retrying the same selection; native cancel/same-file behavior needs device evidence. These are concrete questions for focused testing, not proof that accepted ordinary uploads fail. Structured navigation must define one logical current position, return paths, and explicit Read semantics before adding many new controls.

## 6. Test and evidence assessment

The audit used the unchanged accepted closure, not fork main or a historical feature branch. Locked dependencies were installed in the isolated checkout with npm ci --ignore-scripts --no-audit --no-fund. An initial attempt to reuse an existing dependency directory had incomplete alphaTab package metadata and caused module-resolution failures; this was an environment failure, not a product defect. The isolated installation resolved it.

Completed commands:

- CI=true npm test -- --watchAll=false --runInBand: 70 passed suites, one skipped; 424 passed tests, four skipped; zero snapshots.
- npm run build: compiled successfully. This was a local root-path build, not a Pages-path or hosted acceptance run.
- Working-tree inspection: no tracked baseline changes.

The environment used Node 24.19.0; inherited workflows specify Node 20. The local pass does not silently certify a new supported runtime or replace the recorded workflow result. Build warnings identified outdated Browserslist data and an undeclared Babel plugin dependency in the CRA preset. These are maintenance signals, not grounds for an unrequested dependency upgrade or an unsupported security conclusion.

The audit did not run fixture generators, deploy a candidate, retest real-iPhone acceptance, perform musical listening, or benchmark large hostile files. It did not claim a complete dependency vulnerability audit.

### Reproducible audit probes

All mutations below were in memory or temporary files outside tracked repository content. They are diagnostic examples, not new accepted fixtures.

1. TuxGuitar missing fret: read fixtures/tuxguitar-tg/tuxguitar-20-content.xml; replace the first `<note value="3" string="6"` with `<note string="6"`; create a valid stored ZIP containing version.txt with exact text `TuxGuitar_file_format 2.0.0` and content.xml; call decodeTuxGuitarFile and normalizeVerifiedTuxGuitarIntermediate. Control: first low-E state is fret 3. Mutation: first low-E state is open; warnings empty. The repository's zipStored helper was used to avoid corrupting container structure.
2. MusicXML contradiction: read fixtures/real-world/musicxml-minimal-guitar-tab.musicxml; change only the first `<type>quarter</type>` to `<type>half</type>`; parse and call describePlayablePosition. Result: quarterNoteUnits remains 1, speech says half note, warnings empty.
3. MusicXML repeat omission: insert `<barline location="right"><repeat direction="backward"/></barline>` before the fixture's closing measure. Result: identical positions and no repeat warning. This establishes omission, not a demand that playback expand repeats today.
4. Guitar Pro instrument boundary: create a schemaVersion-1 intermediate with valid GP5 binary version evidence, one nonpercussion staff, MIDI tuning [69,64,60,67], and valid note/rest beats. Both buildGuitarProTrackInventory and normalizeVerifiedGuitarProIntermediate identify four-string bass. This isolates project normalization; it is not a producer-exported GP file proof.
5. Shape observation: compare an ASCII document's top-level positions with its nested block positions. Navigation metadata is not uniformly present on each copy. This supports a contract recommendation, not a demonstrated current navigation failure.

For reproduction outside Jest, project ES modules were loaded with the installed Babel CommonJS transform and DOMParser supplied by the installed jsdom. No accepted tests were edited to make these probes pass.

### What the next evidence portfolio should prove

Preserve the current accepted files and hashes. Add independent, lawful producer-origin examples only where they resolve an actual uncertainty. Prefer a small adversarial corpus spanning missing attributes, contradictory duration, unsupported notation relationships, alternate/ambiguous tuning, multiple viable tracks, malformed neighbors, and truncation over many copies of the same six-position phrase.

A universal semantic contract suite should run against each importer. Cross-format equivalence should compare musical projections rather than family-specific provenance. Negative tests should assert no fabricated playing instruction and an accessible error outcome. UI tests should protect quiet movement, repeated explicit Read, exact selected-track identity, and recovery after rejection. Real-device tests must remain a distinct layer.

## 7. Accessibility architecture assessment

Accessibility already shapes the system's state transitions and semantic boundaries. The strongest choices are synchronized musical positions, no raw spacing in ordinary iPhone traversal, omission of silent strings from playing instructions, quiet navigation, explicit Read, concise labels, no-default multi-candidate selection, and persistent committed-target focus after native picker return.

The history repeatedly shows that correct text plus document.activeElement is insufficient. Safari can return late from Files; VoiceOver can inherit long adjacent descriptions into controls; a live region can remain silent when unchanged; audio activation can move focus or compete with speech. Existing remedies should be preserved and generalized by mechanism.

The unresolved architectural work is to make an import outcome, active logical position, announcement request, and focus destination explicit parts of the application contract. They should not emerge from coincidentally compatible component effects. A semantic error must produce an accessible failure state as deliberately as a successful import produces the reader.

Desktop and iPhone remain two presentations of one product on the accepted semantic paths. Their differing interaction styles are legitimate. Drift occurs where table labels omit technique information, local cursors diverge, or legacy raw interpretation receives the same apparent product status. Jason's spatial concept still fits: a table, string-wise inspection, measure grouping, and event-wise speech can be projections of the same positions. A second parser or separate desktop music model is unnecessary.

Real-iPhone acceptance is required for changes to spoken content, labels, control order, file outcomes, track selection, focus recovery, navigation, or audible behavior. Pure internal transformations with unchanged observable output can first be proved automatically, but an integrated user-facing release still needs the appropriate bounded device gate. Desktop keyboard and screen-reader acceptance should be explicit too; iPhone acceptance does not establish it.

## 8. Historical branch archaeology

History was inspected only after accepted-baseline reconstruction. The following are evidence sources, not proposed development bases.

### Semantic convergence and recovery

The failed convergence lineage was substantially behind the accepted source and could show a green but thinner suite while losing rhythm and speech contracts. The recovery records identify ancestry and complete inherited behavior as necessary evidence. Failure was primarily lineage/integration discipline, not proof that a shared semantic model was impossible.

Retain: exact base, semantic projection comparisons, inherited tests, explicit device contracts. Abandon: treating a relevant branch name, small green suite, or document count as integration authority.

### Playback timing

work/playback-timing-foundation, head b0f6ad7c801b26b8f5e26407ac835a17668cbbdd, records accepted application source 2b038b15afa09877f6d8dcf615bc060243578096. The pure buildPlaybackTimeline engine remains in the baseline. It constructs rational musical time from known durations, distinguishes explicit/default tempo, treats chords as one onset and rests as timed events, and rejects missing/unsafe durations. It explicitly uses source order rather than expanding repeats.

This succeeded as a deterministic engine. An early failed gate was a shell authority assertion, not a source failure. Timing does not establish audible quality, browser scheduling, tempo extraction, repeat order, or playable interpretation of every supported file.

### Audible current-position foundation

work/audible-playback-output-foundation, head 165e2ed5792811ebac9bf0488be93810bfa6246c, preserves accepted bounded audition work. The 1D record identifies source 50aceaba4b03ff65bf40d6d63eff75a5e110340f and real-iPhone acceptance of concise delay controls, separation from VoiceOver activation echo, and current-position sound. Two seconds worked at the owner's tested speech rate; adjustable delay was retained rather than universalized.

The concept was viable. Later unsatisfactory timbre did not invalidate pitch/timing/focus work. Nor did focus acceptance establish a musically credible instrument sound. Reuse those as separate layers.

### Procedural timbre

work/procedural-timbre-quality-foundation, head 52053bca9a3e12029497f433cd834810abbfdeb6, records verified application source b3d9f39de3900c0065875451bc2a90531226c707. The result describes excitation shaping, string-dependent damping, filtering, body response, chord gain, and deterministic tests. The initial artifact gate falsely attributed an inherited alphaTab AudioWorklet marker to the changed timbre boundary.

The inspected result ends at verified hosted candidate with owner listening required. Subsequent movement toward Iowa samples documents the unresolved musical-quality problem. Do not present this branch as accepted high-quality guitar sound merely because its tests passed. The failure mode is perceptual adequacy plus overbroad gate design, not missing semantic infrastructure.

### Iowa samples and systemic repair

The inspected audition/loudness/integrity/systemic-repair lineage culminates in the read-only systemic-repair head f0beec2df71da988893147fc49bbcba8de6abc50. Owner evidence found low E inaudible while high E, chord, rest, and focus behaved differently. Diagnostics identified weak or near-DC segments, overly permissive selection, and a peak ceiling that could attenuate but not normalize weak recordings upward.

Later work restricted source groups, validated signal and pitch, removed drift, and normalized/audited six anchors as a set. One failure was an over-strict waveform model; another was an unattainable shared loudness target; another was a test confusing silent with inactive string states after valid audio derivation had succeeded.

The historical diagnostic documents mention successive -24 and -30 dBFS targets. The inspected branch-head derive_iowa_guitar_samples_robust.py has since moved to a source-start-aware v5 selector and -26 dBFS target. Therefore those earlier diagnostic numbers must not be mistaken for final current branch constants or final listening acceptance. No final whole-product musical acceptance is established by the records inspected here.

Retain source identity, physical-string provenance, whole-set signal audit, locks/hashes, and separation of audio success from harness failure. Abandon one-sample-at-a-time guessing, pitch autocorrelation as the sole quality test, repeated regeneration of valid evidence, and treating numerical loudness as sufficient listening acceptance. Do not import these branches wholesale into the baseline.

### Guided practice

work/phase-3-guided-practice, head eb6798631820de1305a8599327e70fd7f103fb22, implemented explicit Begin, Played it, Back, Repeat, Restart, progress, and completion. GuidedPractice.js consumes the then-current document and speech functions and moves focus to instruction/completion headings. It is self-confirmed progression, not correctness detection or AI teaching.

Records establish automated/build/hosted success and an outstanding real-iPhone gate. The component depends on older tabInstructionSpeech and earlier control language. The idea was not disproved; its branch is obsolete as an integration base. The current core makes a fresh, narrower implementation more plausible, after shared speech and navigation identity are settled.

### Jason playground

The live head is 5c0049f0d84530094bec6f2557c6887eb15b0972, not the older locally available checkpoint. Its August 21 closure records real-iPhone Safari/VoiceOver PASS for deployed source d7cb96a2a66c14949701cde4eea67cfc58cb44fb. The owner reported that it worked well.

Source inspection shows a bundled original seven-position C–G–A-minor–F passage entering through buildReaderDocuments and the existing readers, not a new musical engine. Tests cover the same parsed passage when switching to desktop. Hosted verification encountered harness/read-back defects separately from successful source/build/deployment evidence.

This is a successful bounded onboarding experiment. It demonstrates low-friction access and reuse of the semantic architecture. It does not establish Jason's personal evaluation, desktop usability acceptance, or a new operational baseline. No invitation is authorized by that record or by this audit.

### Format evidence and execution gates

PowerTab v11 producer work obtained lasting canonical editor bytes even when a later temporary harness failed. The corrected procedure preserves them. Historical PT2 generation coverage has source-derived fixtures and producer anchors of differing strength. TuxGuitar's producer correction fixed a mistaken version model and precise-time units that a self-consistent test setup had missed.

These are architectural lessons: separate transport/container proof, decoder proof, semantic proof, presentation proof, hosted artifact identity, and human acceptance. A defect in one layer neither erases valid evidence in another nor authorizes repeatedly running every layer from zero.

## 9. Architectural inflection-point analysis

The project has reached an inflection point because it can already ingest several materially different source families into useful common musical events. The marginal value of one more parser is now competing with the value of making every existing event more reliable, understandable, and revisitable.

The shared model is mature enough for literal note/position reading, measure navigation, known-technique naming, deterministic queries, and manually bounded practice sequences. It is not yet mature enough for authoritative phrase analysis, arbitrary performance playback, automatic fingering, or unrestricted musical explanation. Those require information currently absent, collapsed, or unvalidated.

Keep format-only as the next implementation boundary, but do not equate format-only with parser-only. Technique explanation, trustworthy loss disclosure, bookmarks, navigation by explicit measures/rests/techniques, and a carefully labeled source overview can materially improve the product without synthesizing sound or redefining musical truth.

TablEdit remains behind this reliability phase unless the owner can identify an important collection blocked specifically by .tef. A future TEF intake should begin with lawful producer examples, exact version/profile evidence, a rejection matrix, and the neutral document contract. No speculative choice of TEF decoder or compatibility scope is made in this audit.

Playback can be layered on cleanly if it consumes a validated semantic document through a capability check, then a separate performance plan/timeline, then a renderer. It must not ask alphaTab's player or a format-specific side channel to become a second musical authority. Source-order demonstration must be labeled as such; full performance needs repeats, ties, tempo, articulations, and unsupported-loss policy settled first. Audible quality is a separate human gate.

Non-audio guided practice is nearer. A user can select an explicit range, receive literal instructions, confirm an attempt, and revisit it without the system pretending to hear or assess the result. This needs stable event identity and carefully controlled focus, not AI.

## 10. Latent and under-recognized capabilities

What has Guitar Eyes become that its creators may not yet fully recognize?

It has become the beginning of an inspectable musical query system: a way to ask a score a bounded question and receive an accountable answer at a known location. The accessibility work has forced the system to distinguish source notation, musical event, navigation, and explanation more clearly than a simple visual tab viewer needs to.

That creates several latent capabilities:

1. Evidence-addressable instruction. A playing statement can be tied to a source location, string, event, and known technique instead of being free-floating prose.
2. Multiple coordinate systems for one passage. Event order, measure membership, string-wise movement, simultaneous notes, and technique occurrence can become alternate ways into the same music.
3. A repertoire triage tool. Before learning a passage, a user could ask which parts have trustworthy timing, which require unsupported notation, and where uncertainty begins.
4. A semantic comparison tool. Equivalent project-authored passages across formats can be compared as musical facts, useful both for regression testing and eventual conversion verification.
5. Self-directed practice memory. Stable ranges and user annotations can record where a person is working without claiming the system knows whether they played correctly.
6. A common reference for blind and sighted collaborators. Desktop spatial presentation and iPhone speech can refer to the same event identity, allowing discussion of one passage without translating between different interpretations.

These are architectural opportunities, not implemented features or market novelty claims. Do not extract a generic commercial platform before one richer Guitar Eyes workflow proves useful.

### A safe future AI layer

A safe design is semantic document → deterministic fact/query service → constrained explanatory response → user-requested presentation. Give the model selected event IDs, verified facts, explicit unknowns, and permitted explanatory tasks. Keep generated annotations separate from the canonical document and tie factual claims back to event IDs. Validate references and refuse claims that require absent data.

Reasonable later tasks include explaining a known palm mute, describing a verified interval/chord candidate, comparing two explicit passages, or suggesting practice subdivisions labeled as suggestions. Harmonic names require adequate pitch evidence and may be ambiguous; phrases and fingering are interpretations, not source facts.

AI must never invent missing strings, frets, octave/tuning, instrument, note duration, tie/repeat behavior, unsupported-version decoding, original fingering, or the user's performance. It must not resolve a parser contradiction by choosing the more plausible answer. Raw titles/comments/notation text are untrusted source data, not instructions to the model. No microphone scoring, private upload, external API spend, or automatic lesson generation is implied by this assessment.

## 11. Ranked development portfolio

Ranks express expected leverage against effort and architectural risk, not novelty or promised calendar duration. Each entry names an actionable boundary. Risk/disruption/testing ratings are relative to this repository. Real-iPhone gates described here are requirements for future acceptance, not requests to test during this audit.

### A. Immediate defects

#### Rank 1. Stop fabricated and contradictory musical facts

Evidence: F1–F4; modern TG numeric parsing, MusicXML duration construction, GP inventory/normalizer, and the four diagnostic probes.

Subsystem: importer validation and common semantic truth.

Why/value: prevent confidently wrong playing instructions and unjustified instrument identity across already exposed routes.

Risk of doing: over-rejection of legitimate notation relationships or previously tolerated tuning. Risk of not doing: false instructions propagate into speech, practice, and playback. Disruption: low for presence checks, moderate for duration/instrument policy. Testing burden: focused negative cases plus inherited corpus and both reader descriptions. Accessibility: clear rejection and recovery are essential. Real iPhone: required for changed error/speech outcomes before release.

Dependencies/order: first; use narrow fixes while specifying the shared contract. Confidence: high on defects, medium on the best policy for unsupported relationships. Next action: write a bounded repair specification covering numeric presence, notated-versus-elapsed duration, and evidence-based instrument identity; define expected rejection/disclosure for each case before implementation.

#### Rank 2. Enforce actual resource bounds during import

Evidence: F8; PowerTab/Guitar Pro/TG bass whole-output decompression versus existing incremental MXL cancellation.

Subsystem: file loading, decompression, main-thread work.

Why/value: keep an invalid or large file from destroying the reading session before rejection.

Risk of doing: limits too strict for ordinary repertoire, browser decompression differences. Risk of not doing: freezes and lost state, especially on phones. Disruption: moderate. Testing burden: bounded synthetic expansion/truncation/cancellation tests, no giant fixtures required. Accessibility: progress, cancel/error destination, and recovery must remain understandable. Real iPhone: required for representative slow/failed imports; never require the owner to crash the device.

Dependencies/order: alongside rank 1, before broader corpus intake. Confidence: high on mechanism, medium on performance thresholds. Next action: reuse the incremental extraction pattern and define a total import budget with readable failure outcomes.

#### Rank 3. Resolve the import/mode-switch race

Evidence: F9 and F16; captured readingMode across awaits and separately managed pending destinations.

Subsystem: App outcome state and focus.

Why/value: predictable completion regardless of a user's mode change during loading.

Risk of doing: regression in the already difficult picker-return contract. Risk of not doing: wrong status or stranded focus in an infrequent but legitimate path. Disruption: low to moderate. Testing burden: controlled deferred-read/worker tests, success/rejection/selection outcomes, cancellation and mode transitions. Accessibility: central, not cosmetic. Real iPhone: required.

Dependencies/order: reproduce first; precedes new navigation or onboarding state paths. Confidence: medium until reproduced. Next action: a focused failing scenario, then a request-keyed committed outcome design using the existing focus procedure. If the scenario disproves the suspected failure, retain the test and close the finding without inventing a repair.

### B. Architectural debt

#### Rank 4. Formalize a neutral document contract and common validator

Evidence: F6–F7; separate builders, overlapping position collections, GP normalization bridge, bass adaptation.

Subsystem: semantic core and importer boundary.

Why/value: every consumer can trust the same invariants; future formats and features become safer and less duplicative.

Risk of doing: a broad refactor can erase accepted semantics. Risk of not doing: every new layer must reverse-engineer undocumented conventions. Disruption: moderate if incremental, high if rewritten wholesale. Testing burden: cross-format contract/projection tests, metadata retention, exact inherited acceptance fixtures. Accessibility: no speech or focus change should be incidental. Real iPhone: integrated acceptance required; internal no-output-change steps can first be automated.

Dependencies/order: design alongside rank 1; introduce validator before extracting neutral construction; precedes persistent bookmarks, practice, and playback. Confidence: high. Next action: document mandatory/optional fields, canonical position references, tuning certainty, duration relationships, source/transport provenance, loss records, and capability predicates. Adapt one path at a time.

#### Rank 5. Make support loss explicit and independently test compatibility

Evidence: F3, F10, F13; repeat omission, coarse candidate support, source-derived corpus correction, skipped bass tests.

Subsystem: importer evidence, compatibility policy, tests/fixtures.

Why/value: users can tell what was understood, and developers know what a passing profile actually proves.

Risk of doing: overwhelming users with warnings or creating an endless fixture program. Risk of not doing: compatibility confidence grows faster than evidence. Disruption: moderate. Testing burden: small independent producer anchors and targeted negative/neighbor profiles, plus coverage reporting. Accessibility: summarize blocking loss concisely and make localized details available on request. Real iPhone: required for changed warning, selection, and rejection surfaces.

Dependencies/order: starts with rank 1, becomes contract coverage under rank 4; before new format claims. Confidence: high. Next action: one executable profile matrix distinguishing recognition, decoded generation, semantic capability, automated proof, producer evidence, and device acceptance. Preserve accepted canonical bytes; make intentionally optional generated tests explicit rather than silently counting them as exercised.

#### Rank 7. Close the runtime and operational authority seams

Evidence: F12, F14–F15; format-only flag, stale labels/README, inherited dispatch workflows, exact-head history.

Subsystem: product configuration, build identity, governance/automation.

Why/value: the shipped surface and its proof become easy to identify; future agents do not reopen experiments by accident.

Risk of doing: unnecessary tooling migration or accidental removal of useful timing code. Risk of not doing: old checkpoint machinery or labels mislead future work. Disruption: low to moderate. Testing burden: shipped-entry smoke, capability default, exact source/artifact checks, read-only workflow review. Accessibility: concise and consistent build/error identity. Real iPhone: required if visible surface changes; document-only reconciliation does not need a fabricated device gate.

Dependencies/order: after immediate truth fixes, before any later publication/expansion. Confidence: high. Next action: separately authorize a small configuration/documentation/workflow reconciliation; default excluded capabilities closed and preserve current source authority. A CRA migration is a separate maintenance decision, not bundled into this repair.

### C. Near-term enhancements

#### Rank 6. Replace generic technique wording with precise shared descriptions

Evidence: F5; known shared-speech debt and desktop table omission.

Subsystem: semantic technique vocabulary and presentation.

Why/value: improves actual learning from every supported family, immediately and without sound.

Risk of doing: pretending a name contains bend amount, destination, fingering, or articulation it does not. Risk of not doing: captured information remains unusable or inconsistently presented. Disruption: low for literal descriptions, moderate for relationship modeling. Testing burden: named-technique contract cases from each family, missing-parameter cases, table/Read parity. Accessibility: wording length and repeated Read behavior are product contracts. Real iPhone: required, plus desktop acceptance.

Dependencies/order: follows rank 1's truth rules; can precede completion of the whole rank 4 extraction. Confidence: high. Next action: agree a concise factual vocabulary with explicit uncertainty for missing parameters; centralize string-state descriptions. Do not add format-specific speech branches.

#### Rank 8. Add stable return points and navigation by explicit structure

Evidence: existing position/measure/block identity, F6/F16, shared reader architecture.

Subsystem: navigation state and optional local persistence.

Why/value: return to a troublesome passage without traversing the entire score; next/previous explicit measure, rest, or named technique can be deterministic.

Risk of doing: unstable bookmarks after reimport, control clutter, unexpected speech. Risk of not doing: a capable importer remains a laborious sequential reader. Disruption: moderate. Testing burden: document/track identity, range endpoints, restore/reimport mismatch, both reader cursor behavior. Accessibility: preserve Previous / Read / Next and keep movement quiet; expose structural commands deliberately. Real iPhone: required; desktop keyboard verification also required.

Dependencies/order: after rank 4 defines canonical identity; before guided practice. Confidence: high on technical fit, medium on preferred interaction. Next action: choose one small use case, such as save/return to a measure range. Use a file fingerprint, selected track, and stable source coordinate; explain stale bookmarks instead of guessing. Do not auto-label phrases.

#### Rank 9. Deliberately adopt the successful low-friction demo pattern

Evidence: Jason source and August 21 accepted real-iPhone closure.

Subsystem: onboarding and shared entry path.

Why/value: lets a new evaluator experience the reader without file preparation; useful for desktop/iPhone discussion and evidence gathering.

Risk of doing: confusing an isolated demo with the accepted baseline or duplicating import outcome code. Risk of not doing: continued onboarding friction despite an already proven solution. Disruption: low. Testing burden: bundled-source identity, same semantic path, both presentations, no excluded audio. Accessibility: one concise start action and known reader destination. Real iPhone: required for a new integrated candidate; the old exact-source acceptance is reusable evidence, not a blanket waiver.

Dependencies/order: after the outcome/focus decision; does not require another parser. Confidence: high technically, provisional on adoption value. Next action: owner decides whether to incorporate this bounded pattern from the current baseline. Reuse the reviewed change deliberately; do not resume or merge the old branch by default.

### D. Strategic expansions

#### Rank 10. Bounded non-audio guided practice

Evidence: historical GuidedPractice component, current semantic positions, timing engine, rank 8 range model.

Subsystem: a new practice session consumer.

Why/value: organize repeated work without claiming automatic assessment.

Risk of doing: excessive control/focus complexity and ambiguous completion language. Risk of not doing: users cannot organize practice within the product. Disruption: moderate. Testing burden: explicit begin/confirm/back/repeat/restart/complete transitions and range changes. Accessibility: no involuntary advancement or instruction flood. Real iPhone: required.

Dependencies/order: after shared speech and stable range/navigation identity. Confidence: medium-high. Next action: define a self-reported practice session over one selected range; rebuild from accepted baseline using current speech and focus contracts. No microphone, AI, timing judgment, or score of the user's playing.

#### Rank 11. Capability-gated audible playback research

Evidence: accepted pure timing, bounded audition acceptance, unaccepted/uneven timbre and sample history, F2–F3/F12.

Subsystem: performance planning, audio rendering, transport/focus coordination.

Why/value: hear a known passage, compare rhythm, and eventually practice against sound.

Risk of doing: a second musical authority, poor instrument sound, VoiceOver competition, false repeat/tie playback, expanded dependency/asset burden. Risk of not doing: forego a valuable musical modality; this is opportunity cost, not a correctness emergency. Disruption: high for full playback, moderate for isolated current-position audition. Testing burden: exact timeline/pitch contracts, renderer disposal/cancellation, artifact locks, device audio and listening acceptance. Accessibility: explicit sound request, adjustable speech separation, quiet navigation stops sound, stable focus. Real iPhone: mandatory, including actual listening.

Dependencies/order: after semantic loss/capability contracts and owner choice of sound-quality threshold. Confidence: high that layering is feasible, provisional that the retained renderer is acceptable. Next action: choose one bounded audio question and a listening success criterion before implementation. Do not restart the entire Iowa derivation lineage or introduce full-song playback first.

#### Rank 12. Deterministic musical queries, then constrained AI explanation

Evidence: shared positions/tuning/durations and F2–F6 losses; section 10 design.

Subsystem: derived analysis and separate annotation/instruction layer.

Why/value: answer contextual questions and connect isolated playing instructions to musical understanding.

Risk of doing: false harmonic certainty, invented fingering/phrasing, source-text prompt injection, privacy/API cost, generated speech overload. Risk of not doing: higher-order learning remains external; no immediate product breakage. Disruption: moderate for deterministic queries, high for a hosted AI layer. Testing burden: exact fact/reference tests, ambiguous/unknown cases, adversarial model claims, abstention and source-text handling. Accessibility: explicit query/answer boundaries and interruptible optional explanation. Real iPhone: required for the interaction layer; domain review required for musical claims.

Dependencies/order: after neutral contract and queryable event identity; deterministic facts before models. Confidence: medium on value, high on required guardrails. Next action: prototype a specification for factual queries such as where a known technique occurs or which simultaneous verified pitches are present. No model integration until those outputs are reliable and the owner approves data/cost policy.

#### Rank 13. TablEdit intake, conditional on repertoire demand

Evidence: recognized planned .tef route, historical intake plan, existing profile/corpus lessons.

Subsystem: new importer front end.

Why/value: direct access to a currently blocked dedicated-tab family.

Risk of doing: costly version archaeology and another narrow self-validating corpus before common debt is closed. Risk of not doing: users with important TEF-only material remain dependent on conversion. Disruption: moderate if neutral core exists; high if another compatibility bridge is added. Testing burden: lawful producer anchors, exact version/profile matrix, malformed neighbors, semantic equivalence, both readers. Accessibility: unchanged successful reader contract but new rejection/outcome paths. Real iPhone: required for accepted intake.

Dependencies/order: follows ranks 1, 4, and 5 unless an explicit user-repertoire priority changes the portfolio. Confidence: medium as next format, low that it is next best product work. Next action: obtain concrete demand and a lawful representative file set, then investigate without promising arbitrary TEF compatibility.

## 12. Recommended next development phase

Name the next phase Semantic reliability and useful navigation. Keep its first checkpoint smaller than the full portfolio.

Checkpoint 1: repair numeric evidence and duration/instrument truth boundaries; establish explicit outcomes for the audit probes and adjacent malformed cases. Reproduce the mode-switch concern. Preserve all accepted valid fixtures.

Checkpoint 2: define and introduce a common validator and capability/loss records without rewriting all importers. Protect musical projections across formats. Close resource-limit paths with existing incremental techniques.

Checkpoint 3: improve shared technique descriptions and desktop parity. Require concise, musician-reviewed wording and bounded device acceptance.

Checkpoint 4: add one useful return/navigation operation using stable identity. Measure usefulness through an actual task, such as returning to and rereading a chosen passage, rather than adding a large control palette.

Exit criteria: no fabricated note in the negative corpus; no unexplained duration contradiction; no instrument identity from count alone; declared unsupported structures produce a deliberate outcome; accepted musical projections remain unchanged except reviewed corrections; both readers agree on factual instruction; focus and explicit Read pass the relevant real-device gate; compatibility evidence and skipped tests are stated honestly.

Only then choose between non-audio practice and bounded audible research. These are product decisions with different acceptance costs, not inevitable steps in a parser checklist.

## 13. Things that should explicitly not be done yet

Do not merge experimental branches, reset the product to main, regenerate accepted producer files to repair harness problems, or delete legacy modules based on their names.

Do not claim arbitrary GP/PT/TG compatibility, promote a recognized extension into support, infer extended tunings, or treat source-derived hash equality as independent producer validation.

Do not build separate desktop/iPhone musical models, teach from fallback raw grids, route playback through a second format-specific player authority, or let AI repair missing semantic evidence.

Do not start full-song playback, automatic repeat performance, microphone scoring, unrestricted fingering/phrase inference, or an AI teacher before capability and uncertainty contracts exist.

Do not bundle a framework migration, new backend, broad UI redesign, every parser refactor, and a new format into one convergence checkpoint. Do not use hosted Actions as the iterative development environment. This audit authorizes none of those changes.

## 14. High-confidence versus provisional conclusions

High confidence: current branch authority; shared semantic use on accepted reader paths; legacy fallback exception; missing TG fret coercion; MusicXML duration contradiction and repeat omission; GP count-based instrument classification at the project boundary; generic shared technique speech and desktop omission; distributed validation; structured-normalizer coupling; post-allocation size checks; retained audio behind a runtime flag; narrow corpus and skipped generated tests; exact local test/build result; Jason's recorded isolated real-device acceptance.

Provisional: the import/mode-change consequence on actual VoiceOver; same-file retry/cancel behavior; practical score-size limits; real-file frequency of the malformed/ambiguous profiles; how much users prefer structure navigation over another format; the desired desktop spatial workflow; final acceptable sound renderer; the value of AI instruction. These require targeted evidence, not stronger adjectives.

The portfolio ordering is an assessment derived from failure impact, reuse, and effort. It is not measured market demand. The report does not claim exhaustive parser verification, complete dependency security review, or fresh real-device acceptance.

## 15. Questions requiring human judgment

1. Should an otherwise readable score with unsupported performance structure be rejected, or opened with precise localized limitations? Which losses make a playing instruction untrustworthy?
2. Should the product identify only verified guitar/bass profiles, or also offer a clearly generic fretted-staff mode with explicit tuning? String count must not silently settle this.
3. Is the first post-reliability user benefit shared technique instruction and return-to-passage navigation, or is there a concrete TEF-only repertoire need that changes priority?
4. Should Jason's successful demo become an ordinary entry option, and what desktop task would count as useful acceptance?
5. When audio is reconsidered, what minimum musical-quality result justifies its interaction and maintenance cost? Who judges it, on which output device?

These are decision boundaries for the next assignment. They do not require the owner to perform repository administration or repeat completed acceptance now.

## 16. Questions requiring real-device testing

Use exact-source candidates only after automated preparation. Preserve earlier valid evidence and test the changed boundary.

- Does missing/contradictory-source rejection return to a concise error destination, allow another file, and avoid stale or duplicate announcements?
- Does changing reading mode during a delayed import result in the visible reader/selector/error receiving the intended focus?
- Does cancelling Files or choosing the same file again behave predictably after success and after rejection?
- Are revised technique descriptions understandable at the user's normal VoiceOver rate, and is repeat Read reliable without movement speech?
- Can a bookmarked measure/range be reached and left without losing location or changing musical interpretation?
- Do larger representative supported files remain responsive enough for VoiceOver and desktop keyboard use?
- For later audio only: does sound preserve focus, remain interruptible, avoid competing with speech, and meet the chosen listening threshold across strings and chords?

A desktop keyboard/screen-reader and spatial review is separately needed for table technique parity and new navigation. No current real-device defect is claimed solely because that test remains open.

## 17. Evidence references and verification map

Unless a different SHA is given, every path below refers to baseline e1eacbb877c584c34fcacee905ac38c65311ae29. Use an immutable GitHub blob URL or `git show <sha>:<path>`; do not substitute whichever branch is currently open. Function names are included where they are more durable than line numbers.

### Authority and continuity

- AGENTS.md and BRANCH_AUTHORITY.md: current baseline, upstream preservation, required reading, accepted profiles and exclusions.
- docs/implementation-status.md and docs/accepted-bass-convergence-result-2026-08-14.md: runtime source, closure, parent acceptance and convergence boundary.
- docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md; docs/known-problems-register-addendum-guitar-pro-selection.md; docs/known-problems-register-addendum-execution-gates.md; docs/known-problems-register-addendum-semantic-convergence.md; docs/solved-problems-and-reusable-procedures.md: established failure mechanisms and procedures.
- docs/cross-repository-execution-governance-reconciliation-2026-08-05.md and .github/ZERO_DOLLAR_AUTOMATION_POLICY.md: transferred rules, circuit breaker, canonical evidence preservation, automation boundary.
- docs/shared-semantic-core-plan.md; docs/shared-semantic-core-checkpoint-2.md; docs/convergence-lineage-recovery-2026-07-26.md; docs/convergence-recovery-real-iphone-acceptance-2026-07-26.md: common authority and failed-lineage recovery.

### Accepted intake/device evidence

- docs/musicxml-intake-checkpoint-2-result-2026-07-26.md and docs/musicxml-intake-checkpoint-2-real-iphone-acceptance-2026-07-27.md.
- docs/compressed-musicxml-audition-convergence-checkpoint-1-result-2026-07-30.md.
- docs/guitar-pro-real-iphone-checkpoint-3e-result-and-3f-reading-order-repair.md; docs/real-world-guitar-pro-proof-5a-iphone-acceptance-2026-08-04.md.
- docs/ascii-extended-string-intake-checkpoint-2-real-iphone-acceptance-2026-08-03.md.
- docs/accepted-format-intake-convergence-5b-result-2026-08-04.md and docs/accepted-format-intake-convergence-5b-real-iphone-acceptance-2026-08-04.md.
- docs/powertab-pt2-v11-completion-audit-and-continuation-ledger-2026-08-05.md; docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md; docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md.
- docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md and docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md.
- docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md; docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md; docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md; docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md.
- docs/tuxguitar-tg-intake-investigation-2026-08-11.md; docs/tuxguitar-tg-producer-source-correction-2026-08-11.md; docs/tuxguitar-tg-corrected-source-gate-result-2026-08-11.md; docs/tuxguitar-tg-corrected-hosted-proof-2026-08-11.md; docs/tuxguitar-tg-real-iphone-acceptance-2026-08-11.md.
- docs/tuxguitar-standard-bass-real-iphone-acceptance-2026-08-13.md and docs/powertab-standard-bass-real-iphone-acceptance-2026-08-14.md.

### Source and tests

- F1: src/tuxGuitarDecoder.js, parseModernXml note attribute conversion; src/tuxGuitarStandardBassZip.js, zipStored; fixtures/tuxguitar-tg/tuxguitar-20-content.xml; src/tuxGuitarCompatibility.test.js.
- F2/F3: src/musicXmlImporter.js, durationName, parseDuration, parseStaffTuning and measure traversal; fixtures/real-world/musicxml-minimal-guitar-tab.musicxml; src/musicXmlImporter.test.js; src/guitarProAlphaTabAdapter.js, note/beat/staff/track transfer; src/guitarProNormalizer.js, repeat warnings and semantic construction.
- F4/F10: src/guitarProTrackInventory.js, supportForStaff and inventoryItem; src/guitarProSourceNormalizer.js; src/guitarProNormalizer.js; src/GuitarProTrackSelector.js; src/App.guitarPro.test.js.
- F5: src/positionDescription.js, techniquePhrase and describePlayablePosition; src/DesktopSemanticReader.js, stringStateText; src/positionDescription.test.js and src/DesktopSemanticReader.test.js.
- F6/F7: src/iphoneTabModel.js; src/measureModel.js; src/musicXmlImporter.js; src/guitarProSourceNormalizer.js; src/powerTabSourceNormalizer.js; src/tuxGuitarSourceNormalizer.js; src/tuxGuitarProfileDecoder.js and src/tuxGuitarStandardBass*.js; src/semanticDocument.test.js; src/structuredTabReaderDocuments.test.js.
- F8: src/powerTabPt2Decoder.js, decompressGzip; src/guitarProArchiveVersion.js, raw inflation/extraction; src/tuxGuitarStandardBassZip.js, inflateRaw; src/compressedMusicXmlImporter.js, bounded stream reading; src/tuxGuitarProfileDecoder.js, memoryFile wrapper.
- F9/F16: src/App.js, handleFileUpload, commitIphoneOutcome, pending focus callbacks, mode controls; src/Upload.js; src/IPhoneTabReader.js; src/DesktopSemanticReader.js; src/App.sharedCore.test.js and src/App.convergence.test.js.
- F11: src/tabImportCoordinator.js, buildReaderDocuments fallback; src/parseFile.js; src/LegacyDesktopReader.js; src/DataGrid.js.
- F12: public/index.html; src/IPhoneTabReader.js; src/formatOnlyReaderSurface.test.js; src/playbackTiming.js; src/positionSoundEvents.js; src/proceduralPluckedString.js; src/firstAuditionFocusGuard.js.
- F13: fixtures/real-world, fixtures/tuxguitar-tg, fixtures/powertab-pt2-historical and their manifests; fixtures/powertab-standard-bass; src/powerTabStandardBassLegacyGenerated.test.js; src/buildIdentity.test.js; src/checkpointBuildIdentity.test.js.
- F14/F15: README.md; src/tabFormatDetector.js; src/App.js build label; public/index.html; the two files under .github/workflows; package.json and package-lock.json.

### Historical sources

- b0f6ad7c801b26b8f5e26407ac835a17668cbbdd: docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md; corresponding accepted timing implementation remains in baseline.
- 165e2ed5792811ebac9bf0488be93810bfa6246c: docs/audible-playback-output-foundation-1d-acceptance-and-concise-control-audit.md; the record also remains in baseline.
- 52053bca9a3e12029497f433cd834810abbfdeb6: docs/procedural-timbre-quality-foundation-result-2026-07-31.md.
- f0beec2df71da988893147fc49bbcba8de6abc50: docs/iowa-sample-systemic-repair-1k-preflight-2026-08-03.md; docs/iowa-sample-systemic-repair-1k-first-derivation-diagnostic-2026-08-03.md; docs/iowa-sample-systemic-repair-1k-loudness-target-diagnostic-2026-08-03.md; docs/iowa-sample-systemic-repair-1k-fixture-test-diagnostic-2026-08-03.md; scripts/derive_iowa_guitar_samples_robust.py. Earlier inspected lineage refs: audition 4aee0deba0823b846cb2a067733ac487f8e5b6c5, loudness cd7d669c3b10b42a8d04be945191fa240deba6d8, integrity 4a4fb0ef24d9647fee8ed44becfc9f21f4c9fa39. Presence of a ref is not a claim of final acceptance.
- eb6798631820de1305a8599327e70fd7f103fb22: src/GuidedPractice.js; docs/phase-3-guided-practice.md; docs/phase-3-preview-status.md.
- 5c0049f0d84530094bec6f2557c6887eb15b0972: src/jasonPlayground.js; src/JasonPlaygroundInvitation.js; src/App.jasonPlayground.test.js; src/jasonPlayground.test.js; docs/jason-playground-real-iphone-acceptance-2026-08-21.md; App diff from baseline.
- External procedure verification only: BlindAnatomist/val-music-vault current main AGENTS.md, blob 2ac137eb7c06d1be3f119427bbc33383e6dd0253, and docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS_VMV-017.md, blob 6f15e747cab75aab914d85ff58e98d0e87de14a8, read September 11. Guitar Eyes' committed reconciliation remains the local governing transfer.

A future collaborator can verify the central conclusions without relying on this conversation: check the exact baseline, inspect the named functions, reproduce the four bounded probes, read the distinct source/device acceptance records, and inspect the report-only branch diff. Repeating completed producer or hosted work is unnecessary.

## Decision Handoff

Address first: missing-data-to-note coercion, duration truth, unjustified instrument identity, and actual import resource bounds. Reproduce the mode-switch focus concern before deciding its repair.

Next: make the shared document contract explicit, preserve unsupported/lost semantics deliberately, improve shared technique speech and desktop parity, then add one stable return-to-passage operation. Keep the next phase format-only.

Not yet: another parser by default, full playback, AI teaching, automatic performance scoring, wholesale refactoring, or revival/merge of historical branches. Preserve accepted fixtures and existing proven procedures.

High confidence: the product has a valuable shared event model; the reproduced truth defects and normalization/evidence seams are real; the unchanged 424-test gate passes; Jason's isolated demo has recorded real-iPhone acceptance.

Provisional: real-device mode-change/retry behavior, practical scale limits, preferred desktop workflow, repertoire demand, acceptable sound quality, and the value of AI explanation.

Human testing: musical wording, actual passage-navigation usefulness, desktop spatial/keyboard behavior, and later audible quality. Real-iPhone VoiceOver verification: changed errors, picker recovery, track choice, focus, speech, navigation, and any eventual audio controls. No fresh device acceptance was performed in this audit.

Decisions before implementation: choose reject-versus-disclose rules for unsupported semantics; choose verified guitar/bass profiles versus an explicit generic fretted-staff mode; approve the small semantic-reliability checkpoint and its observable acceptance contract. Decide between practice and audio only after those foundations are proved.

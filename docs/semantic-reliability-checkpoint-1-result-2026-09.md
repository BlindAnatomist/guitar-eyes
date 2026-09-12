# Semantic reliability checkpoint 1 result

Status: implementation complete; unaccepted checkpoint awaiting review and later bounded real-device acceptance. Not a replacement operational baseline.

Repository: BlindAnatomist/guitar-eyes.

Authoritative start: e1eacbb877c584c34fcacee905ac38c65311ae29, confirmed live as the documentation-closure head of work/accepted-bass-convergence before branching and after interruption recovery. Accepted runtime remains 67a062085c93d9fb546194d727c808960bbcaea9.

Work branch: work/semantic-reliability-checkpoint-1.

Completed GitHub implementation head: ed7eff396c2d84f71e129dafb45ac58901f00585. Locally tested implementation head: b5a70dde6d0ab1a17ff9d8bbc55e50729bd9ff55. Both have exactly tree a1d300a325b3c6250f3f4741400560c26e15cf6d and the same authoritative parent; they differ only in commit metadata from transport. All final runtime gates below use that exact tree. The later result-record commit changes documentation only. Obtain the final documentation-closure SHA with `git rev-parse work/semantic-reliability-checkpoint-1`; the final owner handoff gives that immutable SHA. A committed file cannot contain the SHA of its own containing commit without a self-reference problem.

Assessment source: a8ec2ab1e0481b0a22aad1247b6dc5ee2d0c860c on audit/astra-system-assessment-2026-09; docs/astra-system-assessment-2026-09.md. The audit branch was read, not used as the development base. AGENTS.md, BRANCH_AUTHORITY.md and all required continuity material were read before implementation.

## Reproduction and repair

1. Modern TuxGuitar: deleting the first note's `value="3"` accepted missing evidence as zero. The regression failed on unchanged runtime while an explicit-zero/fret-3 control passed. Presence-aware lexical safe-integer parsing now rejects absent, empty, whitespace, hexadecimal, exponent, fractional and unsafe-integer values. Adjacent modern numeric attributes and text use the same evidence helper. There is no TuxGuitar speech exception.
2. MusicXML: changing the first quarter type to half while leaving duration/divisions at one quarter-note unit succeeded without warning. It now rejects with CONTRADICTORY_MUSICXML_DURATION. Source notated type/dots and elapsed divisions are represented separately. Ordinary supported relationships must agree. Elapsed-only duration remains explicitly elapsed-only in speech. MusicXML tuplets/time-modification reject as unsupported relationships, not as inherently invalid music. Existing Guitar Pro-derived tuplet support remains unchanged and passes validation.
3. Guitar Pro: a four-string staff with MIDI tuning [69,64,60,67] was labelled bass by inventory and admitted by normalization. Both now use the same exact accepted standard-tuning predicate. Unknown-profile tracks remain generic fretted staves in inventory, unavailable for loading. Explicit selection cannot bypass normalization. Neither a track name nor string count grants identity. The accepted standard guitar/bass fixtures remain valid; this does not introduce a generic reader mode.
4. Related boundary protections: alphaTab adapter numeric conversion preserves absent coordinates as null, not zero. MusicXML chord members with different duration evidence reject because the shared onset has only one duration. MusicXML repeat/ending elements produce localized structured loss records and an existing-channel source-order warning; unsupported technical names retain localized loss records.

The first diagnostic harness mistakenly passed a Map to the existing ZIP helper, which requires an array with length. This caused container rejection before musical decoding. Correcting the test harness yielded the intended three baseline failures and passing control; no producer fixture was altered. An early inventory edit had an initialization-order error, corrected locally before the passing focused gates. An early validator assumed the ASCII document carried sourceFormat; its inherited builder does not. The validator now explicitly accommodates that legacy shape. The mode probe initially used an incorrect desktop heading label; it was corrected to the actual existing heading. None of these harness/implementation iterations used hosted execution.

## Minimum shared contract

Specification: docs/semantic-reliability-checkpoint-1-spec-2026-09.md.

The common validator runs before a successful reader-document result for ASCII, MusicXML/MXL, Guitar Pro, PowerTab modern/legacy and TuxGuitar. It checks document type/optional schema marker, family/count, block/string identity, tuning presence, explicit MIDI/pitch/octave consistency, document-versus-block string evidence, ordered position references, numeric fret/continuation/open semantics, rest consistency, positive duration, supported notation/ratio/elapsed relationships, duration wording, and shaped loss records where supplied.

Zero survives only as an explicit value or the constructor-validated canonical open state. A post-normalization validator cannot recover an absent attribute that an upstream decoder has already destroyed; that is why the source-boundary repairs are also necessary.

Existing importer-specific profile gates remain authoritative. ASCII has no required sourceFormat/schemaVersion and may have unknown octave or rhythm. The validator does not retrofit universal source provenance, neutral builders, a notation engine, every nested navigation copy, or a comprehensive capability taxonomy. Existing raw desktop compatibility fallback remains outside semantic admission. No consumer-specific musical interpretation was added.

## Tests and gates

New tests cover source absence versus explicit zero, lexical neighbors, missing string/duration/tuning, sufficient and insufficient identity evidence, dotted and elapsed-only duration, contradictory and unsupported relationships, unequal chord durations, repeat loss, cross-format musical projection, shared-validator mutations, supported structured tuplets, normalizer-success revalidation, matching desktop/iPhone instructions and recovery, and the deferred mode-switch investigation.

Commands at implementation head b5a70dde6d0ab1a17ff9d8bbc55e50729bd9ff55:

- `CI=true npm test -- --watchAll=false --runInBand`: 74 suites passed, one intentionally skipped; 469 tests passed, four intentionally skipped; zero failures. The baseline had 424 passing tests. No inherited test was removed or weakened; one adapter regression was appended and four new suites were added.
- The four skipped tests remain src/powerTabStandardBassLegacyGenerated.test.js, dependent on POWERTAB_BASS_GENERATED_DIR. Accepted historical producer/binary evidence was preserved, not regenerated to turn those skips green.
- `npm run build`: compiled successfully, exit 0. Root-path local build; not a hosted or Pages acceptance.
- Built-output inspection: 30 files, 7,479,586 bytes; all eight manifest JavaScript assets inspected. New semantic rejection markers and both inherited TG generation markers are present. Source maps locate alphaTab only in lazy chunk 589, absent from the main bundle. No notation-font, soundfont, editor/executable, binary tab fixture or audio asset leaked. The shipped format-only flag is preserved.
- Built asset-manifest SHA-256: 3a06d7d16cb0a4cf8c40263c615679779831d57ed3aff151157cbc7e28785954. JavaScript assets: 100.9ee65cba, 130.144f576e, 327.2a7f5f9d, 328.db3f29d7, 523.665f16bb, 589.50cdee9e, guitar-eyes-guitar-pro-import.dc72f5d3 and main.1aa41107.
- Exact-base diff confirms no changes to accepted fixtures, public files, workflows, dependencies/lockfile, App.js, either reader component or shared speech source. All inherited tests remain; git diff --check passes.

Local Node: v24.19.0, same as assessment; inherited workflows name Node 20. This does not establish a new supported runtime. Dependencies reused the assessment checkout's locked, complete installation; package.json and package-lock.json remain byte-identical to baseline. No formatter is declared, so none was invented. Non-failing inherited CRA/Babel/Browserslist and React-test warnings remain.

No Actions job was triggered. No new workflow, dependency, fixture generation, producer execution, PR, merge, deployment or hosted read-back occurred.

## Accessibility impact and later acceptance scenario

Observable changes are deliberate rejection, generic/unavailable inventory classification, elapsed-only duration wording, and repeat disclosure. No reader component, control order, focus implementation, picker restriction or ordinary valid Read wording changed. Both presentation paths consume the same validated document. Application tests prove rejection followed by successful valid import, DOM focus recovery, shared quarter-note/fret-3 speech and no audition controls. DOM success does not establish VoiceOver behavior.

Real-iPhone acceptance is still required before user-facing acceptance/convergence. No hosted candidate was authorized or created. A later separately authorized exact-source candidate must receive its own static identity under GE-005. Prepare the following bounded scenarios from the regression sources, without replacing accepted fixtures:

1. Modern TG missing fret: use the exact accepted content.xml and version.txt ZIP, deleting only the first note's value attribute, as in semanticReliability.test.js. Select it in Files. Expected existing error heading and message: `A TuxGuitar note lacks fret/string coordinates.` No reader or open-string instruction may be produced. Verify VoiceOver returns to the error outcome and another file can be chosen.
2. MusicXML contradiction: copy musicxml-minimal-guitar-tab.musicxml and change only its first quarter type to half. Expected error: `Measure 1 has contradictory notated and elapsed duration evidence. The file was not loaded.` Verify no false half-note instruction, no stale previous reader, and usable picker return.
3. Recovery and zero: load the unchanged accepted minimal MusicXML or modern TG fixture; verify the intended reader heading and first fret-3 instruction. For the TG zero neighbor, change the first explicit value from 3 to 0, preserving the attribute; Read must say open. Previous/Next remain quiet and Read remains the explicit full-instruction action.
4. Elapsed-only MusicXML: remove only the first type element. First Read must state `Duration, 1 quarter-note units.` This is elapsed musical time, not a claimed source note type. This wording is precise but may merit a later shared wording refinement; do not infer a notation value.
5. Repeat disclosure: insert the backward-repeat barline from the regression. Normal position instructions remain unchanged. The existing Parsing notes section must expose `Measure 1 contains repeat or ending notation. Positions are read in source order; repeats are not expanded.` Do not automatically read the entire warning during navigation.

Guitar Pro generic-profile inventory is proved at the project intermediate boundary; this checkpoint has no independently producer-exported ambiguous-instrument binary. Do not describe the synthetic intermediate as a real-file/device proof. A future hosted GP rejection/selection device scenario needs such a lawful specimen or a separately identified bounded harness. This limitation does not affect the source-level misclassification reproduction or accepted GP corpus preservation.

Selected-track behavior for accepted candidates is unchanged. Unverified candidates are disabled rather than falsely labelled. Existing multi-candidate explicit selection and selected-summary reading order remain intact. Desktop factual instruction receives the same accepted values and the same deliberate rejection policies. Jason's participation is not required by this checkpoint.

## Mode-switch investigation

Confirmed in controlled DOM tests, not yet on real VoiceOver:

- Start in iPhone, hold a structured import promise pending, switch to desktop, resolve a valid semantic result. The desktop reader mounts, but status says iPhone reading mode and the reader heading is not focused even after the browser-focus event.
- Start in desktop, switch to iPhone during the pending import, resolve the same valid result. The iPhone reader mounts, but status says desktop semantic reader mode and its heading is not focused.
- Start in iPhone, switch to desktop before a two-candidate inventory resolves. The selector mounts and Load selected track remains disabled, but the queued iPhone selector-focus request does not focus the visible heading.

The tests intentionally document the defect as current observed behavior; passing them is not repair acceptance. File decoding is deferred deterministically and mode controls remain active, so the scenario does not depend on a large/hostile input or processor speed. The small settling window only observes the inherited scheduled focus work; it is not a proposed runtime delay fix.

Narrow repair proposal, not implemented: keep the existing target-specific committed-outcome and picker-return mechanisms, but select completion status and focus destination from the current presentation at settlement, with import/selection request identity so an obsolete request cannot commit later. Apply consistently to success, rejection and selection. Replace these defect-characterization expectations with correct-destination regressions in that separate checkpoint, then prepare a controlled delayed exact-source device candidate. No evidence links this race to semantic normalization, so App.js remains unchanged.

## Compatibility, remaining debt and decisions

Accepted fixture bytes/hashes and previous profile claims remain unchanged. Unsupported inputs previously admitted through inference are now blocked; stricter rejection is not a compatibility expansion. MusicXML tuplet support is not added. No TablEdit, playback, AI teaching, bookmarks, practice, scoring, backend, framework or UI redesign work occurred. The accepted runtime flag and historical audio code remain as inherited; this checkpoint does not claim structural removal of audio machinery.

Remaining debt includes neutral builder extraction, canonical nested-position identity, importer-complete loss/capability evidence, dropped third-party source semantics, generic-instrument product policy, nonstandard structured instrument profiles, broader MusicXML notation relationships, resource bounds and the separately reproduced mode race. Bass adapter error masking remains inherited: a malformed bass retry can still report the original tuning error; it cannot bypass the repaired fret validation.

No blocking owner policy decision was needed to implement the selected reject-versus-disclose rule. Before acceptance/convergence the owner must review the checkpoint and authorize any later hosted/device candidate; real-iPhone evidence must then be recorded. Repairing the reproduced mode race needs a separate bounded implementation authorization. No PR or merge is authorized by this record.

## Transport verification

Direct git push failed before writing because no CLI GitHub credential was available. The connected Git object API transferred the 18 complete files against the authoritative base tree, returning exactly the locally tested tree SHA a1d300a325b3c6250f3f4741400560c26e15cf6d. API commit ed7eff396c2d84f71e129dafb45ac58901f00585 preserves that tested implementation with the same parent. The result/addendum closure changes documentation only. No source reconstruction from overlapping fragments, source regeneration, or repeated execution gate was used.

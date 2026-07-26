# Guitar Eyes Implementation Status

Last updated: July 26, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Authorized work branch: `work/iphone-voiceover-tablature-audit`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

The upstream repository must remain untouched. Fork `main` must remain identical to upstream. No pull request or merge is authorized.

## Architectural authority

The semantic tablature document is the authoritative representation of uploaded music. Desktop and iPhone modes are presentations of that same document. No active mode may maintain a separate parser or musical interpretation.

Near-term sequence remains:

1. semantic parser and accessible navigation;
2. desktop and phone convergence;
3. bounded owner acceptance;
4. teacher mode;
5. playback;
6. deterministic pattern recognition and lesson structure;
7. optional AI enhancement.

AI is not required for reading, navigation, parsing, looping, playback, or deterministic structure.

## Completed checkpoint history

### Checkpoint 3: bounded iPhone semantic-reader proof

Verdict: passed.

The proof established synchronized positions, semantic descriptions, understandable errors, restrained announcements, responsive reading order, a known fixture, automated test/build evidence, hosted publication, and real-iPhone VoiceOver acceptance. The native iOS Files-picker focus recovery is recorded as `GE-002` and `XR-IOS-PICKER-FOCUS-001`.

### Checkpoint 4: desktop and phone semantic convergence

Source status: implemented and pre-device hardened on the authorized work branch.

The active application now:

1. reads each uploaded file once;
2. parses guitar or bass through `src/tablatureModel.js`;
3. recognizes multiple complete tablature blocks;
4. preserves non-tablature source lines outside the semantic blocks;
5. creates synchronized positions shared by desktop and iPhone;
6. preserves multi-digit frets, open strings, silence, continuation, technique notation, unsupported notation, and internal measure boundaries;
7. gives both modes Previous position, Read current position, and Next position controls in the accepted order;
8. restores explicit Previous tablature block and Next tablature block jumps for multi-block files;
9. gives desktop a semantic string-by-position table inside a named scroll region;
10. removes the active raw-character grid and separate `parseFile` path from application rendering;
11. stops intercepting VoiceOver's Control+Option commands;
12. preserves the accepted iPhone native-picker focus repair;
13. retains `iphoneTabModel.js` only as a compatibility facade over the shared model;
14. bounds stale reader indexes while newly parsed documents reset navigation state;
15. provides automated component coverage for equivalent block navigation in both modes.

Detailed records:

- `docs/desktop-phone-semantic-convergence.md`
- `docs/convergence-pre-device-hardening-2026-07-26.md`

## Verification state for Checkpoint 4

Completed without GitHub-hosted execution:

- repository-authority reconstruction from branch, implementation, acceptance, and known-problem records;
- JavaScript and JSX syntax parsing;
- production-module transpilation and import/export loading from the convergence implementation;
- direct semantic-model assertions covering guitar, bass, multiple blocks, measure derivation, multi-digit frets, warnings, and descriptions;
- syntax parsing and transpilation of the restored block-navigation source and tests;
- YAML parsing of the hardened manual verification workflow;
- confirmation that the verification workflow is read-only, manual, bounded, and does not create bot commits.

Still required before Checkpoint 4 can be marked passed:

1. one intentional `workflow_dispatch` run for locked dependency installation, the complete automated test suite, and the production build;
2. inspection of any failed job before any source change or rerun;
3. hosted preview publication through the proven protected-main procedure, only after the automated gate passes;
4. John's real-iPhone VoiceOver regression acceptance of upload recovery, position controls, multiple blocks, measure context, and restored block jumps;
5. continued desktop automated and browser-level inspection without assuming Jason's participation;
6. Jason's Mac recognition and usability acceptance only if he agrees to test the mature preview.

Jason is not a blocker to completing source work, automated verification, hosted preview preparation, or John's iPhone acceptance. Without his participation, the project may record desktop owner acceptance as deferred rather than fabricate it.

No automated, hosted, or real-device claim should be strengthened beyond the evidence above.

## Current stop boundary

Do not begin playback, teacher mode, pattern analysis, bookmarks, AI work, upstream changes, a pull request, a merge, or production expansion until the convergence checkpoint has completed its automated and iPhone owner-operated gates. Desktop owner acceptance remains a later collaboration gate if Jason participates.

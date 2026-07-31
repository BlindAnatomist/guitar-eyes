# MXL Audition First-Focus Repair: Real-iPhone Acceptance

Date: July 31, 2026

Repository: `BlindAnatomist/guitar-eyes`

Accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Accepted source branch: `work/mxl-audition-first-focus-repair`

Inherited compressed-MusicXML audition convergence source: `7c4ac3d20fbb1d1abc547d30039599804bfdbd7e`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Scope

This checkpoint repaired one real-iPhone VoiceOver defect in the accepted compressed-MusicXML audition convergence proof.

Before the repair, the first activation of `Audition current position` could send VoiceOver focus to the page banner or reader heading. After focus was manually re-established, later auditions behaved correctly.

The repair was required to preserve all already accepted behavior:

1. compressed MusicXML `.mxl` intake through the shared semantic document;
2. Previous position, Read current position, Next position in that order;
3. Audition current position after the three navigation and reading controls;
4. quiet Previous and Next movement;
5. Read current position as the only action that speaks the full playing instruction;
6. the accepted two-second audition delay;
7. no reader-position movement during audition;
8. no focus trap after the first audition;
9. unchanged later audition behavior;
10. unchanged desktop semantic-reader behavior.

## Accepted mechanism

The application installs a one-use first-audition focus guard only when the Web Audio auditioner is created for the first time.

The guard:

1. observes the actual next focus destination;
2. restores the Audition button only when focus is displaced to the stale reader heading or static test-build heading;
3. clears itself after the first relevant focus transition;
4. clears after a bounded timeout when no transition occurs;
5. does not restore focus when the owner intentionally moves to another control;
6. does not create repeated focus calls or a focus loop;
7. uses `preventScroll` when restoring the button.

This is not a general focus trap and must not be broadened into one.

## Automated and build evidence

Exact verification run: `30593961802`

Results:

1. 40 of 40 test suites passed.
2. 246 of 246 tests passed.
3. The production build completed successfully.
4. Compiled compressed-MusicXML contracts passed.
5. Compiled audition contracts passed.
6. Compiled first-focus repair identity passed.
7. Repository cleanliness checks passed.

Verified build identity:

`Guitar Eyes first audition focus repair proof 1G`

## Publication and hosted read-back

Exact publication run: `30594041679`

Hosted address:

`https://blindanatomist.github.io/guitar-eyes/`

Hosted verification established:

1. HTTP 200 for the page and repository-scoped assets;
2. the unique 1G title and first heading;
3. compressed MusicXML intake contracts in the live bundle;
4. audition and control-order contracts in the live bundle;
5. first-focus repair identity in the live bundle.

Hosted hashes recorded by the publication gate:

- HTML SHA-256: `6ab72ac73442017b68781b0fef88eb03f72c181b744025e2e2b0f227fe1dfcc1`
- Primary JavaScript SHA-256: `2f3b8ebde56ea4033b280f801babc7c29eb6124a00282291248c01d905b89b50`

Fork `main` was restored immediately after hosted read-back and independently verified identical to `60c2e5de0887b1bcdd426d932632946edd07d3c3`, with zero commits ahead, zero behind, and zero changed files.

`Phlypper/guitar-eyes` remained untouched.

## Real-iPhone acceptance

Device context: real iPhone, Safari, VoiceOver.

The owner loaded the controlled compressed MusicXML `.mxl` fixture and tested:

1. the first activation of Audition current position;
2. focus after the first activation;
3. the ability to swipe away afterward;
4. navigation to another position;
5. later audition behavior;
6. preservation of the two-second delay.

Owner result:

> OK, all of that worked. It stayed focused.

Accepted meaning:

1. first audition no longer displaced VoiceOver focus to the banner;
2. focus was not trapped;
3. later position navigation and audition remained usable;
4. the accepted delay and prior convergence behavior remained intact.

No stronger claim is made beyond this bounded real-device result.

## Closure

State: `passed and real-iPhone accepted`

The authoritative application source remains `51741c03a9eaa339940c84d53e0f0f00e6413a93`.

Any later documentation-only commit is a closure record and does not replace that application-source identity.

The established MXL audition convergence branch may be fast-forwarded to this accepted line. Fork `main` and the upstream repository must remain untouched. No pull request or merge is authorized by this record.

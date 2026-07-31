# Guitar Eyes Implementation Status

Last updated: July 31, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Current accepted integration branch: `work/mxl-audition-convergence`

Current accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Current application identity: `Guitar Eyes first audition focus repair proof 1G`

The integration branch may contain later documentation-only closure commits. Those commits do not replace the accepted application-source identity above.

`Phlypper/guitar-eyes` remains untouched. Fork `main` remains reserved as a clean upstream-tracking branch. No pull request, merge, or upstream modification is authorized.

## Accepted source chain

1. Shared semantic foundation: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
2. Hosted and real-iPhone-accepted desktop/iPhone convergence source: `72159d25958fffd941c95351c6781cf579e1d622`.
3. Verified ASCII intake source: `08f8ab16135570d0e53b829daa5c153a15751a45`.
4. Verified uncompressed MusicXML source: `715547a123b2a6e862a8020858df96cb34c63526`.
5. Hosted and real-iPhone-accepted Guitar Pro application source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
6. Verified Playback Timing Foundation 1 engine source: `2b038b15afa09877f6d8dcf615bc060243578096`.
7. Accepted audible current-position foundation branch source: `165e2ed5792811ebac9bf0488be93810bfa6246c`.
8. Verified compressed MusicXML and audition convergence source: `7c4ac3d20fbb1d1abc547d30039599804bfdbd7e`.
9. Hosted and real-iPhone-accepted first-audition focus repair source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`.

Completed historical branch records include:

- `work/convergence-from-accepted-semantic-core`;
- `work/tablature-intake-expansion`;
- `work/playback-timing-foundation`;
- `work/audible-playback-output-foundation`;
- `work/mxl-audition-convergence`.

Preserve `work/iphone-voiceover-tablature-audit` as forensic evidence of the failed wrong-lineage convergence attempt. Do not continue feature work there.

## Governing architecture

Guitar Eyes is one musical system with one semantic tablature document and one deterministic temporal projection.

1. Every supported source importer normalizes into the same semantic tablature document.
2. iPhone presents semantic musical positions sequentially for Safari and VoiceOver.
3. Desktop presents the same semantic positions spatially as strings by synchronized positions.
4. The playback-timing engine consumes the semantic document without reparsing source formats.
5. Audible output consumes the same semantic string identity and accepted timeline.
6. Future measure playback, full playback, teacher mode, and practice functions must consume those same authorities.
7. No reader, importer, player, or teacher may create a second musical or timing interpretation.
8. Third-party decoder models remain behind importer adapters and do not become the application architecture.

## Accepted reader and audition contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position in that relative order.
2. Audition current position after the navigation group, not between Read and Next.
3. Future Play current measure or Play current bar controls belong after Audition rather than inside the three-control navigation sequence.
4. Quiet position and block movement.
5. Read current position as the only action that announces full playing instructions.
6. Omission of ordinary unplayed strings.
7. Speech for open strings, frets, explicit muted notes, attached techniques, chords, rests, and supported duration.
8. W, H, Q, E, and S duration mapping for supported ASCII.
9. Measure and position-within-measure speech.
10. Multiple tablature blocks.
11. Automatic supported four-string bass and six-string guitar detection.
12. Native iPhone Files-picker focus recovery on success and failure.
13. No browser-level upload restriction that blocks selection before validation.
14. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.
15. Explicit inventory and selection for supported multi-track Guitar Pro archives.
16. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
17. Timing derived from the semantic document rather than raw display text.
18. Safe rejection instead of guessed duration, tuning, pitch, track, or source interpretation.
19. Audible output only after explicit owner activation.
20. The accepted default sound delay is two seconds.
21. Audition must not move reader position.
22. Audition must retain VoiceOver focus.
23. A first-use focus repair must be one-use, target-specific, self-clearing, and must not trap later navigation.
24. Navigation to another position stops the prior audition quietly.
25. A semantic rest reports that no pitched sound was played.

## Accepted format support

### ASCII tablature

Imported into the semantic document:

1. `.txt` and `.tab` six-string guitar.
2. `.txt` and `.tab` four-string bass.
3. Multiple complete tablature blocks.
4. Optional octave labels, accidentals, and supported custom tuning evidence.
5. Frets, open notes, explicit muted notes, and deterministic attached techniques.
6. W, H, Q, E, and S rhythm lines.
7. Explicit aligned measures.
8. Safe false-position and prose false-positive prevention.

Authoritative ASCII source: `08f8ab16135570d0e53b829daa5c153a15751a45`.

### Uncompressed MusicXML

Imported into the semantic document:

1. `.musicxml` and `.xml` uncompressed `score-partwise` MusicXML.
2. One unambiguous six-string guitar tablature part within the accepted bounded profile.
3. Explicit tuning and explicit string/fret coordinates.
4. Single-voice sequential timing.
5. Measures, exact duration, chord onsets, timed rests, and supported technical notation.

Authoritative source: `715547a123b2a6e862a8020858df96cb34c63526`.

### Compressed MusicXML

Imported into the semantic document:

1. `.mxl` compressed MusicXML containers.
2. Bounded ZIP extraction with safe path handling and decompression limits.
3. `META-INF/container.xml` rootfile resolution.
4. Reuse of the accepted uncompressed MusicXML importer and shared semantic document.
5. The same reader, duration, measure, chord, rest, navigation, audition, and focus contracts as uncompressed MusicXML.

The accepted compressed-MusicXML route does not create a second MusicXML parser or semantic model.

Authoritative application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`.

### Guitar Pro

Imported only for the verified project-authored `.gp` shared archives containing GP8 semantic evidence.

Accepted capability:

1. Project-authored single-track guitar proof.
2. Project-authored two-track guitar/bass proof.
3. Explicit track inventory and selection.
4. No silent track selection.
5. `Load selected track` disabled until selection.
6. Reuse of the accepted intermediate after selection without a second decode.
7. Archive-declared track count cross-checked against decoder output.
8. The separate Guitar/Bass selector does not filter Guitar Pro tracks.
9. Selected-track details immediately precede the load action in VoiceOver order.
10. Lazy alphaTab `1.8.4` use only as a bounded low-level decoder.
11. No alphaTab renderer, alphaSynth playback, notation fonts, soundfonts, player, renderer workers, or audio worklets.

Authoritative source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.

Do not claim general GP7 support, GP3 through GP6 support, or arbitrary `.gp` compatibility.

### Recognized but not imported

1. Five-string bass ASCII.
2. Seven-string guitar ASCII.
3. Guitar Pro `.gtp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx`.
4. Arbitrary or unverified `.gp` files.
5. PowerTab `.ptb` and `.pt2`.
6. TuxGuitar `.tg`.
7. TablEdit `.tef`.

Recognition must never be described as reading support.

## Passed Playback Timing Foundation 1

Exact accepted engine source: `2b038b15afa09877f6d8dcf615bc060243578096`.

Accepted capability:

1. Pure `buildPlaybackTimeline` engine consumes only the semantic document.
2. Output is schema-versioned `playback-timeline` data.
3. Existing position and block order are preserved.
4. Tempo accepts integer 20–300 BPM, with 120 BPM as the explicit checkpoint default.
5. Guitar Pro exact fractions are preferred.
6. MusicXML duration fractions are reconstructed from divisions.
7. Accepted decimal quarter-note units are reduced exactly when no stronger evidence exists.
8. Exact reduced fractions drive cumulative musical time.
9. Chords remain one onset.
10. Rests consume duration.
11. Position, measure, and total offsets are exposed as fractions, quarter-note units, and milliseconds.
12. Playback order is source order.
13. Repeats and alternate endings are not expanded.
14. Missing or unsafe duration rejects with stable error codes.
15. The semantic document is not mutated.
16. The module imports no React, browser, worker, renderer, player, or audio dependency.

Detailed records:

- `docs/playback-timing-foundation-checkpoint-1-plan-2026-07-28.md`;
- `docs/playback-timing-foundation-checkpoint-1-result-2026-07-28.md`.

## Passed Audible Current-Position Foundation and MXL Convergence

The accepted audible system:

1. derives current-position pitch events from semantic string identity and accepted timing evidence;
2. uses exact standard six-string guitar and four-string bass pitch profiles;
3. accepts explicit tuning MIDI or explicit tuning plus octave;
4. rejects custom tuning without octave evidence;
5. uses one project-owned procedural plucked-string Web Audio engine;
6. creates or resumes Web Audio only during explicit owner activation;
7. auditions one current semantic position;
8. schedules chord strings at one semantic onset;
9. preserves rests as silent outcomes with explicit status;
10. represents explicit muted strings without invented pitch;
11. stops prior audition nodes before repeated audition or navigation;
12. preserves reader position and VoiceOver focus;
13. uses a two-second default sound delay so VoiceOver can finish the button name;
14. places Audition after Previous, Read current, and Next;
15. works with accepted ASCII, MusicXML, compressed MusicXML, and verified Guitar Pro semantic documents.

The first-use focus repair is accepted only as the narrow mechanism recorded in:

- `docs/mxl-audition-first-focus-repair-real-iphone-acceptance-2026-07-31.md`;
- `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`, entry GE-013.

## Final 1G verification and acceptance

Accepted source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`.

Exact verification run: `30593961802`.

Verification results:

1. 40 of 40 suites passed.
2. 246 of 246 tests passed.
3. Production build passed.
4. Compiled compressed-MusicXML, audition, focus-repair, and repository-cleanliness checks passed.

Exact publication run: `30594041679`.

Hosted read-back results:

1. page and repository-scoped assets returned HTTP 200;
2. the unique 1G title and first heading were live;
3. compressed MusicXML, audition, control-order, reader, and first-focus repair identities were present in the live JavaScript;
4. fork `main` was restored and verified identical to clean authority.

Real-iPhone Safari and VoiceOver result from the owner:

`OK, all of that worked. It stayed focused.`

Accepted meaning:

1. first audition retained focus rather than jumping to the banner;
2. focus was not trapped;
3. later navigation and audition remained intact;
4. the two-second delay remained intact.

No stronger claim is made beyond the bounded test.

## Current checkpoint state

State: `accepted line integrated; no new feature checkpoint started`

The next project decision should select one bounded checkpoint. Possible later work includes measure or bar playback after the Audition control, but that work is not authorized or implemented by this closure.

Do not begin full-document playback, automatic progression, looping, transport controls, teacher mode, practice scoring, bookmarks, AI work, repeat expansion, technique-specific synthesis, sampled instruments, or additional file formats without a separately bounded assignment.

## Testing responsibility

Dependency setup, implementation, automated tests, builds, artifact inspection, repository administration, and hosted read-back proceed without the owner.

The owner is needed only when a stable exact hosted candidate requires real-iPhone audibility or VoiceOver judgment.

Jason Washburn remains optional for desktop testing unless he separately agrees to participate. His absence is not an active blocker.

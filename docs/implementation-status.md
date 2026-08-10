# Guitar Eyes Implementation Status

Last reconciled: August 10, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Current accepted format-only operational branch: `work/powertab-legacy-ptb-v1-v3-intake`

Accepted exact hosted and real-device source for the latest PowerTab checkpoint: `2682928366f587d5afac213e8e195ba0dfb602d8`

Previous accepted PowerTab 1.7 `.ptb` source: `937cf3892d279e54f98802f1eb649333f4b1935c`.

Previous accepted PowerTab `.pt2` source: `c2ada9bbdf118abdd426d932632946edd07d3c3` is not the PowerTab source; the accepted `.pt2` source remains `c2ada9bbdf118abdd426d932632946edd07d3c3` only if explicitly recorded elsewhere. The authoritative `.pt2` acceptance record and `BRANCH_AUTHORITY.md` govern exact lineage.

Fork `main` remains reserved as an upstream-tracking branch. `Phlypper/guitar-eyes` remains untouched. No pull request or merge is authorized.

## Current product state

Guitar Eyes remains a format-only semantic tablature reader with one shared musical interpretation.

Accepted format routes now include:

1. ASCII `.txt` and `.tab` within the accepted guitar, bass, and exact extended-string profiles;
2. MusicXML `.musicxml` and `.xml` within the accepted tablature profile;
3. compressed MusicXML `.mxl`;
4. Guitar Pro 3 `.gp3`;
5. Guitar Pro 4 `.gp4`;
6. Guitar Pro 5 `.gp5`;
7. Guitar Pro 6 `.gpx`;
8. Guitar Pro 7 shared `.gp` archives within the accepted version-neutral boundary;
9. PowerTab `.pt2` exact internal version 11 within its accepted bounded profile;
10. legacy PowerTab `.ptb` file version 1 / PowerTab 1.0 within its accepted bounded profile;
11. legacy PowerTab `.ptb` file version 2 / PowerTab 1.0.2 within its accepted bounded profile;
12. legacy PowerTab `.ptb` file version 3 / PowerTab 1.5 within its accepted bounded profile;
13. legacy PowerTab `.ptb` file version 4 / PowerTab 1.7 within its accepted bounded profile.

Historical playback-timing, procedural-audio, sampled-audio, teacher-mode, practice-scoring, bookmark, and AI experiments remain outside the accepted product baseline.

## Governing architecture

Guitar Eyes is one musical system with one shared semantic tablature document:

1. iPhone presents semantic musical positions sequentially for Safari and VoiceOver.
2. Desktop presents the same semantic positions spatially.
3. Every supported importer normalizes into the same semantic document.
4. No reader, future teacher, player, or format may create a second musical interpretation.
5. Third-party decoder models remain behind importer adapters and do not become the application architecture.

## Accepted reader contracts

Every future checkpoint must preserve:

1. Previous position, Read current position, Next position in that relative order.
2. Quiet position and block movement.
3. Read current as the only action that announces full playing instructions.
4. Omission of ordinary unplayed strings.
5. Speech for open strings, frets, explicit muted notes, attached techniques, chords, rests, and supported duration.
6. Accepted duration and measure semantics.
7. Multiple tablature blocks where the accepted profile permits them.
8. Automatic supported guitar and bass detection where sufficient evidence exists.
9. Native iPhone Files-picker focus recovery on success and failure.
10. No browser-level upload filter that blocks selection before validation.
11. Desktop spatial structure and non-interception of VoiceOver Control+Option commands.
12. Explicit inventory and selection for supported multi-track Guitar Pro input.
13. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
14. Safe rejection instead of guessed version, duration, tuning, track, pitch, or unsupported structure.
15. No playback controls or playback language in the accepted format-only baseline.

## PowerTab `.pt2`

Accepted route: exact internal version 11 only.

Evidence includes the canonical Power Tab Editor 2.0.22 export, exact fixture hashes, parser parity, complete inherited automated suite, optimized production build, artifact inspection, hosted Pages publication, live read-back, and real-iPhone Safari/VoiceOver acceptance.

Older `.pt2` internal versions remain unsupported until separately investigated and accepted.

Closure records:

- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

## Legacy PowerTab `.ptb`

Accepted historical mapping:

- file version `1` = PowerTab 1.0;
- file version `2` = PowerTab 1.0.2;
- file version `3` = PowerTab 1.5;
- file version `4` = PowerTab 1.7.

### PowerTab 1.0, 1.0.2, and 1.5

Canonical fixtures are stored under `fixtures/powertab-ptb-historical/`.

The source evidence was derived from the pinned Power Tab Editor 2.0.22 compatibility reader and passed deterministic regeneration plus source-faithful execution of the historical deserialization layouts. No maintained independent parser clearly supporting file-version values 1 through 3 was located, so these accepted claims do not include independent-parser parity.

The implementation then passed:

1. the complete inherited automated regression suite;
2. production build;
3. bounded artifact inspection;
4. Pages publication;
5. live network read-back across every deployed JavaScript chunk, including lazy-loaded chunks;
6. real-iPhone Safari/VoiceOver acceptance.

The owner tested all three historical fixtures and reported: “They all worked fine and voiceover. Focus was good.”

Acceptance record:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`.

### PowerTab 1.7

PowerTab 1.7 file version 4 remains accepted within the previously proven bounded profile. Its evidence includes deterministic project-authored fixture generation, source-faithful Power Tab Editor validation, exact TuxGuitar `ptab-4` parser execution, automated regression, production build, hosted publication, live read-back, and real-iPhone Safari/VoiceOver acceptance.

Acceptance record:

- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

### Legacy `.ptb` scope boundary

Legacy `.ptb` support is not a claim of arbitrary compatibility. Unless separately proven, the following remain unsupported across historical versions:

- bass scores;
- alternate tunings outside accepted evidence;
- multiple players;
- multiple active voices;
- techniques beyond demonstrated accepted profiles;
- capo;
- repeats;
- key changes;
- non-4/4 meters;
- other historical MFC structures outside the bounded decoders.

Unsupported structures must fail explicitly rather than be guessed.

## Known shared-reader wording debt

Attached technique objects can still be spoken with the generic suffix `notation preserved but not yet interpreted`. The accepted PowerTab `.pt2` iPhone test demonstrated that this can be semantically stale when a technique such as palm mute is already identified.

Do not patch this in a PowerTab-specific importer. Any future wording repair belongs in the shared semantic speech layer and must preserve technique attachment across every format.

## Hosted publication lesson

A successful Pages deployment can still be followed by a false live-read-back failure if verification inspects only JavaScript files directly referenced by `index.html`. Historical PowerTab signatures lived in a lazy-loaded chunk.

Future hosted read-back must inspect every deployed JavaScript asset named by the artifact manifest or equivalent complete asset inventory, not only initial script tags.

Each acceptance build must also carry a unique static title and first heading so stable Pages URLs cannot make a real-device tester unknowingly validate an older checkpoint.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary or malformed Guitar Pro files outside accepted profiles;
2. older PowerTab `.pt2` internal versions other than accepted version 11;
3. arbitrary PowerTab bass, alternate-tuning, multi-player, multi-voice, technique, repeat, key-signature, meter, capo, or notation profiles outside accepted evidence;
4. TuxGuitar `.tg`;
5. TablEdit `.tef`;
6. other unexamined proprietary tablature formats;
7. full-document playback;
8. teacher mode;
9. practice scoring;
10. bookmarks;
11. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

All four legacy `.ptb` file-version families now have bounded accepted browser and real-iPhone coverage.

The next PowerTab investigation should evaluate older `.pt2` internal versions as a separate family rather than broadening internal version 11 by inference.

Before implementing an older `.pt2` version:

1. begin from the final documentation-closure head of `work/powertab-legacy-ptb-v1-v3-intake` on a new isolated branch;
2. perform read-only format/version, decoder, licensing, and fixture-provenance research first;
3. acquire or create lawful representative fixtures before implementation;
4. normalize into the existing shared semantic document;
5. preserve all inherited reader, focus, selection, and safe-rejection contracts;
6. keep hosted Actions out of exploratory diagnosis and use them only for intentional acceptance checkpoints after source gates pass;
7. require bounded real-iPhone VoiceOver acceptance before support is claimed.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by beginning another PowerTab investigation.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without John.

John is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

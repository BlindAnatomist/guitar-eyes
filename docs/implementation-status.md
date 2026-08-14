# Guitar Eyes Implementation Status

Last reconciled: August 14, 2026.

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

Current accepted format-only operational branch: `work/accepted-bass-convergence`

Accepted runtime convergence source: `67a062085c93d9fb546194d727c808960bbcaea9`

Convergence record: `docs/accepted-bass-convergence-result-2026-08-14.md`

Accepted TuxGuitar standard-bass closure: `1a874f34898d74f032cc2bc5a431ecb991be370d`

Accepted PowerTab standard-bass closure: `8b7b7d6beb16e2675f03197fb4e701d3d1984a79`

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
9. PowerTab `.pt2` internal versions 1 through 11 within accepted bounded, version-evidenced profiles;
10. legacy PowerTab `.ptb` file version 1 / PowerTab 1.0;
11. legacy PowerTab `.ptb` file version 2 / PowerTab 1.0.2;
12. legacy PowerTab `.ptb` file version 3 / PowerTab 1.5;
13. legacy PowerTab `.ptb` file version 4 / PowerTab 1.7;
14. TuxGuitar `.tg` native 1.0;
15. TuxGuitar `.tg` native 1.1;
16. TuxGuitar `.tg` native 1.2;
17. TuxGuitar `.tg` native 1.3;
18. TuxGuitar `.tg` native 1.5;
19. modern TuxGuitar native file format 2.0.0 validated against TuxGuitar 2.1.0 producer authority.

The accepted TuxGuitar generations now include both the previously accepted bounded six-string guitar profile and exact standard four-string bass G2-D2-A1-E1.

The accepted legacy PowerTab `.ptb` generations now include both the previously accepted bounded guitar profiles and exact standard four-string bass G2-D2-A1-E1.

PowerTab `.pt2` internal version 11 includes the accepted exact standard four-string bass profile. PowerTab `.pt2` internal versions 1 through 10 do not inherit bass support and remain bounded to their previously accepted evidence profiles.

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
12. Explicit inventory and selection for supported multi-track structured input where the profile proves it.
13. Selected-track details immediately before `Load selected track` in VoiceOver reading order.
14. Safe rejection instead of guessed version, duration, tuning, track, pitch, or unsupported structure.
15. No playback controls or playback language in the accepted format-only baseline.

## TuxGuitar `.tg`

Accepted native routes:

- 1.0;
- 1.1;
- 1.2;
- 1.3;
- 1.5;
- modern native file format 2.0.0.

Producer authority for the modern route remains:

- upstream repository: `helge17/tuxguitar`;
- release: `2.1.0`;
- exact tag commit: `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`;
- modern native file-format version: `2.0.0`.

The modern 2.0 route uses the exact two-entry ZIP container boundary `version.txt` plus `content.xml`, separates native file-format evidence from application-version metadata, and validates TuxGuitar precise-time coordinates before normalization.

The legacy routes use source-derived historical serializers and explicit internal version signatures. No native 1.4 route is inferred.

### TuxGuitar six-string profile

The original accepted TuxGuitar checkpoint passed deterministic project-authored fixture verification, source/version validation, focused routing tests, the complete inherited suite, optimized production build, hosted publication, complete deployed JavaScript read-back, and bounded real-iPhone Safari/VoiceOver acceptance.

Acceptance records:

- `docs/tuxguitar-tg-intake-investigation-2026-08-11.md`;
- `docs/tuxguitar-tg-producer-source-correction-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-source-gate-result-2026-08-11.md`;
- `docs/tuxguitar-tg-corrected-hosted-proof-2026-08-11.md`;
- `docs/tuxguitar-tg-real-iphone-acceptance-2026-08-11.md`.

### TuxGuitar standard four-string bass

Exact standard four-string bass in G2-D2-A1-E1 is accepted across the same six TuxGuitar generations: 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0.

The bass checkpoint has deterministic six-generation fixture evidence, focused and inherited automated proof, optimized build proof, hosted proof, and real-iPhone Safari/VoiceOver acceptance.

Acceptance records:

- `docs/tuxguitar-standard-bass-profile-investigation-2026-08-12.md`;
- `docs/tuxguitar-standard-bass-source-gate-result-2026-08-12.md`;
- `docs/tuxguitar-standard-bass-hosted-proof-2026-08-12.md`;
- `docs/tuxguitar-standard-bass-real-iphone-acceptance-2026-08-13.md`.

### TuxGuitar scope boundary

Accepted TuxGuitar coverage does not establish arbitrary compatibility with every `.tg` file. Unless separately proven, unsupported profiles include:

- native `.tg` 0.7, 0.8, and 0.9;
- alternate or extended-range bass tunings outside accepted evidence;
- arbitrary multi-track and multi-voice structures;
- broader effects, lyrics, automation, notation, repeats, tempo structures, and other unproven TuxGuitar features.

Unsupported structures must fail explicitly rather than be guessed.

## PowerTab `.pt2`

Accepted route: internal versions 1 through 11, each bounded by exact version evidence rather than inferred arbitrary compatibility.

Internal versions 1 through 10 use one historical compatibility/canonicalization layer proven against pinned Power Tab Editor 2.0.22 source at commit `13cab27c7127d301f2747671071e53eb203dc940`.

Internal version 11 remains accepted through its separately proven canonical Power Tab Editor 2.0.22 export and real-iPhone checkpoint.

PowerTab `.pt2` acceptance records include:

- `docs/powertab-pt2-v1-v10-investigation-ledger-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-source-gate-result-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-hosted-proof-2026-08-10.md`;
- `docs/powertab-pt2-v1-v10-real-iphone-acceptance-2026-08-11.md`;
- `docs/powertab-pt2-v11-clean-convergence-result-2026-08-10.md`;
- `docs/powertab-pt2-v11-real-iphone-acceptance-2026-08-10.md`.

### PowerTab `.pt2` bass boundary

Exact standard four-string bass in G2-D2-A1-E1 is accepted for internal version 11 only.

Internal versions 1 through 10 remain outside the bass claim. Convergence includes a dedicated regression proving that a four-string standard-bass profile on historical `.pt2` remains explicitly unsupported rather than being admitted by inference.

Bass acceptance record:

- `docs/powertab-standard-bass-real-iphone-acceptance-2026-08-14.md`.

## Legacy PowerTab `.ptb`

Accepted historical mapping:

- file version `1` = PowerTab 1.0;
- file version `2` = PowerTab 1.0.2;
- file version `3` = PowerTab 1.5;
- file version `4` = PowerTab 1.7.

Historical guitar acceptance records:

- `docs/powertab-ptb-v1-v3-real-iphone-acceptance-2026-08-10.md`;
- `docs/powertab-ptb-v17-real-iphone-acceptance-2026-08-10.md`.

Exact standard four-string bass in G2-D2-A1-E1 is now accepted for all four listed legacy `.ptb` generations.

Bass acceptance record:

- `docs/powertab-standard-bass-real-iphone-acceptance-2026-08-14.md`.

## Accepted bass convergence

The accepted TuxGuitar-bass and PowerTab-bass lines were converged without replaying their accepted evidence.

Runtime convergence source:

`67a062085c93d9fb546194d727c808960bbcaea9`

The convergence is a two-parent commit retaining both accepted lineages. The only substantive runtime overlap was the PowerTab track inventory. Its resolved form preserves historical `.pt2` versions 1 through 10 while preventing their unproved admission into the PowerTab bass profile.

Integration gate run `31848478423`, job `94919569731`, passed:

- 3 focused convergence suites / 22 tests;
- complete inherited suite: 70 suites / 424 tests passed;
- optimized production build.

No accepted fixture corpus was regenerated, and no already accepted real-iPhone test was repeated.

Full record:

- `docs/accepted-bass-convergence-result-2026-08-14.md`.

## Known shared-reader wording debt

Attached technique objects can still be spoken with the generic suffix `notation preserved but not yet interpreted`. This is shared wording debt, not a format-specific defect. Any future wording repair belongs in the shared semantic speech layer and must preserve technique attachment across every accepted format.

## Hosted publication lessons

Future hosted read-back must inspect every deployed JavaScript asset named by the artifact manifest or equivalent complete asset inventory, not only JavaScript directly referenced from initial HTML.

Each acceptance build must carry a unique static title and first heading so stable Pages URLs cannot make a real-device tester unknowingly validate an older checkpoint.

A successful deployment followed by failure in a post-deploy verification harness must be diagnosed at the harness boundary; accepted build and deployment evidence must not be discarded or repeated automatically.

## Unsupported or separately deferred

Unless a later lawful checkpoint proves support, the following remain unsupported:

1. arbitrary or malformed Guitar Pro files outside accepted profiles;
2. arbitrary PowerTab `.pt2` or `.ptb` files outside accepted version-specific profiles;
3. PowerTab standard-bass support for `.pt2` internal versions 1 through 10;
4. alternate or extended-range PowerTab bass, mixed guitar-and-bass, arbitrary multi-player, multi-voice, or broader notation profiles outside accepted evidence;
5. arbitrary TuxGuitar `.tg` files outside the accepted version-specific and semantic profiles;
6. TuxGuitar native 0.7, 0.8, and 0.9;
7. alternate or extended-range TuxGuitar bass and broader unproved TuxGuitar structures;
8. TablEdit `.tef`;
9. other unexamined proprietary tablature formats;
10. full-document playback;
11. teacher mode;
12. practice scoring;
13. bookmarks;
14. AI-generated instruction.

Recognition must never be described as reading support.

## Next lawful phase

The accepted format-intake work is now converged on `work/accepted-bass-convergence`.

Any future investigation must begin on a new isolated branch from the final documentation-closure head of that branch, not from either parent bass branch, fork `main`, an earlier format branch, or a forensic branch.

TablEdit `.tef` remains the next major dedicated-tab candidate. It remains unsupported and has not been investigated, implemented, branched, or otherwise begun by this convergence checkpoint.

No merge to `main`, playback reopening, teacher-mode work, or upstream modification is implied by this status record.

## Testing responsibility

Dependency work, source implementation, automated testing, builds, artifact inspection, documentation, repository administration, and hosted read-back proceed without owner intervention.

The owner is needed only after an exact hosted candidate passes every non-device gate and requires bounded real-iPhone VoiceOver judgment.

Jason Washburn is not involved unless he separately agrees to desktop testing.

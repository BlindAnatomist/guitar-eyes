# Real-World Guitar Pro Source Gate Final Result

Date: 2026-08-03

## Authority

- Branch: `work/real-world-guitar-pro-intake`
- Verified application source: `35f5db188662e12fb7dc5539b2ce4ef41e8b6111`
- Accepted format-only ancestor: `030e1f6af2de23e41ad993ab0292893b072664eb`
- Fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`
- Successful source-gate run: `30859374061`
- Successful job: `91837750250`

## Verified format families

One project-authored CC0 score is permanently represented and independently decoded in all five families:

- Guitar Pro 3 `.gp3`
- Guitar Pro 4 `.gp4`
- Guitar Pro 5 `.gp5`
- Guitar Pro 6 `.gpx`
- Guitar Pro 7 shared `.gp`

Every committed binary preserves the same six-string tuning, two-bar structure, ordered durations, timed rest, and string/fret coordinates. GP7 is represented truthfully as a bounded `GP7_GPIF_ONLY` package variant because its lawful archive contains `Content/score.gpif` but no GP8-style `VERSION` entry or GPIF version tags. Version-bearing GP7 and GP8 archives continue through the existing strict evidence route.

## Verification results

- Focused Guitar Pro evidence and actual-binary corpus gate: 5 of 5 suites and 38 of 38 tests passed.
- Complete inherited and new regression gate: 47 of 47 suites and 302 of 302 tests passed.
- Production build passed.
- alphaTab remained outside the initial JavaScript bundle and inside the lazy Guitar Pro import chunk.
- The format-only surface remained active.
- No soundfont, synthesizer, audio-worklet, SF2, SF3, or Iowa sampled-audio asset appeared in the build.
- Fork `main` was restored to its exact clean authority after the gate.

## Preserved failed evidence

Earlier gates remain recorded rather than erased:

1. The first permanent corpus gate exposed missing `TextDecoder` in Jest only.
2. The second exposed the real GP7 packaging difference: the lawful GP7 archive had no standalone `VERSION` entry.
3. The first GP7 correction gate exposed two bounded test-contract issues: versioned archive error ordering and the lack of a Node raw-DEFLATE shim in the broad corpus test.
4. The final correction changed only those boundaries and then passed every gate.

## Acceptance boundary

This source is ready for one hosted real-iPhone format-only acceptance candidate. The acceptance test must cover file selection, source-family recognition, semantic reading, focus recovery, rest and duration speech, and the continued absence of all playback and audition controls. No merge, playback work, teacher mode, additional format family, or production governance change is authorized by this result.
# Accepted Format-Intake Convergence 5B Real-iPhone Acceptance

Date: 2026-08-04

## Authority

- Repository: `BlindAnatomist/guitar-eyes`
- Branch: `work/accepted-format-intake-convergence`
- Clean accepted 4C base: `030e1f6af2de23e41ad993ab0292893b072664eb`
- Clean convergence application source: `2a8e5951ec4ced3ce63b2df85d82e54c0ba79ea0`
- Hosted proof identity: `Test build: Guitar Eyes format-only clean format-intake convergence proof 5B.`
- Clean fork `main` authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Real-device tester

John Washburn tested the hosted clean convergence proof on his iPhone with VoiceOver on August 4, 2026.

## Files tested

John tested all five project-authored cross-version Guitar Pro fixtures:

1. Guitar Pro 3 `.gp3`;
2. Guitar Pro 4 `.gp4`;
3. Guitar Pro 5 `.gp5`;
4. Guitar Pro 6 `.gpx`;
5. Guitar Pro 7 shared `.gp`.

## Test performed

John traversed all six semantic positions in every file.

## Owner report

John reported that:

- every file loaded;
- Guitar Eyes recognized the different Guitar Pro versions and named the version while loading;
- all six positions in each file read correctly;
- everything appeared to work correctly in the bounded test.

This record does not strengthen that report into claims John did not separately make. It records the tested files, position traversal, version announcements, and successful reading result.

## Acceptance decision

The clean format-intake convergence proof 5B is accepted on a real iPhone with VoiceOver for the tested GP3, GP4, GP5, GPX, and GP7 shared `.gp` fixtures.

The convergence acceptance boundary described in `docs/accepted-format-intake-convergence-5b-result-2026-08-04.md` is therefore closed.

## Boundary

This acceptance establishes only the clean convergence of the already accepted format-intake behavior.

It does not establish:

- arbitrary compatibility with every Guitar Pro file;
- compatibility outside the accepted profiles and lawful corpus;
- playback;
- sampled or procedural sound;
- teacher mode;
- practice scoring;
- bookmarks;
- AI instruction;
- support for PowerTab, TuxGuitar, TablEdit, or another format family;
- authorization to merge into `main`;
- authorization to modify the upstream repository.

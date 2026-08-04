# Real-World Guitar Pro Proof 5A iPhone Acceptance

Date: 2026-08-04

## Authority

- Repository: `BlindAnatomist/guitar-eyes`
- Branch: `work/real-world-guitar-pro-intake`
- Published proof source: `9b071196cbb84b9e56819acf769cb3d69e86e1f4`
- Successful publication-resume run: `30859802855`
- Hosted checkpoint: `real-world-guitar-pro-5a`
- Fork `main` authority remains: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Real-device tester

John Washburn tested the hosted proof on his iPhone with VoiceOver on August 4, 2026.

## Files tested

John tested all five project-authored real-world Guitar Pro fixtures:

- Guitar Pro 3 (`.gp3`)
- Guitar Pro 4 (`.gp4`)
- Guitar Pro 5 (`.gp5`)
- Guitar Pro 6 (`.gpx`)
- Guitar Pro 7 shared archive (`.gp`)

## Reported result

John traversed all six musical positions in every file.

He reported that:

- each file loaded successfully;
- Guitar Eyes recognized and announced the corresponding Guitar Pro version while loading;
- all six positions read correctly in every format;
- no format-specific reading error or semantic divergence was observed;
- everything in the bounded test appeared to work correctly.

## Acceptance decision

The format-only real-world Guitar Pro intake proof 5A is accepted on a real iPhone with VoiceOver for GP3, GP4, GP5, GPX, and GP7 shared `.gp` input.

The five-format cross-version corpus has therefore passed both automated semantic parity verification and real-device VoiceOver acceptance.

## Boundary

This acceptance closes the bounded real-world Guitar Pro format-intake checkpoint only.

It does not authorize:

- merging the feature branch;
- reopening playback work;
- beginning teacher mode;
- adding another format family;
- changing production governance;
- modifying fork `main` or the upstream repository.

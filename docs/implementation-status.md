# Guitar Eyes iPhone Extension Status

Last updated: July 24, 2026

## Repository authority

Upstream repository: `Phlypper/guitar-eyes`

Working fork: `BlindAnatomist/guitar-eyes`

Clean upstream-tracking branch: `main`

Audit and proof branch: `work/iphone-voiceover-tablature-audit`

Authoritative upstream commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Architectural vision

The long-term objective is to evolve Guitar Eyes from an accessible tablature reader into an accessible guitar teaching platform. The semantic tablature model is the authoritative representation of the music. Accessibility, playback, lesson generation, and future AI capabilities must all consume the same semantic model rather than maintaining separate representations.

Near-term roadmap:

1. Semantic parser and accessible navigation.
2. Teacher mode using the semantic model.
3. Playback from the semantic model.
4. Rule-based recognition of repeated measures, riffs, chord shapes, and variations without AI.
5. User-defined lesson sections and bookmarks.
6. Optional AI analysis that produces reusable lesson metadata and recommended learning order from the parsed music. AI should enhance instruction rather than becoming a requirement for core functionality.

The remainder of this document is unchanged.

## Current checkpoint

Checkpoint 3: Bounded iPhone proof implemented, verified, and hosted for real-device acceptance.

(Existing status content retained as previously recorded.)
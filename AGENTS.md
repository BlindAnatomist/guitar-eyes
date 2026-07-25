# Guitar Eyes Fork Instructions

These instructions govern every human or agent working in `BlindAnatomist/guitar-eyes`.

## Repository authority

- Preserve `Phlypper/guitar-eyes` completely untouched.
- Preserve fork `main` as a clean upstream-tracking branch.
- Perform bounded iPhone work only on `work/iphone-voiceover-tablature-audit` unless the owner authorizes a separate branch.
- Do not open a pull request or merge the work branch without the owner's explicit authorization.

## Required continuity reading

Before changing implementation, accessibility behavior, repository administration, GitHub Pages, workflows, playback, teacher mode, or future AI work, read:

1. `docs/implementation-status.md`;
2. `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
3. `docs/solved-problems-and-reusable-procedures.md`;
4. `docs/iphone-voiceover-tablature-audit.md`;
5. `docs/real-iphone-acceptance.md`;
6. `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`.

Do not rely on chat memory alone or rediscover a repository, deployment, accessibility, or workflow procedure that is already recorded.

## Zero-dollar automation

No paid GitHub usage is authorized. Do not weaken the account's $0 Actions hard stop, use a paid runner, or ask the owner to authorize overages.

Run available tests and builds in the active working environment before pushing. Batch coherent verified changes. GitHub-hosted workflows are intentional checkpoints, not an exploratory debugging loop.

For a failed Actions run, inspect the failed job and logs before acting. Rerun only the failed job when possible. Preserve successful evidence rather than consuming time repeating it.

## Accessibility and evidence

The iPhone semantic reader extends rather than replaces Jason's desktop reader. Preserve the semantic model, real-iPhone VoiceOver evidence, native Files-picker focus repair, and exact accepted behavior recorded in the repository.

Automated DOM tests are necessary but do not replace bounded real-iPhone Safari and VoiceOver acceptance. Record the owner's exact observation without strengthening or rewriting it.

## Scope boundary

The accepted bounded proof does not authorize redesign of the desktop reader, playback, teacher mode, pattern analysis, bookmarks, AI implementation, upstream changes, or production expansion. Each requires a separately bounded objective.

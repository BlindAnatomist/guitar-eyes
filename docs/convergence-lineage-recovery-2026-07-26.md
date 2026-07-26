# Convergence Lineage Recovery

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Recovery branch: `work/convergence-from-accepted-semantic-core`

Accepted foundation commit: `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`

Failed published convergence source: `d26e4172a0386ceb56ad5c0061e72d975b42fc43`

## Verdict

The July 26 convergence preview was built and verified from the wrong source lineage. Its automated tests and production build passed, but the source had diverged from and fallen 120 commits behind the accepted rhythm-and-measure foundation.

The preview therefore cannot be treated as a valid convergence candidate. It passed a thinner contract while silently discarding accepted behavior.

## Evidence

A direct commit comparison between the accepted foundation and the published convergence source reported:

- status: diverged;
- published convergence line ahead of the common ancestor by 26 commits;
- published convergence line behind the accepted foundation by 120 commits;
- merge base: `b42fc5cfc7e51813cfb76f1258f9ddfdd38abb1f`.

The comparison showed replacement or removal across the application shell, iPhone reader, parser/model, desktop reader, tests, and repository status records.

## Accepted foundation that was lost

The accepted source at `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e` had already passed automated, hosted, and real-iPhone acceptance for:

1. automatic guitar and bass detection in both directions;
2. automatic correction of the instrument selector;
3. clean six-string guitar and four-string bass;
4. multiple complete tablature blocks;
5. durable Files-picker focus recovery after success and failure;
6. quiet Previous and Next position movement;
7. dedicated Read current position speech;
8. omission of ordinary unplayed strings from spoken instructions;
9. continued speech for open strings, frets, explicit notation, and techniques;
10. W, H, Q, E, and S rhythm-duration mapping and speech;
11. explicit measure recognition from aligned shared barlines;
12. measure and position-within-measure speech;
13. the accepted control order: Previous position, Read current position, Next position;
14. a real-world ASCII-format corpus and accurate unsupported-format preflight.

## Real-device regression that exposed the lineage error

On the published convergence preview, the owner reported:

1. Previous and Next position repeated full string and fret instructions;
2. tablature-block movement repeated full playing instructions;
3. ordinary unplayed strings were announced as silent;
4. accepted duration speech was absent.

These were not new design questions. They contradicted previously accepted behavior and revealed that the preview was not built from the accepted foundation.

## Failed approach to preserve

Do not repair the diverged convergence branch one symptom at a time. Doing so would reconstruct accepted behavior incompletely while retaining the wrong parser and documentation lineage.

Do not use passing tests as evidence that convergence preserved behavior when the tests were rewritten from a thinner source contract.

Do not publish another candidate until its ancestry begins at the accepted foundation and its regression suite explicitly protects every accepted speech and semantic contract.

## Recovery action

1. Preserve `work/iphone-voiceover-tablature-audit` as forensic evidence of the failed convergence line.
2. Create `work/convergence-from-accepted-semantic-core` directly from `85396dc7066a2552b1c4f87f04f7b4f99b2c4a7e`.
3. Treat the accepted reader and semantic contracts as immutable regression requirements.
4. Reconstruct desktop convergence on this recovery branch only.
5. Preserve Jason Washburn's recognizable desktop spatial concept while ensuring the desktop presentation consumes the accepted semantic document.
6. Remove active interception of VoiceOver modifier commands without deleting accepted rhythm, measure, import, focus, or speech behavior.
7. Add convergence tests without replacing the inherited accepted suite.
8. Run the complete inherited and new tests before any publication.
9. Publish one new preview only after source ancestry, build identity, and compiled-artifact checks prove the accepted foundation is present.
10. Require a bounded real-iPhone regression before declaring convergence accepted.

## Current hosted warning

The address `https://blindanatomist.github.io/guitar-eyes/` currently serves the invalidated convergence preview built from `d26e4172a0386ceb56ad5c0061e72d975b42fc43` until a corrected recovery candidate is deliberately published.

Do not ask the owner to continue acceptance testing that build.

## Repository authority

- `Phlypper/guitar-eyes` remains untouched.
- Fork `main` must remain exactly at `60c2e5de0887b1bcdd426d932632946edd07d3c3` outside a bounded temporary publisher operation.
- No pull request or merge is authorized.
- Jason Washburn is not assumed to participate in testing.

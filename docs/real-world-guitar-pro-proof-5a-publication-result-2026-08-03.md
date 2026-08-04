# Real-World Guitar Pro Proof 5A Publication Result

Date: 2026-08-03

## Authority

- Publication source: `9b071196cbb84b9e56819acf769cb3d69e86e1f4`
- Successful publication-resume run: `30859802855`
- Successful publication job: `91839068394`
- Hosted checkpoint: `real-world-guitar-pro-5a`
- Fork `main` authority after publication: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Result

The format-only real-world Guitar Pro intake proof 5A was published successfully after one workflow-only correction to a minifier-sensitive static assertion.

The successful resume gate passed:

- exact immutable source and branch authority;
- publication identity and format-only regression tests;
- production Pages rebuild;
- minifier-safe artifact inspection;
- GitHub Pages configuration, upload, and deployment;
- live hosted HTML read-back;
- live main JavaScript read-back for the Guitar Pro 3, Guitar Pro 6, GP7 GPIF-only, and internal intake-foundation identities.

No application source changed between the failed first publication attempt and the successful resume. The first attempt had already passed its tests and build but stopped before deployment because it searched the minified HTML for the exact spaced source text `window.GUITAR_EYES_FORMAT_ONLY = true;`. The resume checked the durable `GUITAR_EYES_FORMAT_ONLY` token instead.

## Acceptance boundary

The hosted proof is ready for real-iPhone VoiceOver acceptance using the five committed project-authored binaries: GP3, GP4, GP5, GPX, and GP7 shared `.gp`.

Acceptance concerns only:

- file selection and source-family recognition;
- focus recovery after the Files picker;
- identical semantic positions across all five formats;
- accurate string and fret speech;
- quarter- and half-note duration speech;
- the timed rest;
- absence of sound delay, audition, position audio, playback instructions, and all other playback surfaces.

No merge, playback reopening, teacher-mode implementation, additional format family, or production-governance change is authorized by this publication result.
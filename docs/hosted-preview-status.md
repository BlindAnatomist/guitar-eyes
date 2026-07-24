# Hosted Preview Status

Repository: `BlindAnatomist/guitar-eyes`

Working branch: `work/iphone-voiceover-tablature-audit`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

## Repository authority

- Preserve `Phlypper/guitar-eyes` untouched.
- Preserve fork `main` as clean upstream tracking after every temporary publication.
- Upstream authority commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- Do not open a pull request.

## Current acceptance state

- Initial iPhone order and collapsed desktop instructions: accepted on the real iPhone.
- Six-string parsing: accepted for the controlled fixture.
- Five-position semantic reader output: understandable and accepted as functioning.
- File-picker focus recovery: failed twice because VoiceOver returned to Safari Page Menu.

## Current repair head

Exact candidate branch head before this status update:

`11476550b4bbda1c86b2b00d9c3840ea51d94529`

The candidate retains a pending reader-focus request until Safari signals return from the native Files picker through window focus, pageshow, or document visibility. It then waits for the browser to restore web content before focusing the persistent reader heading.

## Publication gate

Status: pending.

The bounded temporary-main publisher may be used solely to obtain GitHub-hosted install, test, build, and Pages evidence for the exact candidate. After the workflow result, restore `main` to `60c2e5de0887b1bcdd426d932632946edd07d3c3` and compare it with that commit.

Do not ask the owner to retest until:

1. automated tests pass;
2. the production build passes;
3. Pages publishes the exact candidate successfully;
4. the hosted page is verified;
5. fork `main` is restored and independently confirmed identical to upstream.

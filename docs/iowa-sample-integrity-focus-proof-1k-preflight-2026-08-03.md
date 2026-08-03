# Iowa Sample Integrity and First-Focus Proof 1K Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-integrity-focus-proof-1k`

Starting application source: `33ae73dbe6f26655ab31ebb567acf54887661ce1`

Inherited accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner findings

1. On the first activation of `Audition current position`, VoiceOver moved to Safari Page Menu. Later auditions retained focus after the owner manually returned to the application.
2. The owner accidentally used the older general MusicXML four-position fixture rather than the purpose-built Iowa listening fixture, so the reported absence of a chord and the position inventory do not evaluate the intended sample test.
3. Independent inspection of the exact deployed 1J Pages artifact found a separate genuine sample-integrity defect: the low-E derived WAV peak was about one eighth of the A-string WAV and the derivation function explicitly used `min(1.0, target / peak)`, which could attenuate but could never amplify quiet takes.

## Exact bounded repair

1. Preserve the 1J Web Audio routing, pitch mapping, two-second delay, navigation, rest behavior, and loudness-stage design while replacing the defective derived sample lock only if a deterministic integrity derivation passes.
2. Select within the official catalog note group using near-best pitch evidence, then prefer stronger audible-window RMS rather than the quietest highly correlated take.
3. Apply a deterministic 35 Hz high-pass stage, bounded 100 ms RMS normalization, peak protection, maximum amplification, and post-derivation pitch verification.
4. Reject rather than publish a derived sample that remains too quiet or loses target-pitch integrity.
5. Extend the one-use first-audition focus guard to detect focus leaving the webpage with no DOM destination and a window-level browser-chrome escape. Restore the Audition button through one bounded two-frame focus pulse, then disarm.
6. Preserve ordinary intentional focus movement and do not trap later VoiceOver navigation.
7. Give the next hosted candidate a unique 1K identity and use the unambiguously named listening fixture containing low open E, high open E, six-string E-major, and rest.

## Diagnostic execution gate

Purpose: download the same six official University of Iowa sessions, derive temporary integrity candidates, verify measurable output and pitch constraints, and upload the WAVs plus evidence for inspection.

Trigger: one push creating `.github/workflows/iowa-sample-integrity-diagnostic-1k.yml` on the 1K branch.

Runner: standard GitHub-hosted `ubuntu-24.04`.

Timeout: 20 minutes.

Permissions: contents read and commit statuses write.

Artifact: six temporary WAV candidates, derivation evidence, and hashes retained for one day.

This diagnostic does not deploy, publish Pages, modify `main`, open a pull request, merge, touch `Phlypper/guitar-eyes`, or begin measure playback, full playback, teacher mode, scoring, bookmarks, AI work, or new formats.

## Stop condition

Stop the diagnostic after artifact inspection. Update the canonical sample lock only if all six candidates have coherent target pitch, bounded amplitude, and materially improved balance. Then run one complete exact-source verification and one separately authorized proven Pages publication before owner testing.

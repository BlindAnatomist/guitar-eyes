# Iowa Sample Loudness Proof 1J Verification Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-loudness-proof-1j`

Exact source candidate: `33ae73dbe6f26655ab31ebb567acf54887661ce1`

Preserved 1I proof source: `4aee0deba0823b846cb2a067733ac487f8e5b6c5`

Inherited accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

## Source-change boundary

The candidate changes only:

1. `src/iowaSampleAuditioner.js`;
2. `src/iowaSampleLoudness.test.js`;
3. `src/IPhoneTabReader.js`;
4. `public/index.html`;
5. `src/buildIdentity.test.js`;
6. `src/checkpointBuildIdentity.test.js`.

The audio change raises the sampled master input, applies deliberate physical-string gain compensation with the strongest increase on the low E string, and preserves per-voice chord attenuation and the existing compressor.

The remaining changes give the hosted candidate the unique identity `Guitar Eyes Iowa sample loudness proof 1J` and add focused regression coverage.

## Verification purpose

Run the complete inherited test suite and production build once against the exact source candidate. Verify accepted ancestry, the six-file boundary, the unique 1J identity, sampled-string routing, low-string gain compensation, chord headroom, the two-second delay, audition control order, rest handling, and repository cleanliness.

## Workflow design

Trigger: one push that creates `.github/workflows/iowa-sample-loudness-proof-1j.yml` on the dedicated 1J branch.

Runner: standard GitHub-hosted `ubuntu-24.04`.

Timeout: 20 minutes.

Artifact retention: one day.

Permissions: repository contents read and commit statuses write only.

Concurrency: one branch-specific group with `cancel-in-progress: true`.

The workflow checks out the hard-locked source SHA rather than the later workflow or documentation commit.

## Cost and duplication boundary

This is one intentional zero-dollar verification checkpoint. It does not deploy, publish, modify `main`, touch `Phlypper/guitar-eyes`, use a paid runner, or start a repeated debugging loop.

The existing 1I gate cannot lawfully verify this candidate because it is branch-bound, identity-bound, and file-bound to the prior proof. A dedicated exact-source gate is therefore required rather than weakening or repurposing the historical 1I evidence.

## Stop condition

Stop after one verification result is inspected. Do not publish unless the exact source passes the complete gate. Real-iPhone testing is required only after a separately bounded hosted 1J candidate exists.

# TuxGuitar Standard Four-String Bass Source Gate Result

Date: August 12, 2026

Branch: `work/tuxguitar-standard-bass-profile`

Accepted TuxGuitar guitar base: `4ce6a7502ab1c478b90e11879491021a0dcfb774`

Original bounded bass implementation: `6e60691d9870d0cf64a3f0445c12d18fb71627e3`

Repaired source-gated candidate: `461c63c3f36f78d9e356442506441f68efd5be71`

Producer authority: TuxGuitar 2.1.0, tag commit `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129`

Result: passed source gate. Hosted publication and real-iPhone acceptance remain separate gates.

## Scope

This checkpoint proves only standard four-string bass in exact G2 D2 A1 E1 tuning for the already accepted native TuxGuitar generations 1.0, 1.1, 1.2, 1.3, 1.5, and modern native file format 2.0.0.

It does not claim arbitrary bass profiles, five- or six-string bass, alternate tuning, multiple tracks, multiple voices, broader effects, repeats, lyrics, automation, or additional TuxGuitar generations.

## Preserved application architecture

The accepted `src/tuxGuitarDecoder.js`, `src/tuxGuitarSourceNormalizer.js`, `src/tuxGuitarTrackInventory.js`, accepted guitar fixtures, package manifests, and shared semantic model remain unchanged.

The bounded bass route validates bass-specific source structure, reuses the accepted TuxGuitar semantic parser route, restores four-string bass identity before the existing shared inventory and normalizer, and preserves the same semantic reader documents for iPhone and desktop.

## First hosted source-gate attempt

Run `31620856936` checked out the exact implementation but stopped at the authority preflight because the workflow used a one-commit shallow checkout and therefore did not contain accepted base commit `4ce6a750...` for the ancestry assertion.

No dependency installation, fixture proof, test, build, or asset gate ran. This was a workflow-history preflight failure, not an application failure.

## Corrective source-gate attempt

Run `31621148449` corrected only the checkout history depth.

It passed:

- exact source checkout and ancestry;
- bounded changed-file authority;
- locked dependency installation;
- two successive deterministic bass-corpus generations with zero diff;
- identical first/second corpus hashes;
- independent verification of all six bass fixtures against the pinned producer authority;
- the accepted TuxGuitar guitar compatibility suite;
- every legacy bass generation 1.0, 1.1, 1.2, 1.3, and 1.5.

The focused gate then exposed a test-runtime gap only on modern 2.0: the new modern bass adapter uses both `TextDecoder` and `TextEncoder`, while the Jest/jsdom bass test supplied only the existing Node `TextDecoder` polyfill. The profile router preserved the original accepted guitar rejection, so the missing encoder initially surfaced as the earlier six-string-tuning message.

The complete inherited suite and production build did not run in this attempt because the focused gate stopped first.

## Repair boundary

The repair added the matching Node `TextEncoder` test-runtime polyfill to `src/tuxGuitarBassCompatibility.test.js`.

No parser, fixture, normalizer, reader, package manifest, accepted guitar source, or production runtime file changed.

Independent unmetered browser reproduction also confirmed the modern 2.0 transformation itself: standard bass tuning is canonicalized into the accepted parser form, bass clef becomes treble for the parser boundary, producer precise-start values survive, and decoded string coordinates restore correctly to four-string bass.

## Authorized verification exception

After the hosted-run circuit opened, the owner explicitly authorized one verification exception and one additional run if necessary.

Run `31622376829`, job `94200147121`, checked out exact repaired candidate `461c63c3f36f78d9e356442506441f68efd5be71` and passed:

- exact candidate identity;
- locked dependency installation;
- focused TuxGuitar guitar plus bass proof: 2 suites, 38 tests, 0 failed;
- complete inherited repository proof: 65 suites, 421 tests, 0 failed;
- optimized production build;
- bounded feature and production-asset inspection.

The exception deliberately did not regenerate the bass fixtures because their fixed-point generation and independent verification had already passed in run `31621148449`. That evidence was preserved rather than repeated.

Existing React/Create React App maintenance warnings remained non-failing and were not introduced by this checkpoint.

## Automation cleanup

The temporary exception trigger was removed after the successful run and the inherited `.github/workflows/iphone-audit.yml` content was restored exactly. No additional workflow run was triggered by cleanup.

Fork `main` and `Phlypper/guitar-eyes` remained untouched throughout the source gate.

## Decision

The bounded TuxGuitar standard four-string bass source gate passes.

The next permitted step is one uniquely identified hosted Pages candidate using the repository's already-proven TuxGuitar publication procedure, followed by bounded real-iPhone Safari/VoiceOver acceptance. No merge or pull request is authorized by this result.

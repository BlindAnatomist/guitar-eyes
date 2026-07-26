# Convergence Recovery Real-iPhone Acceptance

Date: July 26, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/convergence-from-accepted-semantic-core`

Verified and hosted implementation source: `72159d25958fffd941c95351c6781cf579e1d622`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

Tester: John Darrin Washburn

Device path: iPhone Safari with VoiceOver

Status: passed

## Purpose

This was a preservation test after desktop-phone convergence recovery. It checked that the accepted iPhone behavior remained intact while the desktop reader was rebuilt around the same semantic document.

It specifically guarded against the regressions exposed in the invalidated convergence preview:

1. movement controls announcing full playing instructions;
2. ordinary unplayed strings being spoken;
3. rhythm and measure information disappearing;
4. native Files-picker return focus landing on Safari Page Menu;
5. multi-block navigation losing its accepted behavior.

## Controlled fixture

The test used `guitar-eyes-recovery-iphone-regression.txt`, a controlled two-block guitar specimen containing:

1. aligned measure bars;
2. Q and H rhythm values;
3. open and fretted high-E-string positions;
4. ordinary unplayed strings;
5. multiple complete tablature blocks.

## Owner report

The owner reported:

> Everything worked. Focus worked well. It read what it was supposed to. The Next and Previous buttons just said what they did. They did not read what was supposed to be played. It was good. It passed.

This wording is preserved as the authoritative real-device observation.

## Accepted results

The real-iPhone gate confirms:

1. the corrected recovery preview opened and operated in Safari with VoiceOver;
2. native Files-picker return focus worked usefully;
3. VoiceOver did not remain on Safari Page Menu;
4. Previous position and Next position behaved as movement controls rather than playing-instruction controls;
5. movement controls did not announce what should be played;
6. Read current position delivered the intended playing information;
7. the semantic reader spoke the material it was supposed to speak;
8. the tested rhythm, measure, open-string, omitted-unplayed-string, and multi-block contracts remained intact in practical use;
9. the corrected recovery build passed the owner's bounded iPhone preservation test.

## Checkpoint verdict

Convergence recovery checkpoint 1 passes its real-iPhone Safari and VoiceOver acceptance gate.

The convergence candidate is now supported by:

1. accepted-foundation ancestry;
2. 17 of 17 passing automated suites;
3. 81 of 81 passing automated tests;
4. successful production build;
5. compiled-artifact checks;
6. successful corrected Pages publication;
7. successful hosted HTML and live-bundle read-back;
8. exact restoration of fork `main`;
9. real-iPhone VoiceOver acceptance.

Jason Washburn's desktop acceptance remains deferred unless he agrees to participate. His absence does not invalidate the iPhone acceptance or the automated desktop convergence evidence.

## Scope boundary

This acceptance does not authorize a pull request, merge, upstream modification, playback, teacher mode, pattern analysis, bookmarks, AI implementation, or another publication cycle.

# Guitar Pro real-iPhone checkpoint 3E result and bounded 3F reading-order repair

Date: 2026-07-27

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Accepted hosted 3E source before this repair: `0ebd9dd5e40906d79083fcaa8ac679944d5933e0`

Accepted hosted and real-iPhone 3F source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

## Owner's exact real-iPhone 3E result

John reported:

> That worked the only thing that seemed to be a problem or at least annoying was when I tried to go backwards, swipe left through the buttons after I got to after I had selected the base proof and was on the upload button. I went back I swiped left because I wanted to hear what it said about the bass proof I hadn't heard everything. It was said about it yet. I just selected it and then moved to the upload button, but when I tried to go backwards, the voice focus didn't go back to the describing the base proof. It started reading the stuff about it having two tracks and I could select from two tracks, so it wasn't intuitive. It didn't move to where the focus should have gone to moving backwards through the buttons and selections, but the main part of it did work. I was able to upload that multi track file. It recognized It and then gave me my choices so I think that part of it passes. It's just again stuff with that voiceover, focus and stuff we've been over in the past with.

John then clarified:

> I had not pressed upload yet. I got there and before I pressed it, I was just going backwards just to see if I could go backwards through everything I had just been through and like I said, VoiceOver went to talking about something at the beginning of the choices telling me that I had multiple choices rather than just moving backwards through what I just been through.

Do not strengthen these reports. Together they establish:

1. The 3E multi-track intake contract passed on John's real iPhone: the file uploaded, Guitar Eyes recognized it as multi-track, exposed the available choices, and allowed explicit selection.
2. John selected Proof Bass and moved forward to the `Load selected track` button.
3. John had not activated `Load selected track`. He swiped left only to review the immediately preceding selected-track information.
4. The backward swipe did not return to the selected bass description. VoiceOver instead returned to earlier general instructions about the two-track choice.
5. The evidence established a backward reading-order defect before activation. It did not establish an upload failure, loading failure, automatic activation problem, importer failure, or incorrect track selection.

## Matching repository canon

The repair follows:

- `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
- `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
- GE-002 and the cross-repository VoiceOver focus standards without forcing focus;
- GE-005 unique hosted build identity;
- GE-006 separation of navigation speech from content speech;
- XR-EXECUTION-SCOPE-001 one deliberate hosted checkpoint after local verification.

## Bounded 3F repair contract

1. Preserve the accepted 3E archive-integrity and explicit-selection behavior unchanged.
2. Add one persistent plain-text selected-track summary inside the form.
3. Place that summary directly after the radio group and directly before `Load selected track` in document order.
4. When a track is selected, repeat the complete project-owned selection label in the summary.
5. Do not use a live region, forced focus, timer, automatic activation, or `aria-describedby` on the load button.
6. Keep `Load selected track` disabled until an explicit radio selection exists.
7. Add a regression proving that the selected-track summary is the immediate previous element before the load button.
8. Require a unique hosted 3F identity and bounded real-iPhone backward-swipe retest.

## Hosted verification

Exact source: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`

The single bounded 3F checkpoint passed:

1. complete inherited and new automated tests;
2. production build;
3. lazy Guitar Pro decoder separation;
4. no notation-font, soundfont, renderer-worker, audio-worklet, or playback expansion;
5. GitHub Pages deployment;
6. exact live HTML, manifest, main-bundle, and lazy-asset read-back;
7. restoration of fork `main` to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Owner's exact 3F acceptance

John reported:

> That worked

Do not strengthen this result beyond the bounded test. It establishes that, after selecting Proof Bass and reaching `Load selected track` without activating it, the repaired backward-swipe path returned to the selected-track details as intended.

## Acceptance state

State: `local-proven`

Checkpoint 3E core multi-track intake: accepted on real iPhone.

Checkpoint 3F selected-track backward reading order: accepted on real iPhone.

The Guitar Pro shared-archive checkpoint is closed for the verified project-authored GP8-style single-track and two-track fixtures. This does not establish general GP7 support, GP3 through GP6 support, arbitrary Guitar Pro compatibility, playback, rendering, or any other deferred format.
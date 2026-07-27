# Guitar Pro real-iPhone checkpoint 3D result and bounded 3E repair

Date: 2026-07-27

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Accepted hosted 3D application source: `1815095e8b9e669e7ca98107e6521acc1026f141`

## Owner's exact real-iPhone result

John reported:

> That worked when I put in the single track it automatically recognized it as guitar and put the stuff in for the multi track, though it only gave me the guitar at first and didn't mention that there were two tracks of a guitar proof and a bass proof, but when I switched the instrument to base and then reloaded the multi track, then it told me that there were two tracks, a guitar proof and a base proof and let me select which one I wanted to load and I was able to select the base and get it to load

Do not strengthen this report. It establishes:

1. The project-authored single-track `.gp` file was selectable and loaded automatically as guitar.
2. On the first reported multi-track attempt, John encountered only the guitar result and did not receive a clear two-track choice.
3. After changing the separate instrument selector to bass and reloading the multi-track file, John encountered the guitar and bass track inventory, explicitly selected bass, and loaded it.
4. The evidence does not establish that the instrument selector caused the different result. The Guitar Pro path does not use that selector.
5. Checkpoint 3D did not pass the no-silent-selection acceptance boundary.

## Matching repository canon

The repair follows:

- `.github/ZERO_DOLLAR_AUTOMATION_POLICY.md`;
- `docs/KNOWN_PROBLEMS_AND_PROVEN_SOLUTIONS.md`;
- GE-003 temporary Pages authority restoration;
- GE-004 instrument-selector scope;
- GE-005 unique hosted build identity;
- XR-EXECUTION-SCOPE-001 failure inspection and least-expensive capable execution.

## Bounded 3E repair contract

1. Read the number of tracks declared by `Content/score.gpif` directly from the archive bytes.
2. Preserve that count in serializable version evidence.
3. If alphaTab's first decoded score contradicts the archive declaration, retry decoding once inside the lazy worker.
4. If the retry still contradicts the archive, reject the file with `GUITAR_PRO_TRACK_COUNT_MISMATCH`; never auto-load the incomplete guitar result.
5. Independently reject a mismatched intermediate before building track inventory.
6. For a genuine multi-track inventory, begin with no radio option selected.
7. Keep `Load selected track` disabled until the owner explicitly chooses a track.
8. State that the separate Guitar or Bass control does not filter Guitar Pro tracks.
9. Preserve one decode in the normal path and reuse the accepted intermediate after explicit selection.
10. Preserve all inherited ASCII, MusicXML, desktop, iPhone, focus, speech, timing, and no-audio/no-renderer boundaries.

## Acceptance state

State: `candidate`

Automated test, production build, hosted read-back, and bounded real-iPhone VoiceOver retest remain required. Do not close the Guitar Pro checkpoint until all pass.

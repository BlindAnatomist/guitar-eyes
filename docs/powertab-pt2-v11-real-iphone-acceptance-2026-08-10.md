# PowerTab `.pt2` Version-11 Real-iPhone Acceptance

Date: August 10, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/powertab-pt2-v11-clean-convergence`

Hosted source tested: `c2ada9bbdf118abddc894094734314f9b6048ea6`

Canonical file tested: `fixtures/powertab-v11/powertab-v11-editor-export-six-position.pt2`

Canonical file SHA-256: `6494d78b001a43322362d962b21ce88029f3c7c4cf231b9e8da5af2a3bf85835`

Tester: John Washburn

Environment: real iPhone, Safari, VoiceOver

## Owner observations

The owner reported that the canonical PowerTab file loaded successfully.

He reported that VoiceOver focus stayed where it was supposed to after file selection.

He traversed all six semantic positions and reported that VoiceOver read each of them.

He specifically observed that the fourth position in the first measure was announced as an open D string with palm muting, followed by wording that the notation was "not yet interpreted."

After completing the remaining bounded checks without waiting for step-by-step prompting, he reported that he had tested everything else and did not report another failure.

## Interpretation of the palm-mute wording

The canonical editor-exported file contains a half-note open D-string position with the PowerTab `PalmMuting` property.

The PowerTab v11 parser correctly maps that property to the shared semantic technique name `palm mute`.

The phrase "notation preserved but not yet interpreted" is appended later by the shared `positionDescription` speech layer to preserved technique objects. The same generic wording is used for other attached techniques such as hammer-ons and pull-offs.

Therefore this observation is classified as shared-reader wording debt, not as a PowerTab decode, routing, position, tuning, focus, or semantic-parity failure. A future repair should be made once in the shared speech layer rather than as a PowerTab-specific exception.

## Acceptance decision

The bounded real-iPhone Safari and VoiceOver gate passes for the accepted `.pt2` internal-version-11 profile.

This acceptance is limited to the evidence actually tested. It does not establish arbitrary PowerTab compatibility, legacy `.ptb` support, older `.pt2` versions, or untested instrument and notation profiles.

Existing ASCII, MusicXML, MXL, and Guitar Pro routes were not re-tested because no direct regression was observed during this bounded PowerTab acceptance.

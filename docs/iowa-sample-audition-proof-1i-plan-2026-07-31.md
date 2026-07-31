# Iowa String-Aware Sample Audition Proof 1I Plan

Date: July 31, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-audition-proof-1i`

Starting documentation head: `52053bca9a3e12029497f433cd834810abbfdeb6`

Inherited accepted application source: `51741c03a9eaa339940c84d53e0f0f00e6413a93`

Rejected procedural timbre candidate source: `b3d9f39de3900c0065875451bc2a90531226c707`

Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Owner finding

The owner found that Procedural Timbre Proof 1H remained toy-like. Low and high E were distinguishable, the six-string chord was simultaneous but sounded horrible, and the rest behaved correctly. The procedural timbre is therefore not musically accepted.

## Source authority and rights

The proof may use only guitar recordings from the University of Iowa Electronic Music Studios Musical Instrument Samples collection. The official collection page states that the recordings may be downloaded and used for projects without restrictions. The guitar page identifies the instrument as a Raimundo 118 classical guitar recorded in an anechoic chamber and provides per-string chromatic recordings at multiple dynamics.

Official pages:

- `https://theremin.music.uiowa.edu/MIS.html`
- `https://theremin.music.uiowa.edu/MISguitar.html`

For this proof, use only the mono 16-bit, 44.1 kHz, mezzo-forte files needed to derive six string-specific anchors:

1. string 6: `Guitar.mf.sulE.E2B2.mono.aif`, select E2;
2. string 5: `Guitar.mf.sulA.A2B2.mono.aif`, select B2;
3. string 4: `Guitar.mf.sulD.D3B3.mono.aif`, select E3;
4. string 3: `Guitar.mf.sulG.G3B3.mono.aif`, select G-sharp 3;
5. string 2: `Guitar.mf.sulB.B3.mono.aif`, select B3;
6. string 1: `Guitar.mf.sul_E.E4B4.mono.aif`, select E4.

Preserve source URL, source filename, selected note, extraction method, derived-file hash, and the University of Iowa usage statement in the checkpoint evidence.

## Bounded purpose

Determine whether real, dry, string-specific guitar samples produce a qualitative improvement over the rejected 1H procedural engine while preserving the accepted semantic, timing, VoiceOver, and focus contracts.

## Architecture

1. The semantic tablature document remains the sole musical authority.
2. The current-position event builder continues to provide exact string identity, fret, MIDI pitch, duration, chord onset, mute, and rest state.
3. A new project-owned sample auditioner selects a sample only from the same physical string.
4. The proof begins with one anchor sample per guitar string.
5. Pitch shifting is bounded to a narrow range and must not cross strings.
6. Chord sources share one scheduled onset through native Web Audio.
7. The accepted two-second delay, first-audition focus guard, quiet navigation, rest outcome, and Previous–Read–Next–Audition order remain unchanged.
8. The rejected procedural engine may remain only as an explicit fallback outside the 1I listening fixture; it must not be used silently for a supposedly sampled event.

## Asset strategy

Do not use GitHub Actions bot commits to transport binary samples.

For the bounded hosted proof, an intentional zero-dollar acquisition/publication workflow may:

1. download the six official Iowa scale files;
2. verify their exact URLs and hashes;
3. derive six short normalized browser audio assets deterministically;
4. place those derived assets only in the Pages build artifact;
5. publish the exact verified source and derived assets;
6. retain acquisition and derived-asset evidence for one day;
7. restore fork `main` exactly after publication.

The repository source must contain the deterministic manifest and extraction instructions, not unverified opaque binaries.

## Required proof behavior

The purpose-built 1I test must include:

1. low open E on string 6;
2. high open E on string 1;
3. six-string E-major chord using exact string identities;
4. semantic rest.

The owner will judge:

1. whether the single notes sound materially more like a real guitar;
2. whether the chord sounds coherent rather than like stacked synthetic toys;
3. whether string identity remains audible;
4. whether all chord strings begin together;
5. whether the two-second delay, focus, quiet navigation, and rest behavior remain intact.

## Explicit exclusions

Do not begin:

- measure or bar playback;
- full-document playback;
- transport controls;
- automatic progression;
- looping;
- tempo controls;
- teacher mode;
- scoring;
- bookmarks;
- AI work;
- new tablature formats;
- electric-guitar processing;
- convolution cabinets;
- third-party sampler libraries;
- soundfonts;
- alphaSynth;
- AudioWorklets;
- network sample loading in the accepted final application.

## Verification sequence

1. Acquire the exact official files in one bounded GitHub-hosted audit because the active execution container cannot resolve the university host.
2. Inspect format, duration, silence boundaries, and source hashes before implementation.
3. Implement deterministic extraction and the string-aware sample auditioner.
4. Preserve inherited tests and add sample-selection, bounded pitch, shared-onset, fallback, rest, stop, and disposal coverage.
5. Run the complete inherited suite and production build against the exact source.
6. Build the Pages artifact with the six derived samples.
7. Inspect the artifact and read back live HTML, JavaScript, manifest, and sample assets.
8. Restore `main` exactly.
9. Bring the owner in only for the bounded real-iPhone listening test.

## Stop condition

Stop before owner testing unless the exact hosted candidate passes source authority, acquisition integrity, complete tests, build, sample-asset inspection, live read-back, and clean-main restoration.

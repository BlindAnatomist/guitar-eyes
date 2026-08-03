# Known Problems and Proven Solutions: Iowa Source-Start Selection

Repository: `BlindAnatomist/guitar-eyes`

Date: August 3, 2026

Status: local-proven through intact-source reproduction; hosted and real-iPhone acceptance pending

## GE-016 — A note beginning at sample zero is replaced by a later decay tail

### Symptoms

The first Iowa note in three source files sounded faint, absent, or wrong after derivation:

- high E was extracted from 7.349116 seconds, which was the following chromatic note rather than the source-start E4;
- B3 was extracted from a later low-energy ripple rather than the note beginning at sample zero;
- low E was extracted from a late decay ripple rather than the note beginning at sample zero.

Peak normalization and later active-loudness normalization could make those segments internally consistent without making them the correct musical events.

### Cause

The inherited attack detector required a preceding lookback window. A note beginning at the first sample has no preceding silence and therefore could never become a detected attack. The ordered-group selector then treated multiple decay ripples as independent note events and selected by raw candidate position.

### Failed-do-not-repeat approaches

1. Do not repair one quiet string by raising its playback gain.
2. Do not accept a normalized WAV merely because its hash, peak, and loudness are stable.
3. Do not divide raw attack candidates proportionally by the catalog note count when one note can produce several decay detections.
4. Do not use GitHub Actions as an iterative acoustic debugger.
5. After an Actions correction exposes another implementation defect, open the circuit and move diagnosis and transformation to an intact local artifact, consistent with VMV-009, VMV-015, and VMV-016.

### Proven solution

1. Insert source offset zero as an explicit candidate before detected attacks.
2. Measure musical signal strength, motion, and target-band crossings for every candidate.
3. Select one dominant event within each six-second neighborhood so decay ripples cannot become separate catalog notes.
4. Require the resulting ordered event count to equal the note count declared by the Iowa filename range.
5. Select the target by its catalog ordinal only after event grouping.
6. Apply bounded pitch validation to that selected event.
7. High-pass and normalize every selected anchor to one shared active-note target of -26 dBFS with a 12-times gain ceiling and a 0.88 peak ceiling.
8. Lock E4, B3, and E2 to onset zero in automated manifest coverage.
9. Verify all six files together; never repair or accept one anchor in isolation.

### Reproduced six-string result

The intact official `mf` files produce these selected onsets:

- E4: 0.0 seconds;
- B3: 0.0 seconds;
- G-sharp 3: 11.284898 seconds;
- E3: 31.904218 seconds;
- B2: 23.608889 seconds;
- E2: 0.0 seconds.

The six derived anchors have a measured active-loudness spread of 0.000042 dB. Every derived file remains below the peak ceiling, within one semitone of the target pitch estimate, and within the 12-times normalization-gain limit.

### Derived standard

A deterministic audio pipeline can reproduce the wrong event perfectly. Event identity must be proved before loudness, hashes, build output, and deployment can count as acceptance.

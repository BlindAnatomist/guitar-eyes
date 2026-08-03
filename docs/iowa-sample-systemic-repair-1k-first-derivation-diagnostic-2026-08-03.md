# Iowa Sample Systemic Repair 1K First Derivation Diagnostic

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/iowa-sample-systemic-repair-1k`

Rejected exact source: `dd6e7fba40519e40fca5c4a47014ca1c828d54b1`

Failed derivation run: `30833107741`

## Passed before the failure

The first exact derivation checkpoint passed:

1. exact source identity and ancestry from hosted 1J source `33ae73dbe6f26655ab31ebb567acf54887661ce1`;
2. the exact eight-file source boundary;
3. the no-committed-audio rule;
4. Python compilation;
5. synthetic rejection of 5 Hz drift;
6. safe normalization of a weak valid 82.4 Hz low-E signal;
7. peak-limit protection;
8. FFmpeg installation;
9. download of all six official University of Iowa sessions;
10. all six official source SHA-256 checks.

## Exact failure

The derivation stopped while selecting B3 from the dedicated B-string session. The strongest plausible candidate occurred at `1.858` seconds and had:

- estimated MIDI `58`, one semitone below target MIDI `59`;
- target pitch score `0.959`;
- active RMS `356.6`, the strongest candidate in the session;
- motion ratio `0.00928`;
- zero-crossing estimate `62.0 Hz`;
- usable duration `1.614` seconds.

The remaining candidates were weaker and mostly estimated as MIDI `64`, with substantially lower motion and crossing evidence. The first candidate was therefore the only plausible B3 take, but the initial signal gate required a motion ratio of `0.01478` and a zero-crossing estimate of `103.7 Hz`.

## Diagnosis

The first gate treated target-frequency motion and zero crossings too much like a clean sinusoid. A recorded classical-guitar waveform can carry asymmetric harmonics, phase cancellation, body resonance, and a lower observed crossing rate while still retaining strong target-pitch autocorrelation and being the dominant take in the correct physical-string session.

This was a threshold-model error. It was not evidence that the official B-string session lacked a usable note.

## Bounded correction

The correction preserves:

1. catalog-group restriction;
2. minimum target pitch score `0.45`;
3. estimated MIDI within one semitone;
4. minimum usable duration;
5. absolute active-signal floor;
6. group-relative RMS floor;
7. shared active-loudness normalization;
8. peak and maximum-gain limits;
9. six-sample balance audit.

Only the two over-strict frequency-shape fractions changed:

- minimum motion fraction of the target sinusoid: `0.42` to `0.20`;
- minimum zero-crossing fraction of target frequency: `0.42` to `0.22`.

A regression check now covers the real B3-like motion profile. The existing 5 Hz drift check remains and still fails the corrected signal gate.

## Retry rule

Do not rerun failed run `30833107741` or reuse rejected source `dd6e7fba40519e40fca5c4a47014ca1c828d54b1`. Run one new exact derivation checkpoint from the corrected source and retain the first failure as evidence.

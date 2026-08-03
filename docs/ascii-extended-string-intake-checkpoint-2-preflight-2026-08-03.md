# ASCII Extended-String Intake Checkpoint 2 Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/ascii-extended-string-intake-2`

Parent record head: `592afad9bf55dd7eaf4e4713d2c5895aee4d7f9b`

Accepted format-only source in ancestry: `aca0cd79cc274ea598cc9e67c26e13e41e61011a`

Status: implementation authorized; source gate and real-device acceptance pending

## Objective

Extend the accepted semantic ASCII importer to two additional exact standard profiles without reopening playback or creating another parser:

1. eight-string guitar, high-to-low `E4 B3 G3 D3 A2 E2 B1 F#1`;
2. six-string bass, high-to-low `C3 G2 D2 A1 E1 B0`.

The corresponding conventional low-to-high tunings are:

1. eight-string guitar: `F# B E A D G B E`;
2. six-string bass: `B E A D G C`.

## Tuning evidence

The checkpoint profile is grounded in manufacturer-published string orders:

1. Schecter lists eight-string guitar as `F#/B/E/A/D/G/B/E` low-to-high.
2. Ibanez six-string bass product specifications list strings `1C, 2G, 3D, 4A, 5E, 6B`, which is `B E A D G C` low-to-high.

References:

- `https://www.schecterguitars.com/about`
- `https://www.ibanez.com/usa/products/detail/ehb1006ms_1p_02.html`
- `https://www.ibanez.com/usa/products/detail/gsr206_05.html`

These references establish the checkpoint's exact standard profiles. They do not authorize alternate tunings or arbitrary instruments with the same string counts.

## Existing reusable mechanism

Checkpoint 1 already established:

1. profile-keyed semantic ASCII intake;
2. exact string count plus tuning and octave validation;
3. safe high-to-low pitch ordering;
4. Guitar/Bass family selection and automatic cross-family detection;
5. exact string identity overrides;
6. project-authored CC0 fixtures;
7. format-only iPhone presentation;
8. automated and real-iPhone acceptance for seven-string guitar and five-string bass.

Checkpoint 2 should extend that mechanism, not replace it.

## Minimum implementation

1. Add `eightStringGuitar` and `sixStringBass` profiles.
2. Require every octave and the exact standard octave sequence.
3. Add explicit spoken identities:
   - High E, B, G, D, A, Low E, Low B, Low F sharp for eight-string guitar;
   - High C, G, D, A, E, Low B for six-string bass.
4. Add each profile to the existing Guitar or Bass family order.
5. Add one project-authored quarter-note open-string chord fixture for each profile.
6. Add adversarial coverage for missing octave evidence and altered standard tuning.
7. Update the corpus manifest and help copy without claiming arbitrary support.
8. Preserve the accepted format-only surface and its regression guard.

## Prohibited work

Do not begin or modify:

- audition or playback controls;
- procedural or sampled sound;
- teacher mode;
- legacy Guitar Pro;
- PowerTab, TuxGuitar, or TablEdit;
- MusicXML profile expansion;
- arbitrary extended-string custom tuning;
- dependencies;
- deployment before an exact source gate passes;
- a pull request or merge.

## Exact acceptance contract

Automated acceptance must prove:

1. eight-string guitar imports through `Guitar family` with eight strings;
2. six-string bass imports through `Bass family` with six strings;
3. all string labels and octaves are preserved;
4. one quarter-note synchronized position is created from each fixture;
5. Low F sharp, Low B, and High C identities are spoken correctly;
6. six-string bass auto-detection changes the family selector when Guitar family was selected;
7. eight-string guitar remains within Guitar family;
8. missing or altered octave-qualified profiles fail safely;
9. existing four-, five-, six-, and seven-string accepted profiles remain unchanged;
10. the format-only page renders no playback surface;
11. the complete inherited suite and production build pass;
12. no Iowa, WAV, sampled-audio, workflow, or new dependency enters the feature source.

Real-iPhone acceptance must confirm only:

1. Files-picker focus recovery;
2. all eight guitar strings are read;
3. all six bass strings are read;
4. Guitar/Bass family behavior is correct;
5. duration and navigation remain coherent;
6. no playback or audition surface is present.

## Cost and workflow discipline

Implementation uses ordinary repository commits with `[skip ci]`.

After source review, use one intentional zero-dollar exact gate. Inspect any failure before one justified correction. Publish only after the source gate passes. Restore fork `main` immediately after any temporary Pages publisher and verify it identical to clean authority.
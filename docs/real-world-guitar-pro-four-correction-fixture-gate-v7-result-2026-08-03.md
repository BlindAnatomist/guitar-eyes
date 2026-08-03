# Real-World Guitar Pro Four-Correction Fixture Gate v7 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Feature evidence source:

`c1ec39e6368dbe20bd54e60b12476775e80b0d3e`

Workflow run:

`30856575132`

Job:

`91828869372`

## Result

The four-correction fixture gate failed closed during the independent alphaTab semantic audit. No provenance file or binary artifact was uploaded.

## Passed preparation

The gate:

1. checked out the exact feature evidence source;
2. installed pinned alphaTab 1.8.4;
3. cloned exact external generator commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`;
4. applied only the four preflighted development-time corrections;
5. verified the four-file external diff boundary;
6. compiled the external generator successfully; and
7. generated nonempty GP3, GP4, GP5, GPX, and GP7 files from one optimized original source.

## Independent audit result

- GP3 passed exact track, tuning, bar, duration, rest, and note-coordinate parity.
- GP4 passed exact track, tuning, bar, duration, rest, and note-coordinate parity.
- GP5 advanced beyond the earlier page-layout failure but failed during bar decoding.
- GPX and GP7 were not reached because the audit stopped at the first failing family.

alphaTab rejected GP5 with:

`OverflowError: 'beat count' with value 512 has exceeded the internal safety threshold of 100`

## Exact byte explanation

The GP5 writer's `write_measure` function writes only the voices present in the optimized model. The authored fixture contains one voice per measure.

The GP5 binary contract, and alphaTab's reader, require exactly two voice-count integers for every bar:

1. voice one beat count and beats;
2. voice two beat count and beats, even when voice two is empty.

The external writer instead emitted:

1. voice one beat count and beats;
2. one-byte line-break marker;
3. the next measure's four-byte voice-one beat count.

alphaTab interpreted the line-break byte plus the first three bytes of the next count as the missing voice-two count. For a next count of two, the little-endian bytes became a decoded value of 512.

The existing post-track blank byte is correctly consumed by alphaTab as the first bar preamble. Each measure's trailing line-break byte is correctly positioned to become the next bar preamble. Those bytes must remain unchanged.

## Required fifth external-only correction

In pinned external file:

`guitarpro/src/model/legacy/measure.rs`

For GP5 measure writing only:

1. always emit exactly two voice-count fields;
2. write the existing voice normally when present;
3. write a four-byte zero beat count when the second voice is absent;
4. preserve the existing trailing line-break byte.

No Guitar Eyes runtime code or dependency changes are required.

## Next gate

A five-correction generator-only gate may test:

1. the four previously proven external corrections;
2. the exact two-voice GP5 measure correction;
3. generation of all five families; and
4. exact independent alphaTab semantics across every family.

It must not rerun the already-passed application suite or production build. It may upload a fixture artifact only if all five families pass.

## Repository authority

Fork `main` was restored to `60c2e5de0887b1bcdd426d932632946edd07d3c3`. The upstream repository remained untouched. No pull request, merge, Pages publication, deployment, or runtime external-writer dependency was introduced.
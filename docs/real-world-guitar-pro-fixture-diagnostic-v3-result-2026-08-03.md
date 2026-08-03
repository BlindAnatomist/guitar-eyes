# Real-World Guitar Pro Fixture Diagnostic v3 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

Exact feature source:

`408fd3a5e603b5dc8634e51eebb6c9515b045df1`

Workflow run:

`30854604430`

Job:

`91822538067`

Artifact:

`real-world-guitar-pro-diagnostic-v3`

Artifact ID:

`8871976001`

Artifact ZIP SHA-256:

`d9e447643e7fbfcece1807bfba5f5eeebe2e5fd73569bba8f25ff7cfabe74fd9`

## Purpose

Identify every generated family independently after the earlier audit stopped at the first failure. The diagnostic generated all five binaries, logged the internal header for each, decoded each in an isolated try/catch with pinned alphaTab 1.8.4, preserved a machine-readable result, and uploaded the complete pack even though the final verdict was failure.

## Generation result

The pinned MIT generator at commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49` successfully produced nonempty:

1. GP3 `.gp3`;
2. GP4 `.gp4`;
3. GP5 `.gp5`;
4. GP6 `.gpx`;
5. GP7 shared `.gp`.

The route remained:

`project-authored CC0 MusicXML → generator optimized score → Guitar Pro family`

## Independent alphaTab results

### GP3 passed

Internal header:

`FICHIER GUITAR PRO v3.00`

Decoded evidence:

1. one track;
2. six-string tuning `[64, 59, 55, 50, 45, 40]`;
3. two bars;
4. six beats;
5. six notes;
6. one timed rest;
7. one chord onset;
8. duration denominators 2 and 4.

### GP4 passed

Internal header:

`FICHIER GUITAR PRO v4.00`

Decoded evidence matched the GP3 evidence above.

### GP5 failed

Internal header:

`FICHIER GUITAR PRO v5.10`

alphaTab failed in `Gp3To5Importer.readPageSetup` with:

`OverflowError: Detected string exceeding maxDecodingBufferSize at offset 206`

### GP6 GPX passed

Container began with compressed GPX evidence and decoded successfully.

Decoded evidence:

1. one track;
2. six-string tuning represented by alphaTab as `[40, 45, 50, 55, 59, 64]`;
3. two bars;
4. six beats;
5. six notes;
6. one timed rest;
7. one chord onset;
8. duration denominators 2 and 4.

### GP7 shared `.gp` passed

ZIP evidence decoded successfully with the same semantic counts as GPX.

## Root cause classification

Only the generated GP5 writer is incompatible with alphaTab.

The pinned generator's `write_page_setup` writes each GP5 page-setup template with `write_int_size_string`, meaning:

`int length + bytes`

alphaTab's GP5 reader uses `gpReadStringIntByte`, meaning:

`int length + byte length + bytes`

The missing byte-length field causes progressive offset drift and the impossible string length at offset 206.

This diagnosis is supported by:

1. GP3 and GP4 passing before page setup exists;
2. GP5 alone failing inside page setup;
3. GPX and GP7 passing through different containers;
4. the direct writer/reader source comparison.

## Required correction

Patch only the development-time fixture generator's GP5 page-setup writer so its ten template strings use `write_int_byte_size_string` rather than `write_int_size_string`.

The patch must:

1. apply against exact pinned generator commit;
2. verify the exact replacement count;
3. remain outside Guitar Eyes source and runtime dependencies;
4. regenerate all five families together;
5. rerun independent alphaTab assertions across all five;
6. publish a coherent final fixture artifact only if every family passes.

Do not change Guitar Eyes musical normalization, weaken semantic assertions, or post-process a binary by guessed offsets.

## Repository authority

The temporary diagnostic workflow was removed after inspection. Fork `main` was restored to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, deployment, publication, playback work, or upstream modification occurred.
# Real-World Guitar Pro Intake Foundation 1 Preflight

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

## Objective

Replace extension-only recognition of GP3, GP4, GP5, and GPX with one lawful bounded decode-and-normalize route, and broaden shared `.gp` intake from project-authored proof archives to ordinary supported GP7/GP8 archives that satisfy the existing semantic and safety contract.

This is an intake checkpoint. It is not playback, rendering, teacher mode, publication, or a universal Guitar Pro compatibility claim.

## Accepted starting authorities

1. Branch parent record head: `d84a2433c54a9b96d3920af48b50776b54607280`.
2. Accepted hosted format-only application source: `030e1f6af2de23e41ad993ab0292893b072664eb`.
3. Existing accepted Guitar Pro application source in ancestry: `d6f9a0862c32bc3fa0b14834e027fefb1276bd8d`.
4. Clean fork-main authority: `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
5. Runtime decoder: `@coderline/alphatab` `1.8.4`.
6. Development-only fixture generator: `slundi/guitarpro` commit `2fb41d5fd0fe65e668c1d03c4179b205c7f18e49`, MIT licensed.

## Existing reusable architecture

The accepted implementation already provides:

1. extension detection;
2. a lazy browser worker;
3. selected-file byte and worker-time limits;
4. alphaTab low-level decode;
5. a serializable bounded intermediate;
6. track-count cross-checking for shared ZIP archives;
7. track inventory and explicit multi-track selection;
8. reuse of the decoded intermediate after selection;
9. one semantic normalizer;
10. shared iPhone and desktop readers;
11. durable native-picker focus recovery;
12. exact format-only presentation.

The checkpoint must generalize these pieces rather than replace them.

## Root limitation to remove

Legacy files are currently rejected in two places:

1. `tabFormatDetector.js` marks `.gp3`, `.gp4`, `.gp5`, and `.gpx` as planned.
2. `guitarProImport.worker.js` invokes the ZIP-only `inspectGuitarProArchiveVersion` before alphaTab, so non-ZIP Guitar Pro containers cannot reach the decoder.

The normalizer and track selector are substantially container-neutral.

## Fixture plan

Create one project-authored source score with a simple, legally clean musical sequence. Convert it deterministically into:

1. `.gp3`;
2. `.gp4`;
3. `.gp5`;
4. `.gpx`;
5. `.gp`.

The source and generation record must state:

1. composer/source: Guitar Eyes project-authored;
2. license: CC0-1.0;
3. exact generator repository and commit;
4. exact conversion command for every output;
5. SHA-256 and byte count for every binary;
6. expected title, track inventory, tuning, measures, positions, rests, chords, frets, and durations;
7. any feature loss observed across formats.

A feature that does not survive every format consistently must not be part of the shared acceptance assertion.

## Version-evidence design

Introduce one format-specific inspector contract that returns a common serializable object:

- schema version;
- source family;
- source version;
- extension family;
- container or binary signature evidence;
- independent declared track count when safely obtainable;
- evidence limitations.

Required families:

1. GP3/4/5 legacy binary, using the documented `FICHIER GUITAR PRO` header and parsed version text;
2. GP6 GPX, using BCFZ or BCFS signature evidence;
3. GP7/8 shared ZIP, retaining the existing VERSION and GPIF evidence and declared track count.

Unsupported or contradictory headers must fail before alphaTab with stable errors. A recognized family without independent track-count evidence may proceed without inventing that count; the existing inventory still governs explicit selection.

## Runtime route

1. Detect the specific Guitar Pro family from extension.
2. Transfer bytes once to the existing worker.
3. Inspect format-specific version evidence.
4. Load alphaTab lazily.
5. Decode once, with the existing retry only when independent declared track-count evidence contradicts the first decode.
6. Serialize the bounded intermediate.
7. Build track inventory.
8. Require explicit selection for multiple supported tracks.
9. Normalize the chosen track through the existing semantic document.
10. Render through the existing format-only readers.

## Safety boundary

Preserve or strengthen:

1. selected-file size limit;
2. worker timeout and termination;
3. track, staff, bar, voice, beat, note, and string-count limits;
4. percussion and unsupported-instrument rejection;
5. string/fret identity requirements;
6. exact duration requirements;
7. conflicting-voice rejection;
8. no external requests during import;
9. no renderer, font, soundfont, audio worklet, player, or playback initialization;
10. existing success, selection, and error focus paths.

## Test matrix

Automated coverage must include:

1. exact positive version evidence for GP3, GP4, GP5, GPX, GP7, and GP8 where fixtures exist;
2. corrupt and contradictory headers;
3. wrong extension with valid internal signature where the chosen policy permits content-based recovery;
4. byte and complexity limits;
5. alphaTab decode of every fixture;
6. common intermediate invariants across all formats;
7. track inventory and selection;
8. semantic normalization of notes, chords, rests, measures, and durations;
9. iPhone App workflow and Files-picker focus destination;
10. desktop semantic projection;
11. format-only absence of playback controls;
12. corpus provenance and hash lock;
13. production bundle inspection excluding the fixture generator and audio/rendering assets.

## Execution plan

1. Generate and inspect the five-format fixture pack in one bounded generator operation.
2. Commit the source, binaries, manifest, and provenance as one coherent pack.
3. Implement version inspection and routing against the committed pack.
4. Perform source review and exact bounded-diff comparison.
5. Run one full non-deploying gate.
6. Classify any failure before a correction run.
7. Publish one uniquely identified hosted candidate only after the source gate passes.
8. Restore fork `main` immediately after every temporary workflow.
9. Ask the owner for one bounded iPhone test across representative legacy and current files.

## Stop conditions

Stop rather than weakening the contract if:

1. the generator cannot produce a valid lawful specimen for a required family;
2. alphaTab 1.8.4 cannot decode a generated specimen;
3. a format loses essential string, fret, or duration identity;
4. multi-track behavior becomes ambiguous;
5. the production build emits renderer, font, soundfont, player, or audio assets;
6. the checkpoint requires a second runtime parser or musical model;
7. fork `main` cannot be restored exactly.

## Explicit exclusions

No GP2 `.gtp`, PowerTab, TuxGuitar, TablEdit, PDF, image recognition, OCR, playback, audition, teacher mode, full-document transport, merge, pull request, or upstream modification is authorized.
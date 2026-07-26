# Real-World Tablature Format Corpus Checkpoint 1

Date: July 26, 2026

Branch: `work/real-world-tab-format-corpus`

Base: completed shared semantic core acceptance on `work/shared-semantic-core`.

## Completed

1. Created a lawful corpus policy that separates committed open fixtures, external references, and private user-provided acceptance files.
2. Added five project-authored fixtures:
   - mixed webpage-style ASCII guitar text;
   - ASCII guitar with W/H/Q/E/S rhythm notation;
   - technique-heavy ASCII guitar;
   - metadata-rich two-block bass;
   - minimal MusicXML 4.0 guitar tablature.
3. Added `corpus-manifest.json` with provenance, licensing, features, and current parser expectations.
4. Added executable corpus tests for guitar, bass, rhythm-line preservation, techniques, and MusicXML recognition.
5. Added a format preflight detector for:
   - ASCII text;
   - MusicXML and compressed MusicXML;
   - Guitar Pro;
   - PowerTab;
   - TuxGuitar;
   - TablEdit;
   - unknown material.
6. Expanded the file picker beyond `.txt` so known structured formats can be selected and identified.
7. Preserved honest behavior: only ASCII text is parsed today. Known structured formats receive specific recognized-but-not-yet-supported messages.
8. Preserved the durable iPhone picker-return focus system for both supported and unsupported uploads.

## Source routes established

1. MusicXML 4.0 provides an open structured reference for string, fret, tuning, measure, and duration data.
2. PDMX can provide public-domain MusicXML candidates, but only the no-license-conflict subset should be used and each selected file must be verified as actual guitar tablature.
3. alphaTab is the strongest browser-compatible candidate for importing Guitar Pro 3 through 8 and MusicXML into one score model.
4. Power Tab Editor provides open-source format support and possible licensed fixtures for `.pt2`, `.ptb`, and Guitar Pro formats.
5. TuxGuitar provides a zero-cost conversion and compatibility route across `.tg`, Guitar Pro, PowerTab, TablEdit, ASCII text, and MusicXML-related workflows.
6. Commercial or community tab sites will not be bulk-scraped or used as undocumented runtime dependencies. Users may later supply downloaded files, pasted text, or page links for private normalization.

## Verification

Source checkpoint: `adc5b73d0bde6f11d8c56c43c1bfe7e301750f39`

Workflow run: `30190719516`

Result:

1. complete automated test suite passed;
2. production build passed;
3. deployment was not requested;
4. fork `main` was restored and confirmed identical to upstream commit `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Best next implementation step

Add rhythm-line extraction for ASCII text.

The rhythm fixture already preserves the W/H/Q/E/S line the owner described. The next parser checkpoint should align each rhythm symbol with semantic positions and store a duration value without changing either reader interface.

After rhythm values exist in the shared semantic model:

1. the iPhone reader can announce duration on demand;
2. Jason's desktop reader can expose the same duration information through its spatial view;
3. measures and bars can be divided more reliably;
4. timed playback and teaching modes can be built from the same data rather than inferred later.

No desktop or laptop acceptance testing is assigned to the owner.

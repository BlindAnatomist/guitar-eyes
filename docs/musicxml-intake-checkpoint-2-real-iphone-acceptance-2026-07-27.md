# MusicXML Intake Checkpoint 2 Real-iPhone Acceptance

Date: July 27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

Status: passed

## Acceptance sequence

The first real-iPhone attempt exposed a native Files-picker defect before the importer could run:

1. the `.musicxml` file appeared in the iPhone Files picker;
2. the file was dimmed;
3. the file could not be selected;
4. ordinary previously supported files remained selectable.

The cause was the browser-level `accept` attribute on the file input. Although `.musicxml` and `.xml` had been named, iOS still classified the file outside the selectable picker filter. The application could not validate or import a file that the native picker refused to return.

## Picker repair

The upload input was changed to expose no browser-level `accept` restriction. Format recognition and rejection remain inside Guitar Eyes after selection.

A dedicated regression suite now requires:

1. the rendered file input has no `accept` attribute;
2. MusicXML and ASCII remain selectable through the same upload control;
3. known unsupported formats still receive explicit application-level messages;
4. no native extension filter is reintroduced without a separate real-iPhone gate.

The repair passed:

1. 20 of 20 automated suites;
2. 117 of 117 automated tests;
3. production build;
4. compiled checks proving the former extension filter is absent;
5. hosted bundle read-back through run `30230820831`;
6. exact restoration of fork `main` to `60c2e5de0887b1bcdd426d932632946edd07d3c3`.

## Owner observation: basic MusicXML file

John tested the project-authored one-measure MusicXML fixture on his real iPhone with Safari and VoiceOver.

He reported:

1. the MusicXML file was selectable rather than dimmed;
2. Guitar Eyes reported that four synchronized positions loaded;
3. focus landed where it was supposed to after the Files picker closed;
4. Previous and Next moved without announcing the playing instruction;
5. Read current produced the correct instruction for all four positions:
   - quarter note, low E string, fret 3;
   - eighth note, A string, open;
   - eighth note, A string, fret 2;
   - half note, D string, open.

Owner statement:

> Yes, that worked. Those were the instructions were correct and VoiceOver. Focus landed where it was supposed to.

## Owner observation: chord and timed-rest file

John then tested the project-authored two-measure MusicXML fixture containing a simultaneous chord and a timed rest.

Required behavior:

1. position 1 announces one quarter-note onset containing high E open and B string fret 1;
2. position 2 announces a quarter-note rest without naming a string;
3. Next moves quietly;
4. Read current provides the full chord or rest instruction.

Owner statement:

> Yes, all of those things were true. It worked.

## Acceptance verdict

MusicXML intake checkpoint 2 passes real-iPhone Safari and VoiceOver acceptance.

The accepted MusicXML capability now includes:

1. iPhone Files-picker selection;
2. application-level format validation;
3. one unambiguous six-string guitar tablature part;
4. explicit string and fret mapping;
5. standard tuning mapping;
6. measures and duration;
7. open and fretted notes;
8. simultaneous chord onsets;
9. timed rests;
10. quiet navigation and dedicated Read current speech;
11. native picker-return focus recovery;
12. the same semantic document for desktop and iPhone.

Compressed `.mxl`, Guitar Pro, PowerTab, TuxGuitar, TablEdit, five-string bass, and seven-string guitar remain outside accepted import support.

## Next boundary

The next format phase must begin with a read-only structured-import evaluation. It must determine the safest zero-dollar path for Guitar Pro and related binary formats, including whether a browser-compatible importer such as alphaTab can normalize files into the accepted semantic document without importing a second renderer, playback engine, or separate reader model.

Do not begin teacher mode, playback, looping, bookmarks, pattern analysis, AI work, a pull request, merge, or upstream change.